# Queue

## Prerequisites

- **Big-O Notation** [Must read] - every core operation here is O(1); you need the cost model to see why the naive list-based version fails. <!-- U9: not-yet-written target — wire to `algorithms/big-o-notation.md` once that page exists. -->
- [Array](./array.md) [Must read] - a queue over a plain array has an O(n) dequeue trap; the [circular buffer](./circular-buffer.md) fixes it. You need the array's shift cost to see the trap.
- [Stack](./stack.md) [Should read] - the queue is the FIFO mirror of the stack's LIFO; learning them as a pair locks in when to use which.

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
  - [Deque — O(1) at both ends](#deque--o1-at-both-ends)
  - [Monotonic deque — sliding-window max/min](#monotonic-deque--sliding-window-maxmin)
  - [0/1-BFS with a deque](#01-bfs-with-a-deque)
- [Gotchas / edge cases](#gotchas--edge-cases)
- [Practice problems](#practice-problems)
  - [Implement Queue using Stacks](#1-implement-queue-using-stacks--amortized-transfer)
  - [Number of Recent Calls](#2-number-of-recent-calls--sliding-window-queue)
  - [Sliding Window Maximum](#3-sliding-window-maximum--monotonic-deque)
  - [Rotting Oranges](#4-rotting-oranges--multi-source-bfs)
  - [Design Circular Queue](#5-design-circular-queue--ring-buffer)

## What it is

A **queue** is a linear collection with one rule: **first in, first out (FIFO)** — you add at one end (the **back/rear**) and remove from the other (the **front**).

Mental model: **a line at a checkout.** People join at the back; the cashier serves from the front; the person who arrived first leaves first. No cutting, no serving from the middle. That single constraint — add at back, remove at front — is what makes a queue the natural fit for **fairness and order-preservation**: task scheduling, request buffering, and breadth-first exploration where you must finish the current "level" before the next.

> **Takeaway (say this out loud):** "A queue is FIFO — enqueue at the back, dequeue at the front in O(1). It's the structure behind BFS and any 'process in arrival order' problem."

## How it works

A queue exposes two core operations at **opposite ends**: **enqueue** (add at the back) and **dequeue** (remove and return from the front), plus **peek** at the front. The two-ended access is the difference from a [stack](./stack.md), and it's exactly what makes a naive array implementation tricky.

```
enqueue(3) enqueue(7) enqueue(2)      dequeue() → 3        front now 7
front                                  front
  │                                      │
  ▼                                      ▼
[ 3 | 7 | 2 ]                          [ 7 | 2 ]
          ▲                                    ▲
        back                                  back
```

**The naive trap:** put the front at index 0 of an array, and every `dequeue` must shift all remaining elements left by one — O(n). A queue that's O(n) per dequeue defeats the purpose. Two fixes give true O(1) both ends:

- **Circular buffer** — keep `front` and `back` as moving indices that wrap around a fixed array (`i % capacity`); nothing shifts. See [Circular Buffer](./circular-buffer.md) and [Memory layout](#memory-layout).
- **Doubly linked list** — enqueue at the tail, dequeue at the head; both O(1) with a head and tail pointer. This is what `collections.deque` uses.

The deep idea: a queue processes things in the order they arrived, which is exactly the order that yields **shortest-path / level-by-level** behavior in BFS. Swap a queue for a stack and breadth-first becomes depth-first — same algorithm skeleton, opposite frontier discipline.

## Operations

| Operation              | Time   | Space |
| ---------------------- | ------ | ----- |
| Enqueue (add back)     | O(1)\* | O(1)  |
| Dequeue (remove front) | O(1)   | O(1)  |
| Peek front             | O(1)   | O(1)  |
| Is empty               | O(1)   | O(1)  |
| Size                   | O(1)   | O(1)  |
| Search by value        | O(n)   | O(1)  |

\*O(1) with a circular buffer or linked list. A queue over a plain Python `list` with `list.pop(0)` makes dequeue **O(n)** — the classic mistake; use `collections.deque` (O(1) `popleft`) instead.

## Complexity summary

| Operation | Best | Average | Worst                                    |
| --------- | ---- | ------- | ---------------------------------------- |
| Enqueue   | O(1) | O(1)    | O(n) (array resize) / O(1) (ring + list) |
| Dequeue   | O(1) | O(1)    | O(1) (ring/list) / O(n) (naive `pop(0)`) |
| Peek      | O(1) | O(1)    | O(1)                                     |

**Space:** O(n) for n elements. A circular-buffer queue is fixed-capacity (or amortizes resize like a [dynamic array](./dynamic-array.md)); a linked-list queue carries one pointer per node. BFS's hidden space cost is the **frontier**: the queue can hold up to O(width) nodes — for a wide graph that's O(V), the real memory ceiling of BFS.

## When to use / when not

**Reach for a queue when:**

- You process in **arrival order / fairness** — task schedulers, print spoolers, request buffers, producer-consumer pipelines. First come, first served.
- You're doing **breadth-first search** — shortest path in an unweighted graph, level-order tree traversal, flood fill. The queue _is_ the BFS frontier.
- You need a **buffer between producer and consumer** running at different rates — a bounded queue smooths bursts.

**Reach for something else when:**

- **You need last-in-first-out** → a [stack](./stack.md). DFS, undo, and nesting want LIFO, not FIFO.
- **You need priority order, not arrival order** → a [priority queue / heap](./heap.md). "Process the most urgent next" is a heap; "process the oldest next" is a queue. Dijkstra needs the heap; unweighted BFS needs the plain queue.
- **You need both-end access or random access** → a [deque](#deque--o1-at-both-ends) (both ends) or an [array](./array.md) (by index).

Rule of thumb: **queue = FIFO = "process in the order they arrived."** If fairness or level-by-level order matters, it's a queue; if urgency matters, it's a heap; if recency matters, it's a stack.

Real-world: OS **run queues** and I/O scheduling, **message queues** ([Kafka, RabbitMQ](../../system-design/components/message-queues.md)) decoupling services, request buffers in web servers and load balancers, BFS in routing/network crawlers, and the event queue driving every UI framework's main loop.

## Comparison

How the queue stacks up against the structures you'd weigh it against:

| Structure             | Add            | Remove           | Order    | Access middle | Memory               | Pick it when…                   |
| --------------------- | -------------- | ---------------- | -------- | ------------- | -------------------- | ------------------------------- |
| **Queue**             | **O(1)** back  | **O(1)** front   | FIFO     | no            | ring / +ptr          | arrival order, BFS, buffering   |
| Stack                 | O(1) top       | O(1) top         | LIFO     | no            | array slack / +ptr   | nesting, undo, DFS              |
| Deque                 | O(1) both ends | O(1) both ends   | both     | no            | ring / +2 ptr        | sliding-window, both-end access |
| Priority queue (heap) | O(log n)       | O(log n) min/max | priority | no            | array, complete tree | "most urgent next", Dijkstra    |
| Array                 | O(1) end       | O(n) front       | by index | **O(1)**      | contiguous, tight    | random access, iteration        |

The queue's identity is **two-ended FIFO in O(1)** — add one side, remove the other. The deque generalizes it (both ends), the heap replaces arrival-order with priority, the stack flips the discipline to LIFO.

## Variants

- **Linear queue (circular buffer)** — fixed array with wrapping `front`/`back` indices; O(1) both ends, no shifting. The standard efficient implementation. Its own page: [Circular Buffer](./circular-buffer.md).
- **Linked-list queue** — head/tail pointers over a [linked list](./linked-list.md); O(1) enqueue/dequeue, grows without resize, at pointer-overhead cost. What `collections.deque` is built on.
- **Deque (double-ended queue)** — add/remove at **both** ends in O(1). A superset of both queue and stack; the basis for sliding-window tricks. Detailed in [CP-primitives](#deque--o1-at-both-ends).
- **Priority queue** — dequeues the min/max (by priority) rather than the oldest. Not really a queue under the hood — it's a [heap](./heap.md). Named here because interviews conflate them; the discipline differs (priority, not arrival).
- **Circular queue (ring buffer)** — fixed-capacity queue that overwrites or rejects when full; streaming windows, audio buffers, [rate limiters](../../system-design/components/rate-limiter.md). The [Design Circular Queue practice problem](#5-design-circular-queue--ring-buffer) builds one.
- **Monotonic deque** — a deque kept increasing/decreasing to answer sliding-window min/max in O(n). A discipline on a deque, not a new structure; see [CP-primitives](#monotonic-deque--sliding-window-maxmin).

## Memory layout

The queue's whole implementation difficulty is the **two-ended access**, and the layout choice is where it's resolved.

**The naive-array trap.** Front at index 0, back at the end: enqueue is O(1) (append), but dequeue must shift everything left to refill index 0 — **O(n) per dequeue**.

```
dequeue from a front-at-0 array:

before:  [ 3 | 7 | 2 | 9 ]      dequeue → return 3, then shift left:
after:   [ 7 | 2 | 9 |   ]      ← every element moved: O(n)
```

This is why `queue = []; queue.pop(0)` in Python is a performance bug — innocuous-looking, O(n) each call, O(n²) over a BFS.

**The circular-buffer fix (contiguous, wrapping).** Keep `front` and `back` as indices that advance and **wrap** with `% capacity`. Nothing shifts; both ends are O(1). The trade is a fixed capacity (or a resize when full).

```
ring buffer, capacity 6:    front=2, back=5

index:  0    1    2    3    4    5
      [   |   | 3 | 7 | 2 |   ]
                 ▲front        ▲back (next write slot)

dequeue → front advances to 3 (wraps via % 6 when it passes the end)
enqueue → write at back, back = (back+1) % 6
```

- **Cache-friendly** (contiguous), no per-element pointer overhead.
- Capacity is fixed; growing means allocate + copy (amortized O(1), [dynamic-array style](./dynamic-array.md#memory-layout)). Detail lives in [Circular Buffer](./circular-buffer.md).

**The linked-list fix (scattered, unbounded).** Head pointer = front, tail pointer = back. Enqueue appends a tail node, dequeue drops the head node — both O(1), grows without limit, no resize spike.

```
linked-list queue:   front(head)                       back(tail)
                       │                                   │
                       ▼                                   ▼
                     [3|•] ──▶ [7|•] ──▶ [2|/]
       dequeue = drop head ↑              ↑ enqueue = append after tail
```

- No resize spike, unbounded; **pointer overhead + cache misses** are the cost. This is `collections.deque`'s model (a doubly linked list of fixed-size blocks, blending both for locality).

**Which to pick:** `collections.deque` for almost everything in Python (O(1) both ends, no thought required); a circular buffer when capacity is bounded and cache locality matters (embedded, streaming); a linked-list queue when you need unbounded growth with no resize pause.

## Implementation

A queue over a circular buffer — the version that shows the wrapping arithmetic. Pseudocode states the contract; Python gives the from-scratch ring and the `deque` one-liner you'd actually use.

**Pseudocode (CLRS-style contract):**

```
ENQUEUE(Q, x)
1   if Q.size == Q.capacity
2       error "overflow"                  ▷ fixed-capacity ring is full
3   Q.data[Q.back] = x
4   Q.back = (Q.back + 1) mod Q.capacity  ▷ wrap around
5   Q.size = Q.size + 1

DEQUEUE(Q)
1   if Q.size == 0
2       error "underflow"
3   x = Q.data[Q.front]
4   Q.front = (Q.front + 1) mod Q.capacity
5   Q.size = Q.size − 1
6   return x
```

**Python (reference — idiomatic):**

```python
from typing import Generic, Optional, TypeVar

T = TypeVar("T")


class CircularQueue(Generic[T]):
    """Fixed-capacity FIFO queue over a ring buffer; O(1) both ends."""

    def __init__(self, capacity: int) -> None:
        self._data: list[Optional[T]] = [None] * capacity
        self._capacity = capacity
        self._front = 0
        self._size = 0

    def enqueue(self, x: T) -> None:
        if self._size == self._capacity:
            raise OverflowError("queue is full")
        back = (self._front + self._size) % self._capacity   # next write slot
        self._data[back] = x
        self._size += 1

    def dequeue(self) -> T:
        if self._size == 0:
            raise IndexError("dequeue from empty queue")
        x = self._data[self._front]
        self._data[self._front] = None                       # release reference
        self._front = (self._front + 1) % self._capacity     # wrap
        self._size -= 1
        return x                                             # type: ignore[return-value]

    def peek(self) -> T:
        if self._size == 0:
            raise IndexError("peek at empty queue")
        return self._data[self._front]                       # type: ignore[return-value]

    def __len__(self) -> int:
        return self._size
```

**Contest velocity — use `collections.deque`, never `list.pop(0)`.** The single most important queue fact in a contest:

```python
from collections import deque

q = deque()
q.append(x)        # enqueue at the back — O(1)
front = q[0]       # peek front (guard `if q`)
val = q.popleft()  # dequeue from the front — O(1), NOT list.pop(0) which is O(n)
```

`deque` also gives `appendleft`/`pop` for the back end (the [deque primitive](#deque--o1-at-both-ends)). A plain `list` as a queue is an O(n²) TLE waiting to happen — reach for `deque` reflexively.

## CP-primitives

The queue's contest leverage is the **deque** and what it unlocks — sliding-window extremes and a Dijkstra-free shortest path on 0/1 graphs.

### Deque — O(1) at both ends

A **double-ended queue** adds/removes at both front and back in O(1). It is a queue and a stack at once, and the substrate for the next two primitives.

```python
from collections import deque
dq = deque()
dq.append(x)       # back
dq.appendleft(x)   # front
dq.pop()           # back
dq.popleft()       # front
```

**Why for CP:** one structure covers BFS (FIFO), DFS (LIFO), and both-end window tricks — no need to pick a backing structure per problem, and every op is O(1).

### Monotonic deque — sliding-window max/min

To get the max of every window of size `k`, keep a deque of **indices** whose values are decreasing: before adding `i`, pop smaller values from the back (they can never be the max while `nums[i]` is around); pop the front when it slides out of the window. The front is always the window max. Each index is added and removed once → **O(n)** for all windows, beating the O(n·k) brute force and the O(n log n) heap.

```python
def max_sliding_window(nums: list[int], k: int) -> list[int]:
    dq: deque[int] = deque()              # indices, values decreasing
    res = []
    for i, x in enumerate(nums):
        while dq and nums[dq[-1]] <= x:   # back: drop dominated values
            dq.pop()
        dq.append(i)
        if dq[0] == i - k:                # front: drop out-of-window index
            dq.popleft()
        if i >= k - 1:
            res.append(nums[dq[0]])       # front = window max
    return res
```

**Why for CP:** collapses sliding-window extremum from O(n·k)/O(n log n) to O(n). The deque cousin of the [monotonic stack](./stack.md#monotonic-stack--next-greatersmaller-element); see the [Sliding Window](../patterns/sliding-window.md) pattern.

### 0/1-BFS with a deque

When graph edges have weight **0 or 1 only**, you don't need Dijkstra's heap. Use a deque: relax a 0-weight edge by **`appendleft`** (same distance, process next) and a 1-weight edge by **`append`** (distance + 1, process later). The deque stays sorted by distance automatically → **O(V + E)**, beating Dijkstra's O(E log V).

```python
def zero_one_bfs(graph, source, n):       # graph[u] = [(v, w in {0,1}), ...]
    INF = float("inf")
    dist = [INF] * n
    dist[source] = 0
    dq = deque([source])
    while dq:
        u = dq.popleft()
        for v, w in graph[u]:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                dq.appendleft(v) if w == 0 else dq.append(v)
    return dist
```

**Why for CP:** shortest path on 0/1-weighted graphs (grid problems with "free" vs "cost-1" moves) in linear time, no priority queue — a frequent contest shortcut over Dijkstra.

## Gotchas / edge cases

- **`list.pop(0)` is O(n) — the cardinal queue sin.** Using a Python `list` as a queue makes every dequeue shift the whole list left, turning an O(n) BFS into O(n²) and a TLE. Always use `collections.deque` and `popleft()`. This is the single most common queue mistake in interviews and contests.
- **Empty-queue underflow.** Dequeuing or peeking an empty queue throws (`IndexError`) or returns garbage in C. Guard `if not q` / `while q` — in BFS the loop condition `while q` handles it, but a stray `q.popleft()` after the loop crashes.
- **Full ring buffer: distinguishing empty from full.** With wrapping indices, `front == back` is ambiguous — it means both empty and full. Resolve it by tracking an explicit `size` count (as the implementation does) or leaving one slot always empty. Getting this wrong silently drops or duplicates elements.
- **Forgetting the visited-set in BFS.** A queue-based BFS on a graph with cycles re-enqueues already-seen nodes forever (infinite loop / exponential blowup). Mark nodes visited **when you enqueue** them, not when you dequeue — marking on dequeue lets a node be enqueued multiple times before it's processed.
- **Monotonic-deque: storing indices, and the `<` vs `<=`.** Store **indices** so you can detect when the front slides out of the window; the comparison strictness decides duplicate handling. As with the monotonic stack, the comparison direction is the subtle bug.
- **Multi-source BFS seeding.** Problems like "rotting oranges" or "nearest gate" need **all** sources enqueued at distance 0 before the loop starts — a common miss is seeding only one source and getting wrong distances.

## Practice problems

Five staples, each a **distinct** queue technique — no two solved the same way.

### 1. Implement Queue using Stacks — _amortized transfer_

**Problem.** Implement a FIFO queue (`push`, `pop`, `peek`, `empty`) using only two LIFO stacks.

**Approach.** Push onto an **in** stack. To pop/peek, if the **out** stack is empty, pour the in-stack into it — reversing the order, so out's top is the oldest element. Each element is moved between stacks at most once, so the transfer amortizes to **O(1)** per operation despite the occasional O(n) pour. The classic "build FIFO from LIFO" insight: two reversals make a forward.

```python
class MyQueue:
    def __init__(self) -> None:
        self._in: list[int] = []
        self._out: list[int] = []

    def push(self, x: int) -> None:
        self._in.append(x)

    def _shift(self) -> None:
        if not self._out:                 # only pour when out is empty
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

**Complexity.** Amortized O(1) per operation, O(n) space.

### 2. Number of Recent Calls — _sliding-window queue_

**Problem.** Implement a counter `ping(t)` that returns how many calls happened in the last 3000 ms, i.e. in `[t-3000, t]`. Calls arrive in increasing `t`.

**Approach.** A queue of timestamps. On each `ping(t)`, enqueue `t`, then dequeue everything older than `t-3000` from the front. The queue holds exactly the in-window calls, so its size is the answer. The FIFO order matches time order, so stale calls always leave from the front — a pure sliding-window-over-time use of a queue.

```python
from collections import deque

class RecentCounter:
    def __init__(self) -> None:
        self._q: deque[int] = deque()

    def ping(self, t: int) -> int:
        self._q.append(t)
        while self._q[0] < t - 3000:      # drop calls outside the window
            self._q.popleft()
        return len(self._q)
```

**Complexity.** Amortized O(1) per `ping`, O(W) space (W = max calls in a window).

### 3. Sliding Window Maximum — _monotonic deque_

**Problem.** Given an array and a window size `k`, return the maximum of each contiguous window. E.g. `nums=[1,3,-1,-3,5,3,6,7], k=3` → `[3,3,5,5,6,7]`.

**Approach.** A **decreasing monotonic deque of indices**: before adding `i`, pop smaller values off the back (they can't be the max while `nums[i]` lives); pop the front when it leaves the window. The front index is always the current window max — O(n) total, beating the O(n log n) heap. The monotonic-deque primitive in its canonical problem.

```python
from collections import deque

def max_sliding_window(nums: list[int], k: int) -> list[int]:
    dq: deque[int] = deque()
    res = []
    for i, x in enumerate(nums):
        while dq and nums[dq[-1]] <= x:
            dq.pop()
        dq.append(i)
        if dq[0] == i - k:                # front slid out of the window
            dq.popleft()
        if i >= k - 1:
            res.append(nums[dq[0]])
    return res
```

**Complexity.** O(n) time, O(k) space. Pattern: [Sliding Window](../patterns/sliding-window.md).

### 4. Rotting Oranges — _multi-source BFS_

**Problem.** In a grid, `2` = rotten orange, `1` = fresh, `0` = empty. Each minute, a rotten orange rots its 4-directional fresh neighbors. Return the minutes until none are fresh, or -1 if impossible.

**Approach.** **Multi-source BFS**: enqueue _all_ initially-rotten cells at distance 0, then BFS outward level by level — each level is one minute. The queue's FIFO order guarantees you finish minute `t` before minute `t+1`, so the last level processed is the answer. Seeding every source up front is the key (a single-source BFS would give wrong times).

```python
from collections import deque

def oranges_rotting(grid: list[list[int]]) -> int:
    rows, cols = len(grid), len(grid[0])
    q = deque()
    fresh = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 2:
                q.append((r, c, 0))       # all sources at time 0
            elif grid[r][c] == 1:
                fresh += 1
    minutes = 0
    while q:
        r, c, t = q.popleft()
        minutes = max(minutes, t)
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                grid[nr][nc] = 2          # mark on enqueue, not dequeue
                fresh -= 1
                q.append((nr, nc, t + 1))
    return minutes if fresh == 0 else -1
```

**Complexity.** O(rows · cols) time and space. Pattern: [Tree & Graph Traversal](../patterns/tree-graph-traversal.md).

### 5. Design Circular Queue — _ring buffer_

**Problem.** Design a fixed-capacity circular queue with `enQueue`, `deQueue`, `Front`, `Rear`, `isEmpty`, `isFull` — all O(1).

**Approach.** A fixed array with a `front` index and a `size` count; the back slot is `(front + size) % capacity`. Wrapping arithmetic means nothing shifts and the array reuses freed front slots. Tracking `size` explicitly resolves the empty-vs-full ambiguity that plagues `front == back` designs. The ring-buffer primitive made concrete.

```python
class MyCircularQueue:
    def __init__(self, k: int) -> None:
        self._data = [0] * k
        self._cap = k
        self._front = 0
        self._size = 0

    def enQueue(self, value: int) -> bool:
        if self._size == self._cap:
            return False
        self._data[(self._front + self._size) % self._cap] = value
        self._size += 1
        return True

    def deQueue(self) -> bool:
        if self._size == 0:
            return False
        self._front = (self._front + 1) % self._cap
        self._size -= 1
        return True

    def Front(self) -> int:
        return -1 if self._size == 0 else self._data[self._front]

    def Rear(self) -> int:
        return -1 if self._size == 0 else self._data[(self._front + self._size - 1) % self._cap]

    def isEmpty(self) -> bool:
        return self._size == 0

    def isFull(self) -> bool:
        return self._size == self._cap
```

**Complexity.** O(1) per operation, O(k) space. See [Circular Buffer](./circular-buffer.md).
