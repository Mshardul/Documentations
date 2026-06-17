# Binary Search Tree

## Prerequisites

- **Big-O Notation** [Must read] - the BST's whole promise is O(log n) — and its whole failure mode is O(n) when skewed; you need the cost model to see the difference. <!-- U9: not-yet-written target — wire to `algorithms/big-o-notation.md` once that page exists. -->
- [Binary Tree](./binary-tree.md) [Must read] - a BST is a binary tree plus one ordering rule; all the traversal and recursion machinery transfers directly.
- [Binary Search](../algorithms/binary-search.md) [Should read] - a BST is binary search made into a structure: each node is a comparison that halves the remaining search space.

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
- [Traversal & invariant](#traversal--invariant)
  - [The BST ordering invariant](#the-bst-ordering-invariant)
  - [In-order traversal = sorted](#in-order-traversal--sorted)
  - [Why balance is everything](#why-balance-is-everything)
- [Implementation](#implementation)
- [CP-primitives](#cp-primitives)
  - [Predecessor / successor & range queries](#predecessor--successor--range-queries)
  - [Balanced BST via the standard library](#balanced-bst-via-the-standard-library)
- [Gotchas / edge cases](#gotchas--edge-cases)
- [Practice problems](#practice-problems)
  - [Validate Binary Search Tree](#1-validate-binary-search-tree--bounded-recursion)
  - [Kth Smallest Element in a BST](#2-kth-smallest-element-in-a-bst--in-order-counting)
  - [Lowest Common Ancestor of a BST](#3-lowest-common-ancestor-of-a-bst--ordering-shortcut)
  - [Insert into a BST](#4-insert-into-a-bst--recursive-descent)
  - [Convert Sorted Array to BST](#5-convert-sorted-array-to-bst--balanced-build)

## What it is

A **binary search tree** is a [binary tree](./binary-tree.md) with one ordering rule: for **every** node, all keys in its left subtree are smaller and all keys in its right subtree are larger.

Mental model: **binary search frozen into a structure.** Every node is a yes/no comparison — "smaller? go left; larger? go right" — and each step throws away half the remaining tree, exactly like [binary search](../algorithms/binary-search.md) on a sorted array. The difference: an array gives O(log n) search but O(n) insert; the BST keeps **both** search and insert at O(log n) (when balanced), and gives you sorted order for free via in-order traversal.

> **Takeaway (say this out loud):** "A BST keeps keys ordered so search, insert, and delete are O(log n) — and in-order traversal spits them out sorted. The catch is it degrades to O(n) if it gets skewed."

## How it works

The BST **invariant** holds at every node: `left subtree keys < node.key < right subtree keys`. That single rule turns search into a guided descent — at each node you compare, then go left or right, never both.

```
            (8)
           /   \
        (3)     (10)
        /  \        \
     (1)   (6)      (14)
           /  \      /
        (4)  (7)  (13)

search 7:  8 → 7<8 go left → 3 → 7>3 go right → 6 → 7>6 go right → 7 ✓   (3 comparisons)
insert 5:  8 → left → 3 → right → 6 → left → 4 → right → null → place 5 there
```

Each comparison **halves** the candidate set, so a search visits at most `height` nodes. When the tree is balanced, height ≈ log₂ n → **O(log n)**. The recursion is the same `tree = node + left + right` self-similarity as the [binary tree](./binary-tree.md), now with the comparison deciding _which_ subtree to recurse into (one, not both — that's the speedup over an unordered tree's O(n) search).

**Delete is the one tricky operation.** Removing a node with two children would orphan a subtree, so you replace the node with its **in-order successor** (the smallest key in its right subtree — the leftmost node there), which preserves the invariant, then delete that successor (which has at most one child). Leaf and one-child deletes are trivial splices.

## Operations

| Operation                   | Time (balanced) | Time (skewed) | Space |
| --------------------------- | --------------- | ------------- | ----- |
| Search                      | O(log n)        | O(n)          | O(h)  |
| Insert                      | O(log n)        | O(n)          | O(h)  |
| Delete                      | O(log n)        | O(n)          | O(h)  |
| Min / Max                   | O(log n)        | O(n)          | O(1)  |
| Predecessor / successor     | O(log n)        | O(n)          | O(1)  |
| In-order traversal (sorted) | O(n)            | O(n)          | O(h)  |
| Range query `[lo, hi]`      | O(log n + k)    | O(n)          | O(h)  |

Every operation is **O(height)**, which is the whole story: O(log n) if balanced, O(n) if skewed. `k` = number of results in a range query. Min/max are just "walk all the way left / all the way right".

## Complexity summary

| Operation | Best        | Average  | Worst (skewed) |
| --------- | ----------- | -------- | -------------- |
| Search    | O(1) (root) | O(log n) | O(n)           |
| Insert    | O(log n)    | O(log n) | O(n)           |
| Delete    | O(log n)    | O(log n) | O(n)           |

**Space:** O(n) for nodes (two child pointers each), plus O(height) recursion stack. The defining caveat: **a plain BST does not guarantee balance.** Insert already-sorted data and it builds a right-leaning chain — height n, every operation O(n), a [linked list](./linked-list.md) wearing a tree costume. The fix is a [self-balancing BST](./balanced-bst.md) (AVL / red-black), which keeps height O(log n) via rotations. Average-case O(log n) assumes random insertion order; never assume it for adversarial input.

## When to use / when not

**Reach for a BST when:**

- You need **both fast lookup AND sorted order** — a [hash table](./hash-table.md) gives O(1) lookup but no order; a sorted [array](./array.md) gives order but O(n) insert. The BST is the structure that does both at O(log n).
- You need **range queries, k-th smallest, predecessor/successor, or ordered iteration** — all natural O(log n)/O(log n + k) on a BST, all awkward or O(n) on a hash table.
- The data **changes** (frequent insert/delete) and must stay ordered — a sorted array would pay O(n) per insert to keep order.

**Reach for something else when:**

- **You only need unordered key→value lookup** → a [hash table](./hash-table.md) is O(1) average, beating the BST's O(log n). Order is the only reason to pay the log.
- **The data is static** (build once, query many) → sort into an [array](./array.md) and [binary search](../algorithms/binary-search.md) it: same O(log n) lookup, better cache locality, no per-node pointers.
- **You need only the min or max repeatedly** → a [heap](./heap.md) gives O(1) peek and O(log n) pop, simpler than a full BST.
- **You can't guarantee balance** → use a [balanced BST](./balanced-bst.md) (or `sortedcontainers` in Python), not a hand-rolled plain BST that an adversary can skew to O(n).

Rule of thumb: **BST = "I need a hash table, but ordered."** If you ever say "and also give me them in sorted order / the next-bigger one / everything in a range", that's the BST (balanced) over the hash table.

Real-world: database and filesystem indexes use the BST's disk-friendly generalization, the **B-tree / B+-tree**; language ordered-map types (`std::map`, Java `TreeMap`) are red-black BSTs; and any "leaderboard with rank queries" or "interval scheduling with nearest-neighbor" leans on a balanced BST.

## Comparison

How a BST relates to the structures you'd weigh against it:

| Structure          | Search       | Insert       | Min/Max  | Range / k-th / successor | Ordered iter | Pick it when…                          |
| ------------------ | ------------ | ------------ | -------- | ------------------------ | ------------ | -------------------------------------- |
| **BST (balanced)** | **O(log n)** | **O(log n)** | O(log n) | **O(log n)**             | **yes**      | ordered keys + fast insert + range     |
| BST (plain/skewed) | O(n)         | O(n)         | O(n)     | O(n)                     | yes          | (avoid — use balanced)                 |
| Hash table         | **O(1)** avg | **O(1)** avg | O(n)     | O(n)                     | no           | unordered lookup, no order needed      |
| Sorted array       | O(log n)     | O(n)         | O(1)     | O(log n + k)             | yes          | static data, lookup-heavy, cache-tight |
| Heap               | O(n)         | O(log n)     | **O(1)** | min/max only             | no           | repeated min/max only                  |

The BST's column is the only one with **O(log n) on every ordered operation at once** — search, insert, range, successor, sorted iteration. The hash table beats it on raw lookup but offers no order; the sorted array matches its order but pays O(n) per insert.

## Variants

- **[Balanced BST (AVL / Red-Black)](./balanced-bst.md)** — self-balances via rotations to guarantee O(log n) height. The version you actually use in production; a plain BST is the teaching baseline.
- **Plain BST** — no balancing; O(log n) average but O(n) worst on sorted/adversarial input. The subject of this page (the invariant and operations), with balancing deferred to its own page.
- **Treap / randomized BST** — assigns each node a random priority and keeps a heap order on priorities, making the expected height O(log n) without explicit balancing logic. A simpler-to-implement alternative to AVL/red-black.
- **B-tree / B+-tree** — a BST generalized to many keys per node, minimizing disk seeks; the structure behind database and filesystem indexes. The BST idea scaled to block storage.
- **Order-statistic tree** — a balanced BST augmented with subtree sizes, giving O(log n) "k-th smallest" and "rank of x". The augmentation lives in [CP-primitives](#predecessor--successor--range-queries).
- **Self-balancing ordered map/set** — the library form: `std::map`/`std::set` (red-black), Java `TreeMap`, Python `sortedcontainers.SortedList`. What you reach for instead of hand-rolling.

## Traversal & invariant

The BST adds exactly one thing to the [binary tree](./binary-tree.md): an **ordering invariant**. Everything that makes a BST useful flows from it.

### The BST ordering invariant

For every node: **all keys in the left subtree < node.key < all keys in the right subtree.** Crucially, this is a constraint on the _whole subtree_, not just the immediate children — a common bug is checking only `left.key < node < right.key` (see [Gotchas](#gotchas--edge-cases)).

```
valid BST:              INVALID (looks local-OK, breaks globally):
       (8)                       (8)
      /   \                     /   \
   (3)     (10)             (3)     (10)
   /  \                     /  \
 (1)  (6)               (1)  (9)  ← 9 > 8 but sits in 8's LEFT subtree → invalid
```

The invariant is what lets search ignore an entire subtree at each step: if your target is less than the node, it _cannot_ be on the right, so you discard the right subtree wholesale — the halving that buys O(log n).

### In-order traversal = sorted

Because left < node < right everywhere, an **in-order traversal** (left, node, right) visits keys in **ascending sorted order**. This is the BST's signature property and the source of half its problems.

```
in-order of the valid tree above:  1 3 6 8 10   ← sorted, for free, in O(n)
```

Consequences you exploit constantly: the **k-th smallest** is the k-th node of an in-order walk (stop early); **validating** a BST is checking the in-order sequence is strictly increasing; **two-sum / closest** problems on a BST use the sorted walk directly.

### Why balance is everything

A BST's operations are O(height), and height depends entirely on insertion order:

```
insert 1,2,3,4,5 in order → fully skewed:        insert 3,1,5,2,4 → balanced:
   (1)                                                   (3)
      \                                                 /   \
       (2)         height = n − 1                    (1)     (5)
          \        every op O(n)                        \    /
           (3)     (a linked list!)                     (2)(4)   height = log n, ops O(log n)
              \
               (4)
                  \
                   (5)
```

This is **the** BST gotcha: sorted input produces the worst tree. A plain BST has no defense; a [balanced BST](./balanced-bst.md) detects the imbalance and **rotates** to restore O(log n) height. Never deploy a hand-rolled plain BST where input order is uncontrolled — reach for the balanced variant or a library ordered-set.

## Implementation

A plain BST with search, insert, and the tricky delete. Pseudocode states the recursive contract; Python gives the idiomatic version. (Balancing is deferred to [Balanced BST](./balanced-bst.md).)

**Pseudocode (CLRS-style contract):**

```
BST-SEARCH(node, k)
1   while node ≠ NIL and k ≠ node.key
2       if k < node.key
3           node = node.left          ▷ discard the right subtree
4       else
5           node = node.right         ▷ discard the left subtree
6   return node                       ▷ NIL if not found

BST-INSERT(node, k)
1   if node == NIL
2       return new NODE(k)            ▷ empty spot → place here
3   if k < node.key
4       node.left  = BST-INSERT(node.left, k)
5   elif k > node.key
6       node.right = BST-INSERT(node.right, k)
7   return node                       ▷ duplicates ignored (policy choice)

BST-DELETE(node, k)                   ▷ two-child case: replace with in-order successor
1   ... find node; leaf → remove; one child → splice;
2   two children → copy successor's key into node, then delete successor from right subtree
```

**Python (reference — idiomatic):**

```python
from __future__ import annotations
from dataclasses import dataclass
from typing import Optional


@dataclass
class Node:
    key: int
    left: Optional["Node"] = None
    right: Optional["Node"] = None


def search(root: Optional[Node], k: int) -> Optional[Node]:
    while root and root.key != k:
        root = root.left if k < root.key else root.right   # halve each step
    return root


def insert(root: Optional[Node], k: int) -> Node:
    if root is None:
        return Node(k)
    if k < root.key:
        root.left = insert(root.left, k)
    elif k > root.key:
        root.right = insert(root.right, k)
    # k == root.key → duplicate; ignore (or store a count)
    return root


def delete(root: Optional[Node], k: int) -> Optional[Node]:
    if root is None:
        return None
    if k < root.key:
        root.left = delete(root.left, k)
    elif k > root.key:
        root.right = delete(root.right, k)
    else:                                    # found it
        if root.left is None:
            return root.right                # 0 or 1 child → splice
        if root.right is None:
            return root.left
        succ = root.right                    # in-order successor = leftmost of right subtree
        while succ.left:
            succ = succ.left
        root.key = succ.key                  # copy successor up
        root.right = delete(root.right, succ.key)  # delete the successor
    return root
```

**Contest velocity — don't hand-roll a balanced BST under time pressure.** Python has no built-in balanced tree, but `sortedcontainers.SortedList` gives O(log n) add/remove and O(log n) index/bisect — the practical stand-in (see [CP-primitives](#balanced-bst-via-the-standard-library)). For static data, just `sorted()` + `bisect`.

## CP-primitives

The BST's contest value is its **ordered operations** — the things a hash table can't do.

### Predecessor / successor & range queries

The ordering invariant makes "the next-smaller / next-larger key" and "everything in `[lo, hi]`" O(log n) navigations. **Successor** of a node: if it has a right child, the leftmost node of that subtree; otherwise the lowest ancestor whose left subtree contains the node. Augmenting nodes with **subtree sizes** turns "k-th smallest" and "rank of x" into O(log n) too (an order-statistic tree).

```
successor of 8 in   (8)          → right subtree's leftmost = 10's leftmost = 10
                   /   \
                (3)    (10)       predecessor of 8 → left subtree's rightmost = 3's rightmost = 6
```

**Why for CP:** nearest-smaller/larger key, rank/select, and range-count queries all become O(log n) on a balanced BST — problems a hash map forces into O(n). The augment-with-sizes trick is the standard "k-th element with updates" answer.

### Balanced BST via the standard library

Most BST contest problems are really "I need an ordered multiset with O(log n) insert/delete/rank". In Python that's `sortedcontainers.SortedList`; in C++ `std::set`/`std::multiset`; in Java `TreeMap`/`TreeSet`.

```python
from sortedcontainers import SortedList

sl = SortedList()
sl.add(5); sl.add(1); sl.add(3)   # O(log n) insert, stays sorted
sl.bisect_left(3)                  # rank / how many < 3  → O(log n)
sl[0]                              # min; sl[-1] → max     → O(1)
sl.remove(3)                       # O(log n) delete
```

**Why for CP:** gives you the balanced-BST interface (ordered insert/delete + rank/select) without implementing rotations — the difference between solving the problem and burning 40 minutes debugging AVL. Reach for it whenever you need a "sorted set that changes".

## Gotchas / edge cases

- **Validating with only local checks.** The #1 BST bug: checking `node.left.key < node.key < node.right.key` per node passes invalid trees (a deep-left descendant can exceed an ancestor). Validate by passing **down a (low, high) range** that each subtree must fit, or by checking the in-order traversal is strictly increasing.
- **Skew on sorted input.** Inserting already-sorted (or reverse-sorted) keys into a plain BST builds a height-n chain — every operation O(n). This is the BST's defining failure; use a [balanced BST](./balanced-bst.md) when input order is uncontrolled.
- **Delete with two children.** The hard case: you must replace the node with its in-order **successor** (or predecessor) to preserve the invariant, then delete that successor. Forgetting this — or splicing wrongly — corrupts the ordering. It's the most-tested BST coding detail.
- **Duplicate keys policy.** Decide up front: reject duplicates, store a per-node count, or always send equals to one side (consistently!). Inconsistent handling breaks search and in-order order. State your choice.
- **Recursion depth on a tall tree.** Recursive search/insert/delete is O(height) stack frames — fine balanced, but a skewed tree overflows Python's ~1000-frame limit. Iterative search (shown above) avoids it; recursive insert/delete on adversarial input does not.
- **In-order-sorted only holds for a _valid_ BST.** "Just do an in-order traversal to sort" assumes the tree already satisfies the invariant. If you're not certain it's a valid BST, in-order gives garbage order — validate first.

## Practice problems

Five staples, each a **distinct** BST technique — no two solved the same way.

### 1. Validate Binary Search Tree — _bounded recursion_

**Problem.** Determine if a binary tree is a valid BST: every node's left subtree is strictly less and right subtree strictly greater, _globally_. E.g. `[5,1,4,null,null,3,6]` → false (4's subtree has 3 < 5).

**Approach.** Recurse carrying a valid **(low, high) open interval** each node must lie in. Going left tightens the upper bound to the node's key; going right tightens the lower bound. A null subtree is valid; any key outside its bound fails. This enforces the _global_ invariant that naive child-only checks miss.

```python
def is_valid_bst(root, low=float("-inf"), high=float("inf")) -> bool:
    if root is None:
        return True
    if not (low < root.val < high):
        return False
    return (is_valid_bst(root.left, low, root.val) and
            is_valid_bst(root.right, root.val, high))
```

**Complexity.** O(n) time, O(h) space.

### 2. Kth Smallest Element in a BST — _in-order counting_

**Problem.** Return the k-th smallest key (1-indexed) in a BST. E.g. tree with keys `1,2,3,4` and `k=1` → `1`.

**Approach.** In-order traversal visits keys in sorted order, so the k-th visited node is the answer. Use an **iterative in-order with an explicit stack** and stop as soon as you've popped k nodes — no need to walk the whole tree. The sorted-walk property turned into early-exit counting.

```python
def kth_smallest(root, k: int) -> int:
    stack, cur = [], root
    while cur or stack:
        while cur:                        # dive left
            stack.append(cur)
            cur = cur.left
        cur = stack.pop()
        k -= 1
        if k == 0:                        # k-th node in sorted order
            return cur.val
        cur = cur.right
    return -1
```

**Complexity.** O(h + k) time, O(h) space.

### 3. Lowest Common Ancestor of a BST — _ordering shortcut_

**Problem.** Find the LCA of two nodes `p` and `q` in a BST. E.g. in a BST rooted at 6, LCA of 2 and 8 is 6; LCA of 2 and 4 is 2.

**Approach.** Unlike a [general binary tree](./binary-tree.md#5-lowest-common-ancestor--recursive-search), a BST lets you use the ordering: if both keys are smaller than the current node, the LCA is in the left subtree; if both larger, the right; the moment they **split** (one each side, or one equals the node), the current node is the LCA. O(h), no full search.

```python
def lca_bst(root, p, q):
    while root:
        if p.val < root.val and q.val < root.val:
            root = root.left              # both smaller → go left
        elif p.val > root.val and q.val > root.val:
            root = root.right             # both larger → go right
        else:
            return root                   # split point → LCA
    return None
```

**Complexity.** O(h) time, O(1) space.

### 4. Insert into a BST — _recursive descent_

**Problem.** Insert a value into a BST and return the (possibly new) root, keeping it a valid BST. The value is guaranteed not already present.

**Approach.** Descend by comparison — go left if smaller, right if larger — until you hit a null child, and place the new node there. The new node is always inserted as a **leaf**, so no restructuring is needed (in a plain BST). Pure invariant-guided recursion; the base case creates the node.

```python
def insert_into_bst(root, val: int):
    if root is None:
        return Node(val)                  # found the empty slot
    if val < root.val:
        root.left = insert_into_bst(root.left, val)
    else:
        root.right = insert_into_bst(root.right, val)
    return root
```

**Complexity.** O(h) time, O(h) space.

### 5. Convert Sorted Array to BST — _balanced build_

**Problem.** Given a sorted array, build a **height-balanced** BST from it. E.g. `[-10,-3,0,5,9]` → a balanced tree rooted at `0`.

**Approach.** Pick the **middle** element as the root (so left and right halves are equal size), then recursively build the left subtree from the left half and the right from the right half. Choosing the midpoint each time guarantees height O(log n) — the inverse of the skew problem: balanced input order by construction. Divide-and-conquer on the array.

```python
def sorted_array_to_bst(nums: list[int]):
    def build(lo: int, hi: int):
        if lo > hi:
            return None
        mid = (lo + hi) // 2              # middle → balanced root
        node = Node(nums[mid])
        node.left = build(lo, mid - 1)
        node.right = build(mid + 1, hi)
        return node
    return build(0, len(nums) - 1)
```

**Complexity.** O(n) time, O(log n) space (balanced recursion).
