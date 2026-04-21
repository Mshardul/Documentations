# Wiki App — Task Board

| ID       | Entry Date | Summary                                            | Description                                                                                                                                                                                                                      | Status    | Impl. Date | Remarks                                                                                                |
| -------- | ---------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ---------- | ------------------------------------------------------------------------------------------------------ |
| WIKI-001 | 2026-04-21 | ⌘K search result keyboard navigation               | Add ↑/↓ arrow key navigation and Enter to select in the global search modal results list.                                                                                                                                        | Completed | 2026-04-21 |                                                                                                        |
| WIKI-002 | 2026-04-21 | Search button on home view                         | Home topbar only had theme toggle; ⌘K was undiscoverable without keyboard. Added search button.                                                                                                                                  | Completed | 2026-04-21 |                                                                                                        |
| WIKI-003 | 2026-04-21 | Prev/next article navigation                       | Linear navigation between articles in a section to improve reading flow.                                                                                                                                                         | Dropped   | —          | No defined sequence between articles; structure is non-linear.                                         |
| WIKI-004 | 2026-04-21 | Full-text search across article content            | Extend ⌘K to search inside article body text, not just titles and descriptions.                                                                                                                                                  | Dropped   | —          | Result list would be too long and noisy to be useful.                                                  |
| WIKI-005 | 2026-04-21 | Section progress indicator on index view           | Show "4/12 read" summary per section based on read tracking data.                                                                                                                                                                | Dropped   | —          | Read dots per card already surface this; aggregate count adds little value.                            |
| WIKI-006 | 2026-04-21 | Copy button discoverability on mobile              | Copy button on code blocks is hover-only; unreachable on touch devices.                                                                                                                                                          | Dropped   | —          | Acceptable UX tradeoff for current use case; revisit if mobile usage increases.                        |
| WIKI-008 | 2026-04-21 | Article count default to 0                         | Home cards showed "… articles" while async count loaded; replaced with "0 articles".                                                                                                                                             | Completed | 2026-04-21 |                                                                                                        |
| WIKI-009 | 2026-04-21 | Recently visited chips on wiki index               | Track last 6 visited articles per wiki; show as chips at top of wiki index view.                                                                                                                                                 | Completed | 2026-04-21 | Scoped per wiki, not global. Shown on index view, not home page.                                       |
| WIKI-010 | 2026-04-21 | Move bookmarks to wiki index view                  | Bookmarks on home page felt out of place; moved to wiki index as chips alongside recents.                                                                                                                                        | Completed | 2026-04-21 | Scoped per wiki. Old bookmark card UI removed.                                                         |
| WIKI-011 | 2026-04-21 | Clear buttons on recents and bookmarks             | Add × button to each section header to clear all entries for the current wiki.                                                                                                                                                   | Completed | 2026-04-21 |                                                                                                        |
| WIKI-012 | 2026-04-21 | Fix 404 on page refresh                            | URLs contained `wiki.html` (file is `index.html`); server returned 404 on refresh.                                                                                                                                               | Completed | 2026-04-21 | Switched to fragment-only URLs (`#hash`); server always receives base `index.html` path.               |
| WIKI-013 | 2026-04-21 | Breadcrumb section/folder segment                  | Show section name (e.g. Components) as a breadcrumb segment between wiki and article.                                                                                                                                            | Dropped   | —          | Redundant — section is visible on index view; related articles already surfaces siblings.              |
| WIKI-014 | 2026-04-21 | VS Code-style breadcrumb dropdowns                 | Clicking a breadcrumb segment shows a dropdown of sibling sections or articles.                                                                                                                                                  | Dropped   | —          | Hierarchy is only 3 levels deep; current breadcrumb is sufficient. Complexity not justified.           |
| WIKI-015 | 2026-04-21 | Fix breadcrumb link reliability                    | Home/wiki breadcrumb links intermittently unclickable due to event listener fragility.                                                                                                                                           | Completed | 2026-04-21 | Replaced addEventListener approach with real hash hrefs + hashchange listener.                         |
| WIKI-022 | 2026-04-21 | Progress stats per section on index                | Show "X / Y read" per section in index view.                                                                                                                                                                                     | Dropped   | —          | Not required; read dots per card already surface this granularly.                                      |
| WIKI-023 | 2026-04-21 | Filter stub articles from global search            | Stubs (placeholder `.md` files < 200 chars) appeared in ⌘K results. `loadAllSearchEntries` now fetches each file concurrently, reuses `readTimeCache`, and excludes stubs.                                                       | Completed | 2026-04-21 |                                                                                                        |
| WIKI-024 | 2026-04-21 | j/k keyboard nav on index cards                    | Vim-style arrow key navigation through index cards.                                                                                                                                                                              | Dropped   | —          | Not required; ⌘K search covers navigation needs.                                                       |
| WIKI-025 | 2026-04-21 | Inline filter on index view                        | Small filter input above card grid to narrow cards in real time.                                                                                                                                                                 | Dropped   | —          | Not required; ⌘K global search is sufficient.                                                          |
| WIKI-028 | 2026-04-21 | Copy button on code blocks                         | Copy-to-clipboard button on every `<pre>` block in article content.                                                                                                                                                              | Completed | 2026-04-21 | Already implemented; discovered during audit.                                                          |
| WIKI-019 | 2026-04-21 | Persist scroll position per article                | Remember scroll offset per article in localStorage; restore on revisit.                                                                                                                                                          | Completed | 2026-04-21 | Debounced save on scroll; restored on article load unless ?a= anchor present.                          |
| WIKI-020 | 2026-04-21 | TOC sidebar position                               | TOC fixed to right side on large screens; hidden on mobile.                                                                                                                                                                      | Completed | 2026-04-21 | Already satisfied by existing sticky CSS (position:sticky, top:44px, display:none on mobile).          |
| WIKI-029 | 2026-04-21 | Escape key → back to wiki index                    | From content view, pressing Escape navigates back to the wiki index. Previously Escape only closed the search modal.                                                                                                             | Completed | 2026-04-21 | Search modal close takes priority; index nav triggers only when modal is closed.                       |
| WIKI-031 | 2026-04-21 | Estimated total reading time on index hero         | Sum read times of all available articles, shown in index subtitle area.                                                                                                                                                          | Dropped   | —          | Not required.                                                                                          |
| WIKI-018 | 2026-04-21 | Settings page                                      | Gear icon in every topbar opens settings panel. Controls: font (6 options), font size (S/M/L), colour palette (6 options), theme preset (6 factory presets; editing any picker switches to "custom"). Persisted in localStorage. | Completed | 2026-04-21 | Font list, palette, and preset definitions implemented per design decisions below.                     |
| WIKI-032 | 2026-04-21 | Light/Dark toggle row in settings panel            | Add explicit Light/Dark buttons inside settings panel (after Preset section). Sets theme + preset:"custom". Complements header toggle.                                                                                           | Completed | 2026-04-21 |                                                                                                        |
| WIKI-033 | 2026-04-21 | Hacker theme presets (Matrix, Terminal, Amber CRT) | Three new data-theme values (matrix, terminal, amber-term) with full CSS token overrides. Added as presets in settings panel. 9 presets total.                                                                                   | Completed | 2026-04-21 | No scanlines; can be revisited. Amber CRT reuses amber accent; Matrix/Terminal get new accent entries. |

