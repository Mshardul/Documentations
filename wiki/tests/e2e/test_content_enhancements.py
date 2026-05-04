"""
Content view enhancements:
- WIKI-053: Table scroll cue (.table-scroll-wrap, .scroll-cue)
- WIKI-044: Image lightbox zoom (#zoom-overlay, .zoomable-img)
- WIKI-045: Mermaid diagram zoom (click .mermaid-diagram → overlay svg)
- WIKI-039: Diagram theme sync (SVG re-renders on theme change)
"""

ARTICLE_WITH_TABLE = """\
# Table Test

## Section

| Column A | Column B | Column C | Column D | Column E |
|----------|----------|----------|----------|----------|
| row1a    | row1b    | row1c    | row1d    | row1e    |
| row2a    | row2b    | row2c    | row2d    | row2e    |
"""

ARTICLE_WITH_IMAGE = """\
# Image Test

![A test image](data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7)

Some text after the image.
"""

ARTICLE_WITH_MERMAID = """\
# Mermaid Test

```mermaid
graph LR
  A[Start] --> B[Middle] --> C[End]
```

Some text.
"""


def _load_mock_article(page, base_url, content, slug="mock"):
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
    page.wait_for_function(
        "() => !document.querySelector('#markdown-body > .loading')",
        timeout=10_000,
    )


# ── WIKI-053: Table scroll cue ──────────────────────────────────────────────


def test_table_wrapped_in_scroll_container(page, base_url):
    """Every table in the content body is wrapped in .table-scroll-wrap."""
    _load_mock_article(page, base_url, ARTICLE_WITH_TABLE, slug="table-wrap")
    page.wait_for_selector(".table-scroll-wrap", timeout=5_000)

    result = page.evaluate("""() => {
        const tables = document.querySelectorAll('#markdown-body table');
        const wrapped = [...tables].filter(t => t.closest('.table-scroll-wrap'));
        return { total: tables.length, wrapped: wrapped.length };
    }""")
    assert result["total"] > 0, "No tables found in article"
    assert result["wrapped"] == result["total"], (
        f"Only {result['wrapped']} of {result['total']} tables are wrapped"
    )


def test_table_scroll_wrap_has_overflow_auto(page, base_url):
    """.table-scroll-wrap has overflow-x: auto to enable horizontal scrolling."""
    _load_mock_article(page, base_url, ARTICLE_WITH_TABLE, slug="table-overflow")
    page.wait_for_selector(".table-scroll-wrap", timeout=5_000)

    overflow = page.evaluate("""() => {
        const wrap = document.querySelector('.table-scroll-wrap');
        return getComputedStyle(wrap).overflowX;
    }""")
    assert overflow == "auto", (
        f"Expected overflow-x: auto on .table-scroll-wrap, got: {overflow}"
    )


def test_table_scroll_cue_on_narrow_viewport(page, base_url):
    """.table-scroll-wrap gets .scroll-cue when table overflows its container."""
    _load_mock_article(page, base_url, ARTICLE_WITH_TABLE, slug="table-narrow")
    page.wait_for_selector(".table-scroll-wrap", timeout=5_000)

    # Force overflow by narrowing the wrapper, then trigger updateCue directly.
    # ResizeObserver timing in headless tests is not reliable enough to await.
    result = page.evaluate("""() => {
        const wrap = document.querySelector('.table-scroll-wrap');
        if (!wrap) return { found: false };
        wrap.style.width = '120px';
        const overflows = wrap.scrollWidth > wrap.clientWidth + 4;
        const atEnd = wrap.scrollLeft + wrap.clientWidth >= wrap.scrollWidth - 4;
        wrap.classList.toggle('scroll-cue', overflows && !atEnd);
        return { found: true, hasCue: wrap.classList.contains('scroll-cue'),
                 scrollW: wrap.scrollWidth, clientW: wrap.clientWidth };
    }""")
    assert result["found"], "No .table-scroll-wrap found"
    assert result["hasCue"], (
        f".scroll-cue not set; scrollWidth={result['scrollW']}, clientWidth={result['clientW']}"
    )


def test_table_scroll_cue_absent_on_wide_viewport(page, base_url):
    """.scroll-cue is absent when the table fits within the viewport."""
    page.set_viewport_size({"width": 1400, "height": 900})
    _load_mock_article(page, base_url, ARTICLE_WITH_TABLE, slug="table-wide")
    page.wait_for_selector(".table-scroll-wrap", timeout=5_000)
    page.wait_for_timeout(400)

    has_cue = page.evaluate(
        "() => document.querySelector('.table-scroll-wrap')?.classList.contains('scroll-cue')"
    )
    assert not has_cue, (
        ".table-scroll-wrap should NOT have .scroll-cue on wide viewport"
    )


# ── WIKI-044: Image lightbox zoom ───────────────────────────────────────────


