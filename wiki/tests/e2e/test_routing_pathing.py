"""
Dynamic document.title updates on every view change.
Robust resolvePath for nested ../../ links.
404 history fallback strips bad hashes on shallow history.
"""


def _go_to_article(page, base_url):
    page.goto(f"{base_url}/wiki/#system-design/caching")
    page.wait_for_selector("#view-content.active", timeout=10_000)


# ── Dynamic Page Title ─────────────────────────────────────────────


def test_title_updates_on_home(wiki_page):
    """Home view sets document.title correctly."""
    assert "Home" in wiki_page.title()


def test_title_updates_on_index(page, base_url):
    """Wiki index view sets document.title to the wiki name."""
    page.goto(f"{base_url}/wiki/#system-design")
    page.wait_for_selector("#view-index.active", timeout=5_000)
    title = page.title()
    assert "System Design" in title


def test_title_updates_on_content(page, base_url):
    """Article view sets document.title to the article title."""
    _go_to_article(page, base_url)
    title = page.title()
    # Title format is "Title | Wiki App"
    assert "Caching" in title


# ── Multi-level Path Resolution ────────────────────────────────────


def test_deep_path_resolution(page, base_url):
    """Internal links with ../../ resolve correctly and fetch the right file."""
    # Mock a deep relative link: ../../target.md
    page.route(
        "**/mock.md", lambda r: r.fulfill(body="# Mock\n\n[Deep Link](../../target.md)")
    )
    page.route("**/target.md", lambda r: r.fulfill(body="# Target Article\n\nContent."))

    # Navigate to mock article
    page.goto(f"{base_url}/wiki/")
    page.wait_for_load_state("networkidle")
    page.evaluate("""() => navigateToContent(
        'system-design',
        encodeURIComponent('../content/system-design/mock.md'),
        'Mock', 'mock')""")
    page.wait_for_selector("#view-content.active", timeout=10_000)

    # Click link and verify the fetch hits the resolved target
    with page.expect_response("**/target.md") as resp_info:
        page.locator("text='Deep Link'").click()

    assert resp_info.value.status == 200
    page.wait_for_selector("#markdown-body h1", timeout=5_000)
    assert "Target Article" in page.locator("#markdown-body h1").inner_text()


# ── 404 History Fallback ───────────────────────────────────────────


def test_404_fallback_on_bad_wiki(page, base_url):
    """Bad wiki ID on fresh load redirects to Home and cleans URL."""
    # Fresh load with non-existent wiki
    page.goto(f"{base_url}/wiki/#non-existent-wiki")
    page.wait_for_load_state("networkidle")

    # Should render home view
    assert page.locator("#view-home.active").count() == 1
    # URL should not contain the bad hash
    assert "non-existent-wiki" not in page.url


def test_404_fallback_on_bad_article(page, base_url):
    """Valid wiki + bad article slug on fresh load redirects to Home."""
    page.goto(f"{base_url}/wiki/#system-design/this-does-not-exist")
    page.wait_for_load_state("networkidle")

    assert page.locator("#view-home.active").count() == 1
    assert "this-does-not-exist" not in page.url
