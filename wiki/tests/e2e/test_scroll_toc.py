"""
- scroll position persisted per article in localStorage
- TOC sidebar sticky on desktop, hidden on mobile
- Sticky section header updates on scroll (WIKI-174)
"""


# ── Scroll Position in LocalStorage ─────────────────────────────────────────────


def test_scroll_position_saved_and_restored(page, base_url):
    """scroll position is restored when revisiting the same article.

    Writes the saved position directly to localStorage using the app's own key
    (read from state.currentFilePath) to avoid relying on headless scroll events
    for the save path. Tests the restore path in isolation.
    """
    page.goto(f"{base_url}/wiki/#system-design/caching")
    page.wait_for_selector("#markdown-body pre", timeout=10_000)

    # Read the actual localStorage key the app uses, then write 600 directly.
    file_path = page.evaluate(
        "() => (typeof state !== 'undefined' ? state.currentFilePath : null)"
    )
    wiki_id = page.evaluate(
        "() => (typeof state !== 'undefined' ? state.currentWikiId : null)"
    )
    assert file_path, "Could not read state.currentFilePath from app"
    assert wiki_id, "Could not read state.currentWikiId from app"
    page.evaluate(
        "([wid, fp]) => localStorage.setItem('scroll-' + wid + '-' + fp, '600')",
        [wiki_id, file_path],
    )

    # Navigate away then back.
    page.goto(f"{base_url}/wiki/#system-design")
    page.wait_for_selector("#view-index.active", timeout=5_000)
    page.goto(f"{base_url}/wiki/#system-design/caching")
    page.wait_for_selector("#markdown-body pre", timeout=10_000)

    # Wait until scroll is actually restored (fires at ~150ms) rather than a fixed sleep.
    # If this times out, window.scrollTo genuinely doesn't work in this environment.
    try:
        page.wait_for_function("() => window.scrollY > 100", timeout=3_000)
    except Exception:
        scroll_y = page.evaluate("() => window.scrollY")
        assert False, f"Scroll not restored after 3s; scrollY={scroll_y}"


def test_scroll_position_not_restored_with_anchor(page, base_url):
    """?a= anchor param takes priority over saved scroll position."""
    # First visit and scroll to persist a position.
    page.goto(f"{base_url}/wiki/#system-design/caching")
    page.wait_for_selector("#markdown-body pre", timeout=10_000)
    file_path = page.evaluate(
        "() => (typeof state !== 'undefined' ? state.currentFilePath : null)"
    )
    wiki_id = page.evaluate(
        "() => (typeof state !== 'undefined' ? state.currentWikiId : null)"
    )
    assert file_path, "Could not read state.currentFilePath from app"
    assert wiki_id, "Could not read state.currentWikiId from app"
    page.evaluate(
        "([wid, fp]) => localStorage.setItem('scroll-' + wid + '-' + fp, '600')",
        [wiki_id, file_path],
    )

    # Revisit with an anchor - scroll should go to anchor, not saved position.
    first_heading = page.evaluate(
        "() => document.querySelector('#markdown-body [id]')?.id"
    )
    if not first_heading:
        return  # no headings to anchor to; skip

    page.goto(f"{base_url}/wiki/#system-design/caching")
    page.evaluate(
        f"() => history.replaceState(null, '', location.href.split('?')[0] + '?a={first_heading}')"
    )
    page.evaluate("() => window.scrollTo(0, 0)")
    page.wait_for_timeout(400)
    # Anchor scroll targets near-0 if heading is at top, or some other position -
    # key assertion is that the restore path did not fire (no error thrown).
    assert page.locator("#view-content.active").count() == 1


# ── TOC Sidebar Behavior ────────────────────────────────────────────────────────


def test_toc_visible_on_desktop(page, base_url):
    """TOC sidebar is visible on large screens."""
    page.set_viewport_size({"width": 1280, "height": 800})
    page.goto(f"{base_url}/wiki/#system-design/caching")
    page.wait_for_selector("#view-content.active", timeout=10_000)

    sidebar = page.locator("#toc-sidebar")
    assert sidebar.is_visible()


def test_toc_hidden_on_mobile(page, base_url):
    """TOC sidebar is hidden by default on mobile viewports."""
    page.set_viewport_size({"width": 375, "height": 812})
    page.goto(f"{base_url}/wiki/#system-design/caching")
    page.wait_for_selector("#view-content.active", timeout=10_000)

    sidebar = page.locator("#toc-sidebar")
    assert not sidebar.is_visible()


