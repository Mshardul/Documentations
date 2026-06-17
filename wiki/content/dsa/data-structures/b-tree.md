# B-Tree

## Prerequisites

- [Balanced BST](./balanced-bst.md) [Must read] - the hub: B-tree is the disk-oriented member, contrasted with the in-memory AVL/red-black. Read it for context.
- [Binary Search Tree](./binary-search-tree.md) [Must read] - a B-tree generalizes the BST to many keys per node; you need the ordered-search idea first.
- **Memory hierarchy / disk vs RAM** [Should read] - the B-tree exists because a disk/SSD seek is ~10⁵–10⁶× slower than a RAM access; without that cost gap, its design makes no sense.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Table of Contents](#table-of-contents)
- [What it is](#what-it-is)
- [Intuition](#intuition)
- [How it works](#how-it-works)
  - [Search](#search)
  - [Insert: split a full node](#insert-split-a-full-node)
  - [Delete: merge / borrow](#delete-merge--borrow)
- [Correctness / invariant](#correctness--invariant)
- [Complexity derivation](#complexity-derivation)
- [When to use / when not](#when-to-use--when-not)
- [Comparison](#comparison)
- [Traversal & invariant](#traversal--invariant)
- [Edge cases](#edge-cases)
- [Implementation](#implementation)
- [What the interviewer probes for](#what-the-interviewer-probes-for)
- [Practice problems](#practice-problems)
  - [Why B-trees for databases](#1-why-b-trees-for-databases--reasoning)
  - [B-tree search](#2-b-tree-search--multi-key-node-descent)
  - [Choose the order for a disk block](#3-choose-the-order-for-a-disk-block--sizing)
  - [B-tree vs B+-tree for range scans](#4-b-tree-vs-b-tree-for-range-scans--reasoning)

## What it is

A **B-tree** is a self-balancing search tree generalized so each node holds **many keys and many children** (not just one key and two children), kept shallow so that searching a huge dataset touches only a handful of nodes — minimizing the number of **disk/block reads**.

Mental model: **a multi-level index in a reference book.** Instead of a binary yes/no at each step, each B-tree node is a fat signpost holding dozens or hundreds of keys: "keys < 50 go to child A; 50–120 → child B; 120–300 → child C; …". One node read narrows the search enormously, so a tree of billions of keys is only 3–4 levels deep. The whole design exists to make the **height tiny** because each level costs a slow disk seek.

> **Takeaway (say this out loud):** "A B-tree is a balanced tree with hundreds of keys per node, so it stays only a few levels deep — minimizing disk seeks, which is why every database and filesystem indexes with it."

## Intuition

The driving fact: **a disk/SSD seek is roughly 100,000–1,000,000× slower than a RAM access.** So the cost of a search isn't comparisons (cheap, in-RAM once a node is loaded) — it's the **number of nodes you must fetch from disk**, i.e. the tree's height. A binary tree of a billion keys is ~30 levels deep → ~30 seeks. Disaster.

The fix: make each node as **wide** as one disk block (say 4–16 KB), holding hundreds of keys. Now the **fan-out** is hundreds, so a billion keys fit in `log₄₀₀(10⁹) ≈ 3–4` levels → 3–4 seeks. The B-tree trades "many shallow binary decisions" for "few wide multi-way decisions," aligning the structure to the hardware: **one node = one block = one seek.** Everything else (split, merge) is bookkeeping to keep it balanced and the nodes block-sized.

## How it works

A B-tree of **order m** (minimum degree `t`, where each node holds between `t−1` and `2t−1` keys) obeys: every node has between ⌈m/2⌉ and m children (except the root), keys within a node are sorted, and **all leaves sit at the same depth** (perfect balance). A node with `k` keys has `k+1` children, and the keys partition the child key-ranges.

```
order-5 B-tree (each node: up to 4 keys, up to 5 children), all leaves same depth:

                        [ 30 | 60 ]
                       /     |      \
            [10|20]      [40|50]      [70|80|90]
           / | | \       / | | \      / | | | \
        (leaves, all at the same level)

search 50:  root [30|60] → 30<50<60 → middle child → [40|50] → found 50  (2 node reads)
```

### Search

Within a node, binary-search the sorted keys to find the key or the child interval to descend into; recurse into that child. Each step descends one level (one block read). Height is `O(log_m n)`, so a search is `O(log_m n)` block reads — a handful even for billions of keys.

### Insert: split a full node

Insert always lands in a **leaf**. If the target leaf is **full** (`2t−1` keys), **split** it: the median key moves **up** into the parent, and the node divides into two half-full nodes. If the parent is now full, it splits too, propagating up — and if the root splits, a new root is created (the only way a B-tree grows taller, which is why **all leaves stay at the same depth**).

```
insert 25 into a full leaf [10|20|30|40] (order 5, max 4 keys → split):

           [..|..]                      [.. | 20 | ..]        ← median 20 pushed up
          /                    ──▶       /          \
   [10|20|25|30|40]  (now 5, full)   [10]          [25|30|40]   leaf split in two
```

Splitting **top-down** (split any full node you pass through on the way down) is the standard one-pass variant — it guarantees the parent always has room for a pushed-up median.

### Delete: merge / borrow

Delete from a leaf directly; delete from an internal node by replacing the key with its in-order predecessor/successor (in a leaf) and deleting that. If a node drops below the minimum `t−1` keys (**underflow**), restore the invariant by either **borrowing** a key from a sibling (rotate through the parent) or **merging** with a sibling (pull a key down from the parent). Merging can underflow the parent, propagating up — and if the root loses its last key, the tree shrinks by a level. Symmetric to insert's split.

## Correctness / invariant

**Invariants (order m, min degree t):**

1. Keys within each node are **sorted**; a node with `k` keys has exactly `k+1` children whose key-ranges the keys partition (the BST ordering, generalized).
2. Every node except the root has between `t−1` and `2t−1` keys (⌈m/2⌉ to m children) — the **fill invariant** that bounds height.
3. **All leaves are at the same depth** — perfect balance, maintained because growth happens only by splitting the root upward.

**Why it stays balanced:** the tree never adds a level at a leaf; it only grows when the root splits (adding a level at the _top_, uniformly) and only shrinks when the root empties. So every leaf is always equidistant from the root — balance is structural, not restored after the fact like [AVL](./avl-tree.md) rotations.

## Complexity derivation

**Height = O(log_t n).** With minimum degree `t`, every node (bar the root) has ≥ `t` children, so a tree of height `h` has at least `2·t^(h−1)` leaves → `n ≥ 2 t^(h−1) − 1`, giving `h ≤ 1 + log_t((n+1)/2) = O(log_t n)`. Because `t` is large (hundreds), `log_t n` is tiny — that's the point.

| Operation | Time (CPU)         | Disk reads (the metric that matters) |
| --------- | ------------------ | ------------------------------------ |
| Search    | O(log_t n · log t) | **O(log_t n)** block reads           |
| Insert    | O(log_t n · t)     | O(log_t n) reads + O(log_t n) writes |
| Delete    | O(log_t n · t)     | O(log_t n) reads + O(log_t n) writes |

The `log t` / `t` factors are **in-RAM** work (binary-search or shift within a loaded node) and are effectively free next to a disk seek. The headline cost is **block reads = O(log_t n)** — a handful. This is why the B-tree's win over a binary balanced tree is practical, not asymptotic: both are O(log n) in comparisons, but the B-tree is O(log n / log t) in _seeks_.

## When to use / when not

**Reach for a B-tree when:**

- Data lives **on disk or SSD** and is too big for RAM — databases, filesystems. The structure is designed around minimizing block reads.
- You need **ordered operations at scale** — range scans, sorted iteration, nearest-key — over a dataset that doesn't fit in memory.
- The access cost is dominated by **fetching a node** (a block/page), not by comparing keys.

**Reach for something else when:**

- **Everything fits in RAM** → an in-memory [balanced BST](./balanced-bst.md) ([red-black](./red-black-tree.md) or [AVL](./avl-tree.md)); B-tree's wide nodes add complexity with no seek-saving benefit when there are no seeks.
- **You only need unordered lookup** → a [hash table](./hash-table.md) (or a hash index on disk); O(1) beats O(log_t n) when order doesn't matter. (Many DBs offer both B-tree and hash indexes for exactly this reason.)
- **Append-only / write-heavy logs** → an LSM-tree often beats a B-tree on write throughput by batching sequential writes.

Real-world: **every relational database** indexes with B-trees or **B+-trees** (PostgreSQL, MySQL/InnoDB, SQL Server, Oracle); **filesystems** use them (NTFS, HFS+, ext4's htree, Btrfs — "B-tree filesystem"); and key-value stores layer them under sorted-access APIs. If you've ever made a database index, you made a B-tree.

## Comparison

| Tree                             | Keys/node | Height      | Optimized for               | Where it lives | Pick it when…                     |
| -------------------------------- | --------- | ----------- | --------------------------- | -------------- | --------------------------------- |
| **B-Tree**                       | many (m)  | log_m n     | **few disk seeks**          | disk/SSD       | on-disk ordered index             |
| B+-Tree                          | many      | log_m n     | range scans (leaves linked) | disk/SSD       | DB index with heavy range queries |
| [Red-Black](./red-black-tree.md) | 1         | ≤ 2 log n   | in-RAM writes               | RAM            | general in-memory ordered map     |
| [AVL](./avl-tree.md)             | 1         | ≤1.44 log n | in-RAM reads                | RAM            | read-heavy in-memory index        |
| [Hash table](./hash-table.md)    | n/a       | O(1) avg    | unordered lookup            | RAM or disk    | no order needed                   |

The B-tree's distinguishing column is **keys-per-node = many**, which collapses height and so disk seeks. The binary balanced trees win in RAM (no seeks to amortize); the B-tree wins the moment a node fetch is expensive.

## Traversal & invariant

Traversal generalizes the [BST](./binary-search-tree.md) in-order walk: within a node, interleave **children and keys** — child₀, key₀, child₁, key₁, …, key\_{k−1}, child_k — recursing into each child. This visits all keys in **sorted order**, same as a BST in-order traversal.

The defining invariant is **all leaves at equal depth** plus the **fill bounds** (`t−1` to `2t−1` keys per non-root node). The equal-depth property is what makes a B-tree "perfectly balanced" — stricter than [AVL](./avl-tree.md)'s ≤1 height difference or [red-black](./red-black-tree.md)'s ≤2× path ratio. It's maintained not by rotations but by **split** (on overfill) and **merge/borrow** (on underflow), which only ever add or remove a level at the root.

```
fill invariant (min degree t):
  non-root node:  t−1 ≤ keys ≤ 2t−1
  root:           1   ≤ keys ≤ 2t−1   (root may be sparse)
  overfull (2t keys after insert) → SPLIT, push median up
  underfull (t−2 keys after delete) → BORROW from sibling, or MERGE
```

## Edge cases

- **Root special-cases.** The root may have as few as 1 key (every other node needs ≥ `t−1`). The tree gains height only when the root splits, and loses height only when the root underflows to empty — handle these two events separately from ordinary split/merge.
- **Choosing the order `m`.** Pick `m` so a node fills one disk/page block (`m ≈ block_size / (key_size + pointer_size)`). Too small → too many levels (more seeks); too large → wasted partial reads. This sizing is the practical design decision (see practice problem 3).
- **Split median selection.** On split, the **median** key moves up; off-by-one in picking the median (left-vs-right bias for even counts) leaves nodes unbalanced or violating the fill bound. Be consistent.
- **Delete from an internal node.** You can't just remove an internal key (it separates children); replace it with its in-order predecessor/successor from a leaf, then delete that leaf key — analogous to BST two-child delete, but with borrow/merge afterward.
- **Underflow cascade.** A merge pulls a key down from the parent, which can underflow the parent, propagating to the root. Forgetting to continue the fixup upward corrupts the fill invariant.
- **B-tree vs B+-tree confusion.** In a **B+-tree**, all values live in the leaves and leaves are linked in a list (great for range scans); internal nodes hold only routing keys. Plain B-trees store values in internal nodes too. Databases usually use **B+-trees** — know the distinction.

## Implementation

B-tree code is lengthy; the **search** and the **split-on-insert** are the conceptual core. Pseudocode states the contract; Python shows search and the top-down split-child. (Delete's borrow/merge is summarized — in practice the DB engine owns this.)

**Pseudocode (CLRS-style contract):**

```
B-TREE-SEARCH(x, k)                        ▷ x = node (already in memory), k = key
1   i = 1
2   while i ≤ x.n and k > x.key[i]         ▷ binary-search the node's keys
3       i = i + 1
4   if i ≤ x.n and k == x.key[i]
5       return (x, i)                      ▷ found
6   if x.leaf
7       return NIL                         ▷ not present
8   DISK-READ(x.child[i])                  ▷ THE expensive step — one seek
9   return B-TREE-SEARCH(x.child[i], k)

B-TREE-SPLIT-CHILD(x, i)                   ▷ split x's full child x.child[i]
1   ▷ move the median of the full child up into x at position i,
2   ▷ divide the child into two nodes each with t−1 keys
3   ▷ x gains one key and one child; both halves are now half-full
```

**Python (reference — idiomatic search + split):**

```python
from __future__ import annotations
from dataclasses import dataclass, field


@dataclass
class BTreeNode:
    leaf: bool
    keys: list[int] = field(default_factory=list)
    children: list["BTreeNode"] = field(default_factory=list)


class BTree:
    def __init__(self, t: int) -> None:
        self.t = t                          # minimum degree: t−1..2t−1 keys/node
        self.root = BTreeNode(leaf=True)

    def search(self, k: int, node: BTreeNode | None = None):
        node = node or self.root
        i = 0
        while i < len(node.keys) and k > node.keys[i]:   # find slot / child
            i += 1
        if i < len(node.keys) and node.keys[i] == k:
            return (node, i)                 # found
        if node.leaf:
            return None                      # absent
        return self.search(k, node.children[i])          # descend (1 "disk read")

    def _split_child(self, parent: BTreeNode, i: int) -> None:
        t = self.t
        full = parent.children[i]
        new = BTreeNode(leaf=full.leaf)
        mid = full.keys[t - 1]               # median moves up
        new.keys = full.keys[t:]             # right half → new node
        full.keys = full.keys[: t - 1]       # left half stays
        if not full.leaf:
            new.children = full.children[t:]
            full.children = full.children[:t]
        parent.keys.insert(i, mid)           # median into parent
        parent.children.insert(i + 1, new)

    def insert(self, k: int) -> None:
        root = self.root
        if len(root.keys) == 2 * self.t - 1:     # root full → grow taller
            new_root = BTreeNode(leaf=False, children=[root])
            self.root = new_root
            self._split_child(new_root, 0)
            self._insert_nonfull(new_root, k)
        else:
            self._insert_nonfull(root, k)

    def _insert_nonfull(self, node: BTreeNode, k: int) -> None:
        i = len(node.keys) - 1
        if node.leaf:
            node.keys.append(0)
            while i >= 0 and k < node.keys[i]:   # shift to keep sorted
                node.keys[i + 1] = node.keys[i]
                i -= 1
            node.keys[i + 1] = k
        else:
            while i >= 0 and k < node.keys[i]:
                i -= 1
            i += 1
            if len(node.children[i].keys) == 2 * self.t - 1:  # split full child first
                self._split_child(node, i)
                if k > node.keys[i]:
                    i += 1
            self._insert_nonfull(node.children[i], k)
```

**Contest velocity.** B-trees almost never appear in contests (they're a systems structure, not an algorithmic one) — and you'd never hand-roll one. Know the _concept_ (wide nodes, few seeks, DB indexes) for system-design and DB interviews; reach for the binary [balanced BST](./balanced-bst.md) or a library structure for in-memory contest needs.

## What the interviewer probes for

- **"Why a B-tree instead of a red-black tree for a database index?"** — Because data is on disk and a seek dwarfs a comparison. High fan-out makes the tree 3–4 levels deep instead of ~30, so a lookup is 3–4 seeks instead of 30. In RAM (no seeks) you'd use red-black instead.
- **"How do you choose the order/degree?"** — Size each node to fill one disk page: `m ≈ page_size / (key_size + child_pointer_size)`. The goal is one block read per node.
- **"B-tree vs B+-tree?"** — B+-tree keeps all values in leaves and links leaves in a list, making range scans and full-table sorted reads sequential; databases prefer it. Plain B-trees store values in internal nodes too.
- **"How does it stay balanced without rotations?"** — It only changes height at the root (split grows, underflow shrinks), so all leaves stay equidistant — balance is built into the split/merge mechanics, no rotation needed.

## Practice problems

Four problems, each a **distinct** facet of B-trees — no two the same.

### 1. Why B-trees for databases — _reasoning_

**Problem.** Explain why relational databases index with B-trees (B+-trees) rather than an in-memory balanced BST like red-black.

**Approach.** Center the answer on the **memory hierarchy**: the index is too big for RAM and lives on disk, where a seek is ~10⁵–10⁶× slower than a comparison. A binary tree of a billion rows is ~30 levels → ~30 seeks; a B-tree with fan-out ~400 is ~4 levels → ~4 seeks. Each node is sized to one disk page so a node fetch is one block read. Add that B+-trees link leaves for fast range scans (a common SQL query shape). (Conceptual — rehearse the soundbite.)

**Complexity.** N/A — the answer is the seek-count argument.

### 2. B-tree search — _multi-key-node descent_

**Problem.** Implement search in a B-tree: find a key, returning the node and index, or null.

**Approach.** Within each node, binary-search (or linear-scan) the sorted keys to either find the key or identify the child interval to descend into; recurse into that child until found or a leaf is reached. The only "expensive" step is descending to a child (one block read in a real system). Generalizes BST search to k+1-way branching.

```python
# see BTree.search in Implementation — the canonical solution.
bt = BTree(t=2)
for k in [10, 20, 5, 6, 12, 30, 7, 17]:
    bt.insert(k)
print(bt.search(12) is not None)          # True
```

**Complexity.** O(log_t n) node reads, O(log_t n · log t) CPU.

### 3. Choose the order for a disk block — _sizing_

**Problem.** A disk page is 4096 bytes; keys are 8 bytes and child pointers are 8 bytes. What order (max children) should the B-tree use, and how many levels for 1 billion keys?

**Approach.** A node with `m` children has `m−1` keys and `m` pointers: `8(m−1) + 8m ≤ 4096` → `16m ≤ 4104` → `m ≈ 256`. With fan-out ~256, height ≈ `log₂₅₆(10⁹) = log(10⁹)/log(256) ≈ 30/8 ≈ 3.7` → **~4 levels, ~4 disk reads** per lookup. The exercise is the real design calculation behind every database index.

```python
def b_tree_order(page=4096, key=8, ptr=8):
    # m pointers + (m-1) keys must fit a page
    return (page + key) // (key + ptr)        # ≈ 256
def levels(n, m):
    import math
    return math.ceil(math.log(n, m))
print(b_tree_order(), levels(10**9, b_tree_order()))   # 256 4
```

**Complexity.** O(1) arithmetic — it's a sizing decision, not an algorithm.

### 4. B-tree vs B+-tree for range scans — _reasoning_

**Problem.** A query needs all keys in `[100, 500]` from a billion-row indexed table. Explain why a B+-tree handles this better than a plain B-tree.

**Approach.** In a **B+-tree**, all values live in the **leaves**, and leaves are **linked** in a sorted list. So a range scan does one O(log_t n) descent to find `100`, then walks the leaf-list sequentially to `500` — sequential block reads, cache- and prefetch-friendly. A plain B-tree stores values in internal nodes too, so a range scan must hop up and down the tree (random-ish reads). For range-heavy SQL, the linked-leaf design is decisively better — which is why databases use B+-trees. (Conceptual.)

**Complexity.** Range scan: O(log_t n + k/B) block reads in a B+-tree (k results, B per block) — the `k/B` term being sequential.
