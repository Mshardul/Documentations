# Quiz Revision App — Project Documentation

---

- [1. Overview](#1-overview)
- [2. Usage Instructions](#2-usage-instructions)
  - [Running the App](#running-the-app)
  - [Loading Questions](#loading-questions)
  - [Applying Filters](#applying-filters)
  - [Interacting with Quiz Cards](#interacting-with-quiz-cards)
- [3. Project Structure](#3-project-structure)
- [4. Architecture](#4-architecture)
- [5. Quiz JSON Schema](#5-quiz-json-schema)
  - [Top-level structure](#top-level-structure)
  - [`meta` object](#meta-object)
  - [`questions` array — each item](#questions-array--each-item)
  - [Full example](#full-example)
  - [Constraints](#constraints)
  - [Adding a new question manually](#adding-a-new-question-manually)
- [6. Tag System](#6-tag-system)
  - [Format rules](#format-rules)
  - [Taxonomy (think in layers)](#taxonomy-think-in-layers)
  - [Controlled vocabulary](#controlled-vocabulary)
  - [Colour assignment](#colour-assignment)
- [7. Features](#7-features)
- [8. Configuration](#8-configuration)
- [9. UI Structure](#9-ui-structure)
  - [Page layout](#page-layout)
  - [Floating elements (bottom-right)](#floating-elements-bottom-right)
  - [Tag drawer](#tag-drawer)
  - [Load More button](#load-more-button)
  - [Card design](#card-design)
- [10. Keyboard Accessibility](#10-keyboard-accessibility)
- [11. External Dependencies](#11-external-dependencies)
- [12. Known Limitations](#12-known-limitations)
- [13. V2 Roadmap](#13-v2-roadmap)

## 1. Overview

- A lightweight, offline-friendly quiz revision tool built with plain HTML, CSS, and JS — no framework, no build step.
- Solves the problem of storing and revising MCQ-style questions from mock tests, courses, or books in a structured, filterable format.
- Intended for individual use — load your own `quiz.json`, filter by topic, and revise at your own pace.

---

## 2. Usage Instructions

### Running the App

- Requires a local HTTP server (opening `quiz.html` directly via `file://` will block JSON loading due to CORS).
- Recommended: `npx serve .` or `python -m http.server 8080` in the project directory.
- Open `http://localhost:8080` in a browser.

### Loading Questions

- Point the JS config to your `quiz.json` file path (see [Configuration](#8-configuration)).
- On load, the JS verifies the file — if invalid or unreachable, an error is shown.
- No UI-based question addition in v1; edit `quiz.json` directly.

### Applying Filters

- Click the floating menu icon (bottom-right) → Tags icon.
- Select one or more tags from the drawer (checkboxes).
- Click **Apply** → SweetAlert warning shown → confirm to reload with `?tags=tag1,tag2` in the URL.
- Filter is a **union** (OR) of selected tags.
- To reset: click **Reset** in the drawer (clears selection), then **Apply** with no tags selected.
- Active filters persist in the URL and are reflected in the drawer on reload.

### Interacting with Quiz Cards

- **Select an option** using radio buttons (one per line).
- **Show/Hide Answer** — passive peek at the answer without marking as attempted.
- **Clear Selection** — visible only when an option is selected; resets the radio.
- **Submit Answer** — validates selection, highlights correct (green) / incorrect (red) option, reveals answer + explanation, and changes the button label to "Hide Answer".
- **Load More** — appends the next paginated batch of questions at the bottom.

---

## 3. Project Structure

```
/
├── quiz.html       # App shell, layout, and static markup
├── quiz.css        # All styling, theming, chip colours, drawer, cards
└── quiz.js          # All logic — data loading, filtering, pagination, rendering
```

| File        | Responsibility                                                                                     |
| ----------- | -------------------------------------------------------------------------------------------------- |
| `quiz.html` | Structure, CDN script tags, div layout                                                             |
| `quiz.css`  | Visual design, responsive layout, chip colours, drawer, floating buttons                           |
| `quiz.js`   | JSON loading/validation, tag colour map, filtering, shuffling, pagination, rendering, keyboard nav |

---

## 4. Architecture

```
quiz.json
    │
    ▼
quiz.js (on page load)
    ├── Validates JSON
    ├── Reads meta.allowed_tags → builds tag-to-colour map (cached)
    ├── Reads URL query params → applies tag filter
    ├── Builds shuffled questionPool (filtered indices)
    ├── Slices first pagination_size questions → renders cards
    └── Wires up all event listeners (buttons, drawer, load more)

quiz.html
    └── Provides DOM skeleton; quiz.js populates Div3 dynamically

quiz.css
    └── Purely presentational; reads no data; uses CSS variables for primary/secondary colours
```

**Key data flow:**

- `quiz.json` → `quiz.js` → DOM (quiz.html rendered dynamically)
- User interaction → `quiz.js` event handlers → DOM updates
- Filter change → URL update → page reload → full re-init

---

## 5. Quiz JSON Schema

### Top-level structure

```json
{
  "meta": { ... },
  "questions": [ ... ]
}
```

### `meta` object

| Field          | Type       | Description                                           |
| -------------- | ---------- | ----------------------------------------------------- |
| `topic`        | `string`   | Title shown in the page header                        |
| `version`      | `number`   | Schema version (integer)                              |
| `allowed_tags` | `string[]` | Master tag vocabulary; source of truth for the drawer |

### `questions` array — each item

| Field         | Type       | Description                                                                                                     |
| ------------- | ---------- | --------------------------------------------------------------------------------------------------------------- |
| `id`          | `string`   | UUID v4 (e.g., `"a1b2c3d4-..."`)                                                                                |
| `question`    | `string`   | Question text (plain string)                                                                                    |
| `options`     | `string[]` | Array of 4 option strings                                                                                       |
| `answer`      | `number`   | 0-based index into `options`                                                                                    |
| `explanation` | `string`   | Markdown string (max ~50 words); use `\n\n` for paragraph breaks; supports `` `code` ``, `**bold**`, `_italic_` |
| `tags`        | `string[]` | 1–10 tags; must exist in `meta.allowed_tags`                                                                    |
| `type`        | `string`   | `"single"` (default) or `"multi"` (multi-select; reserved for v2)                                               |

### Full example

```json
{
  "meta": {
    "topic": "Cloud Native & DevOps",
    "version": 1,
    "allowed_tags": [
      "security",
      "cloud-native",
      "aws",
      "secrets-management",
      "kubernetes",
      "docker"
    ]
  },
  "questions": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "type": "single",
      "question": "Which technique is most effective for securely storing secrets?",
      "options": [
        "Hardcoding them in environment variables",
        "Storing them in a dedicated secrets management service",
        "Encrypting them and storing in a config file",
        "Embedding them in the container image"
      ],
      "answer": 1,
      "explanation": "A **secrets management service** (e.g., `HashiCorp Vault`, `AWS Secrets Manager`) provides centralized, auditable access control with **encryption at rest** and **in transit**.\n\n_Always avoid hardcoded secrets._",
      "tags": ["secrets-management", "security", "cloud-native", "aws"]
    }
  ]
}
```

### Constraints

- `answer` index must be a valid index into `options` — do not reorder options after setting it.
- `id` must be unique across all questions.
- No trailing commas — strict JSON.

### Adding a new question manually

1. Generate a UUID (e.g., `uuidgen` in terminal or any online tool).
2. Write question, options, set `answer` as 0-based index.
3. Write `explanation` in markdown — preview in a `.md` scratch file first.
4. Pick tags **only** from `meta.allowed_tags`; add new tags to `allowed_tags` first if needed.
5. Validate JSON before saving (e.g., `python -m json.tool quiz.json`).

---

## 6. Tag System

### Format rules

- **Lowercase** — `secrets-management` not `Secrets-Management`
- **Hyphen-separated** — `api-security` not `api_security` or `apiSecurity`
- **No plurals** — `container` not `containers`
- **No special characters** beyond hyphens
- **No hierarchy notation** — use separate tags: `["cloud", "aws"]` not `"cloud:aws"`

### Taxonomy (think in layers)

| Layer      | Purpose               | Examples                                           |
| ---------- | --------------------- | -------------------------------------------------- |
| Domain     | Broad subject area    | `cloud-native`, `security`, `devops`, `networking` |
| Concept    | Specific topic tested | `secrets-management`, `rbac`, `ci-cd`, `ingress`   |
| Technology | Tool/service-specific | `kubernetes`, `docker`, `aws`, `vault`             |

- Aim for: 1 domain tag + 1–2 concept tags + optional technology tags.
- Range: **1–10 tags per question**; no hard cap but use meaningfully.

### Controlled vocabulary

- `meta.allowed_tags` is the **single source of truth**.
- Before adding a question, check tags against this list.
- To introduce a new tag: add it to `allowed_tags` first, then use it in questions.
- Avoids duplicates like `secrets-management` vs `secret-mgmt`.

### Colour assignment

- A static list of ~100 light-themed colours is defined in `quiz.js`.
- On init, tags are assigned colours **round-robin** from this list.
- Colours are cached in a `tagColorMap` object (tag name → colour).
- All chips for a given tag use the **same colour** throughout the page.
- If more than 100 tags exist, colours repeat.

---

## 7. Features

- **Tag filtering** — union (OR) of selected tags; persisted in URL query params (`?tags=security,aws`); survives page reload.
- **Pagination with "Load More"** — loads `pagination_size` questions at a time; appends to page; button greyed out when pool exhausted.
- **Shuffle** — question pool is shuffled on every page load/filter change; no repeated ordering across sessions.
- **Answer validation** — Submit highlights correct (green) / incorrect (red) option and auto-reveals answer + explanation.
- **Passive peek** — Show/Hide Answer button reveals answer without marking as attempted (for v2 scoring).
- **Markdown explanations** — rendered via `marked.js`; supports inline code, bold, italic.
- **Tag colour chips** — consistent colour per tag, round-robin assigned at runtime.
- **Floating drawer menu** — right-side drawer for tag selection; doesn't shift page layout.
- **Active filter display** — Div2 shows selected tag chips + total filtered question count (circle badge) when filter is active.
- **Back to top** — floating ↑ button, bottom-right.
- **Keyboard accessibility** — full keyboard navigation (see [Section 10](#10-keyboard-accessibility)).

---

## 8. Configuration

Config is a small inline object at the top of `quiz.js` — no separate config file.

```js
const CONFIG = {
  quizFilePath: "./quiz.json", // path to your quiz JSON file
  pagination_size: 10, // number of questions per "Load More" batch
};
```

- To change either value: edit `quiz.js` directly and refresh the page.
- No UI for updating config in v1.

---

## 9. UI Structure

### Page layout

```
Div1   — Header (centered, not fixed): quiz topic title
Div2   — Active filter bar (hidden by default): tag chips + question count badge
Div3   — Quiz area: one card (Div3.1) per question
         └── Div3.1.1  Question text (bold)
         └── Div3.1.2  Tag chips (coloured)
         └── Div3.1.3  Options (radio buttons, one per line)
         └── Div3.1.4  Action buttons
             ├── Div3.1.4.1 (float left): Show/Hide Answer | Clear Selection
             └── Div3.1.4.2 (float right): Submit Answer (primary colour)
         └── Div3.1.5  Answer + explanation (hidden by default)
             ├── Div3.1.5.1  Correct answer (bold)
             └── Div3.1.5.2  Explanation (markdown rendered)
```

### Floating elements (bottom-right)

- **↑ Back to top button** — always visible on scroll.
- **Floating menu** — Confluence-style icon cluster.
  - **Tags icon** — opens right-side drawer (non-blocking).

### Tag drawer

```
Drawer (right side, doesn't shift page)
├── Div1 (top 90%, vertically scrollable): collection of tag chips
│   └── Each tag shown as chip (same design as page chips)
│       └── Selected state: darker chip + bold label
└── Div2 (bottom 10%): Apply | Reset buttons
```

### Load More button

- Vertically centered, at the bottom of the page.
- Appends next `pagination_size` questions between last card and itself.
- Greyed out (disabled) when question pool is exhausted.

### Card design

- Light-grey background, `secondary-color` border.
- Submit button uses `primary-color`.

---

## 10. Keyboard Accessibility

- All interactive elements (radio buttons, action buttons, drawer checkboxes, Load More) are **focusable and operable via keyboard**.
- `Tab` / `Shift+Tab` — navigate between focusable elements.
- `Space` / `Enter` — activate buttons and checkboxes.
- `Arrow keys` — navigate radio button options within a question.
- Drawer is openable/closable via keyboard (focus trap inside drawer when open).
- Back to top button is keyboard accessible.
- Focus order follows visual DOM order.

---

## 11. External Dependencies

Loaded via CDN — no npm install required.

| Library                                       | Purpose                                            | CDN tag in `quiz.html`                                                      |
| --------------------------------------------- | -------------------------------------------------- | --------------------------------------------------------------------------- |
| [SweetAlert2](https://sweetalert2.github.io/) | Warning dialog before filter-triggered page reload | `<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>`       |
| [marked.js](https://marked.js.org/)           | Renders explanation markdown strings to HTML       | `<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>` |

---

## 12. Known Limitations

- **No state persistence across reloads** — selected answers, show/hide state, and load-more position are all lost on page refresh or filter change.
- **Static pagination size** — `pagination_size` can only be changed by editing `quiz.js` and refreshing.
- **No score tracking** — Submit and Show/Hide are separate for future scoring, but no score is calculated in v1.
- **Filter is union only (OR)** — AND filtering not available in v1 UI (logic exists in JS, deferred to v2).
- **Manual question authoring only** — no UI for adding/editing questions; `quiz.json` must be edited directly.
- **Local server required** — cannot be opened as a plain `file://` URL due to browser CORS restrictions on `fetch`.

---

## 13. V2 Roadmap

- **(a) Score / progress tracking** — track attempted questions, correct answers, running score display.
- **(b) Finish Quiz button** — allows user to explicitly end a session.
- **(c) Downloadable report (PDF)** — generated on quiz completion; includes each question, selected answer, correct answer, and final stats (score, accuracy %).
- **(d) Add questions from UI** — form-based question authoring without editing `quiz.json` manually.
