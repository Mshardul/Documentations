# Heapsort

## Prerequisites

- **Big-O Notation** [Must read] - heapsort's pitch is "worst-case O(n log n) _and_ O(1) space"; both halves of that claim are complexity statements you must be able to read. <!-- U9: not-yet-written target — wire to `algorithms/big-o-notation.md` (bracket-link form) once that page exists. -->
- [Heap](../data-structures/heap.md) [Must read] - heapsort _is_ the heap's build + repeated extract-max applied in place; you must understand the heap invariant, sift-down, and O(n) build-heap before this page.
- [Array](../data-structures/array.md) [Must read] - the heap lives in the array being sorted; the in-place O(1)-space trick is index arithmetic on that array.
- [Sorting](./sorting.md) [Should read] - the hub: where heapsort sits among the six sorts and why "O(n log n) worst case + O(1) space" is its unique niche.

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
  - [Sort an Array](#1-sort-an-array--heapsort-in-place)
  - [Kth Largest Element](#2-kth-largest-element--partial-heapsort)
  - [Sort a Nearly Sorted Array](#3-sort-a-nearly-sorted-array--heap-of-window-size)
  - [Last Stone Weight](#4-last-stone-weight--repeated-extract-max)

## What it is

**Heapsort** sorts an array in place by turning it into a **max-heap**, then repeatedly **extracting the maximum** to the array's end. After building the heap (O(n)), each step swaps the root (the current max) to the last unsorted slot, shrinks the heap by one, and sift-downs the new root — growing a **sorted suffix** from the right while the heap shrinks from the left.

Mental model: **selection sort with a turbocharger.** Selection sort also repeatedly grabs the largest remaining element and parks it at the end — but it _scans_ the whole remainder each time (O(n) per pick → O(n²)). Heapsort keeps the remainder in a heap, so grabbing the max and re-heaping costs O(log n), not O(n) — turning the O(n²) into O(n log n).

Heapsort's unique selling point among comparison sorts: **worst-case O(n log n) guaranteed** (unlike [quicksort](./quicksort.md)'s O(n²) tail) **and O(1) extra space** (unlike [merge sort](./merge-sort.md)'s O(n) buffer). It's the only common comparison sort with _both_. The price is that it's **not stable** and its memory access jumps all over the array (poor cache locality), so quicksort usually beats it in wall-clock time despite the identical asymptotic — which is why heapsort's real-world role is the **safety net inside introsort** (switch to it when quicksort recurses too deep).

> **Takeaway (say this out loud):** "Heapsort build-heaps then repeatedly extracts the max into a growing sorted suffix — worst-case O(n log n) with O(1) space, the only comparison sort with both, but not stable and cache-unfriendly."

**Complexity:** O(n log n) time (best = average = worst), O(1) auxiliary space.

## Intuition

Two ideas, both inherited from the [heap](../data-structures/heap.md):

**Why O(n log n) and not O(n²):** the bottleneck in selection sort is _finding_ the max — an O(n) scan. A max-heap makes the max free (it's the root) and makes _restoring_ the max-property after removing it cheap (one sift-down, O(log n)). So each of the `n` extractions is O(log n) instead of O(n). The heap converts "scan for the max" into "the max is already at the top."

**Why O(1) space:** the heap doesn't need a separate array — it lives _in the array being sorted_. The boundary between "heap region" (front) and "sorted region" (back) is just an index. Each extraction swaps the root into the slot just past the shrinking heap, so the sorted suffix and the heap share the same array with no overlap. No buffer, no recursion-heavy stack (sift-down can be iterative) → O(1) extra.

## How it works

Heapsort `a = [3, 7, 2, 9, 6]`. **Phase 1: build a max-heap** (bottom-up heapify). **Phase 2: repeatedly swap root to the end and sift down.**

**Phase 1 — build-max-heap** (sift down each non-leaf, bottom-up):

```
start:  [3, 7, 2, 9, 6]              heapify from index 1 (n//2-1=1) downto 0
i=1 (7): children 9,6 → 9 > 7, swap  [3, 9, 2, 7, 6]
i=0 (3): children 9,2 → 9 > 3, swap  [9, 3, 2, 7, 6]
         3 now at i=1: children 7,6 → 7 > 3, swap  [9, 7, 2, 3, 6]
max-heap: [9, 7, 2, 3, 6]   (9 at root = max)
```

**Phase 2 — extract max into the sorted suffix** (`|` marks heap | sorted boundary):

```
heap=[9,7,2,3,6 |]      swap root↔last, heap size 4, sift down
  → [6,7,2,3 | 9]   sift 6: 7>6 swap → [7,6,2,3 | 9]
heap=[7,6,2,3 | 9]      swap root↔last(3), size 3, sift
  → [3,6,2 | 7,9]   sift 3: 6>3 swap → [6,3,2 | 7,9]
heap=[6,3,2 | 7,9]      swap root↔last(2), size 2, sift
  → [2,3 | 6,7,9]   sift 2: 3>2 swap → [3,2 | 6,7,9]
heap=[3,2 | 6,7,9]      swap root↔last, size 1
  → [2 | 3,6,7,9]   heap size 1, done
result: [2,3,6,7,9]   ✓
```

Each extraction moves the current max to the front of the sorted suffix; the heap shrinks by one and re-heaps in O(log n). The array is sorted ascending using a _max_-heap precisely because extracted maxes pile up at the right end.

## Correctness / invariant

Two invariants, one per phase:

**Build phase (heapify invariant):** processing nodes from `⌊n/2⌋-1` downto 0, before handling node `i`, _every node with index > `i` is already the root of a valid max-heap_. Sift-down at `i` (whose children's subtrees are already heaps) makes `i`'s subtree a heap too. When `i = 0` finishes, the whole array is a max-heap. (Bottom-up order is essential — it guarantees children are heaps before their parent is processed.)

**Sort phase (sorted-suffix invariant):** at the start of each extraction with heap size `m`, _(1)_ `a[0..m-1]` is a valid max-heap, and _(2)_ `a[m..n-1]` is sorted and contains the `n-m` largest elements in their final positions.

- _Initialization:_ after build, `m = n` — the whole array is a heap, the empty suffix is trivially sorted.
- _Maintenance:_ swap `a[0]` (the max of the heap) with `a[m-1]`. Now the largest heap element sits at index `m-1`, just before the sorted suffix — and it's ≤ everything already in the suffix (those were extracted earlier, hence larger) and ≥ everything left in the heap. Shrink to `m-1` and sift-down the new root to restore the heap. Both clauses hold for `m-1`.
- _Termination:_ `m = 1` — the lone heap element is the global minimum, already in place; `a[0..n-1]` is sorted.

The correctness hinges entirely on the [heap](../data-structures/heap.md) property: the root is always the max of the live region, so extracting it in order produces sorted output.

## Complexity derivation

Two phases, summed:

- **Build-heap:** **O(n)**, not O(n log n) — the bottom-up heapify result (derived on the [heap](../data-structures/heap.md) page): a node at height `h` does O(h) work and there are ≤ `n/2^(h+1)` such nodes, and `Σ h/2^h` converges, giving `O(n)`.
- **Extraction:** `n` extractions, each an O(1) swap plus a sift-down costing O(log m) for current heap size `m`. Total: `Σ_{m=1}^{n} log m = log(n!) = Θ(n log n)` (Stirling).

```
T(n) = O(n) + Θ(n log n) = Θ(n log n)
```

**Best = average = worst, all Θ(n log n)** — like merge sort, there is no bad input: the extraction loop always does `n` sift-downs of height up to `log n`, regardless of initial order. (Even an already-sorted array is fully re-heaped and extracted — heapsort is _not_ adaptive.) **Space is O(1)**: the heap is in-place, and sift-down is written iteratively (no recursion stack). The build's O(n) is dominated, so it doesn't change the bound — but it's the reason heapsort isn't _slower_ than merge sort despite doing two passes.

## Constraints & approach

| Constraint                                     | Expected approach               | What it tells you                                                                         |
| ---------------------------------------------- | ------------------------------- | ----------------------------------------------------------------------------------------- |
| "worst case must be O(n log n)" + tight memory | heapsort                        | The only comparison sort giving _both_ guaranteed O(n log n) and O(1) space.              |
| `n ≤ 10⁵–10⁷`, general in-memory sort          | quicksort/introsort             | Heapsort's bound is fine but its cache misses lose wall-clock; quicksort's constant wins. |
| need top-K, not a full sort                    | partial heapsort / bounded heap | Extract only K times → O(n + K log n); or a size-K heap → O(n log K).                     |
| stability required                             | merge sort instead              | Heapsort is _not_ stable — the constraint rules it out.                                   |

The senior reading: heapsort is the answer to the specific phrase **"guaranteed O(n log n) without extra memory"**; for general speed you'd pick quicksort, for stability merge sort. Its niche is narrow but real (embedded/real-time systems, introsort's fallback).

## When to use / when not

Reach for heapsort when you need a **guaranteed O(n log n) worst case** (no adversarial O(n²) tail like [quicksort](./quicksort.md)) **together with O(1) extra space** (unlike [merge sort](./merge-sort.md)'s O(n) buffer) — the combination no other common comparison sort offers. That makes it valuable in **memory-constrained or hard-real-time** settings where both the worst-case bound and the space ceiling are contractual, and as the **fallback inside introsort**: run quicksort, but if recursion depth exceeds ~`2 log n`, switch that branch to heapsort to cap the worst case at O(n log n).

Don't use heapsort as a general default — [quicksort](./quicksort.md) has a smaller constant and far better cache locality (sequential partitioning vs heapsort's scattered parent/child jumps), so it wins wall-clock for typical in-memory sorting. Don't use it when you need **stability** (heapsort reorders equal keys — use merge sort) or when the data is **nearly sorted** (heapsort isn't adaptive; insertion sort or Timsort exploit existing order). And if you only need the **extreme few** (top-K), don't full-sort — use a bounded [heap](../data-structures/heap.md) instead.

Heapsort's real deployment is as **introsort's safety net** (C++ `std::sort`) and anywhere a heap is already maintained and a one-shot sorted dump is needed.

## Comparison

| Algorithm      | Best    | Average | Worst   | Space    | Stable | Adaptive | Key trait                                      |
| -------------- | ------- | ------- | ------- | -------- | ------ | -------- | ---------------------------------------------- |
| **Heapsort**   | n log n | n log n | n log n | **O(1)** | ❌     | ❌       | Worst-case bound **+** O(1) space; cache-poor  |
| Quicksort      | n log n | n log n | **n²**  | O(log n) | ❌     | ❌       | Fastest constant; cache-friendly; O(n²) tail   |
| Merge sort     | n log n | n log n | n log n | O(n)     | ✅     | ❌       | Guaranteed bound; stable; needs O(n) buffer    |
| Introsort      | n log n | n log n | n log n | O(log n) | ❌     | ❌       | Quicksort + heapsort fallback — best of both   |
| Selection sort | n²      | n²      | n²      | O(1)     | ❌     | ❌       | Heapsort without the heap — O(n) scan per pick |

The clean framing: heapsort is **selection sort with an O(log n) "find max" instead of O(n)**. Versus its O(n log n) rivals, it's the space champion (O(1)) but the cache loser; introsort exists to get heapsort's worst-case guarantee while spending most of its time in cache-friendly quicksort.

## Loop/recurrence invariant

> **Family note:** heapsort is filed under **Search/divide** (heading: Loop/recurrence invariant) as the nearest match, but it is not divide-and-conquer — it has no array-splitting recurrence like [merge sort](./merge-sort.md). It's a **selection sort accelerated by a [heap](../data-structures/heap.md)**: a loop with a clear invariant (the growing sorted suffix), where the per-step cost comes from the heap's sift-down recurrence. The depth lives in the two-phase invariant and the build-vs-extract complexity split, not in a master-theorem recurrence.

- **The loop invariant** (the substance): the sorted-suffix invariant proven above — `a[m..n-1]` holds the largest `n-m` elements, sorted and final; `a[0..m-1]` is a max-heap. Each iteration extends the suffix by one.
- **The per-step recurrence** comes from sift-down: restoring the heap after removing the root costs `T(h) = T(h-1) + O(1) = O(h) = O(log n)`, walking one root-to-leaf path. This is the heap's recurrence, not a sorting recurrence.
- **Contrast with the true Search/divide members.** [Binary search](./binary-search.md) (`T(n)=T(n/2)+O(1)`) and [merge sort](./merge-sort.md) (`T(n)=2T(n/2)+O(n)`) _split the input_. Heapsort doesn't split — it _selects_ repeatedly. The shared trait is only the logarithmic factor, which here comes from tree height, not from halving a search space. The honest family is "selection + heap," which the taxonomy has no slot for.

## Edge cases

- **Empty / single element** — `n ≤ 1` is already sorted; build-heap and the extraction loop are no-ops. Guard the heapify start index (`n//2 - 1` is negative for `n ≤ 1`).
- **Already sorted** — still O(n log n): heapsort is **not adaptive**, it rebuilds the heap and extracts all `n` regardless. A real downside vs Timsort on nearly-sorted data — worth stating, since it's a common "gotcha" question.
- **All-equal elements** — O(n log n), correct: every sift-down finds children equal (not greater), so swaps are minimal but the structure still processes all `n`. No degeneracy (unlike quicksort's all-equal O(n²)).
- **Stability (the key non-feature)** — heapsort is **not stable**: the root-to-end swap moves an element across the array, leapfrogging equal keys. There's no cheap fix; if stability matters, use merge sort. Naming this unprompted is a senior tell.
- **Max-heap for ascending, min-heap for descending** — to sort ascending you build a _max_-heap (extracted maxes fill the end); using a min-heap by mistake sorts descending. A frequent off-by-direction bug.
- **Iterative sift-down (CP-flavored)** — write sift-down as a loop, not recursion, to keep space at a true O(1); recursive sift-down adds O(log n) stack. Also, the sift-down bound check must use the _current_ heap size `m`, not `n` — comparing against `n` would pull already-sorted suffix elements back into the heap, a corrupting off-by-one.

## Implementation

**Pseudocode** (CLRS — build then extract; `MAX-HEAPIFY` is the sift-down from the [heap](../data-structures/heap.md) page):

```
HEAPSORT(A, n)
 1  BUILD-MAX-HEAP(A, n)                   ▷ O(n): heapify all non-leaves bottom-up
 2  for i ← n − 1 downto 1
 3      swap A[0] A[i]                      ▷ move current max to the sorted suffix
 4      MAX-HEAPIFY(A, 0, i)               ▷ heap size shrinks to i; sift new root down

BUILD-MAX-HEAP(A, n)
 1  for i ← ⌊n/2⌋ − 1 downto 0
 2      MAX-HEAPIFY(A, i, n)

MAX-HEAPIFY(A, i, heap_size)              ▷ sift A[i] down within A[0..heap_size-1]
 1  l ← 2i + 1; r ← 2i + 2; largest ← i
 2  if l < heap_size and A[l] > A[largest]: largest ← l
 3  if r < heap_size and A[r] > A[largest]: largest ← r
 4  if largest ≠ i
 5      swap A[i] A[largest]
 6      MAX-HEAPIFY(A, largest, heap_size)
```

**Python** — in-place, iterative sift-down (true O(1) space), plus the contest-velocity `heapq` route:

```python
def heapsort(a: list[int]) -> None:
    """In-place, O(n log n) worst case, O(1) space. Ascending via a max-heap."""
    n = len(a)

    def sift_down(i: int, heap_size: int) -> None:
        while True:
            largest, l, r = i, 2 * i + 1, 2 * i + 2
            if l < heap_size and a[l] > a[largest]: largest = l
            if r < heap_size and a[r] > a[largest]: largest = r
            if largest == i:
                break
            a[i], a[largest] = a[largest], a[i]
            i = largest

    for i in range(n // 2 - 1, -1, -1):          # build max-heap, O(n)
        sift_down(i, n)
    for end in range(n - 1, 0, -1):              # extract max into the suffix
        a[0], a[end] = a[end], a[0]              # max to its final slot
        sift_down(0, end)                         # re-heap the shrunk region


# Contest / real-world velocity: you don't write heapsort — heapq sorts via repeated pop,
# or you just call sorted(). heapq.heappop in a loop IS heapsort (with O(n) extra space).
import heapq
def heapsort_via_heapq(a: list[int]) -> list[int]:
    h = a[:]; heapq.heapify(h)                    # O(n) build (min-heap)
    return [heapq.heappop(h) for _ in range(len(h))]   # ascending
```

## What the interviewer probes for

- **"Why heapsort over quicksort or merge sort?"** — It's the only comparison sort with _both_ guaranteed O(n log n) worst case and O(1) space. Quicksort has the O(n²) tail; merge sort needs O(n) space. Heapsort wins exactly when both constraints bind (real-time + memory-limited).
- **"Then why isn't it the default?"** — Cache locality. Heapsort's parent/child jumps scatter across the array, causing cache misses; quicksort's sequential partitioning is cache-friendly, so it's faster in wall-clock despite the same asymptotic. That's why introsort uses quicksort first and heapsort only as a depth-limit fallback.
- **"Why is build-heap O(n) and not O(n log n)?"** — Bottom-up heapify: most nodes are near the leaves and sift down only O(1); the work sums to `O(n·Σ h/2^h) = O(n)`. Doing `n` individual inserts _would_ be O(n log n) — build-heap is cheaper.
- **"Is it stable? Can you make it?"** — No; the root-to-end swap leapfrogs equal keys across the array. No cheap stabilization — use merge sort if stability matters.
- **"Ascending sort — min-heap or max-heap?"** — Max-heap. Extracted maxes are placed at the _end_, building the sorted suffix back-to-front. A min-heap would sort descending (or need extra space).

## Practice problems

### 1. Sort an Array — heapsort in place

Sort an integer array in O(n log n) **worst case** with O(1) extra space, no library sort. Constraints: `n ≤ 5·10⁴`; the worst-case + space requirement is what points at heapsort over quicksort.

**Approach:** Textbook in-place heapsort: build a max-heap (O(n)), then repeatedly swap the root to the shrinking end and sift down. Unlike quicksort it has no O(n²) input and unlike merge sort it needs no buffer — the guarantees are the point of choosing it here.

```python
def sort_array(nums: list[int]) -> list[int]:
    n = len(nums)
    def sift(i, size):
        while True:
            big, l, r = i, 2*i+1, 2*i+2
            if l < size and nums[l] > nums[big]: big = l
            if r < size and nums[r] > nums[big]: big = r
            if big == i: break
            nums[i], nums[big] = nums[big], nums[i]; i = big
    for i in range(n//2 - 1, -1, -1): sift(i, n)
    for end in range(n-1, 0, -1):
        nums[0], nums[end] = nums[end], nums[0]; sift(0, end)
    return nums
```

Time O(n log n) worst case, space O(1). Pattern: in-place heapsort.

### 2. Kth Largest Element — partial heapsort

Find the k-th largest element. Constraints: `n ≤ 10⁵`; a full sort is O(n log n), but you only need `k` extractions.

**Approach:** **Partial heapsort** — build a max-heap (O(n)), then extract the max only `k` times; the k-th extraction is the answer. O(n + k log n), better than a full sort when `k ≪ n`. (A size-`k` _min_-heap is the alternative, O(n log k); partial heapsort wins when `k` is moderate and you've already got the array.)

```python
import heapq

def find_kth_largest(nums: list[int], k: int) -> int:
    h = [-x for x in nums]                        # max-heap via negation
    heapq.heapify(h)                              # O(n) build
    for _ in range(k - 1):
        heapq.heappop(h)                          # discard the top k-1 maxima
    return -heapq.heappop(h)                       # k-th largest
```

Time O(n + k log n), space O(n). Pattern: partial heapsort (extract k times).

### 3. Sort a Nearly Sorted Array — heap of window size

Each element is at most `k` positions from its sorted spot. Sort it efficiently. Constraints: `k ≪ n` — bounded displacement, the heap-window signal.

**Approach:** Maintain a **min-heap of size `k+1`**. Because no element is more than `k` away, the smallest of the next `k+1` elements is the next sorted element. Push the first `k+1`, then for each subsequent position pop the min (it's finalized) and push the next. O(n log k) — heapsort's machinery applied to a sliding window. (Insertion sort also does O(n·k) here; the heap wins when `k` is larger.)

```python
import heapq

def sort_nearly_sorted(nums: list[int], k: int) -> list[int]:
    heap = nums[:k + 1]
    heapq.heapify(heap)                           # window of size k+1
    out, idx = [], k + 1
    while heap:
        out.append(heapq.heappop(heap))           # min of window is finalized
        if idx < len(nums):
            heapq.heappush(heap, nums[idx]); idx += 1
    return out
```

Time O(n log k), space O(k). Pattern: sliding min-heap over a bounded-displacement array.

### 4. Last Stone Weight — repeated extract-max

Repeatedly smash the two heaviest stones (`a, b` → `|a-b|`, or both gone if equal) until ≤ 1 remains; return its weight (0 if none). Constraints: `n ≤ 30`, weights ≤ 1000 — the "repeatedly take the two largest" structure is a max-heap loop.

**Approach:** The core heapsort/heap move — repeated extract-max — without the full sort. Build a max-heap; each round pop the two largest, push back their difference if nonzero. The heap keeps the max accessible in O(log n) per smash, so the whole process is O(n log n).

```python
import heapq

def last_stone_weight(stones: list[int]) -> int:
    h = [-s for s in stones]                      # max-heap via negation
    heapq.heapify(h)
    while len(h) > 1:
        a = -heapq.heappop(h)                      # largest
        b = -heapq.heappop(h)                      # second largest
        if a != b:
            heapq.heappush(h, -(a - b))            # push the remainder
    return -h[0] if h else 0
```

Time O(n log n), space O(n). Pattern: repeated extract-max via a heap.
