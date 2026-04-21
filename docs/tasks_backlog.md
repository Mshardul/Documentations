# Wiki App — Backlog Task Board

| ID | Entry Date | Summary | Description | Status | Impl. Date | Remarks |
| -------- | ---------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- | ---------- | -------------------------------------------------------------------------------------------- | priority |
| WIKI-007 | 2026-04-21 | Smarter related articles ranking | Replace first-3-in-section logic with keyword or tag-based relevance ranking. | Backlog | — | | p2 |
| WIKI-016 | 2026-04-19 | Prerequisites rendered as chips in content view | Article prerequisites (list of links) should render as clickable chips in the content view header, opening the linked page in-app. | Backlog | — | | p1 |
| WIKI-017 | 2026-04-19 | TLDR hover preview on article links | Hovering over an article link on any page shows its TLDR section as a tooltip/popup. | Backlog | — | Explicitly scoped as post-MVP during initial wiki design discussion. | p1 |
| WIKI-021 | 2026-04-21 | Help page | Dedicated help page listing all keyboard shortcuts and app usage tips. Accessible via `?` hotkey and link from settings. | Backlog | — | | p1 |
| WIKI-026 | 2026-04-21 | Read progress badge on index hero | Show "X / Y articles read" in index hero area. Compute from `isRead()` + available (non-stub) cards per wiki. | Backlog | — | | p2 |
| WIKI-027 | 2026-04-21 | Related articles from in-article recommendations | Replace first-3-in-section logic with an explicit `## Recommended` section in each content `.md` file listing related article links. Parser reads this section; wiki.js uses it for the related articles panel. | Backlog | — | Requires adding `## Recommended` section to existing content files. | p1 |
| WIKI-030 | 2026-04-21 | Print / PDF export | `window.print()` triggered from content topbar button. Dedicated print stylesheet: hide sidebar, topbar, progress bar, related articles; clean typography. | Backlog | — | | p3 |
