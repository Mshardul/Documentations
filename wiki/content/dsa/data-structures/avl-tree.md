# AVL Tree

## Prerequisites

- [Balanced BST](./balanced-bst.md) [Must read] - the hub: why balancing exists and how AVL sits against red-black and B-trees. Read it first for context.
- [Binary Search Tree](./binary-search-tree.md) [Must read] - an AVL tree is a BST plus a height-balance rule; you need the BST invariant, search, and the skew failure first.
- [Binary Tree](./binary-tree.md) [Should read] - rotations are local pointer-rewires; height/recursion mechanics transfer directly.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Table of Contents](#table-of-contents)
- [What it is](#what-it-is)
- [Intuition](#intuition)
- [How it works](#how-it-works)
  - [Insert: the four rotation cases](#insert-the-four-rotation-cases)
  - [Delete](#delete)
- [Correctness / invariant](#correctness--invariant)
- [Complexity derivation](#complexity-derivation)
- [When to use / when not](#when-to-use--when-not)
- [Comparison](#comparison)
- [Traversal & invariant](#traversal--invariant)
- [Edge cases](#edge-cases)
- [Implementation](#implementation)
- [What the interviewer probes for](#what-the-interviewer-probes-for)
- [Practice problems](#practice-problems)
  - [Insert into an AVL tree](#1-insert-into-an-avl-tree--rebalance-on-the-way-up)
  - [Validate height-balanced](#2-validate-height-balanced--bottom-up-heights)
  - [Build a balanced BST from sorted data](#3-build-a-balanced-bst-from-sorted-data--vs-avl)
  - [Count rotations on a sequence](#4-count-rotations-on-a-sequence--tracing-the-fixups)

## What it is

An **AVL tree** is a [binary search tree](./binary-search-tree.md) that keeps itself strictly height-balanced: for **every** node, the heights of its two subtrees differ by at most 1. After each insert or delete it restores this rule with rotations, guaranteeing height ≤ 1.44 log₂ n and so O(log n) on every operation.

Mental model: **the strictest building inspector among the [balanced BSTs](./balanced-bst.md).** It tolerates almost no lean — the moment any node's two sides differ in height by 2, it rotates immediately. That strictness is its identity: the tightest height of any common balanced tree, bought with more rotations on writes.

> **Takeaway (say this out loud):** "An AVL tree is a BST where every node's subtree heights differ by at most 1, enforced by rotations — strictest balance, so the fastest lookups, at the cost of more rotations per write."

## Intuition

The named inventors (Adelson-Velsky and Landis) added one number to each BST node: a **balance factor** = `height(left) − height(right)`. The invariant is simply "every balance factor is −1, 0, or +1." When an insert or delete pushes some node to ±2, the tree has leaned too far there, and a rotation pulls the tall side up to flatten it.

Why does fixing it _locally_ work globally? An insert changes heights only along the **single path** from the new leaf up to the root. So only nodes on that path can become unbalanced, and rebalancing the **lowest** unbalanced node restores the whole tree's height to what it was before the insert — which is why an AVL insert needs at most **one** rotation (single or double). That "one path, one fix" property is the whole elegance.

## How it works

Each node stores its **height** (or balance factor). Insert/delete proceeds as a normal [BST](./binary-search-tree.md) operation, then you **retrace the path to the root**, updating heights and rotating wherever a node's balance factor reaches ±2.

A node becomes unbalanced in one of **four shapes**, named by the direction of the two steps from the unbalanced node down into the heavy subtree:

### Insert: the four rotation cases

```
LL (left-left, heavy on left's left)      →  single RIGHT rotation
RR (right-right, heavy on right's right)   →  single LEFT rotation
LR (left-right, heavy on left's right)     →  LEFT child, then RIGHT  (double)
RL (right-left, heavy on right's left)     →  RIGHT child, then LEFT  (double)
```

**LL — single right rotation** (the new node went into the left child's left subtree):

```
        (z) bf=+2                 (y)
       /    \                    /   \
     (y)     T4    ─────▶     (x)    (z)
    /   \                    / \     / \
  (x)    T3                T1 T2   T3  T4
  / \
T1  T2
```

**LR — double rotation** (new node in the left child's _right_ subtree): first left-rotate `y`, turning it into the LL shape, then right-rotate `z`:

```
      (z) bf=+2            (z)                  (x)
     /    \               /   \                /   \
   (y)     T4   left(y) (x)    T4   right(z) (y)    (z)
   / \      ───────▶    / \      ───────▶    / \    / \
  T1  (x)             (y)  T3              T1 T2   T3 T4
      / \             / \
    T2  T3          T1  T2
```

RR and RL are the mirror images (single left, and double right-then-left). The double cases exist because a single rotation on a "zig-zag" shape just moves the imbalance to the other side — you must straighten the zig-zag into a zig-zig first.

### Delete

Delete as a normal BST (leaf → remove; one child → splice; two children → replace with in-order successor, then delete it). Then retrace to the root, rebalancing. **The key difference from insert:** a delete can require rebalancing at **multiple** nodes along the path — fixing one can shorten its subtree and unbalance an ancestor — so you don't stop after the first rotation; you continue to the root. (Insert needs at most one rotation; delete can need O(log n).)

## Correctness / invariant

**Invariant:** for every node `v`, `|height(v.left) − height(v.right)| ≤ 1`.

**Why rotations preserve BST order:** a rotation only re-parents nodes; the in-order sequence is identical before and after (see [Balanced BST › Rotations](./balanced-bst.md#rotations-the-shared-mechanic)). So the BST ordering invariant is never violated — rotations are "order-safe height surgery."

**Why one rotation suffices on insert:** before the insert, every node was balanced. The insert lengthened exactly one root-to-leaf path by 1, so the only nodes that can violate the invariant lie on that path, and the **lowest** such node `z` has balance factor ±2 with the opposite subtree unchanged. Rotating at `z` reduces its subtree height back to the pre-insert value, which propagates "no change" up the rest of the path — so no ancestor is affected. One rotation, done.

## Complexity derivation

**Height bound — why ≤ 1.44 log₂ n.** Let `N(h)` be the _minimum_ number of nodes in an AVL tree of height `h`. The most-unbalanced legal AVL tree has, at the root, one subtree of height `h−1` and the other of height `h−2` (differing by exactly 1). So:

```
N(h) = 1 + N(h−1) + N(h−2),   N(0) = 1, N(1) = 2
```

This is the **Fibonacci recurrence** (shifted): `N(h) ≈ φ^h` where `φ = (1+√5)/2 ≈ 1.618`. Inverting, `h ≈ log_φ(n) = log₂(n) / log₂(φ) ≈ 1.44 log₂ n`. So the height is at most ~1.44× the perfect-tree height — tightly bounded, hence **O(log n)**.

| Operation | Time     | Space (recursion) |
| --------- | -------- | ----------------- |
| Search    | O(log n) | O(log n)          |
| Insert    | O(log n) | O(log n)          |
| Delete    | O(log n) | O(log n)          |

All bounds are **worst-case**, not just average — that's the guarantee a plain [BST](./binary-search-tree.md) can't make. Insert does ≤ 1 rotation; delete does O(log n) in the worst case; both are O(log n) overall (the retrace dominates).

## When to use / when not

**Reach for an AVL tree when:**

- Lookups dominate writes and you want the **tightest height** → AVL's strict balance shaves comparisons off every search; the extra write rotations rarely matter if writes are infrequent.
- You need a **hard worst-case O(log n)** guarantee (not amortized, not average) on ordered operations — real-time-ish systems, or data structures where a single slow op is unacceptable.

**Reach for something else when:**

- **Writes are frequent / mixed read-write** → a [red-black tree](./red-black-tree.md) does fewer rotations per write (recolor-first), which is why standard libraries pick it over AVL. The slightly taller tree costs little on lookups.
- **Data is on disk** → a [B-tree](./b-tree.md); AVL's binary fan-out means too many levels and too many disk seeks.
- **You don't need order** → a [hash table](./hash-table.md) is O(1) average; the log is only worth paying for ordered operations.
- **The data is static** → sort an [array](./array.md) and [binary search](../algorithms/binary-search.md) it; no need to maintain a tree.

Real-world: AVL trees show up in read-heavy in-memory indexes and some database engines (early MySQL `MEMORY`/`HEAP` indexes, some in-memory stores) where lookup latency is the priority; red-black is the more common general default.

## Comparison

| Tree                                 | Balance rule                 | Height       | Lookup      | Rotations/write             | Pick it when…                       |
| ------------------------------------ | ---------------------------- | ------------ | ----------- | --------------------------- | ----------------------------------- |
| **AVL**                              | subtree heights differ ≤ 1   | ≤ 1.44 log n | **fastest** | more (≤1 ins, O(log n) del) | read-heavy, tightest height         |
| [Red-Black](./red-black-tree.md)     | color rules (≈ black-height) | ≤ 2 log n    | fast        | **fewer**                   | general / write-heavy (lib default) |
| [Plain BST](./binary-search-tree.md) | none                         | up to n      | O(n) worst  | none                        | (avoid)                             |
| [B-Tree](./b-tree.md)                | wide nodes, equal leaf depth | log_m n      | few seeks   | split/merge                 | on-disk indexes                     |

AVL and red-black are the same asymptotics; AVL trades more write-work for a shorter tree (faster reads). Pick on your read/write ratio.

## Traversal & invariant

The traversals are the [binary tree](./binary-tree.md)'s — and because an AVL is a valid [BST](./binary-search-tree.md), **in-order traversal yields sorted keys**. The AVL-specific invariant is the **height-balance** condition, maintained by tracking a height (or balance factor) per node and rotating on violation.

```
balance factor bf(v) = height(v.left) − height(v.right)

bf ∈ {−1, 0, +1}  → balanced (OK)
bf = +2           → left-heavy  → LL or LR rotation
bf = −2           → right-heavy → RR or RL rotation
```

The discipline: every structural change retraces the path to the root, recomputes heights bottom-up, and rotates the first node it finds at ±2. The **balanced** shape invariant from the [binary tree](./binary-tree.md#the-shape-invariants-full-complete-balanced) page is exactly AVL's enforced rule — AVL is the structure that _guarantees_ it.

## Edge cases

- **Empty tree / single node.** Insert into empty creates the root (height 0/1 per convention); no rotation possible with < 3 nodes. Handle `root is None` as the base case in every recursive op.
- **Rotation choosing the wrong case (LL vs LR).** The classic AVL bug: deciding single vs double rotation from the _grandparent's_ balance factor alone. You must inspect the **child's** balance factor too — `bf(z)=+2` is LL if `bf(z.left) ≥ 0`, but LR if `bf(z.left) < 0`. Getting this wrong leaves the tree unbalanced or unsorted.
- **Forgetting to update heights after a rotation.** Rotations change the heights of the two rotated nodes; if you don't recompute them (in the right order — children before parents) the balance factors go stale and later rebalancing misfires.
- **Delete stopping after one rotation.** Unlike insert, a delete may unbalance multiple ancestors — you must continue rebalancing all the way to the root, not return early. A frequent correctness bug.
- **Recursion depth.** Height is O(log n), so the recursion stack is safe even for large n — one of AVL's quiet advantages over a plain BST (which can recurse O(n) deep and overflow).
- **Duplicate keys.** Decide a policy (reject, or store a count per node); inserting duplicates as real nodes complicates the balance bookkeeping and the in-order order.

## Implementation

Insert with height tracking and the four rotation cases. Pseudocode states the rebalance contract; Python is the idiomatic reference.

**Pseudocode (CLRS-style contract):**

```
AVL-INSERT(node, k)
1   node = BST-INSERT(node, k)                  ▷ ordinary BST insert
2   UPDATE-HEIGHT(node)                          ▷ 1 + max(child heights)
3   bf = BALANCE-FACTOR(node)                    ▷ h(left) − h(right)
4   if bf > 1 and k < node.left.key              ▷ LL
5       return ROTATE-RIGHT(node)
6   if bf < −1 and k > node.right.key            ▷ RR
7       return ROTATE-LEFT(node)
8   if bf > 1 and k > node.left.key              ▷ LR
9       node.left = ROTATE-LEFT(node.left)
10      return ROTATE-RIGHT(node)
11  if bf < −1 and k < node.right.key            ▷ RL
12      node.right = ROTATE-RIGHT(node.right)
13      return ROTATE-LEFT(node)
14  return node                                  ▷ already balanced
```

**Python (reference — idiomatic):**

```python
from __future__ import annotations
from dataclasses import dataclass
from typing import Optional


@dataclass
class Node:
    key: int
    height: int = 1
    left: Optional["Node"] = None
    right: Optional["Node"] = None


def _h(n: Optional[Node]) -> int:
    return n.height if n else 0


def _bf(n: Node) -> int:
    return _h(n.left) - _h(n.right)


def _update(n: Node) -> None:
    n.height = 1 + max(_h(n.left), _h(n.right))


def _rotate_right(z: Node) -> Node:
    y = z.left                       # y becomes the new root of this subtree
    z.left, y.right = y.right, z     # rewire; in-order order preserved
    _update(z); _update(y)           # heights: children before parent
    return y


def _rotate_left(z: Node) -> Node:
    y = z.right
    z.right, y.left = y.left, z
    _update(z); _update(y)
    return y


def insert(node: Optional[Node], key: int) -> Node:
    if node is None:
        return Node(key)
    if key < node.key:
        node.left = insert(node.left, key)
    elif key > node.key:
        node.right = insert(node.right, key)
    else:
        return node                  # duplicate: ignore
    _update(node)
    bf = _bf(node)
    if bf > 1 and key < node.left.key:               # LL
        return _rotate_right(node)
    if bf < -1 and key > node.right.key:             # RR
        return _rotate_left(node)
    if bf > 1 and key > node.left.key:               # LR
        node.left = _rotate_left(node.left)
        return _rotate_right(node)
    if bf < -1 and key < node.right.key:             # RL
        node.right = _rotate_right(node.right)
        return _rotate_left(node)
    return node
```

**Contest velocity.** You almost never hand-roll AVL in a contest — reach for the language's balanced structure ([Red-Black-backed](./red-black-tree.md) `std::map`/`TreeMap`, or Python `sortedcontainers.SortedList`). Code AVL only when an interviewer explicitly asks for the rotation logic.

## What the interviewer probes for

- **"Why at most one rotation on insert but possibly many on delete?"** — Insert lengthens one path; rebalancing the lowest violator restores the pre-insert height, so no ancestor changes. Delete _shortens_ a subtree, which can unbalance an ancestor after you fix a node — so you must rebalance up to the root.
- **"AVL vs red-black — which and why?"** — AVL is stricter (height ≤ 1.44 log n) → faster lookups but more write rotations; red-black is looser (≤ 2 log n) → fewer write rotations, so libraries default to it for mixed workloads. Pick on read/write ratio.
- **"Where does the 1.44 come from?"** — The minimum-nodes recurrence `N(h)=1+N(h−1)+N(h−2)` is Fibonacci, so n grows like φ^h, giving h ≈ 1.44 log₂ n.
- **"How do you detect which rotation case?"** — From the unbalanced node's balance factor _and_ its heavy child's balance factor: matching signs → single rotation; opposite signs → double (zig-zag must be straightened first).

## Practice problems

Four problems, each a **distinct** facet of AVL — no two the same.

### 1. Insert into an AVL tree — _rebalance on the way up_

**Problem.** Implement AVL insert: insert a key as in a BST, then restore the height-balance invariant with rotations, returning the new subtree root.

**Approach.** Recurse down to insert (BST rule), then on the way back up: update height, compute balance factor, and apply the matching one of the four rotation cases (LL/RR/LR/RL). The case is chosen by the node's bf and its heavy child's bf. Only the lowest unbalanced node needs fixing, so insert does ≤ 1 (single or double) rotation.

```python
# (uses the helpers and insert() from Implementation above)
root = None
for k in [10, 20, 30, 40, 50, 25]:
    root = insert(root, k)
# tree stays height-balanced after every insert; height ~ log n
```

**Complexity.** O(log n) time, O(log n) space (recursion).

### 2. Validate height-balanced — _bottom-up heights_

**Problem.** Given a binary tree, decide whether it satisfies the AVL invariant: every node's subtree heights differ by ≤ 1. E.g. a skewed chain → false; a perfect tree → true.

**Approach.** Compute heights **bottom-up**, returning a sentinel (−1) the moment any subtree is unbalanced, so you abort early instead of recomputing heights repeatedly (the naive O(n²) version recomputes height at every node). One post-order pass — the tree-DP shape.

```python
def is_balanced(root) -> bool:
    def check(node) -> int:           # returns height, or -1 if unbalanced
        if node is None:
            return 0
        lh = check(node.left)
        if lh == -1: return -1
        rh = check(node.right)
        if rh == -1: return -1
        if abs(lh - rh) > 1: return -1
        return 1 + max(lh, rh)
    return check(root) != -1
```

**Complexity.** O(n) time, O(h) space.

### 3. Build a balanced BST from sorted data — _vs AVL_

**Problem.** Given a sorted array, build a height-balanced BST. Contrast with inserting the same keys one-by-one into an AVL.

**Approach.** Pick the middle element as the root and recurse on each half — balance _by construction_, no rotations, O(n). This is what you'd do for **static** data; AVL is for when keys arrive over time and must stay balanced through inserts/deletes. The contrast is the lesson: build-balanced (cheap, static) vs maintain-balanced (AVL, dynamic).

```python
def sorted_to_balanced(nums: list[int]):
    def build(lo, hi):
        if lo > hi:
            return None
        mid = (lo + hi) // 2
        return Node(nums[mid], left=build(lo, mid - 1), right=build(mid + 1, hi))
    return build(0, len(nums) - 1)
```

**Complexity.** O(n) time, O(log n) space.

### 4. Count rotations on a sequence — _tracing the fixups_

**Problem.** Insert a given sequence of keys into an AVL tree and count how many rotations occur. E.g. inserting `1,2,3` triggers one rotation (RR at the root after inserting 3).

**Approach.** Instrument the insert: increment a counter inside each rotation helper. The exercise builds intuition for _when_ AVL pays its write cost — sorted input triggers a rotation roughly every other insert, which is exactly the work that keeps the height logarithmic. Compare the count to red-black on the same sequence to see why libraries prefer fewer rotations.

```python
rotations = 0
def _rotate_right_counting(z):
    global rotations
    rotations += 1
    return _rotate_right(z)          # wrap the real rotation
# ... swap the helpers, insert the sequence, read `rotations`
```

**Complexity.** O(n log n) to insert n keys; the count is O(n) in the worst case (a rotation can happen on most inserts).
