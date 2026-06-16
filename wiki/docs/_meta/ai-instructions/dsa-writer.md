# DSA Article Writer

The **source of truth** for writing a DSA article (`content/dsa/**/*.md`). Given a topic, this file tells you what to write, in what shape, and in what order — so the article passes [dsa-rater.md](./dsa-rater.md) on the first or second pass.

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

## Universal params — every article

Write all of these regardless of section.

| #   | Param                              | What to write                                                                                                                                                                                                                                                                                            |
| --- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| U1  | One-line definition + mental model | Open "What it is" with a single-sentence definition **and** a mental model / analogy (a comparison to something familiar, or a bolded one-liner). Not a wall of text.                                                                                                                                    |
| U2  | Complexity stated                  | Give time and space complexity explicitly in Big-O. Never leave it implied.                                                                                                                                                                                                                              |
| U3  | When to use / when not             | Concrete interview decision cues — _when to reach for this vs an alternative_ — naming **≥1 alternative**. Not "use it when you need it."                                                                                                                                                                |
| U4  | Python present + idiomatic         | Real, runnable-shape Python: type hints, comprehensions, `enumerate`, unpacking, stdlib (`collections.deque`, `heapq`) where natural. Not transliterated C. Import every module used at the top of the block.                                                                                            |
| U5  | Pseudocode present + ≠ Python      | Required for any **non-trivial logic** (real loop / recursion / invariant), in CLRS style (see Format conventions). Skip **only** for a genuinely trivial op the ops table already conveys (e.g. hash-set membership) — and the rater needs that skip justified, so flag it inline.                      |
| U6  | Practice problems                  | A `## Practice problems` section with **≥3 representative problems**, each tagged by pattern and cross-linked with a relative `.md` link. Not filler.                                                                                                                                                    |
| U7  | Format spine                       | `# Title` → `## Prerequisites` → `## Table of Contents` → body. No YAML.                                                                                                                                                                                                                                 |
| U8  | Title ↔ filename                   | H1 slugifies to the filename. (Verified by the script.)                                                                                                                                                                                                                                                  |
| U9  | Prerequisites format               | `[Title](./path.md) [Must read] - reason`; HTML-comment link for not-yet-written targets. At least one prerequisite must directly support understanding.                                                                                                                                                 |
| U10 | TOC present                        | A `## Table of Contents` reflecting the headings.                                                                                                                                                                                                                                                        |
| U11 | Filename convention                | Lowercase, hyphen-separated, `.md`. (Verified by the script.)                                                                                                                                                                                                                                            |
| U12 | Links resolve                      | Every `[text](./path.md)` link points to a real file, cross-vertical included. (Verified by the script.)                                                                                                                                                                                                 |
| U13 | Interview soundbite                | One memorable sentence a candidate can **say out loud** to sum up the concept (e.g. "A heap is a binary tree where the parent beats its children — great for anything 'top-K'."). Distinct from U1: U1 teaches (may run 2–3 sentences); this is the one-line spoken compression, marked as the takeaway. |

---

## Section block — Data Structures

Write these in addition to the universal params + the DS family block.

| #   | Param                       | What to write                                                                                                                                         |
| --- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| DS1 | How it works + diagram      | Explain the internal layout, with a **real diagram** (mermaid or ASCII).                                                                              |
| DS2 | Operations table            | An `## Operations` table — each op (insert / find / delete where applicable) with its **individual time/space O()**. Every op gets a complexity cell. |
| DS3 | Complexity summary          | A `## Complexity summary` — time/space broken into best / average / worst where they differ.                                                          |
| DS4 | When-to-use vs alternatives | Decision cues naming sibling structures (e.g. array vs linked-list).                                                                                  |
| DS5 | Variants                    | A `## Variants` section with ≥1 real variant (array → dynamic array; tree → balanced).                                                                |
| DS6 | Implementation              | An `## Implementation` — structure definition + core ops, in the U4 (Python) / U5 (pseudocode) shape.                                                 |
| DS7 | Gotchas / edge cases        | A `## Gotchas / edge cases` section listing **≥2 interview traps**.                                                                                   |

---

## Section block — Algorithms

Write these in addition to the universal params + the Algorithm family block.

