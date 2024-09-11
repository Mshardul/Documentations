
- [Lists](#lists)
  - [List creation](#list-creation)
  - [Accessing List Elements](#accessing-list-elements)
  - [Modifying Elements](#modifying-elements)
  - [List operations](#list-operations)
  - [List Methods](#list-methods)
  - [List Comprehensions](#list-comprehensions)
- [Tuples](#tuples)
  - [Tuple Creation](#tuple-creation)
  - [Accessing Tuple Elements](#accessing-tuple-elements)
  - [Tuple Operations](#tuple-operations)
  - [Tuple Methods](#tuple-methods)
  - [Advanced Tuple Usage](#advanced-tuple-usage)
- [Dictionaries](#dictionaries)
  - [Dictionary Creation](#dictionary-creation)
  - [Accessing Dictionary Elements](#accessing-dictionary-elements)
  - [Modifying Dictionaries](#modifying-dictionaries)
  - [Dictionary Operations](#dictionary-operations)
- [Sets](#sets)
  - [Set Creation](#set-creation)
  - [Modifying Set elements](#modifying-set-elements)
  - [Other Set Methods](#other-set-methods)
  - [Set Operations](#set-operations)
  - [Advanced Set Usage](#advanced-set-usage)
- [Strings](#strings)
  - [String creation](#string-creation)
  - [Accessing String Elements](#accessing-string-elements)
  - [String Operations](#string-operations)
  - [String Methods](#string-methods)
  - [String Formatting](#string-formatting)
- [Categories based on ordering in a sequence](#categories-based-on-ordering-in-a-sequence)
  - [Ordered Sequences:](#ordered-sequences)
  - [Unordered Sequences:](#unordered-sequences)
- [Time Complexities Comparision](#time-complexities-comparision)
  - [Comparision Table](#comparision-table)
  - [Rule of Thumb](#rule-of-thumb)

# Lists

## List creation
### Baisc List creation
```python
lst = []
lst = [1, "abc", 7, 90, {"math": 90, "english": 90}]
```
### List creation using `list()` Constructor
```python
list_from_tuple = list((1, 2, 3))  # [1, 2, 3]
list_from_range = list(range(5))  # [0, 1, 2, 3, 4]
```

## Accessing List Elements
### Indexing
```python
print(fruits[0])
print(fruits[-1])   # negative indexing, means from right; here, -1 means last element, -2 means second last element
```
### Slicing: `[start:stop:step]`
```python
numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
print(numbers[2:5])                         # [2, 3, 4]
print(numbers[:3])                          # [0, 1, 2] (same as [0:3])
print(numbers[5:])                          # [5, 6, 7, 8, 9] (same as [5:10])
print(numbers[::2])                         # [0, 2, 4, 6, 8] (every second element)
print(numbers[::-1])                        # [9, 8, 7, 6, 5, 4, 3, 2, 1, 0] (reversed list)
```

## Modifying Elements
### Indexing
```python
fruits[1] = "blueberry"
```

## List operations
### `len()` function
- to find out how many elements are in the list.
```python
print(len(lst))
```
### `+` operator
- for list concatenation
```python
list1 = [1, 2, 3]
list2 = [4, 5, 6]
print(list1 + list2)      # [1, 2, 3, 4, 5, 6]
```
### `*` operator
- for list repetition
```python
lst = [1, 2, 3]
print(lst * 3)            # [1, 2, 3, 1, 2, 3, 1, 2, 3]
```
### `in` and `not in` operators
- to check if an element exists in a list.
```python
fruits = ["apple", "banana", "cherry"]
print("banana" in fruits)                 # True
print("grape" not in fruits)              # True
```

## List Methods
### `append()`
- adds an element to the end of the list.
```python
fruits = ["apple", "banana"]
fruits.append("cherry")             # ['apple', 'banana', 'cherry']
```
### `insert()`
- inserts an element at a specified position in the list.
```python
fruits = ["apple", "banana"]
fruits.insert(1, "cherry")
print(fruits)                   # ['apple', 'cherry', 'banana']
```
### `extend()`
- extends the list by appending all the elements from another iterable (e.g., another list).
```python
list1 = [1, 2, 3]
list2 = [4, 5, 6]
list1.extend(list2)
print(list1)                    # [1, 2, 3, 4, 5, 6]
```
### `remove()`
- removes the first occurrence of a value.
```python
fruits = ["apple", "banana", "cherry"]
fruits.remove("banana")
print(fruits)                             # ['apple', 'cherry']
fruits.remove("potato")                   # ValueError: list.index(x): x not in list
```
### `pop()`
- removes and returns the element at the given index. By default, pops last element.
```python
fruits = ["apple", "banana", "cherry"]
last_fruit = fruits.pop()
print(last_fruit, fruits)                 # ('cherry', ['apple', 'banana'])
```
### `clear()`
- removes all elements from the list.
```python
fruits = ["apple", "banana", "cherry"]
fruits.clear()
print(fruits)                             # []
```
### `index()`
- returns the index of the first occurrence of a value.
```python
fruits = ["apple", "banana", "cherry"]
print(fruits.index("banana"))             # 1
```
### `count()`
- returns the number of occurrences of a value in the list.
```python
numbers = [1, 2, 2, 3, 2]
print(numbers.count(2))                   # 3
```
### `sort()`
- sorts the list in place. By default, it sorts in ascending order.
```python
numbers = [3, 1, 4, 1, 5, 9, 2]
numbers.sort()
print(numbers)                            # [1, 1, 2, 3, 4, 5, 9]
numbers.sort(reverse=True)
print(numbers)                            # [9, 5, 4, 3, 2, 1, 1]
```
### `reverse()`
- reverses the order of the list in place.
```python
numbers = [1, 2, 3, 4, 5]
numbers.reverse()
print(numbers)                            # [5, 4, 3, 2, 1]
```
### `copy()`
- returns a shallow copy of the list.
```python
fruits = ["apple", "banana", "cherry"]
fruits_copy = fruits.copy()
print(fruits_copy)                        # ['apple', 'banana', 'cherry']
```
- Shallow Copy creates a new list object, but the elements themselves are references to the original objects.

## List Comprehensions
### Syntax
- [expression for item in iterable if condition]
### Example
```python
squares = [x**2 for x in range(10)]
even_squares = [x**2 for x in range(10) if x % 2 == 0]
flat_list = [num for row in matrix for num in row]      # Flattening a Nested List with List Comprehensions
```

# Tuples

## Tuple Creation
### Basic Tuples creation
```python
empty_tuple = ()
single_element_tuple = (10,)
not_a_tuple = (10)                  # just an int
tup = (1, "apple", 3.14, True)
```
### using `tuple()` Constructor
```python
tuple_from_list = tuple([1, 2, 3, 4])
empty_tuple = tuple()
```

## Accessing Tuple Elements
### Indexing
```python
print(fruits[0])
print(fruits[-1])                     # negative indexing, means from right; here, -1 means last element, -2 means second last element
```
### Slicing: `[start:stop:step]`
```python
numbers = (0, 1, 2, 3, 4, 5, 6, 7, 8, 9)
print(numbers[2:5])                           # (2, 3, 4)
print(numbers[:3])                            # (0, 1, 2) (same as [0:3])
print(numbers[5:])                            # (5, 6, 7, 8, 9) (same as [5:10])
print(numbers[::2])                           # (0, 2, 4, 6, 8) (every second element)
print(numbers[::-1])                          # (9, 8, 7, 6, 5, 4, 3, 2, 1, 0) (reversed tuple)
```

## Tuple Operations
### `len()` function
- to find out how many elements are in the tuple.
```python
print(len(tup))
```
### `min()` and `max()` functions
- return the smallest and largest elements in the tuple, respectively.
```python
numbers = (4, 1, 8, 3)
print(min(numbers))         # Output: 1
print(max(numbers))         # Output: 8
```
### `sum()`
- returns the sum of all the numeric elements in a tuple.
```python
numbers = (1, 2, 3, 4)
print(sum(numbers))                       # Output: 10
```
### `sorted()`
- returns sorted list
```python
numbers = (3, 1, 2)
sorted_numbers = sorted(numbers)
print(sorted_numbers)                     # Output: [1, 2, 3]
```
### `+` operator
- for tuple concatenation
```python
tuple1 = (1, 2, 3)
tuple2 = (4, 5, 6)
print(tuple1 + tuple2)                    # (1, 2, 3, 4, 5, 6)
```
### `*` operator
- for tuple repetition
```python
numbers = (0, 1)
repeated = numbers * 3
print(repeated)                           # (0, 1, 0, 1, 0, 1)
```
### `in` and `not in` operators
- to check if an element exists in a tuple.
```python
fruits = ("apple", "banana", "cherry")
print("banana" in fruits)                 # True
print("grape" not in fruits)              # True
```
### tuples are immutable, 
- hence the elements can not be changed. 
```python
fruits = ("apple", "banana", "cherry")
fruits[1] = "blueberry"                   # TypeError: 'tuple' object does not support item assignment
```
## However elements can be mutable
- if they contain mutable elements, nested elements can still be updated
```python
nested_tuple = (1, 2, [3, 4])
nested_tuple[2][0] = 100
print(nested_tuple)                       # (1, 2, [100, 4])
```

## Tuple Methods
### `count()`
- returns the number of occurrences of a value in the tuple.
```python
numbers = (1, 2, 2, 3, 2, 4)
print(numbers.count(2))                   # 3
```
### `index()`
- returns the index of the first occurrence of a value in the tuple. Raises ValueError if the value is not found.
```python
fruits = ("apple", "banana", "cherry")
print(fruits.index("banana"))             # 1
print(fruits.index("potato"))             # ValueError: tuple.index(x): x not in tuple
```

## Advanced Tuple Usage
### Tuple Packing
- refers to assigning multiple values to a single tuple variable.
```python
packed_tuple = 1, 2, 3                    # Packing
print(packed_tuple)                       # (1, 2, 3)
```
### Tuple Unpacking
- refers to assigning the elements of a tuple to individual variables.
```python
a, b, c = packed_tuple                    # Unpacking
print(a)                                  # 1
print(b)                                  # 2
print(c)                                  # 3
```
### Tuple Unpacking
- with `*` Operator
```python
numbers = (1, 2, 3, 4, 5)
a, *b, c = numbers
print(a)                                  # 1
print(b)                                  # [2, 3, 4]
print(c)                                  # 5
```
### Tuples as Dictionary Keys
- Because tuples are immutable, they can be used as keys in dictionaries, unlike lists.
```python
locations = {
  (40.7128, -74.0060): "New York",
  (34.0522, -118.2437): "Los Angeles",
  (51.5074, -0.1278): "London"
}
print(locations[(40.7128, -74.0060)])     # New York
```
### Returning Multiple Values from a Function
```python
def get_coordinates():
  return (40.7128, -74.0060)
latitude, longitude = get_coordinates()
print(latitude)                           # 40.7128
print(longitude)                          # -74.0060
```
### Multiple Arguments with `*args`
```python
def sum_all(*args):
    return sum(args)
print(sum_all(1, 2, 3, 4))                # 10
```

# Dictionaries

## Dictionary Creation
### Basic Dictionary Creation
```python
person = {}
person = {"name": "John", "age": 30, "city": "New York"}
```
### using `dict()` Constructor
```python
person1 = dict()
person2 = dict(name="John", age=30, city="New York")
person3 = dict([("name", "John"), ("age", 30), ("city", "New York")])
```

## Accessing Dictionary Elements
### Accessing Values by Key
```python
print(person["name"])                     # Output: John
```
### Using `get()` Method:
```python
print(person.get("name"))                 # Output: John
print(person.get("job", "Not Found"))     # Output: Not Found
```
### `in` operator
- to check if a key exists in the dictionary.
```python
if "age" in person:
  print("Age is available.")
```
## Modifying Dictionaries
### Adding a New Key-Value Pair
```python
person["job"] = "Engineer"
```
### Updating an Existing Key-Value Pair
```python
person["age"] = 31
```
### Update using `update()` Method
```python
additional_info = {"job": "Engineer", "hobbies": ["Reading", "Cycling"]}
person.update(additional_info)
```
### Removing Elements using the `del` Statement
```python
del person["city"]
```
### Removing Elements using the `pop()` method
- removes a key and returns its value
```python
age = person.pop("age")
```
### Removing Elements using the `popitem()` method
- removes and returns the last inserted key-value pair as a tuple
```python
last_item = person.popitem()                # Output: ('hobbies', ['Reading', 'Cycling'])
```
### Empty dictionary using `clear()` method
```python
person.clear()
```
### `update()` method allows you to merge one dictionary into another.
```python
dict1 = {"a": 1, "b": 2}
dict2 = {"b": 3, "c": 4}
dict1.update(dict2)
print(dict1)                                # Output: {'a': 1, 'b': 3, 'c': 4}
```

## Dictionary Operations
### Keys, Values, and Items:
- `keys()`: Returns a view object that displays a list of all the keys in the dictionary.
  `values()`: Returns a view object that displays a list of all the values in the dictionary.
  `items()`: Returns a view object that displays a list of all the key-value pairs in the dictionary as tuples.
```python
person = {"name": "John", "age": 31, "job": "Engineer"}
print(person.keys())                        # Output: dict_keys(['name', 'age', 'job'])
print(person.values())                      # Output: dict_values(['John', 31, 'Engineer'])
print(person.items())                       # Output: dict_items([('name', 'John'), ('age', 31), ('job', 'Engineer')])
```
### Iterating Over Dictionary Keys and Values:
```python
for key in person.keys():
  print(key, person[key])
for value in person.values():
  print(value)
for key, value in person.items():
  print(f"{key}: {value}")
```
### Dictionary Comprehensions
```python
squares = {x: x**2 for x in range(6)}
even_squares = {x: x**2 for x in range(6) if x % 2 == 0}
```
### `|` operator
- provides a new way to merge dictionaries, creating a new dictionary with the merged key-value pairs.
```python
dict1 = {"a": 1, "b": 2}
dict2 = {"b": 3, "c": 4}
print(dict1 | dict2)                        # Output: {'a': 1, 'b': 3, 'c': 4}
```
### `sorted()` function
- Dictionaries can be sorted by keys or values using the `sorted()` function, which returns a sorted list of keys or values.
```python
my_dict = {"apple": 3, "banana": 1, "cherry": 2}
sorted_by_keys = sorted(my_dict)
sorted_by_values = sorted(my_dict.values())
print(sorted_by_keys)                       # Output: ['apple', 'banana', 'cherry']
print(sorted_by_values)                     # Output: [1, 2, 3]
```

# Sets

## Set Creation
### Basic Set creation
```python
my_set = {1, 2, 3, 4}
```
### Set creation using `set()` Constructor
```python
empty_set = set()
another_set = set([1, 2, 3, 4])
```

## Modifying Set elements
### `add()` method 
- adds a single element to the set. If the element already exists, the set remains unchanged.
```python
my_set = {1, 2, 3}
my_set.add(4)                               # my_set: {1, 2, 3, 4}
my_set.add(2)                               # my_set: {1, 2, 3, 4}  # No duplicates allowed
```
### `remove()` method 
- removes a specified element from the set. If the element does not exist, it raises a KeyError
```python
my_set = {1, 2, 3}
my_set.remove(2)                            # my_set: {1, 3}
my_set.remove(4)                            # Raises KeyError: 4
```
### `discard()` method 
- removes a specified element from the set. If the element does not exist, the set remains unchanged (no KeyError is raised).
```python
my_set = {1, 2, 3}
my_set.discard(2)                           # my_set: {1, 3}
my_set.discard(4)                           # No error raised
```
### `pop()` method
- removes and returns an arbitrary element from the set. Since sets are unordered, you cannot predict which element will be removed.
```python
my_set = {1, 2, 3}
print(my_set.pop())                         # Output: (an arbitrary element from the set)
```
### `clear()` method
- removes all elements from the set, resulting in an empty set.
```python
my_set = {1, 2, 3}
my_set.clear()                              # my_set: set()
```
### `update()` method
- adds multiple elements to the set. The elements can be provided as an iterable (e.g., list, set, tuple).
```python
my_set = {1, 2}
my_set.update([3, 4, 5])                    # my_set: {1, 2, 3, 4, 5}
```
### `intersection_update()` method
- updates the set with only the elements that are common to both the set and the provided iterables. This is equivalent to the &= operator.
```python
set1 = {1, 2, 3}
set2 = {2, 3, 4}
set1.intersection_update(set2)              # set1: {2, 3}
```
### `difference_update()` method 
- removes all elements from the set that are also found in the provided iterables. This is equivalent to the -= operator.
```python
set1 = {1, 2, 3, 4}
set2 = {3, 4, 5}
set1.difference_update(set2)                # set1: {1, 2}
```

## Other Set Methods
### `union()` method 
- returns a new set with elements from both the set and the provided iterables. This is equivalent to the `|` operator.
```python
set1 = {1, 2, 3}
set2 = {3, 4, 5}
print(set1.union(set2))                     # Output: {1, 2, 3, 4, 5}
```
### `issubset()` method
- returns True if all elements of the set are contained in another set, otherwise False.
```python
set1 = {1, 2}
set2 = {1, 2, 3}
print(set1.issubset(set2))                  # Output: True
```
### `issuperset()` method
- returns True if the set contains all elements of another set, otherwise False.
```python
set1 = {1, 2, 3}
set2 = {1, 2}
print(set1.issuperset(set2))                # Output: True
```
### `isdisjoint()` method
- returns True if the set has no elements in common with another set, otherwise False.
```python
set1 = {1, 2, 3}
set2 = {4, 5, 6}
print(set1.isdisjoint(set2))                # Output: True
```

## Set Operations
### Union (`|`) 
- combines the elements of two sets, removing duplicates.
```python
set1 = {1, 2, 3}
set2 = {3, 4, 5}
print(set1 | set2)                          # Output: {1, 2, 3, 4, 5}
```
### Intersection (`&`) 
- returns the elements that are common to both sets.
```python
set1 = {1, 2, 3}
set2 = {3, 4, 5}
print(set1 & set2)                          # Output: {3}
```
### Difference (`-`) 
- returns the elements that are in the first set but not in the second.
```python
set1 = {1, 2, 3}
set2 = {3, 4, 5}
print(set1 - set2)                          # Output: {1, 2}
```
### Symmetric Difference (`^`) 
- returns the elements that are in either set, but not in both (essentially the union minus the intersection).
```python
et1 = {1, 2, 3}
set2 = {3, 4, 5}
print(set1 ^ set2)  # Output: {1, 2, 4, 5}
```
### Membership checku using`in` operator 
- to check for the existence of an element
```python
my_set = {1, 2, 3}
print(2 in my_set)                          # Output: True
print(4 in my_set)                          # Output: False
```

## Advanced Set Usage
### Immutable Sets using `frozenset`
```python
frozen_set = frozenset([1, 2, 3])
```
### Set Comprehensions
```python
squares = {x**2 for x in range(6)}
even_squares = {x**2 for x in range(6) if x % 2 == 0}
```

# Strings

## String creation
### Basic String creation
```python
single_quote_string = 'Hello, World!'
double_quote_string = "Hello, World!"
multi_line_string = '''This is a
multi-line string'''
```
### String creation using the str() Constructo
```python
number = 123
string_number = str(number)                 # string_number: '123'
```

## Accessing String Elements
### Indexing
```python
text = "Python"
print(text[0])                              # Output: 'P'
print(text[-2])                             # Output: 'o'
```
### Slicing
```python
print(text[1:4])                            # Output: 'yth'
print(text[:3])                             # Output: 'Pyt'
print(text[3:])                             # Output: 'hon'
print(text[::2])                            # Output: 'Pto'
print(text[::-1])                           # Output: 'nohtyP' (reversed string)
```

## String Operations
### `+` operator 
- for string concatenation
```python
text1 = "Hello"
text2 = "World"
print(text1 + " " + text2)                # Output: 'Hello World'
```
### `*` operator
- for string repetition
```python
repeated_text = "Hi! " * 3                # repeated_text: 'Hi! Hi! Hi! '
```
### `len()` function
- returns the number of characters in a string.
```python
print(len("Python"))                      # Output: 6
```
### `in` and `not in` Operators
- to check if a substring exists within a string.
```python
text = "Python programming"
print("Python" in text)                   # Output: True
print("Java" not in text)                 # Output: True
```

## String Methods
### `lower()` and `upper()` 
- to convert the entire string to lowercase or uppercase respectively.
```python
text = "Python Programming"
print(text.lower())                       # Output: 'python programming'
print(text.upper())                       # Output: 'PYTHON PROGRAMMING'
```
### `capitalize()` and `title()` 
- `capitalize()` converts the first character of the string to uppercase and the rest to lowercase. 
- `title()` converts the first character of each word to uppercase.
```python
text = "python programming"
print(text.capitalize())                  # Output: 'Python programming'
print(text.title())                       # Output: 'Python Programming'
```
### `strip()`, `lstrip()`, and `rstrip()`
- remove whitespace (or other specified characters) from the beginning and/or end of the string.
```python
text = "   Hello, World!   "
print(text.strip())                       # Output: 'Hello, World!'
print(text.lstrip())                      # Output: 'Hello, World!   '
print(text.rstrip())                      # Output: '   Hello, World!'
```
### `replace()` 
- replaces occurrences of a specified substring with another substring.
```python
text = "Hello, World!"
print(text.replace("World", "Python"))    # Output: 'Hello, Python!'
```
### `split()` 
- breaks the string into a list of substrings based on a delimiter, and `join()` combines a list of strings into a single string with a specified delimiter.
```python
text = "Python is fun"
print(text.split())                       # Output: ['Python', 'is', 'fun']
print(" ".join(words))                    # Output: 'Python is fun'
```
### `find()` and `rfind()` 
- `find()` returns the lowest index of the first occurrence of the substring (or -1 if not found)
- `rfind()` returns the highest index.
```python
text = "Hello, World!"
print(text.find("o"))                     # Output: 4
print(text.rfind("o"))                    # Output: 8
```
### `startswith()` and `endswith()` 
- checks if a string starts or ends with a specified substring.
```python
text = "Python programming"
print(text.startswith("Python"))          # Output: True
print(text.endswith("ing"))               # Output: True
```
### `count()` 
- counts the number of occurrences of a substring within a string.
```python
text = "banana"
print(text.count("a"))                    # Output: 3
```

## String Formatting
### `format()` Method
- formats strings by embedding values inside placeholders {}.
```python
name = "John"
print("My name is {}.".format(name))      # Output: 'My name is John.'
```
### Formatted String Literals (f-strings)
- is a more concise way to format strings using `f"..."` syntax (introduced in Python 3.6).
```python
name = "John"
print(f"My name is {name}.")              # Output: 'My name is John.'
```
### Raw strings (`r"..."`)
- treat backslashes as literal characters, useful for regular expressions and file paths.
```python
raw_string = r"C:\newfolder\test"
print(raw_string)                         # Output: C:\newfolder\test
```

# Categories based on ordering in a sequence

## Types of sequence based on Order
### Ordered Sequences: 
- `list`, `tuple`, `str`, `range()`, `bytes`, `bytearray`
### Unordered Sequences: 
- `set`, `frozenset`, `dict`

# Time Complexities Comparision

## Comparision Table
| Tables                     | List | Tuple | Set  | Dictionary | String |
|----------------------------|:----:|:-----:|:----:|:----------:|:------:|
| Access By Index            | O(1) | O(1)  | N/A  | O(1)       | O(1)   |
| Insert at End              | O(1) | N/A   | O(1) | O(1)       | N/A    | 
| Insert at Beginning/Middle | O(n) | N/A   | N/A  | N/A        | N/A    |
| Delete by Value            | O(n) | N/A   | O(1) | O(1)       | N/A    |
| Delete by Index            | O(n) | N/A   | N/A  | O(1)       | N/A    |
| Membership Testing         | O(n) | O(n)  | O(1) | O(1)       | O(n)   |
| Iterating                  | O(n) | O(n)  | O(n) | O(n)       | O(n)   |

## Rule of Thumb
- Lists and tuples are ideal for ordered collections where you need to access elements by index, but lists allow mutability, whereas tuples are immutable.
- Sets and dictionaries are excellent for fast membership testing and frequent inserts/deletes, with dictionaries offering key-value mapping.
- Strings are specialized for handling text data, with fast access but no mutability, making them similar to tuples in behavior.
