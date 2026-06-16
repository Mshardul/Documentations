# DSA Article Rater

A rubric for scoring a written DSA article (`content/dsa/**/*.md`) for interview-readiness. This file is the instruction set: given an article path, follow the steps below and produce a scored report. Scoring is LLM judgment — no separate parser. The same article may vary slightly run-to-run; that is accepted.

This rubric encodes the "must" rules from the DSA vertical plan. It does **not** re-judge taste; it checks that the article carries the required signal, in the required shape, at interview depth — and gives both a **score** (0–100) and a **publish gate** (ship / no-ship).

---

## How to use

Input: one article path (or a glob to batch-rate several, one report each).

1. **Read the article.**
2. **Detect the section** from the folder:
   - `content/dsa/data-structures/…` → **DS**
   - `content/dsa/algorithms/…` → **Algorithm**
   - `content/dsa/patterns/…` → **Pattern**
3. **Detect the family** (DS and Algorithm only — Pattern has none) from the title/content, using the family tables below. If a title spans two families, pick the dominant one and say which in the report.
4. **Apply params in three tiers:** universal (every article) + the matching section block + the matching family block. Params that don't apply to this article (e.g. recognition-signals on an algorithm) are marked **n/a** and dropped from the total.
5. **Resolve link & filesystem checks for real.** Some params (link resolution, title↔filename) require looking at the content tree, not pure judgment — actually check the files exist when rating; do not guess.
6. **Score, gate, and report** in the output format at the bottom.

---

## Scoring

- Each applicable param scored **0–10**:
  - **9–10** — fully present, correct, at interview depth.
  - **6–8** — present but thin, partially correct, or missing a sub-part.
  - **3–5** — gestured at but weak / vague / mostly absent.
  - **0–2** — missing or wrong.
- Each param has a **weight**. Overall = weighted average, scaled to **/100**:
  `overall = round( 100 * Σ(score_i × weight_i) / Σ(10 × weight_i) )` over applicable params only.
- **n/a params** are excluded from both sums — weights renormalize automatically.

### Publish gate (separate from the score)

Each param is **gated** or **advisory**:

- **Gated** params must score **≥6** to publish. Any gated param scoring **≤5** → **NO-SHIP**, regardless of the /100.
- **Advisory** params never block — they only inform fixes.
- A gated param scoring ≤5 is a **blocker** and is listed first in the report.

So a 91/100 article with one gated param at 4 still reads **NO-SHIP** until that param is fixed. The score measures quality; the gate measures publishability.

### Weights

| Weight  | Params                                                                                                    |
| ------- | --------------------------------------------------------------------------------------------------------- |
| **3**   | Recognition signals (pattern)                                                                             |
| **2**   | Complexity derivation (algo) · Intuition (algo) · Pseudocode ≠ Python · Family block · Skeleton (pattern) |
| **1**   | All section-core params + universal def / complexity / when-to-use / Python / practice problems           |
| **0.5** | Filename convention · TOC present · Prerequisites format · advisory params                                |

---

## Universal params — every article

