# Auth & Personal Layer — Decisions

Decisions for adding login + per-user personal features to the wiki.
Status: **design locked, not yet implemented.** Source of truth until superseded.

---

## 1. Product model

- **Public wiki, optional account.** Anonymous users keep full read + offline experience unchanged.
- Login unlocks a **personal layer only** (notes, highlights, synced bookmarks). Never gates reading.
- Users **never edit articles.** Articles stay authored by us, in git. Users only add private overlay data.
- No social features in scope. Revisit after v3.

---

## 2. Feature roadmap

| Version | Features                                                                                                                        |
| ------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **v0**  | Auth (register → verify email → login → session) · sync existing local features: bookmarks, recents, read-tracking              |
| **v1**  | Highlights (text-anchored, multi-color)                                                                                         |
| **v2**  | Sticky notes / inline comments (anchored) · Profile                                                                             |
| **v3**  | Margin notes · Collections/folders · Tags · Standalone notes · Spaced repetition/flashcards (loose backlog, split when reached) |
| post-v3 | Social — discuss later                                                                                                          |

- Sync pulled into v0 deliberately: it's the test that auth + DB + per-user data works, with **zero text-anchoring risk**.
- Highlights start clean in v1 because **text-anchoring is the hardest problem** in the whole roadmap (anchor must survive article edits in git).

---

## 3. Core architecture split

Two stores, each the right tool — **no content in the DB.**

| Data                               | Lives in     | Why                                                            |
| ---------------------------------- | ------------ | -------------------------------------------------------------- |
| Wiki articles (`.md`)              | **Git repo** | Already version-controlled; app reads directly; git IS the VCS |
| Users, sessions, notes, highlights | **DB**       | Dynamic, private, per-user; git is wrong tool for runtime data |

- Rejected: "DB mirrors content from GitHub." Adds a sync job, two sources of truth, sync bugs — buys nothing (app already reads `.md` from repo for free).
- Article identity in the DB = `(wiki_id, path)`, **not a foreign key** — articles aren't in the DB. See §5 for column detail.

---

## 4. Tech stack

| Layer      | Choice                                            | Why                                                                                                                                                                                |
| ---------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend   | Existing vanilla-JS SPA → `wiki-fe`               | No rewrite; keep no-build, offline-first strengths                                                                                                                                 |
| Backend    | **Python + FastAPI** → `wiki-be`                  | Known language; async; Pydantic validation; latency comes from network/payload, not language                                                                                       |
| Database   | **SQLite**                                        | Tiny low-concurrency data; a single file = own it, portable, $0, no lock-in; faster than networked DB (no hop). Postgres later only if high concurrency — swap = connection string |
| ORM        | **SQLAlchemy 2.0** + Pydantic schemas + Alembic   | Max maturity + huge community; forces DB-shape vs API-shape separation → can't leak `password_hash`; Alembic for migrations                                                        |
| Auth       | Email + password, own backend, sessions in SQLite | Full data ownership, no third party, no lock-in. OAuth optional later                                                                                                              |
| Email      | **Resend**                                        | Best DX, 3000/mo free (≫ our need); swapping provider = change one client, not lock-in                                                                                             |
| FE hosting | GitHub Pages / Netlify                            | Static, free forever at our scale                                                                                                                                                  |
| BE hosting | **Fly.io**                                        | $0 usage allowance, **no forced sleep** (vs Render cold-start), SQLite on persistent volume = a real file we own, encrypted at rest                                                |

- **Hard constraints driving all of the above:** own the data · portable · no recurring cost · no vendor lock-in.
- Fly's free allowance is a usage credit, not a named tier → **set spend limit/alert** to guarantee $0.

---

## 5. DB schema

Star shape — all user data hangs off `users`.

```
users               (id, email[unique, lowercased], password_hash, email_verified, created_at)
  │ 1───many
  ├── sessions             (id, user_id, token_hash[unique], expires_at, created_at)   [v0]
  ├── email_verifications  (id, user_id, token[unique], expires_at, used_at)           [v0]
  ├── bookmarks            (id, user_id, wiki_id, path, created_at)                     [v0]
  ├── recents              (id, user_id, wiki_id, path, visited_at)                     [v0]
  ├── reads                (id, user_id, wiki_id, path, created_at)                     [v0]
  └── highlights           (id, user_id, wiki_id, path, anchor, color, created_at)      [v1]
```

**Article identity = `(wiki_id, path)`, two columns. Not a FK** — articles live in git, not the DB.

