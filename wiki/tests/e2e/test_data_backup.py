"""
- Import/Export JSON data backup in settings.
"""

import json


def _open_settings(page):
    page.locator("[title='Preferences (,)']").first.click()
    page.wait_for_function(
        "() => !document.getElementById('prefs-modal').classList.contains('hidden')"
    )
    page.locator("[data-action='prefs-tab'][data-tab='advanced']").click()
    page.wait_for_selector("#prefs-panel-advanced.active")


# ── Export ─────────────────────────────────────────────────────────────────────


def test_export_button_triggers_download(page, base_url):
    """Clicking 'Export Backup' triggers a file download."""
    page.goto(f"{base_url}/wiki/")
    page.wait_for_load_state("networkidle")
    _open_settings(page)

    with page.expect_download() as dl_info:
        page.locator("button:has-text('Export')").click()

    download = dl_info.value
    assert download.suggested_filename.startswith("wiki-backup-")
    assert download.suggested_filename.endswith(".json")


def test_export_json_contains_expected_keys(page, base_url):
    """Exported JSON contains version, bookmarks, recents, settings keys."""
    page.goto(f"{base_url}/wiki/")
    page.wait_for_load_state("networkidle")
    _open_settings(page)

    with page.expect_download() as dl_info:
        page.locator("button:has-text('Export')").click()

    download = dl_info.value
    path = download.path()
    with open(path) as f:
        data = json.load(f)

    assert data.get("version") == 1, "Export JSON missing version:1"
    for key in ("bookmarks", "recents", "settings"):
        assert key in data, f"Export JSON missing key: {key}"
    assert "read" not in data, "Export JSON should not have legacy 'read' key"


# ── Import ─────────────────────────────────────────────────────────────────────


def test_import_restores_settings(page, base_url):
    """Importing a valid v1 backup file restores settings to localStorage."""
    import os
    import tempfile

    backup = {
        "version": 1,
        "bookmarks": "[]",
        "recents": "[]",
        "settings": json.dumps(
            {
                "preset": "light",
                "theme": "light",
                "accentId": "emerald",
                "font": "Lora",
                "fontSize": "L",
                "contentWidth": "Wide",
            }
        ),
    }

    with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as tmp:
        json.dump(backup, tmp)
        tmp_path = tmp.name

    try:
        page.goto(f"{base_url}/wiki/")
        page.wait_for_load_state("networkidle")
        _open_settings(page)

        with page.expect_navigation(timeout=10_000):
            page.locator("#import-upload").set_input_files(tmp_path)

        page.wait_for_load_state("networkidle")

        stored = page.evaluate(
            "() => JSON.parse(localStorage.getItem('wiki-settings') || 'null')"
        )
        assert stored is not None, "Settings not written after import"
        assert stored.get("font") == "Lora"
        assert stored.get("theme") == "light"
    finally:
        os.unlink(tmp_path)


def test_import_invalid_file_shows_toast(page, base_url):
    """Importing a non-JSON file shows a toast error, does not crash."""
    import os
    import tempfile

    with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as tmp:
        tmp.write("not valid json {{{")
        tmp_path = tmp.name

    try:
        page.goto(f"{base_url}/wiki/")
        page.wait_for_load_state("networkidle")
        _open_settings(page)

        page.locator("#import-upload").set_input_files(tmp_path)
        page.wait_for_selector("#wiki-toast.visible", timeout=3000)

        toast_text = page.locator("#wiki-toast").inner_text()
        assert "invalid" in toast_text.lower() or "failed" in toast_text.lower(), (
            f"Toast did not show error message. Got: {toast_text}"
        )
    finally:
        os.unlink(tmp_path)


def test_import_version_mismatch_shows_warning_toast(page, base_url):
    """Importing a backup with unknown version shows a warning toast with undo/confirm."""
    import os
    import tempfile

    backup = {
        "version": 99,
        "bookmarks": "[]",
        "recents": "[]",
        "settings": "{}",
    }

    with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as tmp:
        json.dump(backup, tmp)
        tmp_path = tmp.name

    try:
        page.goto(f"{base_url}/wiki/")
        page.wait_for_load_state("networkidle")
        _open_settings(page)

        page.locator("#import-upload").set_input_files(tmp_path)
        page.wait_for_selector("#wiki-toast.visible", timeout=3000)

        toast_text = page.locator("#wiki-toast").inner_text()
        assert "version" in toast_text.lower() or "format" in toast_text.lower(), (
            f"Toast did not show version warning. Got: {toast_text}"
        )
        # Undo button = "Import anyway" callback
        assert page.locator(".toast-undo-btn").is_visible()
    finally:
        os.unlink(tmp_path)
