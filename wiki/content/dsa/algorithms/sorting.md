# Sorting

## Prerequisites

- **Big-O Notation** [Must read] - sorting is where the O(n²) vs O(n log n) divide is most consequential; you can't compare algorithms without it. <!-- U9: not-yet-written target — wire to `algorithms/big-o-notation.md` (bracket-link form) once that page exists. -->
- [Array](../data-structures/array.md) [Must read] - sorts operate on indexable sequences; in-place swaps and partitioning assume O(1) random access.
- [Binary Search](./binary-search.md) [Should read] - sorting's payoff is often "sort once, then binary-search many times"; the divide-and-conquer sorts share its recurrence machinery.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Table of Contents](#table-of-contents)
- [What it is](#what-it-is)
- [The sorting algorithms](#the-sorting-algorithms)
- [Why O(n log n) is the floor](#why-on-log-n-is-the-floor)
- [Comparison](#comparison)
- [Which sort, when](#which-sort-when)
- [Constraints & approach](#constraints--approach)

> **Hub article.** This page is the _survey + decision layer_ for sorting — it does not trace any single algorithm. Each algorithm has (or will have) its own page with the full worked example, invariant, complexity derivation, implementation, and practice problems. Use this page to choose _which_ sort; follow the link to learn _how_ it works.

## What it is

**Sorting** rearranges a sequence into a defined order (ascending, by key, by custom comparator). It is the single most useful pre-processing step in all of algorithms: a sorted array unlocks O(log n) lookup, O(1) min/max, easy deduplication, two-pointer sweeps, and greedy scheduling.

Mental model: **arranging a hand of playing cards.** Insertion sort is how most people actually do it — pick up cards one at a time, slide each into its place among the cards already sorted. Merge sort is "split the hand in two, sort each pile, riffle them together." Quicksort is "pick a card, throw smaller ones left and bigger ones right, repeat." Same goal, different _recurrence_.

Two facts do most of the work in an interview. First, **comparison-based sorting cannot beat O(n log n)** — that's a proven lower bound, not a failure of cleverness. Second, you almost never _implement_ a sort in practice — you call the library sort (Python's Timsort, C++'s introsort) — so the real skill is knowing _which_ algorithm runs underneath, what it guarantees (stability? worst case?), and when to break the comparison model entirely with counting/radix sort to get O(n).

> **Takeaway (say this out loud):** "Comparison sorts bottom out at O(n log n) — merge sort guarantees it and is stable, quicksort hits it on average with O(1) space, and you only beat it (O(n)) by abandoning comparisons for counting/radix on bounded integer keys."

**Complexity:** O(n log n) time for the best comparison sorts; O(n) for non-comparison sorts on bounded keys. Space ranges from O(1) (heapsort, in-place quicksort) to O(n) (merge sort).

## The sorting algorithms

Each algorithm below gets its own page with the full treatment (worked trace, invariant, complexity derivation, implementation, gotchas, practice). This list is the map; the [Comparison](#comparison) table is the at-a-glance scorecard.

**Comparison sorts** — order by pairwise comparison; bounded below by O(n log n):

- [Merge Sort](./merge-sort.md) — divide the array in half, recursively sort each half, then merge the two sorted runs. Guaranteed O(n log n) in _all_ cases (no bad input) and **stable**, at the cost of O(n) extra space. The canonical divide-and-conquer sort and the basis of external/merge sorting for data too big for RAM.
- [Quicksort](./quicksort.md) — partition around a pivot so smaller elements go left and larger go right, then recurse on each side in place. O(n log n) _average_ with a tiny constant factor and O(1) extra space — the in-memory default — but a naive pivot degrades to O(n²) on sorted input, so randomize or use median-of-three.
- [Heapsort](./heapsort.md) — build a max-heap, then repeatedly extract the max to the array's end. O(n log n) in the _worst_ case **and** O(1) space — the only comparison sort with both — but its scattered memory access is cache-unfriendly, so it loses to quicksort in practice. Leans on the [heap](../data-structures/heap.md) structure.
- [Insertion Sort](./insertion-sort.md) — grow a sorted prefix one element at a time, sliding each new element back into place. O(n²) in general but **O(n) on nearly-sorted input** and stable with O(1) space; this adaptiveness is why Timsort uses it for small runs.

**Non-comparison sorts** — exploit key structure to skip comparisons entirely, reaching O(n):

- [Counting Sort](./counting-sort.md) — tally how many times each key appears, then emit keys in order from the tallies. O(n + k) for keys in a range of size `k`; linear when `k = O(n)`, but allocates a `k`-sized array, so it's useless (or OOMs) when the key range is huge. Stable, and the inner loop of radix sort.
- [Radix Sort](./radix-sort.md) — sort by one digit (or byte) at a time, least-significant first, using a stable counting sort per pass. O(d·(n + b)) for `d` digits in base `b` — beats O(n log n) for fixed-width integer or string keys, at the cost of generality.

> Each algorithm name above becomes a link as its dedicated page lands; until then the depth lives here in summary.

## Why O(n log n) is the floor

Why is O(n log n) the floor for comparison sorts? Because a sort must distinguish between all `n!` possible input orderings, and each comparison yields just **one bit** (less-than or not). A decision tree that separates `n!` leaves needs depth at least `log₂(n!)`, and by Stirling `log₂(n!) ≈ n log₂ n`. So _any_ algorithm that learns the order only through pairwise comparisons must, in the worst case, make ~`n log n` of them. You cannot out-clever information theory.

The way _around_ the bound is to stop comparing. If keys are integers in a small range, you can **index by the key itself** — count how many times each value appears (counting sort) or bucket by digit (radix sort) — and never compare two elements at all. That's how the non-comparison sorts reach O(n): they've replaced "ask which is bigger" with "look up where it goes."

## Comparison

| Algorithm       | Best      | Average   | Worst     | Space    | Stable | Notes                                           |
| --------------- | --------- | --------- | --------- | -------- | ------ | ----------------------------------------------- |
| **Merge sort**  | n log n   | n log n   | n log n   | O(n)     | ✅     | Guaranteed bound; external sort; predictable    |
| **Quicksort**   | n log n   | n log n   | **n²**    | O(log n) | ❌     | Fast constant; in-place; randomize the pivot    |
| **Heapsort**    | n log n   | n log n   | n log n   | O(1)     | ❌     | Worst-case bound + O(1) space; cache-unfriendly |
| **Insertion**   | **n**     | n²        | n²        | O(1)     | ✅     | Great for tiny/nearly-sorted; Timsort uses it   |
| **Counting**    | n + k     | n + k     | n + k     | O(n + k) | ✅     | Non-comparison; bounded integer keys only       |
| **Radix (LSD)** | d·(n + b) | d·(n + b) | d·(n + b) | O(n + b) | ✅     | Non-comparison; fixed-width keys                |

The three axes an interviewer checks: **worst-case bound** (merge/heap, not quick), **stability** (merge/insertion/counting, not quick/heap), and **space** (heap/quick in-place, merge needs O(n)).

## Which sort, when

Default to your language's **library sort** — Timsort (Python, Java objects) or introsort (C++) — for anything general. They are battle-tested, hit O(n log n), and Timsort is adaptive (near-O(n) on partially-sorted input) and stable.

Reach for **merge sort** explicitly when you need a _guaranteed_ O(n log n) worst case (quicksort's O(n²) tail is unacceptable — e.g. adversarial input) or **stability** (equal keys keep input order, critical for multi-key sorts). Reach for **quicksort** when memory is tight and average-case speed matters — its in-place O(1)-extra and small constant win in practice. Reach for **heapsort** when you need O(n log n) worst case _and_ O(1) space, accepting poor cache behavior. Reach for **counting/radix sort** only when keys are bounded integers and you must beat O(n log n) — they don't generalize to arbitrary comparables.

Don't sort at all when you only need the **k-th element** (use quickselect, O(n) average — a one-sided quicksort, covered on the Quicksort page) or the **top-k** (a heap, O(n log k)) — sorting throws away work by ordering elements you don't care about.

Every database `ORDER BY`, the merge step of external sorting for data too big for RAM, and Timsort's run-detection all live here.

## Constraints & approach

The constraint on **key range and `n`** tells you whether you can break the comparison barrier — the contest-reading skill, applied to the _family_ (each algorithm's page carries its own size→approach detail).

| Constraint                                  | Expected complexity | Approach                                                                                  |
| ------------------------------------------- | ------------------- | ----------------------------------------------------------------------------------------- |
| `n ≤ 10` (or "permutations")                | O(n²) / O(n!)       | Any sort is fine; size invites brute force / `next_permutation` over sorting machinery.   |
| `n ≤ 10⁵–10⁶`, arbitrary comparable keys    | O(n log n)          | Library comparison sort (Timsort/introsort) — the default; can't beat it generically.     |
| `n ≤ 10⁷`, integer keys in range `k = O(n)` | O(n + k)            | **Counting sort** — the small key range _rules out_ needing comparisons.                  |
| Huge `n`, fixed-width integer/string keys   | O(d·(n + b))        | **Radix sort** — `d` digits, base `b`; integer/string keys _invite_ digit-bucketing.      |
| Need the k-th element only, not full order  | O(n) average        | **Quickselect** — sorting the whole array is overkill; partition toward the one position. |

The senior reading: "values are 0–`10⁵`" or "lowercase letters only" is the tell for counting/radix sort (O(n)); a generic "comparable objects" with no key structure locks you into O(n log n).
