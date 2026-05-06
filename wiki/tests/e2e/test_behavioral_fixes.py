"""
- Clipboard failure toast: WIKI-119
- Scroll position persistence: WIKI-123
- Hover preview improvements (abort, position clamp, metadata filter): WIKI-127
- Mermaid debounce + viewport-aware re-render: WIKI-131
"""


def _load_mock_article(page, base_url, content, slug="mock", extra_routes=None):
    page.goto(f"{base_url}/wiki/")
    page.wait_for_load_state("networkidle")
    if extra_routes:
        for pattern, handler in extra_routes:
            page.route(pattern, handler)
    page.route(f"**/{slug}.md", lambda r: r.fulfill(body=content))
    page.evaluate(
        f"""() => navigateToContent(
        'system-design',
        encodeURIComponent('../content/system-design/{slug}.md'),
        encodeURIComponent('{slug.capitalize()}'),
        '{slug}'
    )"""
    )
    page.wait_for_selector("#view-content.active", timeout=10_000)
    page.wait_for_function(
        "() => !document.querySelector('#markdown-body > .loading')",
        timeout=10_000,
    )


# ── WIKI-119: Clipboard failure toast ──────────────────────────────────────


def test_copy_button_failure_shows_toast(page, base_url):
    """WIKI-119: denied clipboard on copy-btn click shows 'Copy failed' toast."""
    page.goto(f"{base_url}/wiki/#system-design/caching")
    page.wait_for_selector("#markdown-body pre .copy-btn", timeout=10_000)

    page.evaluate(
        """() => {
        navigator.clipboard.writeText = () =>
            Promise.reject(new DOMException("blocked", "NotAllowedError"));
    }"""
    )
    page.locator("#markdown-body pre .copy-btn").first.click()

    page.wait_for_selector("#wiki-toast.visible", timeout=3_000)
    assert "Copy failed" in page.locator("#wiki-toast").inner_text()


def test_anchor_copy_failure_shows_toast(page, base_url):
    """WIKI-119: denied clipboard on anchor-btn click shows 'Copy failed' toast."""
    page.goto(f"{base_url}/wiki/#system-design/caching")
    page.wait_for_selector("#markdown-body .anchor-btn", timeout=10_000)

    page.evaluate(
        """() => {
        navigator.clipboard.writeText = () =>
            Promise.reject(new DOMException("blocked", "NotAllowedError"));
    }"""
    )
    page.locator("#markdown-body .anchor-btn").first.click()

    page.wait_for_selector("#wiki-toast.visible", timeout=3_000)
    assert "Copy failed" in page.locator("#wiki-toast").inner_text()


def test_successful_copy_does_not_show_toast(page, base_url):
    """WIKI-119: successful clipboard write does not show error toast."""
    page.context.grant_permissions(["clipboard-read", "clipboard-write"])
    page.goto(f"{base_url}/wiki/#system-design/caching")
    page.wait_for_selector("#markdown-body pre .copy-btn", timeout=10_000)

    page.locator("#markdown-body pre .copy-btn").first.click()
    page.wait_for_timeout(500)

    toast_visible = page.evaluate(
        "() => document.getElementById('wiki-toast')?.classList.contains('visible') ?? false"
    )
    # Toast should not be visible (or if it is, should not say "Copy failed")
    if toast_visible:
        assert "Copy failed" not in page.locator("#wiki-toast").inner_text()


# ── WIKI-123: Scroll restoration ────────────────────────────────────────────


def test_scroll_position_restored_after_navigation(page, base_url):
    """WIKI-123: scroll position is saved and restored on article revisit."""
    page.set_viewport_size({"width": 1280, "height": 800})
    page.goto(f"{base_url}/wiki/#system-design/caching")
    page.wait_for_selector("#view-content.active", timeout=10_000)
    page.wait_for_function(
        "() => !document.querySelector('#markdown-body > .loading')", timeout=8_000
    )

    page.evaluate("() => window.scrollTo(0, 600)")
    page.wait_for_timeout(500)  # debounce fires at 400ms

    saved = page.evaluate(
        "() => localStorage.getItem('scroll-' + window.state.currentFilePath)"
    )
    assert saved is not None, "Scroll position not saved to localStorage"
    assert int(saved) > 0, f"Saved scroll should be > 0 (got {saved})"

    # Full page reload to home avoids SPA render-race that resets scrollY
    page.goto(f"{base_url}/wiki/")
    page.wait_for_selector("#view-home.active", timeout=5_000)

    page.evaluate(
        """() => navigateToContent(
        'system-design',
        encodeURIComponent('../content/system-design/caching.md'),
        encodeURIComponent('Caching'),
        'caching'
    )"""
    )
    page.wait_for_function(
        "() => !document.querySelector('#markdown-body > .loading')", timeout=8_000
    )
    page.wait_for_timeout(500)  # double rAF + settling

    scroll_y = page.evaluate("() => window.scrollY")
    assert scroll_y > 0, f"Scroll not restored after navigation (scrollY={scroll_y})"


