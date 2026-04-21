"""WIKI-018/032/033: Settings panel — open/close, presets, font, size, accent,
theme row, hacker themes, persistence."""


def _settings_is_closed(page):
    page.wait_for_function(
        "() => document.getElementById('settings-panel').classList.contains('hidden')"
    )


def _open_settings(page):
    page.locator("[title='Settings']").first.click()
    page.wait_for_function(
        "() => !document.getElementById('settings-panel').classList.contains('hidden')"
    )


def _close_settings_via_escape(page):
    page.keyboard.press("Escape")
    _settings_is_closed(page)


# ── open / close ──────────────────────────────────────────────────────────────


def test_settings_opens_on_gear_click(wiki_page):
    """WIKI-018: clicking gear icon removes .hidden from settings-panel."""
    _open_settings(wiki_page)
    assert (
        not wiki_page.locator("#settings-panel")
        .get_attribute("class")
        .__contains__("hidden")
    )


def test_settings_closes_on_escape(wiki_page):
    """WIKI-018: Escape key closes the settings panel."""
    _open_settings(wiki_page)
    _close_settings_via_escape(wiki_page)
    assert "hidden" in wiki_page.locator("#settings-panel").get_attribute("class")


def test_settings_closes_on_backdrop_click(wiki_page):
    """WIKI-018: clicking backdrop closes the settings panel."""
    _open_settings(wiki_page)
    wiki_page.locator("#settings-backdrop").click(force=True)
    _settings_is_closed(wiki_page)
    assert "hidden" in wiki_page.locator("#settings-panel").get_attribute("class")


# ── content rendered ───────────────────────────────────────────────────────────


def test_settings_renders_nine_presets(wiki_page):
    """WIKI-018/033: settings panel renders exactly 9 preset cards."""
    _open_settings(wiki_page)
    assert wiki_page.locator("#settings-presets .settings-preset-card").count() == 9


def test_settings_renders_six_fonts(wiki_page):
    """WIKI-018: settings panel renders exactly 6 font chips."""
    _open_settings(wiki_page)
    assert wiki_page.locator("#settings-fonts .settings-font-chip").count() == 6


def test_settings_renders_three_sizes(wiki_page):
    """WIKI-018: settings panel renders S, M, L size buttons."""
    _open_settings(wiki_page)
    btns = wiki_page.locator("#settings-sizes .settings-size-btn").all()
    labels = [b.inner_text() for b in btns]
    assert labels == ["S", "M", "L"]


def test_settings_renders_eight_accents(wiki_page):
    """WIKI-033: settings panel renders exactly 8 accent swatches (6 original + matrix + neon-green)."""
    _open_settings(wiki_page)
    assert wiki_page.locator("#settings-accents .settings-accent-swatch").count() == 8


def test_settings_renders_theme_row(wiki_page):
    """WIKI-032: settings panel renders Light and Dark buttons in theme row."""
    _open_settings(wiki_page)
    btns = wiki_page.locator("#settings-themes .settings-size-btn").all()
    labels = [b.inner_text() for b in btns]
    assert labels == ["Light", "Dark"]


# ── preset application ─────────────────────────────────────────────────────────


def test_light_preset_sets_data_theme_light(wiki_page):
    """WIKI-018: selecting 'Light' preset sets data-theme=light on <html>."""
    _open_settings(wiki_page)
    wiki_page.locator("#settings-presets .settings-preset-card").nth(1).click()  # Light
    theme = wiki_page.evaluate(
        "() => document.documentElement.getAttribute('data-theme')"
    )
    assert theme == "light"


def test_dark_preset_sets_data_theme_dark(wiki_page):
    """WIKI-018: selecting 'Dark' preset sets data-theme=dark on <html>."""
    _open_settings(wiki_page)
    wiki_page.locator("#settings-presets .settings-preset-card").nth(1).click()  # Light
    wiki_page.locator("#settings-presets .settings-preset-card").nth(0).click()  # Dark
    theme = wiki_page.evaluate(
        "() => document.documentElement.getAttribute('data-theme')"
    )
    assert theme == "dark"


def test_preset_card_gets_active_class(wiki_page):
    """WIKI-018: clicked preset card receives .active class."""
    _open_settings(wiki_page)
    card = wiki_page.locator("#settings-presets .settings-preset-card").nth(
        2
    )  # Midnight
    card.click()
    assert "active" in card.get_attribute("class")


# ── hacker presets ────────────────────────────────────────────────────────────


def test_matrix_preset_sets_data_theme_matrix(wiki_page):
    """WIKI-033: selecting Matrix preset sets data-theme=matrix."""
    _open_settings(wiki_page)
    wiki_page.locator("#settings-presets .settings-preset-card").nth(
        6
    ).click()  # Matrix
    theme = wiki_page.evaluate(
        "() => document.documentElement.getAttribute('data-theme')"
    )
    assert theme == "matrix"


