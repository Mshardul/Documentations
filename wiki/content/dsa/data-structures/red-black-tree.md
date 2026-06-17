# Red-Black Tree

## Prerequisites

- [Balanced BST](./balanced-bst.md) [Must read] - the hub: why balancing exists and how red-black sits against AVL and B-trees. Read it first.
- [Binary Search Tree](./binary-search-tree.md) [Must read] - a red-black tree is a BST plus color rules; you need the BST invariant and the skew failure first.
- [AVL Tree](./avl-tree.md) [Should read] - the strict-balance counterpart; red-black is best understood as "AVL's looser, fewer-rotations sibling".

## Table of Contents

- [Prerequisites](#prerequisites)
- [Table of Contents](#table-of-contents)
- [What it is](#what-it-is)
- [Intuition](#intuition)
- [How it works](#how-it-works)
  - [The five color rules](#the-five-color-rules)
  - [Insert fixup: three cases](#insert-fixup-three-cases)
  - [Delete fixup: the double-black](#delete-fixup-the-double-black)
- [Correctness / invariant](#correctness--invariant)
- [Complexity derivation](#complexity-derivation)
- [When to use / when not](#when-to-use--when-not)
- [Comparison](#comparison)
- [Traversal & invariant](#traversal--invariant)
- [Edge cases](#edge-cases)
- [Implementation](#implementation)
- [What the interviewer probes for](#what-the-interviewer-probes-for)
- [Practice problems](#practice-problems)
  - [Why libraries pick red-black over AVL](#1-why-libraries-pick-red-black-over-avl--reasoning)
  - [Verify red-black properties](#2-verify-red-black-properties--black-height-check)
  - [Red-black insert fixup](#3-red-black-insert-fixup--recolor-then-rotate)
  - [Order-statistics with a red-black tree](#4-order-statistics-with-a-red-black-tree--augmentation)

## What it is

A **red-black tree** is a [binary search tree](./binary-search-tree.md) that stays approximately balanced by coloring each node red or black and enforcing rules that no root-to-leaf path is more than twice as long as any other — guaranteeing height ≤ 2 log₂(n+1) and so O(log n) operations.

Mental model: **the pragmatic [balanced BST](./balanced-bst.md) — looser than [AVL](./avl-tree.md), but cheaper to maintain.** Instead of tracking exact heights, it tracks one bit per node (a color) and fixes violations mostly by **recoloring** (free) and only occasionally by rotating. That "recolor first, rotate rarely" discipline makes writes cheaper than AVL, which is exactly why it's the **default** in standard libraries.

> **Takeaway (say this out loud):** "A red-black tree balances loosely with color rules — recolor first, rotate rarely — so writes are cheaper than AVL. It's what `std::map`, `TreeMap`, and the Linux kernel all use."

## Intuition

The deep idea: a red-black tree is **a B-tree (specifically a 2-3-4 tree) encoded as a binary tree**. A black node and its red children together represent one fat B-tree node holding 2–4 keys. The color rules are just the binary-tree shadow of "all B-tree leaves are at the same depth" — which is why every root-to-null path has the same number of black nodes (the **black-height**).

Why "≤ 2× the shortest path"? Red nodes can't have red children (no two reds in a row), and every path has equal black-height, so the longest possible path alternates red-black-red-black… (at most 2× the all-black shortest path). That bound is looser than AVL's 1.44× — the tree can be taller — but the looser rule means a violation is usually fixable by flipping colors, no structural rotation needed. **Fewer rotations is the whole point**, and the slightly taller tree barely costs lookups.

## How it works

Each node carries a **color** (red/black). The leaves are conceptually black "nil" sentinels. Insert/delete proceed as a normal [BST](./binary-search-tree.md), then a **fixup** restores the color rules using recoloring and rotations.

### The five color rules

```
1. Every node is RED or BLACK.
2. The ROOT is black.
3. Every leaf (nil sentinel) is black.
4. A RED node has only BLACK children   (no two reds in a row).
5. Every root-to-leaf path has the SAME number of black nodes (equal black-height).
```

Rules 4 and 5 together force the balance: equal black-height (5) plus no-double-red (4) means the longest path is at most twice the shortest. The colors are bookkeeping; rules 4+5 are the balance guarantee.

### Insert fixup: three cases

A new node is inserted **red** (inserting black would instantly break rule 5). If its parent is black, done — no violation. If the parent is red (violating rule 4), fix up by examining the **uncle** (the parent's sibling). Three cases, applied while walking up:

```
Let z = new red node, p = parent (red), g = grandparent (black), u = uncle.

CASE 1 — uncle is RED:
    recolor p and u → BLACK, g → RED, then recurse upward from g.
    (no rotation — pure recolor; pushes the problem up the tree)

        g(B)              g(R)   ← now treat g as the new z, continue up
       /    \            /    \
     p(R)   u(R)  ──▶  p(B)   u(B)
     /                 /
   z(R)              z(R)

CASE 2 — uncle is BLACK, z is an "inner" grandchild (zig-zag):
    rotate p to turn it into Case 3 (straighten the zig-zag), then fall through.

CASE 3 — uncle is BLACK, z is an "outer" grandchild (zig-zig):
    recolor p → BLACK, g → RED, then rotate g. Done — at most ONE rotation.

        g(B)                       p(B)
       /    \      rotate g       /    \
     p(R)   u(B)   ───────▶    z(R)   g(R)
     /                                   \
   z(R)                                  u(B)
```

The headline: **insert does at most two rotations** (the Case-2 straighten + the Case-3 fix), and often **zero** (Case 1 recolors all the way up). Compare AVL's guaranteed-rotation-on-imbalance — red-black frequently fixes a violation with recoloring alone.

### Delete fixup: the double-black

Delete is the hard part. Remove as in a [BST](./binary-search-tree.md) (two children → swap with in-order successor, then delete it). If the physically removed node was **red**, no rule breaks — done. If it was **black**, removing it drops the black-count on its paths, violating rule 5. The fix introduces a temporary **"double-black"** marker on the replacement and pushes it up, resolving via the **sibling's** color and the sibling's children's colors:

```
The removed-black case resolves through the sibling s of the double-black node x:

D1 — sibling s is RED:           rotate parent, recolor → reduces to a black-sibling case.
D2 — s BLACK, both s's children BLACK:  recolor s → RED, move double-black up to parent, recurse.
D3 — s BLACK, s's near child RED, far child BLACK:  rotate s → reduces to D4.
D4 — s BLACK, s's far child RED:  rotate parent, recolor, far child → BLACK. Done.
```

There are four delete-fixup cases (each with a mirror image), and the double-black can propagate up the tree — but the **total** rotations per delete are still **≤ 3**, all O(log n). Delete is notoriously fiddly; in practice you use the library, but understanding "removed-black breaks black-height, fix via the sibling" is the interview-level insight.

## Correctness / invariant

**Invariant:** the [five color rules](#the-five-color-rules) hold after every operation — in particular **rule 4** (no two consecutive reds) and **rule 5** (equal black-height on all paths). Together they bound the height.

**Why the bound holds:** by rule 5 every path has the same black-height `b`, so the shortest possible path is all-black (length `b`). By rule 4, reds can't be adjacent, so the longest path alternates and has length ≤ `2b`. Hence longest ≤ 2 × shortest → height ≤ 2 log₂(n+1).

**Why fixup terminates:** insert Case 1 moves the violation strictly **up** the tree (toward the root), and the root is always recolored black at the end — so the process climbs at most O(log n) levels. Delete's double-black similarly propagates up and resolves within O(log n). Rotations preserve BST order (in-order sequence unchanged, see [Balanced BST › Rotations](./balanced-bst.md#rotations-the-shared-mechanic)), so ordering is never broken.

## Complexity derivation

**Height ≤ 2 log₂(n+1).** A subtree with black-height `b` contains at least `2^b − 1` internal nodes (proof by induction: each subtree of black-height `b−1` has ≥ `2^(b−1) − 1`, and the node combines two of them). With height `h`, at least half the nodes on any path are black (rule 4), so `b ≥ h/2`. Combining: `n ≥ 2^(h/2) − 1` → `h ≤ 2 log₂(n+1)`. Hence **O(log n)**.

| Operation | Time     | Rotations (worst) | Space    |
| --------- | -------- | ----------------- | -------- |
| Search    | O(log n) | —                 | O(log n) |
| Insert    | O(log n) | **≤ 2**           | O(log n) |
| Delete    | O(log n) | **≤ 3**           | O(log n) |

The bounded rotation count is the practical win: **O(1) rotations per write** (recoloring does the O(log n) work, and recoloring is cheap — no pointer rewiring). [AVL](./avl-tree.md) also does O(1) rotations per insert but more per delete and rebalances more eagerly overall.

## When to use / when not

**Reach for a red-black tree when:**

- You need a **general-purpose ordered map/set** with mixed reads and writes — its fewer-rotations-per-write profile is why it's the **library default** (`std::map`/`std::set`, Java `TreeMap`/`TreeSet`).
- Writes are **frequent** and you want cheap insert/delete while keeping O(log n) ordered operations — recoloring absorbs most rebalancing without structural moves.
- You're storing nodes with **expensive-to-move payloads** — fewer rotations means fewer pointer rewires.

**Reach for something else when:**

- **Lookups vastly dominate writes** → an [AVL tree](./avl-tree.md)'s tighter height gives marginally faster searches.
- **Data is on disk** → a [B-tree](./b-tree.md); red-black's binary fan-out means too many levels and disk seeks.
- **You don't need order** → a [hash table](./hash-table.md), O(1) average.
- **You're in a contest/interview and the language provides it** → just use the library; never hand-roll red-black delete under time pressure.

Real-world: the C++ STL `map`/`set`/`multimap`, Java's `TreeMap`/`TreeSet`, the **Linux kernel's** completely-fair scheduler (CFS uses a red-black tree of runnable tasks keyed by virtual runtime), the kernel's virtual-memory area tracking, and Python's `sortedcontainers` (a different but equivalent ordered structure) — red-black is the most-deployed balanced BST in the world.

## Comparison

| Tree                                 | Balance rule                 | Height       | Lookup      | Rotations/write      | Implementation | Pick it when…                   |
| ------------------------------------ | ---------------------------- | ------------ | ----------- | -------------------- | -------------- | ------------------------------- |
| **Red-Black**                        | color rules (≈ black-height) | ≤ 2 log n    | fast        | **≤ 2/3**            | fiddly delete  | general / write-heavy (default) |
| [AVL](./avl-tree.md)                 | heights differ ≤ 1           | ≤ 1.44 log n | **fastest** | ≤1 ins, O(log n) del | similar        | read-heavy, tightest height     |
| [Plain BST](./binary-search-tree.md) | none                         | up to n      | O(n) worst  | none                 | trivial        | (avoid)                         |
| [B-Tree](./b-tree.md)                | wide nodes, equal leaf depth | log_m n      | few seeks   | split/merge          | moderate       | on-disk indexes                 |

Red-black and AVL are asymptotically identical; red-black trades a slightly taller tree for cheaper writes — the trade that makes it the standard-library choice.

## Traversal & invariant

Traversals are the [binary tree](./binary-tree.md)'s; in-order yields **sorted** keys (it's a valid [BST](./binary-search-tree.md)). The red-black-specific invariant is the **color rules**, whose load-bearing pair is:

```
Rule 4: no RED node has a RED child          → bounds run length
Rule 5: equal black-height on every path     → bounds path-length spread
        ───────────────────────────────────
        ⇒ longest path ≤ 2 × shortest path  ⇒ height O(log n)
```

The **black-height** (count of black nodes on any root-to-leaf path, identical for all paths by rule 5) is the quantity to reason about — it's what insert/delete fixups protect. The balance is "approximate" compared to [AVL](./avl-tree.md)'s exact height-difference rule, but the asymptotic guarantee is the same.

## Edge cases

- **Inserting the root.** The first node, and any node recolored up to the root, must end **black** (rule 2). The standard fix: unconditionally color the root black at the end of every insert fixup.
- **Red parent + red uncle vs red parent + black uncle.** The entire insert fixup hinges on the **uncle's color**: red uncle → recolor and recurse up (Case 1); black uncle → rotate (Cases 2/3). Misreading the uncle is the #1 insert bug.
- **Delete of a black node — the double-black.** Removing a black node breaks black-height; you _must_ run the delete fixup (resolving via the sibling's color and its children's colors). Skipping it silently corrupts rule 5. This is the hardest part to get right.
- **Nil sentinels are black.** Treating null children as black leaves (rule 3) keeps black-height counting consistent; an implementation that special-cases `None` instead of using a shared black sentinel is bug-prone in the fixups.
- **Mirror cases.** Every insert/delete case has a left/right mirror; hand-rolling means writing both. Forgetting a mirror leaves one side unbalanced — a subtle, data-dependent bug.
- **Recursion / loop depth.** Height is O(log n), so fixups climb O(log n) levels — safe from stack overflow, unlike a plain BST.

## Implementation

The full red-black tree is long (especially delete); the **insert + fixup** is the interview-relevant core. Pseudocode states the fixup contract; Python shows insert with the three cases. (Delete fixup is summarized, not fully traced — in practice you use the library.)

**Pseudocode (CLRS-style contract — insert fixup):**

```
RB-INSERT-FIXUP(T, z)                      ▷ z is the newly inserted RED node
1   while z.parent.color == RED            ▷ rule-4 violation exists
2       if z.parent is a left child
3           u = z.parent.parent.right      ▷ uncle
4           if u.color == RED              ▷ CASE 1: recolor, climb
5               z.parent.color = BLACK; u.color = BLACK
6               z.parent.parent.color = RED
7               z = z.parent.parent
8           else
9               if z is a right child      ▷ CASE 2: straighten zig-zag
10                  z = z.parent; LEFT-ROTATE(T, z)
11              z.parent.color = BLACK     ▷ CASE 3: recolor + rotate
12              z.parent.parent.color = RED
13              RIGHT-ROTATE(T, z.parent.parent)
14      else  ▷ mirror of the above (parent is a right child)
15          ... symmetric with left/right swapped ...
16  T.root.color = BLACK                   ▷ rule 2
```

**Python (reference — idiomatic, insert path):**

```python
from __future__ import annotations
from dataclasses import dataclass, field
from typing import Optional

RED, BLACK = 0, 1


@dataclass
class Node:
    key: int
    color: int = RED                       # new nodes start red
    left: Optional["Node"] = None
    right: Optional["Node"] = None
    parent: Optional["Node"] = None


class RedBlackTree:
    def __init__(self) -> None:
        self.nil = Node(key=0, color=BLACK)    # shared black sentinel (rule 3)
        self.root = self.nil

    def _left_rotate(self, x: Node) -> None:
        y = x.right
        x.right = y.left
        if y.left is not self.nil:
            y.left.parent = x
        y.parent = x.parent
        if x.parent is self.nil:
            self.root = y
        elif x is x.parent.left:
            x.parent.left = y
        else:
            x.parent.right = y
        y.left = x
        x.parent = y

    def _right_rotate(self, x: Node) -> None:
        y = x.left
        x.left = y.right
        if y.right is not self.nil:
            y.right.parent = x
        y.parent = x.parent
        if x.parent is self.nil:
            self.root = y
        elif x is x.parent.right:
            x.parent.right = y
        else:
            x.parent.left = y
        y.right = x
        x.parent = y

    def insert(self, key: int) -> None:
        z = Node(key, left=self.nil, right=self.nil)
        y, x = self.nil, self.root
        while x is not self.nil:            # ordinary BST descent
            y = x
            x = x.left if key < x.key else x.right
        z.parent = y
        if y is self.nil:
            self.root = z
        elif key < y.key:
            y.left = z
        else:
            y.right = z
        self._fixup(z)

    def _fixup(self, z: Node) -> None:
        while z.parent.color == RED:
            g = z.parent.parent
            if z.parent is g.left:
                u = g.right
                if u.color == RED:                 # CASE 1: recolor, climb
                    z.parent.color = u.color = BLACK
                    g.color = RED
                    z = g
                else:
                    if z is z.parent.right:        # CASE 2: straighten
                        z = z.parent
                        self._left_rotate(z)
                    z.parent.color = BLACK         # CASE 3: recolor + rotate
                    g.color = RED
                    self._right_rotate(g)
            else:                                   # mirror
                u = g.left
                if u.color == RED:
                    z.parent.color = u.color = BLACK
                    g.color = RED
                    z = g
                else:
                    if z is z.parent.left:
                        z = z.parent
                        self._right_rotate(z)
                    z.parent.color = BLACK
                    g.color = RED
                    self._left_rotate(g)
        self.root.color = BLACK                     # rule 2
```

**Contest velocity.** Never hand-roll this in a contest — `std::map`/`std::set` (C++), `TreeMap`/`TreeSet` (Java), or `sortedcontainers.SortedList` (Python) give you the same O(log n) ordered operations for free. Write the fixup only when an interviewer asks for it.

## What the interviewer probes for

- **"Why do libraries default to red-black instead of AVL?"** — Red-black does fewer rotations per write (recolor-first), so inserts/deletes are cheaper; the slightly taller tree barely affects lookups. For the general mixed-workload map a library must serve, that trade wins.
- **"What's the height bound and why?"** — ≤ 2 log₂(n+1): equal black-height (rule 5) plus no-two-reds (rule 4) means the longest path is at most twice the shortest.
- **"How does insert avoid rotating most of the time?"** — Case 1 (red uncle) recolors and pushes the violation up the tree with no rotation; only a black uncle forces the ≤ 2 rotations of Cases 2/3.
- **"What's a red-black tree 'really'?"** — A binary encoding of a 2-3-4 B-tree; black nodes plus their red children are the fat multi-key B-tree nodes, and equal black-height is "all B-tree leaves at the same depth".
- **"Why is delete harder than insert?"** — Removing a black node breaks black-height (rule 5), creating a 'double-black' that must be resolved through the sibling's coloring and may propagate up — more cases than insert.

## Practice problems

Four problems, each a **distinct** facet of red-black trees — no two the same.

### 1. Why libraries pick red-black over AVL — _reasoning_

**Problem.** Explain to an interviewer why `std::map` and Java's `TreeMap` use red-black trees rather than AVL, given both are O(log n).

**Approach.** Frame it as a read/write trade. AVL keeps a tighter height (≤ 1.44 log n) → marginally faster lookups, but its strict invariant forces more rebalancing work, especially on delete. Red-black tolerates a taller tree (≤ 2 log n) but fixes most violations by **recoloring** (O(1) bit flips, no pointer moves), doing **≤ 2–3 rotations** per write. A general-purpose library serves mixed read/write workloads, so cheaper writes with negligibly slower reads is the better default. (No code — this is the conceptual probe; rehearse the soundbite.)

**Complexity.** N/A — the answer is the trade-off, stated crisply.

### 2. Verify red-black properties — _black-height check_

**Problem.** Given a red-black tree (nodes with colors), verify it satisfies the invariants: root black, no red-red, and equal black-height on every root-to-leaf path.

**Approach.** One recursion returning each subtree's **black-height**, or a sentinel (−1) on any violation. At each node: a red node with a red child fails (rule 4); the two children's black-heights must match (rule 5); add 1 if the node is black. Abort early on −1. The tree-DP shape applied to color verification.

```python
def black_height(node) -> int:            # -1 if any rule violated
    if node is None:                      # nil leaf: black, height contributes 1
        return 1
    if node.color == RED and ((node.left and node.left.color == RED)
                              or (node.right and node.right.color == RED)):
        return -1                          # red-red violation
    lh = black_height(node.left)
    rh = black_height(node.right)
    if lh == -1 or rh == -1 or lh != rh:
        return -1                          # unequal black-height
    return lh + (1 if node.color == BLACK else 0)

def is_valid_rb(root) -> bool:
    if root and root.color == RED:
        return False                       # root must be black
    return black_height(root) != -1
```

**Complexity.** O(n) time, O(h) space.

### 3. Red-black insert fixup — _recolor then rotate_

**Problem.** Implement red-black insert: BST-insert the new (red) node, then restore the color rules via the three fixup cases.

**Approach.** Insert red; while the parent is red, branch on the **uncle's color** — red uncle recolors and climbs (Case 1, no rotation); black uncle straightens any zig-zag (Case 2) then recolors + rotates (Case 3). Color the root black at the end. The reusable code is in [Implementation](#implementation) above; the skill is choosing the case from the uncle and recognizing recolor-vs-rotate.

```python
# see RedBlackTree.insert / _fixup in Implementation — the canonical solution.
t = RedBlackTree()
for k in [10, 20, 30, 15, 25]:
    t.insert(k)                            # stays balanced; root black, no red-red
```

**Complexity.** O(log n) time, ≤ 2 rotations, O(log n) space.

### 4. Order-statistics with a red-black tree — _augmentation_

**Problem.** Support `insert`, `delete`, and **`rank(x)`** (how many keys < x) and **`select(k)`** (the k-th smallest), all in O(log n).

**Approach.** Augment each node with the **size of its subtree**. `select(k)` descends using left-subtree sizes (like a [BST](./binary-search-tree.md) search guided by counts); `rank(x)` accumulates sizes of left subtrees passed while searching. Insert/delete update sizes along the path and during rotations (a rotation only moves O(1) subtree sizes). This is the **order-statistic tree** — a red-black tree carrying one extra integer per node. (In Python, `sortedcontainers.SortedList` gives `bisect`-based rank/select without the augmentation.)

```python
# conceptual: each node also stores `size`; on rotation, recompute the two
# rotated nodes' sizes (children-before-parent), like AVL height updates.
def select(node, k):                      # k-th smallest, 1-indexed
    left_size = node.left.size if node.left else 0
    if k == left_size + 1:
        return node.key
    return select(node.left, k) if k <= left_size else select(node.right, k - left_size - 1)
```

**Complexity.** O(log n) per operation, O(n) space.