- `path` = the article's `.md` file path the app fetches (e.g. `content/dsa/data-structures/binary-tree.md`). The stable key.
- `wiki_id` = vertical (`dsa`, `system-design`).
- `slug` / `title` are **derived on the frontend** from `path` + the loaded index — not stored. Avoids stale duplicates. Known tradeoff: if a `.md` is renamed/moved, old rows orphan; FE skips paths it can't resolve.

**Per-table notes:**

- `sessions.token_hash` — store **sha256 of the token**, never raw. Cookie carries raw; DB holds hash. Leak-safe. Sliding 30-day `expires_at`, renewed on use.
- `email_verifications` — random token in verify link, 24h expiry, `used_at` enforces one-time.
- `reads` — presence of a row = article is read (boolean model, matches current app; no scroll position).
- `recents` — BE trims to **6 newest** per user on write (`RECENTS_MAX = 6`, hardcoded constant, not configurable).
- Unique constraint on `bookmarks`/`recents`/`reads`: `(user_id, wiki_id, path)`.

v2+: `sticky_notes`, then `notes`, `collections`, `collection_items`, `tags`, `flashcards`.
**Hard column deferred to v1:** `highlights.anchor` — the text-anchoring problem.

Scroll position stays **local-only** (ephemeral, device-specific, capped at 50) — never synced.

---

## 6. Session model

- **Server sessions** (opaque random token), **not JWT** — instant revoke/logout, simpler, per-request DB lookup is free on local SQLite. JWT is overkill at this scale.
- Cookie name `session`: **httpOnly + Secure + SameSite=None** (None required — FE and BE are different domains; forces Secure).
- Lifetime: **30-day sliding** (renewed on activity). Token stored hashed (sha256) in `sessions`.

---

## 7. Password policy

**Mandatory — all 5 must pass:**

- min **12** chars
- ≥1 uppercase `A–Z`
- ≥1 lowercase `a–z`
- ≥1 digit `0–9`
- ≥1 special char (anything outside `[A-Za-z0-9]`)

Special-char hint set shown in UI (subset, keyboard-safe, no escaping headaches):

```
! @ # $ % ^ & * ? - _
```

- **Validated in BOTH FE and BE** (one rule, two implementations — keep in sync via this doc).
- **FE:** live checklist of the 5 rules under the password input — each **red (✗) → green (✓)** the instant satisfied. Submit disabled until all green.
- **BE:** re-validates regardless (never trust client) → 400 with the failed rule(s).

---

## 8. Auth + email-verify flow

Base path `/api/v1`. All JSON.

1. **Register** `POST /auth/register {email, password}` → hash (bcrypt/argon2) → user `email_verified=0` → create verification token → send Resend email. `201`. Dup email → `409`.
2. **Verify** `GET /auth/verify?token=…` → validate (not expired, not used) → `email_verified=1`, set `used_at` → **redirect to FE home** (vertical cards). Bad token → `400`.
3. **Login** `POST /auth/login {email, password}` → check hash → reject if unverified (`403`) → create session, set cookie. `200 {user:{id,email}}`. Bad creds → `401`.
4. **Logout** `POST /auth/logout` → delete session row, clear cookie. `204`.
5. **Me** `GET /auth/me` → `200 {user:{id,email}}` if valid session, else `401`. FE calls on load to know logged-in state.
6. **Resend verification** `POST /auth/resend-verification {email}` → if account exists and unverified, issue fresh token + send email. `200` (generic, regardless). Safety net for failed async sends.

**Session middleware:** cookie → sha256 → lookup `sessions` → check expiry → load user → slide expiry → attach to request. Required on all sync routes.

**Rate limiting:** skipped v0. Basic in-app limiter (login/register) targeted for **v2**; ongoing hardening track.

---

## 9. Sync endpoints

All require session (`401` if absent). User comes from session, never request body. Per-item ops take JSON body `{wiki_id, path}` (DELETE too — symmetric, avoids URL-encoding the slashed `path`). Adds are **idempotent** (dup → `200`, no error).

```
# Bookmarks
GET    /api/v1/bookmarks                       → 200 [{wiki_id, path, created_at}]
POST   /api/v1/bookmarks      {wiki_id, path}  → 201/200 idempotent
DELETE /api/v1/bookmarks      {wiki_id, path}  → 204
DELETE /api/v1/bookmarks/all  {wiki_id?}       → 204  clear (scoped, or all if omitted)

# Reads (presence = read)
GET    /api/v1/reads                           → 200 [{wiki_id, path}]
POST   /api/v1/reads          {wiki_id, path}  → 201/200 idempotent  (mark read)
DELETE /api/v1/reads          {wiki_id, path}  → 204                 (mark unread)

# Recents
GET    /api/v1/recents                         → 200 [{wiki_id, path, visited_at}]  ≤6 newest-first
POST   /api/v1/recents        {wiki_id, path}  → 201  upsert visited_at, BE trims to 6
DELETE /api/v1/recents/all    {wiki_id?}       → 204  clear (scoped, or all)

# Migration (anon localStorage → logged in)
POST   /api/v1/sync/import    {bookmarks[], reads[], recents[]}  → 200 {merged counts}
       merge/union with existing DB rows, dedup on (user_id, wiki_id, path), recents trimmed to 6
```

