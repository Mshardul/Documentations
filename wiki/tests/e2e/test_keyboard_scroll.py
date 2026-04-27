"""
Content hotkeys (b for bookmark, , for settings toggle).
Visual pulse on heading after TOC click.
Persist and restore wiki index scroll position.
"""


def _go_to_article(page, base_url):
    page.goto(f"{base_url}/wiki/#system-design/caching")
    page.wait_for_selector("#view-content.active", timeout=10_000)


# ── Content Hotkeys ────────────────────────────────────────────────


def test_hotkey_b_bookmarks(page, base_url):
    """Pressing 'b' toggles bookmark state."""
    _go_to_article(page, base_url)
    btn = page.locator("#content-bookmark-btn")

    # Initial state (assuming unbookmarked)
    initial_state = "active" in (btn.get_attribute("class") or "")

    # Toggle on
    page.keyboard.press("b")
    assert "active" in btn.get_attribute("class")

    # Toggle off (test uppercase B too)
    page.keyboard.press("B")
    # Should revert to initial state
    is_active = "active" in btn.get_attribute("class")
    assert is_active == initial_state


def test_hotkey_comma_settings(page, base_url):
    """Pressing ',' toggles the settings panel."""
    _go_to_article(page, base_url)
    panel = page.locator("#settings-panel")

    # Initially closed
    assert "hidden" in (panel.get_attribute("class") or "")

    # Open
    page.keyboard.press(",")
    assert "hidden" not in (panel.get_attribute("class") or "")

    # Close (toggle)
    page.keyboard.press(",")
    assert "hidden" in (panel.get_attribute("class") or "")


def test_hotkeys_disabled_in_input(page, base_url):
    """Hotkeys should not trigger when an input is focused."""
    _go_to_article(page, base_url)
    # Open search modal to focus input
    page.keyboard.press("Meta+k")
    page.wait_for_selector("#gsearch-input")
    page.focus("#gsearch-input")

    # Try bookmarking via hotkey while input focused
    page.keyboard.press("b")
    btn = page.locator("#content-bookmark-btn")
    # Should not toggle
    assert "active" not in (btn.get_attribute("class") or "")


# ── TOC Jump Pulse ─────────────────────────────────────────────────


def test_toc_pulse_on_click(page, base_url):
    """Clicking a TOC item adds the pulse class to the target heading."""
    _go_to_article(page, base_url)
    toc_item = page.locator("#toc-nav .toc-item").first
    toc_item.click()

    # Pulse class is added synchronously, removed after 600ms.
    # Check immediately.
    has_pulse = page.evaluate("""() => {
        const toc = document.querySelector('#toc-nav .toc-item');
        if (!toc) return false;
        const id = toc.getAttribute('href').slice(1);
        const h = document.querySelector(`#${id}`);
        return h && h.classList.contains('toc-heading-pulse');
    }""")
    assert has_pulse


# ── Persist Index Scroll ───────────────────────────────────────────


def test_index_scroll_persistence(page, base_url):
    """Scroll position on wiki index is restored when revisiting."""
    # 1. Go to index and scroll down
    page.goto(f"{base_url}/wiki/#system-design")
    page.wait_for_selector("#view-index.active", timeout=5_000)
    page.evaluate("() => window.scrollTo(0, 800)")
    page.wait_for_timeout(400)  # Wait for debounced save

    saved_scroll = page.evaluate("() => localStorage.getItem('wiki-index-scroll')")
    assert saved_scroll and int(saved_scroll) > 0

    # 2. Navigate away (to article)
    page.locator(".index-card").first.click()
    page.wait_for_selector("#view-content.active", timeout=10_000)

    # 3. Go back to index
    page.goto(f"{base_url}/wiki/#system-design")
    page.wait_for_selector("#view-index.active", timeout=5_000)

    # Restore happens in showView with 50ms timeout
    page.wait_for_timeout(200)

    scroll_y = page.evaluate("() => window.scrollY")
    assert scroll_y > 600  # Should be restored near 800
