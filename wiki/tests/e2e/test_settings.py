"""
Settings panel - open/close, background swatches, text/accent colours, font, size, persistence.
Theme variable sync - background/accent/text CSS vars.
OS theme detect on first visit.
"""


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
    """clicking gear icon removes .hidden from settings-panel."""
    _open_settings(wiki_page)
    assert (
        not wiki_page.locator("#settings-panel")
        .get_attribute("class")
        .__contains__("hidden")
    )


def test_settings_closes_on_escape(wiki_page):
    """Escape key closes the settings panel."""
    _open_settings(wiki_page)
    _close_settings_via_escape(wiki_page)
    assert "hidden" in wiki_page.locator("#settings-panel").get_attribute("class")


def test_settings_closes_on_backdrop_click(wiki_page):
    """clicking backdrop closes the settings panel."""
    _open_settings(wiki_page)
    wiki_page.locator("#settings-backdrop").click(force=True)
    _settings_is_closed(wiki_page)
    assert "hidden" in wiki_page.locator("#settings-panel").get_attribute("class")


# ── content rendered ───────────────────────────────────────────────────────────


def test_settings_renders_six_backgrounds(wiki_page):
    """settings panel renders exactly 6 background swatches (3 dark + 3 light)."""
    _open_settings(wiki_page)
    assert wiki_page.locator("#settings-backgrounds .settings-bg-swatch").count() == 6


def test_settings_renders_three_text_colors(wiki_page):
    """settings panel renders exactly 3 text colour swatches."""
    _open_settings(wiki_page)
    assert wiki_page.locator("#settings-text-colors .settings-text-swatch").count() == 3


def test_settings_renders_three_accents(wiki_page):
    """settings panel renders exactly 3 accent swatches."""
    _open_settings(wiki_page)
    assert wiki_page.locator("#settings-accents .settings-accent-swatch").count() == 3


def test_settings_renders_six_fonts(wiki_page):
    """settings panel renders exactly 6 font chips."""
    _open_settings(wiki_page)
    assert wiki_page.locator("#settings-fonts .settings-font-chip").count() == 6


def test_settings_renders_three_sizes(wiki_page):
    """settings panel renders S, M, L size buttons."""
    _open_settings(wiki_page)
    btns = wiki_page.locator("#settings-sizes .settings-size-btn").all()
    labels = [b.inner_text() for b in btns]
    assert labels == ["S", "M", "L"]


# ── background swatch selection ────────────────────────────────────────────────


def test_dark_background_sets_data_theme_dark(wiki_page):
    """clicking a dark background swatch sets data-theme=dark on <html>."""
    _open_settings(wiki_page)
    wiki_page.locator("#settings-backgrounds .settings-bg-swatch").nth(
        0
    ).click()  # Void
    theme = wiki_page.evaluate(
        "() => document.documentElement.getAttribute('data-theme')"
    )
    assert theme == "dark"


def test_light_background_sets_data_theme_light(wiki_page):
    """clicking a light background swatch sets data-theme=light on <html>."""
    _open_settings(wiki_page)
    wiki_page.locator("#settings-backgrounds .settings-bg-swatch").nth(
        3
    ).click()  # White
    theme = wiki_page.evaluate(
        "() => document.documentElement.getAttribute('data-theme')"
    )
    assert theme == "light"


def test_background_swatch_gets_active_class(wiki_page):
    """clicked background swatch receives .active class."""
    _open_settings(wiki_page)
    swatch = wiki_page.locator("#settings-backgrounds .settings-bg-swatch").nth(
        1
    )  # Slate
    swatch.click()
    assert "active" in swatch.get_attribute("class")


def test_background_sets_bg_css_var(wiki_page):
    """clicking a background swatch updates --bg CSS variable."""
    _open_settings(wiki_page)
    before = wiki_page.evaluate(
        "() => document.documentElement.style.getPropertyValue('--bg').trim()"
    )
    wiki_page.locator("#settings-backgrounds .settings-bg-swatch").nth(
        1
    ).click()  # Slate
    after = wiki_page.evaluate(
        "() => document.documentElement.style.getPropertyValue('--bg').trim()"
    )
    assert before != after


def test_bg_separator_present(wiki_page):
    """a separator element divides dark and light background swatches."""
    _open_settings(wiki_page)
    assert (
        wiki_page.locator("#settings-backgrounds .settings-bg-separator").count() == 1
    )


