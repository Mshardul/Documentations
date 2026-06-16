# Data Structures & Algorithms

Interview-ready DSA reference. Understand a structure or algorithm, know its complexity, know when to reach for it, see a clean implementation, and practice on representative problems.

Three sections: **data structures** (structural reference), **algorithms** (procedure + proof), **patterns** (recognition + transfer).

---

## Data Structures

Structural references. Each page covers how it works, operations with their complexity, when to use it, variants, and an implementation.

| Structure                                               | Description                                                                                                                                         |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Array](./data-structures/array.md)                     | Contiguous block, O(1) indexed access, O(n) middle insert/delete. The foundation every other structure builds on.                                   |
| [Dynamic Array](./data-structures/dynamic-array.md)     | Growable array that doubles when full. Amortized O(1) append — the canonical amortization argument.                                                 |
| [Circular Buffer](./data-structures/circular-buffer.md) | Fixed-size ring with head/tail wraparound. True O(1) enqueue/dequeue, no resize — fixed-capacity FIFO and sliding windows.                          |
| [Heap](./data-structures/heap.md)                       | Binary tree where every parent beats its children, stored in a flat array. O(1) peek, O(log n) push/pop — the priority queue and "top-K" workhorse. |

---

## Algorithms

Procedures with correctness intuition. Each page covers the worked example, the invariant, complexity _derivation_, edge cases, and an implementation.

| Algorithm                                        | Description                                                                                                                                                 |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Binary Search](./algorithms/binary-search.md)   | Halve a sorted search space each step — O(log n). Generalizes to any monotonic predicate, the basis of "binary search on the answer".                       |
| [Sorting](./algorithms/sorting.md)               | Comparison sorts bottom out at O(n log n) (merge/quick/heap); counting & radix break it to O(n) on bounded keys. Stability, the lower bound.                |
| [Merge Sort](./algorithms/merge-sort.md)         | Divide in half, sort each, merge. Guaranteed O(n log n) in all cases and stable, at O(n) space — the safe choice and the basis of external sort.            |
| [Quicksort](./algorithms/quicksort.md)           | Partition around a pivot in place, recurse on each side. O(n log n) average with the smallest constant; O(n²) tail unless randomized. Holds quickselect.    |
| [Insertion Sort](./algorithms/insertion-sort.md) | Grow a sorted prefix, sliding each new element into place. O(n²) worst but O(n) on nearly-sorted data; stable, in-place, online — Timsort's small-run sort. |
| [Counting Sort](./algorithms/counting-sort.md)   | Tally each key, emit in key order. O(n + k), beating the comparison bound by not comparing — integer keys in a small range only. Radix's inner pass.        |
| [Radix Sort](./algorithms/radix-sort.md)         | Stable counting sort per digit, least-significant first. O(d·(n + b)) — linear for fixed-width keys, where counting sort's range would explode.             |
| [Heapsort](./algorithms/heapsort.md)             | Build a max-heap, repeatedly extract the max into a sorted suffix. The only comparison sort with both worst-case O(n log n) and O(1) space; not stable.     |

---

## Patterns

Recognition and transfer. Each page covers trigger phrases, structural cues, a reusable skeleton, and problems that reuse the pattern.

| Pattern | Description |
| ------- | ----------- |