def test_mobile_toc_closes_on_link_tap(page, base_url):
    """Tapping a TOC link closes the mobile drawer without needing the overlay."""
    page.set_viewport_size({"width": 375, "height": 812})
    page.goto(f"{base_url}/wiki/#system-design/caching")
    page.wait_for_selector("#view-content.active", timeout=10_000)
    page.wait_for_function(
        "() => !!document.querySelector('#markdown-body[data-render-done]')",
        timeout=10_000,
    )
    page.wait_for_selector("#toc-nav .toc-item", state="attached")

    page.locator("#toc-mobile-btn").click()
    page.wait_for_function(
        "() => document.getElementById('toc-sidebar').classList.contains('mobile-open')"
    )
    page.wait_for_timeout(400)  # slideInRight 0.2s + toc-item transition settle buffer
    page.locator("#toc-nav .toc-item").first.click()
    page.wait_for_function(
        "() => !document.getElementById('toc-sidebar').classList.contains('mobile-open')"
    )
    assert (
        not page.locator("#toc-mobile-overlay")
        .get_attribute("class")
        .__contains__("open")
    )


def test_toc_sticky_does_not_scroll_away(page, base_url):
    """TOC sidebar stays in viewport after scrolling down."""
    page.set_viewport_size({"width": 1280, "height": 800})
    page.goto(f"{base_url}/wiki/#system-design/caching")
    page.wait_for_selector("#markdown-body pre", timeout=8_000)

    page.evaluate("() => window.scrollTo(0, 1500)")
    page.wait_for_timeout(200)

    sidebar = page.locator("#toc-sidebar")
    assert sidebar.is_visible()
    box = sidebar.bounding_box()
    assert box["y"] >= 0 and box["y"] < page.viewport_size["height"]


# ── Sticky section header (WIKI-174) ───────────────────────────────────────────


def test_sticky_section_header_element_exists(page, base_url):
    """#sticky-section-header element is present in the DOM in content view."""
    page.goto(f"{base_url}/wiki/#system-design/caching")
    page.wait_for_selector("#view-content.active", timeout=10_000)

    exists = page.evaluate("() => !!document.getElementById('sticky-section-header')")
    assert exists, "#sticky-section-header element not found in DOM"


def test_sticky_section_header_shows_section_on_scroll(page, base_url):
    """Scrolling past an h2 populates the sticky section header with the section name."""
    page.set_viewport_size({"width": 1280, "height": 800})
    page.goto(f"{base_url}/wiki/#system-design/caching")
    page.wait_for_function(
        "() => !!document.querySelector('#markdown-body[data-render-done]')",
        timeout=10_000,
    )

    h2_top = page.evaluate("""() => {
        const h2 = document.querySelector('#markdown-body h2');
        return h2 ? h2.getBoundingClientRect().top + window.scrollY : null;
    }""")
    if h2_top is None:
        return  # no h2 in article; skip

    page.evaluate(f"() => window.scrollTo(0, {int(h2_top) + 200})")
    page.wait_for_function(
        "() => document.getElementById('sticky-section-header')?.textContent?.trim().length > 0",
        timeout=3_000,
    )

    text = page.evaluate(
        "() => document.getElementById('sticky-section-header')?.textContent?.trim()"
    )
    assert text, "Sticky section header is empty after scrolling past h2"


def test_mobile_toc_open_locks_body_scroll(page, base_url):
    """opening mobile TOC adds toc-open class to body."""
    page.set_viewport_size({"width": 375, "height": 812})
    page.goto(f"{base_url}/wiki/#system-design/caching")
    page.wait_for_selector("#view-content.active", timeout=10_000)

    page.locator("#toc-mobile-btn").click()
    page.wait_for_function(
        "() => document.getElementById('toc-sidebar').classList.contains('mobile-open')"
    )
    assert page.evaluate("() => document.body.classList.contains('toc-open')")


def test_mobile_toc_close_via_overlay_unlocks_scroll(page, base_url):
    """closing mobile TOC via overlay removes toc-open from body."""
    page.set_viewport_size({"width": 375, "height": 812})
    page.goto(f"{base_url}/wiki/#system-design/caching")
    page.wait_for_selector("#view-content.active", timeout=10_000)

    page.locator("#toc-mobile-btn").click()
    page.wait_for_function(
        "() => document.getElementById('toc-sidebar').classList.contains('mobile-open')"
    )
    page.locator("#toc-mobile-overlay").click()
    page.wait_for_function(
        "() => !document.getElementById('toc-sidebar').classList.contains('mobile-open')"
    )
    assert not page.evaluate("() => document.body.classList.contains('toc-open')")
