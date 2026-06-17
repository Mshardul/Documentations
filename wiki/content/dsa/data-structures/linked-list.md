# Linked List

## Prerequisites

- **Big-O Notation** [Must read] - every operation below is stated in Big-O; you must read complexity to use this page. <!-- U9: not-yet-written target — wire to `algorithms/big-o-notation.md` once that page exists. -->
- [Array](./array.md) [Must read] - a linked list is the pointer-based answer to everything an array does with contiguity. You can't see what the list buys you without the array's cost model to contrast against.
- **Computer memory model** [Should read] - a node lives at an arbitrary heap address and holds a pointer to the next; you need to picture memory as scattered cells reached by following references, not by index arithmetic.

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
  - [Dummy (sentinel) head — kill the head-edge-case](#dummy-sentinel-head--kill-the-head-edge-case)
  - [In-place reversal of pointers](#in-place-reversal-of-pointers)
  - [Fast/slow pointers — cycle, middle, k-from-end](#fastslow-pointers--cycle-middle-k-from-end)
- [Gotchas / edge cases](#gotchas--edge-cases)
- [Practice problems](#practice-problems)
  - [Reverse a Linked List](#1-reverse-a-linked-list--iterative-pointer-rewiring)
  - [Linked List Cycle II](#2-linked-list-cycle-ii--floyds-tortoise-and-hare)
  - [Merge Two Sorted Lists](#3-merge-two-sorted-lists--dummy-head--splice)
  - [Remove Nth Node From End](#4-remove-nth-node-from-end--two-pointers-one-pass)
  - [LRU Cache](#5-lru-cache--hashmap--doubly-linked-list)

## What it is

A **linked list** is a linear sequence of nodes, each holding a value and a **pointer to the next node** — so the order lives in the links, not in memory addresses.

Mental model: **a treasure hunt, not a row of lockers.** An [array](./array.md) is numbered lockers — you compute where #5 is and jump there. A linked list is a chain of clues: you hold the first node, it tells you where the second is, the second tells you the third. To reach the 5th node you _must_ walk through the first four. That single fact — no address arithmetic, only "follow the next pointer" — is the source of every trade the linked list makes: O(1) splicing once you're at a node, but O(n) to get anywhere by position.

> **Takeaway (say this out loud):** "A linked list trades the array's O(1) random access for O(1) insert/delete at a node you already hold — no shifting, but you have to walk to find anything."

## How it works

Each **node** is an independently allocated object holding two things: the **value** and a **reference** (`next`) to the following node. The list itself is just a pointer to the first node, the **head**; the last node's `next` is null, marking the end. There is no index, no base address, no contiguity — the nodes can sit anywhere on the heap.

```
head
 │
 ▼
[42|•]──▶[17|•]──▶[99|•]──▶[8|/]      "/" = null, end of list
 node     node     node     node
(addr     (addr     (addr    (addr
 0x10)    0x88)     0x40)    0xF0)     ← arbitrary, non-contiguous
```

**Traversal is the only way to navigate.** To find the i-th node, start at `head` and follow `next` i times — O(n). There is no `list[i]` jump; that operation simply does not exist at the structure level (a language `LinkedList.get(i)` is just this walk in disguise).

**Insertion and deletion are pure pointer surgery — and that's the whole point.** Once you hold a node, splicing in or out is O(1): rewire two pointers, touch nothing else. No element shifts, because there's no contiguity to preserve.

```
insert 55 after the node holding 17:

before:  [42|•]──▶[17|•]──────────▶[99|•]──▶[8|/]

         1. new node 55 points where 17 pointed:   [55|•]──▶[99|...]
         2. 17 now points to 55:                   [17|•]──▶[55|...]

after:   [42|•]──▶[17|•]──▶[55|•]──▶[99|•]──▶[8|/]
                            ▲ two pointer writes, O(1) — nothing shifted
```

The catch hiding in "O(1) insert": it's O(1) **only once you already hold the predecessor node.** Inserting "at position i" is O(n) because you first walk to position i. The array is the mirror image — finding position i is O(1), but the insert that follows is O(n). **Each structure is cheap exactly where the other is expensive.**

## Operations

| Operation                              | Time | Space |
| -------------------------------------- | ---- | ----- |
| Access / search by position            | O(n) | O(1)  |
| Search by value                        | O(n) | O(1)  |
| Insert at head                         | O(1) | O(1)  |
| Insert at tail (with tail pointer)     | O(1) | O(1)  |
| Insert at tail (no tail pointer)       | O(n) | O(1)  |
| Insert/delete after a **held** node    | O(1) | O(1)  |
| Delete a held node (singly, no prev)\* | O(n) | O(1)  |
| Delete a held node (doubly)            | O(1) | O(1)  |

\*In a **singly** linked list, deleting a node you hold still needs its **predecessor** to rewire `prev.next` — so you walk from the head to find it, O(n). A **doubly** linked list stores `prev`, making it true O(1). This asymmetry is the single most common interview trap on this structure.

## Complexity summary

| Operation          | Best                     | Average | Worst |
| ------------------ | ------------------------ | ------- | ----- |
| Access by position | O(1) (head)              | O(n)    | O(n)  |
| Search by value    | O(1) (head)              | O(n)    | O(n)  |
| Insert at head     | O(1)                     | O(1)    | O(1)  |
| Insert at tail     | O(1) (with tail ptr)     | O(n)    | O(n)  |
| Delete held node   | O(1) (doubly / has prev) | O(n)    | O(n)  |

**Space:** O(n) for n nodes, **plus a per-node pointer overhead** — one reference (8 bytes on 64-bit) per node for a singly list, two for a doubly list, on top of the value and the allocator's per-object header. For small values this overhead can dominate: a list of 1-byte chars can spend 16–24 bytes per node. The array's O(n) has no such per-element tax.

## When to use / when not

**Reach for a linked list when:**

- You **splice constantly at known positions** — insert/delete in the middle or front without paying the array's O(n) shift, once you hold the node.
- You need a structure that **grows one node at a time with no reallocation** — appends never trigger a copy-the-whole-thing resize (the array's amortized-O(1) hides occasional O(n) spikes; a list has none).
- You're building a **queue, deque, or LRU cache** where O(1) removal from an arbitrary held position is the core requirement.

**Reach for something else when:**

- **You index by position** ("give me the i-th element") → an [array](./array.md) / [dynamic array](./dynamic-array.md) is O(1); the list is O(n) and cache-hostile. This is the default; most "list" needs are really array needs.
- **You iterate hot loops over the data** → the array wins on cache locality by a large constant factor even where Big-O is equal (see [Memory layout](#memory-layout)).
- **You need binary search / sorted random access** → impossible on a list (no O(1) mid), trivial on a sorted array.

Rule of thumb: **lists win on structural change at a held node, lose on access and cache.** In practice the dynamic array beats the linked list far more often than juniors expect — reach for a list when the problem _names_ O(1) middle splicing, not by default.

Real-world: the linked list is the backbone of **LRU caches** (a hashmap of keys → nodes in a doubly linked list, evicting from the tail in O(1)), the **free lists** allocators use to thread unused memory blocks, and adjacency lists in graphs ([Graph](./graph.md)); the OS scheduler's run queues and many intrusive kernel data structures are doubly linked lists for exactly the O(1)-unlink property.

## Comparison

How the linked list stacks up against the structures you'd weigh it against in an interview:

| Structure       | Access by position | Search        | Insert/delete (held node) | Insert/delete (end)  | Memory                  | Pick it when…                           |
| --------------- | ------------------ | ------------- | ------------------------- | -------------------- | ----------------------- | --------------------------------------- |
| **Singly list** | O(n)               | O(n)          | O(1)\* (needs prev)       | O(1) head / tail-ptr | scattered, +1 ptr/node  | front splicing, stack, simple queue     |
| **Doubly list** | O(n)               | O(n)          | **O(1)**                  | **O(1)** both ends   | scattered, +2 ptr/node  | deque, LRU, O(1) unlink of a held node  |
| Array (fixed)   | **O(1)**           | O(n)/O(log n) | O(n) (shift)              | O(n) (no grow)       | contiguous, tight       | random access, cache-tight iteration    |
| Dynamic array   | **O(1)**           | O(n)/O(log n) | O(n)                      | **O(1)** amortized   | contiguous + ~2× slack  | default sequence; size unknown up front |
| Hash table      | n/a (by key)       | **O(1)** avg  | O(1) avg                  | O(1) avg             | scattered + load factor | key→value lookup, membership            |

\*Singly: O(1) only with the predecessor in hand; finding it from the head is O(n). The list's column is the only one with **O(1) splice at a held node and no resize spikes** — that's its identity. Every rival buys cheaper access by giving that up.

## Variants

- **Singly linked list** — one `next` pointer per node. Minimal memory; can only walk forward; deleting a held node needs its predecessor. The default and the subject of most of this page.
- **Doubly linked list** — each node also stores `prev`. Doubles the pointer overhead but buys **O(1) deletion of any held node** and backward traversal — the variant behind deques and LRU caches.
- **Circular linked list** — the tail's `next` points back to the head (singly) or head/tail link both ways (doubly). No null terminator; useful for round-robin scheduling and ring buffers built from nodes. A list-based cousin of the [circular buffer](./circular-buffer.md).
- **Sentinel / dummy-node list** — a permanent placeholder head (and sometimes tail) node that is never deleted, so the "list is empty" and "operate on the head" edge cases vanish. A structural shape; the technique that wields it lives in [CP-primitives](#cp-primitives).
- **XOR linked list** — a doubly list storing `prev XOR next` in one field instead of two pointers, recovering each from the other. A memory-saving party trick; brittle (breaks GC, debugging), rarely used in practice — name it, don't reach for it.
- **Skip list** — a tower of linked lists with express lanes giving O(log n) search/insert, a probabilistic alternative to a balanced BST. <!-- skip-list / balanced-bst not yet written --> A structurally distinct cousin; mention it when asked "how do you make a list searchable in O(log n)".

## Memory layout

This is the heart of why linked lists behave the way they do — and why they often lose to arrays in practice despite matching or beating them on paper.

**Contiguous vs pointer-based.** An [array](./array.md) stores values **inline** in one block; a linked list **scatters** each value into its own heap-allocated node, threaded by pointers:

```
array (contiguous):    [ 42 | 17 | 99 |  8 ]          one block, values inline

linked list (pointer): [42|•]─┐
                              └▶[17|•]─┐
                                       └▶[99|•]─┐
                                                └▶[8|/]   each node a separate allocation
```

The array pays **zero** per-element overhead. The singly list pays one pointer per node (8 bytes on 64-bit) **plus** the allocator's per-object header (often another 8–16 bytes) **plus** the cost of a separate heap allocation per node. A doubly list pays two pointers. For small values this overhead routinely **2–3×'s** the memory footprint versus an array.

**Cache behavior — the silent killer.** CPUs fetch memory in **cache lines** (~64 bytes) and a prefetcher predicts sequential access. An array's adjacency means reading `arr[i]` pulls its neighbors into cache for free — iteration screams. A linked list's nodes sit at **arbitrary, scattered addresses**, so each `next` hop is a fresh memory location the prefetcher can't predict → a likely **cache miss** (~100× slower than a hit). The result: even for a workload where Big-O says the list should win (lots of middle inserts), the array frequently wins the wall-clock race because traversal-to-the-insert-point thrashes the cache. **This is the canonical "Big-O isn't the whole story" lesson, and a staff-level interviewer will probe it.**

**No bulk allocation, no resize spikes — the one memory win.** The flip side: a linked list never copies the whole structure. A dynamic array's amortized-O(1) append hides occasional O(n) resize events (allocate a 2× block, copy everything, free the old one), which transiently needs ~2× the memory and causes latency spikes. A linked list grows one independent node at a time — no copy, no spike, no transient double-footprint. For **latency-sensitive, append-heavy** workloads where a worst-case pause matters more than throughput, that smoothness can be the deciding factor.

## Implementation

A singly linked list with the operations that actually carry interview weight: `push_front`, `append` (with a tail pointer for O(1)), and `delete_value`. Pseudocode states the pointer-rewiring contract; Python is the idiomatic reference.

**Pseudocode (CLRS-style contract):**

```
LIST-PUSH-FRONT(L, x)
1   node = ALLOCATE-NODE()
2   node.val  = x
3   node.next = L.head          ▷ new node points at old first
4   L.head    = node            ▷ head now the new node
5   if L.tail == NIL            ▷ list was empty
6       L.tail = node

LIST-DELETE-VALUE(L, x)
1   prev = NIL
2   cur  = L.head
3   while cur ≠ NIL and cur.val ≠ x      ▷ walk to find x and its predecessor
4       prev = cur
5       cur  = cur.next
6   if cur == NIL
7       return                            ▷ not found
8   if prev == NIL
9       L.head = cur.next                 ▷ deleting the head
10  else
11      prev.next = cur.next              ▷ splice cur out
12  if cur == L.tail
13      L.tail = prev
```

**Python (reference — idiomatic):**

```python
from __future__ import annotations
from dataclasses import dataclass
from typing import Generic, Iterator, Optional, TypeVar

T = TypeVar("T")


@dataclass
class Node(Generic[T]):
    val: T
    next: Optional["Node[T]"] = None


class LinkedList(Generic[T]):
    """Singly linked list with a tail pointer for O(1) append."""

    def __init__(self) -> None:
        self.head: Optional[Node[T]] = None
        self.tail: Optional[Node[T]] = None

    def push_front(self, x: T) -> None:        # O(1)
        self.head = Node(x, self.head)
        if self.tail is None:                  # was empty
            self.tail = self.head

    def append(self, x: T) -> None:            # O(1) thanks to the tail pointer
        node = Node(x)
        if self.tail is None:
            self.head = self.tail = node
        else:
            self.tail.next = node
            self.tail = node

    def delete_value(self, x: T) -> bool:      # O(n): walk to find predecessor
        prev: Optional[Node[T]] = None
        cur = self.head
        while cur is not None and cur.val != x:
            prev, cur = cur, cur.next
        if cur is None:
            return False                        # not found
        if prev is None:
            self.head = cur.next                # deleting the head
        else:
            prev.next = cur.next                # splice out
        if cur is self.tail:
            self.tail = prev
        return True

    def __iter__(self) -> Iterator[T]:
        cur = self.head
        while cur is not None:
            yield cur.val
            cur = cur.next
```

**Contest velocity — usually you don't hand-roll a node class at all.** In a real contest, when you need a list's behavior you reach for `collections.deque` (a doubly-linked-list-backed deque in CPython) for O(1) appends/pops at both ends — never reimplement nodes under time pressure:

```python
from collections import deque

dq = deque([1, 2, 3])
dq.appendleft(0)     # O(1) front insert — the linked list's headline op
dq.pop()             # O(1) from the right
dq.popleft()         # O(1) from the left
dq.rotate(1)         # O(k) circular shift
```

Hand-rolled nodes are for the rare problem that _requires_ holding and splicing specific nodes (LRU cache, in-place reversal) — exactly the interview problems below.

## CP-primitives

Three pointer techniques that turn linked-list problems from fiddly edge-case minefields into clean O(n)/O(1) solutions.

### Dummy (sentinel) head — kill the head-edge-case

Half of all linked-list bugs are the special case "what if I'm modifying the head?". A **dummy node** that sits permanently before the real head makes the head no longer special — every node now has a predecessor, so one code path handles all positions. Return `dummy.next` at the end.

```python
dummy = Node(0, head)        # dummy.next is the real head
prev = dummy
# ... splice freely; deleting head is now just prev.next = cur.next ...
return dummy.next            # the (possibly new) head
```

**Why for CP:** collapses the "insert/delete at head" branch into the general case — fewer branches, fewer off-by-one bugs, faster to code correctly under time pressure.

### In-place reversal of pointers

Reverse a list (or a sub-segment) by walking once and flipping each `next` to point backward, carrying three pointers (`prev`, `cur`, `nxt`). O(n) time, **O(1) space** — no new nodes.

```
prev=/  cur=[1]→[2]→[3]→/
step:   save nxt = cur.next; cur.next = prev; prev = cur; cur = nxt
result: /←[1]←[2]←[3]=prev   →   new head is prev
```

**Why for CP:** the building block for "reverse in groups of k", palindrome-check on a list, and reorder-list — all O(1) space because you rewire instead of copying.

### Fast/slow pointers — cycle, middle, k-from-end

Two pointers advancing at different rates extract positional facts in **one pass, O(1) space**: a fast pointer at 2× speed meets a slow one inside any cycle (Floyd's tortoise and hare); when fast reaches the end, slow sits at the **middle**; starting fast `k` nodes ahead, when fast hits the end slow is **k-from-the-end**. Full treatment in the [Fast & Slow Pointers](../patterns/fast-slow-pointers.md) pattern.

```python
slow = fast = head
while fast and fast.next:
    slow, fast = slow.next, fast.next.next
    if slow is fast:          # pointers met → there is a cycle
        break
# if loop ended without meeting, no cycle; slow is the middle
```

**Why for CP:** replaces a two-pass or O(n)-extra-space approach (counting length, or a visited set) with a single O(1)-space sweep.

## Gotchas / edge cases

- **Losing the rest of the list (the classic).** When rewiring, if you overwrite `cur.next` _before_ saving it, everything after is unreachable and garbage-collected. Always `nxt = cur.next` _first_, then reassign. This is the #1 linked-list bug in interviews.
- **The head is special — until you use a dummy node.** Inserting/deleting at the head touches `head` itself, not a `prev.next`; forgetting this branch corrupts the list or crashes on the empty case. The [dummy-head trick](#dummy-sentinel-head--kill-the-head-edge-case) erases the whole class of bug — reach for it reflexively.
- **Singly delete needs the predecessor — O(n), not O(1).** "Delete this node I'm pointing at" is _not_ O(1) in a singly list; you need `prev` to rewire `prev.next`, so you walk from the head. The famous exception: if you're allowed to delete a **non-tail** node, copy the next node's value into the current node and unlink the _next_ node instead — O(1), but it doesn't work on the tail.
- **Null / empty-list dereference.** `cur.next` when `cur` is null throws. Every traversal loop guards `while cur is not None`, and two-pointer loops must guard **both** `fast and fast.next` before the double hop — dropping the second check throws on even-length lists.
- **Cycle turns traversal into an infinite loop.** A `while cur` loop never terminates if the list has a cycle. If cycles are possible, detect with fast/slow before any length-counting or full traversal — never assume a `next` chain ends.
- **Pointer overhead and cache cost (the senior trap).** Reaching for a linked list "because inserts are O(1)" while the actual hot path is iteration is a classic mistake — the per-node allocation, pointer overhead, and cache misses ([Memory layout](#memory-layout)) routinely make a dynamic array faster end-to-end despite the worse Big-O for inserts. Justify a list by a _named_ O(1)-splice requirement, not reflex.

## Practice problems

Five staples, each a **distinct** technique on a linked list — no two solved the same way.

### 1. Reverse a Linked List — _iterative pointer rewiring_

**Problem.** Given the head of a singly linked list, reverse it and return the new head. E.g. `1→2→3→4→5` becomes `5→4→3→2→1`. Do it in O(1) extra space.

**Approach.** Walk once with three pointers — `prev`, `cur`, `nxt`. At each step, save `nxt = cur.next` (or you lose the tail), point `cur.next` back at `prev`, then advance both. When `cur` is null, `prev` is the new head. The whole list is reversed by flipping links in place, no new nodes — the in-place-reversal CP-primitive in its purest form.

```python
def reverse_list(head: Optional[Node]) -> Optional[Node]:
    prev, cur = None, head
    while cur is not None:
        nxt = cur.next        # save before overwriting — the cardinal rule
        cur.next = prev       # flip the link
        prev, cur = cur, nxt  # advance
    return prev               # new head
```

**Complexity.** O(n) time, O(1) space.

### 2. Linked List Cycle II — _Floyd's tortoise and hare_

**Problem.** Given the head of a list, return the node where a cycle begins, or null if there's no cycle. Solve in O(1) extra space (no visited set). E.g. a list whose tail links back to the 2nd node returns that 2nd node.

**Approach.** Phase 1: fast (2×) and slow (1×) pointers; if they meet, there's a cycle. Phase 2 (the insight): reset one pointer to the head and advance both at 1× — they meet exactly at the cycle's entrance. (The math: the distance from head to entrance equals the distance from the meeting point to the entrance, modulo the cycle length.) Pure fast/slow, no extra memory — beats the O(n)-space hashset.

```python
def detect_cycle(head: Optional[Node]) -> Optional[Node]:
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
        if slow is fast:               # cycle confirmed
            p = head
            while p is not slow:       # phase 2: find the entrance
                p, slow = p.next, slow.next
            return p
    return None                         # no cycle
```

**Complexity.** O(n) time, O(1) space. Pattern: [Fast & Slow Pointers](../patterns/fast-slow-pointers.md).

### 3. Merge Two Sorted Lists — _dummy head + splice_

**Problem.** Given the heads of two sorted singly linked lists, splice them into one sorted list and return its head. E.g. `1→2→4` and `1→3→4` → `1→1→2→3→4→4`. Reuse the existing nodes (no new allocations).

**Approach.** A **dummy head** removes the "which list's first node becomes the overall head?" edge case. Keep a `tail` pointer; repeatedly attach whichever of the two current nodes is smaller, advance that list. When one list runs out, attach the rest of the other (already sorted). Return `dummy.next`. The dummy-head CP-primitive applied to a two-way merge — exactly merge-sort's merge step on lists.

```python
def merge_two_lists(a: Optional[Node], b: Optional[Node]) -> Optional[Node]:
    dummy = Node(0)
    tail = dummy
    while a and b:
        if a.val <= b.val:
            tail.next, a = a, a.next
        else:
            tail.next, b = b, b.next
        tail = tail.next
    tail.next = a or b          # attach whichever remains
    return dummy.next
```

**Complexity.** O(n + m) time, O(1) extra space.

### 4. Remove Nth Node From End — _two pointers, one pass_

**Problem.** Given a list head and an integer `n`, remove the n-th node from the end and return the head. E.g. `1→2→3→4→5`, `n=2` → `1→2→3→5`. Do it in one pass.

**Approach.** Advance a `fast` pointer `n` nodes ahead, then move `fast` and `slow` together until `fast` hits the end — now `slow` sits just before the target (k-from-end via the gap trick). A **dummy head** handles the case where the node to remove _is_ the head. Splice `slow.next` out. One pass, no length pre-count.

```python
def remove_nth_from_end(head: Optional[Node], n: int) -> Optional[Node]:
    dummy = Node(0, head)
    fast = slow = dummy
    for _ in range(n):           # open a gap of n
        fast = fast.next
    while fast.next:             # move together until fast is last
        fast, slow = fast.next, slow.next
    slow.next = slow.next.next   # splice out the target
    return dummy.next
```

**Complexity.** O(n) time, O(1) space.

### 5. LRU Cache — _hashmap + doubly linked list_

**Problem.** Design a cache with `get(key)` and `put(key, value)`, both O(1), that evicts the **least-recently-used** entry when it exceeds a fixed capacity. A `get` or `put` counts as a use.

**Approach.** The reason a linked list shows up in system design: a **hashmap** (key → node) gives O(1) lookup, and a **doubly** linked list orders nodes by recency (most-recent at the head, LRU at the tail). On access, unlink the node and move it to the head — O(1) only because it's _doubly_ linked (you have `prev`). On overflow, evict the tail. Hashmap for lookup + doubly list for O(1) recency reordering is the canonical pairing. (Python shortcut: `collections.OrderedDict` does this internally with `move_to_end`.)

```python
from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity: int) -> None:
        self.cap = capacity
        self.cache: OrderedDict[int, int] = OrderedDict()

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key)          # mark most-recently-used
        return self.cache[key]

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.cap:
            self.cache.popitem(last=False)   # evict LRU (the front)
```

**Complexity.** O(1) average per `get`/`put`, O(capacity) space.
