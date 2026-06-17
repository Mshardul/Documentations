# Data Structures & Algorithms

Interview-ready DSA reference. Understand a structure or algorithm, know its complexity, know when to reach for it, see a clean implementation, and practice on representative problems.

Three sections: **data structures** (structural reference), **algorithms** (procedure + proof), **patterns** (recognition + transfer).

---

## Data Structures

Structural references. Each page covers how it works, operations with their complexity, when to use it, variants, and an implementation.

| Structure                                                           | Description                                                                                                                                           |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Array](./data-structures/array.md)                                 | Contiguous block, O(1) indexed access, O(n) middle insert/delete. The foundation every other structure builds on.                                     |
| [Dynamic Array](./data-structures/dynamic-array.md)                 | Growable array that doubles when full. Amortized O(1) append — the canonical amortization argument.                                                   |
| [Circular Buffer](./data-structures/circular-buffer.md)             | Fixed-size ring with head/tail wraparound. True O(1) enqueue/dequeue, no resize — fixed-capacity FIFO and sliding windows.                            |
| [Heap](./data-structures/heap.md)                                   | Binary tree where every parent beats its children, stored in a flat array. O(1) peek, O(log n) push/pop — the priority queue and "top-K" workhorse.   |
| [String](./data-structures/string.md)                               | Immutable sequence of characters. Indexing, slicing, and the building/scanning patterns that dominate text problems.                                  |
| [Linked List](./data-structures/linked-list.md)                     | Nodes chained by pointers. O(1) insert/delete at a known node, O(n) search — the pointer-manipulation classic.                                        |
| [Stack](./data-structures/stack.md)                                 | LIFO. O(1) push/pop — function calls, matching, undo, and the monotonic-stack trick.                                                                  |
| [Queue](./data-structures/queue.md)                                 | FIFO. O(1) enqueue/dequeue — BFS frontier, scheduling, and the deque generalization.                                                                  |
| [Hash Table](./data-structures/hash-table.md)                       | Key→value via a hash function. Average O(1) insert/lookup/delete — the workhorse map; chaining vs open addressing, load factor, resize.               |
| [Hash Set](./data-structures/hash-set.md)                           | Membership-only hash structure. Average O(1) contains/add — dedup and seen-set patterns.                                                              |
| [Binary Tree](./data-structures/binary-tree.md)                     | Each node has up to two children. The traversal orderings and the base for BST, heap, and trie.                                                       |
| [Binary Search Tree (BST)](./data-structures/binary-search-tree.md) | Ordered tree: left < node < right. O(log n) search/insert/delete when balanced, O(n) when skewed.                                                     |
| [Trie](./data-structures/trie.md)                                   | Prefix tree keyed by character path. O(L) lookup by length, not by count — autocomplete and prefix queries.                                           |
| [Balanced BST](./data-structures/balanced-bst.md)                   | **Hub** — survey + decision layer for self-balancing BSTs: what balancing buys, rotations, and which scheme when. Routes to AVL / Red-Black / B-tree. |
| [AVL Tree](./data-structures/avl-tree.md)                           | Strictly height-balanced BST (subtree heights differ ≤ 1). Tighter balance → faster lookups, more rotations on writes. Read-heavy workloads.          |
| [Red-Black Tree](./data-structures/red-black-tree.md)               | Loosely balanced via color invariants; recolor-first, rotate-rarely. Fewer write rotations — the library default (`std::map`, `TreeMap`, kernel).     |
| [B-Tree](./data-structures/b-tree.md)                               | High-fan-out balanced tree, many keys per node, block-aligned to minimize disk seeks. The structure behind database and filesystem indexes.           |
| [Segment Tree](./data-structures/segment-tree.md)                   | Tree over array ranges. O(log n) range query + point/range update — the CP range-aggregate workhorse.                                                 |
| [Fenwick Tree (BIT)](./data-structures/fenwick-tree.md)             | Binary-indexed tree for prefix sums. O(log n) update + prefix query with tiny code — lighter than a segment tree.                                     |
| [Union-Find (DSU)](./data-structures/union-find.md)                 | Disjoint-set forest with path compression + union by rank. Near-O(1) connectivity — Kruskal's MST, cycle detection, grouping.                         |
| [Graph](./data-structures/graph.md)                                 | Nodes + edges. Adjacency list vs matrix, directed/weighted variants — the substrate every traversal algorithm walks.                                  |