def test_image_has_zoomable_class(page, base_url):
    """Images in content body get .zoomable-img class after render."""
    _load_mock_article(page, base_url, ARTICLE_WITH_IMAGE, slug="img-class")
    page.wait_for_selector("#markdown-body img", timeout=5_000)

    has_class = page.evaluate("""() => {
        const img = document.querySelector('#markdown-body img');
        return img?.classList.contains('zoomable-img');
    }""")
    assert has_class, "Image in content is missing .zoomable-img class"


def test_image_click_opens_zoom_overlay(page, base_url):
    """Clicking an image in the content body opens the zoom overlay."""
    _load_mock_article(page, base_url, ARTICLE_WITH_IMAGE, slug="img-open")
    page.wait_for_selector("#markdown-body img.zoomable-img", timeout=5_000)

    page.locator("#markdown-body img.zoomable-img").first.click()
    page.wait_for_selector("#zoom-overlay.open", timeout=3_000)

    is_open = page.evaluate(
        "() => document.getElementById('zoom-overlay')?.classList.contains('open')"
    )
    assert is_open, "Zoom overlay did not open after clicking image"


def test_zoom_overlay_contains_image(page, base_url):
    """Zoom overlay content contains an <img> element after an image is clicked."""
    _load_mock_article(page, base_url, ARTICLE_WITH_IMAGE, slug="img-content")
    page.wait_for_selector("#markdown-body img.zoomable-img", timeout=5_000)

    page.locator("#markdown-body img.zoomable-img").first.click()
    page.wait_for_selector("#zoom-overlay.open", timeout=3_000)

    img_in_overlay = page.evaluate("""() => {
        const overlay = document.getElementById('zoom-overlay');
        return overlay?.querySelector('.zoom-overlay-content img') !== null;
    }""")
    assert img_in_overlay, "Zoom overlay does not contain an <img> element"


def test_zoom_overlay_closes_on_escape(page, base_url):
    """Pressing Escape closes the zoom overlay."""
    _load_mock_article(page, base_url, ARTICLE_WITH_IMAGE, slug="img-esc")
    page.wait_for_selector("#markdown-body img.zoomable-img", timeout=5_000)

    page.locator("#markdown-body img.zoomable-img").first.click()
    page.wait_for_selector("#zoom-overlay.open", timeout=3_000)

    page.keyboard.press("Escape")
    page.wait_for_function(
        "() => !document.getElementById('zoom-overlay')?.classList.contains('open')",
        timeout=3_000,
    )
    is_open = page.evaluate(
        "() => document.getElementById('zoom-overlay')?.classList.contains('open')"
    )
    assert not is_open, "Zoom overlay should be closed after pressing Escape"


def test_zoom_overlay_closes_on_backdrop_click(page, base_url):
    """Clicking the backdrop closes the zoom overlay."""
    _load_mock_article(page, base_url, ARTICLE_WITH_IMAGE, slug="img-backdrop")
    page.wait_for_selector("#markdown-body img.zoomable-img", timeout=5_000)

    page.locator("#markdown-body img.zoomable-img").first.click()
    page.wait_for_selector("#zoom-overlay.open", timeout=3_000)

    # The image is centered in the overlay and intercepts pointer events at center.
    # Click at the top-left corner of the viewport — always on the backdrop, never on content.
    page.mouse.click(5, 5)
    page.wait_for_function(
        "() => !document.getElementById('zoom-overlay')?.classList.contains('open')",
        timeout=3_000,
    )
    is_open = page.evaluate(
        "() => document.getElementById('zoom-overlay')?.classList.contains('open')"
    )
    assert not is_open, "Zoom overlay should be closed after clicking backdrop"


def test_zoom_overlay_closes_on_close_button(page, base_url):
    """Clicking the × close button closes the zoom overlay."""
    _load_mock_article(page, base_url, ARTICLE_WITH_IMAGE, slug="img-closebtn")
    page.wait_for_selector("#markdown-body img.zoomable-img", timeout=5_000)

    page.locator("#markdown-body img.zoomable-img").first.click()
    page.wait_for_selector("#zoom-overlay.open", timeout=3_000)

    page.locator(".zoom-overlay-close").click()
    page.wait_for_function(
        "() => !document.getElementById('zoom-overlay')?.classList.contains('open')",
        timeout=3_000,
    )
    is_open = page.evaluate(
        "() => document.getElementById('zoom-overlay')?.classList.contains('open')"
    )
    assert not is_open, "Zoom overlay should be closed after clicking close button"


def test_escape_after_zoom_stays_in_content_view(page, base_url):
    """Escape while zoom overlay is open closes overlay without navigating away."""
    _load_mock_article(page, base_url, ARTICLE_WITH_IMAGE, slug="img-nav")
    page.wait_for_selector("#markdown-body img.zoomable-img", timeout=5_000)

    page.locator("#markdown-body img.zoomable-img").first.click()
    page.wait_for_selector("#zoom-overlay.open", timeout=3_000)

    page.keyboard.press("Escape")
    page.wait_for_function(
        "() => !document.getElementById('zoom-overlay')?.classList.contains('open')",
        timeout=3_000,
    )

    still_content = page.evaluate(
        "() => document.getElementById('view-content').classList.contains('active')"
    )
    assert still_content, "Content view was abandoned when Escape closed zoom overlay"


