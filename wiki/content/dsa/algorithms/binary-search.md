# Binary Search

## Prerequisites

- **Big-O Notation** [Must read] - the whole appeal of binary search is the jump from O(n) to O(log n); you can't appreciate the gain without reading complexity. <!-- U9: not-yet-written target — wire to `algorithms/big-o-notation.md` (bracket-link form) once that page exists. -->
- [Array](../data-structures/array.md) [Must read] - binary search needs O(1) random access by index; it only works on a contiguous, indexable structure (or anything that behaves like one).

## Table of Contents

- [Prerequisites](#prerequisites)
- [Table of Contents](#table-of-contents)
- [What it is](#what-it-is)
- [Intuition](#intuition)
- [How it works](#how-it-works)
- [Correctness / invariant](#correctness--invariant)
- [Complexity derivation](#complexity-derivation)
- [Constraints & approach](#constraints--approach)
- [When to use / when not](#when-to-use--when-not)
- [Comparison](#comparison)
- [Loop/recurrence invariant](#looprecurrence-invariant)
- [Edge cases](#edge-cases)
- [Implementation](#implementation)
- [What the interviewer probes for](#what-the-interviewer-probes-for)
- [Practice problems](#practice-problems)
  - [First Bad Version](#1-first-bad-version--binary-search-on-a-predicate)
  - [Search in Rotated Sorted Array](#2-search-in-rotated-sorted-array--half-is-always-sorted)
  - [Koko Eating Bananas](#3-koko-eating-bananas--binary-search-on-the-answer)
  - [Median of Two Sorted Arrays](#4-median-of-two-sorted-arrays--partition-search)

## What it is

**Binary search** finds a target in a **sorted** sequence by repeatedly halving the search interval: compare the middle element to the target, then discard the half that cannot contain it.

Mental model: **looking up a word in a physical dictionary.** You don't read page 1, then page 2 — you flip to the middle, see whether your word falls before or after, and throw away half the book. Each flip halves what's left, so a 1000-page dictionary is settled in ~10 flips, not 1000.

The deeper idea — the one that separates a junior from a senior answer — is that binary search is **not really about sorted arrays**. It's about any search space split by a **monotonic predicate**: a yes/no test that, once it flips from no to yes, stays yes. "Is `a[i] >= target`?" is one such predicate. So is "can Koko finish the bananas eating `k`/hour?" The array is the easy case; "binary search on the answer" is the same algorithm pointed at an abstract space.

> **Takeaway (say this out loud):** "Binary search halves a sorted search space each step — O(log n) — and generalizes to _any monotonic predicate_, which is how you binary-search on the answer."

**Complexity:** O(log n) time, O(1) space (iterative). Recursive form is O(log n) stack space.

## Intuition

Why does halving work? Because **sorted order lets one comparison eliminate half the candidates.** When you look at the middle element `a[mid]` and it's smaller than your target, _every element to its left is also smaller_ (that's what sorted means) — so the target, if present, must be to the right. One comparison just ruled out `mid + 1` elements for free. Repeat, and the candidate set collapses geometrically: n → n/2 → n/4 → … → 1.

Linear search throws away **one** candidate per comparison; binary search throws away **half**. That's the entire difference between O(n) and O(log n), and it's bought entirely by the sortedness precondition — which is also why an unsorted array can't be binary-searched, and why sorting first (O(n log n)) can pay for itself if you'll search many times.

## How it works

Search for `target = 23` in `a = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]` (indices 0–9).

```
a:    2   5   8  12  16  23  38  56  72  91
idx:  0   1   2   3   4   5   6   7   8   9

step 1:  lo=0, hi=9  → mid=4 (a[4]=16)   16 < 23 → go right, lo=5
                 lo───────────────────────────hi
                 [ . . . . . | x x x x x ]      mid=4, discard ≤16
                              lo──────────hi

step 2:  lo=5, hi=9  → mid=7 (a[7]=56)   56 > 23 → go left, hi=6
                              lo─────────hi
                              [ . | x x x ]      mid=7, discard ≥56
                              lo──hi

step 3:  lo=5, hi=6  → mid=5 (a[5]=23)   23 == 23 → FOUND at index 5
                              ↑ mid
```

Three comparisons settle a 10-element array. Note how the live window `[lo, hi]` shrinks every step and `mid = lo + (hi - lo) // 2` always lands inside it — that containment is the invariant doing its job (see below).

## Correctness / invariant

The loop maintains one **invariant**: _if the target is in the array, it lies within the closed interval `[lo, hi]`._

- **Initialization:** before the loop, `lo = 0, hi = n-1` — the interval is the whole array, so the invariant holds trivially.
- **Maintenance:** each iteration computes `mid` inside `[lo, hi]`. If `a[mid] < target`, then by sortedness every index `≤ mid` is too small, so the target (if present) is in `[mid+1, hi]` — we set `lo = mid+1` and the invariant survives. The `a[mid] > target` case is symmetric (`hi = mid-1`). If `a[mid] == target`, we return.
- **Termination:** the interval strictly shrinks every iteration (either `lo` rises or `hi` falls), so eventually `lo > hi`. At that point the interval is empty; by the invariant the target was never present, and we return "not found."

The invariant is the whole correctness proof: it guarantees we never discard a half that could contain the target.

## Complexity derivation

Let `T(n)` be the number of comparisons on an interval of size `n`. Each step does O(1) work (one compare, one assignment) and recurses on **half**:

```
T(n) = T(n/2) + O(1)
```

Unrolling: `T(n) = T(n/2) + 1 = T(n/4) + 2 = … = T(n/2^k) + k`. The interval bottoms out at size 1 when `n/2^k = 1`, i.e. `k = log₂ n`. So `T(n) = O(log n)`.

By the Master theorem (`a=1, b=2, f(n)=O(1)`): `n^(log_b a) = n^0 = 1`, which matches `f(n)`, giving case 2 → `Θ(log n)`. Space is O(1) for the iterative form (two index variables); the recursive form adds O(log n) call-stack frames.

## Constraints & approach

`log₂(10⁹) ≈ 30`, so binary search is effectively free even on enormous spaces — which is exactly when the constraint _invites_ it.

| Input size `n`          | Expected complexity   | What it tells you                                                                                       |
| ----------------------- | --------------------- | ------------------------------------------------------------------------------------------------------- |
| `n ≤ 10⁹` (or larger)   | O(log n)              | A linear scan is impossible at this size → the answer is binary search (often _on the answer_).         |
| Answer in `[1, 10¹⁸]`   | O(log(max)) per check | "Find the minimum/maximum X such that …" with a huge value range → binary-search the answer space.      |
| `n ≤ 10⁶`, many queries | O(log n) per query    | Sorting once (O(n log n)) then binary-searching each query beats O(n) per query.                        |
| `n ≤ 10³`               | O(n) is fine          | The constraint _rules out_ needing binary search — a linear scan passes; reach for it only for clarity. |

The senior reading: a value range like `1 ≤ x ≤ 10⁹` in the answer (not the input) is the classic tell for **binary search on the answer** — you're not searching the input, you're searching the space of possible answers, gated by a monotonic feasibility check.

## When to use / when not

Reach for binary search when the data is **sorted (or sortable)** and you'll do enough lookups to amortize the sort, or when the problem hides a **monotonic predicate** over a numeric answer range ("smallest capacity that works", "largest size that fits"). Prefer it over a **linear scan** the moment `n` is large and the access pattern is read-heavy.

Don't use it when the data is unsorted and you search only once — sorting costs O(n log n) just to enable an O(log n) lookup, so a single O(n) scan is cheaper. Skip it for a **hash table** when you only need exact-match membership and have no ordering requirement: a hash gives O(1) average lookup versus binary search's O(log n), but loses range/neighbor queries. And it's a poor fit for a **linked list**, where there's no O(1) random access — `mid` would cost O(n) to reach, collapsing the win.

When the array's length is **unknown or unbounded** (a stream, an infinite sorted sequence) or the target is known to sit **near the front**, reach for **exponential search**: probe indices `1, 2, 4, 8, …` until you overshoot, then binary-search the last bracket `[2^(k-1), 2^k]` — O(log i) where `i` is the target's index. The win is real only when `i ≪ n` (or `n` is unknowable); if the target is near the end, `i ≈ n` and you're back to O(log n) plus the probing overhead, so it's not a blanket upgrade. Its role is finding a usable upper bound before binary-searching — the same move "binary search on the answer" makes when no `hi` is handed to you.

Binary search is the workhorse inside `bisect` (Python), `std::lower_bound` (C++), and database **B-tree index** traversal — every indexed `WHERE id = ?` lookup is binary search over sorted keys.

## Comparison

| Algorithm            | Time             | Space | Assumes                                    | Best for                                    |
| -------------------- | ---------------- | ----- | ------------------------------------------ | ------------------------------------------- |
| **Binary search**    | O(log n)         | O(1)  | sorted, random access                      | sorted lookups, search-on-answer            |
| Linear search        | O(n)             | O(1)  | nothing                                    | unsorted, single lookup, tiny `n`           |
| Hash table lookup    | O(1) avg         | O(n)  | hashable keys, no ordering                 | exact-match membership                      |
| Interpolation search | O(log log n) avg | O(1)  | sorted **and** ~uniform values             | sorted numeric data with even distribution  |
| Exponential search   | O(log i)         | O(1)  | sorted, **unbounded** or target near front | unknown-length input; target near the start |

Interpolation search beats binary search on uniformly distributed data by _guessing_ where the target is (like flipping to "S" in a dictionary, not the middle), but degrades to O(n) on skewed data — binary search's O(log n) is the safe, distribution-free choice.

## Loop/recurrence invariant

The **search-space shrink** is the family signature: every step provably discards a fixed _fraction_ (here, half) of the remaining candidates, so the space collapses logarithmically.

- **Invariant (closed-interval form):** `target ∈ a[lo..hi]` if it exists anywhere. Proven above.
- **Recurrence:** `T(n) = T(n/2) + O(1)` → `Θ(log n)` (Master theorem case 2).
- **Why halving and not thirds?** Splitting into 3 (ternary search) gives `T(n) = T(n/3) + 2` comparisons per step → `2·log₃ n ≈ 1.26·log₂ n` comparisons: _more_ work, not less. Halving is optimal for a comparison-based search because one comparison yields one bit of information, and one bit halves the space. (Ternary search has its place — unimodal-function maximization — but not for sorted lookup.)

The shrink-by-a-fraction invariant is exactly what divide-and-conquer sorts ([sorting](./sorting.md)) reuse: merge sort and quicksort split the array in halves and recurse, hitting the same `T(n) = 2T(n/2) + O(n)` shape.

## Edge cases

- **Empty array** — `lo=0, hi=-1`, loop never runs, returns not-found. Handled for free by `while lo <= hi`.
- **Single element** — `lo == hi`, one comparison, then `lo > hi`. Correct.
- **Target smaller than all / larger than all** — interval collapses from one side; returns not-found.
- **Duplicates** — plain binary search returns _some_ matching index, not necessarily the first or last. For "leftmost/rightmost occurrence" you need the boundary variant (`bisect_left` / `bisect_right`); returning an arbitrary match is a common interview miss.
- **Overflow (CP-flavored trap)** — `mid = (lo + hi) // 2` can overflow in fixed-width languages (C/C++/Java `int`) when `lo + hi > INT_MAX`. The senior fix is `mid = lo + (hi - lo) // 2`, which never overflows. Python's arbitrary-precision ints make this harmless _in Python_ — but interviewers ask it anyway, and it bites in contests using C++.
- **Off-by-one in bounds** — the single most common bug: mixing closed-interval (`hi = n-1`, `while lo <= hi`) with half-open (`hi = n`, `while lo < hi`) conventions. Pick one and keep `mid ± 1` consistent with it. Mismatching causes infinite loops or skipped elements.

## Implementation

**Pseudocode** (CLRS style — closed interval `[lo, hi]`):

```
BINARY-SEARCH(A, target)
 1  lo ← 1
 2  hi ← A.length
 3  while lo ≤ hi
 4      mid ← lo + ⌊(hi − lo) / 2⌋        ▷ overflow-safe midpoint
 5      if A[mid] = target
 6          return mid                     ▷ found
 7      else if A[mid] < target
 8          lo ← mid + 1                   ▷ discard left half, incl. mid
 9      else
10          hi ← mid − 1                   ▷ discard right half, incl. mid
11  return NIL                             ▷ lo > hi: not present
```

**Python** — idiomatic, with the leftmost-boundary variant and the contest-velocity stdlib shortcut:

```python
from bisect import bisect_left


def binary_search(a: list[int], target: int) -> int:
    """Return an index of target in sorted a, or -1 if absent."""
    lo, hi = 0, len(a) - 1
    while lo <= hi:
        mid = lo + (hi - lo) // 2          # overflow-safe (matters in C++/Java)
        if a[mid] == target:
            return mid
        elif a[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1


def leftmost(a: list[int], target: int) -> int:
    """Index of the FIRST occurrence of target, or -1. Handles duplicates."""
    i = bisect_left(a, target)             # half-open: first index with a[i] >= target
    return i if i < len(a) and a[i] == target else -1


# Contest velocity: don't hand-roll — bisect does it in one line.
# bisect_left(a, x)  → first index where x could insert, keeping a sorted
# bisect_right(a, x) → last  such index; (right - left) = count of x in a
```

## What the interviewer probes for

- **"Why `lo + (hi - lo) // 2` instead of `(lo + hi) // 2`?"** — Overflow safety. In a fixed-width integer language, `lo + hi` can exceed the type's max and wrap negative; the subtraction form stays within bounds. In Python it doesn't matter for correctness, but stating it shows you've written this in C++/Java.
- **"What if there are duplicates and I need the first one?"** — Plain binary search returns an arbitrary match. Switch to the _boundary_ search: keep going left when you find a match instead of returning, or use `bisect_left`. The invariant changes from "found target" to "found the leftmost index where `a[i] >= target`."
- **"The array isn't sorted — can you still binary-search?"** — Not directly; the predicate must be monotonic. Either sort first (O(n log n), worth it for many queries) or find a _different_ monotonic property — e.g. in a rotated sorted array, one half is always sorted, which restores a usable predicate.
- **"Can you binary-search something that isn't an array?"** — Yes — _binary search on the answer_. If "is X feasible?" is monotonic in X, binary-search the answer range. This is the highest-leverage follow-up and the bridge to half the hard problems below.

## Practice problems

### 1. First Bad Version — binary search on a predicate

You have `n` versions `[1..n]`; after some version `k`, all are bad. Given an `isBadVersion(v)` API, find the first bad one with the fewest API calls. Constraints: `n ≤ 2³¹ - 1`, so you cannot scan linearly — and the overflow trap is live.

**Approach:** The predicate `isBadVersion(v)` is _monotonic_ — once true, always true. That's a textbook binary search even though there's no array: search the version _range_ `[1, n]` for the first index where the predicate flips to true. Use the half-open boundary form so the loop converges on the boundary itself.

```python
def first_bad_version(n: int, is_bad) -> int:
    lo, hi = 1, n
    while lo < hi:                      # half-open: converge to the boundary
        mid = lo + (hi - lo) // 2       # overflow-safe — matters at n ≈ 2^31
        if is_bad(mid):
            hi = mid                    # mid might be the first bad → keep it
        else:
            lo = mid + 1                # mid is good → first bad is to the right
    return lo
```

Time O(log n), space O(1). Pattern: binary search on a monotonic predicate.

### 2. Search in Rotated Sorted Array — half is always sorted

A sorted array rotated at an unknown pivot (`[4,5,6,7,0,1,2]`); find a target's index, or -1. No duplicates; `n ≤ 5000`.

**Approach:** The array isn't globally sorted, so the naive predicate breaks — but at any `mid`, **at least one half (`lo..mid` or `mid..hi`) is fully sorted**. Detect which (compare `a[lo]` to `a[mid]`), check whether the target lies within that sorted half's range, and recurse into the half that must contain it. Sortedness is restored _locally_, which is all binary search needs.

```python
def search_rotated(a: list[int], target: int) -> int:
    lo, hi = 0, len(a) - 1
    while lo <= hi:
        mid = lo + (hi - lo) // 2
        if a[mid] == target:
            return mid
        if a[lo] <= a[mid]:                     # left half sorted
            if a[lo] <= target < a[mid]:
                hi = mid - 1
            else:
                lo = mid + 1
        else:                                   # right half sorted
            if a[mid] < target <= a[hi]:
                lo = mid + 1
            else:
                hi = mid - 1
    return -1
```

Time O(log n), space O(1). Pattern: binary search with a locally-sorted half.

### 3. Koko Eating Bananas — binary search on the answer

`piles[i]` bananas, `h` hours. Koko picks an eating speed `k`/hour; each hour she eats from one pile (finishing it if it's smaller). Find the minimum `k` that clears all piles within `h` hours. Constraints: `piles[i] ≤ 10⁹`, so the answer range is huge — the tell for searching the _answer_.

**Approach:** "Can Koko finish at speed `k`?" is **monotonic** — if speed `k` works, every speed `> k` also works. So binary-search `k` over `[1, max(piles)]`, and for each candidate run an O(n) feasibility check (`sum(ceil(p/k))` hours). You're searching the answer space, not the input.

```python
from math import ceil

def min_eating_speed(piles: list[int], h: int) -> int:
    def hours(k: int) -> int:
        return sum(ceil(p / k) for p in piles)

    lo, hi = 1, max(piles)
    while lo < hi:
        k = lo + (hi - lo) // 2
        if hours(k) <= h:       # feasible → try slower
            hi = k
        else:                   # too slow → must speed up
            lo = k + 1
    return lo
```

Time O(n log(max piles)), space O(1). Pattern: binary search on the answer + monotonic feasibility check.

### 4. Median of Two Sorted Arrays — partition search

Two sorted arrays of sizes `m, n`; find the median of their union in O(log(m+n)). Constraints rule out merging (O(m+n)) for full credit.

**Approach:** Don't search for a value — **search for a partition**. Binary-search a cut position in the smaller array; the cut in the larger array is forced by the median's count requirement. A cut is correct when `max(left side) <= min(right side)` across both arrays — a monotonic condition on the cut index, so binary search applies. This is the hardest application: the search space is _partition positions_, not elements.

```python
def find_median_sorted_arrays(a: list[int], b: list[int]) -> float:
    if len(a) > len(b):                       # binary-search the smaller array
        a, b = b, a
    m, n = len(a), len(b)
    lo, hi, half = 0, m, (m + n + 1) // 2
    while lo <= hi:
        i = lo + (hi - lo) // 2               # cut in a
        j = half - i                          # forced cut in b
        a_left  = a[i - 1] if i > 0 else float("-inf")
        a_right = a[i]     if i < m else float("inf")
        b_left  = b[j - 1] if j > 0 else float("-inf")
        b_right = b[j]     if j < n else float("inf")
        if a_left <= b_right and b_left <= a_right:        # correct partition
            if (m + n) % 2:
                return max(a_left, b_left)
            return (max(a_left, b_left) + min(a_right, b_right)) / 2
        elif a_left > b_right:
            hi = i - 1
        else:
            lo = i + 1
    raise ValueError("inputs not sorted")
```

Time O(log(min(m, n))), space O(1). Pattern: binary search on a partition index.
