"""
- Index cards must not be clickable before stub detection completes.
- Index section headers collapse/expand card grids; state persists in localStorage.
- Unavailable cards have tooltip title and allow pointer events.
"""


def _go_to_index(page, base_url):
    page.goto(f"{base_url}/wiki/#system-design")
    page.wait_for_selector("#view-index.active", timeout=10_000)


# ── Stub card click guard ───────────────────────────────────────────


def test_cards_not_clickable_while_loading(page, base_url):
    """Cards must have pointer-events:none while index-sections--loading class is present."""
    _go_to_index(page, base_url)
    page.wait_for_selector(
        "#index-sections:not(.index-sections--loading)", timeout=15_000
    )

    # Verify CSS rule: manually add loading class and check computed style of a card
    result = page.evaluate("""() => {
        const el = document.getElementById('index-sections');
        if (!el) return false;
        el.classList.add('index-sections--loading');
        const card = el.querySelector('.index-card');
        if (!card) return false;
        const pe = window.getComputedStyle(card).pointerEvents;
        el.classList.remove('index-sections--loading');
        return pe === 'none';
    }""")
    assert result is True, (
        "Cards must have pointer-events:none when index-sections--loading is present"
    )


def test_cards_clickable_after_load(page, base_url):
    """After populateIndexReadTimes completes, loading class must be gone."""
    _go_to_index(page, base_url)
    page.wait_for_selector(
        "#index-sections:not(.index-sections--loading)", timeout=15_000
    )

    has_loading = page.evaluate("""() =>
        document.getElementById('index-sections')?.classList.contains('index-sections--loading')
    """)
    assert has_loading is False


# ── Collapsible index sections ──────────────────────────────────────


def test_section_collapses_on_header_click(page, base_url):
    """Clicking a section header hides the card grid."""
    _go_to_index(page, base_url)
    page.wait_for_selector(
        "#index-sections:not(.index-sections--loading)", timeout=15_000
    )

    page.locator(".section-header").first.click()

    first_section = page.locator(".index-section").first
    grid = first_section.locator(".index-card-grid")
    assert grid.is_hidden(), "Card grid must be hidden after section header click"


def test_section_expands_on_second_click(page, base_url):
    """Clicking a collapsed section header expands it again."""
    _go_to_index(page, base_url)
    page.wait_for_selector(
        "#index-sections:not(.index-sections--loading)", timeout=15_000
    )

    header = page.locator(".section-header").first
    header.click()  # collapse
    header.click()  # expand

    first_section = page.locator(".index-section").first
    grid = first_section.locator(".index-card-grid")
    assert grid.is_visible(), "Card grid must be visible after second click (expand)"


def test_section_collapse_persists_in_localstorage(page, base_url):
    """Collapsing a section saves its state to localStorage."""
    _go_to_index(page, base_url)
    page.wait_for_selector(
        "#index-sections:not(.index-sections--loading)", timeout=15_000
    )

    heading = page.locator(".section-title").first.inner_text()
    page.locator(".section-header").first.click()

    key = f"wiki-section-collapsed-system-design-{heading}"
    value = page.evaluate(f"() => localStorage.getItem({repr(key)})")
    assert value == "1", f"localStorage[{key!r}] must be '1' after collapse"


def test_section_collapse_restored_on_revisit(page, base_url):
    """Collapsed state is restored when returning to the index view."""
    _go_to_index(page, base_url)
    page.wait_for_selector(
        "#index-sections:not(.index-sections--loading)", timeout=15_000
    )

    page.locator(".section-header").first.click()  # collapse

    # Navigate away then back
    page.goto(f"{base_url}/wiki/")
    page.wait_for_selector("#view-home.active", timeout=5_000)
    page.goto(f"{base_url}/wiki/#system-design")
    page.wait_for_selector(
        "#index-sections:not(.index-sections--loading)", timeout=15_000
    )

    is_collapsed = page.locator(".index-section").first.evaluate(
        "el => el.classList.contains('section--collapsed')"
    )
    assert is_collapsed, "Section must remain collapsed after navigating away and back"


# ── Unavailable card grayscale ──────────────────────────────────────


def test_unavailable_card_has_grayscale_filter(page, base_url):
    """Cards with .index-card--unavailable must have filter: grayscale(1)."""
    _go_to_index(page, base_url)
    page.wait_for_selector(
        "#index-sections:not(.index-sections--loading)", timeout=15_000
    )

    result = page.evaluate("""() => {
        const card = document.querySelector('.index-card');
        if (!card) return null;
        card.classList.add('index-card--unavailable');
        const f = window.getComputedStyle(card).filter;
        card.classList.remove('index-card--unavailable');
        return f;
    }""")
    assert result is not None, "No .index-card found on page"
    assert "grayscale" in result, (
        f"Expected grayscale filter on .index-card--unavailable, got: {result!r}"
    )


# ── Unavailable card tooltip ───────────────────────────────────────


def test_unavailable_card_allows_pointer_events(page, base_url):
    """unavailable cards must not have pointer-events:none so tooltip is reachable."""
    _go_to_index(page, base_url)
    page.wait_for_selector(
        "#index-sections:not(.index-sections--loading)", timeout=15_000
    )

    result = page.evaluate("""() => {
        const card = document.querySelector('.index-card');
        if (!card) return null;
        card.classList.add('index-card--unavailable');
        const pe = window.getComputedStyle(card).pointerEvents;
        card.classList.remove('index-card--unavailable');
        return pe;
    }""")
    assert result is not None, "No .index-card found on page"
    assert result != "none", (
        f"Unavailable cards must allow pointer events for tooltip hover, got: {result!r}"
    )


def test_unavailable_card_has_tooltip_title(page, base_url):
    """real unavailable (stub) cards have a 'Coming soon' title attribute."""
    _go_to_index(page, base_url)
    page.wait_for_selector(
        "#index-sections:not(.index-sections--loading)", timeout=15_000
    )

    result = page.evaluate("""() => {
        const card = document.querySelector('.index-card--unavailable');
        if (!card) return 'no-stubs';
        return card.getAttribute('title') || '';
    }""")

    if result == "no-stubs":
        return  # no stub cards in this wiki; test is vacuously satisfied

    assert "Coming soon" in result, (
        f"Unavailable card title must contain 'Coming soon', got: {result!r}"
    )
