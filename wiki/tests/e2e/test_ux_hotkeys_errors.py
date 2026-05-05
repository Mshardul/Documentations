"""
UX, hotkeys, and error handling:
- WIKI-078: fetchText distinguishes 404 from network errors
- WIKI-095: broken slug shows toast before redirecting home
- WIKI-096: focus mode button shows active state
- WIKI-102: = / - hotkeys change font size
- WIKI-103: D key toggles distraction-free mode
"""


def _go_to_article(page, base_url, slug="system-design/caching"):
    page.goto(f"{base_url}/wiki/#{slug}")
    page.wait_for_selector("#view-content.active", timeout=10_000)
    page.wait_for_function(
        "() => !document.querySelector('#markdown-body > .loading')",
        timeout=10_000,
    )


# ── WIKI-078: Specific fetch errors ────────────────────────────────────────


def test_404_shows_not_found_message(page, base_url):
    """A 404 response shows 'not found' in the error message, not a generic HTTP error."""
    page.goto(f"{base_url}/wiki/")
    page.wait_for_load_state("networkidle")
    page.route("**/nonexistent.md", lambda r: r.fulfill(status=404, body=""))
    page.evaluate("""() => navigateToContent(
        'system-design',
        encodeURIComponent('../content/system-design/nonexistent.md'),
        encodeURIComponent('Nonexistent'),
        'nonexistent'
    )""")
    page.wait_for_selector("#view-content.active", timeout=8_000)
    page.wait_for_function(
        "() => !document.querySelector('#markdown-body > .loading')",
        timeout=8_000,
    )

    error_text = page.locator("#markdown-body .error").inner_text()
    assert "404" in error_text or "not found" in error_text.lower(), (
        f"Expected 404/not-found message, got: {error_text}"
    )


def test_network_error_shows_connection_message(page, base_url):
    """A network failure shows a connection-error message, not a generic HTTP error."""
    page.goto(f"{base_url}/wiki/")
    page.wait_for_load_state("networkidle")
    page.route("**/offline.md", lambda r: r.abort("failed"))
    page.evaluate("""() => navigateToContent(
        'system-design',
        encodeURIComponent('../content/system-design/offline.md'),
        encodeURIComponent('Offline'),
        'offline'
    )""")
    page.wait_for_selector("#view-content.active", timeout=8_000)
    page.wait_for_function(
        "() => !document.querySelector('#markdown-body > .loading')",
        timeout=8_000,
    )

    error_text = page.locator("#markdown-body .error").inner_text()
    assert "network" in error_text.lower() or "connection" in error_text.lower(), (
        f"Expected network/connection message, got: {error_text}"
    )


# ── WIKI-095: Toast on broken slug ─────────────────────────────────────────


def test_broken_slug_shows_toast(page, base_url):
    """Navigating to an unknown slug shows a toast before redirecting home."""
    page.goto(f"{base_url}/wiki/#system-design/this-slug-does-not-exist-xyz")
    page.wait_for_selector("#view-home.active", timeout=10_000)

    toast = page.locator("#wiki-toast")
    assert toast.count() > 0, "Toast element not created"
    toast_text = toast.inner_text()
    assert len(toast_text) > 0, "Toast is empty"


def test_broken_slug_redirects_home(page, base_url):
    """After a broken slug, the home view is shown."""
    page.goto(f"{base_url}/wiki/#system-design/no-such-article-abc123")
    page.wait_for_selector("#view-home.active", timeout=10_000)


# ── WIKI-096: Focus mode active indicator ──────────────────────────────────


def test_focus_btn_exists_in_topbar(page, base_url):
    """content-focus-btn is present in the content topbar."""
    _go_to_article(page, base_url)
    assert page.locator("#content-focus-btn").count() > 0


def test_focus_btn_becomes_active_on_f(page, base_url):
    """Pressing F adds .active to the focus button."""
    _go_to_article(page, base_url)
    btn = page.locator("#content-focus-btn")
    assert "active" not in (btn.get_attribute("class") or "")

    page.keyboard.press("f")
    assert "active" in (btn.get_attribute("class") or ""), (
        "Focus button should be active after pressing F"
    )


def test_focus_btn_deactivates_on_second_f(page, base_url):
    """Pressing F twice deactivates the focus button."""
    _go_to_article(page, base_url)
    page.keyboard.press("f")
    page.keyboard.press("f")
    btn = page.locator("#content-focus-btn")
    assert "active" not in (btn.get_attribute("class") or ""), (
        "Focus button should be inactive after toggling off"
    )


