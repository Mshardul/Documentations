# FE/BE Repo Split — Decisions

How the current single-folder wiki becomes two repos.
Status: **design locked, not yet executed.**

---

## Target layout

- **`wiki-fe`** — existing frontend code + its history. Files at repo root (no `wiki/` prefix).
- **`wiki-be`** — new, empty. Python + FastAPI backend.
- Two repos (not monorepo): cleaner separation, simpler per-side deploy, no future coupling.

---

## Extract `wiki-fe` — `git filter-repo`

Chosen over `git subtree split`: purpose-built for extraction, reparents `wiki/` to root, prunes commits that become empty, cleanest history.

Run on a **throwaway clone** — `filter-repo` rewrites history in place.

```bash
git clone <Documentation> /tmp/wiki-extract
cd /tmp/wiki-extract
git filter-repo --subdirectory-filter wiki   # keep only wiki/, move to root
git remote add origin <wiki-fe remote>
git push -u origin main
```

| Tool                | Verdict                                                                  |
| ------------------- | ------------------------------------------------------------------------ |
| `git filter-repo`   | **Chosen** — auto path-rewrite, prunes empty commits, GitHub-recommended |
| `git subtree split` | Works, but keeps merge noise, manual path rewrite                        |

---

## Scrub `wiki/` from `Documentation`

After extraction. Two options — decide at execution:

- **Simple delete** — `git rm -r wiki/` + commit. Gone going forward; old commits still contain files (repo size unchanged).
- **Full scrub** — `git filter-repo --path wiki/ --invert-paths` + force-push. Removed from all history, repo shrinks. Force-push ⇒ anyone with a clone must re-clone; safe if solo.

---

## Notes

- Only `wiki-fe` carries history; `wiki-be` starts fresh.
- If one commit touched both `wiki/` and other dirs, filter-repo keeps only the `wiki/` part — history stays sensible.
- See [auth.md](./auth.md) for the full personal-layer + backend design.

---

## Commands to execute (in order)

Run **before** any backend code — `wiki-be` should be born in its own repo.

Current state: remote `git@github.com:<username>/Documentations.git`, branch `main`, `wiki/` at repo root, `git-filter-repo` **not yet installed**.

```bash
# ── 0. Install git-filter-repo (one-time) ─────────────────────────
brew install git-filter-repo

# ── 1. Create the two empty GitHub repos first ────────────────────
#    On GitHub: create  <username>/wiki-fe  and  <username>/wiki-be  (empty, no README).

# ── 2. Extract wiki-fe from a THROWAWAY clone (never the real repo) ─
git clone git@github.com:<username>/Documentations.git /tmp/wiki-extract
cd /tmp/wiki-extract
git filter-repo --subdirectory-filter wiki      # keep only wiki/, reparent to root
git remote add origin git@github.com:<username>/wiki-fe.git
git push -u origin main

# ── 3. Initialise the empty backend repo ──────────────────────────
mkdir -p /tmp/wiki-be && cd /tmp/wiki-be
git init -b main
# (scaffold added later per backend-structure.md)
git remote add origin git@github.com:<username>/wiki-be.git
# first push happens once there's a commit

# ── 4. Scrub wiki/ from Documentation — choose ONE ────────────────
#    Option A — simple delete (history retains old files):
cd <path-to>/Documentations
git rm -r wiki/
git commit -m "Remove wiki (moved to wiki-fe repo)"
git push

#    Option B — full scrub from all history (repo shrinks, force-push):
git clone git@github.com:<username>/Documentations.git /tmp/doc-clean
cd /tmp/doc-clean
git filter-repo --path wiki/ --invert-paths
git remote add origin git@github.com:<username>/Documentations.git
git push --force
```

- **Decide A vs B at execution.** B rewrites history ⇒ re-clone needed anywhere the repo is checked out; safe if solo.
- After step 2 verify `wiki-fe` history/files at root before deleting anything from `Documentation`.
