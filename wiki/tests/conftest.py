import socket
import subprocess
import time
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).parent.parent.parent


def _free_port() -> int:
    with socket.socket() as s:
        s.bind(("", 0))
        return s.getsockname()[1]


@pytest.fixture
def browser_context_args(browser_context_args):
    # Block service workers so page.route() mock intercepts work correctly.
    # The SW intercepts all .md fetches before Playwright sees them otherwise.
    return {**browser_context_args, "service_workers": "block"}


@pytest.fixture(scope="session")
def base_url():
    port = _free_port()
    proc = subprocess.Popen(
        ["python3", "-m", "http.server", str(port)],
        cwd=REPO_ROOT,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    time.sleep(0.8)
    yield f"http://localhost:{port}"
    proc.terminate()


@pytest.fixture
def wiki_page(page, base_url):
    page.goto(f"{base_url}/wiki/")
    page.wait_for_load_state("networkidle")
    return page
