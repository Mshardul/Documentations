"""
- Prerequisites chips (016)
- Copy button on all code blocks (028)
- Topbar title visibility on scroll (040)
- DOMPurify XSS sanitization (067)
- KaTeX math support (074)
- TOC items rendered in sidebar
"""


def _load_mock_article(page, base_url, content, slug="mock"):
    """Navigate to a mocked article via JS, bypassing index slug resolution.
    Waits until the loading indicator is replaced by actual content."""
    page.goto(f"{base_url}/wiki/")
    page.wait_for_load_state("networkidle")
    page.route(f"**/{slug}.md", lambda r: r.fulfill(body=content))
    page.evaluate(f"""() => navigateToContent(
        'system-design',
        encodeURIComponent('../content/system-design/{slug}.md'),
        encodeURIComponent('{slug.capitalize()}'),
        '{slug}'
    )""")
    page.wait_for_selector("#view-content.active", timeout=10_000)
    # showView fires before the fetch; wait until the loading spinner is replaced
    page.wait_for_function(
        "() => !document.querySelector('#markdown-body > .loading')",
        timeout=10_000,
    )


def test_copy_buttons_on_code_blocks(page, base_url):
    """every <pre> block in article body has a .copy-btn child."""
    page.goto(f"{base_url}/wiki/#system-design/caching")
    page.wait_for_selector("#view-content.active", timeout=10_000)
    page.wait_for_selector("#markdown-body pre", timeout=8_000)

    result = page.evaluate("""() => {
        const pres = document.querySelectorAll('#markdown-body pre');
        const missing = [...pres].filter(p => !p.querySelector('.copy-btn'));
        return { total: pres.length, missing: missing.length };
    }""")

    assert result["total"] > 0, "No code blocks found in caching article"
    assert result["missing"] == 0, (
        f"{result['missing']} of {result['total']} code blocks missing .copy-btn"
    )


def test_copy_button_writes_to_clipboard(page, base_url):
    """clicking .copy-btn copies block text to clipboard."""
    page.context.grant_permissions(["clipboard-read", "clipboard-write"])
    page.goto(f"{base_url}/wiki/#system-design/caching")
    page.wait_for_selector("#markdown-body pre .copy-btn", timeout=10_000)

    pre_text = page.evaluate(
        "() => document.querySelector('#markdown-body pre code').textContent"
    )
    page.locator("#markdown-body pre .copy-btn").first.click()

    clipboard = page.evaluate("() => navigator.clipboard.readText()")
    assert clipboard.strip() == pre_text.strip()


def test_prerequisites_chips_rendered(page, base_url):
    """Prerequisites paragraphs are converted to chips."""
    _load_mock_article(
        page, base_url, "# Mock Content\n\nPrerequisites:[A](./a.md) and [B](./b.md)\n"
    )
    page.wait_for_selector(".prereqs-container", timeout=5_000)

    chips = page.locator(".prereq-chip").all()
    assert len(chips) == 2
    assert chips[0].inner_text() == "A"
    assert chips[1].inner_text() == "B"


def test_prerequisites_original_paragraph_removed(page, base_url):
    """Original Prerequisites paragraph is removed after chip render."""
    _load_mock_article(page, base_url, "# Mock Content\n\nPrerequisites:[A](./a.md)\n")
    page.wait_for_selector(".prereqs-container", timeout=5_000)

    raw_p_count = page.evaluate("""() => {
        const ps = [...document.querySelectorAll('#markdown-body p')];
        return ps.filter(p => p.textContent.trim().startsWith('Prerequisites:')).length;
    }""")
    assert raw_p_count == 0, "Original Prerequisites: paragraph was not removed"


# ── Topbar title ────────────────────────────────────────────────────────────────


def test_topbar_title_hidden_initially(page, base_url):
    """#topbar-title does not have .visible on initial article load."""
    _load_mock_article(page, base_url, "# Big Title\n\nSome content.\n")

    is_visible = page.evaluate(
        "() => document.getElementById('topbar-title').classList.contains('visible')"
    )
    assert not is_visible, "#topbar-title should not be .visible before scrolling"


def test_topbar_title_appears_after_scroll(page, base_url):
    """#topbar-title gets .visible after h1 scrolls above viewport."""
    page.set_viewport_size({"width": 1280, "height": 800})
    _load_mock_article(
        page, base_url, "# Big Title\n\n" + "Some text.\n\n" * 80, slug="scroll"
    )

    page.evaluate("() => window.scrollTo(0, 3000)")
    page.wait_for_function(
        "() => document.getElementById('topbar-title').classList.contains('visible')",
        timeout=5_000,
    )
    is_visible = page.evaluate(
        "() => document.getElementById('topbar-title').classList.contains('visible')"
    )
    assert is_visible, "#topbar-title should be .visible after scrolling past h1"


