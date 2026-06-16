# DSA Article Rater

Scores a written DSA article (`content/dsa/**/*.md`) for interview-readiness and gives a **publish gate** (ship / no-ship). Given an article path, follow the steps below and produce a scored report. Scoring is LLM judgment — no separate parser. The same article may vary slightly run-to-run on judgment params; that is accepted. Filesystem params (U8/U11/U12) are deterministic and supplied by a script — see step 5.

**Rules live in [dsa-writer.md](./dsa-writer.md).** That file defines every param (U1, DS2, PA1, FB, …) — what must be present, in what shape. This file does **not** redefine them; it scores against them by ID and decides publishability. If you need to know what a param _requires_, read the writer. This file owns: detection, the scoring scale, weights, the gate, the filesystem pre-check, and the report format.

---

## How to use

Input: one article path (or a glob to batch-rate several, one report each).

1. **Read the article.**
2. **Detect the section** from the folder:
   - `content/dsa/data-structures/…` → **DS**
   - `content/dsa/algorithms/…` → **Algorithm**
   - `content/dsa/patterns/…` → **Pattern**
3. **Detect the family** (DS and Algorithm only — Pattern has none) using the family tables in the writer. **Tie-breaker:** family = the article's _primary subject_, not techniques touched in passing (Sorting = Search/divide even though heap-sort references a heap; Backtracking = Recursive/build even though it recurses). When genuinely split, pick the family whose must-cover block the article covers at most depth, and name the runner-up in the report.
4. **Apply params in three tiers:** universal (every article) + the matching section block + the matching family block — all defined in the writer. Params that don't apply (e.g. recognition-signals on an algorithm) are marked **n/a** and dropped from the total.
5. **Resolve filesystem checks via the pre-check script — facts supplied, not guessed.** U8, U11, U12 are deterministic and must not vary run-to-run. Run `./scripts/dsa-check.sh <article.md>` (Bash wrapper over `dsa_check.py`) and paste its PASS/FAIL lines into the U8/U11/U12 rows. Do **not** judge these three from reading alone. If the script can't run, say so in the report and fall back to a manual tree check — never silently guess.
6. **Score, gate, and report** in the output format at the bottom.

---

## Scoring

- Each applicable param scored **0–10** against its definition in the writer:
  - **9–10** — fully present, correct, at interview depth.
  - **6–8** — present but thin, partially correct, or missing a sub-part.
  - **3–5** — gestured at but weak / vague / mostly absent.
  - **0–2** — missing or wrong.
- Each param has a **weight** (below). Overall = weighted average, scaled to **/100**:
  `overall = round( 100 * Σ(score_i × weight_i) / Σ(10 × weight_i) )` over applicable params only.
- **n/a params** are excluded from both sums — weights renormalize automatically.

### Publish gate (separate from the score)

Each param is **gated** or **advisory**:

- **Gated** params must score **≥6** to publish. Any gated param scoring **≤5** → **NO-SHIP**, regardless of the /100.
- **Advisory** params never block — they only inform fixes.
- A gated param scoring ≤5 is a **blocker** and is listed first in the report.

So a 91/100 article with one gated param at 4 still reads **NO-SHIP** until that param is fixed. The score measures quality; the gate measures publishability.

### Param caps (judgment notes the score scale can't carry)

A few params have a hard cap regardless of how good the rest reads — apply these when scoring:

- **PA1 (recognition signals)** — if any of the three labeled parts (trigger phrases / structural cues / not-to-be-confused-with) is missing or vague, **cap at 5** (→ blocker).
- **U5 (pseudocode ≠ Python)** — if it could be pasted as valid Python, **cap at 5**. Pseudocode absent where non-trivial logic exists, or an **unjustified n/a**, scores **0–2** (never a free n/a pass — an n/a must name the trivial op in NOTE).
- **DS1 / AL2 / PA2 (diagram)** — a `<!-- diagram -->` placeholder or TODO instead of a real mermaid/ASCII diagram scores **≤2**.

### Weights

| Weight  | Params                                                                                                            |
| ------- | ----------------------------------------------------------------------------------------------------------------- |
| **3**   | PA1 Recognition signals (pattern)                                                                                 |
| **2**   | AL4 Complexity derivation · AL1 Intuition · U5 Pseudocode ≠ Python · FB Family block · PA3 Skeleton               |
| **1**   | All other section-core params + U1 def · U2 complexity · U3 when-to-use · U4 Python · U6 practice · U12 links     |
| **0.5** | U8 Title↔filename · U9 Prerequisites format · U10 TOC · U11 Filename convention · U13 soundbite · advisory params |

### Gate per param

| Gate         | Params                                                                          |
| ------------ | ------------------------------------------------------------------------------- |
| **gated**    | U1–U8, U11, U12 · all DS except DS5 · all AL except AL8 · PA1–PA4, PA6–PA8 · FB |
| **advisory** | U9, U10, U13 · DS5 · AL8 · PA5, PA9                                             |

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
