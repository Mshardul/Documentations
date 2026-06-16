# DSA Article Writer

The **source of truth** for writing a DSA article (`content/dsa/**/*.md`). Given a topic, this file tells you what to write, in what shape, and in what order.

**Purpose: make the reader interview- AND competitive-programming-ready** — the theory, the working, and the reasoning, plus the CP toolkit. The two goals shape every param: not "is the article complete?" but "could a candidate walk into an interview _and_ sit a contest with only this page?" Passing [dsa-rater.md](./dsa-rater.md) is the _check_ that you hit that bar — not the goal itself. (See the wiki [readme](../../../readme.md#goals) for the per-vertical goal statement.)

This file **owns the rules**. The rater scores against the param IDs defined here (U1, DS2, PA1, FB, …); it does not redefine them. If a rule changes, change it here.

Companion files:

- [dsa-rater.md](./dsa-rater.md) — scores a finished draft against these params and gates ship / no-ship.
- [content/dsa/\_templates/](../../../content/dsa/_templates/) — copy-paste skeletons: `ds.md`, `algorithm.md`, `pattern.md`.
- [scripts/dsa-check.sh](./scripts/dsa-check.sh) — deterministic check for U8 / U11 / U12.

---

## How to write one

1. **Pick section + family.** Section from the target folder; family from the tables below (DS / Algorithm only — Patterns have none).
   - `content/dsa/data-structures/…` → **DS**
   - `content/dsa/algorithms/…` → **Algorithm**
   - `content/dsa/patterns/…` → **Pattern**
2. **Copy the matching skeleton** from `content/dsa/_templates/` into the target path. Rename to the article slug.
3. **Fill every section.** Apply three tiers of params: universal (every article) + the section block + the one family block. Each param below says exactly what "present at interview depth" means.
4. **Write, then self-rate.** Run the article through [dsa-rater.md](./dsa-rater.md) yourself. Fix every **blocker** (gated param scoring ≤5) and re-rate. Do not hand off a draft that reads NO-SHIP. Iterate writer → rater until SHIP.
5. **Run the filesystem check** before declaring done: `./scripts/dsa-check.sh <article.md>` — fix any U8/U11/U12 FAIL.
6. **Register in the index — first draft only.** A new article is **invisible to the app until it's listed** in `content/dsa/index.md` (the app loads only files reachable from there — nothing globs the directory). So, the **first time** an article passes the checks above, add one row to the matching table in `index.md` (`## Data Structures` / `## Algorithms` / `## Patterns`): `| [Title](./<folder>/<slug>.md) | one-line description |`. **This step runs once, at first publish only** — on every later revision of an existing article, **skip it** (the row already exists; don't add a duplicate, and don't touch the row unless the title or one-liner genuinely changed). Quick check: is this slug already in `index.md`? If yes → revision, skip. If no → first draft, add the row.

---

## Format conventions (every article)

- Open `# Title` → `## Prerequisites` → `## Table of Contents` → body. **No YAML front matter** — the file must not start with `---` (the search index reads headings).
- Filenames: lowercase, hyphen-separated, `.md`.
- H1 title must slugify to the filename (case-insensitive): `# Hash Table` → `hash-table.md`.
- Prerequisites: `[Title](./path.md) [Must read] - reason`. For a not-yet-written target, use an HTML-comment link so it doesn't break: `<!-- [Title](./path.md) -->` with the reason in plain text.
- Cross-vertical links allowed and encouraged (e.g. DSA `hash-table` → `../../system-design/components/consistent-hashing.md`). Every `.md` link must resolve to a real file.
- **Diagrams are real, never placeholders.** Use rendered mermaid or ASCII art — Showdown+Mermaid is configured. A `<!-- diagram -->` TODO does not count.
- **Pseudocode ≠ Python.** They have different jobs and must look different on the page. Pseudocode = the contract (CLRS-style: numbered, `for i = 1 to n`, `▷ comment`, explicit `swap A[i] A[j]`, explicit indices). Python = the reference (idiomatic: type hints, comprehensions, `enumerate`, `collections.deque`, `heapq`, unpacking). **Test: if the pseudocode could be pasted as valid Python, it failed.**

---

## Depth bar — write for a senior, not a beginner

Every param below states what must be _present_. This section states how _deep_ it must go. Presence is necessary, not sufficient.

**Write to the level a staff/senior interviewer would probe to.** A correct-but-shallow answer (the kind a strong junior gives) is **not** a full-credit article. Concretely, the high end of each param means:

- **Go past the obvious.** State the non-obvious cost, not just the headline O(): amortized vs worst-case, the constant factor that bites in practice, the cache effect, the resize/rehash hidden behind "O(1)". If a fact is what _separates_ a senior answer from a junior one, it belongs in the article.
- **Name the trade, not just the choice.** "Use X" is junior. "Use X over Y because A, accepting cost B" is senior. Every recommendation carries its trade-off.
- **At least one trap per article that a junior misses and a senior hits** — overflow on accumulation, iterator invalidation, the 1/4-shrink-not-1/2, the off-by-one in binary-search bounds. The Gotchas section is where seniority shows.

The rater's 9–10 band is reserved for articles that clear this bar. Present-but-shallow caps at 6–8.

### Build, don't repeat (section overlap)

Adjacent sections must **layer**, not restate. The two classic overlaps:

- **U1 (What it is) → DS1/PA2 (How it works).** U1 gives the one-sentence definition + mental model. How-it-works must **explain the internal mechanism that makes that definition true** — the memory layout, the invariant, the address arithmetic — _not_ re-state the definition in more words. If How-it-works opens by re-defining the structure, it failed.
- **AL1 (Intuition) → AL2 (How it works / worked example).** AL1 = plain-language _why it works_ (the idea). AL2 = the concrete _trace_ on real input. AL2 must not re-explain the intuition; it shows it happening step by step.

Each section earns its place by adding a layer the previous one didn't.

### Competitive-programming coverage (where CP lives in an article)

CP-readiness isn't one section — it's distributed, and each home is deliberate:

- **`## Constraints & approach`** (AL10 / PA10) — the CP cornerstone: input-size → expected complexity → which approach. Algorithms and patterns only.
- **`## CP-primitives`** — the contest tools the structure/pattern unlocks (prefix sums, difference array, monotonic stack, …). DS Linear family + patterns.
- **`## Comparison`** (DS8 / AL9) — the scannable this-vs-rivals table.
- **Gotchas (DS7 / AL6)** — CP-flavored traps: overflow, 1-vs-0 indexing, fast I/O, modular arithmetic.
- **Python (U4)** — contest-velocity stdlib (`bisect`, `Counter`, `heapq`) where it replaces hand-rolled logic.
- **Practice (U6) / Worked problems (PA6)** — canonical contest staples, not generic filler.

---

## Universal params — every article

Write all of these regardless of section.

| #   | Param                              | What to write                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| --- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| U1  | One-line definition + mental model | Open "What it is" with a single-sentence definition **and** a mental model / analogy (a comparison to something familiar, or a bolded one-liner). Not a wall of text.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| U2  | Complexity stated                  | Give time and space complexity explicitly in Big-O. Never leave it implied.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| U3  | When to use / when not             | Concrete interview decision cues — _when to reach for this vs an alternative_ — naming **≥1 alternative**. Not "use it when you need it."                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| U4  | Python present + idiomatic         | Real, runnable-shape Python: type hints, comprehensions, `enumerate`, unpacking, stdlib (`collections.deque`, `heapq`) where natural. Not transliterated C. Import every module used at the top of the block. **Contest velocity:** where a stdlib one-liner replaces hand-rolled logic, show it — `bisect.bisect_left`, `collections.Counter`, `heapq.nlargest`, `itertools.accumulate`. CP is speed-of-coding; the from-scratch version is for the Implementation section, the stdlib shortcut is what you'd actually type in a contest.                                                                                                                                                                                                                                                                                                          |
| U5  | Pseudocode present + ≠ Python      | Required for any **non-trivial logic** (real loop / recursion / invariant), in CLRS style (see Format conventions). Skip **only** for a genuinely trivial op the ops table already conveys (e.g. hash-set membership) — and the rater needs that skip justified, so flag it inline.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| U6  | Practice problems                  | A `## Practice problems` section with **≥3 problems**, each a **worked entry**, not a one-liner. Per problem: **(1) the full problem statement** in 2–3 sentences (someone who's never seen it understands the task) + **constraints where they shape the approach**; **(2) the approach/insight** in prose — _why_ this technique; **(3) a short, runnable Python solution** (idiomatic, per U4); **(4) its time/space complexity**. Tag the pattern and cross-link with a relative `.md` link where a target exists. **Favor canonical contest/interview staples** over generic made-up ones (arrays: Subarray Sum Equals K, Trapping Rain Water, Next Permutation — not "sum an array"). **Every problem must exercise a _distinct_ technique** — no two problems solved the same way just to pad the count; quality and coverage over quantity. |
| U7  | Format spine                       | `# Title` → `## Prerequisites` → `## Table of Contents` → body. No YAML.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| U8  | Title ↔ filename                   | H1 slugifies to the filename. (Verified by the script.)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| U9  | Prerequisites format               | `[Title](./path.md) [Must read] - reason`; HTML-comment link for not-yet-written targets. At least one prerequisite must directly support understanding.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| U10 | TOC present                        | A `## Table of Contents` reflecting the headings.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| U11 | Filename convention                | Lowercase, hyphen-separated, `.md`. (Verified by the script.)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| U12 | Links resolve                      | Every `[text](./path.md)` link points to a real file, cross-vertical included. (Verified by the script.)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| U13 | Interview soundbite                | One memorable sentence a candidate can **say out loud** to sum up the concept (e.g. "A heap is a binary tree where the parent beats its children — great for anything 'top-K'."). Distinct from U1: U1 teaches (may run 2–3 sentences); this is the one-line spoken compression, marked as the takeaway.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| U17 | Real-world usage (advisory)        | **One sentence**, folded into `## When to use / when not` (or `## Variants`) — no new heading. Name a real system where this is a workhorse, cross-linking the system-design vertical where natural (heaps → schedulers/event loops; hash tables → DB indexes; arrays → every dynamic language's `list`). Keep it to a single line; this anchors memory and bridges to system design, nothing more.                                                                                                                                                                                                                                                                                                                                                                                                                                                 |

---

## Section block — Data Structures

Write these in addition to the universal params + the DS family block.

| #   | Param                       | What to write                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| --- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DS1 | How it works + diagram      | Explain the internal layout, with a **real diagram** (mermaid or ASCII).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| DS2 | Operations table            | An `## Operations` table — each op (insert / find / delete where applicable) with its **individual time/space O()**. Every op gets a complexity cell.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| DS3 | Complexity summary          | A `## Complexity summary` — time/space broken into best / average / worst where they differ.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| DS4 | When-to-use vs alternatives | Decision cues naming sibling structures (e.g. array vs linked-list). **Prose** — the "reach for X when…" narrative. The scannable rival table is DS8, not here; DS4 is the reasoning, DS8 is the lookup.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| DS5 | Variants                    | A `## Variants` section with ≥1 real variant (array → dynamic array; tree → balanced). **Include CP-relevant variants where they exist**, but mind the boundary with `## CP-primitives`: **DS5 lists the _structural shape_ as a one-liner** (the variant exists; what it is; a pointer onward) — **the _technique_ that wields it, with diagram + "why for CP" + complexity, lives in CP-primitives.** E.g. "difference array" gets a one-line DS5 entry ("an array of deltas — range-update trick, see CP-primitives") **and** its full treatment in CP-primitives. That's a pointer + payload, not duplication. A variant named in DS5 and deferred to CP-primitives for depth is **full credit**, not a gap. |
| DS8 | Comparison table            | A `## Comparison` table placed **after `## When to use / when not`**: rows = this structure + its real rivals, columns = key ops' time/space + the distinguishing trade-off (ordering? contiguity? lookup?). Scannable at a glance — the thing a candidate eyeballs mid-interview. Complements DS4 (prose), does not duplicate it. **Gated.**                                                                                                                                                                                                                                                                                                                                                                    |
| DS6 | Implementation              | An `## Implementation` — structure definition + core ops, in the U4 (Python) / U5 (pseudocode) shape.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| CP  | CP-primitives               | A `## CP-primitives` section placed **after `## Implementation`**: **≥2 contest tools this structure unlocks**, topic-appropriate, each with a tiny diagram/snippet + a one-line "why for CP" (what complexity it collapses). Examples are per-topic, not fixed (array → prefix sums 1D/2D, difference array, counter-array; stack → monotonic stack; queue → 0/1-BFS deque, sliding-window-max). **Gated for the Linear family** (array, string, linked-list, stack, queue); **advisory** for other DS families; pick primitives that genuinely exist — don't manufacture filler.                                                                                                                               |
| DS7 | Gotchas / edge cases        | A `## Gotchas / edge cases` section listing **≥2 interview traps**, **including ≥1 CP-flavored trap where relevant**: overflow on accumulation (prefix sums), 1-vs-0 indexing, fast I/O for huge input, modular arithmetic. The senior-depth trap (per the depth bar) lives here.                                                                                                                                                                                                                                                                                                                                                                                                                                |

---

## Section block — Algorithms

Write these in addition to the universal params + the Algorithm family block.

| #    | Param                           | What to write                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ---- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AL1  | Intuition                       | Plain-language _why it works_, separate from the walkthrough. Use an analogy if it helps.                                                                                                                                                                                                                                                                                                                                                                                                                             |
| AL2  | Worked example + diagram        | A step-by-step trace on a concrete input, with a **real diagram**. Best if it points back to the invariant ("the invariant still holds after this step").                                                                                                                                                                                                                                                                                                                                                             |
| AL3  | Correctness / invariant         | State the loop/recurrence invariant or correctness argument explicitly — the "prove it" prompt.                                                                                                                                                                                                                                                                                                                                                                                                                       |
| AL4  | Complexity derivation           | Show _why_ the O — solve the recurrence, or count steps/space. Not a hand-wavy "it's O(n)".                                                                                                                                                                                                                                                                                                                                                                                                                           |
| AL10 | Constraints & approach          | A `## Constraints & approach` section placed **after `## Complexity derivation`** — the CP cornerstone. A table mapping **input size → expected complexity → which approach**: `n ≤ 20 → O(2ⁿ)/bitmask`, `n ≤ 500 → O(n³)`, `n ≤ 10⁵ → O(n log n)`, `n ≤ 10⁹ → O(log n)/O(1)`. State what the constraint _rules out_ and what it _invites_. This is the single most-tested CP reading skill — "the constraint tells you the algorithm." **Gated. Algorithms (and patterns, as PA10) only — n/a for data structures.** |
| AL5  | When-to-use vs alternatives     | Decision cues vs ≥1 competing algorithm. **Prose**; the scannable rival table is AL9.                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| AL9  | Comparison table                | A `## Comparison` table placed **after `## When to use / when not`**: rows = this algorithm + competing algorithms, columns = time/space + the key constraint each assumes (sorted input? non-negative weights? etc.). Complements AL5 (prose), does not duplicate it. **Gated.**                                                                                                                                                                                                                                     |
| AL6  | Edge cases                      | **≥3 of**: empty, single element, duplicates, overflow, cycles (as applicable). Handle each in the Python where natural (`if not arr: return`). **Include ≥1 CP-flavored trap where relevant**: integer overflow (`int` vs `long`, product overflow), off-by-one in binary-search bounds, modular arithmetic (`% (10⁹+7)`), 1-vs-0 indexing, fast I/O. The senior-depth trap lives here.                                                                                                                              |
| AL7  | Implementation                  | Pseudocode (per U5) + Python (per U4).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| AL8  | What the interviewer probes for | After the correctness argument, list the typical follow-ups — **each as a question + a 2–3 sentence answer sketch** (e.g. Dijkstra: _"Negative weights? — No; a finalized node can later be reached more cheaply via a negative edge. Use Bellman-Ford, O(VE)."_). Whenever you recommend a choice, cover the probe on that choice.                                                                                                                                                                                   |

---

## Section block — Patterns

Write these in addition to the universal params. **Patterns have no family block.**

| #    | Param                   | What to write                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ---- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PA1  | **Recognition signals** | The heart of the vertical — write it most carefully. **Three labeled parts**, each concrete: **(a) Trigger phrases** — **≥2** literal, quoted problem-statement snippets ("longest substring with at most K distinct characters", "next greater element"), not "when dealing with arrays". **(b) Structural cues** — input shape + output property regardless of wording. **(c) Not to be confused with** — name ≥1 neighbor pattern and state the distinction in one crisp sentence. |
| PA2  | How it works + diagram  | The mechanic, with a **real diagram**.                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| PA3  | Skeleton                | Reusable pseudocode (CLRS) + Python template to paste-and-adapt. The Python has a real function signature, no syntax errors, and a `# your logic here` marker where adaptation is needed.                                                                                                                                                                                                                                                                                             |
| PA4  | Complexity              | Typical time/space of the pattern.                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| PA5  | Variations              | Common twists on the pattern.                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| PA6  | Worked problems         | **3–5 problems** reusing the pattern, each with a brief 2–3 sentence approach sketch (not a full solution) showing how the skeleton applies. **Favor contest/interview staples** and note each problem's constraint range where it changes the approach.                                                                                                                                                                                                                              |
| PA10 | Constraints & approach  | A `## Constraints & approach` section: **input size → reach for this pattern (or not)**. The CP reading skill at the pattern level — `n ≤ 10⁵ and "contiguous subarray" → sliding window, not O(n²) brute force`; when the constraint pushes you _off_ this pattern to another. Patterns are CP-heavy, so this is **gated**. Distinct from PA11: PA10 is _when the constraint selects this pattern_; PA11 is _the contest tricks once you're in it_.                                  |
| PA11 | CP-primitives           | A `## CP-primitives` section: the contest tools/variants of this mechanic — the twists that show up in contests but not basic interviews (sliding window → monotonic-deque for window-max; two pointers → meet-in-the-middle; binary-search-on-answer). **≥2**, each with a one-line "why for CP". **Gated** (patterns are the CP core). Distinct from PA5 (Variations = general twists); PA11 = specifically the _contest-flavored_ ones.                                            |
| PA7  | Pitfalls                | **≥2** common misapplications.                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| PA8  | Related                 | Cross-links to the DS/algo it leans on + sibling patterns.                                                                                                                                                                                                                                                                                                                                                                                                                            |
| PA9  | First 30 seconds        | The exact 2–3 sentences a candidate says out loud the moment they spot the pattern (e.g. _"This is a sliding window — longest contiguous subarray satisfying a constraint. Two pointers, expand right, contract left on a hashmap of counts."_). Distinct from PA1: PA1 is how to _recognize_; this is the _script_ once recognized — structure, why, approach in one breath.                                                                                                         |

---

## Family blocks

Pick the one family matching the article. Write its block under the **expected heading**, covering every listed point at depth. The rater scores this as one param (FB), weight 2, gated.

**Family choice — primary subject, not techniques touched in passing.** Sorting is **Search/divide** even though heap-sort references a heap; Backtracking is **Recursive/build** even though it recurses. When genuinely split, pick the family whose block you cover at most depth.

### DS families

| Family     | Members                                  | Heading + must-cover                                                                   |
| ---------- | ---------------------------------------- | -------------------------------------------------------------------------------------- |
| Linear     | array, string, linked-list, stack, queue | `## Memory layout` — contiguous vs pointer, cache behavior, resize cost.               |
| Hash-based | hash-table, hash-set                     | `## Hashing & collisions` — hash fn, chaining vs open-addressing, load factor, resize. |
| Tree/heap  | binary-tree, BST, heap, trie             | `## Traversal & invariant` — orderings, the ordering/heap invariant, balancing.        |
| Graph      | graph                                    | `## Representations` — matrix vs list, directed/weighted, tradeoff table.              |

### Algorithm families

| Family          | Members                                            | Heading + must-cover                                                                  |
| --------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Search/divide   | binary-search, sorting, divide & conquer           | `## Loop/recurrence invariant` — search-space shrink; recurrence → Master theorem.    |
| Traversal       | BFS, DFS, topological-sort, Dijkstra, Bellman-Ford | `## Graph/tree assumptions` — visited-state, directed/weighted, queue vs stack vs PQ. |
| Recursive/build | recursion, backtracking, DP                        | `## State & recurrence` — state def, base case, memo vs tabulation, state-space size. |
| Bit/greedy      | bit-manipulation, greedy                           | `## Greedy-choice proof` (exchange argument) OR `## Bit-tricks table`.                |

---

## Headings list per section

The ordered headings each article must contain. (Copy-paste skeletons live in `content/dsa/_templates/`.)

### Data Structures

```
# Title
## Prerequisites
## Table of Contents
## What it is              (U1, U13)
## How it works            (DS1 — diagram; builds on U1, does not restate it)
## Operations              (DS2)
## Complexity summary      (DS3)
## When to use / when not  (DS4 — prose; U17 one-line real-world usage folds in here)
## Comparison              (DS8 — scannable this-vs-rivals table)
## Variants                (DS5 — include CP-relevant variants)
## <family heading>        (FB — one of Memory layout / Hashing & collisions / Traversal & invariant / Representations)
## Implementation          (DS6 — pseudocode + Python)
## CP-primitives           (CP — gated for Linear family, advisory others; ≥2 contest tools)
## Gotchas / edge cases    (DS7 — include ≥1 CP-flavored trap)
## Practice problems        (U6 — favor canonical staples)
```

### Algorithms

```
# Title
## Prerequisites
## Table of Contents
## What it is              (U1, U13)
## Intuition               (AL1)
## How it works            (AL2 — worked example + diagram; shows the intuition, does not restate it)
## Correctness / invariant (AL3)
## Complexity derivation   (AL4)
## Constraints & approach  (AL10 — input size → expected complexity → approach)
## When to use / when not  (AL5 — prose; U17 one-line real-world usage folds in here)
## Comparison              (AL9 — scannable this-vs-rivals table)
## <family heading>        (FB — Loop/recurrence invariant / Graph-tree assumptions / State & recurrence / Greedy-proof or Bit-tricks)
## Edge cases              (AL6 — include ≥1 CP-flavored trap)
## Implementation          (AL7 — pseudocode + Python)
## What the interviewer probes for  (AL8)
## Practice problems        (U6 — favor canonical staples)
```

### Patterns

```
# Title
## Prerequisites
## Table of Contents
## What it is              (U1, U13)
## Recognition signals     (PA1 — trigger phrases / structural cues / not to be confused with)
## How it works            (PA2 — diagram)
## Skeleton                (PA3 — pseudocode + Python template)
## Complexity              (PA4)
## Constraints & approach  (PA10 — input size → reach for this pattern or not)
## Variations              (PA5)
## CP-primitives           (PA11 — contest-flavored tricks/variants of the mechanic)
## Worked problems         (PA6 — favor staples, note constraint ranges)
## Pitfalls                (PA7)
## First 30 seconds        (PA9)
## Related                 (PA8)
## Practice problems        (U6 — favor canonical staples)
```