def test_terminal_preset_sets_data_theme_terminal(wiki_page):
    """WIKI-033: selecting Terminal preset sets data-theme=terminal."""
    _open_settings(wiki_page)
    wiki_page.locator("#settings-presets .settings-preset-card").nth(
        7
    ).click()  # Terminal
    theme = wiki_page.evaluate(
        "() => document.documentElement.getAttribute('data-theme')"
    )
    assert theme == "terminal"


def test_amber_crt_preset_sets_data_theme_amber_term(wiki_page):
    """WIKI-033: selecting Amber CRT preset sets data-theme=amber-term."""
    _open_settings(wiki_page)
    wiki_page.locator("#settings-presets .settings-preset-card").nth(
        8
    ).click()  # Amber CRT
    theme = wiki_page.evaluate(
        "() => document.documentElement.getAttribute('data-theme')"
    )
    assert theme == "amber-term"


def test_hacker_presets_set_mono_font(wiki_page):
    """WIKI-033: all three hacker presets apply JetBrains Mono font."""
    _open_settings(wiki_page)
    for idx in [6, 7, 8]:
        wiki_page.locator("#settings-presets .settings-preset-card").nth(idx).click()
        font_var = wiki_page.evaluate(
            "() => document.documentElement.style.getPropertyValue('--font')"
        )
        assert "JetBrains Mono" in font_var, (
            f"Preset index {idx} did not apply JetBrains Mono"
        )


def test_hacker_themes_show_moon_icon(wiki_page):
    """WIKI-033: hacker themes treated as dark — moon icon visible, sun hidden."""
    _open_settings(wiki_page)
    wiki_page.locator("#settings-presets .settings-preset-card").nth(
        6
    ).click()  # Matrix
    moon_display = wiki_page.evaluate(
        "() => getComputedStyle(document.querySelector('.theme-icon-moon')).display"
    )
    sun_display = wiki_page.evaluate(
        "() => document.querySelector('.theme-icon-sun').style.display"
    )
    assert moon_display != "none"
    assert sun_display == "none"


def test_hacker_preset_no_theme_row_active(wiki_page):
    """WIKI-033: when hacker theme active, neither Light nor Dark button is .active."""
    _open_settings(wiki_page)
    wiki_page.locator("#settings-presets .settings-preset-card").nth(
        6
    ).click()  # Matrix
    active_count = wiki_page.locator(
        "#settings-themes .settings-size-btn.active"
    ).count()
    assert active_count == 0


# ── theme row (Light / Dark) ──────────────────────────────────────────────────


def test_theme_row_light_button_sets_light(wiki_page):
    """WIKI-032: clicking Light in theme row sets data-theme=light."""
    _open_settings(wiki_page)
    wiki_page.locator("#settings-themes .settings-size-btn").nth(0).click()  # Light
    theme = wiki_page.evaluate(
        "() => document.documentElement.getAttribute('data-theme')"
    )
    assert theme == "light"


def test_theme_row_dark_button_sets_dark(wiki_page):
    """WIKI-032: clicking Dark in theme row sets data-theme=dark."""
    _open_settings(wiki_page)
    wiki_page.locator("#settings-themes .settings-size-btn").nth(
        0
    ).click()  # Light first
    wiki_page.locator("#settings-themes .settings-size-btn").nth(1).click()  # Dark
    theme = wiki_page.evaluate(
        "() => document.documentElement.getAttribute('data-theme')"
    )
    assert theme == "dark"


def test_theme_row_active_reflects_current_theme(wiki_page):
    """WIKI-032: active button in theme row matches current light/dark theme."""
    _open_settings(wiki_page)
    wiki_page.locator("#settings-themes .settings-size-btn").nth(0).click()  # Light
    light_btn = wiki_page.locator("#settings-themes .settings-size-btn").nth(0)
    dark_btn = wiki_page.locator("#settings-themes .settings-size-btn").nth(1)
    assert "active" in light_btn.get_attribute("class")
    assert "active" not in dark_btn.get_attribute("class")


def test_theme_row_sets_custom_preset(wiki_page):
    """WIKI-032: using theme row while on a named preset switches to custom."""
    _open_settings(wiki_page)
    wiki_page.locator("#settings-presets .settings-preset-card").nth(0).click()  # Dark
    wiki_page.locator("#settings-themes .settings-size-btn").nth(
        0
    ).click()  # flip to Light
    active_presets = wiki_page.locator(
        "#settings-presets .settings-preset-card.active"
    ).count()
    assert active_presets == 0


# ── font selection ─────────────────────────────────────────────────────────────


def test_font_chip_gets_active_on_click(wiki_page):
    """WIKI-018: clicking a font chip adds .active to that chip."""
    _open_settings(wiki_page)
    chip = wiki_page.locator("#settings-fonts .settings-font-chip").nth(1)  # Geist
    chip.click()
    assert "active" in chip.get_attribute("class")


def test_font_chip_sets_custom_preset(wiki_page):
    """WIKI-018: manually changing font deactivates all named preset cards."""
    _open_settings(wiki_page)
    wiki_page.locator("#settings-presets .settings-preset-card").nth(0).click()  # Dark
    wiki_page.locator("#settings-fonts .settings-font-chip").nth(3).click()  # Lora
    active_presets = wiki_page.locator(
        "#settings-presets .settings-preset-card.active"
    ).count()
    assert active_presets == 0


