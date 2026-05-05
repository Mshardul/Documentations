"""
Accessibility and hotkey fixes:
- WIKI-094: Focus trap listener no longer leaks on rapid ⌘K re-open
- WIKI-099: copy-btn and anchor-btn expose aria-label
- WIKI-100: Space key activates role=button cards (wiki-card, index-card)
- WIKI-105: T hotkey moves focus to first TOC item
- WIKI-097: Scroll restoration uses rAF instead of 150ms timeout
- WIKI-064: Parsed search index cached in sessionStorage after first ⌘K load
"""


def _go_to_article(page, base_url, slug="system-design/caching"):
    page.goto(f"{base_url}/wiki/#{slug}")
    page.wait_for_selector("#view-content.active", timeout=10_000)
    page.wait_for_function(
        "() => !document.querySelector('#markdown-body > .loading')",
        timeout=10_000,
    )


def _open_search(page):
    page.keyboard.press("Meta+k")
    page.wait_for_selector("#global-search-modal:not(.hidden)")


# ── WIKI-094: Focus trap listener leak ─────────────────────────────────────


def test_focus_trap_survives_rapid_reopen(wiki_page):
    """Tab focus stays inside modal after ⌘K opened multiple times without closing."""
    for _ in range(5):
        wiki_page.keyboard.press("Meta+k")
        wiki_page.wait_for_selector("#global-search-modal:not(.hidden)")

    # Type something so results appear (Tab trap includes result items)
    wiki_page.fill("#gsearch-input", "caching")
    wiki_page.wait_for_selector(".gsearch-result", timeout=8_000)

    # Tab from input → should wrap within modal, not escape to document body
    wiki_page.focus("#gsearch-input")
    wiki_page.keyboard.press("Tab")
    focused_outside = wiki_page.evaluate("""() => {
        const modal = document.getElementById('global-search-modal');
        return !modal.contains(document.activeElement);
    }""")
    assert not focused_outside, "Focus escaped modal after rapid ⌘K re-open"


# ── WIKI-099: aria-label on copy/anchor buttons ────────────────────────────


def test_copy_button_has_aria_label(page, base_url):
    """Code block copy buttons expose aria-label for screen readers."""
    _go_to_article(page, base_url)
    page.wait_for_selector(".copy-btn", timeout=5_000)

    missing = page.evaluate("""() => {
        const btns = [...document.querySelectorAll('.copy-btn')];
        return btns.filter(b => !b.getAttribute('aria-label')).length;
    }""")
    assert missing == 0, f"{missing} copy button(s) missing aria-label"


def test_anchor_button_has_aria_label(page, base_url):
    """Heading anchor buttons expose aria-label for screen readers."""
    _go_to_article(page, base_url)
    page.wait_for_selector(".anchor-btn", timeout=5_000)

    missing = page.evaluate("""() => {
        const btns = [...document.querySelectorAll('.anchor-btn')];
        return btns.filter(b => !b.getAttribute('aria-label')).length;
    }""")
    assert missing == 0, f"{missing} anchor button(s) missing aria-label"


# ── WIKI-100: Space key on role=button cards ───────────────────────────────


def test_space_activates_wiki_card(wiki_page):
    """Space key on a wiki-card navigates to its index view."""
    wiki_page.wait_for_selector(".wiki-card", timeout=5_000)
    wiki_page.evaluate("() => document.querySelector('.wiki-card').focus()")
    wiki_page.keyboard.press(" ")
    wiki_page.wait_for_selector("#view-index.active", timeout=5_000)


def test_space_activates_index_card(page, base_url):
    """Space key on an index-card navigates to its content view."""
    page.goto(f"{base_url}/wiki/#system-design")
    page.wait_for_selector(".index-card", timeout=10_000)
    page.evaluate("() => document.querySelector('.index-card').focus()")
    page.keyboard.press(" ")
    page.wait_for_selector("#view-content.active", timeout=8_000)


# ── WIKI-105: T hotkey focuses TOC ────────────────────────────────────────


def test_t_hotkey_focuses_first_toc_item(page, base_url):
    """T key in content view moves keyboard focus to the first TOC item."""
    _go_to_article(page, base_url)
    page.wait_for_selector("#toc-nav .toc-item", timeout=5_000)

    page.keyboard.press("t")

    focused_toc = page.evaluate("""() => {
        const first = document.querySelector('#toc-nav .toc-item');
        return first && first === document.activeElement;
    }""")
    assert focused_toc, "First TOC item did not receive focus after pressing T"


def test_t_hotkey_uppercase(page, base_url):
    """T (uppercase) also focuses the TOC."""
    _go_to_article(page, base_url)
    page.wait_for_selector("#toc-nav .toc-item", timeout=5_000)

    page.keyboard.press("T")

    focused_toc = page.evaluate("""() => {
        const first = document.querySelector('#toc-nav .toc-item');
        return first && first === document.activeElement;
    }""")
    assert focused_toc, (
        "First TOC item did not receive focus after pressing T (uppercase)"
    )


# ── WIKI-097: Scroll restoration via rAF ──────────────────────────────────


def test_content_scroll_restored_after_navigation(page, base_url):
    """Scroll position in an article is saved and restored after navigating away."""
    _go_to_article(page, base_url)

    # Scroll partway down and wait for debounced save (400ms)
    page.evaluate("""() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        window.scrollTo({ top: Math.floor(max * 0.5), behavior: 'instant' });
    }""")
    page.wait_for_timeout(500)

    saved_y = page.evaluate("() => window.scrollY")
    assert saved_y > 0, "Could not scroll article (content may be too short)"

    # Navigate away then back
    page.goto(f"{base_url}/wiki/")
    page.wait_for_selector("#view-home.active", timeout=5_000)
    page.go_back()
    page.wait_for_selector("#view-content.active", timeout=10_000)
    page.wait_for_function(
        "() => !document.querySelector('#markdown-body > .loading')",
        timeout=10_000,
    )
    # Allow images to load and rAF to fire
    page.wait_for_timeout(500)

    restored_y = page.evaluate("() => window.scrollY")
    assert restored_y >= saved_y * 0.6, (
        f"Scroll not restored: was {saved_y}, got {restored_y}"
    )


# ── WIKI-064: sessionStorage index cache ──────────────────────────────────


def test_search_index_cached_in_session_storage(wiki_page):
    """After ⌘K loads, parsed index is written to sessionStorage."""
    _open_search(wiki_page)
    wiki_page.fill("#gsearch-input", "caching")
    wiki_page.wait_for_selector(".gsearch-result", timeout=8_000)
    wiki_page.keyboard.press("Escape")

    cached_keys = wiki_page.evaluate("""() =>
        Object.keys(sessionStorage).filter(k => k.startsWith('wiki-index-'))
    """)
    assert len(cached_keys) > 0, "No wiki-index-* keys found in sessionStorage"


def test_search_index_cache_is_valid_json(wiki_page):
    """sessionStorage index values are parseable arrays of sections."""
    _open_search(wiki_page)
    wiki_page.fill("#gsearch-input", "caching")
    wiki_page.wait_for_selector(".gsearch-result", timeout=15_000)
    wiki_page.keyboard.press("Escape")

    result = wiki_page.evaluate("""() => {
        const key = Object.keys(sessionStorage).find(k => k.startsWith('wiki-index-'));
        if (!key) return null;
        const parsed = JSON.parse(sessionStorage.getItem(key));
        return Array.isArray(parsed) ? parsed.length : -1;
    }""")
    assert result is not None and result > 0, (
        f"sessionStorage index is not a valid non-empty array (got {result})"
    )