# ── dark/light boundary crossing ──────────────────────────────────────────────


def test_crossing_to_light_resets_accent_to_light_default(wiki_page):
    """switching from dark to light background resets accent to the light-side default (indigo-l)."""
    _open_settings(wiki_page)
    # Explicitly set dark background first (handles OS-light default)
    wiki_page.locator("#settings-backgrounds .settings-bg-swatch").nth(
        0
    ).click()  # Void (dark)
    # Now pick emerald — index 2 in dark accents
    wiki_page.locator("#settings-accents .settings-accent-swatch").nth(
        2
    ).click()  # emerald
    # Cross to light
    wiki_page.locator("#settings-backgrounds .settings-bg-swatch").nth(
        3
    ).click()  # White
    stored_accent = wiki_page.evaluate(
        "() => JSON.parse(localStorage.getItem('wiki-settings')).accentId"
    )
    assert stored_accent == "indigo-l"


def test_crossing_to_dark_resets_accent_to_dark_default(wiki_page):
    """switching from light to dark background resets accent to the dark-side default (indigo)."""
    _open_settings(wiki_page)
    # Go light first
    wiki_page.locator("#settings-backgrounds .settings-bg-swatch").nth(
        3
    ).click()  # White
    # Cross back to dark
    wiki_page.locator("#settings-backgrounds .settings-bg-swatch").nth(
        0
    ).click()  # Void
    stored_accent = wiki_page.evaluate(
        "() => JSON.parse(localStorage.getItem('wiki-settings')).accentId"
    )
    assert stored_accent == "indigo"


def test_crossing_light_dark_refreshes_text_color_swatches(wiki_page):
    """switching bg side re-renders text colour swatches with the correct palette."""
    _open_settings(wiki_page)
    # Go light
    wiki_page.locator("#settings-backgrounds .settings-bg-swatch").nth(
        3
    ).click()  # White
    light_text_id = wiki_page.evaluate(
        "() => JSON.parse(localStorage.getItem('wiki-settings')).textColorId"
    )
    assert light_text_id.endswith("-light")


# ── text colour selection ──────────────────────────────────────────────────────


def test_text_color_swatch_gets_active_class(wiki_page):
    """clicked text colour swatch receives .active class."""
    _open_settings(wiki_page)
    swatch = wiki_page.locator("#settings-text-colors .settings-text-swatch").nth(
        1
    )  # Soft
    swatch.click()
    assert "active" in swatch.get_attribute("class")


def test_text_color_updates_css_vars(wiki_page):
    """clicking a text colour swatch updates --text-heading and --text-body CSS vars."""
    _open_settings(wiki_page)
    before_heading = wiki_page.evaluate(
        "() => document.documentElement.style.getPropertyValue('--text-heading').trim()"
    )
    wiki_page.locator("#settings-text-colors .settings-text-swatch").nth(
        1
    ).click()  # Soft
    after_heading = wiki_page.evaluate(
        "() => document.documentElement.style.getPropertyValue('--text-heading').trim()"
    )
    assert before_heading != after_heading


# ── accent selection ──────────────────────────────────────────────────────────


def test_accent_swatches_have_aria_labels(wiki_page):
    """accent swatches are icon-only buttons - each must have aria-label."""
    _open_settings(wiki_page)
    swatches = wiki_page.locator("#settings-accents .settings-accent-swatch").all()
    assert len(swatches) > 0
    for swatch in swatches:
        label = swatch.get_attribute("aria-label")
        assert label and label.strip(), (
            f"Accent swatch missing aria-label: {swatch.get_attribute('style')}"
        )


def test_accent_swatch_gets_active_class(wiki_page):
    """clicked accent swatch receives .active class."""
    _open_settings(wiki_page)
    swatch = wiki_page.locator("#settings-accents .settings-accent-swatch").nth(
        1
    )  # Cyan
    swatch.click()
    assert "active" in swatch.get_attribute("class")


def test_accent_swatch_updates_css_var(wiki_page):
    """clicking an accent swatch updates --accent CSS variable."""
    _open_settings(wiki_page)
    # Default is dark-void + indigo; switch to cyan (index 1)
    accent_before = wiki_page.evaluate(
        "() => document.documentElement.style.getPropertyValue('--accent').trim()"
    )
    wiki_page.locator("#settings-accents .settings-accent-swatch").nth(
        1
    ).click()  # Cyan
    accent_after = wiki_page.evaluate(
        "() => document.documentElement.style.getPropertyValue('--accent').trim()"
    )
    assert accent_before != accent_after