- Clear is a **separate `/all` route** (explicit), not an overloaded DELETE.
- Migration **merges, not replaces** — user may have data from another device.

---

## 9a. Email (Resend)

**Provider:** Resend. API key in BE env `RESEND_API_KEY`.

**v0 sender = `resend.dev` test mode** — no custom domain bought yet. Test mode **only delivers to your own verified Resend email**, so **v0 effectively ships single-user (you).** Opening to real users requires a verified custom domain (SPF/DKIM DNS) — a deploy-time step, NOT a v0 blocker for self-use.

**Emails in v0 — one only:** verify-your-email.

- Subject: `Verify your Wiki account`.
- Body: minimal multipart (HTML + plain-text fallback for deliverability) — link to `{BACKEND}/api/v1/auth/verify?token=…`, "expires in 24h", "ignore if not you."
- Inline HTML string (one email — no template engine; Jinja later if emails multiply).
- Verify link hits BE → BE redirects to FE home after marking verified.

**Send strategy — best-effort async:** register returns `201` immediately; email sends in background. If Resend is slow/down, registration never hangs or 500s. Failed send → user recovers via **resend-verification** (§8.6), which is the safety net. Resend endpoint gates on `email_verified=0`; abuse rate-limiting deferred to v2 track.

**Password reset:** v1 (adds a second email + endpoints). v0 has no reset — sole early user can fix via DB.

**Integration shape:** thin `email.py` → `send_verification_email(to, token)`, calls Resend (SDK or `httpx`).

---

## 10. Frontend ↔ backend + caching

App stays vanilla-JS SPA, hash router, no build, no framework. All FE auth UI = **modals** (matches existing ⌘K / settings patterns; no new view plumbing).

### Caching model — cache-through (Model B)

- **API = source of truth.** **localStorage = cache** (+ existing service-worker article cache, kept).
- Persistence stays centralized in `storage.js`. Sync hooks inject **inside** the existing save functions — callers (`Bookmarks.toggle`, `markRead`, …) unchanged, minimal blast radius.
  - `get*()` → read localStorage (instant, unchanged).
  - `save*()` → write localStorage **+** if logged in, fire API call.
  - **On login / boot (logged in):** pull from API → merge into localStorage → re-render.
  - **Anon:** exactly today's behavior, zero API.
- **Writes = fire-and-forget:** write localStorage, async POST/DELETE, don't await, ignore transient failures — next load-time pull reconciles drift. UI stays instant.

### Session state (FE)

- Cookie (httpOnly) = real auth, **JS cannot read it**. JS needs its own "logged-in?" signal.
- **`state.session = { user: null|{id,email}, status: "loading"|"in"|"out" }`**, held **in memory** in `state.js`.
- Boot calls **`GET /auth/me`** once → sets `state.session`. **Identity is NOT cached in localStorage** (one source of truth = cookie/BE).
- **SPA navigation (article→article) = zero re-calls** — JS instance stays alive, memory persists. `/auth/me` fires only on a real page load (refresh / first open) → ~1 call per app open, not per article.
- In-memory state lives as long as the tab is open; the cookie (30-day sliding, §6) is always the authority.
- **Staleness handled lazily (Option A):** any API call returning **401** → global handler flips `state.session` to logged-out, prompts re-login. No polling, no focus re-check (add later if stale-tab UX warrants).
- User-data cache (bookmarks etc) still lives in localStorage; only _identity_ is never cached.

### API client (`js/api.js`)

New module — single wrapper all BE calls go through (no existing module owns "talk to backend").

- **Base URL** from a config constant (`BACKEND_URL`). No build step → no FE `.env`. **Hostname-detect:** `localhost → local BE, else → prod fly.dev`. The BE URL is **public by nature** (browser must call it) — not a secret; security = CORS + cookie + BE validation, not URL obscurity.
- `credentials: "include"` on every call (set once here).
- JSON in/out; throws `ApiError(code, message, status)` on non-2xx (parsed from the error envelope) → callers `catch` and switch on `code`.
- **Global 401 handler:** any 401 → flip `state.session` to logged-out, emit `wiki:session-expired` → UI reacts (Option A). Callers never repeat 401 logic.
- Thin helpers `api.get/post/del`. Storage sync uses fire-and-forget (`.catch(()=>{})`); failed writes are **dropped, not queued** in v0 — load-time pull reconciles (retry-queue = v3).

