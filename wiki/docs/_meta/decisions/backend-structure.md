# Backend Structure — Decisions

`wiki-be` — Python + FastAPI. Project layout, tiers, tooling, config.
Status: **design locked, not yet implemented.** See [auth.md](./auth.md) for the API/auth design this serves.

---

## Tooling

- **Package manager: `uv`** — fast, modern, current direction. `pyproject.toml`.
- **Framework:** FastAPI. **ORM:** SQLAlchemy 2.0 + Alembic. **DB:** SQLite. (See auth.md §4.)
- **Config:** `pydantic-settings`, env-driven.

---

## Architecture — strict 3-tier, split by domain

Tiers: **router (HTTP) → service (logic) → repository (data)**. Each domain (`auth`, `sync`) has its own file in every layer.

```
app/
  main.py                  # entry: mount routers, CORS, startup
  config.py                # env settings (pydantic-settings)

  db/
    session.py             # engine, SessionLocal, Base, get_db
    models/
      __init__.py
      user.py              # users, sessions, email_verifications
      sync.py              # bookmarks, recents, reads
      # highlights.py      # v1

  schemas/                 # API contract (Pydantic) — NOT db-shaped
    auth.py                # register/login/me/verify shapes
    sync.py                # bookmark/recent/read/import shapes

  services/                # tier 2 — business logic
    auth.py                # register, verify, login, session create/validate
    sync.py                # item ops, import-merge, recents-trim

  repositories/            # tier 3 — ONLY layer touching the DB session
    user.py
    sync.py

  core/                    # shared infra (not a domain, not a tier)
    security.py            # hash, password-policy validate, token gen/hash
    deps.py                # get_current_user, get_db wiring

  comms/                   # shared infra — outbound communication
    email.py               # Resend send_verification_email

  routers/                 # tier 1 — thin HTTP, calls services
    auth.py
    sync.py

migrations/                # Alembic
tests/
.env.example
pyproject.toml
fly.toml
Dockerfile
```

### Tier rules

- **Router** — no business logic, no DB. HTTP ↔ service only. Uses schemas for in/out.
- **Service** — all logic, no raw SQL/session. Calls repositories.
- **Repository** — the only layer that touches the DB session. Returns models.
- **Schemas** — cross the router boundary only. Services/repos use models or plain types.

### Request flow

```
routers/auth.py  →  services/auth.py  →  repositories/user.py  →  db/models/user.py
   (HTTP)              (logic)               (DB access)             (ORM tables)
```

### Why this shape

- `schemas/` is a **peer folder**, not inside `db/` — schemas are the API contract, deliberately distinct from DB models (the reason we chose SQLAlchemy over SQLModel; see auth.md §4).
- `models/` split by domain (`user.py`, `sync.py`) — same split-by-domain rule as every other tier.
- `core/` + `comms/` sit **outside** the per-domain tiers — cross-cutting infra, shared by all domains.
- `main.py` + `config.py` stay flat at `app/` root — entry + settings, not part of any group.

---

## Env vars (`.env`, never committed; `.env.example` documents them)

```
DATABASE_URL=sqlite:///./data/wiki.db
RESEND_API_KEY=...
SESSION_SECRET=...           # session/verification token generation
FRONTEND_URL=https://...     # CORS allow-origin + verify-redirect target
BACKEND_URL=https://...      # builds the verify link in emails
COOKIE_DOMAIN=...            # cross-origin session cookie
ENV=dev|prod
```

---

## Cross-cutting

### CORS (cross-origin cookie auth)

FE and BE are different origins in v0 → CORS required. With cookies the config is strict — all four must align or auth breaks:

- **BE** (`CORSMiddleware`): `allow_origins=[FRONTEND_URL]` (**exact origin, never `*` with credentials**), `allow_credentials=True`, `allow_methods=["GET","POST","DELETE","OPTIONS"]`, `allow_headers=["Content-Type"]`.
- **FE:** every fetch uses `credentials: "include"`.
- **Cookie:** `SameSite=None; Secure` (auth.md §6).

**v0 = CORS** (zero infra, dev/single-user, no domain yet). **Target once a custom domain is bought: consolidate to same-origin** (FE at `wiki.com`, BE at `wiki.com/api` via rewrite) → eliminates CORS entirely, `SameSite=Lax` works, simpler cookies. The domain is needed anyway for real-user email, so migrate then.

### Error response format

Nested envelope, in addition to the correct HTTP status:

```json
{
  "error": {
    "code": "EMAIL_EXISTS",
    "message": "An account with this email already exists."
  }
}
```

- `code` = stable machine string (FE switches on it, never on message text).
- `message` = human-readable, FE can show directly.
- Nested shape leaves room for `details` (see weak-password below).
- One FastAPI exception handler maps app exceptions → this envelope.

Initial codes: `EMAIL_EXISTS`, `INVALID_CREDENTIALS`, `EMAIL_NOT_VERIFIED`, `WEAK_PASSWORD`, `INVALID_TOKEN`, `UNAUTHENTICATED`, `UNKNOWN_FIELD`.

### Validation

- **Pydantic** validates request bodies (types, required) → reshape the verbose 422 into the **same envelope with human-readable messages** (never Pydantic's raw dump).
- **Heavy FE pre-checks** notify the user beforehand; BE validation is the backstop, rarely hit.
- **Password policy** (5 rules) lives in `core/security.py`, called by `services/auth.py`. On failure → `WEAK_PASSWORD` with `error.details` = failed-rule list (e.g. `["min_length","needs_digit"]`) so FE can mark them.
- **Email:** Pydantic `EmailStr` + lowercase-normalize in service.
- **Unknown fields: reject** (`model_config` forbid) → `UNKNOWN_FIELD`. Both sides are ours; an extra field = a client bug, fail loud in dev rather than silently drop.

---

## Deferred (non-blocking)

- `fly.toml` / `Dockerfile` specifics — infra section.
- Same-origin consolidation when custom domain is bought (see CORS above).
- Split schemas/services further only when a domain file grows (YAGNI).
