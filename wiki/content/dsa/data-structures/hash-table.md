# Hash Table

## Prerequisites

- **Big-O Notation** [Must read] - the whole point of a hash table is turning O(n) lookup into O(1) average; you need the cost model to see why that matters. <!-- U9: not-yet-written target — wire to `algorithms/big-o-notation.md` once that page exists. -->
- [Array](./array.md) [Must read] - a hash table is a contiguous array (the bucket array) plus a function that turns a key into an index. Without the array's O(1) indexed access, none of this works.
- [Linked List](./linked-list.md) [Should read] - the standard collision-resolution strategy (chaining) stores colliding keys in a linked list per bucket.

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
- [Hashing & collisions](#hashing--collisions)
  - [The hash function](#the-hash-function)
  - [Collisions are inevitable](#collisions-are-inevitable)
  - [Chaining](#chaining)
  - [Open addressing](#open-addressing)
  - [Load factor & resize](#load-factor--resize)
- [Implementation](#implementation)
- [CP-primitives](#cp-primitives)
  - [Frequency map / counter](#frequency-map--counter)
  - [Seen-set for O(1) complement lookup](#seen-set-for-o1-complement-lookup)
  - [Hashing tuples & frozensets as keys](#hashing-tuples--frozensets-as-keys)
- [Gotchas / edge cases](#gotchas--edge-cases)
- [Practice problems](#practice-problems)
  - [Two Sum](#1-two-sum--complement-lookup)
  - [Group Anagrams](#2-group-anagrams--canonical-key)
  - [Longest Consecutive Sequence](#3-longest-consecutive-sequence--set-membership)
  - [Subarray Sum Equals K](#4-subarray-sum-equals-k--prefix-sum--hashing)
  - [First Unique Character](#5-first-unique-character--frequency-map)

## What it is

A **hash table** maps keys to values by running each key through a **hash function** that computes an array index, so lookup, insert, and delete are **O(1) on average** — no search, just compute-where-it-goes and jump there.

Mental model: **a coat check.** You hand over a coat (the key); the attendant runs a rule on it (the hash function) to pick a numbered hook (the bucket), and hangs it there. To get it back, the same rule recomputes the same hook — no walking the racks. Two coats can hash to the same hook (a **collision**); the table needs a plan for that, and that plan is what separates a toy from a real hash table.

> **Takeaway (say this out loud):** "A hash table turns a key into an array index via a hash function, giving O(1) average lookup — the catch is collisions and the resize that keeps them rare."

## How it works

Three pieces: a backing **bucket array**, a **hash function** that maps a key to a bucket index, and a **collision strategy** for when two keys land in the same bucket.

```
key "apple"  ──hash──▶  3847122  ──% capacity (8)──▶  bucket 2
                                                         │
bucket array:   0     1     2      3     4     5     6     7
              [   ] [   ] [apple] [   ] [   ] [   ] [   ] [   ]
                            ▲ store (key, value) here; O(1) to compute + jump
```

**Lookup** runs the same hash on the query key, recomputes the same index, and checks that bucket — O(1) to compute, O(1) to jump. **Insert** does the same and writes there. **Delete** does the same and clears it. The array's [O(1) indexed access](./array.md) is what makes the jump free; the hash function is what turns an arbitrary key (a string, a tuple) into a valid index.

The whole structure rests on one bet: **the hash function spreads keys evenly across buckets**, so each bucket holds ~1 entry and the operations stay O(1). When that bet fails — many keys collide into one bucket — the bucket degrades into a linear scan and operations slide toward O(n). Keeping the bet good (a strong hash + resizing before buckets fill) is the entire engineering of a hash table, covered in [Hashing & collisions](#hashing--collisions).

## Operations

| Operation           | Time (avg) | Time (worst) | Space |
| ------------------- | ---------- | ------------ | ----- |
| Insert `m[k] = v`   | O(1)       | O(n)         | O(1)  |
| Lookup `m[k]`       | O(1)       | O(n)         | O(1)  |
| Delete `del m[k]`   | O(1)       | O(n)         | O(1)  |
| Membership `k in m` | O(1)       | O(n)         | O(1)  |
| Iterate all entries | O(n + b)   | O(n + b)     | O(1)  |

Worst case is O(n) when every key collides into one bucket (a degenerate hash or an adversarial input). `b` = number of buckets; iteration walks the whole bucket array, so a sparse table with many empty buckets still costs O(b). **There is no ordering** — iteration order is unspecified (insertion-ordered in CPython dicts since 3.7, but never sorted).

## Complexity summary

| Operation | Best | Average | Worst                       |
| --------- | ---- | ------- | --------------------------- |
| Insert    | O(1) | O(1)    | O(n) (all collide / resize) |
| Lookup    | O(1) | O(1)    | O(n) (all collide)          |
| Delete    | O(1) | O(1)    | O(n) (all collide)          |

**Space:** O(n) for n entries, **plus slack** — a hash table deliberately keeps its bucket array larger than the entry count (load factor < 1) to keep collisions rare, so true footprint is O(capacity), typically 1.3–2× the entries. The **amortized** O(1) insert hides occasional O(n) **resizes** (rehash every key into a bigger array), exactly like a [dynamic array's](./dynamic-array.md) doubling.

## When to use / when not

**Reach for a hash table when:**

- You need **key→value lookup or membership** by an arbitrary key — "have I seen x?", "what's the value for k?" — in O(1) average. This is the single most common interview data structure.
- You're **counting frequencies**, deduplicating, grouping by a key, or caching computed results (memoization).
- Order doesn't matter and you have a **good hash** for your key type.

**Reach for something else when:**

- **You need sorted order or range queries** ("all keys between a and b", "the smallest key") → a **balanced BST** / sorted structure gives O(log n) ordered ops; a hash table has no order at all. <!-- balanced-bst not yet written -->
- **You need guaranteed worst-case latency** → the O(n) resize/collision tail makes hash tables unsuitable for hard-real-time; a balanced tree's O(log n) is a firm ceiling.
- **Keys are small bounded integers** → a plain [array](./array.md) indexed directly (`freq[v]`) beats a hash table on constant factor with zero hashing overhead (see [CP-primitives](#cp-primitives)).
- **You need prefix lookups on string keys** → a [trie](./trie.md) gives prefix/autocomplete queries a hash table can't.

Rule of thumb: **hash table for "lookup by key, order irrelevant"; tree for "lookup by key, order matters."** If the problem says "sorted", "range", "next-greater-key", or "k-th smallest", it's not a hash table.

Real-world: hash tables back **database hash indexes and hash joins**, every language's `dict`/`map`/`object`, **in-memory caches** (Redis is essentially a giant hash table), symbol tables in compilers, and deduplication everywhere. The distributed cousin — spreading keys across many servers with minimal reshuffling on resize — is [consistent hashing](../../system-design/algorithms/consistent-hashing.md).

## Comparison

How the hash table stacks up against the structures you'd weigh it against in an interview:

| Structure            | Lookup by key | Insert/delete | Ordered?  | Range / min / k-th | Memory                 | Pick it when…                              |
| -------------------- | ------------- | ------------- | --------- | ------------------ | ---------------------- | ------------------------------------------ |
| **Hash table**       | **O(1)** avg  | **O(1)** avg  | no        | no (O(n))          | scattered + slack      | key→value lookup, counting, dedup          |
| Balanced BST         | O(log n)      | O(log n)      | **yes**   | **O(log n)**       | scattered + ptrs       | ordered keys, range queries, k-th smallest |
| Sorted array         | O(log n)      | O(n)          | yes       | O(log n) lookup    | contiguous, tight      | static data, binary search, cache-tight    |
| Direct-address array | **O(1)**      | **O(1)**      | by index  | by index           | contiguous, dense      | keys are small bounded integers            |
| Trie                 | O(L) by len   | O(L)          | by prefix | prefix queries     | scattered + child ptrs | string keys, prefix/autocomplete           |

The hash table's column is the only one with **O(1) average lookup for arbitrary keys**. Every rival either restricts the key type or buys ordering by giving up that O(1).

## Variants

- **Hash set** — values dropped, keys only; an O(1) membership structure (`x in s`). The dedup/seen-set workhorse. Its own page: [Hash Set](./hash-set.md).
- **Multimap** — one key → many values (a hash map whose value is a list/set). Used for grouping; Python's `collections.defaultdict(list)`.
- **Counter / multiset** — key → count; insertion increments rather than overwrites. `collections.Counter`. A frequency-map shape; the technique lives in [CP-primitives](#cp-primitives).
- **Ordered / insertion-ordered map** — preserves insertion order on iteration (Python `dict` since 3.7, Java `LinkedHashMap`). Still O(1); order is a free bonus, not a sorted order.
- **Concurrent hash map** — sharded/striped locking for thread-safe O(1) access (Java `ConcurrentHashMap`). The concurrency story, not a different algorithm.
- **Consistent hashing** — distributes keys across N servers so adding/removing a server reshuffles only ~1/N of keys, not all. The distributed-systems variant: [consistent hashing](../../system-design/algorithms/consistent-hashing.md).

## Hashing & collisions

This is the heart of the structure — everything that separates a real hash table from "an array with a `%`" lives here.

### The hash function

A **hash function** maps a key of any type to a fixed-size integer (the hash code), which is then reduced to a bucket index, usually `hash(key) % capacity`. A good hash function has three properties:

- **Deterministic** — the same key always hashes to the same code (or lookup can't find what insert stored).
- **Uniform** — codes spread evenly across the range, so keys spread evenly across buckets. Clustering is what kills O(1).
- **Fast** — computed on every operation; a slow hash erases the speed win.

```
"cat"  ──▶  3,138,9912  ──% 8──▶  bucket 0
"dog"  ──▶  4,001,2233  ──% 8──▶  bucket 1
"cot"  ──▶  3,138,0012  ──% 8──▶  bucket 4    small key change → very different code (avalanche)
```

The **avalanche** property — a one-bit change in the key flips ~half the output bits — is why `"cat"` and `"cot"` don't cluster. For integer keys, `% capacity` with a **prime** capacity (or a good multiplicative/Fibonacci hash) avoids patterns; for strings, a polynomial rolling hash (`h = h*31 + c`) is the classic.

### Collisions are inevitable

By the **pigeonhole principle**, mapping an unbounded key space into `b` buckets _must_ produce collisions — two distinct keys with the same bucket index. And by the **birthday paradox**, they come far sooner than intuition suggests: with just ~√b inserted keys you already expect a collision. So a hash table is defined not by avoiding collisions (impossible) but by **resolving** them. Two families:

### Chaining

Each bucket holds a **[linked list](./linked-list.md)** (or small dynamic array) of all entries that hash there. Collisions just append to the chain; lookup hashes to the bucket, then walks its chain comparing keys.

```
bucket 2: ──▶ [("apple", 3)] ──▶ [("grape", 9)] ──▶ /     two keys collided here
```

- **Pro:** simple; handles high load factor gracefully (degrades smoothly); deletion is trivial (unlink).
- **Con:** pointer overhead per entry; chains scatter in memory → cache misses; a bad hash degrades a bucket to an O(n) list. Java's `HashMap` upgrades a long chain to a balanced tree (O(log n)) past a threshold to bound the damage.

### Open addressing

All entries live **in the bucket array itself** — no chains. On collision, **probe** for the next free slot by a rule: **linear probing** (`+1, +2, …` — cache-friendly but suffers primary clustering), **quadratic probing** (`+1, +4, +9, …` — breaks clusters), or **double hashing** (step size from a second hash — best spread). Lookup probes the same sequence until it finds the key or an empty slot.

```
linear probing, "grape" wants bucket 2 but it's taken:
   0     1     2        3        4
 [   ] [   ] [apple] [grape] [   ]     probe 2 → full → try 3 → free → place
```

- **Pro:** no pointers, everything inline → excellent cache locality, lower memory. CPython's `dict` uses open addressing.
- **Con:** clustering degrades probes; **deletion needs tombstones** (a "was-here" marker), or lookups for later keys stop early at the gap; performance collapses as load factor nears 1, so it must resize earlier (typically ≤ 0.66).

### Load factor & resize

The **load factor** α = entries / buckets is the dial that controls collision rate. As α rises, chains lengthen / probes grow, and O(1) slips toward O(n). The fix: when α crosses a threshold (chaining ~0.75, open addressing ~0.66), **resize** — allocate a bigger bucket array (usually 2×) and **rehash every entry** into it (the index `hash % capacity` changes when capacity changes, so you can't just copy).

```
α = 6/8 = 0.75 → resize to 16 buckets → rehash all 6 keys → α = 6/16 = 0.375
```

Resize is **O(n)** — but it happens rarely (every doubling), so it amortizes to **O(1) per insert**, the same geometric argument as [dynamic-array doubling](./dynamic-array.md#memory-layout). This is why insert is "O(1) average/amortized, O(n) worst": the worst is a resize landing on your insert.

## Implementation

A separate-chaining hash table with the core ops. Pseudocode states the contract; Python is the idiomatic reference (in real life you'd just use `dict` — this is to show the machinery).

**Pseudocode (CLRS-style contract):**

```
HASH-INSERT(T, k, v)
1   if T.size / T.capacity ≥ MAX_LOAD          ▷ resize before it gets crowded
2       HASH-RESIZE(T, 2 × T.capacity)
3   i = HASH(k) mod T.capacity
4   for each (key, val) in T.buckets[i]         ▷ key already present?
5       if key == k
6           update its value to v; return
7   append (k, v) to T.buckets[i]               ▷ new key → chain it
8   T.size = T.size + 1

HASH-GET(T, k)
1   i = HASH(k) mod T.capacity
2   for each (key, val) in T.buckets[i]         ▷ walk the chain
3       if key == k
4           return val
5   return NOT-FOUND
```

**Python (reference — idiomatic):**

```python
from typing import Generic, Hashable, Iterator, Optional, TypeVar

K = TypeVar("K", bound=Hashable)
V = TypeVar("V")


class HashMap(Generic[K, V]):
    """Separate-chaining hash map; resizes at load factor 0.75."""

    def __init__(self, capacity: int = 8) -> None:
        self._capacity = capacity
        self._size = 0
        self._buckets: list[list[tuple[K, V]]] = [[] for _ in range(capacity)]

    def _index(self, key: K) -> int:
        return hash(key) % self._capacity        # built-in hash → bucket

    def put(self, key: K, value: V) -> None:
        if self._size / self._capacity >= 0.75:  # keep load factor low
            self._resize(self._capacity * 2)
        bucket = self._buckets[self._index(key)]
        for i, (k, _) in enumerate(bucket):
            if k == key:
                bucket[i] = (key, value)          # update existing
                return
        bucket.append((key, value))               # new key
        self._size += 1

    def get(self, key: K) -> Optional[V]:
        for k, v in self._buckets[self._index(key)]:
            if k == key:
                return v
        return None

    def _resize(self, new_capacity: int) -> None:
        old = self._buckets
        self._capacity = new_capacity
        self._buckets = [[] for _ in range(new_capacity)]
        self._size = 0
        for bucket in old:                        # rehash everything
            for k, v in bucket:
                self.put(k, v)

    def __iter__(self) -> Iterator[K]:
        return (k for bucket in self._buckets for k, _ in bucket)
```

**Contest velocity — never hand-roll this.** In a contest you use the built-ins, which are the fast path:

```python
from collections import defaultdict, Counter

d = defaultdict(int)          # missing keys default to 0 — no `if k in d` guard
d[x] += 1

c = Counter(words)            # frequency map in one call
c.most_common(3)              # top-3 by count

seen = set()                  # O(1) membership; the seen-set pattern
```

`dict`/`set`/`Counter`/`defaultdict` are C-implemented open-addressing tables — orders of magnitude faster than the teaching class above. The class is for explaining collisions, not for the contest.

## CP-primitives

The hash table's contest value isn't the structure — it's the patterns it unlocks. Three that appear constantly.

### Frequency map / counter

Count occurrences of each key in one O(n) pass — the substrate for anagrams, "most frequent", "first unique", majority element.

```python
from collections import Counter
freq = Counter(s)             # {char: count}, O(n)
```

**Why for CP:** turns "how many of each?" from an O(n²) double-loop into O(n) with a one-liner. The single most-used contest primitive after prefix sums.

### Seen-set for O(1) complement lookup

Sweep once, and for each element ask "have I already seen the value that completes my target?" — a set/map gives that answer in O(1), collapsing an O(n²) pair-search to O(n).

```python
seen = set()
for x in nums:
    if target - x in seen:    # complement already seen → pair found
        return True
    seen.add(x)
```

**Why for CP:** the two-sum trick generalized — any "find a pair/complement" problem drops from O(n²) to O(n) by trading memory for time.

### Hashing tuples & frozensets as keys

Python hashes any **immutable** value, so a `tuple`, `frozenset`, or sorted-string can be a dict/set key — perfect for memoizing on a multi-part state or grouping by a canonical signature.

```python
memo: dict[tuple[int, int], int] = {}   # DP state (i, j) → answer
groups: dict[str, list[str]] = {}       # key = "".join(sorted(word)) → anagram group
```

**Why for CP:** lets you memoize DP over compound states and group by a derived key without inventing an encoding — `tuple` keys are O(1) to hash and compare.

## Gotchas / edge cases

- **Mutable keys are a landmine.** A key's hash must never change while it's in the table. Using a `list` as a key fails (unhashable in Python); worse, mutating an object after insertion (in languages that allow it) makes its old slot unreachable — the entry is "lost" though still in memory. **Keys must be immutable** (`tuple`, not `list`; `frozenset`, not `set`).
- **O(1) is _average_, not guaranteed.** A degenerate hash or adversarial input (all keys colliding) degrades every op to O(n). Hash-flooding DoS attacks exploit exactly this; production hash tables use **randomized seeds** (Python's `PYTHONHASHSEED`) to defeat crafted-collision attacks. Never claim worst-case O(1) in an interview — say "O(1) average, O(n) worst on collisions".
- **Resize cost hides in the average.** Insert is amortized O(1), but a single insert that triggers a rehash is O(n). If the problem cares about worst-case per-op latency (real-time systems), the hash table's resize spike disqualifies it — reach for a balanced tree's firm O(log n).
- **Iteration order is not sorted.** CPython preserves _insertion_ order, but that is not sorted order and is not portable across languages. If you need sorted output, sort explicitly or use a tree — relying on dict order for sortedness is a classic bug.
- **`==` and `hash` must agree (the contract).** Two keys equal by `==` must have the same hash, or lookup misses entries it should find. When you make a custom class a key, override **both** `__hash__` and `__eq__` consistently — overriding one without the other silently breaks the table.
- **`float` keys and NaN.** `NaN != NaN`, so a `NaN` key can never be looked up again (it won't equal itself); float keys also suffer precision surprises. Avoid floats as keys; use a rounded/int representation.

## Practice problems

Five staples, each a **distinct** hashing technique — no two solved the same way.

### 1. Two Sum — _complement lookup_

**Problem.** Given an integer array `nums` and a target, return the indices of the two numbers that add to `target`. Exactly one solution exists. E.g. `nums = [2, 7, 11, 15], target = 9` → `[0, 1]`.

**Approach.** The seen-map primitive: sweep once, storing each value→index. For each `x`, check if `target - x` is already in the map — if so, you've found the pair in O(1). One pass, trading O(n) memory to drop the brute-force O(n²) double loop. Storing the index (not just the value) lets you return positions.

```python
def two_sum(nums: list[int], target: int) -> list[int]:
    seen: dict[int, int] = {}            # value -> index
    for i, x in enumerate(nums):
        if target - x in seen:
            return [seen[target - x], i]
        seen[x] = i
    return []
```

**Complexity.** O(n) time, O(n) space. Pattern: complement / seen-map.

### 2. Group Anagrams — _canonical key_

**Problem.** Given a list of strings, group the anagrams together (any order). E.g. `["eat","tea","tan","ate","nat","bat"]` → `[["eat","tea","ate"],["tan","nat"],["bat"]]`.

**Approach.** Two strings are anagrams iff their sorted characters match — so the **sorted string is a canonical key**. Bucket each word under its sorted-char signature in a `defaultdict(list)`. (Faster signature: a 26-count tuple, avoiding the O(L log L) sort.) Hashing a derived canonical key is the grouping primitive.

```python
from collections import defaultdict

def group_anagrams(words: list[str]) -> list[list[str]]:
    groups: dict[str, list[str]] = defaultdict(list)
    for w in words:
        key = "".join(sorted(w))          # canonical signature
        groups[key].append(w)
    return list(groups.values())
```

**Complexity.** O(n · L log L) time (L = max word length), O(n · L) space.

### 3. Longest Consecutive Sequence — _set membership_

**Problem.** Given an unsorted integer array, return the length of the longest run of consecutive integers (e.g. `[100,4,200,1,3,2]` → `4`, the run `1,2,3,4`). Must run in O(n) — no sorting.

**Approach.** Put everything in a set for O(1) membership. Only start counting a run at a value that has **no left neighbor** (`x-1 not in set`) — that guarantees each run is walked once, keeping it O(n) overall despite the inner while. The set turns "is x+1 present?" into O(1), which is the whole trick.

```python
def longest_consecutive(nums: list[int]) -> int:
    s = set(nums)
    best = 0
    for x in s:
        if x - 1 not in s:                # only start at a run's beginning
            length = 1
            while x + length in s:
                length += 1
            best = max(best, length)
    return best
```

**Complexity.** O(n) time, O(n) space.

### 4. Subarray Sum Equals K — _prefix sum + hashing_

**Problem.** Count contiguous subarrays of `nums` (values may be negative) whose sum equals `k`. E.g. `nums = [1,1,1], k = 2` → `2`.

**Approach.** `sum(i..j] == k` ⟺ `prefix[j] - prefix[i] == k` ⟺ `prefix[i] == prefix[j] - k`. Sweep keeping a running prefix and a **hashmap of how many times each prefix value has occurred**; at each step add the count of `prefix - k`. Hashing prefix sums turns an O(n²) range scan into O(n) — and handles negatives, which a sliding window can't. (Same problem appears on [Array](./array.md#practice-problems); here the hashing is the star.)

```python
from collections import defaultdict

def subarray_sum(nums: list[int], k: int) -> int:
    count = prefix = 0
    seen: dict[int, int] = defaultdict(int)
    seen[0] = 1                            # empty prefix
    for x in nums:
        prefix += x
        count += seen[prefix - k]
        seen[prefix] += 1
    return count
```

**Complexity.** O(n) time, O(n) space.

### 5. First Unique Character — _frequency map_

**Problem.** Given a string, return the index of the first non-repeating character, or -1 if none. E.g. `"leetcode"` → `0` (`l`), `"loveleetcode"` → `2` (`v`).

**Approach.** Two passes with a frequency map: first count every character, then scan left to right for the first with count 1. The counter primitive in its plainest form — O(n) instead of an O(n²) "for each char, scan the rest". A bounded 26-array would shave the constant (see [Array CP-primitives](./array.md#cp-primitives)).

```python
from collections import Counter

def first_uniq_char(s: str) -> int:
    freq = Counter(s)                      # pass 1: count
    for i, ch in enumerate(s):            # pass 2: first with count 1
        if freq[ch] == 1:
            return i
    return -1
```

**Complexity.** O(n) time, O(1) space (alphabet bounded at 26).
