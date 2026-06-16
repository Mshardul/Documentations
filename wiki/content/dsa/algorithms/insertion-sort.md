# Insertion Sort

## Prerequisites

- **Big-O Notation** [Must read] - insertion sort is the textbook case where best (O(n)) and worst (O(n²)) diverge wildly; reading that gap is the whole point. <!-- U9: not-yet-written target — wire to `algorithms/big-o-notation.md` (bracket-link form) once that page exists. -->
- [Array](../data-structures/array.md) [Must read] - the algorithm shifts elements right to open a slot; the O(1) shift-by-index and in-place swaps assume a random-access array.
- [Sorting](./sorting.md) [Should read] - the hub: where insertion sort sits among the six sorts and why an O(n²) sort still earns its place.

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
- [State & recurrence](#state--recurrence)
- [Edge cases](#edge-cases)
- [Implementation](#implementation)
- [What the interviewer probes for](#what-the-interviewer-probes-for)
- [Practice problems](#practice-problems)
  - [Sort an Array (small / nearly sorted)](#1-sort-an-array-small--nearly-sorted--insertion-sort)
  - [Insertion Sort List](#2-insertion-sort-list--insertion-into-a-linked-list)
  - [Sort a K-Sorted Array](#3-sort-a-k-sorted-array--bounded-displacement)
  - [Insert Interval](#4-insert-interval--insertion-into-a-sorted-sequence)

## What it is

**Insertion sort** builds the sorted array one element at a time: it keeps a **sorted prefix** at the front and, for each new element, slides it leftward past everything larger until it sits in its correct place — exactly like inserting it into the prefix.

Mental model: **arranging a hand of playing cards as you're dealt them.** The cards you've already picked up are in order; each new card you take, you slide left along your hand until it's in the right spot, pushing larger cards aside. You never re-examine the cards already placed except to make room.

Why an O(n²) sort still matters: insertion sort is **adaptive** — on **nearly-sorted input it runs in O(n)**, because each element only shifts a tiny distance — it's **stable**, it's **in-place** (O(1) space), and it sorts **online** (you can feed elements one at a time without seeing them all first). Its constant factor is tiny, so for **small arrays it beats O(n log n) sorts outright**. That combination is precisely why production sorts like **Timsort** and **introsort** drop to insertion sort for short runs (typically ≤ 16–64 elements).

> **Takeaway (say this out loud):** "Insertion sort grows a sorted prefix, sliding each new element into place — O(n²) worst but O(n) on nearly-sorted data, stable, in-place, and online; that's why real sorts use it for small runs."

**Complexity:** O(n²) worst/average, **O(n) best** (already sorted), O(1) space.

## Intuition

Why O(n) on sorted input but O(n²) on reversed? The cost is **the total distance elements move**. When you insert element `a[i]` into the sorted prefix `a[0..i-1]`, you shift it left once per element larger than it that sits before it — i.e. once per **inversion** it's part of.

- **Already sorted:** every element is already ≥ all before it, so each insertion does _one_ comparison and _zero_ shifts → `n-1` comparisons total → O(n). No element moves.
- **Reverse sorted:** every element is smaller than all before it, so element `i` shifts past all `i` predecessors → `1 + 2 + … + (n-1) = n(n-1)/2` shifts → O(n²). Maximum movement.

So insertion sort's running time is `Θ(n + inversions)`. "Nearly sorted" means "few inversions," which means near-linear — this is the precise statement of its adaptiveness, and the senior-level framing of "it's fast when the data is almost in order."

## How it works

Sort `a = [5, 2, 4, 6, 1, 3]`. The `|` marks the boundary: left of it is the sorted prefix, right is unprocessed. Each step takes the first unprocessed element (the **key**) and slides it into the prefix.

```
start:        [5 | 2 4 6 1 3]                       prefix = [5]

key=2:  shift 5 right, insert 2   [2 5 | 4 6 1 3]   prefix = [2 5]
key=4:  shift 5 right, insert 4   [2 4 5 | 6 1 3]   prefix = [2 4 5]
key=6:  6 ≥ 5, no shift, stays    [2 4 5 6 | 1 3]   prefix = [2 4 5 6]
key=1:  shift 6,5,4,2 right, ins  [1 2 4 5 6 | 3]   prefix = [1 2 4 5 6]
key=3:  shift 6,5,4 right, insert [1 2 3 4 5 6 |]   prefix = [1 2 3 4 5 6]  ✓
```

Watch the cost vary: `key=6` does zero shifts (already in place), `key=1` does four (it's smaller than everything). The total shift count _is_ the running time — and equals the number of inversions in the input.

## Correctness / invariant

The outer loop maintains a single **loop invariant**: _at the start of iteration `i`, the subarray `a[0..i-1]` contains the original first `i` elements, now in sorted order._

- **Initialization:** before `i = 1`, the prefix `a[0..0]` is a single element — trivially sorted, and it's the original first element.
- **Maintenance:** iteration `i` takes `key = a[i]` and shifts every prefix element greater than `key` one slot right, then drops `key` into the gap. The result is `a[0..i]` sorted (the prefix was sorted, and `key` is now placed correctly among them) and still a permutation of the original first `i+1` elements. So the invariant holds for `i+1`.
- **Termination:** the loop ends after `i = n-1`, so `a[0..n-1]` — the whole array — is sorted and a permutation of the input. That's correctness.

This is _the_ canonical loop-invariant proof — CLRS opens the book with it precisely because the three-part structure (init / maintain / terminate) is so clean here. The inner shift loop stops as soon as it meets an element `≤ key`, which (with the `>` not `≥` comparison) is what keeps the sort **stable**: equal elements never leapfrog each other.

## Complexity derivation

Let `t_i` be the number of shifts when inserting element `i`. The outer loop runs `n-1` times; iteration `i` does `t_i + 1` comparisons and `t_i` shifts. Total work:

```
T(n) = Σ_{i=1}^{n-1} (t_i + 1)
```

- **Best case** (sorted input): every `t_i = 0` — the key is already ≥ the prefix's last element, so the inner loop exits immediately. `T(n) = Σ 1 = n - 1 = Θ(n)`.
- **Worst case** (reverse sorted): every `t_i = i` — the key shifts past the entire prefix. `T(n) = Σ_{i=1}^{n-1} (i + 1) = n(n-1)/2 + (n-1) = Θ(n²)`.
- **Average case** (random permutation): each key shifts past about half the prefix, `t_i ≈ i/2`, so `T(n) = Σ i/2 = Θ(n²)` — still quadratic, just half the constant.

The exact statement is `T(n) = Θ(n + I)` where `I` is the number of inversions: best `I = 0` → Θ(n), worst `I = n(n-1)/2` → Θ(n²). **Space** is O(1) — all work is in-place shifting, only one `key` held aside.

## Constraints & approach

| Input size `n`                 | Expected approach       | What it tells you                                                                                |
| ------------------------------ | ----------------------- | ------------------------------------------------------------------------------------------------ |
| `n ≤ ~16–64`                   | insertion sort          | At small sizes its tiny constant beats O(n log n); this is why Timsort/introsort switch to it.   |
| "nearly sorted" / "k-sorted"   | insertion sort, ~O(n·k) | Few inversions → near-linear; the constraint _invites_ insertion sort over a general O(n log n). |
| streaming / online             | insertion sort          | Elements arrive one at a time and you must keep a sorted structure — insertion sort is online.   |
| `n ≤ 10⁵–10⁶`, arbitrary order | O(n log n)              | The constraint _rules out_ insertion sort — n² is ~10¹⁰–10¹² ops, too slow; use a library sort.  |

The senior reading: the words **"nearly sorted," "small," "k-sorted," or "online/streaming"** are the tells that an O(n²) sort is actually the _right_ call; a large random array rules it out.

## When to use / when not

Reach for insertion sort on **small arrays** (its constant factor wins under ~32 elements), **nearly-sorted data** (adaptive O(n + inversions) — it barely moves anything), or **online/streaming input** where elements arrive one at a time and you maintain order incrementally. It's also the natural choice when you need a **stable, in-place** sort and `n` is tiny. Real systems lean on exactly this: **Timsort** insertion-sorts short runs before merging, and **introsort** switches to insertion sort once quicksort's subarrays get small.

Don't use it on **large, arbitrarily-ordered arrays** — O(n²) is hopeless past a few thousand elements; reach for [quicksort](./quicksort.md) or [merge sort](./merge-sort.md). Compared to **selection sort** (also O(n²), in-place), insertion sort is strictly better for nearly-sorted data (selection sort is _not_ adaptive — it always scans the full remainder) and is stable, where selection sort isn't. Compared to **bubble sort**, insertion sort does fewer writes and is the one production code actually uses.

## Comparison

| Algorithm      | Best    | Average | Worst   | Space    | Stable | Adaptive | Key trait                                     |
| -------------- | ------- | ------- | ------- | -------- | ------ | -------- | --------------------------------------------- |
| **Insertion**  | **n**   | n²      | n²      | O(1)     | ✅     | ✅       | Online; near-linear on sorted; small-`n` king |
| Selection sort | n²      | n²      | n²      | O(1)     | ❌     | ❌       | Always n²; fewest _writes_ (n swaps)          |
| Bubble sort    | n       | n²      | n²      | O(1)     | ✅     | ✅       | Pedagogical only; most writes                 |
| Quicksort      | n log n | n log n | n²      | O(log n) | ❌     | ❌       | Fast general default; in-place                |
| Merge sort     | n log n | n log n | n log n | O(n)     | ✅     | ❌       | Guaranteed bound; stable                      |

Among the O(n²) sorts insertion is the one to know: stable _and_ adaptive _and_ online. Selection sort's only edge is minimizing the number of _writes_ (exactly `n-1` swaps), which matters when writes are far costlier than reads (e.g. flash memory wear).

## State & recurrence

Insertion sort is the canonical **iterative loop-invariant** algorithm rather than a divide-and-conquer one — it has no recurrence in the [merge-sort](./merge-sort.md) sense. Its "state & recurrence" is the loop's evolving state:

- **State:** the sorted prefix `a[0..i-1]`. Each iteration extends it by exactly one element. The "recurrence," informally, is `sorted(i) = insert(a[i], sorted(i-1))` with base case `sorted(0) = [a[0]]` — a _fold_, not a binary split.
- **Invariant (the proof obligation):** `a[0..i-1]` sorted at the top of iteration `i` (proven above). This is the whole correctness argument; there is no recursion tree to analyze, only the loop.
- **Cost is data-dependent — like quicksort, unlike merge sort.** `Θ(n + inversions)`: the input's pre-existing order sets the running time. But the dependence is the _opposite_ of quicksort's — quicksort's bad case is _sorted_ input (extreme pivots), insertion sort's _best_ case is sorted input (zero shifts). The recursive cousin worth naming: a recursive insertion sort `sort(a[0..i]) = insert(a[i], sort(a[0..i-1]))` gives `T(n) = T(n-1) + O(n)` → O(n²), the same chain-shaped recurrence as quicksort's _worst_ case — which is the structural reason both are O(n²) when they degrade.

> **Family note:** insertion sort has no clean fit among the algorithm families (Search/divide, Traversal, Recursive/build, Bit/greedy) — it is a loop-invariant incremental sort. Filed under **Recursive/build** as the nearest match (its incremental `insert(x, sorted)` fold is a build), with the family heading repurposed to its loop state. The depth lives in the invariant and the inversion-based cost analysis, not in a recurrence.

## Edge cases

- **Empty / single element** — the outer loop starts at `i = 1`, so `n ≤ 1` does nothing and is already sorted. No special-casing needed.
- **Already sorted** — the best case: each inner loop exits on the first comparison, O(n). This is the property that makes it adaptive — and worth stating explicitly, since it's the _opposite_ of quicksort's worst case on the same input.
- **Reverse sorted** — the worst case: every element shifts the full prefix, O(n²). The maximum-inversions input.
- **All-equal elements** — O(n): each key is `≤` the prefix's last (so with the `>` comparison the inner loop exits immediately) and nothing shifts. Stable throughout.
- **Duplicates / stability** — the inner loop condition must be `a[j] > key` (strict), not `≥`. Using `≥` would shift equal elements past each other and **break stability** — a subtle bug that still produces a sorted array but reorders equal keys, failing multi-key sorts.
- **Online insertion (CP-flavored)** — because it's online, you can binary-search the insertion point (`bisect`) to cut _comparisons_ to O(log n) per element — but the _shifts_ are still O(n) on an array, so the total stays O(n²). The comparison savings only help when comparisons are expensive (e.g. long strings). On a linked list you avoid shifts but lose binary search. Knowing this tradeoff is the senior tell.

## Implementation

**Pseudocode** (CLRS — the book's opening algorithm):

```
INSERTION-SORT(A)
 1  for i = 2 to A.length              ▷ 1-indexed; prefix A[1..i-1] is sorted
 2      key ← A[i]
 3      j ← i − 1
 4      while j > 0 and A[j] > key      ▷ strict > keeps it STABLE
 5          A[j + 1] ← A[j]            ▷ shift larger element right
 6          j ← j − 1
 7      A[j + 1] ← key                 ▷ drop key into the opened slot
```

**Python** — idiomatic, plus the binary-insertion variant (fewer comparisons):

```python
def insertion_sort(a: list[int]) -> None:
    """Stable, in-place, O(n²) worst / O(n) on nearly-sorted input."""
    for i in range(1, len(a)):
        key = a[i]
        j = i - 1
        while j >= 0 and a[j] > key:          # strict > → stable (equals don't shift)
            a[j + 1] = a[j]                   # shift larger element right
            j -= 1
        a[j + 1] = key                        # insert into the opened gap


from bisect import insort, bisect_right

def binary_insertion_sort(a: list[int]) -> None:
    """Cuts comparisons to O(log n)/element; shifts still O(n), so total O(n²)."""
    for i in range(1, len(a)):
        key = a[i]
        pos = bisect_right(a, key, 0, i)      # find slot in O(log n) comparisons
        a[pos + 1:i + 1] = a[pos:i]           # shift block right (still O(n) work)
        a[pos] = key


# Contest / real-world velocity: insort maintains a sorted list under streaming inserts.
stream: list[int] = []
for x in (5, 2, 8, 1):
    insort(stream, x)                          # online insertion, keeps `stream` sorted
```

## What the interviewer probes for

- **"When is an O(n²) sort the right choice?"** — Small `n` (constant factor beats O(n log n) under ~32 elements), nearly-sorted data (adaptive O(n + inversions)), or online/streaming input. This is exactly why Timsort and introsort use insertion sort for small runs.
- **"Why is it adaptive — quantify it."** — Running time is `Θ(n + inversions)`. Sorted input has zero inversions → O(n); reverse-sorted has the maximum → O(n²). The work _is_ the total distance elements move.
- **"How do you keep it stable, and where could you break it?"** — The inner loop uses strict `>` so equal elements never shift past each other. Switching to `≥` shifts equals and breaks stability while still producing a sorted array — a silent multi-key bug.
- **"Can you speed up the comparisons?"** — Binary-search the insertion point (`bisect`) → O(log n) comparisons per element. But array shifts are still O(n), so the total is still O(n²); it only helps when comparisons dominate (expensive keys). On a linked list, inserts are O(1) but you lose binary search.
- **"Insertion vs selection sort?"** — Both O(n²) in-place, but insertion is adaptive and stable; selection is neither, though it does the fewest _writes_ (n-1 swaps), which matters only when writes are far costlier than reads.

## Practice problems

### 1. Sort an Array (small / nearly sorted) — insertion sort

Sort an array known to be **small** or **nearly sorted** (each element is within a few positions of its final spot). Constraints: when `n` is tiny or inversions are few, the O(n²) bound is effectively linear and the tiny constant wins.

**Approach:** Plain insertion sort. On nearly-sorted input each key shifts only a short distance, so the total work is O(n + inversions) ≈ O(n) — faster than invoking an O(n log n) sort with its larger constant and recursion overhead. This is the exact scenario library sorts detect and hand to insertion sort.

```python
def sort_small(nums: list[int]) -> list[int]:
    for i in range(1, len(nums)):
        key, j = nums[i], i - 1
        while j >= 0 and nums[j] > key:
            nums[j + 1] = nums[j]; j -= 1
        nums[j + 1] = key
    return nums
```

Time O(n + inversions) — O(n) nearly-sorted, O(n²) worst; space O(1). Pattern: adaptive insertion sort.

### 2. Insertion Sort List — insertion into a linked list

Sort a singly linked list using insertion sort. Constraints: no random access, so you can't shift by index — you splice nodes. `n ≤ 5000`.

**Approach:** Build a new sorted list by **splicing** each node into place. For each node from the input, walk the sorted portion from a dummy head until you find the first node larger than it, then relink. Insertion sort suits linked lists because inserting a node is O(1) pointer surgery — no shifting — though finding the spot is still O(n), keeping the total O(n²).

```python
class ListNode:
    def __init__(self, val=0, nxt=None):
        self.val, self.next = val, nxt

def insertion_sort_list(head: ListNode) -> ListNode:
    dummy = ListNode()
    cur = head
    while cur:
        nxt = cur.next                          # save the rest
        prev = dummy
        while prev.next and prev.next.val < cur.val:
            prev = prev.next                    # find insertion spot in sorted part
        cur.next = prev.next                    # splice cur in
        prev.next = cur
        cur = nxt
    return dummy.next
```

Time O(n²), space O(1). Pattern: insertion via pointer splicing (no shifts).

### 3. Sort a K-Sorted Array — bounded displacement

Each element is at most `k` positions away from its sorted position. Sort it efficiently. Constraints: `k ≪ n` (e.g. `k ≤ 100`, `n ≤ 10⁶`) — the bounded displacement is the whole hint.

**Approach:** Because no element travels more than `k` slots, insertion sort shifts each key at most `k` times → O(n·k), near-linear when `k` is small — and it beats a general O(n log n) sort here. (The classic alternative is a size-`k` min-heap, also O(n log k); insertion sort wins when `k` is tiny and the data is in an array.)

```python
def sort_k_sorted(nums: list[int], k: int) -> list[int]:
    for i in range(1, len(nums)):
        key, j = nums[i], i - 1
        while j >= 0 and nums[j] > key:         # shifts at most k times per element
            nums[j + 1] = nums[j]; j -= 1
        nums[j + 1] = key
    return nums
```

Time O(n·k), space O(1). Pattern: insertion sort exploiting bounded displacement.

### 4. Insert Interval — insertion into a sorted sequence

Given a list of **non-overlapping, sorted** intervals and a new interval, insert it and merge any overlaps, keeping the result sorted. Constraints: `n ≤ 10⁴`; the existing list is already ordered — the insertion-into-sorted-structure pattern.

**Approach:** The core insertion-sort move generalized to intervals: walk the sorted list, copy intervals strictly left of the new one, **merge** all that overlap the new one into a single widened interval (inserting it in its sorted place), then copy the rest. One linear pass because the input is already sorted — no full re-sort needed, exactly the "maintain a sorted structure under insertion" idea.

```python
def insert_interval(intervals: list[list[int]], new: list[int]) -> list[list[int]]:
    out, i, n = [], 0, len(intervals)
    while i < n and intervals[i][1] < new[0]:   # entirely left of new
        out.append(intervals[i]); i += 1
    while i < n and intervals[i][0] <= new[1]:  # overlaps new → absorb
        new = [min(new[0], intervals[i][0]), max(new[1], intervals[i][1])]
        i += 1
    out.append(new)                             # insert the merged interval
    out.extend(intervals[i:])                   # entirely right of new
    return out
```

Time O(n), space O(n). Pattern: insertion into a sorted sequence with merge.
