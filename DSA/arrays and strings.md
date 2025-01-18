# Table Of Content
- [Table Of Content](#table-of-content)
- [Arrays](#arrays)
- [Strings](#strings)
- [Searching Algorithms](#searching-algorithms)
    - [Linear Search](#linear-search)
    - [Binary Search](#binary-search)
- [Sorting Algorithms](#sorting-algorithms)
    - [Bubble Sort](#bubble-sort)
    - [Insertion Sort](#insertion-sort)
    - [Selection Sort](#selection-sort)
    - [Merge Sort](#merge-sort)
    - [Quick Sort](#quick-sort)
- [Two-Pointer Technique](#two-pointer-technique)
- [Competitive Programming Questions](#competitive-programming-questions)
  - [Search in a Rotated Sorted Array](#search-in-a-rotated-sorted-array)
  - [3-Sum](#3-sum)
  - [K-th Smallest Element (Using Quickselect)](#k-th-smallest-element-using-quickselect)
  - [Minimum Absolute Difference Pair](#minimum-absolute-difference-pair)
  - [Search in a Sorted 2D Matrix](#search-in-a-sorted-2d-matrix)
  - [Find Peak Element](#find-peak-element)

# Arrays
- a linear data structure that stores elements in contiguous memory locations.
- Each element can be accessed by its index, with indexing typically starting at 0.

## Common Operations
- **Insertion at the end**:  `O(1)  amortized` (in dynamic arrays);  O(1)  if space is available in static arrays.
- **Deletion from the end**:  `O(1)`.
- **Insertion/Deletion from the middle**:  `O(n)`  because all subsequent elements must be shifted.
- **Search**:  `O(n)`  in the worst case, when sequential.
- **Random Access:**  `O(1)`.

# Strings
- is a sequence of characters.
- In many languages (like C++), it’s essentially an array of characters.
- In Python, strings are immutable objects, meaning once created, they cannot be changed in-place.

## Common Operations
- **Access a character by index**:  `O(1)`.
- **Concatenation**:
    - In `Python`, `O(n^2)`  in worst scenarios
    - Better to use a StringBuilder in Java or a list join in Python.
- `Substring`:
    - `O(1)` if pointers are stored to the original array (like older Java versions did)
    - `O(n)`  if substring is copied each time.

# Searching Algorithms

## Linear Search
- Check each element sequentially until you find the target or reach the end.

### Complexities
- **Time Complexity**: `O(n)`
- **Time Complexity**: `O(1)`

### When to use
- When the array is unsorted and there is no additional information to speed up search.
- For very small arrays where the overhead of more complex algorithms isn’t justified.

### Python Code

```python
def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1
```

## Binary Search
- Works on sorted arrays.
- Repeatedly divide the search interval in half.
- If the value of the search key is less than the middle element, narrow the interval to the lower half; otherwise narrow it to the upper half.

### Complexities
- **Time Complexity**: `O(log n)`
- **Time Complexity**: `O(1)`  // iterative version

### Requirements
- The array must be sorted.

### Python code

```python
def binary_search(sorted_arr, target):
    left = 0
    right = len(sorted_arr) - 1

    while left <= right:
        mid = (left + right) // 2
        if sorted_arr[mid] == target:
            return mid
        elif sorted_arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1

    return -1
```

# Sorting Algorithms

## Bubble Sort
- Repeatedly swap adjacent elements if they are in the wrong order.
- After each pass, the largest element “bubbles up” to the correct position.

### Complexities
- **Time Complexity**: `O(n^2)` for average/worst case; `O(n)` for best case (already sorted)
- **Time Complexity**: `O(1)`

### Python code

```python
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        swapped = False
        for j in range(n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            break
```


## Insertion Sort
- Build the sorted array (or subarray) one item at a time.
- Take the next element and insert it into the correct position in the already-sorted subarray.

### Complexities
- **Time Complexity**: `O(n^2)` for average/worst case; `O(n)` for best case (already sorted)
- **Time Complexity**: `O(1)`

### Python code

```python
def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
```

## Selection Sort
- Find the minimum element in the unsorted part and swap it with the leftmost unsorted element.
- Move the boundary of the unsorted part by one.
- It makes the minimum number of swaps: `O(n)`

### Complexities
- **Time Complexity**: `O(n^2)`
- **Time Complexity**: `O(1)`

### Python code

```python
def selection_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        min_index = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_index]:
                min_index = j
        arr[i], arr[min_index] = arr[min_index], arr[i]
```

## Merge Sort
- A divide-and-conquer algorithm that divides the array into halves, recursively sorts each half, and merges the sorted halves.

### Complexities
- **Time Complexity**: `O(n log n)`
- **Time Complexity**: `O(n)` for additional space for merging

### Python code

```python
def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1

    result.extend(left[i:])
    result.extend(right[j:])
    return result
```

## Quick Sort
- A divide-and-conquer algorithm that selects a “pivot” element, then partitions the array around the pivot, recursively sorts the two sub-partitions.

### Complexities
- **Time Complexity**: `O(n log n)` for average case; `O(n*2)` for worst case
- **Time Complexity**: `O(n)` for recursion stack

### Python code

```python
def quick_sort(arr, low, high):
    if low < high:
        pivot_index = partition(arr, low, high)
        quick_sort(arr, low, pivot_index - 1)
        quick_sort(arr, pivot_index + 1, high)

def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        if arr[j] < pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1
```

# Two-Pointer Technique
- The two-pointer method uses two (or more) index variables to traverse data structures—often arrays or strings.

## Example Use Cases

### Finding a Pair That Sums to a Target (Sorted Array)
- If the sum of two pointers is greater than the target, move the right pointer left;
- If it’s less, move the left pointer right.

```python
def two_sum_sorted(arr, target):
    left = 0
    right = len(arr) - 1
    while left < right:
        current_sum = arr[left] + arr[right]
        if current_sum == target:
            return (left, right)
        elif current_sum < target:
            left += 1
        else:
            right -= 1
    return None
```

### Reversing an Array In-Place
- Use two pointers, one at the start and one at the end, and swap elements until they meet in the middle.

```python
def reverse_array(arr):
    left = 0
    right = len(arr) - 1
    while left < right:
        arr[left], arr[right] = arr[right], arr[left]
        left += 1
        right -= 1
```

### Move Zeros to the End (Variation)
- Use two pointers to separate non-zero elements from zero elements in an array (useful in “partition-like” operations).

```python
def move_zeros_to_end(arr):
    insert_pos = 0
    for i in range(len(arr)):
        if arr[i] != 0:
            arr[insert_pos] = arr[i]
            insert_pos += 1
    while insert_pos < len(arr):
        arr[insert_pos] = 0
        insert_pos += 1
```

### String Palindrome Check
- Compare characters from the start and end moving toward the center.

```python
def is_palindrome(s):
    left, right = 0, len(s) - 1
    while left < right:
        if s[left] != s[right]:
            return False
        left += 1
        right -= 1
    return True
```
## Special Considerations & Edge Cases
- **Array Boundaries**
    - Always check for out-of-bounds errors, especially in lower-level languages.
    - Watch for empty arrays (`length = 0`) or arrays with a single element.
- **String Edge Cases**
    - Empty strings (`length = 0`).
    - Special character handling, case sensitivity, or localization issues for real-world applications.
    - Immutability in certain languages (like Python, Java). Modifying a string might need additional memory or usage of specialized classes (e.g., StringBuilder in Java).
- **Sorting Stability**
    - Stable sort algorithms (like Merge Sort, Insertion Sort) maintain the relative order of elements that compare equal. This can be important in some applications.
    - Quick Sort is generally unstable in its typical form.
- **Pivot Selection in Quick Sort**
   - Random pivot or median-of-three strategy can help reduce the likelihood of worst-case  O(n^2) .
- **Binary Search Precondition**
    - Must ensure the array is sorted. Using binary search on an unsorted array yields incorrect results.
- **Time vs. Space Trade-Off**
    - Merge Sort is  O(n \log n)  but requires extra space  O(n) .
    - Quick Sort can be in-place but has a worst-case scenario of  O(n^2) .
- **Overflow Issues**
    - Watch for potential overflow when calculating the midpoint in binary search: mid = (left + right) // 2 is usually fine in Python because of arbitrary precision integers, but in some languages, you might do mid = left + (right - left) / 2 to avoid overflow.
- **Data Type**
    - Arrays can store primitives (like int, char, etc.) or objects (in high-level languages). This might affect memory usage and performance.

# Competitive Programming Questions

## Search in a Rotated Sorted Array
### Problem Statement
- Given a rotated sorted array `nums` of unique integers and a `target` value. 
    - Determine if the target exists in the array. 
    - If it does, return its `index`; otherwise, return `-1`.
- Example 1
    - **Input**: nums = `[4, 5, 6, 7, 0, 1, 2]`, target = `0`
    - **Output**: `4`  // since nums[4] == 0
### Solution
```python
"""
- Use a modified binary search.
1. Determine which half of the array is properly sorted, and decide to move left or right accordingly.
"""
def search_in_rotated_sorted_array(nums, target):
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid
        
        # If left portion is sorted
        if nums[left] <= nums[mid]:
            if nums[left] <= target < nums[mid]:
                right = mid - 1
            else:
                left = mid + 1
        # Right portion is sorted
        else:
            if nums[mid] < target <= nums[right]:
                left = mid + 1
            else:
                right = mid - 1
    
    return -1
```
### Complexities
- **Time Complexity**: `O(log n)`
- **Time Complexity**: `O(1)`

## 3-Sum
### Problem Statement
- Given an integer array `nums`, return all the unique triplets `[nums[i], nums[j], nums[k]]`, such that 
    - `i`, `j`, and `k` are distinct indices, and 
    - `nums[i] + nums[j] + nums[k] == 0`.
- Example 1
    - **Input**: nums = `[-1, 0, 1, 2, -1, -4]`
    - **Output**: `[[-1, -1, 2], [-1, 0, 1]]`
### Solution
```python
"""
1. Sort the array.
2. Fix one element and use the two-pointer approach to find pairs that sum to -nums[i].
- Skip duplicates to avoid repeating the same triplet.
"""
def three_sum(nums):
    nums.sort()
    result = []
    n = len(nums)

    for i in range(n):
        # Skip duplicate elements for 'i'
        if i > 0 and nums[i] == nums[i - 1]:
            continue

        left, right = i + 1, n - 1
        while left < right:
            s = nums[i] + nums[left] + nums[right]
            if s == 0:
                result.append([nums[i], nums[left], nums[right]])
                left += 1
                right -= 1
                # Skip duplicates for 'left' and 'right'
                while left < right and nums[left] == nums[left - 1]:
                    left += 1
                while left < right and nums[right] == nums[right + 1]:
                    right -= 1
            elif s < 0:
                left += 1
            else:
                right -= 1
    return result
```
### Complexities
- **Time Complexity**: `O(n^2)`
- **Time Complexity**: `O(log n)`

## K-th Smallest Element (Using Quickselect)
### Problem Statement
- Given an unsorted array `nums` and an integer `k`, 
    - find the k-th smallest element in the array (1-based).
    - For instance, if `k=1`, we want the smallest element;
    - if `k=2`, we want the second smallest,
    - and so on.
- Example 1
    - **Input**: nums = `[3, 2, 1, 5, 6, 4]`, k = `2`
    - **Output**: `2`  // the 2nd smallest element is 2
### Solution
```python
"""
- Quickselect is a variation of Quicksort partitioning
1.	Choose a pivot.
2.	Partition the array around the pivot.
3.	Determine if the pivot’s position is k-th or if we need to go left or right.
"""
import random

def kth_smallest(nums, k):
    """Returns the k-th smallest element of nums (1-based index)."""
    return quickselect(nums, 0, len(nums)-1, k-1)  # k-1 for 0-based index

def quickselect(arr, left, right, k_index):
    pivot_index = random_partition(arr, left, right)
    
    if pivot_index == k_index:
        return arr[pivot_index]
    elif pivot_index < k_index:
        return quickselect(arr, pivot_index + 1, right, k_index)
    else:
        return quickselect(arr, left, pivot_index - 1, k_index)

def random_partition(arr, left, right):
    pivot_idx = random.randint(left, right)
    arr[pivot_idx], arr[right] = arr[right], arr[pivot_idx]
    return partition(arr, left, right)

def partition(arr, left, right):
    pivot = arr[right]
    i = left - 1
    for j in range(left, right):
        if arr[j] < pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i + 1], arr[right] = arr[right], arr[i + 1]
    return i + 1
```
### Complexities
- **Time Complexity**: `O(n^2)` worst case; `O(n)` average case
- **Time Complexity**: `O(1)`  // in-place

## Minimum Absolute Difference Pair
### Problem Statement
- Given an array of integers `nums`, 
    - find the minimum absolute difference between any pair of elements in the array.
- Example 1
    - **Input**: nums = `[3, 8, 15, 17]`
    - **Output**: `2` (the pair `(15, 17)` yields the minimum difference)

### Solution
```python
"""
1. Sort the array.
2. The minimum difference must be between two adjacent elements in the sorted order.
3. Compare consecutive pairs to find the global minimum difference.
"""
def minimum_absolute_difference(nums):
    nums.sort()
    min_diff = float('inf')
    for i in range(1, len(nums)):
        diff = nums[i] - nums[i - 1]
        if diff < min_diff:
            min_diff = diff
    return min_diff
```
### Complexities
- **Time Complexity**: `O(n log n)`  // due to sorting
- **Time Complexity**: `O(1)`  // if in-place sorting

## Search in a Sorted 2D Matrix
### Problem Statement
- Given an `m * n` matrix matrix where each row is sorted in ascending order (left to right) and each column is sorted in ascending order (top to bottom)
    - Write a function that searches for a target value in the matrix and returns `True` if it exists, otherwise `False`.
- Example 1
    - **Input**: matrix = `[ [1, 4, 7, 11], [2, 5, 8, 12], [3, 6, 9, 16], [10, 13, 14, 17] ]`, target = `5`
    - **Output**: `True`
### Solution
```python
"""
1. Start from the top-right corner (or bottom-left corner).
2. If the current element is greater than the target, move left.
3. If it is smaller, move down.
- This ensures you discard one row or one column in each comparison.
"""
def search_matrix(matrix, target):
    if not matrix or not matrix[0]:
        return False
    
    rows = len(matrix)
    cols = len(matrix[0])
    
    # Start from top-right corner
    r = 0
    c = cols - 1
    
    while r < rows and c >= 0:
        if matrix[r][c] == target:
            return True
        elif matrix[r][c] > target:
            c -= 1
        else:
            r += 1
    
    return False
```
### Complexities
- **Time Complexity**: `O(m + n)`
- **Time Complexity**: `O(1)`

## Find Peak Element
### Problem Statement
- A peak element is an element strictly greater than its neighbors. 
- Given an array nums, 
    - find the index of a peak element. 
- The array may contain multiple peaks; return the `index` of any peak.
- Example 1
    - **Input**: nums = `[1, 2, 1, 3, 5, 6, 4]`
    - **Output**: `1` or `5`  // both `nums[1] = 2`  and `nums[5] = 6` are a peak relative to their neighbors

### Solution
```python
"""
- Use a variant of binary search:
1. Check the middle element mid.
2. If nums[mid] < nums[mid+1], move left to mid + 1 (the peak lies to the right).
3. Otherwise, move right to mid.
"""
def find_peak_element(nums):
    left, right = 0, len(nums) - 1
    while left < right:
        mid = (left + right) // 2
        if nums[mid] < nums[mid + 1]:
            left = mid + 1
        else:
            right = mid
    return left  # or right, they converge
```
### Complexities
- **Time Complexity**: `O(log n)`
- **Time Complexity**: `O(1)`