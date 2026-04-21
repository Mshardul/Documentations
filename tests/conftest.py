import socket
import subprocess
import time
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).parent.parent


def _free_port() -> int:
    with socket.socket() as s:
        s.bind(("", 0))
        return s.getsockname()[1]


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