def test_topbar_title_text_matches_article(page, base_url):
    """#topbar-title text matches the loaded article title."""
    page.goto(f"{base_url}/wiki/#system-design/caching")
    page.wait_for_selector("#view-content.active", timeout=10_000)
    page.wait_for_selector("#markdown-body h1", timeout=8_000)

    title_text = page.evaluate(
        "() => document.getElementById('topbar-title').textContent.trim()"
    )
    assert title_text, "#topbar-title should have non-empty text"


# ── DOMPurify XSS sanitization ──────────────────────────────────────


def test_dompurify_strips_script_tags(page, base_url):
    """<script> tags injected via markdown are not executed."""
    _load_mock_article(
        page, base_url, "# Test\n<script>window.__xss_fired = true;</script>Injected."
    )
    page.wait_for_selector("#markdown-body", timeout=5_000)

    fired = page.evaluate("() => window.__xss_fired === true")
    assert not fired, "XSS script tag was executed - DOMPurify not working"

    script_count = page.evaluate(
        "() => document.querySelectorAll('#markdown-body script').length"
    )
    assert script_count == 0, "Sanitized body still contains <script> elements"


def test_dompurify_strips_onerror_attributes(page, base_url):
    """onerror= event handlers are stripped from rendered HTML."""
    _load_mock_article(
        page, base_url, '# Test\n<img src="x" onerror="window.__onerror_fired=true">'
    )
    page.wait_for_selector("#markdown-body", timeout=5_000)

    fired = page.evaluate("() => window.__onerror_fired === true")
    assert not fired, "onerror= handler executed - DOMPurify not stripping event attrs"


# ── KaTeX math ───────────────────────────────────────────────────────


def test_katex_renders_block_math(page, base_url):
    """$$...$$ block math is rendered into KaTeX HTML elements."""
    _load_mock_article(page, base_url, "# Math\n\n$$E = mc^2$$\n", slug="math-block")

    page.wait_for_selector("#markdown-body .katex", timeout=5_000)
    katex_count = page.locator("#markdown-body .katex").count()
    assert katex_count > 0, "No .katex elements found - block math not rendered"


def test_katex_renders_inline_math(page, base_url):
    """$...$ inline math is rendered into KaTeX HTML elements."""
    _load_mock_article(
        page,
        base_url,
        "# Inline Math\n\nEnergy is $E = mc^2$ by Einstein.\n",
        slug="math-inline",
    )

    page.wait_for_selector("#markdown-body .katex", timeout=5_000)
    katex_count = page.locator("#markdown-body .katex").count()
    assert katex_count > 0, "No .katex elements found - inline math not rendered"


# ── TOC rendering ──────────────────────────────────────────────────────────────


def test_toc_items_rendered_in_sidebar(page, base_url):
    """TOC: sidebar nav contains one item per h2/h3 in article content."""
    _load_mock_article(
        page,
        base_url,
        "# Title\n\n## Section One\n\nText.\n\n## Section Two\n\nText.\n\n### Subsection\n\nText.\n",
        slug="toc-test",
    )
    page.wait_for_selector("#toc-nav .toc-item", timeout=5_000)

    toc_count = page.locator("#toc-nav .toc-item").count()
    assert toc_count == 3, f"Expected 3 TOC items (2×h2 + 1×h3), got {toc_count}"


def test_toc_h3_items_have_indent_class(page, base_url):
    """TOC: h3 headings get .toc-h3 class for visual indent."""
    _load_mock_article(
        page, base_url, "# Title\n\n## Top\n\n### Sub\n\nText.\n", slug="toc-h3"
    )
    page.wait_for_selector("#toc-nav .toc-h3", timeout=5_000)
    assert page.locator("#toc-nav .toc-h3").count() == 1


def test_toc_item_click_does_not_break_hash(page, base_url):
    """TOC: clicking a TOC item updates ?a= param and preserves the article hash."""
    page.goto(f"{base_url}/wiki/#system-design/caching")
    page.wait_for_selector("#toc-nav .toc-item", timeout=10_000)

    page.locator("#toc-nav .toc-item").first.click()
    page.wait_for_timeout(400)

    assert "system-design/caching" in page.url, "Hash route lost after TOC click"
    assert "?a=" in page.url, "?a= anchor param not set after TOC click"
