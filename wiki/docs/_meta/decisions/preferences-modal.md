# Preferences Modal (WIKI-239)

Replace `#settings-panel` (drawer) and `#help-modal` with a single tabbed modal `#prefs-modal`.

---

## Aesthetic

Linear/Vercel Dark: `#0c0c0e` bg, `#27272a` border, `border-radius: 12px`, heavy backdrop blur + `rgba(0,0,0,0.7)` scrim. Active tab underlined with `--accent`. Inner surfaces `#18181b`.

---

## Tabs

| Tab          | Contents                                                        |
| ------------ | --------------------------------------------------------------- |
| **General**  | Theme presets · Accent color · Font · Font size · Content width |
| **Keyboard** | Shortcuts list (was `#help-modal`), grouped: Global / Content   |
| **Advanced** | Export · Import (was "Data" section)                            |

---

## Layout

**Desktop:** Centered, `inset: ~12%` all sides. Two-column General tab (left: theme + accent / right: font + size + width). Header: title + subtitle + X button only — no ESC badge.

**Mobile (<640px):** Bottom sheet anchored to screen bottom. Max `70vh`. Drag handle strip at top. Header + tabs sticky. Body scrolls. Theme presets scroll horizontally. Single column.

---

## Triggers

| Input            | Opens on tab |
| ---------------- | ------------ |
| Gear ⚙ / `,` key | General      |
| `?` key          | Keyboard     |
| ESC / backdrop   | Closes modal |

---

## Removals

- `#settings-panel`, `#settings-backdrop`, `.settings-drawer` — deleted
- `#help-modal`, `.help-modal`, `.help-backdrop`, `.help-dialog` — deleted
- Topbar theme-toggle button — deleted (theme lives in General tab)
- `openHelp()` in `app.js` — deleted; `?` now calls `Settings.openTab('keyboard')`
- `data-action="theme-toggle"` handler — deleted

---

## Files

- `index.html` — new `#prefs-modal` HTML; remove old panel, help modal, theme-toggle btn
- `js/storage.js` — rewrite `Settings.open/close`; add `Settings.openTab(name)`
- `js/app.js` — wire `?` → `Settings.openTab('keyboard')`; remove `openHelp()` + theme-toggle handler
- `css/components.css` — add `.prefs-modal` styles; delete `.settings-panel`, `.settings-backdrop`, `.settings-drawer`, `.settings-header`, `.settings-close-btn`, `.help-modal`, `.help-backdrop`, `.help-dialog`, `.help-header`, `.help-close-btn`, `.help-body`, `.help-group`, `.help-row` blocks

---

## A11y

Focus trap inside modal. On open: focus first focusable in active tab; set `aria-hidden="false"`. On close: restore focus to trigger; set `aria-hidden="true"`. `aria-modal="true"`, `aria-label="Preferences"` on root element. Mobile: `overscroll-behavior: contain` on scrollable body.