def test_accent_change_updates_all_css_vars(wiki_page):
    """changing accent swatch updates --accent, --accent-light, --accent-dim, --accent-glow."""
    _open_settings(wiki_page)

    before = {
        "accent": wiki_page.evaluate(
            "() => document.documentElement.style.getPropertyValue('--accent').trim()"
        ),
        "light": wiki_page.evaluate(
            "() => document.documentElement.style.getPropertyValue('--accent-light').trim()"
        ),
        "dim": wiki_page.evaluate(
            "() => document.documentElement.style.getPropertyValue('--accent-dim').trim()"
        ),
        "glow": wiki_page.evaluate(
            "() => document.documentElement.style.getPropertyValue('--accent-glow').trim()"
        ),
    }

    wiki_page.locator("#settings-accents .settings-accent-swatch").nth(
        1
    ).click()  # Cyan

    after = {
        "accent": wiki_page.evaluate(
            "() => document.documentElement.style.getPropertyValue('--accent').trim()"
        ),
        "light": wiki_page.evaluate(
            "() => document.documentElement.style.getPropertyValue('--accent-light').trim()"
        ),
        "dim": wiki_page.evaluate(
            "() => document.documentElement.style.getPropertyValue('--accent-dim').trim()"
        ),
        "glow": wiki_page.evaluate(
            "() => document.documentElement.style.getPropertyValue('--accent-glow').trim()"
        ),
    }

    assert after["accent"] != before["accent"], "--accent not updated"
    assert after["light"] != before["light"], "--accent-light not updated"
    assert after["dim"] != before["dim"], "--accent-dim not updated"
    assert after["glow"] != before["glow"], "--accent-glow not updated"


def test_applying_background_sets_all_accent_vars_non_empty(wiki_page):
    """clicking a background swatch leaves all four accent CSS vars non-empty."""
    _open_settings(wiki_page)
    wiki_page.locator("#settings-backgrounds .settings-bg-swatch").nth(
        1
    ).click()  # Slate

    for var in ("--accent", "--accent-light", "--accent-dim", "--accent-glow"):
        val = wiki_page.evaluate(
            f"() => document.documentElement.style.getPropertyValue('{var}').trim()"
        )
        assert val, f"{var} is empty after applying Slate background"


# ── font selection ─────────────────────────────────────────────────────────────


def test_font_chip_gets_active_on_click(wiki_page):
    """clicking a font chip adds .active to that chip."""
    _open_settings(wiki_page)
    chip = wiki_page.locator("#settings-fonts .settings-font-chip").nth(1)  # Geist
    chip.click()
    assert "active" in chip.get_attribute("class")


def test_font_chip_updates_font_css_var(wiki_page):
    """clicking a font chip updates the --font CSS variable."""
    _open_settings(wiki_page)
    before = wiki_page.evaluate(
        "() => document.documentElement.style.getPropertyValue('--font').trim()"
    )
    wiki_page.locator("#settings-fonts .settings-font-chip").nth(3).click()  # Lora
    after = wiki_page.evaluate(
        "() => document.documentElement.style.getPropertyValue('--font').trim()"
    )
    assert "Lora" in after
    assert before != after


# ── size selection ────────────────────────────────────────────────────────────


def test_size_s_reduces_font_size(wiki_page):
    """selecting S sets a smaller root font-size than M."""
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
    """selecting L sets a larger root font-size than M."""
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


# ── localStorage persistence ──────────────────────────────────────────────────


def test_settings_persist_across_reload(page, base_url):
    """settings saved to localStorage survive a page reload."""
    page.goto(f"{base_url}/wiki/")
    page.wait_for_load_state("networkidle")

    page.locator("[title='Settings']").first.click()
    page.wait_for_selector("#settings-panel:not(.hidden)")
    page.locator("#settings-backgrounds .settings-bg-swatch").nth(
        3
    ).click()  # White (light)
    assert (
        page.evaluate("() => document.documentElement.getAttribute('data-theme')")
        == "light"
    )

    page.reload()
    page.wait_for_load_state("networkidle")
    theme = page.evaluate("() => document.documentElement.getAttribute('data-theme')")
    assert theme == "light"


def test_font_persists_across_reload(page, base_url):
    """selected font survives a page reload via localStorage."""
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


