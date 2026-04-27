#!/bin/bash
if ! command -v lychee &>/dev/null; then
    echo "lychee not installed. Run: brew install lychee" >&2
    exit 1
fi
exec lychee --offline --no-progress --root-dir . "$@"
