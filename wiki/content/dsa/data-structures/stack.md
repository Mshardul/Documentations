# Stack

## Prerequisites

- **Big-O Notation** [Must read] - every operation here is O(1); you need the cost model to appreciate why that guarantee matters. <!-- U9: not-yet-written target — wire to `algorithms/big-o-notation.md` once that page exists. -->
- [Array](./array.md) [Must read] - the default stack is just a dynamic array with push/pop at the end; the array's amortized-O(1) append is the stack's push.
- [Linked List](./linked-list.md) [Should read] - the alternative backing: push/pop at the head, true O(1) with no resize spike.

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
  - [Monotonic stack — next greater/smaller element](#monotonic-stack--next-greatersmaller-element)
  - [Paren/bracket matching & expression parsing](#parenbracket-matching--expression-parsing)
  - [Explicit stack to flatten recursion](#explicit-stack-to-flatten-recursion)
- [Gotchas / edge cases](#gotchas--edge-cases)
- [Practice problems](#practice-problems)
  - [Valid Parentheses](#1-valid-parentheses--matching-with-a-stack)
  - [Daily Temperatures](#2-daily-temperatures--monotonic-stack)
  - [Min Stack](#3-min-stack--auxiliary-stack)
  - [Evaluate Reverse Polish Notation](#4-evaluate-reverse-polish-notation--operand-stack)
  - [Largest Rectangle in Histogram](#5-largest-rectangle-in-histogram--monotonic-stack-with-widths)

## What it is

A **stack** is a linear collection with one rule: **last in, first out (LIFO)** — you can only add to and remove from the same end, the **top**.

Mental model: **a stack of plates.** You add a plate to the top and take one off the top; you never pull from the middle or the bottom. The last plate you put down is the first you pick up. That single constraint — access only at the top — is what makes every operation O(1) and what makes the stack the natural fit for anything with **nesting** or **reversal**: function calls, undo, matched brackets, backtracking.

> **Takeaway (say this out loud):** "A stack is LIFO — push and pop at one end in O(1). Reach for it whenever the problem has nesting, matching, or 'most recent first'."

## How it works

A stack exposes exactly three core operations, all at the **top**: **push** (add), **pop** (remove and return), **peek** (read without removing). There is no indexing, no search, no insert-in-the-middle — the LIFO restriction is the whole point, and it's what buys the O(1) guarantee.

```
push(3)   push(7)   push(2)        pop() → 2      peek() → 7
                                                    (7 stays)
 top→ │ │  top→│3│  top→│2│         top→│7│         top→│7│
      │ │      │ │     │7│              │3│             │3│
      │3│      │7│     │3│              │ │             │ │
      └─┘      │3│     │7│              └─┘             └─┘
               └─┘     │3│
                       └─┘
```

Two backings give the same O(1) interface (see [Memory layout](#memory-layout)):

- **Array-backed** — push = append to the end, pop = remove from the end. The array's end is the top; both are amortized O(1). This is the default (Python `list`, Java `ArrayDeque`).
- **Linked-list-backed** — push = insert at head, pop = remove head. True O(1) per op, no resize spike, at the cost of per-node pointer overhead.

The deep idea: a stack is the data-structure form of **recursion**. Every recursive call pushes a frame (locals, return address) onto the program's **call stack**; every return pops one. Anything you can solve recursively, you can solve with an explicit stack — and sometimes must, to avoid stack-overflow on deep inputs.

## Operations

| Operation        | Time   | Space |
| ---------------- | ------ | ----- |
| Push (add top)   | O(1)\* | O(1)  |
| Pop (remove top) | O(1)   | O(1)  |
| Peek / top       | O(1)   | O(1)  |
| Is empty         | O(1)   | O(1)  |
| Size             | O(1)   | O(1)  |
| Search by value  | O(n)   | O(1)  |

\*Array-backed push is **amortized** O(1) — an occasional resize is O(n) (see [dynamic array](./dynamic-array.md)). Linked-list-backed push is worst-case O(1). Search is O(n) and almost never the right use of a stack; if you need lookup, you picked the wrong structure.

## Complexity summary

| Operation | Best | Average | Worst                             |
| --------- | ---- | ------- | --------------------------------- |
| Push      | O(1) | O(1)    | O(n) (array resize) / O(1) (list) |
| Pop       | O(1) | O(1)    | O(1)                              |
| Peek      | O(1) | O(1)    | O(1)                              |

**Space:** O(n) for n elements. Array-backed carries the dynamic array's ~2× capacity slack; linked-list-backed carries one pointer per node. The famous hidden space cost is the **call stack** itself: deep recursion consumes O(depth) stack frames and can overflow — converting to an explicit heap stack trades that for O(depth) heap memory you control.

## When to use / when not

**Reach for a stack when:**

- The problem has **nesting or matching** — parentheses/brackets/tags, expression evaluation, nested structures. The most-recent-open is always the one you close first: pure LIFO.
- You need **"most recent" / reverse order** — undo/redo, browser back, backtracking state, reversing a sequence.
- You're **eliminating recursion** — a DFS or any recursive walk rewritten iteratively uses an explicit stack to dodge call-stack overflow.
- You need the **next-greater/smaller element** or a span — the [monotonic stack](#monotonic-stack--next-greatersmaller-element) pattern.

**Reach for something else when:**

- **You need first-in-first-out** → a [queue](./queue.md), not a stack. FIFO vs LIFO is the defining split; BFS needs a queue, DFS a stack.
- **You need access to the middle or by index** → an [array](./array.md); a stack deliberately forbids it.
- **You need min/max-priority order** → a [heap](./heap.md); a stack has no notion of priority, only recency.

Rule of thumb: **stack = LIFO = "deal with the most recent thing first."** If the order you process in is the reverse of the order you received, it's a stack.

Real-world: the **program call stack** (every language runtime), expression evaluation in compilers and calculators, the **undo stack** in editors, browser/back-button history, depth-first traversal in graph/file-system walkers, and the VM operand stack in the JVM and CPython bytecode interpreter.

## Comparison

How the stack stacks up against the structures you'd weigh it against:

| Structure | Add                 | Remove           | Order    | Access middle | Memory               | Pick it when…                       |
| --------- | ------------------- | ---------------- | -------- | ------------- | -------------------- | ----------------------------------- |
| **Stack** | **O(1)** top        | **O(1)** top     | LIFO     | no            | array slack / +ptr   | nesting, matching, undo, DFS        |
| Queue     | O(1) back           | O(1) front       | FIFO     | no            | ring / +ptr          | scheduling, BFS, "first come first" |
| Deque     | O(1) both ends      | O(1) both ends   | both     | no            | ring / +2 ptr        | sliding-window, both-end access     |
| Array     | O(1) end / O(n) mid | O(n) mid         | by index | **O(1)**      | contiguous, tight    | random access, iteration            |
| Heap      | O(log n)            | O(log n) min/max | priority | no            | array, complete tree | top-K, min/max priority             |

The stack's identity is the **restriction**: only the top. That restriction is a feature — it makes the LIFO guarantee free and the code trivially correct for nesting problems. Every rival relaxes it and pays elsewhere.

## Variants

- **Array-backed stack** — a [dynamic array](./dynamic-array.md) with push/pop at the end. The default; best cache locality. Python `list`.
- **Linked-list-backed stack** — push/pop at the head of a [singly linked list](./linked-list.md). Worst-case O(1) push (no resize), at pointer-overhead cost.
- **Min/Max stack** — a stack that also returns its current minimum (or maximum) in O(1), via a parallel auxiliary stack of running minima. The technique is in the [Min Stack practice problem](#3-min-stack--auxiliary-stack); structurally it's a stack-of-pairs.
- **Two-stack queue** — a FIFO [queue](./queue.md) built from two stacks (push onto one, pop from the other, transferring when empty); amortized O(1). A classic "implement X with Y" interview shape.
- **Monotonic stack** — a stack kept strictly increasing or decreasing by popping violators on push. Not a different structure — a discipline on a normal stack that solves next-greater/smaller in amortized O(n). Full treatment in [CP-primitives](#cp-primitives) and the [Monotonic Stack](../patterns/monotonic-stack.md) pattern.
- **Call stack** — the runtime's own stack of activation records. Not something you allocate, but the reason recursion works and the thing that overflows on deep input.

## Memory layout

The stack's behavior is the behavior of whichever structure backs it — and the choice is a real interview trade.

**Array-backed (contiguous).** Elements live in one block; the top is the highest occupied index. Push appends, pop decrements the size.

```
array-backed stack (top at the right end):

index:  0    1    2    3        capacity 6, size 4
      [ 3 | 7 | 2 | 9 |   |   ]
                    ▲ top = data[size-1];  push writes data[size], size++
```

- **Cache-friendly** — sequential memory, the prefetcher loves it; iteration and repeated push/pop hit cache.
- **Resize spike** — when full, push triggers an O(n) copy into a 2× block (the [dynamic-array doubling](./dynamic-array.md#memory-layout) argument), so push is _amortized_ O(1) with occasional O(n) pauses, and footprint carries up to ~2× slack.

**Linked-list-backed (scattered).** Each element is a node; the top is the head. Push prepends a node, pop unlinks the head.

```
linked-list-backed stack (top = head):

top → [9|•] → [2|•] → [7|•] → [3|/]      push = new head node; pop = drop head
```

- **Worst-case O(1) push** — no resize, no copy, no spike; each push is one allocation. Good when worst-case latency matters more than throughput.
- **Pointer overhead + cache misses** — 8 bytes/node and scattered addresses; iteration and repeated ops are slower in practice than the array despite identical Big-O.

**Which to pick:** array-backed is the default and usually faster (locality wins). Choose linked-list-backed only when you need **no amortized-resize spike** (hard-real-time) or are composing nodes you already hold. This is the same array-vs-list trade as everywhere, applied to one end.

**The call stack (why overflow happens).** The runtime stack grows per call frame and has a hard OS limit (commonly ~1–8 MB). Deep recursion — an unbalanced tree, a long linked list walked recursively — can exceed it and crash (`RecursionError` / stack overflow). Rewriting with an explicit heap-allocated stack moves the frames to the heap, which is far larger, removing the limit at the cost of managing the stack yourself ([CP-primitive below](#explicit-stack-to-flatten-recursion)).

## Implementation

A stack over a dynamic array — the idiomatic default. Pseudocode states the contract; Python shows both the from-scratch class and the one-liner you'd actually use.

**Pseudocode (CLRS-style contract):**

```
STACK-PUSH(S, x)
1   S.top = S.top + 1            ▷ advance the top index
2   S.data[S.top] = x            ▷ (grow the backing array if full)

STACK-POP(S)
1   if STACK-EMPTY(S)
2       error "underflow"        ▷ popping an empty stack is a bug
3   x = S.data[S.top]
4   S.top = S.top − 1            ▷ logically remove; element left for GC/overwrite
5   return x

STACK-EMPTY(S)
1   return S.top == −1           ▷ top = −1 means empty
```

**Python (reference — idiomatic):**

```python
from typing import Generic, TypeVar

T = TypeVar("T")


class Stack(Generic[T]):
    """LIFO stack over a Python list (dynamic array)."""

    def __init__(self) -> None:
        self._data: list[T] = []

    def push(self, x: T) -> None:
        self._data.append(x)              # amortized O(1)

    def pop(self) -> T:
        if not self._data:
            raise IndexError("pop from empty stack")
        return self._data.pop()           # O(1) from the end

    def peek(self) -> T:
        if not self._data:
            raise IndexError("peek at empty stack")
        return self._data[-1]             # O(1), no removal

    def is_empty(self) -> bool:
        return not self._data

    def __len__(self) -> int:
        return len(self._data)
```

**Contest velocity — a Python `list` _is_ a stack.** Don't write the class in a contest; `append`/`pop` on a plain list are the push/pop, and they're C-fast:

```python
st = []
st.append(x)     # push
top = st[-1]     # peek (guard `if st` first)
val = st.pop()   # pop
if not st: ...   # empty check
```

(For a stack you'll later turn into a deque/queue, `collections.deque` gives the same `append`/`pop` plus O(1) on the left end.)

## CP-primitives

The stack's contest power is concentrated in three moves — the first one, the monotonic stack, is one of the highest-leverage patterns in competitive programming.

### Monotonic stack — next greater/smaller element

Keep the stack **monotonic** (e.g. strictly decreasing): before pushing `x`, pop every element smaller than `x`. Each popped element has just found its **next greater element** — it's `x`. One pass, and because every element is pushed and popped at most once, it's **amortized O(n)**, not O(n²).

```
nums = [2, 1, 5, 3]   find next-greater for each (decreasing stack of indices):

push 2 → [2]
push 1 → [2,1]          1 < 2, no pop
push 5 → pop 1 (NGE=5), pop 2 (NGE=5) → [5]
push 3 → [5,3]          3 < 5, no pop
end → 5,3 have no NGE
result: [5, 5, -1, -1]
```

```python
def next_greater(nums: list[int]) -> list[int]:
    res = [-1] * len(nums)
    stack: list[int] = []                 # indices, values decreasing
    for i, x in enumerate(nums):
        while stack and nums[stack[-1]] < x:
            res[stack.pop()] = x          # x is the NGE of the popped index
        stack.append(i)
    return res
```

**Why for CP:** collapses "for each element, find the next bigger/smaller one" from O(n²) to O(n). The engine behind daily-temperatures, stock span, histogram-rectangle, and trapping-rain-water variants — see the [Monotonic Stack](../patterns/monotonic-stack.md) pattern.

### Paren/bracket matching & expression parsing

Push every opening symbol; on a closing symbol, pop and check it matches. The stack naturally models nesting — the most-recent unmatched open is exactly the one a close must pair with.

```python
PAIRS = {")": "(", "]": "[", "}": "{"}
def valid(s: str) -> bool:
    stack: list[str] = []
    for ch in s:
        if ch in "([{":
            stack.append(ch)
        elif not stack or stack.pop() != PAIRS[ch]:
            return False                  # unmatched / mismatched close
    return not stack                       # leftover opens → invalid
```

**Why for CP:** the stack turns nesting validation and expression evaluation (infix→postfix via shunting-yard, RPN evaluation) into a single linear pass — the canonical "this is obviously a stack" trigger.

### Explicit stack to flatten recursion

Any recursion is a stack of frames. When recursion depth could overflow the call stack (a chain of 10⁵+ nodes), rewrite it iteratively with your own heap-allocated stack — same algorithm, no `RecursionError`.

```python
def dfs_iterative(root) -> list[int]:
    order, stack = [], [root]
    while stack:
        node = stack.pop()                # LIFO = depth-first
        if node is None:
            continue
        order.append(node.val)
        stack.append(node.right)          # push right first → left processed first
        stack.append(node.left)
    return order
```

**Why for CP:** Python caps recursion ~1000 by default; deep inputs crash. An explicit stack moves frames to the (much larger) heap — the standard fix for deep-DFS TLE/overflow, no `sys.setrecursionlimit` hacks.

## Gotchas / edge cases

- **Underflow — popping/peeking an empty stack.** The single most common stack bug. Always guard `if not stack` before `pop()`/`stack[-1]`, or you get an `IndexError` (Python) / undefined behavior (C). In matching problems, a close-symbol on an empty stack means "invalid", not a crash — handle it as a result, not an exception.
- **Leftover elements at the end.** Validating brackets, an empty input string is valid, but a string of only opens (`"((("`) leaves the stack non-empty — you must check `stack is empty` at the end, not just that every close matched. Forgetting the final emptiness check is the classic off-by-completeness bug.
- **Recursion depth = an implicit stack that overflows.** "I'll just recurse" hides an O(depth) call-stack cost. On adversarial deep input (a degenerate tree, a long list) it overflows. If depth can be large, say so and convert to an [explicit stack](#explicit-stack-to-flatten-recursion).
- **Monotonic-stack direction & strictness.** Increasing vs decreasing, and `<` vs `<=`, decide whether you get next-greater vs next-greater-or-equal and how ties/duplicates are handled. Getting the comparison wrong is the subtle monotonic-stack bug — pin down the exact requirement (strict? from which side?) before coding.
- **Storing indices vs values.** Monotonic-stack problems usually need to store **indices**, not values, so you can compute distances/widths (histogram, daily-temperatures gap) and still read the value via `nums[idx]`. Pushing values when you needed indices silently loses the position information.
- **Order of pushing children in iterative DFS.** To visit left-first, push **right then left** (LIFO reverses them). Reversing the push order silently changes the traversal — a quiet correctness bug, not a crash.

## Practice problems

Five staples, each a **distinct** stack technique — no two solved the same way.

### 1. Valid Parentheses — _matching with a stack_

**Problem.** Given a string of `()[]{}`, decide if every bracket is closed by the correct type in the correct order. E.g. `"([)]"` → false, `"([])"` → true.

**Approach.** Push each open bracket; on a close, the top must be its matching open — pop and compare. A close on an empty stack, or a mismatch, fails immediately. At the end the stack must be empty (no unclosed opens). Pure LIFO: the most-recent open is always the one a close pairs with.

```python
def is_valid(s: str) -> bool:
    pairs = {")": "(", "]": "[", "}": "{"}
    stack: list[str] = []
    for ch in s:
        if ch in "([{":
            stack.append(ch)
        elif not stack or stack.pop() != pairs[ch]:
            return False
    return not stack
```

**Complexity.** O(n) time, O(n) space.

### 2. Daily Temperatures — _monotonic stack_

**Problem.** Given daily temperatures, for each day return how many days until a warmer day (0 if none). E.g. `[73,74,75,71,69,72,76,73]` → `[1,1,4,2,1,1,0,0]`.

**Approach.** A **decreasing monotonic stack of indices**. For each day, pop every earlier day cooler than today — today is their answer; record the index gap. Each index is pushed and popped once → O(n). Storing indices (not temps) is what lets you compute the day-distance.

```python
def daily_temperatures(temps: list[int]) -> list[int]:
    res = [0] * len(temps)
    stack: list[int] = []                 # indices, temps decreasing
    for i, t in enumerate(temps):
        while stack and temps[stack[-1]] < t:
            j = stack.pop()
            res[j] = i - j                # days until warmer
        stack.append(i)
    return res
```

**Complexity.** O(n) time, O(n) space. Pattern: [Monotonic Stack](../patterns/monotonic-stack.md).

### 3. Min Stack — _auxiliary stack_

**Problem.** Design a stack supporting `push`, `pop`, `top`, and `get_min` — all in O(1).

**Approach.** A second **auxiliary stack** tracks the running minimum: on push, append `min(x, current_min)`; on pop, pop both. The min-stack's top is always the min of all current elements, so `get_min` is O(1). The insight is that the minimum changes only at push/pop boundaries, so it can be carried alongside each element.

```python
class MinStack:
    def __init__(self) -> None:
        self._data: list[int] = []
        self._mins: list[int] = []        # running minimums

    def push(self, x: int) -> None:
        self._data.append(x)
        self._mins.append(min(x, self._mins[-1] if self._mins else x))

    def pop(self) -> None:
        self._data.pop()
        self._mins.pop()

    def top(self) -> int:
        return self._data[-1]

    def get_min(self) -> int:
        return self._mins[-1]
```

**Complexity.** O(1) per operation, O(n) space.

### 4. Evaluate Reverse Polish Notation — _operand stack_

**Problem.** Evaluate an arithmetic expression in postfix (RPN) form, given as tokens. E.g. `["2","1","+","3","*"]` → `9` (`(2+1)*3`).

**Approach.** Push operands; on an operator, pop the **two** most recent operands, apply, push the result. RPN needs no parentheses precisely because the stack encodes the grouping — the two operands an operator wants are always the top two. Mind operand order for non-commutative ops (`a - b`, `a / b`): the first popped is the right operand.

```python
def eval_rpn(tokens: list[str]) -> int:
    stack: list[int] = []
    ops = {"+", "-", "*", "/"}
    for tok in tokens:
        if tok in ops:
            b = stack.pop()               # right operand (popped first)
            a = stack.pop()               # left operand
            if tok == "+": stack.append(a + b)
            elif tok == "-": stack.append(a - b)
            elif tok == "*": stack.append(a * b)
            else: stack.append(int(a / b))   # truncate toward zero
        else:
            stack.append(int(tok))
    return stack[-1]
```

**Complexity.** O(n) time, O(n) space.

### 5. Largest Rectangle in Histogram — _monotonic stack with widths_

**Problem.** Given bar heights of width 1, find the area of the largest rectangle that fits inside the histogram. E.g. `[2,1,5,6,2,3]` → `10` (the `5,6` pair, width 2 × height 5).

**Approach.** An **increasing monotonic stack of indices**. When a bar shorter than the stack top appears, the top bar can't extend further right — pop it and compute its maximal rectangle, using the new top as the left boundary to get the width. A sentinel `0` at the end flushes the stack. The width calculation (`i - stack[-1] - 1`) is why we store indices. The hardest classic monotonic-stack problem.

```python
def largest_rectangle(heights: list[int]) -> int:
    stack: list[int] = []                 # indices, heights increasing
    best = 0
    for i, h in enumerate(heights + [0]): # sentinel flushes the stack
        while stack and heights[stack[-1]] > h:
            height = heights[stack.pop()]
            left = stack[-1] if stack else -1
            width = i - left - 1
            best = max(best, height * width)
        stack.append(i)
    return best
```

**Complexity.** O(n) time, O(n) space. Pattern: [Monotonic Stack](../patterns/monotonic-stack.md).
