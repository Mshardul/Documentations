"""
CDN script Subresource Integrity (SRI) attributes
"""


def test_cdn_scripts_have_integrity_attribute(page, base_url):
    """Every CDN <script> tag carries a sha-based integrity (SRI) hash."""
    page.goto(f"{base_url}/wiki/")
    page.wait_for_load_state("domcontentloaded")

    cdn_scripts = page.evaluate(
        """() => [...document.querySelectorAll('script[src]')]
            .filter(s =>
                s.getAttribute('src').includes('cdn.jsdelivr') ||
                s.getAttribute('src').includes('cdnjs.cloudflare'))
            .map(s => ({
                src: s.getAttribute('src'),
                integrity: s.getAttribute('integrity') || ''
            }))"""
    )
    assert cdn_scripts, "No CDN script tags found in index.html"
    for script in cdn_scripts:
        assert script["integrity"], (
            f"Missing integrity attribute on CDN script: {script['src']}"
        )


def test_cdn_scripts_have_crossorigin_anonymous(page, base_url):
    """Every CDN <script> tag has crossorigin=anonymous so SRI checks can run."""
    page.goto(f"{base_url}/wiki/")
    page.wait_for_load_state("domcontentloaded")

    cdn_scripts = page.evaluate(
        """() => [...document.querySelectorAll('script[src]')]
            .filter(s =>
                s.getAttribute('src').includes('cdn.jsdelivr') ||
                s.getAttribute('src').includes('cdnjs.cloudflare'))
            .map(s => ({
                src: s.getAttribute('src'),
                crossorigin: s.getAttribute('crossorigin') || ''
            }))"""
    )
    assert cdn_scripts, "No CDN script tags found in index.html"
    for script in cdn_scripts:
        assert script["crossorigin"] == "anonymous", (
            f"Expected crossorigin=anonymous on {script['src']}, got '{script['crossorigin']}'"
        )
