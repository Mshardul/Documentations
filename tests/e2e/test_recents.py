"""WIKI-009: recently visited chips on wiki index (scoped per wiki)
WIKI-011: clear button removes all recents for the wiki
"""


def _visit_article(page, base_url, slug="caching"):
    page.goto(f"{base_url}/wiki/#system-design/{slug}")
    page.wait_for_selector("#view-content.active", timeout=10_000)


def _go_to_index(page, base_url):
    page.goto(f"{base_url}/wiki/#system-design")
    page.wait_for_selector("#view-index.active", timeout=5_000)


def test_recently_visited_chips_appear(page, base_url):
    """WIKI-009: after visiting an article, its chip appears in #recents-section on index."""
    _visit_article(page, base_url)
    _go_to_index(page, base_url)

    section = page.locator("#recents-section")
    assert not section.get_attribute("class").__contains__("hidden")
    chips = section.locator(".recent-chip").all()
    assert len(chips) >= 1


def test_recents_scoped_to_wiki(page, base_url):
    """WIKI-009: recents section hidden when localStorage key cleared for this wiki."""
    page.goto(f"{base_url}/wiki/#system-design")
    page.wait_for_selector("#view-index.active", timeout=5_000)
    page.evaluate("() => localStorage.removeItem('recents-system-design')")
    # Reload stays on #system-design → index view re-renders with empty recents.
    page.reload()
    page.wait_for_selector("#view-index.active", timeout=5_000)

    section = page.locator("#recents-section")
    assert "hidden" in (section.get_attribute("class") or "")


def test_clear_recents_removes_all_chips(page, base_url):
    """WIKI-011: clicking clear button on recents removes all chips."""
    _visit_article(page, base_url)
    _go_to_index(page, base_url)

    section = page.locator("#recents-section")
    section.wait_for(state="visible")

    clear_btn = section.locator(".recents-clear-btn")
    clear_btn.click()

    assert "hidden" in (section.get_attribute("class") or "")