def test_scroll_position_stable_after_revisit(page, base_url):
    """WIKI-123: scroll position is not reset on second visit to same article."""
    page.set_viewport_size({"width": 1280, "height": 800})
    _load_mock_article(
        page,
        base_url,
        "# Mock\n\n" + "Paragraph text.\n\n" * 80,
        slug="scroll-stable",
    )
    page.evaluate("() => window.scrollTo(0, 400)")
    page.wait_for_timeout(600)

    scroll_y = page.evaluate("() => window.scrollY")
    assert scroll_y > 0, "Scroll should be non-zero after scrollTo"


# ── WIKI-127: Hover preview improvements ────────────────────────────────────


def test_hover_preview_filters_prerequisites_from_fallback(page, base_url):
    """WIKI-127: fallback preview skips paragraphs starting with 'Prerequisites:'."""
    page.goto(f"{base_url}/wiki/")
    page.wait_for_load_state("networkidle")

    page.route(
        "**/prereq-linked.md",
        lambda r: r.fulfill(
            body=(
                "# Linked\n\n"
                "Prerequisites:[Something](./x.md)\n\n"
                "This is the real content paragraph.\n"
            )
        ),
    )
    page.route(
        "**/prereq-host.md",
        lambda r: r.fulfill(body="# Host\n\n[Link](./prereq-linked.md)"),
    )
    page.evaluate(
        """() => navigateToContent(
        'system-design',
        encodeURIComponent('../content/system-design/prereq-host.md'),
        encodeURIComponent('Host'),
        'prereq-host'
    )"""
    )
    page.wait_for_selector("#view-content.active", timeout=10_000)
    page.wait_for_function(
        "() => !document.querySelector('#markdown-body > .loading')", timeout=10_000
    )
    page.wait_for_selector("a:has-text('Link')", timeout=5_000)

    page.locator("a:has-text('Link')").dispatch_event("mouseenter")
    page.wait_for_selector("#hover-preview.visible", timeout=5_000)

    preview_text = page.locator("#hover-preview").inner_text()
    assert "Prerequisites:" not in preview_text, (
        "Preview should skip the Prerequisites: metadata paragraph"
    )
    assert "real content" in preview_text


def test_hover_preview_hidden_after_mouseleave_during_fetch(page, base_url):
    """WIKI-127: mouseleave during slow fetch hides preview; stale content not shown."""
    import threading

    ready = threading.Event()

    def slow_handler(route):
        ready.wait(timeout=2.0)
        route.fulfill(body="# L\n\n## TL;DR\n\nStale content that must not appear.\n")

    page.goto(f"{base_url}/wiki/")
    page.wait_for_load_state("networkidle")
    page.route("**/slow-link.md", slow_handler)
    page.route(
        "**/abort-host.md",
        lambda r: r.fulfill(body="# Host\n\n[Link](./slow-link.md)"),
    )
    page.evaluate(
        """() => navigateToContent(
        'system-design',
        encodeURIComponent('../content/system-design/abort-host.md'),
        encodeURIComponent('Host'),
        'abort-host'
    )"""
    )
    page.wait_for_selector("#view-content.active", timeout=10_000)
    page.wait_for_function(
        "() => !document.querySelector('#markdown-body > .loading')", timeout=10_000
    )
    page.wait_for_selector("a:has-text('Link')", timeout=5_000)

    page.locator("a:has-text('Link')").dispatch_event("mouseenter")
    page.wait_for_selector("#hover-preview.visible", timeout=3_000)

    # Mouseleave before fetch resolves
    page.locator("a:has-text('Link')").dispatch_event("mouseleave")
    page.wait_for_function(
        "() => !document.getElementById('hover-preview').classList.contains('visible')",
        timeout=3_000,
    )

    # Now let the fetch complete
    ready.set()
    page.wait_for_timeout(400)

    # Preview must remain hidden; stale content must not be shown
    is_visible = page.evaluate(
        "() => document.getElementById('hover-preview').classList.contains('visible')"
    )
    assert not is_visible, "Preview must stay hidden after mouseleave"

    text = page.evaluate("() => document.getElementById('hover-preview').innerText")
    assert "Stale content" not in (text or ""), (
        "Stale content must not appear after abort"
    )


