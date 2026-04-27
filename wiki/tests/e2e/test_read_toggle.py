"""
- Mark as unread toggle — button presence, state, toggle, persistence.
"""

ARTICLE_HASH = "system-design/caching"


def _go_to_article(page, base_url):
    page.goto(f"{base_url}/wiki/")
    page.wait_for_load_state("networkidle")
    page.evaluate("() => localStorage.removeItem('wiki-read')")
    page.goto(f"{base_url}/wiki/#{ARTICLE_HASH}")
    page.wait_for_selector("#view-content.active", timeout=10_000)
    page.wait_for_selector("#markdown-body h1, #markdown-body h2", timeout=8_000)


# ── presence ───────────────────────────────────────────────────────────────────


def test_read_btn_present_in_content_topbar(page, base_url):
    """#content-read-btn exists in content topbar."""
    _go_to_article(page, base_url)
    assert page.locator("#content-read-btn").count() == 1


def test_read_btn_initial_title_is_mark_as_read(page, base_url):
    """button title is 'Mark as read' when article not yet read."""
    _go_to_article(page, base_url)
    title = page.locator("#content-read-btn").get_attribute("title")
    assert title == "Mark as read"


def test_read_btn_initially_not_active(page, base_url):
    """button does not have .active class when article is unread."""
    _go_to_article(page, base_url)
    cls = page.locator("#content-read-btn").get_attribute("class")
    assert "active" not in cls


# ── mark as read ───────────────────────────────────────────────────────────────


def test_clicking_read_btn_marks_article_read(page, base_url):
    """clicking button adds article path to wiki-read in localStorage."""
    _go_to_article(page, base_url)
    page.locator("#content-read-btn").click()

    read_set = page.evaluate(
        "() => JSON.parse(localStorage.getItem('wiki-read') || '[]')"
    )
    assert any("caching" in path for path in read_set)


def test_read_btn_becomes_active_after_click(page, base_url):
    """button gets .active class after clicking to mark as read."""
    _go_to_article(page, base_url)
    page.locator("#content-read-btn").click()
    cls = page.locator("#content-read-btn").get_attribute("class")
    assert "active" in cls


def test_read_btn_title_changes_to_mark_as_unread(page, base_url):
    """button title becomes 'Mark as unread' after marking read."""
    _go_to_article(page, base_url)
    page.locator("#content-read-btn").click()
    title = page.locator("#content-read-btn").get_attribute("title")
    assert title == "Mark as unread"


# ── mark as unread ─────────────────────────────────────────────────────────────


def test_clicking_again_marks_article_unread(page, base_url):
    """clicking button a second time removes article from wiki-read."""
    _go_to_article(page, base_url)
    page.locator("#content-read-btn").click()  # mark read
    page.locator("#content-read-btn").click()  # mark unread

    read_set = page.evaluate(
        "() => JSON.parse(localStorage.getItem('wiki-read') || '[]')"
    )
    assert not any("caching" in path for path in read_set)


def test_read_btn_loses_active_after_unmark(page, base_url):
    """button loses .active class after clicking to mark as unread."""
    _go_to_article(page, base_url)
    page.locator("#content-read-btn").click()  # mark read
    page.locator("#content-read-btn").click()  # mark unread
    cls = page.locator("#content-read-btn").get_attribute("class")
    assert "active" not in cls


def test_read_btn_title_reverts_after_unmark(page, base_url):
    """button title reverts to 'Mark as read' after unmarking."""
    _go_to_article(page, base_url)
    page.locator("#content-read-btn").click()  # mark read
    page.locator("#content-read-btn").click()  # mark unread
    title = page.locator("#content-read-btn").get_attribute("title")
    assert title == "Mark as read"


# ── persistence across navigation ──────────────────────────────────────────────


def test_read_state_persists_on_revisit(page, base_url):
    """article stays marked read when navigating away and back."""
    _go_to_article(page, base_url)
    page.locator("#content-read-btn").click()  # mark read

    # Go back to wiki index
    page.locator("#content-back-btn").click()
    page.wait_for_selector("#view-index.active", timeout=5_000)

    # Navigate back to article
    page.goto(f"{base_url}/wiki/#{ARTICLE_HASH}")
    page.wait_for_selector("#view-content.active", timeout=10_000)
    page.wait_for_selector("#content-read-btn", timeout=5_000)

    cls = page.locator("#content-read-btn").get_attribute("class")
    assert "active" in cls