def test_focus_btn_click_toggles_mode(page, base_url):
    """Clicking the focus button activates focus mode."""
    _go_to_article(page, base_url)
    btn = page.locator("#content-focus-btn")
    btn.click()
    assert "active" in (btn.get_attribute("class") or ""), (
        "Focus button should be active after clicking"
    )


# ── WIKI-102: Font size hotkeys ────────────────────────────────────────────


def test_equals_increases_font_size(page, base_url):
    """= key increments font size from M to L."""
    _go_to_article(page, base_url)
    page.evaluate("() => Settings._setSize('M')")

    page.keyboard.press("=")

    size = page.evaluate("() => localStorage.getItem('wiki-settings')")
    import json

    settings = json.loads(size)
    assert settings["fontSize"] == "L", (
        f"Expected L after pressing =, got {settings['fontSize']}"
    )


def test_minus_decreases_font_size(page, base_url):
    """- key decrements font size from M to S."""
    _go_to_article(page, base_url)
    page.evaluate("() => Settings._setSize('M')")

    page.keyboard.press("-")

    size = page.evaluate("() => localStorage.getItem('wiki-settings')")
    import json

    settings = json.loads(size)
    assert settings["fontSize"] == "S", (
        f"Expected S after pressing -, got {settings['fontSize']}"
    )


def test_font_size_does_not_exceed_large(page, base_url):
    """= at max size (L) is a no-op."""
    _go_to_article(page, base_url)
    page.evaluate("() => Settings._setSize('L')")
    page.keyboard.press("=")

    import json

    settings = json.loads(page.evaluate("() => localStorage.getItem('wiki-settings')"))
    assert settings["fontSize"] == "L"


def test_font_size_does_not_go_below_small(page, base_url):
    """- at min size (S) is a no-op."""
    _go_to_article(page, base_url)
    page.evaluate("() => Settings._setSize('S')")
    page.keyboard.press("-")

    import json

    settings = json.loads(page.evaluate("() => localStorage.getItem('wiki-settings')"))
    assert settings["fontSize"] == "S"


# ── WIKI-103: Distraction-free mode ────────────────────────────────────────


def test_d_key_hides_topbar(page, base_url):
    """D key hides the content topbar."""
    _go_to_article(page, base_url)
    page.keyboard.press("d")

    topbar_visible = page.evaluate("""() => {
        const tb = document.querySelector('.content-topbar');
        return tb && getComputedStyle(tb).display !== 'none';
    }""")
    assert not topbar_visible, (
        "Content topbar should be hidden in distraction-free mode"
    )


def test_d_key_hides_toc(page, base_url):
    """D key hides the TOC sidebar."""
    _go_to_article(page, base_url)
    page.keyboard.press("d")

    toc_visible = page.evaluate("""() => {
        const toc = document.getElementById('toc-sidebar');
        return toc && getComputedStyle(toc).display !== 'none';
    }""")
    assert not toc_visible, "TOC sidebar should be hidden in distraction-free mode"


def test_d_key_toggle_restores_chrome(page, base_url):
    """Pressing D twice restores topbar and TOC."""
    _go_to_article(page, base_url)
    page.keyboard.press("d")
    page.keyboard.press("d")

    topbar_visible = page.evaluate("""() => {
        const tb = document.querySelector('.content-topbar');
        return tb && getComputedStyle(tb).display !== 'none';
    }""")
    assert topbar_visible, (
        "Content topbar should be visible after toggling distraction-free off"
    )


def test_distraction_free_clears_on_navigation(page, base_url):
    """Navigating away from an article exits distraction-free mode."""
    _go_to_article(page, base_url)
    page.keyboard.press("d")

    assert page.evaluate("() => document.body.classList.contains('distraction-free')")

    page.goto(f"{base_url}/wiki/")
    page.wait_for_selector("#view-home.active", timeout=5_000)
    # Navigate to article again
    page.locator(".wiki-card").first.click()
    page.wait_for_selector("#view-index.active", timeout=5_000)
    page.locator(".index-card").first.click()
    page.wait_for_selector("#view-content.active", timeout=10_000)

    assert not page.evaluate(
        "() => document.body.classList.contains('distraction-free')"
    ), "distraction-free class should be removed after navigation"