# ── size selection ────────────────────────────────────────────────────────────


def test_size_s_reduces_font_size(wiki_page):
    """WIKI-018: selecting S sets a smaller root font-size than M."""
    _open_settings(wiki_page)
    wiki_page.locator("#settings-sizes .settings-size-btn").nth(1).click()  # M
    size_m = wiki_page.evaluate(
        "() => parseFloat(document.documentElement.style.fontSize)"
    )
    wiki_page.locator("#settings-sizes .settings-size-btn").nth(0).click()  # S
    size_s = wiki_page.evaluate(
        "() => parseFloat(document.documentElement.style.fontSize)"
    )
    assert size_s < size_m


def test_size_l_increases_font_size(wiki_page):
    """WIKI-018: selecting L sets a larger root font-size than M."""
    _open_settings(wiki_page)
    wiki_page.locator("#settings-sizes .settings-size-btn").nth(1).click()  # M
    size_m = wiki_page.evaluate(
        "() => parseFloat(document.documentElement.style.fontSize)"
    )
    wiki_page.locator("#settings-sizes .settings-size-btn").nth(2).click()  # L
    size_l = wiki_page.evaluate(
        "() => parseFloat(document.documentElement.style.fontSize)"
    )
    assert size_l > size_m


# ── accent selection ──────────────────────────────────────────────────────────


def test_accent_swatch_updates_css_var(wiki_page):
    """WIKI-018: clicking an accent swatch updates --accent CSS variable."""
    _open_settings(wiki_page)
    wiki_page.locator("#settings-presets .settings-preset-card").nth(
        0
    ).click()  # Dark (indigo)
    accent_before = wiki_page.evaluate(
        "() => document.documentElement.style.getPropertyValue('--accent').trim()"
    )
    wiki_page.locator("#settings-accents .settings-accent-swatch").nth(
        5
    ).click()  # amber
    accent_after = wiki_page.evaluate(
        "() => document.documentElement.style.getPropertyValue('--accent').trim()"
    )
    assert accent_before != accent_after


# ── localStorage persistence ──────────────────────────────────────────────────


def test_settings_persist_across_reload(page, base_url):
    """WIKI-018: settings saved to localStorage survive a page reload."""
    page.goto(f"{base_url}/wiki/")
    page.wait_for_load_state("networkidle")

    page.locator("[title='Settings']").first.click()
    page.wait_for_selector("#settings-panel:not(.hidden)")
    page.locator("#settings-presets .settings-preset-card").nth(1).click()  # Light
    assert (
        page.evaluate("() => document.documentElement.getAttribute('data-theme')")
        == "light"
    )

    page.reload()
    page.wait_for_load_state("networkidle")
    theme = page.evaluate("() => document.documentElement.getAttribute('data-theme')")
    assert theme == "light"


def test_hacker_theme_persists_across_reload(page, base_url):
    """WIKI-033: hacker theme survives page reload via localStorage."""
    page.goto(f"{base_url}/wiki/")
    page.wait_for_load_state("networkidle")

    page.locator("[title='Settings']").first.click()
    page.wait_for_selector("#settings-panel:not(.hidden)")
    page.locator("#settings-presets .settings-preset-card").nth(6).click()  # Matrix

    page.reload()
    page.wait_for_load_state("networkidle")
    theme = page.evaluate("() => document.documentElement.getAttribute('data-theme')")
    assert theme == "matrix"


def test_font_persists_across_reload(page, base_url):
    """WIKI-018: selected font survives a page reload via localStorage."""
    page.goto(f"{base_url}/wiki/")
    page.wait_for_load_state("networkidle")

    page.locator("[title='Settings']").first.click()
    page.wait_for_selector("#settings-panel:not(.hidden)")
    page.locator("#settings-fonts .settings-font-chip").nth(3).click()  # Lora

    stored = page.evaluate(
        "() => JSON.parse(localStorage.getItem('wiki-settings')).font"
    )
    assert stored == "Lora"

    page.reload()
    page.wait_for_load_state("networkidle")
    stored_after = page.evaluate(
        "() => JSON.parse(localStorage.getItem('wiki-settings')).font"
    )
    assert stored_after == "Lora"


# ── header theme toggle still works ──────────────────────────────────────────


def test_header_theme_toggle_works(wiki_page):
    """Theme.toggle() via header button still flips data-theme independently."""
    _open_settings(wiki_page)
    wiki_page.locator("#settings-presets .settings-preset-card").nth(0).click()  # Dark
    wiki_page.locator("#settings-backdrop").click(force=True)
    _settings_is_closed(wiki_page)

    before = wiki_page.evaluate(
        "() => document.documentElement.getAttribute('data-theme')"
    )
    wiki_page.locator(".theme-toggle-btn").first.click()
    after = wiki_page.evaluate(
        "() => document.documentElement.getAttribute('data-theme')"
    )
    assert before != after
