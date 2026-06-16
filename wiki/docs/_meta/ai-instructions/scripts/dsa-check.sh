#!/usr/bin/env bash
# Terminal wrapper for the DSA rater filesystem pre-check (U8/U11/U12).
# Logic lives in dsa_check.py; this just runs it with the right python.
#
# Usage: ./dsa-check.sh <article.md> [<article.md> ...]
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ "$#" -lt 1 ]; then
  echo "usage: $0 <article.md> [<article.md> ...]" >&2
  exit 2
fi

py="$(command -v python3 || command -v python)"
exec "$py" "$here/dsa_check.py" "$@"
