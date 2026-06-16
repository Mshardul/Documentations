# Dynamic Array

## Prerequisites

- [Array](./array.md) [Must read] - a dynamic array is a fixed array underneath; you need the contiguous-memory + O(1) indexing model first.
- **Big-O Notation** [Must read] - the whole point of this page is _amortized_ O(1), which you can't read without Big-O — especially the amortized-vs-worst-case distinction. <!-- U9: not-yet-written target — wire to `algorithms/big-o-notation.md` (bracket-link form) once that page exists. -->

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
  - [Growable buffer as a stack — `append` / `pop` = O(1)](#growable-buffer-as-a-stack--append--pop--o1)
  - [Sorted dynamic array + binary insertion — `bisect.insort`](#sorted-dynamic-array--binary-insertion--bisectinsort)
  - [Growable result buffer — build output in one O(n) pass](#growable-result-buffer--build-output-in-one-on-pass)
- [Gotchas / edge cases](#gotchas--edge-cases)
  - [1. Insert Delete GetRandom O(1) — _swap-with-last + index map_](#1-insert-delete-getrandom-o1--swap-with-last--index-map)
  - [2. Min Stack — _parallel auxiliary buffer_](#2-min-stack--parallel-auxiliary-buffer)
  - [3. Implement a Resizable Array — _the doubling resize itself_](#3-implement-a-resizable-array--the-doubling-resize-itself)
  - [4. Implement Queue using Stacks — _amortized analysis across two buffers_](#4-implement-queue-using-stacks--amortized-analysis-across-two-buffers)

## What it is

A **dynamic array** is a growable array: a fixed-size array underneath, wrapped in logic that allocates a bigger block and copies everything over when it fills. It gives you array-speed indexing (O(1)) plus the ability to append without knowing the size in advance.

Mental model: **a parking lot that paves itself bigger when it's full.** You keep parking cars; most of the time there's a free spot and parking is instant. Occasionally the lot is full, so you pave a lot twice as big, tow every car over, and carry on. That one expensive move is rare enough that _parking-on-average_ is still cheap — that's amortization.

> **Takeaway (say this out loud):** "A dynamic array is a fixed array that doubles when full — append is amortized O(1) because doubling makes the total copy work across all resizes sum to ~2n, even though any single resize is O(n)."

## How it works

A dynamic array tracks two numbers: **size** (how many elements are in use) and **capacity** (how many the current block can hold). `size ≤ capacity` always.

- **Append with room** (`size < capacity`): drop the element at `data[size]`, bump `size`. O(1).
- **Append when full** (`size == capacity`): allocate a new block (typically `2 × capacity`), copy all `size` elements over, free the old block, _then_ append. O(n) for this one call.

```
capacity 4, size 4 — FULL.  append(99):

old block:  [ 42 | 17 | 99 |  8 ]                       size=4 cap=4
                  │ allocate 2× = cap 8, copy over │
new block:  [ 42 | 17 | 99 |  8 |    |    |    |    ]   size=4 cap=8
                  │ now there is room — place 99    │
            [ 42 | 17 | 99 |  8 | 99 |    |    |    ]   size=5 cap=8
```

The next 3 appends are O(1) (room to spare). The 8th append triggers another doubling to 16, and so on. Resizes get rarer as the array grows — that's the key to why it averages out.

## Operations

| Operation                    | Time           | Space |
| ---------------------------- | -------------- | ----- |
| Access by index `arr[i]`     | O(1)           | O(1)  |
| Update by index `arr[i] = x` | O(1)           | O(1)  |
| Append (amortized)           | O(1) amortized | O(1)  |
| Append (single worst case)   | O(n)           | O(n)  |
| Pop from end                 | O(1) amortized | O(1)  |
| Insert at index `i`          | O(n)           | O(1)  |
| Delete at index `i`          | O(n)           | O(1)  |
| Search (unsorted, linear)    | O(n)           | O(1)  |

## Complexity summary

| Operation       | Best                 | Average        | Worst                         |
| --------------- | -------------------- | -------------- | ----------------------------- |
| Access by index | O(1)                 | O(1)           | O(1)                          |
| Append          | O(1) (room to spare) | O(1) amortized | O(n) (the resize-and-copy)    |
| Pop from end    | O(1)                 | O(1) amortized | O(n) (if shrinking below 1/4) |
| Insert at index | O(1) (at end, room)  | O(n)           | O(n) (at front, or + resize)  |
| Delete at index | O(1) (at end)        | O(n)           | O(n) (at front)               |

**Space:** O(n) elements, but actual footprint is O(capacity). Because capacity can be up to 2× the size right after a doubling, a dynamic array wastes up to ~50% memory in the worst case — the time-for-space trade behind amortized append.

## When to use / when not

**Reach for a dynamic array when:**

- You need indexed access **and** don't know the final size up front — the default "list" in nearly every language.
- Workload is append-at-end and read-by-index (collecting results, building a buffer, stacks).

**Reach for something else when:**

- **Worst-case latency matters** (real-time, low-latency systems) → the occasional O(n) resize is a latency spike. A [Circular Buffer](./circular-buffer.md) with fixed capacity gives true O(1) with no resize, or pre-size the array to a known bound.
- **Heavy front/middle insertion** → still O(n) here, same as a plain array; a **linked list** does O(1) splices once you hold the node. <!-- linked-list.md not yet written -->
- **Memory is tight** → the up-to-2× over-allocation can hurt; a fixed array or pre-sized block avoids the slack.

Rule of thumb: **dynamic array is the right default; reach past it only when you need worst-case O(1) appends or can't afford the over-allocation.**

Real-world: this _is_ the default list type in nearly every language — Python `list`, Java `ArrayList`, C++ `std::vector`, Go slices, JS arrays — and the backing store under stacks, growable buffers, and most "collect results then process" code.

## Comparison

Against the structures you'd weigh it against when "I need a growable sequence" comes up:

| Structure                               | Access by index | Append (end)       | Insert/delete (middle/front) | Memory                 | Worst-case append        | Pick it when…                                    |
| --------------------------------------- | --------------- | ------------------ | ---------------------------- | ---------------------- | ------------------------ | ------------------------------------------------ |
| **Dynamic array**                       | **O(1)**        | **O(1)** amortized | O(n) (shift)                 | contiguous + ~2× slack | O(n) (resize)            | growable sequence, random access, default choice |
| Fixed [array](./array.md)               | O(1)            | n/a (can't grow)   | O(n)                         | contiguous, exact      | n/a                      | size known up front, no slack tolerable          |
| Linked list                             | O(n)            | O(1)               | **O(1)** (with node ref)     | scattered, +ptr/node   | **O(1)** (no resize)     | heavy splicing, no random access, hard real-time |
| [Circular buffer](./circular-buffer.md) | O(1)            | **O(1)** true      | n/a (FIFO-shaped)            | contiguous, fixed      | **O(1)** (never resizes) | fixed-capacity FIFO, bounded latency             |
| Deque (`collections.deque`)             | O(n)            | O(1) both ends     | O(n) middle                  | block-linked           | O(1)                     | push/pop at _both_ ends                          |

The dynamic array is the only row giving **O(1) random access AND amortized-O(1) append** — that combination is why it's the default. Its weakness is the lone column where it loses: worst-case append spikes to O(n) on resize.

## Variants

- **Growth factor is a time/space dial.** Doubling isn't a law — _any_ factor `> 1` preserves amortized O(1); what changes is the constant, and it's a direct **memory-vs-time trade**:

  - **Larger factor (2×)** → resizes are rarer, so fewer total copies (**less time**), but right after a grow up to ~50% of the block is unused slack (**more wasted memory**).
  - **Smaller factor (1.5×)** → ~33% worst-case slack (**less memory**), but resizes happen more often, so more total copy work (**more time**).

  Real libraries sit at different points on this dial: C++ `std::vector` and Java `ArrayList` use **1.5×**, Python `list` grows by **~1.125** after an initial ramp, many older `vector`s used **2×**. A factor of exactly 1 (fixed increment, `+k`) breaks amortization entirely → O(n) per append.

  **Why so many libraries chose 1.5× over 2× — allocator reuse (golden-ratio bonus).** With **2×**, the sum of all previously freed blocks is always _smaller_ than the next request (`1 + 2 + 4 = 7 < 8`), so the allocator can never reuse freed space in place — it must grab fresh memory, fragmenting the heap. For any growth factor below the **golden ratio φ ≈ 1.618**, the freed blocks eventually coalesce to satisfy a future grow, letting memory be reused. 1.5× sits just under φ — that, not the copy count, is the real reason it's the common default.

- **Shrinking dynamic array.** Some implementations halve capacity when size drops below 1/4 (not 1/2 — that hysteresis avoids thrashing on alternating push/pop at the boundary).
- **Geometric vs `realloc`.** In C, `realloc` may extend the block in place if adjacent memory is free, dodging the copy entirely — an optimization the abstract model ignores.

## Memory layout

**Contiguous, like a plain array — that's the whole appeal.** Elements sit inline in one block, so indexing is still `base + i × element_size` and iteration is still cache-friendly. The dynamic array adds only a thin header (`size`, `capacity`, pointer-to-block); the _data_ layout is identical to a fixed array.

```
DynamicArray header           backing block (capacity 8)
+--------+----------+         +----+----+----+----+----+----+----+----+
| size=5 | cap=8    |  data──▶| 42 | 17 | 99 |  8 | 23 |    |    |    |
+--------+----------+         +----+----+----+----+----+----+----+----+
                               └──────── in use ──────┘ └─── slack ──┘
```

**Cache behavior.** Same as a plain array — adjacent elements share cache lines, sequential scans are fast. The slack at the end costs memory but not access speed.

**Resize cost (the doubling argument — the headline result).** Starting from capacity 1 and appending n elements, resizes happen at sizes 1, 2, 4, 8, …, up to n. The copy work at each resize equals the size at that moment, so total copying across all n appends is:

```
1 + 2 + 4 + 8 + … + n  =  2n − 1  ≈  2n     (geometric series)
```

Total work for n appends is ~2n element-moves → **O(n) total → O(1) amortized per append.** Contrast a fixed-increment growth (`+1` each time): resizes at every size, total work `1 + 2 + … + n = n(n+1)/2 ≈ n²/2` → O(n) per append. **The geometric growth factor is exactly what collapses the cost.**

This is _amortized_, not _average-case-over-random-inputs_: it's a worst-case guarantee that any sequence of n appends costs O(n) total, even though one individual append can spike to O(n).

## Implementation

Definition + the resize-driven `append`, the operation that defines this structure.

**Pseudocode (CLRS-style contract):**

```
DYNAMIC-ARRAY-APPEND(A, x)
1   if A.size == A.capacity                      ▷ full — must grow
2       new_cap = max(1, GROWTH × A.capacity)    ▷ GROWTH > 1, e.g. 2
3       B = ALLOCATE-BLOCK(new_cap)
4       for i = 0 to A.size − 1                   ▷ O(size) copy — the amortized cost
5           B[i] = A.data[i]
6       FREE-BLOCK(A.data)
7       A.data = B
8       A.capacity = new_cap
9   A.data[A.size] = x                            ▷ room guaranteed now
10  A.size = A.size + 1

DYNAMIC-ARRAY-POP(A)
1   if A.size == 0
2       error "pop from empty array"
3   A.size = A.size − 1
4   x = A.data[A.size]
5   if A.size > 0 and A.size ≤ A.capacity / 4     ▷ shrink at 1/4, not 1/2
6       RESIZE(A, A.capacity / 2)
7   return x
```

**Python (reference — idiomatic):**

```python
from typing import TypeVar, Generic, Iterator

T = TypeVar("T")

_GROWTH = 2  # doubling → amortized O(1) append


class DynamicArray(Generic[T]):
    """A growable array over a fixed-capacity backing list."""

    def __init__(self) -> None:
        self._size: int = 0
        self._capacity: int = 1
        self._data: list[T | None] = [None] * self._capacity

    def __len__(self) -> int:
        return self._size

    def __getitem__(self, i: int) -> T:
        if not 0 <= i < self._size:
            raise IndexError(f"index {i} out of bounds for size {self._size}")
        return self._data[i]  # type: ignore[return-value]  # O(1)

    def append(self, x: T) -> None:
        if self._size == self._capacity:
            self._resize(_GROWTH * self._capacity)  # the O(n) step, rare
        self._data[self._size] = x
        self._size += 1

    def pop(self) -> T:
        if self._size == 0:
            raise IndexError("pop from empty array")
        self._size -= 1
        x = self._data[self._size]
        self._data[self._size] = None  # release reference for GC
        if 0 < self._size <= self._capacity // 4:
            self._resize(self._capacity // 2)  # shrink at 1/4 to avoid thrashing
        return x  # type: ignore[return-value]

    def _resize(self, new_capacity: int) -> None:
        new_capacity = max(1, new_capacity)
        bigger: list[T | None] = [None] * new_capacity
        for i, value in enumerate(self._data[: self._size]):
            bigger[i] = value
        self._data = bigger
        self._capacity = new_capacity

    def __iter__(self) -> Iterator[T]:
        return (self._data[i] for i in range(self._size))  # type: ignore[misc]
```

## CP-primitives

The dynamic array is less a _holder_ of primitives (that's the fixed [array](./array.md#cp-primitives)) and more the **workhorse container** the primitives run on. Two contest uses earn their place:

### Growable buffer as a stack — `append` / `pop` = O(1)

A dynamic array's amortized-O(1) `append` and O(1) `pop()`-from-end _is_ a stack — no separate structure needed. This is the backbone of **monotonic-stack** problems (next-greater-element, largest-rectangle-in-histogram), DFS without recursion, and expression parsing. In Python you just use a `list`:

```python
stack: list[int] = []
for x in arr:
    while stack and stack[-1] < x:   # monotonic pop
        stack.pop()                  # O(1)
    stack.append(x)                  # amortized O(1)
```

**Why for CP:** the language's built-in list gives you a contest-speed stack for free — no class, no imports — and its amortized append is exactly the cost model these patterns assume.

### Sorted dynamic array + binary insertion — `bisect.insort`

Keep a dynamic array _sorted_ and insert with `bisect.insort` (binary-search the position, then shift). Lookups and range queries are then O(log n); insertion is O(n) (the shift), which is fine when reads dominate writes.

```python
import bisect

s: list[int] = []
bisect.insort(s, x)          # O(log n) to find slot, O(n) to shift
i = bisect.bisect_left(s, q) # O(log n) membership / lower-bound
```

**Why for CP:** for read-heavy "keep it ordered, query by rank/range" tasks, a sorted dynamic array beats hauling in a balanced BST — and `bisect` is contest-velocity. (When writes also dominate, reach for a real ordered structure instead.)

### Growable result buffer — build output in one O(n) pass

Most array algorithms (two pointers, sliding window, in-place compaction) produce a result of _unknown length up front_. Amortized-O(1) `append` lets you stream results into a growing buffer in a single pass — no pre-counting, no second pass to size a fixed array. The whole pass stays O(n) because the appends amortize away.

```python
def compact_evens(arr: list[int]) -> list[int]:
    out: list[int] = []           # grows as needed, amortized O(1) per append
    for x in arr:                 # one pass, total O(n)
        if x % 2 == 0:
            out.append(x)
    return out
```

**Why for CP:** "filter / transform / collect in one pass" is the default contest idiom precisely because the dynamic array makes the unknown-size output free. Without amortized append you'd either pre-scan to count or risk an O(n) resize per element.

## Gotchas / edge cases

- **"Append is O(1)" is amortized, not worst-case.** If the interviewer asks for _worst-case per operation_, a single append is O(n) (the resize). In latency-sensitive contexts this matters — say "amortized O(1), worst-case O(n) on the resize."
- **Resize transiently doubles memory.** During the copy, both old and new blocks are live, so peak memory is ~1.5–2× the data. A dynamic array near the memory ceiling can throw `OutOfMemoryError` mid-resize even though the final size fits. Pre-size to the known capacity to avoid this.
- **Shrink at 1/4, not 1/2.** A naive "halve when half-empty" thrashes: push/pop right at the 1/2 boundary forces O(n) resize every operation, making the amortization collapse. Shrinking at 1/4 leaves hysteresis so each resize is "paid for" by enough cheap operations.
- **Insertion in the middle is still O(n).** Growable ≠ cheap-to-splice. Inserting at index i shifts everything after it, same as a plain array. Dynamic only buys cheap _append_.
- **Iterator invalidation.** Appending during iteration may trigger a resize that reallocates the backing block — references/iterators into the old block dangle (C++ `vector`) or raise (`RuntimeError` in Python if you mutate a `list` mid-loop). Snapshot or index explicitly.

Four problems, each exercising a **distinct** dynamic-array behavior — the resize mechanism, O(1) deletion, parallel auxiliary state, and amortized analysis across two buffers.

### 1. Insert Delete GetRandom O(1) — _swap-with-last + index map_

**Problem.** Design a set supporting `insert(val)`, `remove(val)`, and `getRandom()` — returning a uniformly random current element — **all in average O(1)**. Values are distinct.

**Approach.** A dynamic array gives O(1) random access (pick `arr[randint(0, n-1)]`) and O(1) append, but deleting an arbitrary value looks O(n) because of the shift. The trick: keep a `{value: index}` map alongside the array, and to delete, **swap the target with the last element**, then `pop()` the end — O(1), no shift. Update the moved element's index in the map. The array stays gap-free so `getRandom` is a single index.

```python
import random

class RandomizedSet:
    def __init__(self) -> None:
        self._vals: list[int] = []
        self._pos: dict[int, int] = {}      # value -> its index in _vals

    def insert(self, val: int) -> bool:
        if val in self._pos:
            return False
        self._pos[val] = len(self._vals)
        self._vals.append(val)
        return True

    def remove(self, val: int) -> bool:
        if val not in self._pos:
            return False
        i = self._pos[val]
        last = self._vals[-1]
        self._vals[i] = last                # move last into the hole
        self._pos[last] = i
        self._vals.pop()                    # O(1) — drop the end
        del self._pos[val]
        return True

    def getRandom(self) -> int:
        return random.choice(self._vals)    # O(1) on a gap-free array
```

**Complexity.** O(1) average per operation, O(n) space.

### 2. Min Stack — _parallel auxiliary buffer_

**Problem.** Design a stack supporting `push`, `pop`, `top`, and `getMin` (the minimum element currently in the stack) — **all in O(1)**.

**Approach.** The main stack is a dynamic array (`append`/`pop`-from-end). `getMin` can't scan (that's O(n)), so maintain a **second growable buffer** holding the running minimum _at each depth_: when you push `x`, push `min(x, current_min)` onto the aux buffer. Both stacks grow and shrink in lockstep, so the min for the current depth is always the aux top.

```python
class MinStack:
    def __init__(self) -> None:
        self._stack: list[int] = []
        self._mins: list[int] = []          # _mins[i] = min of _stack[0..i]

    def push(self, x: int) -> None:
        self._stack.append(x)
        self._mins.append(x if not self._mins else min(x, self._mins[-1]))

    def pop(self) -> None:
        self._stack.pop()
        self._mins.pop()

    def top(self) -> int:
        return self._stack[-1]

    def getMin(self) -> int:
        return self._mins[-1]
```

**Complexity.** O(1) per operation, O(n) space.

### 3. Implement a Resizable Array — _the doubling resize itself_

**Problem.** Implement a growable array from a fixed backing block: `get(i)`, `append(x)`, `pop()`, with `append` running in **amortized O(1)**. You may not use the language's built-in growable list.

**Approach.** This is the page's [Implementation](#implementation): track `size` and `capacity`; on a full `append`, allocate a block of `2 × capacity`, copy, and proceed. The whole point is articulating _why_ doubling makes append amortized O(1) — the geometric copy series sums to ~2n (see [Memory layout](#memory-layout)). The interviewer is testing whether you can state the amortized argument, not just write the copy loop.

```python
class DynamicArray:
    def __init__(self) -> None:
        self._size = 0
        self._cap = 1
        self._data: list[int | None] = [None]

    def append(self, x: int) -> None:
        if self._size == self._cap:                 # full → grow
            self._cap *= 2
            bigger: list[int | None] = [None] * self._cap
            for i in range(self._size):
                bigger[i] = self._data[i]
            self._data = bigger
        self._data[self._size] = x
        self._size += 1
```

**Complexity.** `append` amortized O(1) (worst-case O(n) on a resize); `get`/`pop` O(1).

### 4. Implement Queue using Stacks — _amortized analysis across two buffers_

**Problem.** Implement a FIFO queue (`push`, `pop`, `peek`, `empty`) using only two stacks (two growable arrays with append/pop-from-end). Each operation must be **amortized O(1)**.

**Approach.** Keep an `in` stack and an `out` stack. `push` always appends to `in`. `pop`/`peek` take from `out`; when `out` is empty, **pour all of `in` into `out`** (reversing order, so the oldest ends up on top). Each element is moved between stacks at most twice (once in, once out) over its lifetime → the expensive pour is amortized away, giving O(1) average even though a single `pop` can be O(n). Same amortization shape as the array's own doubling.

```python
class MyQueue:
    def __init__(self) -> None:
        self._in: list[int] = []
        self._out: list[int] = []

    def push(self, x: int) -> None:
        self._in.append(x)

    def _shift(self) -> None:
        if not self._out:                   # only pour when out is empty
            while self._in:
                self._out.append(self._in.pop())

    def pop(self) -> int:
        self._shift()
        return self._out.pop()

    def peek(self) -> int:
        self._shift()
        return self._out[-1]

    def empty(self) -> bool:
        return not self._in and not self._out
```

**Complexity.** Amortized O(1) per operation (worst-case O(n) on the pour), O(n) space.
