# Wiki

A fast, offline-capable reference wiki for interview prep. Two verticals — **System Design** and **Data Structures & Algorithms** — share one app: a single-page app with no build step, no framework, no server. Content is plain markdown; the app turns it into a searchable, linkable, themeable site.

---

## Verticals

| Vertical                         | Icon | Content root             | Status                  |
| -------------------------------- | ---- | ------------------------ | ----------------------- |
| **System Design**                | ⚙️   | `content/system-design/` | ~51 articles            |
| **Data Structures & Algorithms** | 🧩   | `content/dsa/`           | scaffolded, content WIP |

Each vertical is one entry in the `WIKIS` array in `js/state.js` — that single entry gives it a home card, an index view, and routing for free. Adding a vertical is data, not code.

---

## How to run

No build. The app fetches `.md` files over HTTP, so it must be served — opening `index.html` from `file://` won't load content.

```bash
# from the wiki/ directory, any static server works:
python3 -m http.server 8000
# then open http://localhost:8000
```

A service worker (`wiki-sw.js`) caches assets for offline use. **Any change to `wiki-sw.js` requires a cache version bump** — otherwise clients keep the stale cache.

---

## Architecture (brief)

Single-page app, vanilla JS ES modules, no TypeScript, no framework.

- **Boot:** `index.html` → `wiki.css` → `app.js` → registers service worker → reads state → routes to a view.
- **Views:** `#view-home` (vertical cards), `#view-index` (one vertical's sections), `#view-content` (one article). One active at a time.
- **Content:** each vertical's `index.md` lists its articles in markdown tables (`parseIndexMd`). The app loads only files reachable from there — nothing globs the directory. Articles are markdown → HTML via Showdown, with Mermaid diagrams, highlight.js, hover link-previews, and a generated TOC.
- **Persistence:** `localStorage` only (settings, bookmarks, recents, read-tracking). No server, no database.

`js/`: `app.js` (entry/router) · `state.js` (WIKIS registry, config, caches) · `content.js` (post-processing) · `render.js` (views + index parser) · `search.js` (⌘K) · `storage.js` (localStorage).
`css/`: tokens-first — all design tokens in `tokens.css`, then base / themes / components / per-view modules, aggregated by `wiki.css`.

**Deeper detail for working on the code lives in [CLAUDE.md](./CLAUDE.md)** — file map, task→file routing, conventions.

---

## Adding content

Articles are markdown under a vertical's content root, listed in that vertical's `index.md`. Each vertical has its own writing instructions under `docs/_meta/ai-instructions/`:

| Vertical      | Instructions                                                                                                                                        |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| System Design | `_base.md` (read first) + a type file: `components.md` · `algorithms.md` · `hld.md` · `devops-tools.md` · `devops-cheatsheets.md` (self-contained). |
| DSA           | `dsa-writer.md` (the rules — source of truth) + `dsa-rater.md` (scores a draft + ship/no-ship gate).                                                |

Format conventions shared by both verticals:

- Open `# Title` → `## Prerequisites` → `## Table of Contents` → body. **No YAML front matter** (the search index reads headings).
- Filenames: lowercase, hyphen-separated, `.md`.
- Then add the article to the vertical's `index.md` table so the app discovers it.

---

## System Design

The original vertical. Articles split across `components/`, `algorithms/`, `distributed-systems/`, and `hld/` (high-level designs). Writing rules: read `docs/_meta/ai-instructions/_base.md` first, then the file matching the article type. DevOps cheatsheets are self-contained and skip `_base.md`.

---

## DSA

DS and algorithms are intertwined, so they live in **one combined vertical**, not two. Three sections under `content/dsa/`:

- `data-structures/` — structural references.
- `algorithms/` — procedure + correctness.
- `patterns/` — recognition + transfer (the interview-prep heart: "problem says X → reach for pattern Y").

**Writing a DSA article:**

1. Copy the matching skeleton from `content/dsa/_templates/` (`ds.md` · `algorithm.md` · `pattern.md`) to the target path. These are never indexed by the app.
2. Fill it per `docs/_meta/ai-instructions/dsa-writer.md` — the source of truth for what every section must contain (params, families, the pseudocode-≠-Python rule, recognition signals).
3. Self-rate with `dsa-rater.md` until it reads **SHIP**; run `scripts/dsa-check.sh <article.md>` for the deterministic link/filename checks.

**What sets DSA apart from System Design:** every article carries an interview spine — explicit complexity, a clean pseudocode + idiomatic Python pair, and a spoken "soundbite". Pattern articles add **recognition signals** (literal trigger phrases → which pattern) that the rest of the vertical cross-links into.

**Backlog (high level):** P0 = 21 foundation articles (8 DS, 7 algorithms, 6 patterns) everything else links back to; P1 builds on P0 (graphs, advanced patterns); the pattern-selection cheat sheet ships **last** since it aggregates every pattern's trigger phrases. Build order: DS → algorithms → patterns, in dependency order.