---

## Algorithms

Procedures with correctness intuition. Each page covers the worked example, the invariant, complexity _derivation_, edge cases, and an implementation.

| Algorithm                                                                       | Description                                                                                                                                                 |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Binary Search](./algorithms/binary-search.md)                                  | Halve a sorted search space each step — O(log n). Generalizes to any monotonic predicate, the basis of "binary search on the answer".                       |
| [Sorting](./algorithms/sorting.md)                                              | Comparison sorts bottom out at O(n log n) (merge/quick/heap); counting & radix break it to O(n) on bounded keys. Stability, the lower bound.                |
| [Merge Sort](./algorithms/merge-sort.md)                                        | Divide in half, sort each, merge. Guaranteed O(n log n) in all cases and stable, at O(n) space — the safe choice and the basis of external sort.            |
| [Quicksort](./algorithms/quicksort.md)                                          | Partition around a pivot in place, recurse on each side. O(n log n) average with the smallest constant; O(n²) tail unless randomized. Holds quickselect.    |
| [Insertion Sort](./algorithms/insertion-sort.md)                                | Grow a sorted prefix, sliding each new element into place. O(n²) worst but O(n) on nearly-sorted data; stable, in-place, online — Timsort's small-run sort. |
| [Counting Sort](./algorithms/counting-sort.md)                                  | Tally each key, emit in key order. O(n + k), beating the comparison bound by not comparing — integer keys in a small range only. Radix's inner pass.        |
| [Radix Sort](./algorithms/radix-sort.md)                                        | Stable counting sort per digit, least-significant first. O(d·(n + b)) — linear for fixed-width keys, where counting sort's range would explode.             |
| [Heapsort](./algorithms/heapsort.md)                                            | Build a max-heap, repeatedly extract the max into a sorted suffix. The only comparison sort with both worst-case O(n log n) and O(1) space; not stable.     |
| [Selection Sort](./algorithms/selection-sort.md)                                | Repeatedly pick the min of the unsorted suffix. O(n²) always, minimal swaps — the simplest sort, mostly a teaching baseline.                                |
| [Bucket Sort](./algorithms/bucket-sort.md)                                      | Scatter into buckets by value range, sort each, concatenate. O(n) average on uniform data — the distribution sort for floats in a range.                    |
| [Quickselect](./algorithms/quickselect.md)                                      | Quicksort's partition without recursing on both sides. O(n) average to find the k-th smallest — selection without full sort.                                |
| [Breadth-First Search (BFS)](./algorithms/bfs.md)                               | Explore level by level with a queue. Shortest path in unweighted graphs, O(V + E).                                                                          |
| [Depth-First Search (DFS)](./algorithms/dfs.md)                                 | Explore as deep as possible, backtrack. O(V + E) — cycle detection, components, topological order.                                                          |
| [Topological Sort](./algorithms/topological-sort.md)                            | Linear order of a DAG respecting edges. Kahn's BFS or DFS post-order — dependency resolution, build order.                                                  |
| [Dijkstra's Algorithm](./algorithms/dijkstra.md)                                | Shortest paths from a source with non-negative weights via a priority queue. O((V + E) log V).                                                              |
| [Bellman-Ford](./algorithms/bellman-ford.md)                                    | Shortest paths that tolerate negative edges and detect negative cycles. O(V·E) — slower than Dijkstra, more general.                                        |
| [Floyd-Warshall](./algorithms/floyd-warshall.md)                                | All-pairs shortest paths by DP over intermediates. O(V³) — dense graphs, small V, transitive closure.                                                       |
| [Minimum Spanning Tree (Kruskal / Prim)](./algorithms/minimum-spanning-tree.md) | Cheapest tree connecting all nodes. Kruskal (sort + DSU) or Prim (PQ) — network design.                                                                     |
| [Recursion](./algorithms/recursion.md)                                          | A function defined in terms of itself: base case + recursive case. The substrate under divide-and-conquer, backtracking, and DP.                            |
| [Backtracking](./algorithms/backtracking.md)                                    | Build candidates incrementally, abandon dead ends (prune). The systematic search for subsets, permutations, and constraint problems.                        |
| [Dynamic Programming](./algorithms/dynamic-programming.md)                      | Solve overlapping subproblems once, reuse via memo or table. Optimal substructure → the recurrence that collapses exponential to polynomial.                |
| [Bit Manipulation](./algorithms/bit-manipulation.md)                            | Operate on individual bits: masks, shifts, XOR tricks. O(1) set operations and the bitmask-DP enabler.                                                      |
| [Greedy](./algorithms/greedy.md)                                                | Take the locally best choice each step; prove it's globally optimal by an exchange argument. Interval scheduling, Huffman, MST choices.                     |

---

## Patterns

Recognition and transfer. Each page covers trigger phrases, structural cues, a reusable skeleton, and problems that reuse the pattern.

| Pattern                                                                     | Description                                                                                                                    |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| [Two Pointers](./patterns/two-pointers.md)                                  | Two indices walking a sequence (same or opposite ends). Pair-sum, dedup, partition — O(n) where brute force is O(n²).          |
| [Sliding Window](./patterns/sliding-window.md)                              | A moving sub-range over a sequence: expand right, contract left on a constraint. Longest/shortest contiguous subarray in O(n). |
| [Prefix Sum](./patterns/prefix-sum.md)                                      | Precompute cumulative sums for O(1) range queries. The "subarray sum equals K" and difference-array family.                    |
| [Fast & Slow Pointers](./patterns/fast-slow-pointers.md)                    | Two pointers at different speeds. Cycle detection, middle of a list, cycle start — Floyd's tortoise and hare.                  |
| [Merge Intervals](./patterns/merge-intervals.md)                            | Sort by start, sweep, merge overlaps. The interval-overlap, meeting-rooms, insert-interval family.                             |
| [Cyclic Sort](./patterns/cyclic-sort.md)                                    | Place each value at its index in O(n) when values are 1..n. Finds the missing/duplicate number without extra space.            |
| [Monotonic Stack](./patterns/monotonic-stack.md)                            | A stack kept increasing or decreasing. Next-greater-element, daily temperatures, histogram — amortized O(n).                   |
| [Top-K Elements](./patterns/top-k-elements.md)                              | A size-k heap over a stream. K largest/smallest/most-frequent in O(n log k) without sorting everything.                        |
| [Binary Search on Answer](./patterns/binary-search-on-answer.md)            | Binary search the answer space when feasibility is monotonic. "Minimize the max" / "maximize the min" problems.                |
| [Subsets & Permutations](./patterns/subsets-permutations.md)                | Backtracking templates for the power set, permutations, and combinations — with dedup for repeats.                             |
| [Tree & Graph Traversal](./patterns/tree-graph-traversal.md)                | The BFS/DFS skeletons applied as a problem pattern: level-order, path-sum, connected components, flood fill.                   |
| [DP Patterns](./patterns/dp-patterns.md)                                    | The recurring DP shapes: 0/1 knapsack, unbounded, LIS, LCS, grid paths, interval DP — recognition and the state to pick.       |
| [Pattern Selection Cheat Sheet](./patterns/pattern-selection-cheatsheet.md) | The aggregator: trigger phrase → which pattern. The fast lookup that ships last, once every pattern exists.                    |
