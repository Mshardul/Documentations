# DSA Vertical — Plan

Plan for adding a **Data Structures & Algorithms** vertical to the wiki, alongside the existing System Design vertical. Built for interview prep.

DS and Algorithms are intertwined, so they live in **one combined vertical** rather than two.

---

## Goal

Interview-ready DSA reference. A reader should be able to: understand a structure/algorithm, know its complexity, know when to reach for it in an interview, see a clean implementation, and practice on representative problems.

---

## Architecture — how it plugs in

DSA is a **sibling vertical**: its own home card, index view, and section pages. System Design is untouched. No new app machinery — every mechanism already exists and is reused.

| Change            | Where                         | What                                                      |
| ----------------- | ----------------------------- | --------------------------------------------------------- |
| Register vertical | `js/state.js` → `WIKIS` array | One new entry (card + index view + routing, all for free) |
| Content tree      | `content/dsa/`                | `index.md` + 3 section folders                            |
| Article templates | `docs/_meta/ai-instructions/` | New instruction file(s) for writing DSA articles          |
| Routing docs      | `wiki/CLAUDE.md`              | File-map + task-routing rows for DSA content              |

Zero JS/CSS feature work. No render changes — the existing `index.md` table format and `# Title` article format drive everything.

**Home card:** title `Data Structures & Algorithms`, icon 🧩.

---

## Content structure (Hybrid)

Three top-level sections. `patterns/` cross-links heavily into the DS/algo articles each pattern leans on, using the existing relative-link form (hover-preview + related-articles features pick these up automatically). Cross-vertical links allowed (e.g. DSA `hash-table` → System Design `consistent-hashing`).

```
content/dsa/
  index.md                  # 3 ## sections, markdown tables → drives index view
  data-structures/          # structural references
  algorithms/               # procedures + correctness
  patterns/                 # recognition + transfer
```

---

## Article templates

Shared spine across all articles; each section adds its own divergence. Template varies **per section**, not per article.

### Shared spine — every article

1. One-line definition + mental model
2. Complexity (time / space)
3. When to use / when not — interview decision cues
4. Implementation: **pseudocode** + **Python** — two distinct roles (see below)
5. Practice problems, tagged by pattern

### Per-section divergence

| Section             | Adds                                                                                                                                                      |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **data-structures** | Operations table (each op + its O()); "how it works" with diagram; variants                                                                               |
| **algorithms**      | Worked example walkthrough + diagram; correctness / invariant intuition; complexity _derivation_ (why the O, not just the number); edge cases             |
| **patterns**        | Recognition signals ("when you see X in the problem → use this"); skeleton code; 3–5 problems reusing the pattern; cross-links to the DS/algo it leans on |

So: **DS = structural reference. Algorithms = procedure + proof. Patterns = recognition + transfer.**

### Pseudocode vs Python — two distinct roles

If both look the same, the pseudocode is dead weight. Each has a different job, and they should **look different on the page**.

|       | Pseudocode                                                               | Python                                                                           |
| ----- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| Style | CLRS-style: mathematical, language-agnostic                              | Real, idiomatic                                                                  |
| Form  | Numbered lines, `for i = 1 to n`, `▷ comment`, explicit indices, `swap`  | Type hints, comprehensions, `enumerate`, `collections.deque`, `heapq`, unpacking |
| Shows | The logic + invariant — the whiteboard version, portable to any language | The reference implementation — production-readable, runnable shape               |
| Role  | The **contract**                                                         | The **reference**                                                                |

Test of distinction: if the pseudocode could be pasted as valid Python, it failed. Where pseudocode says `swap A[i] A[j]`, Python says `nums[i], nums[j] = nums[j], nums[i]`.

**Pseudocode is advised, not mandatory.** Include it wherever it adds signal — bias toward inclusion. Skip it only when it would be noise (trivial operations whose logic the ops table already conveys, e.g. a hash-set membership check). Python is always present.

### Template depth — family slots

