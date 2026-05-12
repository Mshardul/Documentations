# Wiki App — Claude Instructions

## SESSION START PROTOCOL

Do this before any file reads or skill invocations — every session:

1. Classify the task using the table below.
2. MEMORY.md is already in context — no need to fetch it.
3. If task type is **Ticket**: read `docs/tickets.md` first, nothing else.
4. If task type is anything else: go directly to the FILE MAP section and route.

---

## TASK CLASSIFICATION

| Signal in user message                                                                    | Task type                                     |
| ----------------------------------------------------------------------------------------- | --------------------------------------------- |
| `WIKI-xxx` / "work on tickets" / "which ticket" / "decide ticket" / "let's pick a ticket" | **Ticket**                                    |
| Explicit filename or component named                                                      | **Direct** — skip exploration, read that file |
| "bug" / "broken" / "not working" / "doesn't" / "wrong"                                    | **Debugging**                                 |
| "add" / "implement" / "build" + vague or no spec                                          | **Feature**                                   |
| "add content" / "write article" / "create page" / topic name for article                  | **Content**                                   |
| Simple "change X to Y", clear target file and scope                                       | **Direct edit**                               |

---

## SKILL ROUTING

| Task type                                           | Invoke                                                      | Never invoke                                 |
| --------------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------- |
| Real bug, unknown root cause                        | `systematic-debugging`                                      | `brainstorming`, `feature-dev`, `TDD`        |
| Hard bug or perf regression (multi-hypothesis)      | `diagnose`                                                  | `brainstorming`                              |
| New feature, design unclear                         | `brainstorming` (scope only, not full feature-dev pipeline) | `systematic-debugging`, `TDD`                |
| New feature, spec clear                             | none                                                        | all skills                                   |
| Ticket with clear spec                              | none — or `executing-plans` if multi-step                   | `brainstorming`, `feature-dev`, `TDD`        |
| Commit                                              | `caveman-commit`                                            | —                                            |
| Inline diff / code review                           | `caveman-review`                                            | —                                            |
| Content article                                     | `brainstorming` (outline/scope only), then write            | `TDD`, `systematic-debugging`, `feature-dev` |
| CSS / JS change, clear scope (1–3 files)            | none                                                        | all skills                                   |
| PR / code review                                    | `code-review`                                               | —                                            |
| 2+ independent subtasks with zero shared state      | `dispatching-parallel-agents`                               | —                                            |
| Modularise / find coupling / architectural refactor | `improve-codebase-architecture`                             | `brainstorming`                              |
| Audit or improve CLAUDE.md                          | `claude-md-improver`                                        | —                                            |
| Wrapping up branch before PR                        | `finishing-a-development-branch`                            | —                                            |

**`verification-before-completion`**: skip for single-file edits, CSS-only changes, and content `.md` changes.

**`dispatching-parallel-agents`**: only when subtasks share zero state. Example — two independent content articles = yes. CSS change + its test = no.

**Always on — no invocation needed:**

- `caveman` — active via SessionStart hook; controls response terseness for all sessions
- `context-mode` — active via SessionStart hook; governs tool selection (use ctx_batch_execute over raw Bash for >20 lines)
- `security-guidance` — passive PreToolUse hook; warns on file edits automatically

**Never in this project:**

- `frontend-design` — project has a fixed, established aesthetic; do not apply creative reinterpretation
- `test-driven-development` — user runs tests manually; write correct code, skip the TDD loop
- `playground` — no interactive HTML playground tasks in this project
- `netlify-skills` — project is not deployed on Netlify
- `subagent-driven-development` — too heavyweight; use `dispatching-parallel-agents` for isolation instead
- `grill-with-docs`, `context-mode-ops`, `writing-skills`, `claude-automation-recommender` — meta/setup skills; invoke only if explicitly asked

---

## FILE MAP

### JS (`js/`)