**Same-origin later:** when a custom domain is bought, switch the base to relative `/api/...` (no BE URL in code, `SameSite=Lax`). Same-origin = DNS/routing (e.g. Cloudflare free), **not vendor lock-in**; deferred only because no domain yet.

### Anon → login migration

On login, if **local anon data exists**, show one prompt (generic copy — scales to future data types: highlights, notes):

> "You have unsaved items on this device from browsing signed out. Keep them in your account, or discard?" **[Keep them] [Discard]**

- **Keep** → `POST /sync/import` (merge/union all categories) → then pull server set.
- **Discard** → drop local → pull server set.
- **No local data** → no prompt, just pull server set.
- Never blocks login; no "merge" jargon — plain keep/discard.

**Post-login sequence:** (optional import) → `GET` all lists → overwrite localStorage with server truth → re-render. After first sync on a device, local IS the synced cache → no more prompts.

### Logout

- **Always succeeds, never blocked** on sync. `POST /auth/logout` (kill session) + clear user-data cache.
- **B-lite flush:** logout first fires a quick best-effort flush of any known-unsynced items (short timeout, no long await), then clears cache + logs out **regardless of result**. With fire-and-forget writes, most items already synced per-action, so this is usually instant; it just minimizes loss of a last unsynced write. Rare loss accepted (low-stakes data).
- Clearing cache on logout keeps the next login clean (migration prompt only triggers on genuinely anon data, not another account's leftovers).

### UI affordances (auth scope only)

Auth adds exactly one visible control + one modal. Broader topbar declutter is **WIKI-240** (separate refactor, not auth).

- **Login/logout icon button** in the topbar — the _only_ new auth UI in the topbar. Logged out → "Login"; logged in → "Logout". Account/email shown inside the **preferences panel** (panel renamed "Settings" → "Preferences" under WIKI-240).
- **Auth modal — one modal, swapped content** (reuses existing modal pattern): login ↔ register ↔ verify-pending ↔ session-expired. Minimal.
  - **Register** panel: email, password + **live 5-rule checklist** (§7), submit disabled until all green, toggle to login.
  - **Verify-pending** panel: "Check your email to verify" + **Resend** button (`/auth/resend-verification`). Stays in-modal (flow contained).
- **401 / session-expired:** global handler → toast ("Session expired, please log in") + **reopen the login modal**.

### Offline

- Articles stay readable (SW cache). v0 may require online for user-data writes; offline write-queue is a v3 nicety.

---

## 11. Repo migration

See [fe-be-split.md](./fe-be-split.md).

---

## 12. Security guards (enforced in CI + pre-commit)

The BE URL is public; real protection = these invariants, gated automatically so they can't regress.

**1. CORS never wildcard-with-credentials**

- BE unit test: assert `allow_origins != ["*"]` and not (`"*"` in origins and `allow_credentials=True`).
- BE integration test: send request with a forbidden `Origin` → assert it's NOT reflected in `Access-Control-Allow-Origin`.
- CORS comes only from our FastAPI app (Fly injects none) → the integration test catches it regardless of source.

**2. No secrets in either repo**

- **gitleaks** — pre-commit hook (scans staged diff) **+** GitHub Action (push/PR, authoritative).
- `.gitignore` `.env`; commit only `.env.example` with placeholders.
- Two layers: local fast-fail + CI gate.

**3. HTTPS-only (prod)**

- BE: `HTTPSRedirectMiddleware` + cookie `Secure=True`, both **prod-gated** (`ENV=prod`) so local http dev still works. Fly terminates TLS (free HTTPS).
- Test: assert cookie carries `Secure`; assert redirect middleware enabled in prod config.

**Test homes:** new `wiki-be/tests/` (mirrors FE `tests/` layout); BE security tests in `wiki-be/tests/test_security.py` (counterpart to FE `tests/e2e/test_security.py`). Both repos run **pre-commit** tool (`.pre-commit-config.yaml`) — not identical (language/framework differ) but mirror each other's intent; add to FE too if absent.

---

## 13. Deferred to implementation (non-blocking)

- Highlight text-anchoring strategy (v1's hard problem).
- Infra/deploy specifics (Fly volume, SQLite backup, spend limit, cross-origin verify) — see [infra-deploy.md](./infra-deploy.md).
