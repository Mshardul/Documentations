# Balanced BST

## Prerequisites

- [Binary Search Tree](./binary-search-tree.md) [Must read] - a balanced BST is a plain BST plus a self-balancing rule; you must understand the BST invariant and its skew failure before the fix makes sense.
- [Binary Tree](./binary-tree.md) [Should read] - rotations are local pointer-rewires on tree nodes; the tree mechanics transfer directly.
- **Big-O Notation** [Should read] - the entire point is converting a BST's worst-case O(n) into a guaranteed O(log n). <!-- U9: not-yet-written target — wire to `algorithms/big-o-notation.md` once that page exists. -->

## Table of Contents

- [Prerequisites](#prerequisites)
- [Table of Contents](#table-of-contents)
- [What it is](#what-it-is)
- [The problem balancing solves](#the-problem-balancing-solves)
- [Rotations: the shared mechanic](#rotations-the-shared-mechanic)
- [The members](#the-members)
- [Comparison](#comparison)
- [Which one when](#which-one-when)
- [Interview soundbite](#interview-soundbite)

> **Hub article.** This page is the survey + decision layer for self-balancing binary search trees — it does not trace any single balancing scheme in full. Each member (AVL, Red-Black, B-tree) has its own page with its invariant, rotation/fixup cases, and complexity proof. Read this to understand _what balancing buys and which scheme to pick_; follow a member link for the procedure.

## What it is

A **balanced BST** is a [binary search tree](./binary-search-tree.md) that **automatically restructures itself on insert and delete** to keep its height O(log n), so search, insert, and delete are guaranteed O(log n) — never the O(n) that a plain BST degrades to on sorted input.

Mental model: **a BST with a building inspector.** Every time you add or remove a key, the inspector checks a balance rule and, if it's violated, performs a few local **rotations** (and, for some schemes, recoloring) to flatten the tree back out — before you ever notice. The structures differ only in _which rule the inspector enforces_ and _how aggressively it fixes violations_; the BST ordering and the O(log n) goal are identical across all of them.

The members are **not interchangeable trivia** — they sit at different points on one trade-off: stricter balance buys faster reads at the cost of more work per write.

## The problem balancing solves

A plain [BST](./binary-search-tree.md)'s operations are O(height), and height depends on insertion order. Insert sorted keys and you get a **degenerate chain** — a [linked list](./linked-list.md) wearing a tree costume, every operation O(n):

```
insert 1,2,3,4,5 into a plain BST (sorted order):

(1)
   \
    (2)            height = n − 1
       \           search/insert/delete = O(n)
        (3)        ← this is the disaster balancing prevents
           \
            (4)
               \
                (5)
```

A balanced BST detects this lean and **rotates** to redistribute nodes, holding height at ~log₂ n:

```
the same keys in a balanced tree:

      (3)
     /   \          height = log n
   (2)   (4)        every operation O(log n)
   /       \
 (1)       (5)
```

The guarantee matters because **input order is often adversarial or simply sorted** (timestamps, IDs, alphabetized data). A plain BST has no defense; a balanced one is immune. This is why every production "ordered map" is a balanced tree, never a plain BST.

## Rotations: the shared mechanic

Every balancing scheme rebalances using **rotations** — a constant-time, local pointer-rewire that changes a subtree's height **without breaking the BST ordering**. A right rotation pulls the left child up; a left rotation pulls the right child up. Their in-order sequence is identical before and after (order preserved), only the shape changes.

```
right-rotate at y:                 left-rotate at x:  (the inverse)

      (y)                 (x)
     /   \               /   \
   (x)    C    ─────▶   A    (y)        in-order both: A x B y C
   /  \         ◀─────       /  \        height: one side drops by 1
  A    B                    B    C
```

The rebalance procedure differs per scheme — **when** to rotate, **how many**, and whether **recoloring** can substitute for a rotation — but rotation is the universal primitive. Master it once on the [binary tree](./binary-tree.md) and it transfers to every member below. (A self-balancing tree is essentially: "after each write, walk up the path and apply rotations to restore my invariant.")

## The members

Each member enforces a different balance invariant, trading read speed against write cost:

- **[AVL Tree](./avl-tree.md)** — the **strict** one. Invariant: every node's two subtree heights differ by ≤ 1, so height ≤ 1.44 log₂ n. Tightest balance → **fastest lookups**, but **more rotations per write** to maintain the strict bound. Choose for read-heavy workloads (e.g. lookup-dominated indexes).
- **[Red-Black Tree](./red-black-tree.md)** — the **pragmatic** one. Invariant: color rules (no two consecutive red nodes; equal black-height on every root-to-leaf path), giving height ≤ 2 log₂ n. Looser balance → **fewer rotations per write** (recoloring absorbs most fixes), slightly taller. The **library default**: `std::map`/`std::set`, Java `TreeMap`/`TreeSet`, and the Linux kernel scheduler all use it.
- **[B-Tree](./b-tree.md)** — the **disk** one. Not binary: each node holds **many keys and many children** (high fan-out), kept balanced so the tree stays shallow. Minimizes the number of **block/disk reads**, which is why **databases and filesystems** index with B-trees (and B+-trees). Choose when data lives on disk/SSD and seek count dominates.

## Comparison

| Tree                             | Balance invariant                        | Height bound | Lookup           | Write rotations  | Where it's used                         |
| -------------------------------- | ---------------------------------------- | ------------ | ---------------- | ---------------- | --------------------------------------- |
| Plain BST                        | none                                     | up to n      | O(n) worst       | none             | (avoid — teaching baseline)             |
| [AVL](./avl-tree.md)             | subtree heights differ ≤ 1               | ≤ 1.44 log n | **fastest**      | more             | read-heavy in-memory indexes            |
| [Red-Black](./red-black-tree.md) | color rules (≈ black-height)             | ≤ 2 log n    | fast             | **fewer**        | general-purpose ordered map (libraries) |
| [B-Tree](./b-tree.md)            | all leaves same depth, ≥ ⌈m/2⌉ keys/node | log_m n      | fast (few seeks) | node split/merge | on-disk DB & filesystem indexes         |

All three give **O(log n)** search/insert/delete — the table is about constants and the read-vs-write and memory-vs-disk trades, not asymptotics.

## Which one when

- **In-memory, lookup-dominated** (build mostly once, query relentlessly) → **[AVL](./avl-tree.md)**. The stricter balance shaves height and the extra write rotations don't matter when writes are rare.
- **In-memory, mixed read/write, general purpose** → **[Red-Black](./red-black-tree.md)**. "Recolor first, rotate rarely" makes writes cheap and lookups good-enough — which is exactly why standard libraries chose it. When in doubt in an interview, this is the default answer.
- **Data on disk / SSD, huge datasets** → **[B-Tree](./b-tree.md)** (or B+-tree). High fan-out means a tree of billions of keys is only a handful of levels deep, so a lookup costs a handful of block reads — the metric that matters when a seek is millions of times slower than a comparison.
- **You just need it to work in a contest / interview and the language has one** → reach for the library (`std::map`, `TreeMap`, Python `sortedcontainers.SortedList`); they're red-black (or equivalent) under the hood. Don't hand-roll balancing under time pressure unless asked to.

## Interview soundbite

> **(say this out loud):** "A balanced BST self-rotates on every write to keep height O(log n), so it never degrades like a plain BST. AVL balances strictly for faster reads; red-black balances loosely for faster writes and is what the libraries use; B-trees go wide to minimize disk seeks."