| File         | Owns                                                                                                                                                                     |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `app.js`     | ES module entry; bootstraps app, wires hash router, exposes window globals for inline onclick handlers, keyboard shortcuts                                               |
| `state.js`   | WIKIS registry, Showdown/Mermaid config, shared caches (readTimeCache, indexCache, allSearchCache), app state object, shared pure utilities (escHtml, fuzzyMatch)        |
| `content.js` | Content post-processing after markdown→HTML: copy buttons, callouts, prerequisites chips, hover link previews, Mermaid, highlight.js, anchor links, code language labels |
| `render.js`  | View rendering: home grid, wiki index sections, content layout, TOC, breadcrumbs, related articles, reading progress bar                                                 |
| `search.js`  | ⌘K modal: open/close lifecycle, search entry loading, fuzzy scoring, result rendering, section-filter mode (>)                                                           |
| `storage.js` | All localStorage operations: settings r/w, bookmarks, recents, read tracking, offline cache button state                                                                 |

### CSS (`css/`)

| File               | Owns                                                                                                                                                  |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tokens.css`       | ALL CSS custom properties: spacing scale, typography scale, colour tokens, border-radius, transition durations — **read this first for any CSS task** |
| `base.css`         | Global reset and base styles: body, headings, inline code, scrollbar, text selection                                                                  |
| `themes.css`       | Per-theme CSS token overrides for dark, light, matrix, terminal, amber-term via `data-theme` attribute                                                |
| `components.css`   | Shared UI components: breadcrumb, back button, topbar layout, scroll-to-top, settings panel, hover preview panel                                      |
| `view-home.css`    | Home view: background grid/glow, wiki card grid, home topbar, hero section                                                                            |
| `view-index.css`   | Index view: hero, section headers, index card grid, recents strip, bookmarks strip                                                                    |
| `view-content.css` | Content view: two-column layout, TOC sidebar, markdown body, callouts, code blocks, reading time badge, related articles                              |
| `responsive.css`   | Mobile/tablet media queries — overrides layout, TOC visibility, topbar density for narrow viewports                                                   |
| `wiki.css`         | CSS aggregator — imports all CSS modules via @import; never add rules here                                                                            |

### Tests (`tests/`)

| File                                    | Covers                                                             |
| --------------------------------------- | ------------------------------------------------------------------ |
| `conftest.py`                           | Fixtures: browser setup, local HTTP server, navigation helpers     |
| `e2e/test_home.py`                      | Home view, wiki cards, article counts, search button, theme toggle |
| `e2e/test_search.py`                    | Search modal, results, keyboard nav                                |
| `e2e/test_navigation.py`                | Sidebar, routing, breadcrumbs                                      |
| `e2e/test_content.py`                   | Article rendering, markdown, code blocks, math                     |
| `e2e/test_content_enhancements.py`      | Copy-code button, line numbers, enhanced content features          |
| `e2e/test_html_markup.py`               | HTML markup rendering correctness                                  |
| `e2e/test_bookmarks.py`                 | Bookmark add / remove / persist                                    |
| `e2e/test_recents.py`                   | Recent articles list                                               |
| `e2e/test_settings.py`                  | Theme, font, content width settings                                |
| `e2e/test_routing_pathing.py`           | URL routing, direct links, 404                                     |
| `e2e/test_links.py`                     | Internal links, cross-references                                   |
| `e2e/test_scroll_toc.py`                | TOC scroll tracking, active heading highlight                      |
| `e2e/test_keyboard_scroll.py`           | Keyboard scroll shortcuts                                          |
| `e2e/test_a11y_hotkeys.py`              | Accessibility, hotkeys                                             |
| `e2e/test_ux_hotkeys_errors.py`         | UX hotkeys, error states                                           |
| `e2e/test_read_toggle.py`               | Reading mode toggle                                                |
| `e2e/test_index_ux.py`                  | Index / sidebar UX interactions                                    |
| `e2e/test_data_backup.py`               | Data export / import                                               |
| `e2e/test_content_width.py`             | Content width setting                                              |
| `e2e/test_line_numbers_pathing_help.py` | Line numbers, pathing, help modal                                  |
| `e2e/test_security.py`                  | XSS, sanitisation, security invariants                             |
| `e2e/test_behavioral_fixes.py`          | Regression / behavioural fixes                                     |

### Docs

| File                                               | Read when                                                                               |
| -------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `docs/tickets.md`                                  | WIKI-xxx mentioned OR any ticket intent detected                                        |
| `docs/_meta/ai-instructions/tickets.md`            | Ticket intent — read alongside tickets.md                                               |
| `docs/_meta/ai-instructions/_base.md`              | **Every content task** (components / algorithms / HLD / devops-tools) — read this first |
| `docs/_meta/ai-instructions/components.md`         | Writing system design component article (after \_base.md)                               |
| `docs/_meta/ai-instructions/algorithms.md`         | Writing algorithm / concept article (after \_base.md)                                   |
| `docs/_meta/ai-instructions/hld.md`                | Writing HLD / system design article (after \_base.md)                                   |
| `docs/_meta/ai-instructions/devops-tools.md`       | Writing DevOps tool article (after \_base.md)                                           |
| `docs/_meta/ai-instructions/devops-cheatsheets.md` | Writing DevOps cheatsheet — self-contained, skip \_base.md                              |
| `docs/_meta/decisions/ui-ux.md`                    | UI / UX decision needed                                                                 |
| `docs/tasks.md`                                    | Context on recently completed work or implementation notes                              |
| `docs/changelog.md`                                | Context on recent feature history or what changed                                       |

---

## TASK → FILE ROUTING

| Task                      | Read these only                                                                                 |
| ------------------------- | ----------------------------------------------------------------------------------------------- |
| Search bug                | `js/search.js`, `js/state.js`                                                                   |
| Rendering / markdown bug  | `js/render.js`, `js/content.js`                                                                 |
| Navigation / routing bug  | `js/app.js`, `js/state.js`                                                                      |
| Bookmark / recents bug    | `js/storage.js`, `js/state.js`                                                                  |
| Settings bug              | `js/storage.js`, `css/themes.css`, `css/tokens.css`                                             |
| UI / visual bug           | `css/tokens.css` + relevant view CSS                                                            |
| New CSS feature           | `css/tokens.css` first, then target view CSS                                                    |
| Service worker issue      | `wiki-sw.js` only                                                                               |
| Write tests for feature X | Relevant `tests/e2e/test_*.py` + `tests/conftest.py`                                            |
| Content article           | `docs/_meta/ai-instructions/_base.md` + relevant type file (except cheatsheets: type file only) |

---

## APP ARCHITECTURE

Single-page app. No build step, no framework, no TypeScript.

**Boot:** `index.html` → `wiki.css` → `app.js` → registers service worker → reads state → routes to correct view.

**Views:** `#view-home`, `#view-index`, `#view-content` — one active at a time. State managed in `state.js`.

