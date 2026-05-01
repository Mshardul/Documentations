"""
WIKI-062: PWA manifest linked in index.html, manifest.json valid.
WIKI-064: Parsed index cached in sessionStorage after first load.
WIKI-078: fetchText distinguishes 404 vs network errors.
"""

import json


def _go_to_index(page, base_url):
    page.goto(f"{base_url}/wiki/#system-design")
    page.wait_for_selector("#view-index.active", timeout=10_000)


# ── WIKI-062: PWA manifest ────────────────────────────────────────────────────


def test_manifest_link_present(page, base_url):
    """index.html must have a <link rel='manifest'> tag."""
    page.goto(f"{base_url}/wiki/")
    page.wait_for_load_state("domcontentloaded")

    href = page.evaluate("""() => {
        const el = document.querySelector('link[rel="manifest"]');
        return el ? el.getAttribute('href') : null;
    }""")
    assert href is not None, "No <link rel='manifest'> found in index.html"


def test_manifest_json_valid(page, base_url):
    """manifest.json must be valid JSON with required PWA fields."""
    response = page.goto(f"{base_url}/wiki/manifest.json")
    assert response.status == 200

    body = response.text()
    data = json.loads(body)

    assert "name" in data
    assert "short_name" in data
    assert "start_url" in data
    assert "display" in data
    assert data["display"] in ("standalone", "fullscreen", "minimal-ui")
    assert "icons" in data and len(data["icons"]) >= 1


# ── WIKI-064: sessionStorage index cache ──────────────────────────────────────


def test_index_cached_in_session_storage(page, base_url):
    """After loading wiki index, parsed sections stored in sessionStorage."""
    _go_to_index(page, base_url)
    page.wait_for_selector(
        "#index-sections:not(.index-sections--loading)", timeout=15_000
    )

    cached = page.evaluate("""() =>
        sessionStorage.getItem('wiki-index-cache-system-design')
    """)
    assert cached is not None, "Index not found in sessionStorage"

    sections = json.loads(cached)
    assert isinstance(sections, list) and len(sections) > 0
    assert "heading" in sections[0]
    assert "cards" in sections[0]


def test_index_cache_used_on_revisit(page, base_url):
    """Second index load reads from sessionStorage — no index.md network fetch."""
    _go_to_index(page, base_url)
    page.wait_for_selector(
        "#index-sections:not(.index-sections--loading)", timeout=15_000
    )

    # Track network requests on second visit
    requests = []
    page.on("request", lambda r: requests.append(r.url))

    # Navigate away and back
    page.goto(f"{base_url}/wiki/")
    page.wait_for_selector("#view-home.active", timeout=5_000)
    page.goto(f"{base_url}/wiki/#system-design")
    page.wait_for_selector(
        "#index-sections:not(.index-sections--loading)", timeout=15_000
    )

    index_fetches = [r for r in requests if "index.md" in r]
    assert len(index_fetches) == 0, (
        f"index.md was re-fetched on revisit: {index_fetches}"
    )


# ── WIKI-078: Specific fetch error messages ───────────────────────────────────


def test_404_shows_not_found_message(page, base_url):
    """A missing article shows a 404-specific error, not a generic one."""
    page.route("**/missing-article.md", lambda r: r.fulfill(status=404, body=""))

    page.goto(f"{base_url}/wiki/")
    page.wait_for_load_state("networkidle")
    page.evaluate("""() => navigateToContent(
        'system-design',
        encodeURIComponent('../content/system-design/missing-article.md'),
        'Missing', 'missing-article')""")
    page.wait_for_selector("#view-content.active", timeout=10_000)

    error_text = page.locator("#markdown-body .error").inner_text()
    assert "404" in error_text or "not found" in error_text.lower(), (
        f"Expected 404/not found message, got: {error_text!r}"
    )


def test_network_error_shows_connection_message(page, base_url):
    """A network failure shows a connection-specific error message."""
    page.route("**/network-fail.md", lambda r: r.abort("failed"))

    page.goto(f"{base_url}/wiki/")
    page.wait_for_load_state("networkidle")
    page.evaluate("""() => navigateToContent(
        'system-design',
        encodeURIComponent('../content/system-design/network-fail.md'),
        'NetFail', 'network-fail')""")
    page.wait_for_selector("#view-content.active", timeout=10_000)

    error_text = page.locator("#markdown-body .error").inner_text()
    assert "network" in error_text.lower() or "connection" in error_text.lower(), (
        f"Expected network/connection message, got: {error_text!r}"
    )