| #   | Param                           | What to write                                                                                                                                                                                                                                                                                                                       |
| --- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AL1 | Intuition                       | Plain-language _why it works_, separate from the walkthrough. Use an analogy if it helps.                                                                                                                                                                                                                                           |
| AL2 | Worked example + diagram        | A step-by-step trace on a concrete input, with a **real diagram**. Best if it points back to the invariant ("the invariant still holds after this step").                                                                                                                                                                           |
| AL3 | Correctness / invariant         | State the loop/recurrence invariant or correctness argument explicitly — the "prove it" prompt.                                                                                                                                                                                                                                     |
| AL4 | Complexity derivation           | Show _why_ the O — solve the recurrence, or count steps/space. Not a hand-wavy "it's O(n)".                                                                                                                                                                                                                                         |
| AL5 | When-to-use vs alternatives     | Decision cues vs ≥1 competing algorithm.                                                                                                                                                                                                                                                                                            |
| AL6 | Edge cases                      | **≥3 of**: empty, single element, duplicates, overflow, cycles (as applicable). Handle each in the Python where natural (`if not arr: return`).                                                                                                                                                                                     |
| AL7 | Implementation                  | Pseudocode (per U5) + Python (per U4).                                                                                                                                                                                                                                                                                              |
| AL8 | What the interviewer probes for | After the correctness argument, list the typical follow-ups — **each as a question + a 2–3 sentence answer sketch** (e.g. Dijkstra: _"Negative weights? — No; a finalized node can later be reached more cheaply via a negative edge. Use Bellman-Ford, O(VE)."_). Whenever you recommend a choice, cover the probe on that choice. |

---

## Section block — Patterns

Write these in addition to the universal params. **Patterns have no family block.**

| #   | Param                   | What to write                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| --- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PA1 | **Recognition signals** | The heart of the vertical — write it most carefully. **Three labeled parts**, each concrete: **(a) Trigger phrases** — **≥2** literal, quoted problem-statement snippets ("longest substring with at most K distinct characters", "next greater element"), not "when dealing with arrays". **(b) Structural cues** — input shape + output property regardless of wording. **(c) Not to be confused with** — name ≥1 neighbor pattern and state the distinction in one crisp sentence. |
| PA2 | How it works + diagram  | The mechanic, with a **real diagram**.                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| PA3 | Skeleton                | Reusable pseudocode (CLRS) + Python template to paste-and-adapt. The Python has a real function signature, no syntax errors, and a `# your logic here` marker where adaptation is needed.                                                                                                                                                                                                                                                                                             |
| PA4 | Complexity              | Typical time/space of the pattern.                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| PA5 | Variations              | Common twists on the pattern.                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| PA6 | Worked problems         | **3–5 problems** reusing the pattern, each with a brief 2–3 sentence approach sketch (not a full solution) showing how the skeleton applies.                                                                                                                                                                                                                                                                                                                                          |
| PA7 | Pitfalls                | **≥2** common misapplications.                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| PA8 | Related                 | Cross-links to the DS/algo it leans on + sibling patterns.                                                                                                                                                                                                                                                                                                                                                                                                                            |
| PA9 | First 30 seconds        | The exact 2–3 sentences a candidate says out loud the moment they spot the pattern (e.g. _"This is a sliding window — longest contiguous subarray satisfying a constraint. Two pointers, expand right, contract left on a hashmap of counts."_). Distinct from PA1: PA1 is how to _recognize_; this is the _script_ once recognized — structure, why, approach in one breath.                                                                                                         |

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
## How it works            (DS1 — diagram)
## Operations              (DS2)
## Complexity summary      (DS3)
## When to use / when not  (DS4)
## Variants                (DS5)
## <family heading>        (FB — one of Memory layout / Hashing & collisions / Traversal & invariant / Representations)
## Implementation          (DS6 — pseudocode + Python)
## Gotchas / edge cases    (DS7)
## Practice problems        (U6)
```

### Algorithms

```
# Title
## Prerequisites
## Table of Contents
## What it is              (U1, U13)
## Intuition               (AL1)
## How it works            (AL2 — worked example + diagram)
## Correctness / invariant (AL3)
## Complexity derivation   (AL4)
## When to use / when not  (AL5)
## <family heading>        (FB — Loop/recurrence invariant / Graph-tree assumptions / State & recurrence / Greedy-proof or Bit-tricks)
## Edge cases              (AL6)
## Implementation          (AL7 — pseudocode + Python)
## What the interviewer probes for  (AL8)
## Practice problems        (U6)
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
## Variations              (PA5)
## Worked problems         (PA6)
## Pitfalls                (PA7)
## First 30 seconds        (PA9)
## Related                 (PA8)
## Practice problems        (U6)
```
