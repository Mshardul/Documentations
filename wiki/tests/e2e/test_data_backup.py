"""
- Import/Export JSON data backup in settings.
"""

import json


def _open_settings(page):
    page.locator("[title='Settings']").first.click()
    page.wait_for_function(
        "() => !document.getElementById('settings-panel').classList.contains('hidden')"
    )


# ── Export ─────────────────────────────────────────────────────────────────────


def test_export_button_triggers_download(page, base_url):
    """Clicking 'Export Backup' triggers a file download."""
    page.goto(f"{base_url}/wiki/")
    page.wait_for_load_state("networkidle")
    _open_settings(page)

    with page.expect_download() as dl_info:
        page.locator("button:has-text('Export Backup')").click()

    download = dl_info.value
    assert download.suggested_filename.startswith("wiki-backup-")
    assert download.suggested_filename.endswith(".json")


def test_export_json_contains_expected_keys(page, base_url):
    """Exported JSON file contains bookmarks, recents, read, settings keys."""
    page.goto(f"{base_url}/wiki/")
    page.wait_for_load_state("networkidle")
    _open_settings(page)

    with page.expect_download() as dl_info:
        page.locator("button:has-text('Export Backup')").click()

    download = dl_info.value
    path = download.path()
    with open(path) as f:
        data = json.load(f)

    for key in ("bookmarks", "recents", "read", "settings"):
        assert key in data, f"Export JSON missing key: {key}"


# ── Import ─────────────────────────────────────────────────────────────────────


def test_import_restores_settings(page, base_url):
    """Importing a backup file restores settings to localStorage."""
    import os
    import tempfile

    backup = {
        "bookmarks": "[]",
        "recents": "[]",
        "read": "[]",
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

        page.on("dialog", lambda d: d.accept())
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


def test_import_invalid_file_shows_alert(page, base_url):
    """Importing a non-JSON file shows an alert, does not crash."""
    import os
    import tempfile

    with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as tmp:
        tmp.write("not valid json {{{")
        tmp_path = tmp.name

    try:
        page.goto(f"{base_url}/wiki/")
        page.wait_for_load_state("networkidle")
        _open_settings(page)

        alert_messages = []
        page.on("dialog", lambda d: (alert_messages.append(d.message), d.accept()))
        page.locator("#import-upload").set_input_files(tmp_path)
        page.wait_for_timeout(500)

        assert any("Invalid" in m or "invalid" in m for m in alert_messages), (
            f"No error alert shown for invalid backup. Got: {alert_messages}"
        )
    finally:
        os.unlink(tmp_path)
