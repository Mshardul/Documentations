# Heaps
- Introduction to `heapq` module.
  - [In depth study](./heapq%20module.md)
- Practical problems using heaps:
  - Priority queues
  - Dijkstra’s algorithm
  - Scheduling tasks
  - Kth largest/smallest elements.

# Deque
- Introduction to `collections.deque`.
- Advantages of deque over list for append and pop operations.
- Operations:
  - Append
  - Pop
  - Rotate
  - Extend
- Applications:
  - BFS implementation
  - Sliding window problems.

# Dictionaries
- `defaultdict`: Simplified handling of missing dictionary keys.
  - Use Cases:
    - Frequency counting
    - Graph adjacency lists.
- `OrderedDict`: Maintaining insertion order in dictionaries.
- `Counter`: A special dictionary for counting hashable objects.
  - Applications:
    - Frequency analysis in strings and collections.

# Sorting
- Built-in sorting functions: `sorted()` vs `list.sort()`.
- Sorting with custom keys: Lambda functions.
- Stability in sorting algorithms.
- Timsort: The default sorting algorithm in Python (used in `sorted()` and `list.sort()`), a hybrid of merge sort and insertion sort.
- Custom Sorting:
  - Using key functions and lambda expressions for advanced sorting.
  - Applications: Sorting with multiple criteria (e.g., sorting dictionaries by value).
- `heapq.merge()`: Efficient merging of multiple sorted inputs using heaps.
- Sorting Algorithms:
  - Range queries
  - Maintaining sorted sequences
  - Insertion in logarithmic time
  - Implementing QuickSort and MergeSort in Python.

# Binary Search
- Implementing binary search manually.
- Using `bisect` module for binary search operations.
- Practical problems:
  - Finding insert positions
  - Search intervals.

# Graph Algorithms with Python
- Graph Representation:
  - Using dictionaries and lists to represent graphs in Python.
  - Adjacency List Implementation: Efficient graph representation with dictionaries.
  - Adjacency Matrix: For dense graphs, represented using nested lists.
- `NetworkX` Library: An advanced graph manipulation and algorithm library in Python.
  - Graph Creation: Creating directed and undirected graphs with `networkx`.
  - Graph Traversal: Implementing DFS, BFS using `NetworkX`’s built-in functions.
  - Shortest Path Algorithms: Dijkstra’s, Bellman-Ford, and Floyd-Warshall using `NetworkX`.
- Graph Algorithms with `heapq` and `deque`:
  - Shortest Path Algorithms: Using `heapq` to implement Dijkstra’s algorithm efficiently in Python.
  - Breadth-First Search (BFS) with `collections.deque`: Efficient queue operations with double-ended queue for BFS traversal.
- Graph Optimization Algorithms:
  - A* Algorithm: Python implementation of the A* search algorithm for pathfinding and graph traversal.
  - Bellman-Ford Algorithm: Handling negative weights in graphs using Python.

# Tries and Text Processing
- Trie Implementation: Building a trie (prefix tree) using dictionaries.
  - Common Trie Operations: Insert, search, and delete in a Pythonic manner.
- Regex for Pattern Matching: Efficient text search with Python’s `re` module.
- Text Algorithms:
  - Using `difflib` and `Levenshtein` for string similarity and approximate matching.

# Dynamic Programming in Python
- Memoization with `functools.lru_cache()`: Using built-in memoization to optimize recursive algorithms.
  - Examples:
    - Fibonacci sequence
    - Longest Common Subsequence (LCS).
- Tabulation and Dynamic Arrays: Implementing DP problems using Python’s lists and dynamic resizing.

# Sets and Hashing in Python
- Set Operations:
  - Understanding Python’s `set` and `frozenset` for efficient membership testing and operations like union, intersection, and difference.
- `hash()` Function: How Python implements hashing and the significance of hashable types.
- Hash Collisions: Handling hash collisions in Python and best practices.
- Frozen Sets: Immutable sets in Python, useful as dictionary keys.
- Disjoint Set (Union-Find) in Python:
  - Custom Union-Find Implementation: Implementing union by rank and path compression.
  - Applications: Solving connected component problems, Kruskal’s algorithm for MST.

# Advanced String Manipulation and Algorithms
- Efficient Substring Search:
  - Implementing KMP (Knuth-Morris-Pratt) and Rabin-Karp algorithms in Python.
- Z-Algorithm: A linear-time string matching algorithm.
- Python’s `difflib` for Approximate Matching: Tools for string comparison, matching, and finding differences.

# Bit Manipulation in Python
- Bitwise Operators: Leveraging Python’s built-in operators for bit-level manipulation.
- Common Bit Manipulation Problems:
  - Efficient techniques for checking powers of two
  - Counting set bits
  - Finding unique elements in arrays.

# Backtracking and Recursive Algorithms in Python
- Backtracking Techniques:
  - Solving constraint satisfaction problems like N-Queens, Sudoku using recursion and Python lists.
- Efficient Recursive Solutions:
  - Implementing recursion with and without memoization in Python.

# Caching and Efficient Lookups
- `functools.lru_cache()`: Built-in Python decorator for caching function results.
  - Use Cases:
    - Dynamic programming optimizations
    - Avoiding repeated computations.
- Custom Caching Solutions: Implementing your own caching mechanisms using dictionaries and Python’s `collections` module.