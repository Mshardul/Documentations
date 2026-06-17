# Infra & Deploy — Decisions

How v0 goes from zero to live. FE + BE hosting, deploy flow, backup, cost guard.
Status: **design locked, not yet executed.** See [auth.md](./auth.md), [backend-structure.md](./backend-structure.md), [fe-be-split.md](./fe-be-split.md).

---

## Order of operations

1. **Repo split first** (before any BE code) — see [fe-be-split.md](./fe-be-split.md) "Commands to execute".
2. Build BE in `wiki-be`, deploy to Fly.
3. Deploy FE from `wiki-fe` to GitHub Pages, point at BE.
4. Verify cross-origin cookie end-to-end.

---

## BE deploy — Fly.io

- **Containerized:** `Dockerfile` (Python + uv + FastAPI + uvicorn) + `fly.toml`.
- **Persistent volume for SQLite** — mount at `/data`, `DATABASE_URL=sqlite:////data/wiki.db`. **Mandatory** — without a volume SQLite resets every deploy.
- **Secrets** via `fly secrets set` (never in repo/image), injected as env: `RESEND_API_KEY`, `SESSION_SECRET`.
- **HTTPS** free on `*.fly.dev`. App enforces redirect + `Secure` cookie in prod (auth.md §12).
- **Migrations:** Alembic runs on deploy via Fly **release command**, before the app starts.
- **Single region, single machine** (free allowance). Known ceiling: SQLite + single volume binds to one machine — can't scale horizontally. Fine at this scale.

## FE deploy — GitHub Pages

- Static, no build → Pages serves repo files as-is. Free, repo-native. (Netlify possible later; Pages to begin.)
- `BACKEND_URL` hostname-detects prod fly.dev (auth.md §10).
- **Service worker:** bump cache version on any asset-changing deploy (existing project rule) — auth adds `js/api.js` etc, so bump on first auth deploy. Also add a **proper cache expiration policy** for the SW cache (not just version-bump invalidation).

## Cross-origin cookie — verify end-to-end (not just configured)

Both origins are HTTPS (Pages + Fly) → `SameSite=None; Secure` works. Confirm live:

- BE `allow_origins=[FE-origin]`, `allow_credentials=True`; FE fetch `credentials:"include"`.
- Log in from deployed FE → cookie set (devtools) → a sync POST carries it → 401 path flips to logged-out.

---

## SQLite backup

- **v0: manual** — copy the SQLite file off the volume occasionally. Acceptable for single user.
- **v2: cron dump** — periodic `sqlite3 .backup` → off-box copy.
- Litestream (continuous stream to object storage) = later option if continuous PITR is wanted.

## Cost guard — $0 is the floor

- **Hard spend limit / billing alert in Fly dashboard** — guarantee no charge beyond the free allowance. Non-negotiable: zero bill is the baseline.

---

## Deferred

- Custom domain → enables same-origin (auth.md §10) + real-user email (auth.md §9a).
- Litestream / richer backup; multi-region (only if scale ever demands — unlikely).
