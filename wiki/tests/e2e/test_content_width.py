"""
- Content width control in settings — Narrow/Default/Wide.
"""


def _open_settings(page):
    page.locator("[title='Settings']").first.click()
    page.wait_for_function(
        "() => !document.getElementById('settings-panel').classList.contains('hidden')"
    )


def _get_content_width_var(page):
    return page.evaluate(
        "() => document.documentElement.style.getPropertyValue('--content-width').trim()"
    )


# ── rendering ──────────────────────────────────────────────────────────────────


def test_content_width_renders_three_buttons(wiki_page):
    """settings panel renders Narrow, Default, Wide buttons."""
    _open_settings(wiki_page)
    btns = wiki_page.locator("#settings-widths .settings-size-btn").all()
    labels = [b.inner_text() for b in btns]
    assert labels == ["Narrow", "Default", "Wide"]


def test_content_width_default_is_active_on_open(wiki_page):
    """Default button has .active class on first open (default setting)."""
    _open_settings(wiki_page)
    default_btn = wiki_page.locator("#settings-widths .settings-size-btn").nth(1)
    assert "active" in default_btn.get_attribute("class")


# ── CSS var application ────────────────────────────────────────────────────────


def test_narrow_sets_content_width_68ch(wiki_page):
    """clicking Narrow sets --content-width to 68ch."""
    _open_settings(wiki_page)
    wiki_page.locator("#settings-widths .settings-size-btn").nth(0).click()  # Narrow
    assert _get_content_width_var(wiki_page) == "68ch"


def test_default_sets_content_width_80ch(wiki_page):
    """clicking Default sets --content-width to 80ch."""
    _open_settings(wiki_page)
    wiki_page.locator("#settings-widths .settings-size-btn").nth(
        0
    ).click()  # Narrow first
    wiki_page.locator("#settings-widths .settings-size-btn").nth(1).click()  # Default
    assert _get_content_width_var(wiki_page) == "80ch"


def test_wide_sets_content_width_120ch(wiki_page):
    """clicking Wide sets --content-width to 120ch."""
    _open_settings(wiki_page)
    wiki_page.locator("#settings-widths .settings-size-btn").nth(2).click()  # Wide
    assert _get_content_width_var(wiki_page) == "120ch"


def test_width_button_gets_active_class(wiki_page):
    """clicked width button receives .active, others lose it."""
    _open_settings(wiki_page)
    wide_btn = wiki_page.locator("#settings-widths .settings-size-btn").nth(2)
    wide_btn.click()
    assert "active" in wide_btn.get_attribute("class")
    narrow_btn = wiki_page.locator("#settings-widths .settings-size-btn").nth(0)
    assert "active" not in narrow_btn.get_attribute("class")


# ── preset interaction ─────────────────────────────────────────────────────────


def test_changing_width_sets_custom_preset(wiki_page):
    """manually changing width while on a named preset switches to custom."""
    _open_settings(wiki_page)
    wiki_page.locator("#settings-presets .settings-preset-card").nth(0).click()  # Dark
    wiki_page.locator("#settings-widths .settings-size-btn").nth(2).click()  # Wide
    active_presets = wiki_page.locator(
        "#settings-presets .settings-preset-card.active"
    ).count()
    assert active_presets == 0


# ── persistence ────────────────────────────────────────────────────────────────


def test_content_width_persists_across_reload(page, base_url):
    """selected content width survives a page reload via localStorage."""
    page.goto(f"{base_url}/wiki/")
    page.wait_for_load_state("networkidle")

    page.locator("[title='Settings']").first.click()
    page.wait_for_selector("#settings-panel:not(.hidden)")
    page.locator("#settings-widths .settings-size-btn").nth(0).click()  # Narrow

    stored = page.evaluate(
        "() => JSON.parse(localStorage.getItem('wiki-settings')).contentWidth"
    )
    assert stored == "Narrow"

    page.reload()
    page.wait_for_load_state("networkidle")

    stored_after = page.evaluate(
        "() => JSON.parse(localStorage.getItem('wiki-settings')).contentWidth"
    )
    assert stored_after == "Narrow"

    width_var = page.evaluate(
        "() => document.documentElement.style.getPropertyValue('--content-width').trim()"
    )
    assert width_var == "68ch"
