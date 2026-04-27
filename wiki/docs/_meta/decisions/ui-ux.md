# UI / UX Design Decisions

## Settings Page & Themes (WIKI-018, WIKI-033)

### Fonts (6)

| #   | Font           | Vibe                  |
| --- | -------------- | --------------------- |
| 1   | Inter          | Clean sans, default   |
| 2   | Geist          | Modern minimal        |
| 3   | IBM Plex Sans  | Technical, engineered |
| 4   | Lora           | Elegant serif         |
| 5   | Source Serif 4 | Long-form reading     |
| 6   | JetBrains Mono | Monospace             |

### Accent Colours (8)

| #   | ID         | Primary   | Feel            |
| --- | ---------- | --------- | --------------- |
| 1   | indigo     | `#6366f1` | Default         |
| 2   | violet     | `#8b5cf6` | Rich purple     |
| 3   | blue       | `#3b82f6` | Classic blue    |
| 4   | cyan       | `#06b6d4` | Cool, techy     |
| 5   | emerald    | `#10b981` | Natural, calm   |
| 6   | amber      | `#f59e0b` | Warm, editorial |
| 7   | matrix     | `#00ff41` | Terminal green  |
| 8   | neon-green | `#22c55e` | Soft green      |

### Theme Presets (9)

Selecting a preset populates all pickers. Editing any picker individually → preset shows "Custom". No save-as-custom. Persisted in localStorage.

| #   | Preset    | Theme      | Font           | Size | Accent     |
| --- | --------- | ---------- | -------------- | ---- | ---------- |
| 1   | Dark      | dark       | Inter          | M    | indigo     |
| 2   | Light     | light      | Inter          | M    | indigo     |
| 3   | Midnight  | dark       | Geist          | M    | violet     |
| 4   | Warm      | dark       | Lora           | M    | amber      |
| 5   | Ocean     | dark       | IBM Plex Sans  | M    | cyan       |
| 6   | Forest    | light      | Source Serif 4 | M    | emerald    |
| 7   | Matrix    | matrix     | JetBrains Mono | M    | matrix     |
| 8   | Terminal  | terminal   | JetBrains Mono | M    | neon-green |
| 9   | Amber CRT | amber-term | JetBrains Mono | M    | amber      |

Hacker themes use dedicated `data-theme` values (`matrix`, `terminal`, `amber-term`) with full CSS token overrides for bg/text. The Light/Dark toggle in settings only switches between light/dark baseline — hacker themes are only accessible via preset cards.

---

## Reading Content Width (WIKI-038)

Three options in settings (same row UX as font size): **Narrow / Default / Wide**.

Implemented as `--content-width` CSS custom property on `.markdown-body`:

| Option  | Value   |
| ------- | ------- |
| Narrow  | `68ch`  |
| Default | `80ch`  |
| Wide    | `120ch` |

Mobile requires no special handling — viewport is narrower than all three values, so `max-width` has no visual effect and content fills the viewport naturally.