def test_background_id_persists_to_localstorage(wiki_page):
    """clicking a background swatch writes backgroundId to wiki-settings in localStorage."""
    _open_settings(wiki_page)
    wiki_page.locator("#settings-backgrounds .settings-bg-swatch").nth(
        2
    ).click()  # Dusk
    stored = wiki_page.evaluate(
        "() => JSON.parse(localStorage.getItem('wiki-settings')).backgroundId"
    )
    assert stored == "dark-dusk"


# ── header theme toggle ───────────────────────────────────────────────────────


def test_header_theme_toggle_works(wiki_page):
    """Theme.toggle() via header button flips data-theme between dark and light."""
    # Default starts dark; close settings and toggle
    _open_settings(wiki_page)
    wiki_page.locator("#settings-backgrounds .settings-bg-swatch").nth(
        0
    ).click()  # Void (dark)
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


def test_header_toggle_shows_correct_icon(wiki_page):
    """after toggling to light, moon icon hides and sun icon shows."""
    _open_settings(wiki_page)
    wiki_page.locator("#settings-backgrounds .settings-bg-swatch").nth(
        0
    ).click()  # dark
    wiki_page.locator("#settings-backdrop").click(force=True)
    _settings_is_closed(wiki_page)

    wiki_page.locator(".theme-toggle-btn").first.click()  # flip to light
    moon_display = wiki_page.evaluate(
        "() => document.querySelector('.theme-icon-moon').style.display"
    )
    sun_display = wiki_page.evaluate(
        "() => document.querySelector('.theme-icon-sun').style.display"
    )
    assert moon_display == "none"
    assert sun_display != "none"


# ── OS theme detect ─────────────────────────────────────────────────────────────


def test_os_light_preference_sets_light_theme(page, base_url):
    """on first visit with no saved settings and prefers-color-scheme:light, data-theme=light."""
    page.emulate_media(color_scheme="light")
    page.goto(f"{base_url}/wiki/")
    page.evaluate("() => localStorage.removeItem('wiki-settings')")
    page.evaluate("() => localStorage.removeItem('wiki-theme')")
    page.reload()
    page.wait_for_load_state("networkidle")

    theme = page.evaluate("() => document.documentElement.getAttribute('data-theme')")
    assert theme == "light", f"Expected light theme from OS preference, got {theme}"


def test_os_dark_preference_sets_dark_theme(page, base_url):
    """on first visit with no saved settings and prefers-color-scheme:dark, data-theme=dark."""
    page.emulate_media(color_scheme="dark")
    page.goto(f"{base_url}/wiki/")
    page.evaluate("() => localStorage.removeItem('wiki-settings')")
    page.evaluate("() => localStorage.removeItem('wiki-theme')")
    page.reload()
    page.wait_for_load_state("networkidle")

    theme = page.evaluate("() => document.documentElement.getAttribute('data-theme')")
    assert theme == "dark", f"Expected dark theme from OS preference, got {theme}"


def test_saved_settings_override_os_preference(page, base_url):
    """saved localStorage settings take priority over OS color scheme."""
    page.emulate_media(color_scheme="light")
    page.goto(f"{base_url}/wiki/")
    page.wait_for_load_state("networkidle")

    page.evaluate("""() => localStorage.setItem('wiki-settings',
        JSON.stringify({backgroundId:'dark-void',textColorId:'text-crisp-dark',accentId:'indigo',font:'Inter',fontSize:'M',contentWidth:'Default'}))
    """)
    page.reload()
    page.wait_for_load_state("networkidle")

    theme = page.evaluate("() => document.documentElement.getAttribute('data-theme')")
    assert theme == "dark", "Saved dark setting was overridden by OS light preference"


def test_unrecognized_format_falls_back_to_os_preference(page, base_url):
    """unrecognized localStorage format (no backgroundId) falls back to OS preference."""
    page.emulate_media(color_scheme="light")
    page.goto(f"{base_url}/wiki/")
    page.wait_for_load_state("networkidle")

    page.evaluate("""() => localStorage.setItem('wiki-settings',
        JSON.stringify({preset:'dark',theme:'dark',accentId:'indigo'}))
    """)
    page.reload()
    page.wait_for_load_state("networkidle")

    theme = page.evaluate("() => document.documentElement.getAttribute('data-theme')")
    assert theme == "light", (
        "Unrecognized format should fall back to OS light preference"
    )