**Content loading:** `content.js` fetches `.md` files from `content/` via HTTP → parses front matter → builds search index. `render.js` converts markdown to DOM.

**Persistence:** `storage.js` → `localStorage` only. No server, no database.

**Service worker (`wiki-sw.js`):** Caches assets for offline use. Any change to this file **requires a cache version bump** — never skip this.

---

## TOOL USAGE

- **`Read`** — only for files you will edit immediately after
- **`ctx_batch_execute`** — multi-file exploration, any output >20 lines
- Never raw `Bash` for reading files
- **Never run tests** — user runs tests manually; write correct test code only

---

## TEST PATTERNS

- Always read `tests/conftest.py` before writing any test — it defines all shared fixtures and navigation helpers
- Add tests to the existing file matching the feature (use the test map above) — never create a new test file unless the feature genuinely has no existing home
- Match the existing test structure in that file (function-based, class-based, fixture usage)
- Playwright: use `page.locator()` + `expect()` assertions; avoid `page.query_selector()`
- Never add new fixtures or conftest helpers — use what already exists
- Tests are e2e only: test behaviour through the UI, not JS functions directly
- Never run tests — write correct code, user runs them

---

## NEVER

**App dev tasks:**

- Never read `content/**/*.md` — irrelevant to app code
- Never read all 6 JS files — use the module map above to pick the right one
- Never read all CSS files — always start with `tokens.css`

**Content tasks:**

- Never read `js/` or `css/` files
- Never write or run tests

**All tasks:**

- Never `git add` / `git commit` / `git push` unless explicitly asked
- Never add `Co-Authored-By` to commit messages
- Never put WIKI-xxx ticket IDs in code comments or CSS section headers

---

## CONVENTIONS

- Vanilla JS, ES6 modules, no TypeScript, no build step
- All design tokens live in `tokens.css` — never duplicate values in other CSS files
- No inline styles except dynamic values set programmatically via JS
- BEM-adjacent class naming (block-element pattern)
- Test files: Python + Playwright, pytest conventions
- Content filenames: lowercase, hyphen-separated, `.md` extension
