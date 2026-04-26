"""WIKI-010: bookmarks shown as chips on wiki index, not on home page
WIKI-011: clear button removes all bookmarks for the wiki
"""


def _go_to_article(page, base_url):
    page.goto(f"{base_url}/wiki/#system-design/caching")
    page.wait_for_selector("#view-content.active", timeout=10_000)


def _bookmark_current(page):
    btn = page.locator("#content-bookmark-btn")
    btn.wait_for(state="visible")
    if "active" not in (btn.get_attribute("class") or ""):
        btn.click()


def _go_to_index(page, base_url):
    page.goto(f"{base_url}/wiki/#system-design")
    page.wait_for_selector("#view-index.active", timeout=5_000)


def test_bookmarks_not_on_home(page, base_url):
    """WIKI-010: home view has no bookmarks section."""
    page.goto(f"{base_url}/wiki/")
    page.wait_for_selector("#view-home.active", timeout=5_000)
    assert page.locator("#view-home #bookmarks-section").count() == 0


def test_bookmarks_appear_on_index(page, base_url):
    """WIKI-010: after bookmarking, chip appears in #bookmarks-section on wiki index."""
    _go_to_article(page, base_url)
    _bookmark_current(page)
    _go_to_index(page, base_url)

    section = page.locator("#bookmarks-section")
    assert not (section.get_attribute("class") or "").count("hidden")
    chips = section.locator(".recent-chip").all()
    assert len(chips) >= 1


def test_clear_bookmarks_removes_all(page, base_url):
    """WIKI-011: clicking clear button on bookmarks section hides it."""
    _go_to_article(page, base_url)
    _bookmark_current(page)
    _go_to_index(page, base_url)

    section = page.locator("#bookmarks-section")
    section.wait_for(state="visible")

    section.locator(".recents-clear-btn").click()
    assert "hidden" in (section.get_attribute("class") or "")
