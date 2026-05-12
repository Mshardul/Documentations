# AI Instructions — Tickets

> Reference this file whenever ticket intent is detected: WIKI-xxx ID mentioned, or phrases like "work on tickets", "which ticket", "decide ticket", "let's pick a ticket".
> Read `docs/tickets.md` for the actual ticket data.

---

## BACKLOG SCHEMA

Columns in `tickets.md`:

| Column       | Values / Notes                                                                                                      |
| ------------ | ------------------------------------------------------------------------------------------------------------------- |
| ID           | `WIKI-xxx` — sequential, never reuse                                                                                |
| Entry Date   | ISO date added to backlog                                                                                           |
| Summary      | ≤7 words                                                                                                            |
| Type         | `feature` / `bug` / `ux` / `perf` / `a11y` / `refactor` / `dx` / `cleanup` / `security` — see canonical rules below |
| Component    | Which module(s) — pipe-separated (e.g., `search \| content`) — see canonical values below                           |
| Description  | ≤30 words — what to build/fix                                                                                       |
| Status       | `Backlog` / `Done` / `Dropped`                                                                                      |
| Impl. Date   | ISO date implemented; `-` if not done                                                                               |
| Remarks      | ≤30 words — implementation notes, supersession info                                                                 |
| Priority     | `p0` (critical) → `p1` (high) → `p2` (medium) → `p3` (low) → `p4` (very low)                                        |
| Story Points | Sizing estimate — see `docs/_meta/decisions/story-points-estimation.md`                                             |

**Canonical Type values** (from `docs/_meta/decisions/tickets.md`):

| Type       | When to use                                                                 |
| ---------- | --------------------------------------------------------------------------- |
| `feature`  | New capability the user didn't have before                                  |
| `bug`      | Something broken or behaving incorrectly (includes security fixes)          |
| `ux`       | Existing thing works better — no new capability added                       |
| `a11y`     | Accessibility specifically (ARIA, focus, screen reader)                     |
| `perf`     | Speed, memory, or load-time improvement                                     |
| `refactor` | Restructure without behaviour change                                        |
| `dx`       | Tooling, CI, pre-commit, developer workflow (includes content/meta changes) |
| `cleanup`  | Dead code removal, file deletion, housekeeping                              |

Note: older tickets may use `security` or `cleanup` as types — these are acceptable in practice.

**Canonical Component values** (from `docs/_meta/decisions/tickets.md`):

| Component  | Covers                                                       |
| ---------- | ------------------------------------------------------------ |
| `ui`       | CSS, layout, visual presentation, HTML structure             |
| `search`   | ⌘K global search, section filter, result rendering           |
| `nav`      | TOC, breadcrumbs, routing, hash navigation, keyboard nav     |
| `settings` | Settings panel, theme, font, preferences                     |
| `storage`  | localStorage, sessionStorage, persistence, scroll/read state |
| `content`  | Markdown rendering, syntax highlighting, math, diagrams      |
| `render`   | View rendering functions (home grid, index sections, TOC)    |
| `sw`       | Service worker, offline, caching                             |
| `ci`       | Tooling, pre-commit, GitHub Actions, build pipeline          |
| `css`      | CSS-only changes not tied to a specific view                 |
| `js`       | JS-only changes spanning multiple modules                    |

`ux` is a Type, not a Component. `a11y` occasionally appears as a component in older tickets — acceptable in practice.

---

## RECOMMENDING TICKETS

When user asks which ticket to work on, do this:

1. Read `docs/tickets.md`.
2. Filter to `Status = Backlog` only.
3. Sort by priority ascending (p0 first), then story points ascending within same priority.
4. Present top 3–5 candidates with: ID, Summary, Type, Priority, Story Points, Description.
5. Ask user to confirm before starting implementation.

Never recommend `Done` or `Dropped` tickets. Never start implementation without user confirmation.

---

## COMPONENT → FILE MAPPING

| Component tag | Files to read                                                       |
| ------------- | ------------------------------------------------------------------- |
| `search`      | `js/search.js`, `js/state.js`                                       |
| `content`     | `js/content.js`, `js/render.js`                                     |
| `render`      | `js/render.js`                                                      |
| `nav`         | `js/app.js`, `js/state.js`                                          |
| `storage`     | `js/storage.js`                                                     |
| `settings`    | `js/storage.js`, `css/themes.css`, `css/tokens.css`                 |
| `ui`          | Relevant view CSS (`css/view-*.css`) + `css/components.css`         |
| `css`         | `css/tokens.css` first, then relevant view CSS                      |
| `js`          | Use module map in `CLAUDE.md`                                       |
| `sw`          | `wiki-sw.js` only — **cache version bump required on every change** |
| `a11y`        | Relevant JS module + `index.html`                                   |
| `ci`          | `.github/` directory                                                |

---

## STARTING IMPLEMENTATION

1. Read the ticket's Description and Remarks carefully — Remarks often contain implementation constraints.
2. Map Component tags to files using the table above.
3. Read only the mapped files — do not explore broadly.
4. Check if ticket references another ticket (e.g., "Extends WIKI-078", "Superseded by") — if so, read that ticket's Remarks first.
5. Follow `CLAUDE.md` skill routing for the ticket Type:
   - `bug` → `systematic-debugging` if root cause unknown; direct edit if cause is stated in Description
   - `feature` → no skill if spec is clear (it usually is in the ticket); `brainstorming` only if description is vague
   - `perf` / `a11y` / `ux` / `refactor` / `cleanup` / `dx` / `security` → direct edit, no skill

---

## ADDING NEW TICKETS

When user asks to add a ticket:

1. Use next sequential WIKI-xxx ID (check highest existing ID in backlog).
2. Entry Date: today's date (ISO format).
3. Summary: ≤7 words, imperative phrasing ("Add X", "Fix Y", "Improve Z").
4. Description: ≤30 words — be specific enough to implement without asking.
5. Status: `Backlog`. Impl. Date: `-`. Remarks: empty unless there's a known constraint.
6. Story points: refer to `docs/_meta/decisions/story-points-estimation.md` for sizing.
7. Add as a new row in the table — maintain column alignment.

---

## TICKET LIFECYCLE

- `Backlog` → `Done`: when implementation is complete, add Impl. Date and brief Remarks.
- `Backlog` → `Dropped`: when superseded or invalidated — always explain in Remarks (e.g., "Superseded by WIKI-xxx").
- Never delete rows — keep Done and Dropped for history.
- Never change an ID after creation.