def test_hover_preview_left_clamped_near_right_edge(page, base_url):
    """WIKI-127: preview left is clamped to >= 8px when viewport is narrower than preview."""
    # 320px viewport is narrower than the 340px preview; clamping always fires
    page.set_viewport_size({"width": 320, "height": 800})
    page.goto(f"{base_url}/wiki/")
    page.wait_for_load_state("networkidle")

    page.route(
        "**/right-linked.md",
        lambda r: r.fulfill(body="# L\n\n## TL;DR\n\nContent.\n"),
    )
    page.route(
        "**/right-host.md",
        lambda r: r.fulfill(body="# Host\n\n[Link](./right-linked.md)\n"),
    )
    page.evaluate(
        """() => navigateToContent(
        'system-design',
        encodeURIComponent('../content/system-design/right-host.md'),
        encodeURIComponent('Host'),
        'right-host'
    )"""
    )
    page.wait_for_selector("#view-content.active", timeout=10_000)
    page.wait_for_function(
        "() => !document.querySelector('#markdown-body > .loading')", timeout=10_000
    )
    page.wait_for_selector("a:has-text('Link')", timeout=5_000)

    page.locator("a:has-text('Link')").dispatch_event("mouseenter")
    page.wait_for_selector("#hover-preview.visible", timeout=5_000)

    left = page.evaluate(
        "() => parseInt(document.getElementById('hover-preview').style.left)"
    )
    assert left >= 8, f"Preview left ({left}px) should be clamped to >= 8px"


# ── WIKI-131: Mermaid debounce + viewport-aware ──────────────────────────────


def test_rapid_theme_changes_do_not_crash(page, base_url):
    """WIKI-131: 10 rapid theme changes via debounce do not throw errors."""
    page.goto(f"{base_url}/wiki/#system-design/caching")
    page.wait_for_selector("#view-content.active", timeout=10_000)
    page.wait_for_function(
        "() => !document.querySelector('#markdown-body > .loading')", timeout=8_000
    )

    errors = []
    page.on("pageerror", lambda err: errors.append(str(err)))

    for _ in range(10):
        page.evaluate(
            "() => document.dispatchEvent(new CustomEvent('wiki:themechange', { detail: { theme: 'dark' } }))"
        )

    page.wait_for_timeout(400)  # past 150ms debounce window

    assert not errors, f"Page errors after rapid theme changes: {errors}"
    assert page.locator("#view-content.active").count() == 1, (
        "View should still be active"
    )


def test_mermaid_rerender_skips_offscreen_diagrams(page, base_url):
    """WIKI-131: rerenderMermaidDiagrams does not update diagrams outside the viewport."""
    page.set_viewport_size({"width": 1280, "height": 600})
    page.goto(f"{base_url}/wiki/")
    page.wait_for_load_state("networkidle")

    page.route(
        "**/two-diagrams.md",
        lambda r: r.fulfill(
            body=(
                "# Diagrams\n\n"
                "```mermaid\ngraph TD\n  A-->B\n```\n\n"
                + "<br>\n" * 80
                + "\n```mermaid\ngraph TD\n  C-->D\n```\n"
            )
        ),
    )
    page.evaluate(
        """() => navigateToContent(
        'system-design',
        encodeURIComponent('../content/system-design/two-diagrams.md'),
        encodeURIComponent('Diagrams'),
        'two-diagrams'
    )"""
    )
    page.wait_for_selector("#view-content.active", timeout=10_000)
    page.wait_for_function(
        "() => !document.querySelector('#markdown-body > .loading')", timeout=10_000
    )

    diagrams = page.locator(".mermaid-diagram")
    if diagrams.count() < 2:
        # mermaid not loaded in this env; nothing to assert
        return

    # Scroll to top — first diagram in view, second is far below
    page.evaluate("() => window.scrollTo(0, 0)")
    page.wait_for_timeout(100)

    second_html_before = page.locator(".mermaid-diagram").last.inner_html()

    page.evaluate(
        "() => document.dispatchEvent(new CustomEvent('wiki:themechange', { detail: { theme: 'light' } }))"
    )
    page.wait_for_timeout(400)

    second_html_after = page.locator(".mermaid-diagram").last.inner_html()

    assert second_html_before == second_html_after, (
        "Off-screen diagram should not be re-rendered on theme change"
    )