Three templates total (DS / Algorithms / Patterns). The DS and Algorithm templates each carry a conditional **family block** — one extra section chosen by the article's family. This balances consistency (one stable contract per section) against fit (a heap and a hash-table genuinely need different sections). The Pattern template is single (pattern articles are already uniform).

Write the shared spine + section-core for every article, then **also** include the one family block matching the article's family.

**DS families**

| Family     | Members                                  | Family block                                                                         |
| ---------- | ---------------------------------------- | ------------------------------------------------------------------------------------ |
| Linear     | array, string, linked-list, stack, queue | **Memory layout** — contiguous vs pointer, cache behavior, resize cost               |
| Hash-based | hash-table, hash-set                     | **Hashing & collisions** — hash fn, chaining vs open-addressing, load factor, resize |
| Tree/heap  | binary-tree, BST, heap, trie             | **Traversal & invariant** — orderings, ordering/heap invariant, balancing            |
| Graph      | graph                                    | **Representations** — matrix vs list, directed/weighted, tradeoff table              |

**Algorithm families**

| Family          | Members                                            | Family block                                                                        |
| --------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Search/divide   | binary-search, sorting, divide & conquer           | **Loop/recurrence invariant** — search-space shrink; recurrence → Master theorem    |
| Traversal       | BFS, DFS, topological-sort, Dijkstra, Bellman-Ford | **Graph/tree assumptions** — visited-state, directed/weighted, queue vs stack vs PQ |
| Recursive/build | recursion, backtracking, DP                        | **State & recurrence** — state def, base case, memo vs tabulation, state-space size |
| Bit/greedy      | bit-manipulation, greedy                           | **Greedy-choice proof** (exchange argument) OR **bit-tricks table**                 |

### DS template — sections

Always (shared spine + DS core):

1. `# Title`
2. Prerequisites
3. Table of Contents
4. **What it is** — one-line def + mental model
5. **How it works** — internal layout + diagram
6. **Operations** — table: each op + time/space O()
7. **Complexity summary** — time/space, best/avg/worst
8. **When to use / when not** — interview decision cues, vs alternatives
9. **Variants** — e.g. array → dynamic array; tree → balanced
10. **Implementation** — pseudocode + Python (structure + core ops)
11. **Gotchas / edge cases** — interview traps
12. **Practice problems** — tagged by pattern, cross-linked

Plus the **family block** (Memory layout / Hashing & collisions / Traversal & invariant / Representations).

### Algorithm template — sections

Always (shared spine + algo core):

1. `# Title`
2. Prerequisites
3. Table of Contents
4. **What it is** — one-line def + mental model
5. **Intuition** — why it works, plain-language
6. **How it works** — step-by-step worked example + diagram
7. **Correctness / invariant** — what holds each step (the "prove it" prompt)
8. **Complexity derivation** — _why_ the O (recurrence/counting), not just the number
9. **When to use / when not** — decision cues, vs alternatives
10. **Edge cases** — empty, single, dupes, overflow, cycles
11. **Implementation** — pseudocode + Python
12. **Practice problems** — tagged by pattern, cross-linked

Plus the **family block** (Loop/recurrence invariant / Graph-tree assumptions / State & recurrence / Greedy-proof or bit-tricks).

### Pattern template — sections

Single template, no family block:

1. `# Title`
2. Prerequisites — the DS/algo the pattern leans on
3. Table of Contents
4. **What it is** — the pattern in one line
5. **Recognition signals** — the heart of the whole vertical. Must be concrete, never vague. Three labeled parts:
   - **Trigger phrases** — literal problem-statement language that maps to this pattern (e.g. sliding window: "longest contiguous subarray", "substring with at most K distinct"; monotonic stack: "next greater element", "largest rectangle"). Not "when dealing with arrays."
   - **Structural cues** — the shape of input/output regardless of wording (e.g. sliding window: linear sequence + answer is a contiguous span + the aggregate updates incrementally as the span moves).
   - **Not to be confused with** — disambiguation vs neighbor patterns (e.g. sliding window vs two pointers: both move pointers — the distinction is _what you track_; prefix-sum vs sliding window: prefix-sum handles negatives / arbitrary range queries, window needs monotonic shrink validity).