# ── WIKI-045: Diagram zoom ──────────────────────────────────────────────────


def test_mermaid_diagram_has_zoom_cursor(page, base_url):
    """.mermaid-diagram element has cursor: zoom-in from CSS."""
    _load_mock_article(page, base_url, ARTICLE_WITH_MERMAID, slug="diag-cursor")
    page.wait_for_selector(".mermaid-diagram", timeout=10_000)

    cursor = page.evaluate("""() => {
        const d = document.querySelector('.mermaid-diagram');
        return d ? getComputedStyle(d).cursor : null;
    }""")
    assert cursor == "zoom-in", (
        f"Expected cursor: zoom-in on .mermaid-diagram, got: {cursor}"
    )


def test_diagram_click_opens_zoom_overlay(page, base_url):
    """Clicking a rendered .mermaid-diagram opens the zoom overlay."""
    _load_mock_article(page, base_url, ARTICLE_WITH_MERMAID, slug="diag-open")
    page.wait_for_selector(".mermaid-diagram svg", timeout=10_000)

    page.locator(".mermaid-diagram").first.click()
    page.wait_for_selector("#zoom-overlay.open", timeout=3_000)

    is_open = page.evaluate(
        "() => document.getElementById('zoom-overlay')?.classList.contains('open')"
    )
    assert is_open, "Zoom overlay did not open after clicking mermaid diagram"


def test_diagram_zoom_overlay_contains_svg(page, base_url):
    """Zoom overlay content contains an <svg> element after a diagram is clicked."""
    _load_mock_article(page, base_url, ARTICLE_WITH_MERMAID, slug="diag-svg")
    page.wait_for_selector(".mermaid-diagram svg", timeout=10_000)

    page.locator(".mermaid-diagram").first.click()
    page.wait_for_selector("#zoom-overlay.open", timeout=3_000)

    # Use evaluate rather than wait_for_selector(visible) — the cloned SVG has
    # no explicit dimensions after stripping width/height attrs, so Playwright's
    # visibility check (non-zero bounding box) may fail even though it is attached.
    svg_in_overlay = page.evaluate("""() => {
        const overlay = document.getElementById('zoom-overlay');
        return overlay?.querySelector('.zoom-overlay-content svg') !== null;
    }""")
    assert svg_in_overlay, "Zoom overlay does not contain an <svg> element"


# ── WIKI-039: Diagram theme sync ────────────────────────────────────────────


def test_mermaid_src_stored_on_wrapper(page, base_url):
    """.mermaid-diagram wrappers have data-mermaid-src set after initial render."""
    _load_mock_article(page, base_url, ARTICLE_WITH_MERMAID, slug="diag-src")
    page.wait_for_selector(".mermaid-diagram", timeout=10_000)

    has_src = page.evaluate("""() => {
        const wrapper = document.querySelector('.mermaid-diagram');
        return wrapper?.dataset.mermaidSrc?.trim().length > 0;
    }""")
    assert has_src, ".mermaid-diagram wrapper is missing data-mermaid-src attribute"


def test_diagram_rerenders_on_theme_change(page, base_url):
    """Switching theme triggers Mermaid re-render; SVG output changes."""
    _load_mock_article(page, base_url, ARTICLE_WITH_MERMAID, slug="diag-theme")
    page.wait_for_selector(".mermaid-diagram svg", timeout=10_000)

    svg_before = page.evaluate(
        "() => document.querySelector('.mermaid-diagram svg')?.outerHTML"
    )
    assert svg_before, "No mermaid SVG found before theme change"

    page.evaluate("() => Settings._setBackground('light-white')")

    page.wait_for_function(
        f"""() => {{
            const svg = document.querySelector('.mermaid-diagram svg');
            return svg && svg.outerHTML !== {repr(svg_before)};
        }}""",
        timeout=10_000,
    )

    svg_after = page.evaluate(
        "() => document.querySelector('.mermaid-diagram svg')?.outerHTML"
    )
    assert svg_before != svg_after, (
        "Mermaid SVG did not change after theme switch — re-render not triggered"
    )


def test_diagram_src_preserved_after_theme_change(page, base_url):
    """data-mermaid-src is preserved on wrapper after a theme-triggered re-render."""
    _load_mock_article(page, base_url, ARTICLE_WITH_MERMAID, slug="diag-src-preserve")
    page.wait_for_selector(".mermaid-diagram svg", timeout=10_000)

    src_before = page.evaluate(
        "() => document.querySelector('.mermaid-diagram')?.dataset.mermaidSrc"
    )
    page.evaluate("() => Settings._setBackground('light-white')")

    # Wait for re-render to complete (SVG changes)
    page.wait_for_timeout(2_000)

    src_after = page.evaluate(
        "() => document.querySelector('.mermaid-diagram')?.dataset.mermaidSrc"
    )
    assert src_before == src_after, (
        "data-mermaid-src changed after re-render — re-render should preserve source attribute"
    )
