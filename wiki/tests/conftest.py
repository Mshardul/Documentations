import socket
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
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

    class Handler(SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=str(REPO_ROOT), **kwargs)

        def log_message(self, *args):
            pass

    server = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()

    yield f"http://localhost:{port}"

    server.shutdown()


@pytest.fixture
def wiki_page(page, base_url):
    page.goto(f"{base_url}/wiki/")
    page.wait_for_load_state("networkidle")
    return page