6. **How it works** — mechanic + diagram
7. **Skeleton** — pseudocode + Python template to adapt
8. **Complexity** — typical time/space of the pattern
9. **Variations** — common twists
10. **Worked problems** — 3–5 problems showing the pattern reused, each with brief approach
11. **Pitfalls** — where people misapply it
12. **Related** — cross-links to DS/algo + sibling patterns

### Format conventions (match existing wiki)

- Start with `# Title`, then `## Prerequisites`, `## Table of Contents`, body.
- No YAML front matter — search index reads headings.
- Filenames: lowercase, hyphen-separated, `.md`.
- Prerequisites use `[Title](./path.md) [Must read] - reason`; use an HTML-comment link for not-yet-written targets.

---

## Out of scope (YAGNI)

- No runnable / executable code — static pseudocode + Python only.
- No standalone complexity-theory section — Big-O is folded into each article.
- No per-article template variance beyond the 3 section templates.
- This plan sets up the **vertical + templates**. Writing the actual articles = separate content tasks.

---

## Article backlog

### P0 — foundation (21)

Everything else cross-links back to these. No forward dependencies. Ships value fast.

**Data Structures (8)**

| Article                 | Notes                  |
| ----------------------- | ---------------------- |
| Arrays & dynamic arrays | + two-pointer base     |
| Strings                 | building, immutability |
| Hash table / hash map   |                        |
| Linked list             | singly / doubly        |
| Stack                   |                        |
| Queue                   | + deque, circular      |
| Binary tree             |                        |
| Heap / priority queue   |                        |

**Algorithms (7)**

| Article                | Notes              |
| ---------------------- | ------------------ |
| Binary search          | + variants         |
| Sorting                | merge, quick, heap |
| BFS                    |                    |
| DFS                    |                    |
| Recursion fundamentals |                    |
| Backtracking           |                    |
| Dynamic programming    | 1D / 2D intro      |

**Patterns (6)**

| Article                | Leans on               |
| ---------------------- | ---------------------- |
| Two pointers           | arrays                 |
| Sliding window         | arrays, hash-table     |
| Fast & slow pointers   | linked-list            |
| Monotonic stack        | stack                  |
| Tree BFS (level order) | binary-tree, queue     |
| Tree DFS (path sum)    | binary-tree, recursion |

### P1 — builds on P0 (24)

Sits in P1 because each leans on a P0 foundation.

**Data Structures (4):** Hash set · BST · Trie · Graph (adjacency list/matrix)

**Algorithms (6):** Greedy · Divide & conquer · Dijkstra · Bellman-Ford / Floyd-Warshall · Topological sort · Bit manipulation

**Patterns (14):** Merge intervals · Cyclic sort · In-place linked-list reversal · Binary search on answer · Top-K elements (heap) · K-way merge · Subsets / combinations · Permutations · Graph traversal / connected components · Topological sort pattern · DP on grids · DP on subsequences (LIS/LCS) · Prefix sum · Backtracking template

### Final — pattern-selection cheat sheet

Its own article page in `patterns/`, built **last** so it aggregates every pattern's trigger phrases into one "problem says X → use pattern Y" decision table. The most-used interview-prep lookup. Depends on all pattern articles existing first.

### P2 — deferred

Union-Find (disjoint set) · Segment tree / Fenwick (BIT) · LRU cache · MST (Kruskal / Prim) · Kadane (max subarray)

---

## Build order

1. Register the vertical in `WIKIS` + create `content/dsa/` skeleton + `index.md`.
2. Write the DSA article-template instruction file(s) under `docs/_meta/ai-instructions/`.
3. Update `wiki/CLAUDE.md` routing.
4. Write P0 articles (DS → algorithms → patterns, in dependency order).
5. P1, then P2.
6. Pattern-selection cheat sheet last (aggregates all pattern trigger phrases).
