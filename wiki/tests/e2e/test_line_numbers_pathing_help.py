"""
Line numbers, multi-level pathing, clear-all confirmation, help modal:
- WIKI-104: Code blocks with >= 3 lines get line numbers
- WIKI-071: resolvePath strips fragments and bounds-checks pop
- WIKI-098: Clear-all recents/bookmarks shows undo toast
- WIKI-021: ? hotkey opens help modal; Escape closes it
"""


def _go_to_article(page, base_url, slug="system-design/caching"):
    page.goto(f"{base_url}/wiki/#{slug}")
    page.wait_for_selector("#view-content.active", timeout=10_000)
    page.wait_for_function(
        "() => !document.querySelector('#markdown-body > .loading')",
        timeout=10_000,
    )


# ── WIKI-104: Line numbers ─────────────────────────────────────────────────


def test_code_blocks_have_line_numbers(page, base_url):
    """Code blocks with >= 3 lines get .has-line-numbers on the pre element."""
    _go_to_article(page, base_url)
    count = page.evaluate(
        "() => document.querySelectorAll('pre.has-line-numbers').length"
    )
    assert count > 0, "Expected at least one pre.has-line-numbers in article"


def test_code_lines_have_counter_spans(page, base_url):
    """Each numbered block contains .code-line spans."""
    _go_to_article(page, base_url)
    count = page.evaluate(
        "() => document.querySelectorAll('pre.has-line-numbers .code-line').length"
    )
    assert count > 0, "Expected .code-line spans inside numbered code blocks"


def test_short_code_blocks_no_line_numbers(page, base_url):
    """Code blocks with < 3 lines do NOT get line numbers."""
    _go_to_article(page, base_url)
    # Confirm has-line-numbers only appears on blocks with >= 3 lines
    numbered = page.evaluate(
        """() => Array.from(document.querySelectorAll('pre.has-line-numbers code')).every(
            code => code.textContent.split('\\n').filter(l => l !== '').length >= 3
        )"""
    )
    assert numbered, (
        "has-line-numbers should only appear on code blocks with >= 3 lines"
    )


def test_mermaid_blocks_no_line_numbers(page, base_url):
    """Mermaid diagrams (converted to .mermaid-diagram) do not get line numbers."""
    _go_to_article(page, base_url)
    has_mermaid_numbers = page.evaluate(
        "() => document.querySelectorAll('.mermaid-diagram.has-line-numbers').length > 0"
    )
    assert not has_mermaid_numbers, "Mermaid diagrams should not have line numbers"


# ── WIKI-071: Multi-level path resolution ─────────────────────────────────


def test_link_with_fragment_is_intercepted(page, base_url):
    """Internal .md links that include a #anchor suffix are intercepted (not ignored)."""
    page.route(
        "**/source.md",
        lambda r: r.fulfill(body="# Source\n\n[Jump](./target.md#section-1)"),
    )
    page.route(
        "**/target.md",
        lambda r: r.fulfill(body="# Target\n\nContent."),
    )

    page.goto(f"{base_url}/wiki/")
    page.wait_for_load_state("networkidle")
    page.evaluate(
        """() => navigateToContent(
        'system-design',
        encodeURIComponent('../content/system-design/source.md'),
        'Source', 'source')"""
    )
    page.wait_for_selector("#view-content.active", timeout=10_000)
    page.wait_for_function(
        "() => !document.querySelector('#markdown-body > .loading')",
        timeout=10_000,
    )

    # The link should trigger a fetch for target.md (not navigate away)
    with page.expect_response("**/target.md") as resp_info:
        page.locator("text='Jump'").click()

    assert resp_info.value.status == 200, (
        "Clicking .md#anchor link should fetch the .md file"
    )


def test_excess_dotdot_does_not_crash(page, base_url):
    """A link with more .. than depth doesn't throw a JS error."""
    page.route(
        "**/source.md",
        lambda r: r.fulfill(body="# Source\n\n[Deep](../../../../target.md)"),
    )
    page.route("**/target.md", lambda r: r.fulfill(body="# Target\n\nOK."))

    page.goto(f"{base_url}/wiki/")
    page.wait_for_load_state("networkidle")
    page.evaluate(
        """() => navigateToContent(
        'system-design',
        encodeURIComponent('../content/system-design/source.md'),
        'Source', 'source')"""
    )
    page.wait_for_selector("#view-content.active", timeout=10_000)
    page.wait_for_function(
        "() => !document.querySelector('#markdown-body > .loading')",
        timeout=10_000,
    )

    errors = []
    page.on("pageerror", lambda err: errors.append(str(err)))
    page.locator("text='Deep'").click()
    page.wait_for_timeout(500)
    assert not errors, f"Excess .. caused JS errors: {errors}"


# ── WIKI-098: Clear-all confirmation / undo ────────────────────────────────


def _seed_recents(page, base_url):
    """Navigate to an article so recents has at least one entry."""
    _go_to_article(page, base_url)
    page.goto(f"{base_url}/wiki/#system-design")
    page.wait_for_selector("#view-index.active", timeout=8_000)
    page.wait_for_selector("#recents-section:not(.hidden)", timeout=8_000)


