"""
- hash-only URLs — no 404 on refresh
- breadcrumb links reliable
- Escape from content → wiki index; Escape closes search modal first
"""


def _go_to_article(page, base_url):
    page.goto(f"{base_url}/wiki/#system-design/caching")
    page.wait_for_selector("#view-content.active", timeout=10_000)


def test_hash_url_no_404(page, base_url):
    """fresh load of wiki index hash URL returns 200."""
    response = page.goto(f"{base_url}/wiki/#system-design")
    assert response is not None and response.status == 200


def test_hash_url_content_no_404(page, base_url):
    """fresh load of article hash URL returns 200."""
    response = page.goto(f"{base_url}/wiki/#system-design/caching")
    assert response is not None and response.status == 200


def test_breadcrumb_home_link_works(wiki_page, base_url):
    """home breadcrumb link navigates back to home view."""
    _go_to_article(wiki_page, base_url)
    wiki_page.wait_for_selector("#content-breadcrumb .breadcrumb-link")
    wiki_page.locator("#content-breadcrumb .breadcrumb-link").first.click()
    wiki_page.wait_for_selector("#view-home.active", timeout=5_000)


def test_breadcrumb_wiki_link_works(wiki_page, base_url):
    """wiki breadcrumb link navigates to wiki index view."""
    _go_to_article(wiki_page, base_url)
    links = wiki_page.locator("#content-breadcrumb .breadcrumb-link").all()
    assert len(links) >= 2
    links[1].click()
    wiki_page.wait_for_selector("#view-index.active", timeout=5_000)


def test_escape_closes_search_modal(wiki_page):
    """Escape closes open search modal (takes priority over index nav)."""
    wiki_page.keyboard.press("Meta+k")
    wiki_page.wait_for_selector("#global-search-modal:not(.hidden)")
    wiki_page.keyboard.press("Escape")
    modal = wiki_page.locator("#global-search-modal")
    assert "hidden" in modal.get_attribute("class")


def test_escape_from_content_goes_to_index(wiki_page, base_url):
    """Escape from content view (with modal closed) navigates to wiki index."""
    _go_to_article(wiki_page, base_url)
    wiki_page.keyboard.press("Escape")
    wiki_page.wait_for_selector("#view-index.active", timeout=5_000)
