# Circular Buffer

## Prerequisites

- [Array](./array.md) [Must read] - a circular buffer is a fixed array with wraparound index math; you need contiguous memory + O(1) indexing first.
- **Modular arithmetic** [Must read] - the wraparound is `index % capacity`. If `%` on indices is unfamiliar, read that first. (No page yet — picture a clock face: after 11 comes 0.)

## Table of Contents

- [What it is](#what-it-is)
- [How it works](#how-it-works)
- [Operations](#operations)
- [Complexity summary](#complexity-summary)
- [When to use / when not](#when-to-use--when-not)
- [Variants](#variants)
- [Memory layout](#memory-layout)
- [Implementation](#implementation)
- [Gotchas / edge cases](#gotchas--edge-cases)
- [Practice problems](#practice-problems)

## What it is

A **circular buffer** (ring buffer) is a fixed-size array treated as if its ends were joined into a ring: when an index runs off the end, it wraps back to 0 via `% capacity`. Two pointers — **head** (read) and **tail** (write) — chase each other around the ring, giving O(1) enqueue and dequeue at both ends with **zero shifting and zero reallocation**.

Mental model: **a revolving sushi conveyor belt with a fixed number of plates.** Chefs add plates at the tail; diners take them from the head; both move in the same direction around the loop. Nobody renumbers the belt — when the tail reaches the last slot, the next plate goes back to slot 0.

> **Takeaway (say this out loud):** "A ring buffer is a fixed array with head and tail indices that wrap via modulo — O(1) push and pop at both ends, no shifting, perfect for a fixed-capacity FIFO or a sliding window over a stream."

## How it works

Keep a fixed array of `capacity` slots plus two indices:

- **head** — index of the next element to read (front of the queue).
- **tail** — index of the next free slot to write.

Enqueue writes at `tail`, then advances `tail = (tail + 1) % capacity`. Dequeue reads at `head`, then advances `head = (head + 1) % capacity`. The modulo is what makes the array "circular" — no element ever moves.

```
capacity 6.  head=1 (read here), tail=4 (write here):

 index:   0     1     2     3     4     5
        +-----+-----+-----+-----+-----+-----+
        |     |  A  |  B  |  C  |     |     |
        +-----+-----+-----+-----+-----+-----+
               ▲head             ▲tail

enqueue(D): write at tail=4, tail → 5
        +-----+-----+-----+-----+-----+-----+
        |     |  A  |  B  |  C  |  D  |     |
        +-----+-----+-----+-----+-----+-----+
               ▲head                   ▲tail

…three more enqueues later tail wraps 5 → 0:
        +-----+-----+-----+-----+-----+-----+
        |  G  |  A  |  B  |  C  |  D  |  E  |   (tail wrapped to 0 after writing F at 5)
        +-----+-----+-----+-----+-----+-----+
         ▲tail  ▲head
```

**Full vs empty are the hard part.** Both states can show `head == tail`. Two standard fixes: (a) keep an explicit **count** of elements, or (b) **waste one slot** so "full" means `(tail + 1) % capacity == head` and "empty" means `head == tail`. The count approach is clearer; the wasted-slot approach saves a field. This article uses an explicit count.

## Operations

| Operation               | Time | Space |
| ----------------------- | ---- | ----- |
| Enqueue (push back)     | O(1) | O(1)  |
| Dequeue (pop front)     | O(1) | O(1)  |
| Peek front / back       | O(1) | O(1)  |
| `is_empty` / `is_full`  | O(1) | O(1)  |
| Access by logical index | O(1) | O(1)  |
| Search                  | O(n) | O(1)  |

Every core operation is true O(1) — no amortization, no resize, no shift. That worst-case guarantee is the buffer's whole reason to exist.

## Complexity summary

| Operation | Best               | Average | Worst |
| --------- | ------------------ | ------- | ----- |
| Enqueue   | O(1)               | O(1)    | O(1)  |
| Dequeue   | O(1)               | O(1)    | O(1)  |
| Peek      | O(1)               | O(1)    | O(1)  |
| Search    | O(1) (first match) | O(n)    | O(n)  |

No best/average/worst split for the core ops — that's the point. Unlike a [Dynamic Array](./dynamic-array.md), there's no hidden O(n) resize lurking in the worst case.

**Space:** O(capacity), fixed at construction. The buffer never grows, so memory is bounded and predictable — the property that makes it safe for real-time and embedded systems.

## When to use / when not

**Reach for a circular buffer when:**

- You need a **fixed-capacity FIFO queue** with hard O(1) guarantees — producer/consumer pipelines, task queues, request buffers.
- You're holding a **sliding window over a stream** — last N samples, last N log lines, a rate-limiter's recent timestamps.
- **Worst-case latency must be bounded** — real-time audio/video, embedded, kernel ring buffers. No resize spike, ever.

**Reach for something else when:**

- **The collection must grow unbounded** → a [Dynamic Array](./dynamic-array.md) or linked-list-backed queue; a ring buffer's capacity is fixed and overflow forces a policy decision (drop or overwrite).
- **You need random insert/delete in the middle** → a ring buffer is FIFO-shaped; arbitrary splices aren't its job.
- **You want a simple growable stack/queue and don't care about latency spikes** → a plain dynamic array is less fiddly (no wraparound index math).

Rule of thumb: **fixed capacity + FIFO + must-not-spike → ring buffer.** Unbounded growth → don't.

## Variants

- **Overwriting (lossy) ring buffer.** When full, enqueue **overwrites the oldest** element and advances `head` too. This is the classic "last N" log/telemetry buffer — newest data always wins. Non-overwriting buffers instead reject or block on full.
- **Power-of-two capacity.** Fix capacity to a power of two and replace `% capacity` with `& (capacity - 1)` — a bitmask, faster than modulo. Common in high-performance and lock-free implementations (e.g. the LMAX Disruptor).
- **Lock-free single-producer/single-consumer (SPSC) ring.** With one writer and one reader, head and tail can be updated without locks using memory barriers — a staple of low-latency messaging.
- **Double-ended (deque on a ring).** Allow push/pop at both head and tail for an O(1) fixed-capacity deque.

## Memory layout

**Contiguous and fixed — the source of its guarantees.** Storage is a single array block, allocated once. Elements never move; only the two index integers change. Logical order ("oldest to newest") is _decoupled_ from physical order — element 0 of the queue may sit anywhere in the block, wherever `head` points.

```
physical block (capacity 6), logically [C, D, E, F, G] oldest→newest:

 index:   0     1     2     3     4     5
        +-----+-----+-----+-----+-----+-----+
        |  G  |     |  C  |  D  |  E  |  F  |
        +-----+-----+-----+-----+-----+-----+
         ▲tail head▲ ▲─── logical order wraps around ───▲
```

**Cache behavior.** Same contiguity benefit as a plain array — sequential producer/consumer access streams through cache lines well. The wraparound point causes one non-sequential jump per lap, negligible in practice.

**No resize, ever.** Unlike a dynamic array, there is no doubling, no copy, no transient 2× memory. Allocate `capacity` slots up front; memory is constant and known at compile time — exactly why kernels and embedded systems use ring buffers where a heap allocation mid-operation would be unacceptable.

## Implementation

Fixed backing array + head, tail, count. Core ops: `enqueue`, `dequeue` — both pure index arithmetic.

**Pseudocode (CLRS-style contract):**

```
CIRCULAR-ENQUEUE(R, x)
1   if R.count == R.capacity
2       error "buffer full"                       ▷ or overwrite head (lossy variant)
3   R.data[R.tail] = x
4   R.tail = (R.tail + 1) mod R.capacity           ▷ wrap
5   R.count = R.count + 1

CIRCULAR-DEQUEUE(R)
1   if R.count == 0
2       error "buffer empty"
3   x = R.data[R.head]
4   R.data[R.head] = NIL                            ▷ release reference
5   R.head = (R.head + 1) mod R.capacity            ▷ wrap
6   R.count = R.count − 1
7   return x
```

**Python (reference — idiomatic):**

```python
from typing import TypeVar, Generic, Iterator

T = TypeVar("T")


class CircularBuffer(Generic[T]):
    """Fixed-capacity ring buffer with explicit count for full/empty."""

    def __init__(self, capacity: int) -> None:
        if capacity <= 0:
            raise ValueError("capacity must be positive")
        self._data: list[T | None] = [None] * capacity
        self._capacity = capacity
        self._head = 0   # next to read
        self._tail = 0   # next free slot
        self._count = 0

    def __len__(self) -> int:
        return self._count

    def is_full(self) -> bool:
        return self._count == self._capacity

    def is_empty(self) -> bool:
        return self._count == 0

    def enqueue(self, x: T) -> None:
        if self.is_full():
            raise OverflowError("circular buffer is full")
        self._data[self._tail] = x
        self._tail = (self._tail + 1) % self._capacity  # wrap
        self._count += 1

    def dequeue(self) -> T:
        if self.is_empty():
            raise IndexError("dequeue from empty buffer")
        x = self._data[self._head]
        self._data[self._head] = None  # release reference for GC
        self._head = (self._head + 1) % self._capacity  # wrap
        self._count -= 1
        return x  # type: ignore[return-value]

    def __iter__(self) -> Iterator[T]:
        # logical (oldest → newest) order, not physical
        return (
            self._data[(self._head + i) % self._capacity]  # type: ignore[misc]
            for i in range(self._count)
        )
```

Note Python's standard library gives you this for free: `collections.deque(maxlen=N)` is a fixed-capacity ring buffer with overwrite-on-full — reach for it in real code, implement the above to show you understand the mechanism in an interview.

## Gotchas / edge cases

- **Full vs empty ambiguity.** Both can satisfy `head == tail`. Forgetting to disambiguate (via a count or a wasted slot) is _the_ classic ring-buffer bug — you'll dequeue from an empty buffer or silently drop a write. State your choice explicitly.
- **Off-by-one in wraparound.** `(tail + 1) % capacity` not `tail % capacity`; advance the pointer _after_ the read/write, not before. A single misplaced `+1` corrupts ordering. Trace one full lap on paper.
- **Overflow policy is a design decision, not a default.** On full, do you reject, block, or overwrite the oldest? Each is correct for a different use case (queue vs telemetry buffer). Saying "it's full" without naming the policy is an incomplete answer.
- **`%` on negative indices.** If a variant decrements an index (deque on a ring), `-1 % capacity` is `capacity - 1` in Python but _implementation-defined / negative_ in C and Java. Add `capacity` before the modulo in those languages: `(i - 1 + capacity) % capacity`.
- **Iteration order ≠ storage order.** Iterating the raw backing array gives physical order, which is meaningless. Always iterate logically from `head` for `count` steps.

## Practice problems

- **Design Circular Queue** — _Design (LeetCode 622)_. Implement `enQueue`/`deQueue`/`isFull`/`isEmpty` on a fixed ring — the canonical version of this page. <!-- self-referential: this page's Implementation -->
- **Design Hit Counter** — _Sliding window over a stream_. Ring buffer of timestamps for the last N seconds; overwrite as time advances. <!-- will cross-link to patterns/sliding-window once written -->
- **Moving Average from Data Stream** — _Fixed-window aggregate_. A ring buffer of the last k values with a running sum, O(1) per update. <!-- will cross-link to patterns/sliding-window once written -->
- **Design a Logger / Rate Limiter** — _Bounded recent history_. Fixed-capacity buffer of recent events; old ones age out by overwrite. <!-- will cross-link to system-design/components/rate-limiter once written -->
