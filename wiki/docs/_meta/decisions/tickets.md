# Ticket Schema Decisions

## Columns

### Type (single value)

Describes the nature of the work.

| Value    | When to use                                             |
| -------- | ------------------------------------------------------- |
| feature  | New capability the user didn't have before              |
| bug      | Something broken or behaving incorrectly                |
| ux       | Existing thing works better — no new capability added   |
| a11y     | Accessibility specifically (ARIA, focus, screen reader) |
| perf     | Speed, memory, or load-time improvement                 |
| refactor | Restructure without behaviour change                    |
| dx       | Tooling, CI, pre-commit, developer workflow             |

**feature vs ux rule:** if the user gains something they couldn't do before → `feature`. If an existing thing just works better → `ux`.

`security` folds into `bug` (it's a fix). `content` (docs/meta) folds into `dx`.

### Component (multi-value, `|`-separated)

Describes which architectural layer(s) the ticket touches.

| Value    | Covers                                                       |
| -------- | ------------------------------------------------------------ |
| ui       | CSS, layout, visual presentation, HTML structure             |
| search   | ⌘K global search, section filter, result rendering           |
| nav      | TOC, breadcrumbs, routing, hash navigation, keyboard nav     |
| settings | Settings panel, theme, font, preferences                     |
| storage  | localStorage, sessionStorage, persistence, scroll/read state |
| content  | Markdown rendering, syntax highlighting, math, diagrams      |
| sw       | Service worker, offline, caching                             |
| ci       | Tooling, pre-commit, GitHub Actions, build pipeline          |

`ux` is a **Type** value, not a Component — UX is a cross-cutting concern, not an isolated layer.
`backend` omitted — app is entirely frontend.
