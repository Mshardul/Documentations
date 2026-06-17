# Trie

## Prerequisites

- **Big-O Notation** [Must read] - a trie's operations are O(L) in the key _length_, not O(n) in the key _count_; you need the cost model to see why that's the win. <!-- U9: not-yet-written target — wire to `algorithms/big-o-notation.md` once that page exists. -->
- [String](./string.md) [Must read] - a trie keys on the characters of a string, one per level; the character-indexing intuition transfers directly.
- [Hash Table](./hash-table.md) [Should read] - the trie's main rival for string keys; you compare against it constantly, and each trie node often _is_ a small hash map of children.

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
- [Implementation](#implementation)
- [CP-primitives](#cp-primitives)
  - [Prefix-count augmentation](#prefix-count-augmentation)
  - [Bitwise trie for max-XOR](#bitwise-trie-for-max-xor)
- [Gotchas / edge cases](#gotchas--edge-cases)
- [Practice problems](#practice-problems)
  - [Implement a Trie](#1-implement-a-trie--insert-search-startswith)
  - [Word Search II](#2-word-search-ii--trie--dfs-on-a-grid)
  - [Replace Words](#3-replace-words--shortest-prefix-lookup)
  - [Maximum XOR of Two Numbers](#4-maximum-xor-of-two-numbers--bitwise-trie)
  - [Design Add and Search Words](#5-design-add-and-search-words--wildcard-dfs)

## What it is

A **trie** (prefix tree) is a tree that stores strings by their **characters**, one character per edge, so that all words sharing a prefix share the same path from the root — making lookup, insert, and prefix queries O(L) in the key's length, independent of how many keys are stored.

Mental model: **a shared-path dictionary, like a phone-tree menu.** To find "cat" you walk root → c → a → t; "car" shares the first two steps and branches at the third. Common prefixes are stored **once**, and "does any word start with 'ca'?" is just "can I walk the path c → a?" — the operation a [hash table](./hash-table.md) can't do, because hashing destroys prefix structure.

> **Takeaway (say this out loud):** "A trie stores strings character-by-character down a tree, so shared prefixes share a path — giving O(L) lookup and, uniquely, O(L) prefix queries that a hash map can't do."

## How it works

Each **node** represents a prefix; its **edges** are labeled by the next character, and a boolean **is-end** flag marks nodes where a complete word terminates. The root is the empty prefix. A word is a root-to-`is_end` path.

```
insert "cat", "car", "card", "dog":

           (root)
          /      \
        c          d
        |          |
        a          o
       / \         |
      t*  r        g*          *  = is_end (a complete word ends here)
          |
          d*

words:  cat (c-a-t*),  car (c-a-r*),  card (c-a-r-d*),  dog (d-o-g*)
prefix "ca" → walk c→a → exists → some word starts with "ca"  ✓
```

**Search "card":** walk c → a → r → d, check `is_end` → found. **Prefix "ca":** walk c → a, succeed → at least one word has that prefix (no `is_end` check needed). **Insert "care":** walk the shared path c-a-r, then add a new `e*` child. Every operation is a walk of length L (the word/prefix length), touching one node per character — **O(L), regardless of how many words the trie holds.** That length-not-count cost is the trie's defining property.

The shared-prefix structure is also the space story: storing "car", "card", "care", "carry" costs roughly one path for "car" plus the divergent tails — common prefixes are paid for once.

## Operations

| Operation                  | Time                          | Space (per op)        |
| -------------------------- | ----------------------------- | --------------------- |
| Insert a word (length L)   | O(L)                          | O(L) worst (new path) |
| Search exact word          | O(L)                          | O(1)                  |
| Prefix query `startsWith`  | O(L)                          | O(1)                  |
| Delete a word              | O(L)                          | O(1)                  |
| List all words with prefix | O(p + total chars of matches) | O(answer)             |
| Count words with prefix    | O(p) (with augmentation)      | O(1)                  |

Every core operation is **O(L)** — the word length — and crucially **independent of `n`, the number of stored words.** Compare a [BST](./binary-search-tree.md)'s O(log n · L) (log n comparisons, each comparing up to L chars) or a sorted scan. The prefix query is the trie's signature: O(p) for a prefix of length p.

## Complexity summary

| Operation | Best | Average | Worst |
| --------- | ---- | ------- | ----- |
| Insert    | O(L) | O(L)    | O(L)  |
| Search    | O(L) | O(L)    | O(L)  |
| Prefix    | O(p) | O(p)    | O(p)  |

**Space:** the catch. A naive trie node holds an array of child pointers sized to the **alphabet** (26 for lowercase, 256 for bytes, more for Unicode), so worst-case space is **O(n · L · alphabet)** — potentially huge and sparse, since most child slots are empty. This is the trie's central trade: blazing O(L) operations bought with heavy memory. Mitigations — a **hash map of children** per node (only present edges), or a **compressed/radix trie** that collapses single-child chains — cut the waste (see [Variants](#variants)). For a dense dictionary the prefix-sharing recovers a lot; for sparse keys the overhead bites.

## When to use / when not

**Reach for a trie when:**

- You need **prefix queries** — autocomplete, "words starting with…", longest-prefix match, type-ahead. This is the trie's reason to exist; nothing else does it as cleanly.
- You're doing **many lookups on a fixed dictionary** of strings — spell-check, word games, dictionary membership where O(L) beats hashing the whole word repeatedly.
- The keys **share lots of prefixes** — URLs, file paths, IP prefixes (routing) — so the sharing pays for the node overhead.
- You need **lexicographic ordering** of string keys — a pre-order walk emits them sorted, for free.

**Reach for something else when:**

- **You only need whole-key membership/lookup, no prefixes** → a [hash table](./hash-table.md) is O(L) to hash but with far less memory and a tiny constant; the trie's prefix power is wasted. This is the default choice unless prefixes matter.
- **Memory is tight and keys are sparse / long with few shared prefixes** → the per-node alphabet overhead explodes; a hash set is leaner.
- **Keys aren't strings/sequences** → a trie needs a sequential key (chars, digits, bits); for arbitrary objects use a [hash table](./hash-table.md) or [BST](./binary-search-tree.md).

Rule of thumb: **trie = "I need prefixes."** If the problem says "starts with", "autocomplete", "longest common prefix", or "shortest prefix", it's a trie. If it just says "is this word present", it's a hash set.

Real-world: **autocomplete / type-ahead** in search boxes and IDEs, **spell-checkers** and word-game validators (Scrabble/Boggle), **IP routing tables** (longest-prefix match via bitwise tries), **T9 / predictive text**, and dictionary-compression. A bitwise trie powers max-XOR queries in competitive programming (see [CP-primitives](#bitwise-trie-for-max-xor)).

## Comparison

How a trie relates to the structures you'd weigh against it for string keys:

| Structure               | Exact lookup | Prefix query      | Sorted iteration    | Memory                           | Pick it when…                       |
| ----------------------- | ------------ | ----------------- | ------------------- | -------------------------------- | ----------------------------------- |
| **Trie**                | O(L)         | **O(p)**          | **yes** (pre-order) | heavy (alphabet × nodes)         | prefix queries, autocomplete        |
| Hash table/set          | O(L) hash    | **no** (O(n))     | no                  | light                            | whole-key membership, no prefixes   |
| BST (balanced)          | O(L·log n)   | range-ish         | yes                 | 2 ptrs/node                      | ordered keys, range over whole keys |
| Sorted array + bisect   | O(L·log n)   | prefix via bisect | yes                 | tight                            | static dictionary, prefix-range     |
| Compressed trie (radix) | O(L)         | **O(p)**          | yes                 | **much lighter** than plain trie | prefix queries, memory-conscious    |

The trie's column is the only one with **O(p) prefix queries**. The hash table beats it on memory and whole-key lookup constant but can't do prefixes at all; the compressed trie keeps the prefix power while slashing the memory overhead.

## Variants

- **Standard (array-node) trie** — each node has a fixed array of `alphabet` child slots. Fastest child lookup (O(1) index), heaviest memory. Good for small alphabets (26 letters, 2 bits).
- **Hash-map-node trie** — each node stores children in a [hash map](./hash-table.md) keyed by character, so only present edges cost memory. Leaner for large/sparse alphabets (Unicode), slightly slower child access.
- **Compressed trie / radix tree (Patricia trie)** — collapses chains of single-child nodes into one edge labeled with a substring, drastically cutting node count and memory while keeping O(L)/O(p) operations. The variant used in IP routing and many real systems.
- **Ternary search trie** — each node has low/equal/high children (a BST of characters per level), trading some speed for far less memory than an array-node trie. A middle ground.
- **Bitwise trie (binary trie)** — keys are the **bits** of integers (alphabet = {0,1}, depth = bit-width), enabling max-XOR and longest-prefix-match queries. A structural specialization; the technique lives in [CP-primitives](#bitwise-trie-for-max-xor).
- **Suffix trie / suffix tree** — a trie of all suffixes of one string, for substring queries. Powerful but heavy; the compressed form (suffix tree/automaton) is the practical version. <!-- suffix-tree not yet written -->

## Traversal & invariant

A trie's **invariant** is structural: each edge is labeled by exactly one symbol of the alphabet, a node's path from the root spells its prefix, and `is_end` flags which prefixes are complete words. No ordering-by-value invariant like a [BST](./binary-search-tree.md) — the order is the **lexicographic order of the edge labels**.

**Traversal — pre-order yields sorted words.** Walk children in alphabetical order, emitting the accumulated string whenever you hit an `is_end` node:

```
pre-order (children A→Z), collecting at is_end:

  root → c → a → r → (is_end: "car")
                 → d → (is_end: "card")
             → t → (is_end: "cat")
       → d → o → g → (is_end: "dog")

emits:  car, card, cat, dog   ← lexicographically sorted, for free
```

This is how a trie does **ordered iteration** and **prefix listing**: to list all words under a prefix, walk to the prefix node (O(p)), then DFS its subtree collecting `is_end` paths. The `is_end` flag is load-bearing — without it you can't distinguish a stored word "car" from the mere prefix "car" of "card" (see [Gotchas](#gotchas--edge-cases)).

## Implementation

A standard trie with insert, search, and the prefix query. Pseudocode states the contract; Python uses a dict-of-children node (the lean, idiomatic choice).

**Pseudocode (CLRS-style contract):**

```
TRIE-INSERT(root, word)
1   node = root
2   for each char c in word
3       if c not in node.children
4           node.children[c] = new TRIE-NODE()    ▷ extend the path
5       node = node.children[c]
6   node.is_end = TRUE                             ▷ mark a complete word

TRIE-SEARCH(root, word)                            ▷ exact word
1   node = TRIE-WALK(root, word)
2   return node ≠ NIL and node.is_end              ▷ must be a marked word, not just a prefix

TRIE-STARTS-WITH(root, prefix)
1   return TRIE-WALK(root, prefix) ≠ NIL           ▷ path exists → prefix present (no is_end check)

TRIE-WALK(root, s)                                  ▷ follow s; NIL if path breaks
1   node = root
2   for each char c in s
3       if c not in node.children: return NIL
4       node = node.children[c]
5   return node
```

**Python (reference — idiomatic, dict-of-children):**

```python
from __future__ import annotations
from dataclasses import dataclass, field


@dataclass
class TrieNode:
    children: dict[str, "TrieNode"] = field(default_factory=dict)
    is_end: bool = False


class Trie:
    def __init__(self) -> None:
        self.root = TrieNode()

    def insert(self, word: str) -> None:
        node = self.root
        for ch in word:
            node = node.children.setdefault(ch, TrieNode())   # extend or reuse path
        node.is_end = True

    def _walk(self, s: str) -> TrieNode | None:
        node = self.root
        for ch in s:
            node = node.children.get(ch)
            if node is None:
                return None                  # path breaks → not present
        return node

    def search(self, word: str) -> bool:
        node = self._walk(word)
        return node is not None and node.is_end   # must be a complete word

    def starts_with(self, prefix: str) -> bool:
        return self._walk(prefix) is not None     # path existing is enough
```

**Contest velocity.** A `dict`-of-children trie (above) is the fast thing to write — no fixed alphabet array, no index math. For a known small alphabet (lowercase), a 26-slot list per node is faster but more code; reach for it only when profiling demands. For pure membership with no prefixes, skip the trie and use a `set`.

## CP-primitives

Two trie techniques that turn up in contests beyond basic dictionary lookup.

### Prefix-count augmentation

Store a **counter per node** = how many inserted words pass through it. Then "how many words start with prefix p?" is O(p): walk to the prefix node and read its counter. Increment on insert, decrement on delete.

```python
# in insert(): node.count += 1 at each step along the path
# count_prefix(p): walk to p's node, return node.count (0 if path breaks)
```

**Why for CP:** answers "number of strings with this prefix" in O(p) instead of O(n·p) re-scanning — the standard augmentation for prefix-frequency queries and many string-counting problems.

### Bitwise trie for max-XOR

Insert integers as **fixed-width bit strings** (most-significant bit first) into a binary trie (alphabet {0,1}). To maximize `x XOR y`, walk x's bits down the trie always choosing the **opposite** bit when available (a differing bit sets that position to 1 in the XOR) — O(bit-width) per query, e.g. 32 steps.

```python
class BitTrie:
    def __init__(self): self.root = {}
    def insert(self, x, bits=31):
        node = self.root
        for i in range(bits, -1, -1):
            b = (x >> i) & 1
            node = node.setdefault(b, {})
    def max_xor(self, x, bits=31):
        node, best = self.root, 0
        for i in range(bits, -1, -1):
            b = (x >> i) & 1
            want = 1 - b                      # prefer the opposite bit
            if want in node:
                best |= (1 << i); node = node[want]
            else:
                node = node[b]
        return best
```

**Why for CP:** "maximum XOR pair / subarray" and "XOR with a query value" drop from O(n²) to O(n · bits) — the canonical bitwise-trie trick, and a frequent hard-problem unlock.

## Gotchas / edge cases

- **Confusing a prefix with a stored word — the `is_end` flag.** Inserting "card" creates the path for "car" too, but "car" is not a stored word unless separately inserted. `search("car")` must check `is_end`; `starts_with("car")` must not. Forgetting the flag (or checking it in the wrong query) is the #1 trie bug.
- **The empty string.** Inserting `""` marks the **root** as `is_end`; searching `""` then returns true, and `starts_with("")` is always true (every word has the empty prefix). Decide whether the empty string is a valid key and handle the root flag accordingly.
- **Memory blowup on large alphabets.** An array-node trie over Unicode (or bytes) allocates a huge mostly-empty child array per node — O(n·L·alphabet) space. Use a hash-map node or a compressed/radix trie when the alphabet is large or keys are sparse; don't reflexively use 26-arrays for arbitrary text.
- **Delete must prune, not just unflag.** Removing a word should clear its `is_end` and then **delete now-childless, non-word nodes** up the path — otherwise dead branches leak memory. But stop pruning at any node that is another word's `is_end` or has other children.
- **Case sensitivity and normalization.** "Cat" and "cat" are different paths; normalize case/encoding before insert and lookup, or queries silently miss. The same Unicode-normalization caveat as [strings](./string.md#gotchas--edge-cases) applies.
- **Off-the-end walks.** A lookup whose path breaks partway (a character with no child) must return "not found" immediately — dereferencing a missing child is the crash. The `_walk` returning `None` on a broken path centralizes this.

## Practice problems

Five staples, each a **distinct** trie technique — no two solved the same way.

### 1. Implement a Trie — _insert, search, startsWith_

**Problem.** Build a trie supporting `insert(word)`, `search(word)` (exact, complete word), and `startsWith(prefix)`. E.g. after inserting "apple", `search("app")` → false, `startsWith("app")` → true, `search("apple")` → true.

**Approach.** A node per prefix with a children map and an `is_end` flag. Insert walks/extends the path and marks the last node. Search walks then checks `is_end`; startsWith walks and just checks the path exists. The `is_end` distinction between "word" and "prefix" is the whole exercise.

```python
# see Trie in Implementation — the canonical solution.
t = Trie()
t.insert("apple")
print(t.search("app"), t.starts_with("app"), t.search("apple"))   # False True True
```

**Complexity.** O(L) per operation, O(total chars) space.

### 2. Word Search II — _trie + DFS on a grid_

**Problem.** Given a grid of letters and a list of words, return all words findable by connecting 4-directionally adjacent cells (no cell reused per word). E.g. find "oath", "eat" in a board of letters.

**Approach.** Build a trie of the word list, then DFS the grid following trie edges — prune the moment the current path isn't a trie prefix (this is what makes it fast vs searching each word separately). When a DFS reaches an `is_end` node, record the word. Searching all words simultaneously through one trie is the key efficiency.

```python
def find_words(board, words):
    root = Trie(); [root.insert(w) for w in words]
    rows, cols, found = len(board), len(board[0]), set()
    def dfs(r, c, node, path):
        ch = board[r][c]
        nxt = node.children.get(ch)
        if nxt is None: return
        path += ch
        if nxt.is_end: found.add(path)
        board[r][c] = "#"                     # mark visited
        for dr, dc in ((1,0),(-1,0),(0,1),(0,-1)):
            nr, nc = r+dr, c+dc
            if 0 <= nr < rows and 0 <= nc < cols and board[nr][nc] != "#":
                dfs(nr, nc, nxt, path)
        board[r][c] = ch                      # restore
    for r in range(rows):
        for c in range(cols):
            dfs(r, c, root.root, "")
    return list(found)
```

**Complexity.** O(cells · 4^L) worst, pruned hard by the trie in practice. Pattern: [Tree & Graph Traversal](../patterns/tree-graph-traversal.md) + [Backtracking](../patterns/subsets-permutations.md).

### 3. Replace Words — _shortest-prefix lookup_

**Problem.** Given a dictionary of root words and a sentence, replace every word by the **shortest root** that is a prefix of it. E.g. roots `["cat","bat"]`, "the cattle was rattled" → "the cat was rattled".

**Approach.** Insert all roots into a trie. For each word, walk its characters down the trie, stopping at the **first** `is_end` node — that's the shortest matching root. If the path breaks before any `is_end`, keep the word. The early-stop-at-first-is_end is the shortest-prefix idiom.

```python
def replace_words(roots, sentence):
    t = Trie(); [t.insert(r) for r in roots]
    def shortest_root(word):
        node = t.root
        for i, ch in enumerate(word):
            node = node.children.get(ch)
            if node is None: return word       # no root prefixes it
            if node.is_end: return word[:i+1]  # first (shortest) root
        return word
    return " ".join(shortest_root(w) for w in sentence.split())
```

**Complexity.** O(total chars) time and space.

### 4. Maximum XOR of Two Numbers — _bitwise trie_

**Problem.** Given an array of integers, return the maximum `nums[i] XOR nums[j]`. E.g. `[3,10,5,25,2,8]` → `28` (`5 XOR 25`).

**Approach.** Insert every number's bits (MSB-first) into a **binary trie**. For each number, greedily walk choosing the **opposite** bit at each step when possible — each differing bit contributes a 1 to the XOR at that position, maximizing it. O(n · 32) instead of the O(n²) all-pairs check. The bitwise-trie CP-primitive in its defining problem.

```python
def find_maximum_xor(nums: list[int]) -> int:
    trie = BitTrie()                          # from CP-primitives
    best = 0
    for x in nums:
        trie.insert(x)
    for x in nums:
        best = max(best, trie.max_xor(x))
    return best
```

**Complexity.** O(n · B) time (B = bit-width), O(n · B) space.

### 5. Design Add and Search Words — _wildcard DFS_

**Problem.** Support `addWord(word)` and `search(word)` where `search` may contain `.` matching any single character. E.g. after adding "bad","dad", `search("b..")` → true, `search(".ad")` → true.

**Approach.** A trie for `addWord`. For `search`, DFS: at a normal character follow that one edge; at `.` recurse into **all** children. The wildcard turns the linear walk into a branching DFS, but only where dots appear, so it stays efficient for few wildcards. Combines trie traversal with backtracking on `.`.

```python
class WordDictionary:
    def __init__(self): self.root = TrieNode()
    def addWord(self, word):
        node = self.root
        for ch in word:
            node = node.children.setdefault(ch, TrieNode())
        node.is_end = True
    def search(self, word):
        def dfs(node, i):
            if i == len(word):
                return node.is_end
            ch = word[i]
            if ch == ".":
                return any(dfs(child, i+1) for child in node.children.values())
            nxt = node.children.get(ch)
            return dfs(nxt, i+1) if nxt else False
        return dfs(self.root, 0)
```

**Complexity.** O(L) for no-wildcard search; up to O(alphabet^(dots) · L) worst with many dots.
