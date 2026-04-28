```
wiki/
├── index.html              HTML shell for all three views (home, index, content) plus modal overlays (search, settings)
├── 404.html                Terminal-styled stub page; shown for empty or missing articles
├── wiki.css                CSS aggregator; imports all CSS modules via @import
├── wiki.js                 Legacy monolithic JS; superseded by ES modules, no longer loaded by index.html
│
├── app.js                  ES module entry point; bootstraps app, wires hash router, exposes window globals for inline onclick handlers
├── state.js                WIKIS registry, Showdown/Mermaid config, shared caches (readTimeCache, indexCache, allSearchCache), app state object, shared pure utilities (escHtml, fuzzyMatch)
├── storage.js              All localStorage operations: settings r/w, bookmarks, recents, read tracking, offline cache button state
├── render.js               View rendering: home grid, wiki index sections, content layout, TOC, breadcrumbs, related articles, reading progress bar
├── content.js              Content post-processing after markdown→HTML: copy buttons, callouts, prerequisites chips, hover link previews, Mermaid, highlight.js, anchor links, code language labels
├── search.js               ⌘K modal: open/close lifecycle, search entry loading, fuzzy scoring, result rendering, section-filter mode (>)
│
├── tokens.css              CSS custom properties: spacing scale, typography scale, color tokens, border-radius, transition durations
├── base.css                Global reset and base styles: body, headings, inline code, scrollbar, text selection
├── components.css          Shared UI components: breadcrumb, back button, topbar layout, scroll-to-top, settings panel, hover preview panel
├── view-home.css           Home view: background grid/glow, wiki card grid, home topbar, hero section
├── view-index.css          Index view: hero, section headers, index card grid, recents strip, bookmarks strip
├── view-content.css        Content view: two-column layout, TOC sidebar, markdown body, callouts, code blocks, reading time badge, related articles
├── themes.css              Per-theme CSS token overrides for dark, light, matrix, terminal, amber-term via data-theme attribute
├── responsive.css          Mobile/tablet media queries; overrides layout, TOC visibility, topbar density for narrow viewports
├── wiki-sw.js              Service worker; intercepts fetch requests, serves cached article responses for offline access
│
├── docs/
│   ├── tasks.md                    Completed and dropped task records with implementation dates and notes
│   ├── tasks_backlog.md            Pending tasks with priority, story points, and remarks
│   ├── changelog.md                Chronological feature and fix changelog
│   │
│   └── _meta/
│       ├── folder-structure.md                 This file; directory map for developer and AI reference
│       ├── AI-instructions-algorithms.md       Format spec and generation rules for algorithm article type
│       ├── AI-instructions-components.md       Format spec and generation rules for system design component articles
│       ├── AI-instructions-hld.md              Format spec and generation rules for HLD articles
│       │
│       └── decisions/
│           ├── ci.md                           Decision record for CI pipeline, lint hooks, and pre-commit config
│           ├── story-points-estimation.md      Story point sizing guide with reference examples
│           └── ui-ux.md                        UI/UX design decisions: layout rules, interaction patterns, visual conventions
│
└── tests/
    ├── conftest.py                   Pytest fixtures: Playwright browser setup, local HTTP server, shared navigation helpers
    │
    └── e2e/
        ├── test_home.py              Home view: wiki card rendering, article counts, search button, theme toggle
        ├── test_navigation.py        Hash routing, view transitions, browser back/forward, popstate handling
        ├── test_content.py           Article rendering: markdown output, code highlighting, callouts, prerequisites chips
        ├── test_search.py            ⌘K modal: open/close, fuzzy search, section-filter mode, keyboard navigation
        ├── test_settings.py          Settings panel: theme, font, size, width, accent, persistence across reloads
        ├── test_bookmarks.py         Bookmark add/remove, index chip display, clear-all button
        ├── test_recents.py           Recently visited tracking, chip display, clear button
        ├── test_read_toggle.py       Manual read/unread toggle, auto-mark at 85% scroll threshold
        ├── test_scroll_toc.py        TOC active item highlight, smooth scroll, collapse toggle, mobile TOC drawer
        ├── test_keyboard_scroll.py   Keyboard shortcuts: b, comma, Escape, scroll-to-top behavior
        ├── test_links.py             Internal .md link interception, external link target, anchor scroll
        ├── test_data_backup.py       Export/import JSON backup for settings, bookmarks, recents, read state
        ├── test_content_width.py     Narrow/Default/Wide content width setting and localStorage persistence
        └── test_routing_pathing.py   Hash URL routing, relative path resolution, slug-to-file mapping
```
