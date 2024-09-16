# Introduction
- The heapq module in Python provides an implementation of the heap queue algorithm, also known as the priority queue algorithm. 
- This module implements a binary heap on top of Python’s list data structure.
- In Python’s heapq, only Min-Heaps are implemented by default, where the smallest element is always at the root.
- However, we can implement a Max-Heap using certain modifications.

## Introduction to Heaps
- A heap is a binary tree-based data structure where the parent node is either greater than or less than its child nodes.

### Types of Heap
- **Min-Heap:** The value of the parent node is less than or equal to its children (smallest element at the root).
- **Max-Heap:** The value of the parent node is greater than or equal to its children (largest element at the root).

# Basic Operations in heapq

## heapq.heapify(lst)
- transform list lst into a heap, in-place
- Time Complexity: O(n)
## heapq.heappush(heap, item)
- pushes a new item onto the heap, maintaining the heap invariant (i.e., the smallest element remains at the root).
- Time complexity: O(log n) (where n is the number of elements in the heap).
## heaheappoppq.(heap)
- pops and returns the smallest item from the heap, while maintaining the heap invariant.
- Time complexity: O(log n).
## heapq.heappushpop(heap, item)
- pushes a new item onto the heap and then pops and returns the smallest item.
- more efficient than doing a heappush followed by a heappop.
- Time complexity: O(log n).
## heapq.heapreplace(heap, item)
- pops and returns the smallest item, and then pushes the new item onto the heap.
- slightly more efficient than heappop followed by heappush.
- Time complexity: O(log n).
## heapq.nlargest(n, iterable, key=None)
- returns the n largest elements from the dataset defined by the iterable.
- An optional key function can be supplied to sort by custom criteria.
- Time complexity: O(n log k) (where n is the total number of elements and k is the number of largest elements).
## heapq.nsmallest(n, iterable, key=None)
- returns the n smallest elements from the iterable.
- The optional key argument can be used for custom sorting.
- Time complexity: O(n log k).
## Example
```python
import heapq

numbers = [5, 1, 3, 10, 7, 2]
heapq.heapify(numbers)              # [1, 5, 2, 10, 7, 3]
heapq.heappush(numbers, 4)          # [1, 5, 2, 10, 7, 3, 4]
heapq.heappop(numbers)              # [2, 5, 3, 10, 7, 4]
heapq.heappushpop(numbers, 9)       # [3, 5, 4, 10, 7, 9]
heapq.heapreplace(numbers, 6)       # [4, 5, 6, 10, 7, 9]
print(heapq.nlargest(4, numbers))   # [10, 9, 7, 6]
print(heapq.nsmallest(4, numbers))  # [4, 5, 6, 7]
```

# Implementing a Max-Heap in Python
- Since the heapq module only supports a Min-Heap, you can simulate a Max-Heap by simply inverting the sign of the numbers you’re working with (or the key for objects).

# Applications of Heaps
- The heapq module is extremely useful in many common programming problems, especially those that require:
  - **Priority Queues:** Processing tasks based on their priority (e.g., shortest job first scheduling).
  - **Kth Largest/Smallest Elements:** Finding the kth largest or smallest element in a collection.
  - **Dijkstra’s Algorithm:** Used for finding the shortest path in a graph, where a priority queue helps select the next node with the shortest tentative distance.
  - **Merging Sorted Lists:** Heaps can efficiently merge multiple sorted lists (e.g., in external sorting).
  - **Job Scheduling:** Heaps can be used to efficiently schedule jobs or tasks where each task has a priority or time constraint.

# Efficiency Considerations
- Push and pop operations are both `O(log n)`.
- Operations like `nlargest()` and `nsmallest()` are `O(n log k)`, which is better than sorting the entire list if you only need a few of the largest or smallest elements.

# Limitations of heapq
- **Min-Heap Only:** By default, the heapq module only supports Min-Heaps. For Max-Heaps, you have to manually invert the values.
- **Not Thread-Safe:** The heapq module is not thread-safe. If you need to manipulate heaps in a multithreaded environment, you need to use appropriate locking mechanisms.
- **Doesn’t Support Object-Based Heaps:** The module works with basic data types like numbers and strings. If you want to use it with custom objects, you must define a comparison function or provide a custom key for comparison.
- **Mutable Objects in Heaps:** If you are storing mutable objects in a heap, be cautious. If an object is modified after being inserted into the heap, the heap property may be violated.

# Advanced Tips
- **Using Tuples in Heaps:** You can push tuples into heaps, and the heap will use the first element of the tuple as the comparison key. This can be very useful when you have complex data.
```python
import heapq

tasks = [(1, "write code"), (3, "sleep"), (2, "eat")]
heapq.heapify(tasks)
while tasks:
    print(heapq.heappop(tasks))
# Output: (1, 'write code'), (2, 'eat'), (3, 'sleep')
```
- **Using heapify()**: The `heapq.heapify(iterable)` function transforms any iterable (like a list) into a heap in-place. This is useful when you already have a list of unordered elements and want to turn it into a valid heap.
```python
import heapq

nums = [3, 1, 4, 1, 5, 9]
heapq.heapify(nums)

print(nums)  # Output: [1, 1, 4, 3, 5, 9] (A valid min-heap)
```