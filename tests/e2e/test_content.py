"""WIKI-028: copy button present on all code blocks in article content."""


def test_copy_buttons_on_code_blocks(page, base_url):
    """WIKI-028: every <pre> block in article body has a .copy-btn child."""
    page.goto(f"{base_url}/wiki/#system-design/caching")
    page.wait_for_selector("#view-content.active", timeout=10_000)
    page.wait_for_selector("#markdown-body pre", timeout=8_000)

    result = page.evaluate("""() => {
        const pres = document.querySelectorAll('#markdown-body pre');
        const missing = [...pres].filter(p => !p.querySelector('.copy-btn'));
        return { total: pres.length, missing: missing.length };
    }""")

    assert result["total"] > 0, "No code blocks found in caching article"
    assert result["missing"] == 0, (
        f"{result['missing']} of {result['total']} code blocks missing .copy-btn"
    )


def test_copy_button_writes_to_clipboard(page, base_url):
    """WIKI-028: clicking .copy-btn copies block text to clipboard."""
    page.context.grant_permissions(["clipboard-read", "clipboard-write"])
    page.goto(f"{base_url}/wiki/#system-design/caching")
    page.wait_for_selector("#markdown-body pre .copy-btn", timeout=10_000)

    pre_text = page.evaluate(
        "() => document.querySelector('#markdown-body pre code').innerText"
    )
    page.locator("#markdown-body pre .copy-btn").first.click()

    clipboard = page.evaluate("() => navigator.clipboard.readText()")
    assert clipboard.strip() == pre_text.strip()