| #   | Param                              | Rule                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Weight | Gate     |
| --- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | -------- |
| U1  | One-line definition + mental model | A "What it is" section opens with a single-sentence definition **and** a mental model / analogy (a comparison to something familiar, or a bolded one-liner). Not a wall of text.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | 1      | gated    |
| U2  | Complexity stated                  | Time and space complexity given explicitly (Big-O), not just implied.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | 1      | gated    |
| U3  | When to use / when not             | Concrete interview decision cues — _when to reach for this vs an alternative_ — with **≥1 named alternative**. Not "use it when you need it."                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | 1      | gated    |
| U4  | Python present + idiomatic         | Real, runnable-shape Python. Type hints, comprehensions, `enumerate`, unpacking, stdlib (`collections.deque`, `heapq`) where natural. Not transliterated C. All modules used are imported at the top of the block.                                                                                                                                                                                                                                                                                                                                                                                                                                                            | 1      | gated    |
| U5  | Pseudocode present + ≠ Python      | Pseudocode is **advised, not mandatory — but must be present wherever it adds signal** (any non-trivial logic/loop/invariant). Mark **n/a only** when the operation is genuinely trivial and the ops table already conveys it (e.g. a hash-set membership check). When present, must be CLRS style — numbered / `for i = 1 to n` / `▷ comment` / explicit `swap`; never `def`, `:`, comprehensions. **Test: if it could be pasted as valid Python, it fails.** Absent where it should exist → score low (not n/a). **n/a guardrail: marking U5 n/a requires a justification in the NOTE column naming the trivial op — an unjustified n/a defaults to a low score, not n/a.** | 2      | gated    |
| U6  | Practice problems                  | `## Practice problems` section with **≥3 problems**, each tagged by pattern and cross-linked with a relative `.md` link. Representative, not filler.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | 1      | gated    |
| U7  | Format spine                       | Opens `# Title` → `## Prerequisites` → `## Table of Contents` → body. **No YAML front matter** (file must not start with `---`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | 1      | gated    |
| U8  | Title ↔ filename                   | H1 text matches the slugified filename (case-insensitive, hyphens).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | 0.5    | gated    |
| U9  | Prerequisites format               | `[Title](./path.md) [Must read] - reason`; HTML-comment link for not-yet-written targets. At least one prerequisite directly supports understanding.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | 0.5    | advisory |
| U10 | TOC present                        | `## Table of Contents` exists and reflects the headings.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | 0.5    | advisory |
| U11 | Filename convention                | Lowercase, hyphen-separated, `.md`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | 0.5    | gated    |
| U12 | Links resolve                      | Every `[text](./path.md)` link resolves to an existing file in the content tree, including cross-vertical links (e.g. into `system-design/`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | 1      | gated    |
| U13 | Interview soundbite                | A single memorable sentence a candidate can say out loud to sum up the concept (e.g. "A heap is a binary tree where the parent is always smaller than its children — great for anything 'top-K'."). **Distinct from U1**: U1 is the written teaching definition + mental model (may run 2–3 sentences); this is the one-line _spoken_ compression. If U1 is already a single crisp line, this may reuse it — but it must be explicitly the takeaway.                                                                                                                                                                                                                          | 0.5    | advisory |

---

## Section block — Data Structures

Apply when section = DS. (Universal + these + the DS family block.)

| #   | Param                       | Rule                                                                                                                                                                     | Weight | Gate     |
| --- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ | -------- |
| DS1 | How it works + diagram      | Internal layout explained, with a diagram or placeholder (mermaid, ASCII, or `<!-- diagram -->`).                                                                        | 1      | gated    |
| DS2 | Operations table            | An `## Operations` table listing each operation **with its individual time/space O()** — every op has a complexity cell. Covers insert / find / delete where applicable. | 1      | gated    |
| DS3 | Complexity summary          | `## Complexity summary` — time/space broken to best / average / worst where they differ.                                                                                 | 1      | gated    |
| DS4 | When-to-use vs alternatives | Decision cues naming sibling structures (e.g. array vs linked-list).                                                                                                     | 1      | gated    |
| DS5 | Variants                    | `## Variants` with ≥1 real variant (e.g. array → dynamic array; tree → balanced).                                                                                        | 1      | advisory |
| DS6 | Implementation              | `## Implementation` — structure definition + core ops, in the U4/U5 shape.                                                                                               | 1      | gated    |
| DS7 | Gotchas / edge cases        | `## Gotchas / edge cases` listing **≥2 interview traps**.                                                                                                                | 1      | gated    |

---

## Section block — Algorithms

Apply when section = Algorithm. (Universal + these + the Algorithm family block.)

| #   | Param                           | Rule                                                                                                                                                                                                                                                                                                                                                                                                                                           | Weight | Gate     |
| --- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | -------- |
| AL1 | Intuition                       | Plain-language _why it works_, separate from the walkthrough. Bonus if it uses an analogy.                                                                                                                                                                                                                                                                                                                                                     | 2      | gated    |
| AL2 | Worked example + diagram        | Step-by-step trace on a concrete input, with a diagram or placeholder. Bonus if it points back to the invariant ("the invariant still holds after this step").                                                                                                                                                                                                                                                                                 | 1      | gated    |
| AL3 | Correctness / invariant         | Explicitly states a loop/recurrence invariant or correctness argument — the "prove it" prompt.                                                                                                                                                                                                                                                                                                                                                 | 1      | gated    |
| AL4 | Complexity derivation           | _Why_ the O — recurrence solved, or steps/space counted. Not a hand-wavy "it's O(n)".                                                                                                                                                                                                                                                                                                                                                          | 2      | gated    |
| AL5 | When-to-use vs alternatives     | Decision cues vs ≥1 competing algorithm.                                                                                                                                                                                                                                                                                                                                                                                                       | 1      | gated    |
| AL6 | Edge cases                      | **≥3 of**: empty, single element, duplicates, overflow, cycles (as applicable). Advisory bonus: each is handled in the Python (e.g. `if not arr: return`).                                                                                                                                                                                                                                                                                     | 1      | gated    |
| AL7 | Implementation                  | Pseudocode (per U5) + Python (per U4).                                                                                                                                                                                                                                                                                                                                                                                                         | 1      | gated    |
| AL8 | What the interviewer probes for | After the correctness argument, the typical interviewer follow-ups — **each stated as a question + a 2–3 sentence answer sketch**, not just the question. E.g. Dijkstra: _"Can it handle negative weights? — No; a finalized node can later be reached more cheaply via a negative edge, breaking the greedy invariant. Use Bellman-Ford instead, O(VE)."_ Whenever the article recommends a choice, the probe on that choice must be covered. | 1      | advisory |

---

## Section block — Patterns

Apply when section = Pattern. (Universal + these — **no family block**.)

| #   | Param                   | Rule                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Weight | Gate     |
| --- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | -------- |
| PA1 | **Recognition signals** | The heart of the vertical, the most heavily checked section. Must have **three labeled parts**, each concrete: **(a) Trigger phrases** — **≥2** literal, quoted problem-statement snippets ("longest substring with at most K distinct characters", "next greater element"), not "when dealing with arrays". **(b) Structural cues** — input shape + output property regardless of wording. **(c) Not to be confused with** — names ≥1 neighbor pattern and states the distinction in one crisp sentence. Missing or vague on any of the three caps this at 5. | 3      | gated    |
| PA2 | How it works + diagram  | The mechanic, with a diagram or placeholder.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | 1      | gated    |
| PA3 | Skeleton                | Reusable pseudocode (CLRS) + Python template to paste-and-adapt. Python has a real function signature, no syntax errors, and a `# your logic here` marker where adaptation is needed.                                                                                                                                                                                                                                                                                                                                                                          | 2      | gated    |
| PA4 | Complexity              | Typical time/space of the pattern.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | 1      | gated    |
| PA5 | Variations              | Common twists on the pattern.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | 1      | advisory |
| PA6 | Worked problems         | **3–5 problems** reusing the pattern, each with a brief 2–3 sentence approach sketch (not a full solution) that shows how the skeleton applies.                                                                                                                                                                                                                                                                                                                                                                                                                | 1      | gated    |
| PA7 | Pitfalls                | **≥2** common misapplications.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | 1      | gated    |
| PA8 | Related                 | Cross-links to the DS/algo it leans on + sibling patterns.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | 1      | gated    |
| PA9 | First 30 seconds        | The exact 2–3 sentences a candidate says out loud the moment they spot the pattern (e.g. _"This is a sliding window — we want the longest contiguous subarray satisfying a constraint. I'll use two pointers, expand right, and contract left based on a hashmap of counts."_). **Distinct from PA1**: PA1 is how to _recognize_ the pattern; this is the _script_ you speak once recognized — naming the structure, the why, and the approach in one breath.                                                                                                  | 1      | advisory |

---

## Family blocks

Detect the family, apply exactly one. Pattern articles have no family block. The family block is one param, **weight 2, gated**, scored on whether the article covers its specific points at depth, under the expected heading.

### DS families

| Family     | Members                                  | Expected heading + must-cover                                                          |
| ---------- | ---------------------------------------- | -------------------------------------------------------------------------------------- |
| Linear     | array, string, linked-list, stack, queue | `## Memory layout` — contiguous vs pointer, cache behavior, resize cost.               |
| Hash-based | hash-table, hash-set                     | `## Hashing & collisions` — hash fn, chaining vs open-addressing, load factor, resize. |
| Tree/heap  | binary-tree, BST, heap, trie             | `## Traversal & invariant` — orderings, the ordering/heap invariant, balancing.        |
| Graph      | graph                                    | `## Representations` — matrix vs list, directed/weighted, tradeoff table.              |

### Algorithm families

| Family          | Members                                            | Expected heading + must-cover                                                         |
| --------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Search/divide   | binary-search, sorting, divide & conquer           | `## Loop/recurrence invariant` — search-space shrink; recurrence → Master theorem.    |
| Traversal       | BFS, DFS, topological-sort, Dijkstra, Bellman-Ford | `## Graph/tree assumptions` — visited-state, directed/weighted, queue vs stack vs PQ. |
| Recursive/build | recursion, backtracking, DP                        | `## State & recurrence` — state def, base case, memo vs tabulation, state-space size. |
| Bit/greedy      | bit-manipulation, greedy                           | `## Greedy-choice proof` (exchange argument) OR `## Bit-tricks table`.                |

---

## Output format

```
<filename>  —  <overall>/100  —  <SHIP | NO-SHIP>   [section: <DS|Algo|Pattern>, family: <name|n/a>]

PARAM                         SCORE   W    GATE   NOTE
--------------------------------------------------------------------------------
U1 def + mental model         9/10    1    gate   clean one-liner + analogy
U5 pseudocode present/≠py     4/10    2    gate   pseudocode is just python with comments
DS2 operations table          8/10    1    gate   all ops have O(), missing space col
FB memory layout              7/10    2    gate   covers cache, misses resize cost
U9 prerequisites format       6/10   0.5   adv    reason text missing on 2 prereqs
PA1 recognition signals       n/a     -     -     (not a pattern article)
--------------------------------------------------------------------------------

GATE: NO-SHIP — 1 gated param below 6.

BLOCKERS (gated, score ≤5 — fix before publish):
- U5: rewrite pseudocode in CLRS form (for i = 1 to n; ▷ comment; swap A[i] A[j])

FIXES (ranked, highest-impact first = score-gain × weight):
1. ...
2. ...
```

Rules for the report:

- Every applicable param gets a row. **n/a** params still listed (as n/a) so the reader sees nothing was skipped silently. Any **n/a must carry a one-line justification** in NOTE (which param, why it doesn't apply) — an unjustified n/a is treated as a low score, never a free pass. This applies especially to U5.
- **GATE verdict** = SHIP only if every gated param scores ≥6; otherwise NO-SHIP. State it on the header line and again in the GATE line with the count.
- **NOTE** is one line — what's there / what's missing, never vague.
- **BLOCKERS** (gated ≤5) listed first, then **FIXES** ranked by score-gain × weight.
- Fixes are concrete and actionable — name the section, the change, the form. "Add a recurrence → Master theorem step to the derivation", not "improve complexity".

```

```
