# Array

## Prerequisites

- **Big-O Notation** [Must read] - every operation below is stated in Big-O; you must read complexity to use this page. <!-- U9: not-yet-written target — wire to `algorithms/big-o-notation.md` (bracket-link form) once that page exists. -->
- **Computer memory model** [Should read] - an array is contiguous addresses, so you need to picture RAM as a sequence of numbered cells (a giant numbered locker bank). No dedicated page; the mental model is enough.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Table of Contents](#table-of-contents)
- [What it is](#what-it-is)
- [How it works](#how-it-works)
- [Operations](#operations)
- [Complexity summary](#complexity-summary)
- [When to use / when not](#when-to-use--when-not)
- [Comparison](#comparison)
- [Variants](#variants)
- [Memory layout](#memory-layout)
- [Implementation](#implementation)
- [CP-primitives](#cp-primitives)
  - [Prefix sums (range queries in O(1))](#prefix-sums-range-queries-in-o1)
  - [Difference array (range updates in O(1))](#difference-array-range-updates-in-o1)
  - [Array as a direct-address (frequency) map](#array-as-a-direct-address-frequency-map)
- [Gotchas / edge cases](#gotchas--edge-cases)
- [Practice problems](#practice-problems)
  - [Subarray Sum Equals K](#1-subarray-sum-equals-k--prefix-sum--hashing)
  - [Trapping Rain Water](#2-trapping-rain-water--converging-two-pointers)
  - [Next Permutation](#3-next-permutation--in-place-index-manipulation)
  - [Find the Duplicate Number](#4-find-the-duplicate-number--array-as-function-floyd-cycle-detection)
  - [Maximum Subarray](#5-maximum-subarray--kadanes-dynamic-programming)

## What it is

An **array** is a contiguous block of memory holding elements of the same type, each reachable in O(1) by its integer index.

Mental model: **a row of identical lockers, numbered from 0.** Because every locker is the same width and they sit side by side, you don't search for locker #5 — you compute where it is (`start + 5 × width`) and jump straight there. That single multiply-and-add is the whole reason arrays are fast, and the whole reason they're rigid.

One sharp distinction to keep straight: the **raw array primitive is fixed-size** — allocated once, never grows. The thing you call a "list" in Python or an `ArrayList` in Java is a **dynamic array**: a fixed array underneath that reallocates a bigger block when it fills. So "append is O(1)" and "fixed-size" aren't a contradiction — they describe two different layers. This page covers the fixed primitive; the growable layer is [Dynamic Array](./dynamic-array.md).

> **Takeaway (say this out loud):** "An array is contiguous memory with O(1) indexed access — instant reads by position, but inserting in the middle costs O(n) because everything after has to shift."

## How it works

Elements live back-to-back in one memory block. The array knows only two things: the **base address** (where element 0 starts) and the **element size** in bytes. The address of element `i` is pure arithmetic:

```
address(i) = base_address + i × element_size
```

No traversal, no pointers to chase — just one multiply and one add. That's why indexed access is O(1) and identical for `arr[0]` and `arr[1_000_000]`.

```
index:       0      1      2      3      4
          +------+------+------+------+------+
values:   |  42  |  17  |  99  |   8  |  23  |
          +------+------+------+------+------+
addr:       1000   1004   1008   1012   1016      (4-byte ints)
                                  ^
            address(3) = 1000 + 3 × 4 = 1012  ── one jump, O(1)
```

Inserting or deleting anywhere but the end breaks the contiguity contract, so the array **shifts** every later element to keep the block packed:

```
insert 55 at index 2:

before:   | 42 | 17 | 99 | 08 | 23 |    |        (slot free at end)
                      └────┴────┴────┘  shift right →
after:    | 42 | 17 | 55 | 99 |  8 | 23 |
                      ^
              3 elements moved → O(n)
```

That same O(1) address arithmetic is what makes **binary search** possible on a _sorted_ array: each step computes `mid = (lo + hi) / 2` and jumps straight to `arr[mid]` — no traversal — halving the search space each time for O(log n). A linked list can't do this; computing its middle element is already O(n). **Contiguous + sorted is the precondition for binary search**, and it's the array's headline advantage for lookup when you can keep the data ordered.

## Operations

| Operation                    | Time     | Space |
| ---------------------------- | -------- | ----- |
| Access by index `arr[i]`     | O(1)     | O(1)  |
| Update by index `arr[i] = x` | O(1)     | O(1)  |
| Search (unsorted, linear)    | O(n)     | O(1)  |
| Search (sorted, binary)      | O(log n) | O(1)  |
| Insert at end (amortized\*)  | O(1)     | O(1)  |
| Insert at index `i`          | O(n)     | O(1)  |
| Delete at index `i`          | O(n)     | O(1)  |

\*Amortized O(1) applies to a **dynamic** array ([Dynamic Array](./dynamic-array.md)). A true fixed array cannot grow at all — appending requires allocating a new, larger block.

## Complexity summary

| Operation       | Best                 | Average | Worst                       |
| --------------- | -------------------- | ------- | --------------------------- |
| Access by index | O(1)                 | O(1)    | O(1)                        |
| Search (linear) | O(1) (first element) | O(n)    | O(n) (last / absent)        |
| Insert at end   | O(1)                 | O(1)    | O(n) (dynamic array resize) |
| Insert at index | O(1) (at end)        | O(n)    | O(n) (at front)             |
| Delete at index | O(1) (at end)        | O(n)    | O(n) (at front)             |

**Space:** O(n) for n elements. A dynamic array can over-allocate, so true footprint is O(capacity), with capacity up to ~2× the element count.

## When to use / when not

**Reach for an array when:**

- You index by position a lot — `arr[i]` is O(1) and cache-friendly.
- The collection is read-heavy and append-mostly (a log, a buffer, a matrix row).
- You need contiguous memory for tight iteration (numeric/SIMD work, hot loops).

**Reach for something else when:**

- **Frequent insert/delete in the middle or front** → a **linked list** does these in O(1) once you hold the node (no shifting), trading away O(1) random access. <!-- linked-list.md not yet written -->
- **Key-based lookup** ("is `x` present?", "value for key `k`?") → a **hash table** is O(1) average; linear search in an array is O(n). But note the tradeoff: if you can keep the array **sorted**, **binary search** gives O(log n) lookup with zero extra memory and cache-friendly access — often the right call for static, read-mostly data where a hash table's overhead and lack of ordering aren't worth it. <!-- hash-table.md not yet written -->
- **Ordered data with frequent insert + range queries** → a **balanced BST** keeps O(log n) insert and in-order traversal. <!-- bst.md not yet written -->

Rule of thumb: **arrays win on access, lose on structural change.** If your hot path is "jump to position i", use an array; if it's "splice in the middle", don't.

Real-world: arrays are the substrate everything else sits on — every dynamic language's "list" ([Dynamic Array](./dynamic-array.md)), the backing store of hash tables and heaps, matrix/tensor libraries (NumPy, BLAS), and the row buffers in databases all bottom out in a contiguous array.

## Comparison

How the array stacks up against the structures you'd actually weigh it against in an interview:

| Structure         | Access by index | Search                 | Insert/delete (middle)   | Insert/delete (end) | Ordered?   | Memory                  | Pick it when…                                     |
| ----------------- | --------------- | ---------------------- | ------------------------ | ------------------- | ---------- | ----------------------- | ------------------------------------------------- |
| **Array** (fixed) | **O(1)**        | O(n) / O(log n) sorted | O(n) (shift)             | O(n) (no grow)      | by index   | contiguous, tight       | random access, cache-tight iteration              |
| Dynamic array     | O(1)            | O(n) / O(log n) sorted | O(n)                     | **O(1)** amortized  | by index   | contiguous + ~2× slack  | same, but size unknown up front                   |
| Linked list       | O(n)            | O(n)                   | **O(1)** (with node ref) | **O(1)**            | by links   | scattered, +ptr/node    | heavy middle/front splicing, no random access     |
| Hash table        | n/a (by key)    | **O(1)** avg           | O(1) avg                 | O(1) avg            | no         | scattered + load factor | key→value lookup, membership                      |
| Balanced BST      | O(log n)        | O(log n)               | O(log n)                 | O(log n)            | **sorted** | scattered + ptrs        | ordered data with frequent insert + range queries |

The array's column is the only one with **O(1) indexed access and contiguous memory** — that's its whole identity. Every rival buys a different operation cheaper by giving that up.

## Variants

- **[Dynamic Array](./dynamic-array.md)** (Python `list`, Java `ArrayList`, C++ `std::vector`) — wraps a fixed array, doubles capacity on overflow, copies elements over. Append is **amortized O(1)**. Its own article — the resize/amortization argument is interview-heavy.
- **[Circular Buffer (ring buffer)](./circular-buffer.md)** — fixed array with wraparound indices (`i % capacity`); O(1) enqueue/dequeue at both ends, used for fixed-size queues and streaming windows. Its own article.
- **Multidimensional array** — a grid stored as one flat block, indexed by `(r, c)` arithmetic. Row-major vs column-major storage and the traversal-cost consequences are covered in [Memory layout](#memory-layout) below.
- **Static array** — the true fixed-size primitive, no resize; what all the above build on. That's the subject of this page.

**CP-flavored variants** — same contiguous array, repurposed by what you store in it. Each is named here as a _shape_; the technique that wields it lives in [CP-primitives](#cp-primitives):

- **Prefix-sum array** — store cumulative sums instead of values; turns range-sum queries into O(1) subtractions.
- **Difference array** — store deltas (`diff[l] += x; diff[r+1] -= x`); turns range _updates_ into O(1), recovered by a prefix-sum pass.
- **Counter / bucket array** — index _by value_ (`freq[v]`) rather than by position; an O(1) direct-address map when the value range is bounded.
- **Implicit tree (array-as-heap)** — a flat array read as a complete binary tree via index math (`children of i = 2i+1, 2i+2`); no pointers. The structural trick the heap article builds on. <!-- bst/heap.md not yet written -->

## Memory layout

This is the heart of why arrays behave the way they do.

**Contiguous vs pointer-based.** An array stores values **inline**, one after another, in a single block:

```
array (contiguous):   [ 42 | 17 | 99 |  8 ]      one block, values inline

linked list (pointer): [42|•]→[17|•]→[99|•]→[8|/]  scattered, each node holds a next-pointer
```

The array pays no per-element pointer overhead and needs no allocation per element. The linked list pays 8 bytes/node for the pointer and one heap allocation each.

**Cache behavior.** CPUs fetch memory in **cache lines** (typically 64 bytes). Because array elements are adjacent, reading `arr[i]` pulls `arr[i+1]`, `arr[i+2]`, … into cache for free. Sequential iteration is therefore extremely fast — the prefetcher predicts it perfectly. A linked list scatters nodes across the heap, so each `next` hop risks a **cache miss** (~100× slower than a hit). This is why an array often beats a linked list in practice even for workloads where Big-O says the list should win.

**Resize cost (the doubling argument).** A dynamic array that's full must allocate a bigger block and copy everything over — O(n). Why is append still amortized O(1)? Because capacity **doubles** each time. Starting from 1 and growing to n, the total copy work across all resizes is:

```
1 + 2 + 4 + 8 + … + n  ≈  2n   →  O(n) total over n appends  →  O(1) each, amortized
```

The geometric series sums to ~2n, so n appends cost ~2n element-moves total — constant per append on average. Growing by a **fixed** amount (e.g. +1) instead would make it 1 + 2 + … + n ≈ n²/2 → O(n) per append. **Doubling is what makes the amortization work.** (Doubling isn't sacred — the growth factor is a tunable memory-vs-copy-frequency dial; see [Dynamic Array › Variants](./dynamic-array.md#variants).)

**Multidimensional layout (still one flat block).** A 2D array isn't really two-dimensional in memory — it's a single contiguous block, and "rows and columns" are just index arithmetic over it. Two storage orders decide which neighbor sits next to which:

- **Row-major** (C, C++, Java, Python, NumPy default): store row 0 completely, then row 1, … → `address(r, c) = base + (r × C + c) × element_size`.
- **Column-major** (Fortran, MATLAB, R): store column 0 completely, then column 1, … → `address(r, c) = base + (c × R + r) × element_size`.

```
logical 3×4 matrix:          row-major flat block (what's adjacent in memory):
   c0  c1  c2  c3
r0  A   B   C   D            [ A | B | C | D | E | F | G | H | I | J | K | L ]
r1  E   F   G   H              └── row 0 ──┘   └── row 1 ──┘   └── row 2 ──┘
r2  I   J   K   L              A[1][2] = G  →  base + (1×4 + 2)×size = base + 6×size
```

**One trap to keep separate:** a _true_ 2D array (`int[R][C]` in C, a NumPy `ndarray`) is this one flat block. But an **array of arrays** (Java `int[][]`, Python list-of-lists) is **not** — it's an array of row _pointers_, each row a separate heap allocation. You lose cross-row contiguity: walking row to row chases pointers into scattered memory, killing the cache benefit. Know which one your language gives you.

## Implementation

A minimal dynamic array on top of a fixed backing block — definition plus the two interesting ops (`get`, `append`).

**Pseudocode (CLRS-style contract):**

```
ARRAY-APPEND(A, x)
1   if A.size == A.capacity
2       new_cap = max(1, 2 × A.capacity)         ▷ double, or seed at 1
3       B = ALLOCATE-BLOCK(new_cap)
4       for i = 0 to A.size − 1                  ▷ copy old contents
5           B[i] = A.data[i]
6       A.data = B
7       A.capacity = new_cap
8   A.data[A.size] = x                           ▷ now there is room
9   A.size = A.size + 1

ARRAY-GET(A, i)
1   if i < 0 or i ≥ A.size
2       error "index out of bounds"
3   return A.data[i]                             ▷ O(1): direct address arithmetic
```

**Python (reference — idiomatic):**

```python
from typing import TypeVar, Generic, Iterator

T = TypeVar("T")


class DynamicArray(Generic[T]):
    """A growable array over a fixed-capacity backing list."""

    def __init__(self) -> None:
        self._size: int = 0
        self._capacity: int = 1
        self._data: list[T | None] = [None] * self._capacity

    def __len__(self) -> int:
        return self._size

    def get(self, i: int) -> T:
        if not 0 <= i < self._size:
            raise IndexError(f"index {i} out of bounds for size {self._size}")
        return self._data[i]  # type: ignore[return-value]  # O(1)

    def append(self, x: T) -> None:
        if self._size == self._capacity:
            self._resize(2 * self._capacity)  # double → amortized O(1)
        self._data[self._size] = x
        self._size += 1

    def _resize(self, new_capacity: int) -> None:
        bigger: list[T | None] = [None] * new_capacity
        for i, value in enumerate(self._data[: self._size]):
            bigger[i] = value
        self._data = bigger
        self._capacity = new_capacity

    def __iter__(self) -> Iterator[T]:
        return (self._data[i] for i in range(self._size))  # type: ignore[misc]
```

**Contest velocity — don't hand-roll what the stdlib gives you.** The class above shows the _mechanism_; in a real contest you'd lean on Python's built-ins. The binary-search row from the Operations table, in particular, is one import — never reimplement it under time pressure:

```python
import bisect

a = [1, 3, 4, 7, 9, 11]          # a sorted array
i = bisect.bisect_left(a, 7)     # 3  — leftmost index where 7 could go (found)
j = bisect.bisect_right(a, 7)    # 4  — one past it; (j - i) = count of 7s
bisect.insort(a, 8)              # insert keeping sorted order, O(log n) search + O(n) shift
```

Likewise `arr.append`/`arr.pop()` for a stack, `collections.Counter(arr)` for frequencies, and `itertools.accumulate(arr)` for prefix sums (see [CP-primitives](#cp-primitives)) replace whole hand-written loops.

## CP-primitives

Three array tricks that turn up constantly in contests — each trades a one-time O(n) preprocess for O(1) queries or updates.

### Prefix sums (range queries in O(1))

Precompute `pref[i] = pref[i-1] + arr[i]` with a `pref[0] = 0` sentinel (1-based `arr`). Then **any subarray sum is one subtraction**: `sum(l..r) = pref[r] - pref[l-1]`. O(n) build, O(1) per query — instead of O(n) per query naively.

```
i:          0   1   2   3   4
arr:      [ 3 | 1 | 2 | 1 | 2 ]
pref: [ 0 | 3 | 4 | 6 | 7 | 9 ]     pref[0]=0 sentinel

sum(2..4) = arr[2]+arr[3]+arr[4] = 1+4+1 = 6  =  pref[4] − pref[1] = 9 − 3 = 6  ✓
```

**2D extension** — rectangle sums in O(1) by inclusion–exclusion:

```
pref[i][j] = pref[i-1][j] + pref[i][j-1] − pref[i-1][j-1] + arr[i][j]

rect_sum(r1,c1,r2,c2) = pref[r2][c2] − pref[r1-1][c2] − pref[r2][c1-1] + pref[r1-1][c1-1]
```

The same skeleton generalizes: **prefix-XOR** (subarray XOR), **prefix-product** (subarray product — but handle zeros separately, since you can't divide them out).

**Why for CP:** turns range-query problems from O(n) per query into O(1) after O(n) preprocessing — the difference between TLE and AC when there are 10⁵ queries.

### Difference array (range updates in O(1))

The dual of prefix sums. To add `x` to every element of `arr[l..r]` — many times — don't touch the range each time. Maintain a `diff` array: `diff[l] += x; diff[r+1] -= x`. After all updates, the **prefix sum of `diff` is the final array**.

```
add 5 to [1..3], then add 2 to [2..4]:
diff:  [0| +5 |  0 |  0 | −5 |  0 ]   after update 1
       [0| +5 | +2 |  0 | −5 | −2 ]   after update 2
prefix→[0|  5 |  7 |  7 |  2 |  0 ]   final deltas applied to arr
```

**Why for CP:** O(1) per range update + one O(n) final pass, instead of O(n) per update. Classic for "apply Q range increments, then print the array."

### Array as a direct-address (frequency) map

When values are bounded — say `0 ≤ a[i] ≤ 10⁶` — a plain array `freq[value]` **is** an O(1) map with zero hashing overhead, often beating a hash table on constant factor. For a small fixed alphabet (lowercase letters) it's `freq = [0]*26`.

```python
freq = [0] * 26
for ch in s:
    freq[ord(ch) - ord("a")] += 1   # direct address, no hash
```

When values are large but sparse, **coordinate-compress** first (map the distinct values to `0..k-1` via a sorted-unique index), then use the array.

**Why for CP:** direct-address is faster and simpler than a hash map when the value range is bounded. A candidate who reflexively says "hash map" for a 26-letter alphabet is leaving speed (and simplicity) on the table.

## Gotchas / edge cases

- **Off-by-one / out-of-bounds.** Valid indices are `0 … n−1`. The classic bug is looping `for i in range(n + 1)` or treating `arr[n]` as the last element. In C this reads garbage or segfaults; in Python it raises `IndexError`. The interviewer is watching your loop bounds.
- **Negative indexing is a language abstraction, not an array property.** `arr[-1]` is the last element in Python; Ruby has the same `arr[-1]`; JavaScript added `arr.at(-1)`. All three are _language-level sugar_ over the raw `base + i × size` formula — under the hood they translate `-1` to `len - 1`. C and Java have no such convenience: `arr[-1]` is out of bounds (undefined behavior in C, `ArrayIndexOutOfBoundsException` in Java). In a language-agnostic answer, treat the raw index formula as the truth and call out which conveniences you're leaning on.
- **Index type and max size (systems-thinking cue).** The index is an integer, and its type bounds the array. In Java an array is indexed by `int`, so the largest possible length is `Integer.MAX_VALUE` (~2.1 billion) — you cannot allocate a single bigger array regardless of RAM. Growing a dynamic array isn't free either: a resize allocates a _new, larger_ block before freeing the old one, so it transiently needs ~1.5–2× the current memory and can throw `OutOfMemoryError` mid-copy even though the final size would have fit. For huge collections, mention chunked/segmented structures or pre-sizing to the known capacity.
- **2D traversal order — Big-O lies, cache doesn't.** Both nesting orders below are O(R×C), but on a **row-major** array, iterating column-first jumps `C` elements per step and misses the cache on nearly every access; row-first streams sequentially. On a large matrix that's a _measured 5–10× slowdown_ with identical Big-O — the canonical "constant factors matter" trap.

  ```
  for c in 0..C:          # SLOW on row-major: stride C, cache miss per access
      for r in 0..R:
          visit(A[r][c])

  for r in 0..R:          # FAST: sequential, prefetcher-friendly
      for c in 0..C:
          visit(A[r][c])
  ```

  Match the loop nesting to the storage order (innermost loop = the contiguous dimension). On column-major (Fortran/MATLAB) it's the reverse.

- **Insertion/deletion shifts — don't forget the cost.** Saying "I'll remove the element at index i" hides an O(n) shift. If asked to delete many elements, repeated `arr.pop(i)` is O(n²); build a new array (or use two pointers) in one O(n) pass instead.
- **Iterating while mutating.** Removing items from an array as you loop over it skips elements or shifts indices underneath you. Iterate over a copy, iterate backwards, or build a fresh list.
- **Fixed vs dynamic confusion.** A genuine fixed array can't grow; "append is O(1)" only holds for a dynamic array and only _amortized_. The one resize is O(n) — call that out if the problem cares about worst-case latency.

## Practice problems

Five staples, each a **distinct** technique on an array — no two solved the same way.

### 1. Subarray Sum Equals K — _prefix sum + hashing_

**Problem.** Given an integer array `nums` (values may be negative) and an integer `k`, count the number of **contiguous subarrays** whose sum equals `k`. E.g. `nums = [1, 1, 1], k = 2` → `2` (the two adjacent `[1,1]` pairs).

**Approach.** A subarray `(i..j]` sums to `prefix[j] − prefix[i]`. So `sum(i..j] == k` ⟺ `prefix[i] == prefix[j] − k`. Sweep left to right keeping a running prefix sum and a hashmap of _how many times each prefix value has occurred_. At each `j`, the count of valid left endpoints is how many earlier prefixes equalled `prefix − k`. One pass — negatives are fine (no sliding window, which would need monotonicity).

```python
from collections import defaultdict

def subarray_sum(nums: list[int], k: int) -> int:
    count = 0
    prefix = 0
    seen: dict[int, int] = defaultdict(int)
    seen[0] = 1                       # empty prefix, so subarrays starting at index 0 count
    for x in nums:
        prefix += x
        count += seen[prefix - k]     # earlier prefixes that make sum == k
        seen[prefix] += 1
    return count
```

**Complexity.** O(n) time, O(n) space.

### 2. Trapping Rain Water — _converging two pointers_

**Problem.** Given `height`, an array of non-negative bar heights of width 1, compute how much rain water is trapped between the bars after it rains. E.g. `[0,1,0,2,1,0,1,3,2,1,2,1]` → `6`.

**Approach.** Water above bar `i` is `min(maxLeft, maxRight) − height[i]`. Instead of precomputing both prefix-max arrays (O(n) space), walk two pointers inward from both ends, tracking `left_max` and `right_max`. The shorter side is the binding constraint, so advance whichever pointer has the smaller running max — that side's water is fully determined. O(1) space.

```python
def trap(height: list[int]) -> int:
    lo, hi = 0, len(height) - 1
    left_max = right_max = 0
    water = 0
    while lo < hi:
        if height[lo] < height[hi]:        # left side is the binding wall
            left_max = max(left_max, height[lo])
            water += left_max - height[lo]
            lo += 1
        else:                               # right side is binding
            right_max = max(right_max, height[hi])
            water += right_max - height[hi]
            hi -= 1
    return water
```

**Complexity.** O(n) time, O(1) space.

### 3. Next Permutation — _in-place index manipulation_

**Problem.** Rearrange `nums` into the **next lexicographically greater** permutation in place. If it's already the largest (descending), wrap to the smallest (ascending). E.g. `[1,2,3]→[1,3,2]`, `[3,2,1]→[1,2,3]`, `[1,1,5]→[1,5,1]`.

**Approach.** Scan from the right for the first index `i` where `nums[i] < nums[i+1]` — the pivot, the rightmost spot that can be increased. Everything right of it is descending (already maximal). Find the rightmost element greater than `nums[i]`, swap them (smallest possible increase at the pivot), then **reverse the suffix** after `i` to make it ascending (smallest tail). Pure index work, O(1) space.

```python
def next_permutation(nums: list[int]) -> None:
    n = len(nums)
    i = n - 2
    while i >= 0 and nums[i] >= nums[i + 1]:   # find pivot
        i -= 1
    if i >= 0:                                  # not the last permutation
        j = n - 1
        while nums[j] <= nums[i]:               # rightmost element > pivot
            j -= 1
        nums[i], nums[j] = nums[j], nums[i]
    nums[i + 1:] = reversed(nums[i + 1:])       # reverse the suffix
```

**Complexity.** O(n) time, O(1) space.

### 4. Find the Duplicate Number — _array-as-function, Floyd cycle detection_

**Problem.** An array `nums` of `n + 1` integers, each in `[1, n]`. Exactly one value is duplicated (possibly many times). Find it **without modifying the array** and in **O(1) extra space**. E.g. `[1,3,4,2,2] → 2`.

**Approach.** Treat the array as a function `i → nums[i]`. Because values are in `[1, n]` and there are `n + 1` of them, following `next = nums[cur]` must eventually revisit a value → a cycle, and the cycle's entrance is the duplicate. Use Floyd's tortoise-and-hare: phase 1 finds a meeting point inside the cycle; phase 2 walks one pointer from the start and one from the meeting point at equal speed — they meet at the cycle entrance.

```python
def find_duplicate(nums: list[int]) -> int:
    slow = fast = nums[0]
    while True:                       # phase 1: find a point inside the cycle
        slow = nums[slow]
        fast = nums[nums[fast]]
        if slow == fast:
            break
    slow = nums[0]
    while slow != fast:               # phase 2: find the cycle entrance
        slow = nums[slow]
        fast = nums[fast]
    return slow
```

**Complexity.** O(n) time, O(1) space — beats the O(n)-space hashset and the array-mutating sign-flip trick.

### 5. Maximum Subarray — _Kadane's dynamic programming_

**Problem.** Find the contiguous subarray with the largest sum and return that sum. At least one element; values may be negative. E.g. `[-2,1,-3,4,-1,2,1,-5,4] → 6` (the subarray `[4,-1,2,1]`).

**Approach.** DP over endpoints: `best_ending_here` = the max sum of a subarray that _ends_ at the current index. Either extend the previous one or start fresh at the current element — `max(x, best_ending_here + x)`. Track the global best across all endpoints. One pass; the insight is that a negative running sum is never worth carrying forward.

```python
def max_subarray(nums: list[int]) -> int:
    best = cur = nums[0]
    for x in nums[1:]:
        cur = max(x, cur + x)         # extend, or restart at x
        best = max(best, cur)
    return best
```

**Complexity.** O(n) time, O(1) space.
