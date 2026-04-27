# CI & Pre-commit Hooks

## Pre-commit Hooks (`.pre-commit-config.yaml`)

Local hooks run on every commit. CI uses `.pre-commit-config.ci.yaml` (check-only, no auto-fix).

Top-level `exclude: ^shared/highlight/` in both configs prevents any hook from touching vendored library files.

| Hook                      | Description                                                                                                           |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `trailing-whitespace`     | Strips trailing whitespace from all files.                                                                            |
| `end-of-file-fixer`       | Ensures every file ends with a single newline.                                                                        |
| `check-yaml`              | Validates YAML syntax.                                                                                                |
| `check-added-large-files` | Blocks commits that add unexpectedly large files.                                                                     |
| `check-merge-conflict`    | Catches stray `<<<<<<` conflict markers left in files.                                                                |
| `detect-private-key`      | Blocks accidental commits of private keys or secrets.                                                                 |
| `check-json`              | Validates JSON syntax across all `.json` files.                                                                       |
| `check-case-conflict`     | Catches filename casing issues that break case-insensitive filesystems.                                               |
| `no-commit-to-branch`     | Prevents direct commits to `main` (local enforcement only).                                                           |
| `ruff`                    | Lints Python with ruff; `--extend-select I` covers import sorting (replaces isort).                                   |
| `ruff-format`             | Formats Python with ruff's built-in formatter.                                                                        |
| `prettier`                | Formats JS, HTML, CSS, YAML, and JSON.                                                                                |
| `markdownlint`            | Enforces Markdown style rules via `.markdownlint.json`.                                                               |
| `typos`                   | Spell-checks source files; auto-fixes typos. False positives managed in `.typos.toml` under `[default.extend-words]`. |

---

## GitHub Actions CI (`.github/workflows/lint.yml`)

Triggers on push and PR to `main`.

| Job          | Description                                                                                      |
| ------------ | ------------------------------------------------------------------------------------------------ |
| `lint`       | Runs all pre-commit hooks in check-only mode via `.pre-commit-config.ci.yaml` on full file tree. |
| `dead-links` | Runs `lychee` in offline mode to check for broken links in all `.md` and `.html` files.          |
