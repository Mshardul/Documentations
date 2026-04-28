"""
HTML markup integrity tests:
- WIKI-061: Skip-to-content link (visually hidden, first focusable, links to #main-content)
- WIKI-066: CDN scripts have defer attribute
- WIKI-063: No inline onclick/onchange on static buttons; data-action delegation works
"""


# ── WIKI-061: Skip-to-content ────────────────────────────────────────────────


def test_skip_to_content_link_exists(wiki_page):
    """A .skip-to-content anchor element is present in the DOM."""
    link = wiki_page.locator("a.skip-to-content")
    assert link.count() == 1, "Expected exactly one .skip-to-content link"


def test_skip_to_content_points_to_main_content(wiki_page):
    """The skip link href is #main-content."""
    href = wiki_page.locator("a.skip-to-content").get_attribute("href")
    assert href == "#main-content", f"Expected href='#main-content', got '{href}'"


def test_main_content_target_exists(wiki_page):
    """An element with id='main-content' exists for the skip link to target."""
    count = wiki_page.locator("#main-content").count()
    assert count == 1, "No element with id='main-content' found"


def test_skip_link_is_first_focusable_element(wiki_page):
    """The skip link is the first element reached by Tab from the page."""
    wiki_page.keyboard.press("Tab")
    focused_tag = wiki_page.evaluate(
        "() => document.activeElement.tagName.toLowerCase()"
    )
    focused_class = wiki_page.evaluate("() => document.activeElement.className")
    assert focused_tag == "a", (
        f"First Tab focus landed on <{focused_tag}>, expected <a>"
    )
    assert "skip-to-content" in focused_class


def test_skip_link_off_screen_by_default(wiki_page):
    """The skip link is off-screen (not visually rendered) before focus."""
    bounding_box = wiki_page.locator("a.skip-to-content").bounding_box()
    # Off-screen via left:-9999px — bounding box x will be very negative or None
    assert bounding_box is None or bounding_box["x"] < -100, (
        f"Skip link appears to be on-screen before focus: {bounding_box}"
    )


def test_skip_link_visible_on_focus(wiki_page):
    """The skip link becomes visible (on-screen) when it receives focus."""
    wiki_page.keyboard.press("Tab")
    bounding_box = wiki_page.locator("a.skip-to-content").bounding_box()
    assert bounding_box is not None, "Skip link has no bounding box after focus"
    assert bounding_box["x"] >= 0, (
        f"Skip link still off-screen after focus: x={bounding_box['x']}"
    )
    assert bounding_box["width"] > 0 and bounding_box["height"] > 0, (
        "Skip link has zero size after focus"
    )


# ── WIKI-066: CDN script defer ───────────────────────────────────────────────


def test_cdn_scripts_have_defer(wiki_page):
    """All CDN <script> tags (showdown, highlight, mermaid, dompurify, katex) have defer."""
    results = wiki_page.evaluate("""() => {
        const scripts = [...document.querySelectorAll('script[src]')];
        const cdn = scripts.filter(s =>
            s.src.includes('cdn.jsdelivr.net') ||
            s.src.includes('cdnjs.cloudflare.com')
        );
        return cdn.map(s => ({ src: s.src, defer: s.defer }));
    }""")
    assert len(results) >= 6, f"Expected at least 6 CDN scripts, found {len(results)}"
    for script in results:
        assert script["defer"], f"CDN script missing defer: {script['src']}"


def test_app_module_script_not_deferred_explicitly(wiki_page):
    """app.js is type=module (deferred implicitly), not additionally marked defer."""
    is_module = wiki_page.evaluate("""() => {
        const s = document.querySelector('script[src*="app.js"]');
        return s?.type === 'module';
    }""")
    assert is_module, "app.js should be type=module"


# ── WIKI-063: No inline onclick/onchange ────────────────────────────────────


def test_no_inline_onclick_on_buttons(wiki_page):
    """No <button> element in the document has an inline onclick attribute."""
    buttons_with_onclick = wiki_page.evaluate("""() => {
        const btns = [...document.querySelectorAll('button[onclick]')];
        return btns.map(b => b.outerHTML.slice(0, 120));
    }""")
    assert buttons_with_onclick == [], (
        f"Found buttons with inline onclick: {buttons_with_onclick}"
    )