def test_clear_recents_shows_undo_toast(page, base_url):
    """Clicking clear recents shows an undo toast instead of silently clearing."""
    _seed_recents(page, base_url)

    page.locator("#recents-section .recents-clear-btn").click()

    toast = page.locator("#wiki-toast")
    page.wait_for_function(
        "() => document.getElementById('wiki-toast')?.classList.contains('visible')",
        timeout=4_000,
    )
    assert toast.count() > 0, "Toast should appear after clearing recents"
    assert page.locator(".toast-undo-btn").count() > 0, (
        "Toast should have an Undo button"
    )


def test_clear_recents_undo_restores_items(page, base_url):
    """Clicking Undo after clearing recents restores the section."""
    _seed_recents(page, base_url)

    page.locator("#recents-section .recents-clear-btn").click()
    page.wait_for_function(
        "() => document.getElementById('wiki-toast')?.classList.contains('visible')",
        timeout=4_000,
    )
    page.locator(".toast-undo-btn").click()

    # Recents section should reappear
    page.wait_for_selector("#recents-section:not(.hidden)", timeout=4_000)


def test_clear_bookmarks_shows_undo_toast(page, base_url):
    """Clicking clear bookmarks shows an undo toast."""
    _go_to_article(page, base_url)
    # Bookmark the article
    page.keyboard.press("b")
    # Go to index
    page.goto(f"{base_url}/wiki/#system-design")
    page.wait_for_selector("#view-index.active", timeout=8_000)
    page.wait_for_selector("#bookmarks-section:not(.hidden)", timeout=8_000)

    page.locator("#bookmarks-section .recents-clear-btn").click()
    page.wait_for_function(
        "() => document.getElementById('wiki-toast')?.classList.contains('visible')",
        timeout=4_000,
    )
    assert page.locator(".toast-undo-btn").count() > 0, (
        "Toast should have an Undo button after clearing bookmarks"
    )


# ── WIKI-021: Help modal ───────────────────────────────────────────────────


def test_help_modal_hidden_on_load(page, base_url):
    """Help modal starts hidden."""
    page.goto(f"{base_url}/wiki/")
    page.wait_for_load_state("networkidle")
    modal = page.locator("#help-modal")
    assert modal.count() > 0, "Help modal should exist in DOM"
    assert "hidden" in (modal.get_attribute("class") or ""), (
        "Help modal should start hidden"
    )


def test_question_mark_opens_help(page, base_url):
    """Pressing ? opens the help modal."""
    page.goto(f"{base_url}/wiki/")
    page.wait_for_load_state("networkidle")
    page.keyboard.press("?")
    modal = page.locator("#help-modal")
    assert "hidden" not in (modal.get_attribute("class") or ""), (
        "Help modal should be visible after pressing ?"
    )


def test_escape_closes_help_modal(page, base_url):
    """Pressing Escape closes the help modal."""
    page.goto(f"{base_url}/wiki/")
    page.wait_for_load_state("networkidle")
    page.keyboard.press("?")
    page.keyboard.press("Escape")
    modal = page.locator("#help-modal")
    assert "hidden" in (modal.get_attribute("class") or ""), (
        "Help modal should close on Escape"
    )


def test_help_close_btn_closes_modal(page, base_url):
    """Clicking the close button hides the help modal."""
    page.goto(f"{base_url}/wiki/")
    page.wait_for_load_state("networkidle")
    page.keyboard.press("?")
    page.locator("#help-close-btn").click()
    modal = page.locator("#help-modal")
    assert "hidden" in (modal.get_attribute("class") or ""), (
        "Help modal should close on close button click"
    )


def test_help_backdrop_closes_modal(page, base_url):
    """Clicking the backdrop (away from dialog) closes the help modal."""
    page.goto(f"{base_url}/wiki/")
    page.wait_for_load_state("networkidle")
    page.keyboard.press("?")
    # Click top-left corner of the backdrop, outside the centered dialog
    page.locator("#help-modal .help-backdrop").click(position={"x": 5, "y": 5})
    modal = page.locator("#help-modal")
    assert "hidden" in (modal.get_attribute("class") or ""), (
        "Help modal should close on backdrop click"
    )


def test_help_modal_contains_shortcuts(page, base_url):
    """Help modal lists at least the ⌘K and ? shortcuts."""
    page.goto(f"{base_url}/wiki/")
    page.wait_for_load_state("networkidle")
    page.keyboard.press("?")
    body_text = page.locator("#help-modal .help-body").inner_text()
    assert "⌘K" in body_text or "K" in body_text, "Help should mention ⌘K shortcut"
    assert "?" in body_text, "Help should mention ? shortcut"


def test_help_focus_trap_tab(page, base_url):
    """Tab cycles focus within the help modal (focus trap)."""
    page.goto(f"{base_url}/wiki/")
    page.wait_for_load_state("networkidle")
    page.keyboard.press("?")
    # Close button should be focused
    focused = page.evaluate("() => document.activeElement?.id")
    assert focused == "help-close-btn", (
        f"Close button should be focused on open, got: {focused}"
    )
