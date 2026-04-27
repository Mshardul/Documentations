"""
- search button on home view
- article count defaults to 0, not ellipsis
"""


def test_search_button_visible_on_home(wiki_page):
    """search button present and visible in home topbar."""
    btn = wiki_page.locator(".home-topbar .topbar-search-btn")
    assert btn.is_visible()


def test_search_button_opens_modal(wiki_page):
    """clicking search button opens global search modal."""
    wiki_page.locator(".home-topbar .topbar-search-btn").click()
    modal = wiki_page.locator("#global-search-modal")
    assert not modal.get_attribute("class").__contains__("hidden")


def test_article_count_never_ellipsis(wiki_page):
    """wiki card count shows '0 articles' before async load, never '… articles'."""
    count_el = wiki_page.locator(".wiki-card-count").first
    text = count_el.inner_text()
    assert "…" not in text
    assert "articles" in text


def test_article_count_updates_to_nonzero(wiki_page):
    """article count eventually resolves to a real number."""
    count_el = wiki_page.locator(".wiki-card-count").first
    wiki_page.wait_for_function(
        "() => !document.querySelector('.wiki-card-count').textContent.includes('0 articles')",
        timeout=10_000,
    )
    text = count_el.inner_text()
    assert "articles" in text
    assert "0 articles" not in text