---

## Design Decisions

### WIKI-018 / WIKI-033 — Settings Page & Themes

**Fonts (6):**
| # | Font | Vibe |
|---|---|---|
| 1 | Inter | Clean sans, default |
| 2 | Geist | Modern minimal |
| 3 | IBM Plex Sans | Technical, engineered |
| 4 | Lora | Elegant serif |
| 5 | Source Serif 4 | Long-form reading |
| 6 | JetBrains Mono | Monospace |

**Accent Colours (8):**
| # | ID | Primary | Feel |
|---|---|---|---|
| 1 | indigo | `#6366f1` | Default |
| 2 | violet | `#8b5cf6` | Rich purple |
| 3 | blue | `#3b82f6` | Classic blue |
| 4 | cyan | `#06b6d4` | Cool, techy |
| 5 | emerald | `#10b981` | Natural, calm |
| 6 | amber | `#f59e0b` | Warm, editorial |
| 7 | matrix | `#00ff41` | Terminal green |
| 8 | neon-green | `#22c55e` | Soft green |

**Theme Presets (9):** selecting preset populates all pickers; editing any picker individually → preset shows "Custom". No save-as-custom. Persisted in localStorage.
| # | Preset | Theme | Font | Size | Accent |
|---|---|---|---|---|---|
| 1 | Dark | dark | Inter | M | indigo |
| 2 | Light | light | Inter | M | indigo |
| 3 | Midnight | dark | Geist | M | violet |
| 4 | Warm | dark | Lora | M | amber |
| 5 | Ocean | dark | IBM Plex Sans | M | cyan |
| 6 | Forest | light | Source Serif 4 | M | emerald |
| 7 | Matrix | matrix | JetBrains Mono | M | matrix |
| 8 | Terminal | terminal | JetBrains Mono | M | neon-green |
| 9 | Amber CRT | amber-term | JetBrains Mono | M | amber |

**Hacker themes** use dedicated `data-theme` values (`matrix`, `terminal`, `amber-term`) with full CSS token overrides for bg/text. Theme row in settings (Light/Dark buttons) only switches between light/dark baseline; hacker themes only accessible via preset cards.
| Neon | IBM Plex Sans | Medium | Rose |
