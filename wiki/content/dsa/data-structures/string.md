# String

## Prerequisites

- **Big-O Notation** [Must read] - string operations hide costs (concatenation, slicing); you need the cost model to see why a loop of `+=` is O(n²). <!-- U9: not-yet-written target — wire to `algorithms/big-o-notation.md` once that page exists. -->
- [Array](./array.md) [Must read] - a string is an array of characters; everything about contiguity, indexing, and the O(n) middle-insert applies directly.
- [Dynamic Array](./dynamic-array.md) [Should read] - building a string incrementally is the dynamic-array append problem; the amortization argument explains why you join a list instead of `+=`.

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
  - [Character-count array (bounded alphabet)](#character-count-array-bounded-alphabet)
  - [Polynomial rolling hash](#polynomial-rolling-hash)
  - [Two pointers / sliding window on characters](#two-pointers--sliding-window-on-characters)
- [Gotchas / edge cases](#gotchas--edge-cases)
- [Practice problems](#practice-problems)
  - [Valid Anagram](#1-valid-anagram--character-count)
  - [Longest Substring Without Repeating Characters](#2-longest-substring-without-repeating-characters--sliding-window)
  - [Valid Palindrome](#3-valid-palindrome--two-pointers)
  - [Find All Anagrams in a String](#4-find-all-anagrams-in-a-string--fixed-window--count-match)
  - [Implement strStr / Find the Index](#5-implement-strstr--find-the-index--rolling-hash-rabinkarp)

## What it is

A **string** is an immutable (in most modern languages) sequence of characters stored as a contiguous array — an [array](./array.md) whose elements happen to be characters, with a library of text-specific operations on top.

Mental model: **a row of character lockers, sealed shut.** It's an array — O(1) indexed access, contiguous memory — but with one extra rule in Python/Java/JS: **you can't change a character in place.** Any "edit" (append, replace, slice-and-join) builds a _new_ string. That immutability is the source of the one string-specific cost that bites everyone: a loop of `s += c` is O(n²), because each `+=` copies the whole string.

> **Takeaway (say this out loud):** "A string is an immutable character array — O(1) indexing, but every mutation copies, so build with a list and `join`, never `+=` in a loop."

## How it works

A string is laid out exactly like an [array](./array.md): characters in a contiguous block, reachable in O(1) by index via `base + i × char_size`. The text-specific machinery is two things: an **encoding** (how a character maps to bytes) and **immutability** (whether the block can be modified in place).

```
s = "hello"

index:    0     1     2     3     4
        +-----+-----+-----+-----+-----+
        |  h  |  e  |  l  |  l  |  o  |
        +-----+-----+-----+-----+-----+
        s[2] = 'l'  →  O(1), same address arithmetic as an array
```

**Immutability changes the cost model.** In Python/Java/JS a string can't be edited in place, so operations that "look" cheap actually allocate:

```
s = "cat"
s += "s"        # does NOT extend "cat" — allocates a new 4-char block "cats" and copies

in a loop:
for c in chars:  s += c     # each += copies the whole string → 1+2+3+...+n = O(n²)!
```

The fix is to **accumulate into a mutable structure** (a list, or a `StringBuilder`/`bytearray`) and convert once at the end — turning O(n²) into O(n). This is the dynamic-array amortization argument ([Dynamic Array](./dynamic-array.md)) applied to text, and it's the single most important practical string fact.

**Encoding matters for "length" and indexing.** ASCII is one byte per character; **UTF-8** is variable-width (1–4 bytes), so "the 5th character" is not "the 5th byte". Python 3 strings index by Unicode code point (so `len`/indexing are by character), but a single emoji can be multiple code points — see [Gotchas](#gotchas--edge-cases).

## Operations

| Operation                       | Time                        | Space       |
| ------------------------------- | --------------------------- | ----------- |
| Access by index `s[i]`          | O(1)                        | O(1)        |
| Length `len(s)`                 | O(1)                        | O(1)        |
| Slice `s[i:j]`                  | O(j−i)                      | O(j−i)      |
| Concatenate `s + t`             | O(n+m)                      | O(n+m)      |
| Search substring (`in`, `find`) | O(n·m) naive / O(n+m) (KMP) | O(1) / O(m) |
| Compare / equality              | O(n)                        | O(1)        |
| Build via `+=` in a loop        | **O(n²)**                   | O(n)        |
| Build via list + `"".join`      | **O(n)**                    | O(n)        |

Slicing and concatenation **allocate** (immutability) — they're not the O(1) view they might appear to be. Naive substring search is O(n·m); [KMP / rolling hash](#polynomial-rolling-hash) bring it to O(n+m).

## Complexity summary

| Operation        | Best | Average | Worst                     |
| ---------------- | ---- | ------- | ------------------------- |
| Index            | O(1) | O(1)    | O(1)                      |
| Substring search | O(n) | O(n·m)  | O(n·m) naive / O(n+m) KMP |
| Build (correct)  | O(n) | O(n)    | O(n) (list + join)        |
| Build (`+=`)     | O(n) | O(n²)   | O(n²) (the trap)          |

**Space:** O(n) for the characters, ×1–4 for UTF-8 width. The hidden cost is **transient allocation**: every slice, concat, or `+=` creates a new string, so a loop of small edits can churn O(n²) total bytes through the allocator even when the final result is O(n). Some runtimes intern short/literal strings (deduplicating identical values), which is why `is` sometimes "works" on strings — never rely on it (see [Gotchas](#gotchas--edge-cases)).

## When to use / when not

A string is the default for text — the question is usually _what to pair it with_, not whether to use it.

**Reach for the raw string when:**

- You read text by index or scan it once — parsing, validation, pattern checks.
- The alphabet is small and bounded (lowercase letters, ASCII) — a **count array** beats a hash map (see [CP-primitives](#character-count-array-bounded-alphabet)).

**Reach for something else / pair it when:**

- **You build incrementally** → accumulate in a **list** and `"".join` once (O(n)), or a `bytearray`/`StringBuilder` — never `+=` in a loop (O(n²)). This is the #1 string mistake.
- **You need prefix queries / autocomplete** → a [trie](./trie.md), which indexes strings by shared prefix in O(L).
- **You need fast membership across many strings** → a [hash set](./hash-set.md) of strings (O(1) average) or a trie.
- **You mutate characters heavily in place** → a mutable buffer (`list(s)`, `bytearray`) and convert back once; repeatedly rebuilding an immutable string is wasteful.

Rule of thumb: **strings are arrays with an immutability tax.** Read by index freely; build with a list-and-join; reach for a trie when prefixes matter.

Real-world: strings are everywhere — every identifier, URL, log line, and JSON key; **full-text search** engines build inverted indexes over them; compilers tokenize source; and rolling-hash string matching underpins `grep`, plagiarism detection, and Git's delta compression.

## Comparison

How a string relates to the structures you'd weigh against it for text work:

| Structure                   | Indexed access | Mutable in place | Build cost         | Prefix query | Pick it when…                           |
| --------------------------- | -------------- | ---------------- | ------------------ | ------------ | --------------------------------------- |
| **String** (immutable)      | **O(1)**       | no               | O(n²) via `+=`     | no           | reading/scanning fixed text             |
| List of chars               | O(1)           | **yes**          | **O(n)** then join | no           | building/editing then converting once   |
| `bytearray` / StringBuilder | O(1)           | **yes**          | **O(n)**           | no           | heavy in-place character mutation       |
| Trie                        | O(L) by prefix | yes              | O(total chars)     | **yes**      | autocomplete, prefix sets, dictionaries |
| Hash set of strings         | n/a (by value) | —                | O(total chars)     | no           | "have I seen this whole string?"        |

The string's identity is **O(1)-indexed immutable text**. The list/`bytearray` trade immutability for cheap building; the [trie](./trie.md) trades flat storage for prefix queries.

## Variants

- **Mutable string buffer** — `bytearray` / `io.StringIO` (Python), `StringBuilder` (Java), `std::string` (C++ is mutable). Edit in place in O(1) per char, convert to an immutable string once. The right tool for incremental building.
- **C string (null-terminated)** — a raw `char*` array ending in `\0`; length is O(n) to compute (scan to the terminator), and the source of countless buffer-overflow bugs. Know it exists; modern code stores length explicitly.
- **Rope** — a balanced tree of string chunks giving O(log n) insert/delete/concat in the middle, used by text editors for huge documents where rebuilding a flat string per keystroke would be O(n). A structural variant; reach for it only at editor scale.
- **Interned string** — runtimes deduplicate identical literals into one shared object so equality can be a pointer compare. An optimization, not a different structure; see [Gotchas](#gotchas--edge-cases).
- **Suffix array / suffix automaton** — preprocessed indexes over all suffixes enabling O(log n) substring queries; the heavy CP machinery for repeated pattern search. <!-- suffix-array not yet written --> Named here; far beyond a basic interview.

## Memory layout

A string is an [array](./array.md), so its layout story is the array's — with two text-specific twists: **encoding width** and **immutability**.

**Contiguous, like an array.** Characters sit back-to-back in one block; indexing is the same `base + i × width` arithmetic, so `s[i]` is O(1) and iteration is cache-friendly.

```
ASCII "hi!" (1 byte/char):     [ 68 | 69 | 21 ]      h=0x68 i=0x69 !=0x21
                                 base  +1   +2        width = 1 → s[i] at base+i

UTF-8 "h€!" (variable width):  [ 68 | E2 82 AC | 21 ]
                                 h    └─ € is 3 bytes ─┘  !
                                 → "the 3rd character" ≠ "byte index 3"
```

**Encoding width breaks naive byte-indexing.** With ASCII, character index = byte index. With **UTF-8** (variable 1–4 bytes), they diverge: byte offset 3 might land in the middle of a multi-byte character. Python 3 hides this by indexing on code points (using a 1/2/4-byte internal representation per string), so `s[2]` is always the 3rd character — but the cost is that `len` and indexing reason about code points, and a user-perceived "character" (an emoji with skin-tone modifier) can still be several code points.

**Immutability and copy-on-edit.** The block is read-only in Python/Java/JS, so any modification allocates a fresh block and copies:

```
"cat" + "s":   read "cat" [c|a|t]  →  allocate [c|a|t|s]  →  copy all 4   (O(n+m))

build "aaaa" with += :
  ""→"a"     copy 1
  "a"→"aa"   copy 2
  "aa"→"aaa" copy 3   ...   total 1+2+3+...+n = O(n²)   ← the trap
```

The fix is the dynamic-array one: accumulate into a **mutable, over-allocating** buffer (a Python list, whose append is amortized O(1) by [doubling](./dynamic-array.md#memory-layout)) and materialize the string once with `"".join` — total O(n).

**Interning.** Many runtimes store one shared copy of identical string literals/short strings (a global table), so `"ab" is "ab"` may be `True`. It's an allocator optimization (saves memory, makes equality a possible pointer-compare) — never a semantic guarantee; compare with `==`, never `is`.

## Implementation

There's no "implement a string" — it's a language primitive. What matters is implementing the **correct build pattern** and the canonical search. Pseudocode states the build contract; Python shows the right way and the trap.

**Pseudocode (CLRS-style contract — correct O(n) build):**

```
BUILD-STRING(parts)                   ▷ parts = sequence of chunks to concatenate
1   buffer = new MUTABLE-ARRAY()      ▷ amortized O(1) append, like a dynamic array
2   for each p in parts
3       APPEND(buffer, p)             ▷ no copy of the accumulated result
4   return JOIN(buffer, "")           ▷ single O(n) materialization
                                      ▷ total O(n) — vs O(n²) if we concatenated in the loop
```

**Python (reference — idiomatic, and the trap to avoid):**

```python
# CORRECT — O(n): accumulate in a list, join once
def build_correct(parts: list[str]) -> str:
    out: list[str] = []
    for p in parts:
        out.append(p)            # amortized O(1)
    return "".join(out)          # single O(n) pass

# WRONG — O(n²): every += copies the whole accumulated string
def build_wrong(parts: list[str]) -> str:
    s = ""
    for p in parts:
        s += p                   # copies all of s each time → O(n²)
    return s

# Idiomatic string toolkit you actually reach for:
s = "Hello, World"
s.lower(); s.upper()             # case
s.split(",")                     # ['Hello', ' World']
s.strip()                        # trim whitespace
"".join(["a", "b", "c"])         # 'abc' — the correct concatenation
s[::-1]                          # 'dlroW ,olleH' — reverse via slice
s.startswith("He"); "lo" in s    # prefix / substring checks
```

**Contest velocity — lean on the stdlib.** `Counter(s)` for frequencies, `s.count(sub)`, `str.translate` for bulk char mapping, and `"".join(...)` instead of `+=` are the speed-of-coding wins. For matching, Python's `in`/`find` are C-optimized (good enough for most), and `re` covers pattern needs.

## CP-primitives

Three string techniques that dominate contest and interview text problems.

### Character-count array (bounded alphabet)

When the alphabet is small and fixed (26 lowercase letters, 128 ASCII), a plain **array indexed by character** is an O(1) frequency map with zero hashing overhead — faster and simpler than a [hash table](./hash-table.md).

```python
count = [0] * 26
for ch in s:
    count[ord(ch) - ord("a")] += 1   # direct address, no hash
```

**Why for CP:** anagram checks, frequency comparisons, and "first unique char" become O(n) with a tiny constant. A candidate who reflexively reaches for a hash map on a 26-letter alphabet is leaving speed on the table (see [Array CP-primitives](./array.md#cp-primitives)).

### Polynomial rolling hash

Map a string (or window) to a number: `h = (s[0]·pⁿ⁻¹ + s[1]·pⁿ⁻² + … + s[n-1]) mod M`. The magic: sliding the window one char right updates the hash in **O(1)** (subtract the leaving char's contribution, multiply by `p`, add the entering char) — so you compare an m-length pattern against every position in **O(n + m)** instead of O(n·m). This is **Rabin–Karp**.

```python
def rabin_karp(text: str, pat: str) -> int:
    n, m = len(text), len(pat)
    if m > n: return -1
    p, M = 31, (1 << 61) - 1            # base + large prime modulus
    pat_hash = win_hash = 0
    power = 1
    for i in range(m):                  # hash the pattern and first window
        pat_hash = (pat_hash * p + ord(pat[i])) % M
        win_hash = (win_hash * p + ord(text[i])) % M
        if i: power = (power * p) % M
    for i in range(n - m + 1):
        if win_hash == pat_hash and text[i:i+m] == pat:   # verify on hash hit
            return i
        if i < n - m:                   # roll the window O(1)
            win_hash = ((win_hash - ord(text[i]) * power) * p + ord(text[i+m])) % M
    return -1
```

**Why for CP:** O(n) substring search and the engine for "count distinct substrings", "longest common substring" (binary-search + hash), and dup-substring detection. Use a **large prime modulus** (or double hashing) to dodge collisions — anti-hash test cases target weak moduli.

### Two pointers / sliding window on characters

Treat the string as a sequence and walk two indices: opposite ends (palindrome, reverse) or a same-direction expanding/contracting window (longest substring with a constraint). A char-count array tracks the window contents in O(1).

```python
# longest substring with no repeating char — expanding window
def longest_unique(s: str) -> int:
    last: dict[str, int] = {}
    start = best = 0
    for i, ch in enumerate(s):
        if ch in last and last[ch] >= start:
            start = last[ch] + 1        # jump past the previous occurrence
        last[ch] = i
        best = max(best, i - start + 1)
    return best
```

**Why for CP:** turns "longest/shortest substring satisfying X" and palindrome checks from O(n²) to O(n). The string is the canonical home of the [two-pointers](../patterns/two-pointers.md) and [sliding-window](../patterns/sliding-window.md) patterns.

## Gotchas / edge cases

- **`s += c` in a loop is O(n²) — the cardinal string sin.** Immutability means each `+=` copies the whole accumulated string. Build with a **list + `"".join`** (or `StringBuilder`/`bytearray`) for O(n). This is the single most common string performance bug; an interviewer watches for it specifically.
- **Slicing and concatenation allocate.** `s[i:j]` and `s + t` look cheap but copy O(length) characters and allocate — they are not O(1) views. Inside a hot loop, repeated slicing (e.g. `text[i:i+m]` to compare) silently adds an O(m) factor; hash or compare incrementally instead.
- **Unicode: length and "character" are slippery.** `len(s)` counts code points, not user-perceived characters — an emoji with a modifier (👨‍👩‍👧) is several code points, and a "café" may be 4 or 5 code points depending on whether `é` is composed or `e` + combining accent. Normalize (`unicodedata.normalize`) before comparing user text; don't assume one glyph = one index.
- **Encoding mismatches corrupt data.** Reading UTF-8 bytes as Latin-1 (or vice versa) produces mojibake or `UnicodeDecodeError`. Always decode/encode with an explicit charset; "it worked on my ASCII test" hides the bug until a non-ASCII character arrives.
- **Comparing strings with `is` instead of `==`.** `is` checks object identity; it sometimes appears to work because the runtime **interns** literals, but it's not a guarantee — `a = "x"*1000; b = "x"*1000; a is b` is `False`. Always compare string _values_ with `==`.
- **Off-by-one in substring bounds (CP trap).** Window/substring problems live and die on inclusive-vs-exclusive bounds (`s[i:j]` is `[i, j)` in Python) and the `i < n - m + 1` search loop limit. The classic bug is searching one position too few or slicing one char short.

## Practice problems

Five staples, each a **distinct** string technique — no two solved the same way.

### 1. Valid Anagram — _character count_

**Problem.** Given two strings, decide if one is an anagram of the other (same characters, same counts). E.g. `"anagram"`, `"nagaram"` → true; `"rat"`, `"car"` → false.

**Approach.** Two strings are anagrams iff their character frequencies match. With a bounded alphabet, a **26-length count array** is the fastest check: increment for one string, decrement for the other, then verify all zeros. O(n) time, O(1) space (alphabet is fixed). The count-array primitive in its plainest form — no sorting, no hashing.

```python
def is_anagram(s: str, t: str) -> bool:
    if len(s) != len(t):
        return False
    count = [0] * 26
    for a, b in zip(s, t):
        count[ord(a) - ord("a")] += 1
        count[ord(b) - ord("a")] -= 1
    return all(c == 0 for c in count)
```

**Complexity.** O(n) time, O(1) space.

### 2. Longest Substring Without Repeating Characters — _sliding window_

**Problem.** Find the length of the longest substring with all distinct characters. E.g. `"abcabcbb"` → `3` (`"abc"`), `"bbbbb"` → `1`.

**Approach.** An **expanding/contracting window** with a map of each char's last index. When the current char was seen inside the window, jump the window's start past its previous occurrence — never revisiting characters, so it's one O(n) pass. The window always holds a distinct-char substring; track the max length. Classic sliding window on characters.

```python
def length_of_longest(s: str) -> int:
    last: dict[str, int] = {}
    start = best = 0
    for i, ch in enumerate(s):
        if ch in last and last[ch] >= start:
            start = last[ch] + 1        # contract past the repeat
        last[ch] = i
        best = max(best, i - start + 1)
    return best
```

**Complexity.** O(n) time, O(min(n, alphabet)) space. Pattern: [Sliding Window](../patterns/sliding-window.md).

### 3. Valid Palindrome — _two pointers_

**Problem.** Decide if a string is a palindrome, considering only alphanumeric characters and ignoring case. E.g. `"A man, a plan, a canal: Panama"` → true.

**Approach.** **Converging two pointers** from both ends: skip non-alphanumeric characters, compare the rest case-insensitively, move inward. They must match all the way to the middle. O(1) extra space — no cleaned-copy allocation needed if you skip in place. The two-pointer primitive on a string.

```python
def is_palindrome(s: str) -> bool:
    lo, hi = 0, len(s) - 1
    while lo < hi:
        while lo < hi and not s[lo].isalnum():
            lo += 1
        while lo < hi and not s[hi].isalnum():
            hi -= 1
        if s[lo].lower() != s[hi].lower():
            return False
        lo, hi = lo + 1, hi - 1
    return True
```

**Complexity.** O(n) time, O(1) space. Pattern: [Two Pointers](../patterns/two-pointers.md).

### 4. Find All Anagrams in a String — _fixed window + count match_

**Problem.** Given strings `s` and `p`, return all start indices of `p`'s anagrams in `s`. E.g. `s="cbaebabacd", p="abc"` → `[0, 6]`.

**Approach.** A **fixed-size sliding window** of length `len(p)` with two count arrays. Slide the window one char at a time, updating counts in O(1) (add the entering char, remove the leaving one), and record a match whenever the window's counts equal `p`'s counts. Comparing two 26-arrays is O(1), so the whole scan is O(n). Combines the count-array and fixed-window primitives.

```python
from collections import Counter

def find_anagrams(s: str, p: str) -> list[int]:
    if len(p) > len(s):
        return []
    need = Counter(p)
    window = Counter(s[:len(p)])
    res = [0] if window == need else []
    for i in range(len(p), len(s)):
        window[s[i]] += 1                 # char entering
        left = s[i - len(p)]
        window[left] -= 1                 # char leaving
        if window[left] == 0:
            del window[left]              # keep counters comparable
        if window == need:
            res.append(i - len(p) + 1)
    return res
```

**Complexity.** O(n) time, O(1) space (bounded alphabet). Pattern: [Sliding Window](../patterns/sliding-window.md).

### 5. Implement strStr / Find the Index — _rolling hash (Rabin–Karp)_

**Problem.** Return the index of the first occurrence of `needle` in `haystack`, or -1. E.g. `haystack="sadbutsad", needle="sad"` → `0`.

**Approach.** **Rabin–Karp**: hash the needle and the first window of the haystack, then **roll** the window hash one char at a time in O(1). On a hash match, verify the actual characters (to rule out a collision). O(n + m) average — far better than the O(n·m) brute force on adversarial inputs. The rolling-hash primitive in its defining problem.

```python
def str_str(haystack: str, needle: str) -> int:
    n, m = len(haystack), len(needle)
    if m == 0: return 0
    if m > n: return -1
    p, M = 31, (1 << 61) - 1
    target = win = 0
    power = pow(p, m - 1, M)
    for i in range(m):
        target = (target * p + ord(needle[i])) % M
        win = (win * p + ord(haystack[i])) % M
    for i in range(n - m + 1):
        if win == target and haystack[i:i+m] == needle:
            return i
        if i < n - m:
            win = ((win - ord(haystack[i]) * power) * p + ord(haystack[i+m])) % M
    return -1
```

**Complexity.** O(n + m) average time, O(1) space. (KMP gives O(n+m) worst-case without the collision risk.)
