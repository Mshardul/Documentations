"""
- ↑/↓ keyboard navigation in search results + Enter to select
- stub articles (< 200 chars) excluded from ⌘K results
- search input debounce (150ms)
"""


def _open_search(page):
    page.keyboard.press("Meta+k")
    page.wait_for_selector("#global-search-modal:not(.hidden)")
    page.wait_for_selector("#gsearch-input")


def test_arrow_down_selects_first_result(wiki_page):
    """ArrowDown marks first result with .selected class."""
    _open_search(wiki_page)
    wiki_page.fill("#gsearch-input", "caching")
    wiki_page.wait_for_selector(".gsearch-result")

    wiki_page.keyboard.press("ArrowDown")
    selected = wiki_page.locator(".gsearch-result.selected")
    assert selected.count() == 1


def test_arrow_keys_cycle_results(wiki_page):
    """ArrowDown twice moves .selected to a different result."""
    _open_search(wiki_page)
    # "cache" matches many sections inside the large caching.md → guaranteed ≥2 results.
    wiki_page.fill("#gsearch-input", "cache")
    wiki_page.wait_for_selector(".gsearch-result")
    # Wait until at least two results are rendered before navigating.
    wiki_page.locator(".gsearch-result").nth(1).wait_for()

    wiki_page.keyboard.press("ArrowDown")
    first = wiki_page.locator(".gsearch-result.selected").inner_text()
    wiki_page.keyboard.press("ArrowDown")
    second = wiki_page.locator(".gsearch-result.selected").inner_text()
    assert first != second


def test_enter_navigates_to_article(wiki_page):
    """Enter on focused result navigates to article (content view becomes active)."""
    _open_search(wiki_page)
    wiki_page.fill("#gsearch-input", "caching")
    wiki_page.wait_for_selector(".gsearch-result")

    wiki_page.keyboard.press("ArrowDown")
    wiki_page.keyboard.press("Enter")
    wiki_page.wait_for_selector("#view-content.active", timeout=8_000)


def test_stubs_excluded_from_search(wiki_page):
    """known stub articles (< 200 chars) do not appear in search results."""
    _open_search(wiki_page)
    # "api gateway" matches the stub api-gateway.md (14 bytes) by title,
    # but the stub filter should exclude it from results.
    wiki_page.fill("#gsearch-input", "api gateway")
    wiki_page.wait_for_timeout(1_500)

    results = wiki_page.locator(".gsearch-result").all()
    titles = [r.inner_text() for r in results]
    assert all("api gateway" not in t.lower() or len(t) > 200 for t in titles), (
        f"Stub article appeared in results: {titles}"
    )


def test_search_input_has_aria_label(wiki_page):
    """Search input must have an aria-label - placeholder text alone is not read reliably by screen readers."""
    _open_search(wiki_page)
    label = wiki_page.locator("#gsearch-input").get_attribute("aria-label")
    assert label and label.strip()


def test_search_shows_real_articles(wiki_page):
    """non-stub articles do appear in search results."""
    _open_search(wiki_page)
    wiki_page.fill("#gsearch-input", "caching")
    wiki_page.wait_for_selector(".gsearch-result", timeout=8_000)
    assert wiki_page.locator(".gsearch-result").count() > 0


# ── Search input debounce ─────────────────────────────────────────


def test_search_debounce_results_appear_after_typing(wiki_page):
    """results appear after debounce settles; rapid typing does not break search."""
    _open_search(wiki_page)

    # Type each character with no delay (simulates fast typist)
    for char in "caching":
        wiki_page.type("#gsearch-input", char, delay=0)

    # Debounce fires at 150ms — wait well past it
    wiki_page.wait_for_selector(".gsearch-result", timeout=2_000)
    assert wiki_page.locator(".gsearch-result").count() > 0


def test_search_debounce_suppresses_intermediate_updates(wiki_page):
    """rapid keystrokes trigger fewer result updates than keystrokes typed."""
    _open_search(wiki_page)

    # Attach MutationObserver to count result-list updates
    wiki_page.evaluate("""() => {
        window._resultUpdates = 0;
        const el = document.getElementById('gsearch-results');
        if (el) {
            new MutationObserver(() => { window._resultUpdates++; })
                .observe(el, { childList: true, subtree: true });
        }
    }""")

    # Type 7 chars with 0ms delay — without debounce this would trigger 7 updates
    for char in "caching":
        wiki_page.type("#gsearch-input", char, delay=0)

    # Wait for debounce + render to settle
    wiki_page.wait_for_timeout(400)

    updates = wiki_page.evaluate("() => window._resultUpdates ?? 0")
    # With 150ms debounce, rapid typing produces far fewer updates than keystrokes
    assert updates < 7, f"Expected debounced updates (<7) but got {updates}"
