# Radix Sort

## Prerequisites

- **Big-O Notation** [Must read] - radix sort's "O(d·(n + b)) beats O(n log n)" claim only makes sense once you can read what `d`, `b`, and the comparison bound mean. <!-- U9: not-yet-written target — wire to `algorithms/big-o-notation.md` (bracket-link form) once that page exists. -->
- [Array](../data-structures/array.md) [Must read] - each digit pass is a counting sort over array indices; the bucketing is direct-address array access.
- [Counting Sort](./counting-sort.md) [Must read] - radix sort _is_ counting sort run once per digit; you must understand the stable counting-sort pass before this page makes sense.
- [Sorting](./sorting.md) [Should read] - the hub: where radix sort sits, and the comparison lower bound it sidesteps by sorting on digits, not comparisons.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Table of Contents](#table-of-contents)
- [What it is](#what-it-is)
- [Intuition](#intuition)
- [How it works](#how-it-works)
- [Correctness / invariant](#correctness--invariant)
- [Complexity derivation](#complexity-derivation)
- [Constraints & approach](#constraints--approach)
- [When to use / when not](#when-to-use--when-not)
- [Comparison](#comparison)
- [Key & distribution](#key--distribution)
- [Edge cases](#edge-cases)
- [Implementation](#implementation)
- [What the interviewer probes for](#what-the-interviewer-probes-for)
- [Practice problems](#practice-problems)
  - [Sort an Array of Large Integers](#1-sort-an-array-of-large-integers--lsd-radix-sort)
  - [Maximum Gap](#2-maximum-gap--radix-sort-then-scan)
  - [Sort Strings of Equal Length](#3-sort-strings-of-equal-length--msd-vs-lsd-radix)
  - [Maximum Number from Concatenation](#4-maximum-number-from-concatenation--digit-aware-ordering)

## What it is

**Radix sort** sorts fixed-width keys (integers, fixed-length strings) by processing them **one digit at a time**, using a stable [counting sort](./counting-sort.md) on each digit. The least-significant-digit (LSD) variant starts from the rightmost digit and works left; because each pass is _stable_, sorting on a more-significant digit preserves the order already established by the less-significant ones.

Mental model: **the old punch-card sorting machines.** Feed the deck through once binned by the ones digit, stack the bins back in order, feed through again binned by the tens digit, and so on. After the last (most-significant) pass the whole deck is sorted — no card was ever compared to another.

Why it exists: [counting sort](./counting-sort.md) is linear but dies when the key range `k` is huge. Radix sort keeps `k` small by never looking at the whole key at once — each pass sorts on a single digit whose range is just the **base `b`** (10 for decimal, 256 for bytes). For `d`-digit keys it runs in **O(d·(n + b))**, which for fixed-width keys (`d`, `b` constant) is **O(n)** — beating the O(n log n) comparison bound, on keys far too wide for plain counting sort.

> **Takeaway (say this out loud):** "Radix sort runs a stable counting sort per digit, least-significant first — O(d·(n + b)), linear for fixed-width keys — because stability makes each pass refine the previous one's order without comparing."

**Complexity:** O(d·(n + b)) time, O(n + b) space — `d` digits, base `b`.

## Intuition

Two questions: why digit-by-digit, and why does least-significant-first work?

**Why digits:** counting sort's only weakness is a large key range `k`. A 9-digit number has `k = 10⁹` — hopeless for one counting array. But a single decimal digit has range `b = 10`. By sorting on one digit at a time you replace one impossible counting sort (`k = 10⁹`) with `d = 9` cheap ones (`b = 10` each). You've decomposed a wide key into `d` narrow ones.

**Why LSD (least-significant first):** this is the subtle part. After sorting by the ones digit, numbers are ordered by their ones digit. Now sort _stably_ by the tens digit: numbers with the same tens digit keep their relative order — which is the ones-digit order from the previous pass. So within each tens-digit group, ties are already broken correctly by the ones digit. Induct: after the `i`-th pass the keys are correctly sorted by their last `i` digits. After all `d` passes, sorted by the full key. **Stability is load-bearing** — drop it and each pass scrambles the previous pass's work, and the algorithm produces garbage.

## How it works

LSD radix sort on `a = [170, 45, 75, 90, 2, 802, 24, 66]`, base 10. Three passes (max is 3 digits).

**Pass 1 — sort by the ones digit** (stable):

```
key:    170  45  75  90   2  802  24  66
ones:    0    5   5   0   2    2    4   6
sorted: 170  90   2  802  24  45  75  66
        └0─┘└0┘ └─2─┘└2┘ └4┘ └5┘└5┘ └6┘     ← within each ones-digit group, input order kept
```

**Pass 2 — sort by the tens digit** (stable, on Pass 1's output):

```
key:    170  90   2  802  24  45  75  66
tens:    7    9   0    0   2   4   7   6
sorted:   2  802  24  45  66  170  75  90
        └0┘ └0┘  └2┘ └4┘ └6┘ └7─┘ └7┘ └9┘   ← ones-digit order survives inside tens groups
```

**Pass 3 — sort by the hundreds digit** (stable):

```
key:      2  802  24  45  66  170  75  90
hundreds: 0    8   0   0   0    1   0   0
sorted:   2   24  45  66  75  90  170  802
        └─────────0─────────┘ └1┘ └─8─┘     ✓ fully sorted
```

Each pass is a counting sort over `b = 10` buckets; stability carries the lower-digit order forward. No two keys were compared — every move was a digit-indexed bucket placement.

## Correctness / invariant

The correctness is an induction over passes, resting entirely on the **stability of each counting-sort pass**:

- **Invariant:** after pass `i` (having sorted on digits `1..i`, counting from the least significant), the array is sorted by the **last `i` digits** of each key, treating those `i` digits as a single number.
- **Base case:** after pass 1, the array is sorted by digit 1 (the ones digit) — directly, since pass 1 is a counting sort on that digit.
- **Inductive step:** assume the array is sorted by the last `i-1` digits. Pass `i` stably sorts by digit `i` (the next more-significant one). Keys with different digit-`i` values are now ordered by that digit — correct, since it dominates. Keys with the _same_ digit-`i` value retain their pre-pass relative order (stability), which by hypothesis is sorted by the last `i-1` digits. So the whole array is now sorted by the last `i` digits.
- **Termination:** after pass `d`, the array is sorted by all `d` digits — the full keys.

The single point of failure is stability: if any pass reorders equal-digit keys, the inductive step breaks and the invariant collapses. That's why radix sort _must_ use a stable inner sort (counting sort, built with the prefix-sum + reverse-scan), and why the [counting-sort](./counting-sort.md) page stresses its stability.

## Complexity derivation

Let `d` = number of digits, `b` = base (bucket count per pass), `n` = element count.

- **Per pass:** one stable counting sort over base-`b` digits → Θ(n + b).
- **Number of passes:** `d`.

```
T(n) = Θ(d · (n + b))
```

**For fixed-width keys** — `d` and `b` constant (e.g. 32-bit integers in base 256 → `d = 4`, `b = 256`) — this is **Θ(n)**, linear, beating O(n log n). The relationship that matters: `d = ⌈log_b(max_key)⌉`, so the base `b` trades against the digit count `d`. A larger base means fewer passes but bigger counting arrays (more `b` per pass); base 256 (one byte per pass) is the usual sweet spot for integers. **Space** is Θ(n + b): the output buffer (`n`) plus one counting array per pass (`b`, reused across passes).

The comparison to comparison sorts: radix is O(d·n), comparison sorts are O(n log n). Radix wins when `d < log n` — i.e. when keys are short relative to how many there are. For `n = 10⁶` 32-bit integers, `d = 4` (base 256) vs `log₂(10⁶) ≈ 20` — radix does ~5× fewer linear passes.

## Constraints & approach

| Constraint                                   | Expected complexity | What it tells you                                                                            |
| -------------------------------------------- | ------------------- | -------------------------------------------------------------------------------------------- |
| fixed-width integer keys, large `n`          | O(d·n) ≈ O(n)       | The home case — wide keys but bounded width _invite_ radix over an impossible counting sort. |
| keys `0..10⁹`, `n ≤ 10⁶`                     | O(d·n), d ≈ 4–9     | Counting sort's `k = 10⁹` is dead; radix with base 256 (`d ≈ 4`) is linear.                  |
| fixed-length strings, small alphabet         | O(d·(n + b))        | Treat each character as a digit, base = alphabet size; LSD or MSD radix.                     |
| variable-length keys / arbitrary comparables | O(n log n)          | No fixed digit structure → radix doesn't apply; use a comparison sort.                       |
| `d ≥ log n` (keys very wide vs few elements) | O(n log n) better   | When digit count rivals `log n`, radix loses its edge — comparison sort wins.                |

The senior reading: radix needs a **fixed-width, digit-decomposable key** and pays off when `d ≪ log n`. The tells are "32/64-bit integers", "fixed-length strings", "sort 10⁶ numbers" with a huge value range; the anti-tells are variable-length keys, arbitrary objects, or so few elements that `log n` is already tiny.

## When to use / when not

Reach for radix sort when you have **many fixed-width keys** — integers or fixed-length strings — especially when the value range is too large for plain [counting sort](./counting-sort.md) but the _width_ is bounded. It's linear there and beats O(n log n), with stability for free. It's the tool for sorting large volumes of numeric or fixed-format data: IP addresses, fixed-length IDs, timestamps, byte strings.

Don't use it for **arbitrary comparable types** (no digit decomposition), **variable-length keys** without careful padding (different lengths need MSD radix or length-aware handling), or when **`d` approaches `log n`** — at that point a comparison sort like [quicksort](./quicksort.md) does fewer total passes. It also has a **larger constant factor and worse cache behavior** than quicksort in practice, so for general in-memory sorting of moderate `n`, quicksort/introsort usually wins wall-clock despite radix's better asymptotic.

Radix sort (and its sibling bucket sort) power **high-throughput integer/string sorting** in some database engines, GPU sort primitives, and big-data frameworks where keys are fixed-width and `n` is enormous.

## Comparison

| Algorithm                           | Time           | Space    | Stable | Compares? | Works on                                |
| ----------------------------------- | -------------- | -------- | ------ | --------- | --------------------------------------- |
| **Radix (LSD)**                     | O(d·(n + b))   | O(n + b) | ✅     | ❌        | fixed-width integer / string keys       |
| [Counting sort](./counting-sort.md) | O(n + k)       | O(n + k) | ✅     | ❌        | integer keys, small range `k`           |
| Bucket sort                         | O(n) avg       | O(n)     | ✅\*   | ❌/✅     | uniformly distributed keys over a range |
| [Quicksort](./quicksort.md)         | O(n log n) avg | O(log n) | ❌     | ✅        | any comparable                          |
| [Merge sort](./merge-sort.md)       | O(n log n)     | O(n)     | ✅     | ✅        | any comparable                          |

Radix sort is counting sort's answer to the large-`k` problem: where counting sort needs `k` buckets for the whole key, radix needs only `b` buckets per digit and pays `d` passes. The two are the same family — radix _is_ repeated counting sort — distinguished by whether the key fits one bounded pass (counting) or needs digit decomposition (radix).

## Key & distribution

The **Distribution** family, scaled to wide keys by decomposition:

- **The key.** A **fixed-width** key that splits into `d` digits, each in `[0, b)`. Integers split into base-`b` digits; fixed-length strings split into characters (base = alphabet size). The fixed width is the requirement — it's what makes "`d` passes" a constant.
- **The base `b` (per-pass range).** Radix keeps the per-pass counting range at `b`, not the full key range `k`. This is the core move: `k = b^d` could be astronomical, but each pass only ever allocates `b` buckets. Choosing `b` trades passes against per-pass memory — `d = ⌈log_b(max)⌉`, so bigger `b` → fewer passes, larger arrays. Base 256 (byte-at-a-time) is the standard integer choice.
- **Why it sidesteps the lower bound.** Like counting sort, it makes **zero comparisons** — every move is a digit-indexed bucket placement — so the O(n log n) comparison theorem doesn't apply. Radix just extends the loophole to keys too wide for a single counting pass.
- **The space the decomposition buys.** O(n + b) instead of counting sort's O(n + k): you spend `d` passes to shrink the memory footprint from `k` to `b`. That's the explicit trade — _time (more passes) for space (smaller arrays)_ — which is exactly what makes wide-key linear sorting feasible.

## Edge cases

- **Empty / single element** — `n ≤ 1` is already sorted; with no elements there are no digits to process, so guard the max-digit computation against an empty input.
- **Varying key widths** — LSD radix assumes a common width; shorter numbers are implicitly **zero-padded** on the left (their missing high digits are 0). This is automatic for integers (`digit = (x // place) % b` yields 0 past the top), but for _strings_ of unequal length you must pad explicitly or use MSD radix — a frequent bug.
- **Negative integers (CP-flavored trap)** — digit extraction assumes non-negative values. Handle negatives by **offsetting** all keys by `-min` (as in counting sort) so they become non-negative, or by splitting into negative/positive groups, radix-sorting magnitudes, and reversing the negative group. Naively radix-sorting signed values sorts by raw digits and misplaces negatives.
- **Base choice** — too small a base (`b = 2`) means many passes (`d = 32` for 32-bit ints); too large (`b = key range`) collapses to plain counting sort with its memory problem. Base 256 balances passes vs memory for integers.
- **Stability is mandatory** — the inner counting sort _must_ be stable (prefix-sum + reverse scan). An unstable inner pass silently corrupts the result, since each pass relies on the previous pass's order being preserved within equal digits. This is the single most important correctness condition.
- **MSD vs LSD** — LSD (shown here) is simplest for fixed-width keys. MSD (most-significant first) recurses per bucket and handles variable-length keys and early termination, but is more complex; know that LSD is the default and MSD is the variable-length/string variant.

## Implementation

**Pseudocode** (LSD radix sort; `RADIX-SORT` drives a stable counting sort per digit):

```
RADIX-SORT(A, d, b)                       ▷ d digits, base b
 1  for i ← 1 to d                         ▷ least-significant digit first
 2      A ← STABLE-COUNTING-SORT-BY-DIGIT(A, i, b)
 3  return A

STABLE-COUNTING-SORT-BY-DIGIT(A, i, b)    ▷ sort A on digit i, base b, stably
 1  let C[0..b-1] ← 0, B[1..A.length] be new
 2  for each x in A
 3      C[digit(x, i, b)] ← C[digit(x, i, b)] + 1
 4  for v ← 1 to b − 1
 5      C[v] ← C[v] + C[v − 1]            ▷ prefix sum
 6  for j ← A.length downto 1            ▷ right-to-left ⇒ STABLE
 7      d ← digit(A[j], i, b)
 8      B[C[d]] ← A[j]; C[d] ← C[d] − 1
 9  return B
```

**Python** — idiomatic LSD radix for non-negative integers, plus the negative-handling note:

```python
def radix_sort(a: list[int], base: int = 10) -> list[int]:
    """Stable LSD radix sort for non-negative ints. O(d·(n + base))."""
    if not a:
        return a
    max_val = max(a)
    place = 1
    while max_val // place > 0:                  # one pass per digit
        a = _counting_sort_by_digit(a, place, base)
        place *= base
    return a


def _counting_sort_by_digit(a: list[int], place: int, base: int) -> list[int]:
    count = [0] * base
    for x in a:
        count[(x // place) % base] += 1          # this key's digit at `place`
    for v in range(1, base):
        count[v] += count[v - 1]                 # prefix sum
    out = [0] * len(a)
    for x in reversed(a):                        # right-to-left ⇒ stable
        d = (x // place) % base
        count[d] -= 1
        out[count[d]] = x
    return out


# Negatives: offset to non-negative, sort, shift back — keeps radix correct.
def radix_sort_signed(a: list[int]) -> list[int]:
    if not a:
        return a
    lo = min(a)
    shifted = radix_sort([x - lo for x in a])    # all non-negative now
    return [x + lo for x in shifted]
```

## What the interviewer probes for

- **"Why least-significant digit first?"** — Because each pass is stable, sorting a more-significant digit preserves the order from less-significant digits as the tie-break. Inductively, after `i` passes the keys are sorted by their last `i` digits. MSD-first needs per-bucket recursion to achieve the same.
- **"Why must the inner sort be stable?"** — Stability is the entire mechanism: it carries the previous passes' order forward within equal digits. An unstable inner pass scrambles that and produces a wrong result. Counting sort's prefix-sum + reverse-scan gives the needed stability.
- **"How does it beat O(n log n)?"** — No comparisons — it buckets by digit value. The comparison lower bound doesn't apply. It's O(d·n), linear for fixed-width keys, and beats comparison sorts when `d < log n`.
- **"When is it worse than quicksort?"** — When `d` approaches `log n` (very wide keys, few elements), when keys are variable-length or non-numeric, or in practice due to its larger constant and poorer cache locality. Quicksort often wins wall-clock for moderate `n` despite the worse asymptotic.
- **"Negative numbers or unequal-length strings?"** — Offset negatives to non-negative before sorting (or split by sign); zero-pad or use MSD radix for unequal-length strings. Both are classic radix pitfalls.

## Practice problems

### 1. Sort an Array of Large Integers — LSD radix sort

Sort `n` non-negative integers with a large value range (e.g. up to `10⁹`) in linear time. Constraints: `n ≤ 10⁶`, values too spread out for a single counting array — the radix signal.

**Approach:** LSD radix sort. Plain counting sort would need a `10⁹`-slot array; radix with base 256 needs only 256 buckets per pass and `d ≈ 4` passes → O(4n) = O(n). Each pass is a stable counting sort on one byte. This is the textbook "counting sort can't, radix can" case.

```python
def sort_large(nums: list[int]) -> list[int]:
    if not nums:
        return nums
    BASE = 256
    max_val, place = max(nums), 1
    while max_val // place > 0:
        count = [0] * BASE
        for x in nums:
            count[(x // place) % BASE] += 1
        for v in range(1, BASE):
            count[v] += count[v - 1]
        out = [0] * len(nums)
        for x in reversed(nums):
            d = (x // place) % BASE
            count[d] -= 1; out[count[d]] = x
        nums, place = out, place * BASE
    return nums
```

Time O(d·(n + b)) ≈ O(n), space O(n + b). Pattern: LSD radix sort, base 256.

### 2. Maximum Gap — radix sort then scan

Find the maximum difference between successive elements in the sorted order, in O(n). Constraints: the O(n) requirement rules out comparison sorting (O(n log n)).

**Approach:** Two linear-sort routes exist; radix is the cleanest to state. Radix-sort the array in O(n) (fixed-width integers), then a single linear scan for the max adjacent gap. (The pigeonhole/bucket approach also achieves O(n) without a full sort; radix is the more general "just sort it linearly" answer that the O(n) constraint permits.)

```python
def maximum_gap(nums: list[int]) -> int:
    if len(nums) < 2:
        return 0
    nums = sort_large(nums)                      # O(n) radix sort from problem 1
    return max(nums[i] - nums[i - 1] for i in range(1, len(nums)))
```

Time O(n), space O(n). Pattern: linear (radix) sort + adjacent scan.

### 3. Sort Strings of Equal Length — MSD vs LSD radix

Sort `n` strings, all of length `L`, lexicographically, faster than O(n·L·log n). Constraints: fixed length `L`, small alphabet (e.g. lowercase, `b = 26`) — strings as digit sequences.

**Approach:** Treat each character position as a digit (base = alphabet size). **LSD radix**: stably counting-sort by the last character, then the second-last, … up to the first — `L` passes, O(L·(n + b)). Because all strings share length `L`, no padding is needed. (MSD radix sorts by the first character and recurses per bucket; it allows early termination but is more complex — LSD is simpler when lengths are equal.)

```python
def sort_fixed_strings(strs: list[str], L: int, b: int = 26) -> list[str]:
    def char_idx(c: str) -> int:
        return ord(c) - ord('a')
    for pos in range(L - 1, -1, -1):             # last char → first char (LSD)
        count = [0] * b
        for s in strs:
            count[char_idx(s[pos])] += 1
        for v in range(1, b):
            count[v] += count[v - 1]
        out = [None] * len(strs)
        for s in reversed(strs):                 # stable
            d = char_idx(s[pos]); count[d] -= 1; out[count[d]] = s
        strs = out
    return strs
```

Time O(L·(n + b)), space O(n + b). Pattern: LSD radix over character positions.

### 4. Maximum Number from Concatenation — digit-aware ordering

Arrange a list of non-negative integers to form the largest possible concatenated number (e.g. `[3, 30, 34, 5, 9] → "9534330"`). Constraints: `n ≤ 100`; the keys are numbers but the order is _digit-string_ based, not numeric.

**Approach:** Not a radix sort, but a **digit-aware comparator** — the conceptual sibling of treating numbers as digit strings. Order two numbers `x, y` by whether `xy` (concatenation) exceeds `yx`; this custom order, applied with any sort, yields the largest concatenation. It belongs here because the insight is the same as radix's: the _digit representation_, not the numeric value, drives the ordering.

```python
from functools import cmp_to_key

def largest_number(nums: list[int]) -> str:
    def cmp(x: str, y: str) -> int:
        if x + y > y + x: return -1              # xy bigger → x first
        if x + y < y + x: return 1
        return 0
    s = sorted(map(str, nums), key=cmp_to_key(cmp))
    out = "".join(s)
    return "0" if out[0] == "0" else out         # all-zeros edge case
```

Time O(n log n · L) for the comparisons (`L` = digit length), space O(n). Pattern: custom digit-string comparator.