def test_no_inline_onchange_on_inputs(wiki_page):
    """No <input> element has an inline onchange attribute."""
    inputs_with_onchange = wiki_page.evaluate("""() => {
        const inputs = [...document.querySelectorAll('input[onchange]')];
        return inputs.map(i => i.outerHTML.slice(0, 120));
    }""")
    assert inputs_with_onchange == [], (
        f"Found inputs with inline onchange: {inputs_with_onchange}"
    )


def test_data_action_search_open_works(wiki_page):
    """Clicking a [data-action=search-open] button opens the global search modal."""
    wiki_page.locator("[data-action='search-open']").first.click()
    wiki_page.wait_for_function(
        "() => !document.getElementById('global-search-modal').classList.contains('hidden')"
    )
    is_hidden = wiki_page.evaluate(
        "() => document.getElementById('global-search-modal').classList.contains('hidden')"
    )
    assert not is_hidden, "Global search modal did not open via data-action=search-open"


def test_data_action_theme_toggle_works(wiki_page):
    """Clicking a [data-action=theme-toggle] button flips data-theme on <html>."""
    before = wiki_page.evaluate(
        "() => document.documentElement.getAttribute('data-theme')"
    )
    wiki_page.locator("[data-action='theme-toggle']").first.click()
    after = wiki_page.evaluate(
        "() => document.documentElement.getAttribute('data-theme')"
    )
    assert before != after, (
        "Theme did not change after clicking data-action=theme-toggle"
    )


def test_data_action_settings_open_works(wiki_page):
    """Clicking a [data-action=settings-open] button opens the settings panel."""
    wiki_page.locator("[data-action='settings-open']").first.click()
    wiki_page.wait_for_function(
        "() => !document.getElementById('settings-panel').classList.contains('hidden')"
    )
    is_hidden = wiki_page.evaluate(
        "() => document.getElementById('settings-panel').classList.contains('hidden')"
    )
    assert not is_hidden, "Settings panel did not open via data-action=settings-open"


def test_data_action_settings_close_works(wiki_page):
    """Clicking [data-action=settings-close] closes the settings panel."""
    wiki_page.locator("[data-action='settings-open']").first.click()
    wiki_page.wait_for_function(
        "() => !document.getElementById('settings-panel').classList.contains('hidden')"
    )
    wiki_page.locator("[data-action='settings-close']").click()
    wiki_page.wait_for_function(
        "() => document.getElementById('settings-panel').classList.contains('hidden')"
    )
    is_hidden = wiki_page.evaluate(
        "() => document.getElementById('settings-panel').classList.contains('hidden')"
    )
    assert is_hidden, "Settings panel did not close via data-action=settings-close"


def test_data_action_settings_export_works(wiki_page):
    """Clicking [data-action=settings-export] triggers a file download."""
    wiki_page.locator("[data-action='settings-open']").first.click()
    wiki_page.wait_for_selector("#settings-panel:not(.hidden)")

    with wiki_page.expect_download() as dl_info:
        wiki_page.locator("[data-action='settings-export']").click()
    download = dl_info.value
    assert download.suggested_filename.endswith(".json"), (
        f"Expected .json download, got: {download.suggested_filename}"
    )


def test_data_action_wiki_home_navigates_home(page, base_url):
    """Clicking [data-action=wiki-home] from index view returns to home."""
    page.goto(f"{base_url}/wiki/")
    page.wait_for_load_state("networkidle")

    # Navigate into a wiki first
    page.locator(".wiki-card").first.click()
    page.wait_for_selector("#view-index.active", timeout=5_000)

    page.locator("[data-action='wiki-home']").click()
    page.wait_for_selector("#view-home.active", timeout=5_000)

    is_active = page.evaluate(
        "() => document.getElementById('view-home').classList.contains('active')"
    )
    assert is_active, "Home view not active after clicking data-action=wiki-home"
