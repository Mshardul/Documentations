# Binary Tree

## Prerequisites

- **Big-O Notation** [Must read] - tree operations are O(height), which is O(log n) balanced and O(n) skewed; you need the cost model to see why balance is the whole game. <!-- U9: not-yet-written target — wire to `algorithms/big-o-notation.md` once that page exists. -->
- [Linked List](./linked-list.md) [Must read] - a tree node is a linked-list node with two `next` pointers (left, right); the pointer-rewiring intuition transfers directly.
- [Queue](./queue.md) [Should read] - level-order traversal (BFS) is a queue walk; [Stack](./stack.md) [Should read] - depth-first traversal is a stack (explicit or the call stack).

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
  - [Depth-first: pre / in / post-order](#depth-first-pre--in--post-order)
  - [Breadth-first: level-order](#breadth-first-level-order)
  - [The shape invariants: full, complete, balanced](#the-shape-invariants-full-complete-balanced)
- [Implementation](#implementation)
- [CP-primitives](#cp-primitives)
  - [Tree DP — answer from children](#tree-dp--answer-from-children)
  - [Array-embedded tree (no pointers)](#array-embedded-tree-no-pointers)
- [Gotchas / edge cases](#gotchas--edge-cases)
- [Practice problems](#practice-problems)
  - [Maximum Depth of Binary Tree](#1-maximum-depth-of-binary-tree--dfs-recursion)
  - [Binary Tree Level Order Traversal](#2-binary-tree-level-order-traversal--bfs)
  - [Invert Binary Tree](#3-invert-binary-tree--recursive-swap)
  - [Diameter of Binary Tree](#4-diameter-of-binary-tree--tree-dp)
  - [Lowest Common Ancestor](#5-lowest-common-ancestor--recursive-search)

## What it is

A **binary tree** is a hierarchical structure of nodes where each node has at most **two children** — a left and a right — and exactly one node (the root) has no parent.

Mental model: **a family tree, or an org chart, where everyone has at most two reports.** Start at the root and branch downward; every node is itself the root of a smaller subtree. That **self-similarity** — a tree is a node plus a left subtree plus a right subtree — is why almost every tree algorithm is naturally recursive: solve the children, combine, done.

> **Takeaway (say this out loud):** "A binary tree is nodes with up to two children — recursive by nature, so most operations are 'recurse left, recurse right, combine', running in O(height)."

## How it works

Each **node** holds a value and two child pointers, `left` and `right`, either of which can be null. The tree is just a pointer to the **root**; from there, every node is reachable by following child links. A node with no children is a **leaf**.

```
            (1)            ← root, depth 0
           /   \
        (2)     (3)        ← depth 1
        /  \       \
     (4)   (5)     (6)     ← depth 2 (4,5,6 are leaves)
```

Two definitions that every tree problem leans on:

- **Height** of a node = the longest downward path to a leaf (the tree's height is the root's). **Depth** = distance from the root. The tree above has height 2.
- **O(height), not O(n).** Search/insert/delete in a search tree are O(height): **O(log n)** when the tree is balanced (height ~log n), but **O(n)** when it degenerates into a chain. Balance is the difference between a tree and a glorified linked list — and the entire reason [balanced BSTs](./balanced-bst.md) exist.

The structure's self-similarity is the key working insight: **`tree = node + left subtree + right subtree`**. Any property you want (height, sum, whether it's balanced) you compute by recursing into both subtrees and combining their answers at the current node — the [tree-DP](#tree-dp--answer-from-children) pattern. Iteratively, the same walk uses an explicit [stack](./stack.md) (depth-first) or [queue](./queue.md) (breadth-first).

## Operations

| Operation                       | Time  | Space  |
| ------------------------------- | ----- | ------ |
| Traverse (visit all nodes)      | O(n)  | O(h)\* |
| Search (unordered tree)         | O(n)  | O(h)   |
| Insert at a known position      | O(1)  | O(1)   |
| Delete a known node             | O(1)† | O(1)   |
| Height / depth computation      | O(n)  | O(h)   |
| Search/insert/delete (as a BST) | O(h)  | O(h)   |

\*Recursion (or an explicit stack) holds up to `h` frames — O(h) space, where h = height. †Deleting an arbitrary node and re-parenting its children is O(1) only with the node and parent in hand; in a [BST](./binary-search-tree.md), maintaining the order invariant on delete is O(h). A plain binary tree has **no ordering**, so search is O(n) — ordering is what a [BST](./binary-search-tree.md) adds.

## Complexity summary

| Operation             | Best (balanced) | Average  | Worst (skewed) |
| --------------------- | --------------- | -------- | -------------- |
| Traversal             | O(n)            | O(n)     | O(n)           |
| Search (as BST)       | O(log n)        | O(log n) | O(n)           |
| Insert (as BST)       | O(log n)        | O(log n) | O(n)           |
| Recursion stack depth | O(log n)        | O(log n) | O(n)           |

**Space:** O(n) for the nodes (two child pointers each). The crucial hidden cost is the **recursion stack**: O(height) frames — fine at O(log n) for a balanced tree, but a degenerate (skewed) tree makes it O(n) and can **overflow the call stack** on large inputs. Morris traversal achieves O(1) space by temporarily threading pointers, at the cost of mutating the tree during the walk (see [Gotchas](#gotchas--edge-cases)).

## When to use / when not

**Reach for a binary tree when:**

- Your data is **naturally hierarchical** — file systems, the DOM, org charts, expression/parse trees, decision trees.
- You need **ordered operations with fast insert** → a [binary search tree](./binary-search-tree.md) (O(log n) search _and_ in-order = sorted), or a [balanced BST](./balanced-bst.md) to guarantee it.
- You need **priority access** → a [heap](./heap.md), a complete binary tree giving O(1) min/max.
- You need **prefix queries on strings** → a [trie](./trie.md), a tree branching on characters.

**Reach for something else when:**

- **You only need key→value lookup, no order** → a [hash table](./hash-table.md) is O(1) average vs the tree's O(log n). Trees earn their keep when _order_ matters (range queries, k-th smallest, sorted iteration).
- **The data is flat / index-addressed** → an [array](./array.md); imposing a tree adds pointer overhead and cache misses for nothing.
- **You can't guarantee balance and need worst-case bounds** → an unbalanced BST degrades to O(n); use a [balanced BST](./balanced-bst.md) or a hash table.

Rule of thumb: **a binary tree is the answer when the problem is hierarchical or needs order-plus-fast-insert.** Plain binary trees are mostly a teaching/structural base; in practice you reach for a _specialized_ one — BST, heap, or trie.

Real-world: the **DOM** and any UI view hierarchy, file-system directory trees, database **B-tree/B+-tree indexes** (a generalization), Huffman coding trees in compression, expression trees in compilers and spreadsheets, and the [heap](./heap.md) behind every priority queue and scheduler.

## Comparison

How a binary tree relates to the structures you'd weigh against it:

| Structure       | Search        | Insert       | Ordered iteration  | Range / k-th | Memory                 | Pick it when…                      |
| --------------- | ------------- | ------------ | ------------------ | ------------ | ---------------------- | ---------------------------------- |
| **Binary tree** | O(n)          | O(1) at spot | no (unordered)     | no           | 2 ptrs/node, scattered | hierarchy, recursion base          |
| BST (balanced)  | **O(log n)**  | **O(log n)** | **yes** (in-order) | **O(log n)** | 2 ptrs/node            | ordered keys + fast insert + range |
| Heap            | O(n) (search) | O(log n)     | no                 | min/max only | array, complete tree   | top/min/max priority               |
| Trie            | O(L) by char  | O(L)         | by prefix          | prefix       | child ptrs/node        | string keys, autocomplete          |
| Hash table      | **O(1)** avg  | **O(1)** avg | no                 | no           | scattered + slack      | unordered key→value lookup         |

The plain binary tree's value is **structure and recursion**, not speed — its specialized children (BST, heap, trie) are where the O(log n)/O(1) guarantees live. A hash table beats them all on unordered lookup; trees win the moment _order_ enters.

## Variants

- **[Binary Search Tree (BST)](./binary-search-tree.md)** — ordering invariant (`left < node < right`) gives O(log n) search and sorted in-order traversal. The most important specialization.
- **[Balanced BST (AVL / Red-Black)](./balanced-bst.md)** — a BST that self-balances via rotations to guarantee O(log n) height, defeating the skew that ruins a plain BST.
- **[Heap](./heap.md)** — a **complete** binary tree with the heap invariant (parent beats children); stored in a flat array, O(1) min/max. The priority-queue workhorse.
- **[Trie (prefix tree)](./trie.md)** — branches on characters rather than comparisons; O(L) string lookup and prefix queries.
- **N-ary tree** — each node has any number of children (the DOM, file systems). Generalizes the binary tree; often re-encoded as binary via "left-child / right-sibling".
- **Segment tree / Fenwick tree** — tree-shaped indexes over array ranges for O(log n) range queries; [segment tree](./segment-tree.md), [Fenwick tree](./fenwick-tree.md). Structurally trees, used as range-query engines.
- **Threaded binary tree** — leaf null-pointers repurposed to point at in-order predecessor/successor, enabling O(1)-space traversal (the idea behind Morris traversal).

## Traversal & invariant

The two things that define a binary tree in interviews: **the orders you can walk it** and **the shape constraints that bound its height**.

### Depth-first: pre / in / post-order

DFS visits a whole subtree before moving on, using a [stack](./stack.md) (the call stack, or an explicit one). The three orders differ only in **when the node itself is visited** relative to its children:

```
            (1)
           /   \
        (2)     (3)
        /  \
     (4)   (5)

Pre-order  (node, left, right):   1 2 4 5 3      ▷ "visit before descending" — copy/serialize a tree
In-order   (left, node, right):   4 2 5 1 3      ▷ on a BST → SORTED order
Post-order (left, right, node):   4 5 2 3 1      ▷ "children first" — delete a tree, compute size/height
```

Each is the same O(n) walk; the choice encodes _when_ you need a node's answer relative to its subtrees:

- **Pre-order** — act on a node before its children: serialize, clone, render top-down.
- **In-order** — on a [BST](./binary-search-tree.md), produces keys in **sorted** order. The defining BST property.
- **Post-order** — need both children's results first: compute height/size, delete (free children before parent), [tree DP](#tree-dp--answer-from-children).

### Breadth-first: level-order

BFS visits the tree **level by level**, using a [queue](./queue.md): dequeue a node, enqueue its children, repeat. Snapshotting the queue size at the start of each loop iteration groups nodes by level.

```
level 0:  1
level 1:  2 3
level 2:  4 5

queue walk: enqueue 1 → [1]; dequeue 1, enqueue 2,3 → [2,3]; dequeue 2, enqueue 4,5 → [3,4,5]; …
```

Use level-order for "process by depth": shortest path in an unweighted tree, level averages, right-side view, zig-zag traversal.

### The shape invariants: full, complete, balanced

The single number that governs tree performance is **height**, and these invariants bound it:

- **Full** — every node has 0 or 2 children (no node has exactly one). A structural curiosity, not a performance guarantee.
- **Complete** — every level filled except possibly the last, which fills left-to-right. Guarantees height = ⌊log₂ n⌋ and packs perfectly into an array with **no gaps** — this is exactly the [heap](./heap.md)'s shape and why a heap needs no pointers (see [CP-primitives](#array-embedded-tree-no-pointers)).
- **Balanced** — every node's two subtree heights differ by ≤ 1 (AVL's definition), keeping height O(log n). This is the invariant a [balanced BST](./balanced-bst.md) maintains via rotations — and the difference between O(log n) and a skewed O(n) chain.

The invariant matters because **a binary tree with no balance guarantee can degenerate into a linked list** (insert sorted data into a plain BST → a right-leaning chain, every op O(n)). Balance is not decoration; it's what makes the tree a tree.

## Implementation

A binary tree node plus the canonical traversals. Pseudocode states the recursive contract; Python gives the idiomatic recursion and the iterative equivalents you reach for to dodge stack overflow.

**Pseudocode (CLRS-style contract):**

```
INORDER-TRAVERSE(node, visit)
1   if node == NIL
2       return                    ▷ base case: empty subtree
3   INORDER-TRAVERSE(node.left, visit)    ▷ left subtree first
4   visit(node.key)                       ▷ then the node
5   INORDER-TRAVERSE(node.right, visit)   ▷ then right subtree

LEVEL-ORDER(root, visit)
1   if root == NIL
2       return
3   Q = new QUEUE();  ENQUEUE(Q, root)
4   while not EMPTY(Q)
5       node = DEQUEUE(Q)
6       visit(node.key)
7       if node.left  ≠ NIL:  ENQUEUE(Q, node.left)
8       if node.right ≠ NIL:  ENQUEUE(Q, node.right)
```

**Python (reference — idiomatic):**

```python
from __future__ import annotations
from collections import deque
from dataclasses import dataclass
from typing import Optional


@dataclass
class TreeNode:
    val: int
    left: Optional["TreeNode"] = None
    right: Optional["TreeNode"] = None


def inorder(root: Optional[TreeNode]) -> list[int]:
    """Recursive in-order: left, node, right → sorted on a BST."""
    if root is None:
        return []
    return inorder(root.left) + [root.val] + inorder(root.right)


def inorder_iterative(root: Optional[TreeNode]) -> list[int]:
    """Same walk with an explicit stack — no recursion-depth limit."""
    out, stack, cur = [], [], root
    while cur or stack:
        while cur:                       # dive left, stacking nodes
            stack.append(cur)
            cur = cur.left
        cur = stack.pop()                # backtrack: visit, then go right
        out.append(cur.val)
        cur = cur.right
    return out


def level_order(root: Optional[TreeNode]) -> list[list[int]]:
    """BFS grouped by level using a queue."""
    if root is None:
        return []
    out, q = [], deque([root])
    while q:
        level = []
        for _ in range(len(q)):          # snapshot this level's size
            node = q.popleft()
            level.append(node.val)
            if node.left:  q.append(node.left)
            if node.right: q.append(node.right)
        out.append(level)
    return out
```

**Contest velocity.** Recursion is the fastest to write for tree DFS — but Python's ~1000-frame recursion cap means a deep/skewed tree (10⁵ nodes) overflows. Either `sys.setrecursionlimit(10**6)` (and raise the OS stack) or switch to the iterative stack version. For BFS, `collections.deque` is the queue (never `list.pop(0)`).

## CP-primitives

A plain binary tree's contest surface is smaller than a Linear structure's (no prefix-sum-style tricks), but two ideas recur constantly.

### Tree DP — answer from children

Most "compute X of the tree" problems are a **post-order DP**: each node's answer is a function of its children's answers, computed once on the way back up. Often you return one value to the parent while updating a global with another (the diameter trick).

```python
def diameter(root) -> int:
    best = 0
    def height(node) -> int:             # returns height; updates best (diameter)
        nonlocal best
        if not node:
            return 0
        lh, rh = height(node.left), height(node.right)
        best = max(best, lh + rh)        # path through this node
        return 1 + max(lh, rh)           # height reported upward
    height(root)
    return best
```

**Why for CP:** one O(n) post-order pass answers height, diameter, subtree sums, "max path sum", balance-check, and "houses to rob on a tree" — all the same skeleton: recurse both children, combine at the node. The single highest-leverage tree pattern.

### Array-embedded tree (no pointers)

A **complete** binary tree maps perfectly to a flat [array](./array.md) by index math — no node objects, no pointers, cache-friendly. For a node at index `i` (0-based): children at `2i+1` and `2i+2`, parent at `(i-1)//2`.

```
tree:        (A)              array:  index: 0  1  2  3  4  5  6
            /   \                            [A][B][C][D][E][F][G]
          (B)   (C)                  children of i: 2i+1, 2i+2
         /  \   /  \                  parent of i:  (i-1)//2
       (D)(E)(F)(G)
```

**Why for CP:** this is exactly how a [heap](./heap.md) is stored, and how [segment trees](./segment-tree.md) are built — pointer-free, contiguous, and indexable. When the tree is complete (or you pad to complete), drop the pointers entirely and do index arithmetic.

## Gotchas / edge cases

- **The empty tree (null root).** Every traversal and computation must handle `root is None` as the base case — it's the most-forgotten edge and the first thing an interviewer tests. Height of empty = 0 (or -1 by some conventions — state which), traversal = empty list.
- **Single node vs deep skew.** A one-node tree (root, no children) and a fully skewed tree (every node has only a right child → a [linked list](./linked-list.md)) are the boundary cases. The skew is where O(log n) silently becomes O(n) and recursion overflows — never assume balance unless it's a [balanced BST](./balanced-bst.md).
- **Recursion-depth overflow.** Recursive DFS on a deep/skewed tree (10⁵+ nodes) blows Python's ~1000-frame stack (`RecursionError`) or the OS stack in C/Java. Convert to an explicit-[stack](./stack.md) iterative walk, or raise the limit — a frequent cause of "works on small input, crashes on big".
- **Height vs depth, and 0 vs 1 conventions.** Height (to deepest leaf) and depth (from root) are opposite directions, and whether a single node has height 0 or 1 varies by source. Pin the convention down before coding; off-by-one here is a classic bug.
- **In-order on a non-BST isn't sorted.** In-order gives sorted output **only** on a [BST](./binary-search-tree.md). On a plain binary tree it's just left-node-right with no ordering meaning — don't assume sortedness from a generic tree.
- **Mutating during traversal (Morris caveat).** O(1)-space Morris traversal temporarily rewires leaf pointers; if the walk aborts midway (an exception, an early return), the tree is left corrupted. Restore pointers or use the explicit stack unless O(1) space is genuinely required.

## Practice problems

Five staples, each a **distinct** tree technique — no two solved the same way.

### 1. Maximum Depth of Binary Tree — _DFS recursion_

**Problem.** Return the maximum depth (number of nodes on the longest root-to-leaf path) of a binary tree. E.g. a balanced 3-level tree → `3`; empty → `0`.

**Approach.** The self-similar definition is the solution: depth of a node = 1 + max(depth of left, depth of right), with empty = 0. A direct post-order recursion — solve both subtrees, combine. The cleanest demonstration of "recurse, combine" on a tree.

```python
def max_depth(root: Optional[TreeNode]) -> int:
    if root is None:
        return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))
```

**Complexity.** O(n) time, O(h) space (recursion stack).

### 2. Binary Tree Level Order Traversal — _BFS_

**Problem.** Return the node values grouped by level, top to bottom. E.g. the tree `[3,9,20,null,null,15,7]` → `[[3],[9,20],[15,7]]`.

**Approach.** BFS with a [queue](./queue.md), snapshotting the queue length at the start of each iteration so you process exactly one level before moving down. The FIFO order guarantees left-to-right within a level. The canonical "process by depth" tree problem.

```python
from collections import deque

def level_order(root: Optional[TreeNode]) -> list[list[int]]:
    if root is None:
        return []
    out, q = [], deque([root])
    while q:
        level = [None] * len(q)
        for i in range(len(level)):       # exactly this level's nodes
            node = q.popleft()
            level[i] = node.val
            if node.left:  q.append(node.left)
            if node.right: q.append(node.right)
        out.append(level)
    return out
```

**Complexity.** O(n) time, O(n) space (queue holds up to a full level). Pattern: [Tree & Graph Traversal](../patterns/tree-graph-traversal.md).

### 3. Invert Binary Tree — _recursive swap_

**Problem.** Mirror a binary tree: swap every node's left and right children. E.g. `[4,2,7,1,3,6,9]` → `[4,7,2,9,6,3,1]`.

**Approach.** Recurse: swap the current node's two children, then invert each subtree. A pre-order (swap then descend) or post-order (descend then swap) both work — the swap is local and the recursion handles the rest. The "famous whiteboard" one-liner of tree recursion.

```python
def invert_tree(root: Optional[TreeNode]) -> Optional[TreeNode]:
    if root is None:
        return None
    root.left, root.right = invert_tree(root.right), invert_tree(root.left)
    return root
```

**Complexity.** O(n) time, O(h) space.

### 4. Diameter of Binary Tree — _tree DP_

**Problem.** Return the length of the longest path between any two nodes (counted in edges), which may or may not pass through the root. E.g. `[1,2,3,4,5]` → `3` (the path `4→2→1→3` or `5→2→1→3`).

**Approach.** **Tree DP**: at each node, the longest path _through_ it is `leftHeight + rightHeight`; update a global max with that, while _returning_ `1 + max(leftHeight, rightHeight)` (the height) to the parent. The two-values trick — return one thing, track another — is the heart of tree DP. One post-order pass.

```python
def diameter_of_binary_tree(root: Optional[TreeNode]) -> int:
    best = 0
    def height(node: Optional[TreeNode]) -> int:
        nonlocal best
        if node is None:
            return 0
        lh, rh = height(node.left), height(node.right)
        best = max(best, lh + rh)         # edges in path through node
        return 1 + max(lh, rh)            # height upward
    height(root)
    return best
```

**Complexity.** O(n) time, O(h) space.

### 5. Lowest Common Ancestor — _recursive search_

**Problem.** Given two nodes `p` and `q` in a binary tree, return their lowest common ancestor (the deepest node having both as descendants). Both nodes exist in the tree.

**Approach.** Recurse: if the current node is `p`, `q`, or null, return it. Recurse into both subtrees; if **both** sides return non-null, the current node is the split point → it's the LCA. If only one side does, the LCA is up that side. The recursion "bubbles up" the answer from where the two targets first diverge.

```python
def lowest_common_ancestor(root, p, q):
    if root is None or root is p or root is q:
        return root                        # found a target or hit the bottom
    left = lowest_common_ancestor(root.left, p, q)
    right = lowest_common_ancestor(root.right, p, q)
    if left and right:
        return root                        # p and q split here → LCA
    return left or right                    # both on one side (or neither)
```

**Complexity.** O(n) time, O(h) space.
