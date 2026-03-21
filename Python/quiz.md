# Question 1
## Tags
#python, #functions
## Question
What does the following code output?
```python
def greet():
    print("Hello, world!")

greet()
```
## Options
- [ ] `Hello, world!`
- [ ] `An error message`
- [ ] `Nothing`
- [ ] `greet`
## Answer
1. `Hello, world!`

# Question 2
## Tags
#python, #legb_rule
## Question
Which of the following statements about Python’s scoping rules (LEGB rule) is correct?
## Options
- [ ] Local variables override all other scopes, including built-ins and globals.
- [ ] Local variables take precedence over Enclosed (non-local) variables.
- [ ] Global variables take precedence over local variables.
- [ ] Built-in variables (like len) always have the highest priority.
## Answer
2. Local variables take precedence over Enclosed (non-local) variables.

# Question 3
## Tags
#python, #dunder_method #dunder_name
## Question
In Python, what does the `__name__` variable represent?
## Options
- [ ] It is a built-in variable that always returns the name of the operating system.
- [ ] It is a built-in variable that returns the path of the current file.
- [ ] It is a built-in variable that stores the name of the currently running module.
- [ ] It is a built-in variable that returns the version of Python in use.
## Answer
3. It is a built-in variable that stores the name of the currently running module.

# Question 4
## Tags
#python, #iterator
## Question
In Python, which method is used to return an iterator from a sequence?
## Options
- [ ] `iter()`
- [ ] `next()`
- [ ] `range()`
- [ ] `enumerate()`
## Answer
1. `iter()`

# Question 5
## Tags
## Question
Which of the following statements about Python’s `with` statement is correct?
## Options
- [ ] It is used to simplify exception handling within `try` and `except` blocks.
- [ ] It automatically closes resources like files after the code block inside it finishes executing.
- [ ] It can only be used with file objects.
- [ ] It was deprecated in Python 3.x and should not be used.
## Answer
2. It automatically closes resources like files after the code block inside it finishes executing.

# Question 6
## Tags
#python, #is #equal_to #operators
## Question
What is the difference between `is` and `==` operators in Python?
## Options
- [ ] `==` checks if the values of two objects are equal, while `is` checks if they are the same object in memory.
- [ ] `==` checks if two variables refer to the same object, while `is` checks if the values of the objects are equal.
- [ ] Both `is` and `==` check for value equality in Python.
- [ ] Both `is` and `==` check if two variables refer to the same object.
## Answer
1. `==` checks if the values of two objects are equal, while `is` checks if they are the same object in memory.

# Question 7
## Tags
#python, #object #memory_address
## Question
Which built-in Python function can be used to determine the memory address of an object?
## Options
- [ ] `memory()`
- [ ] `dir()`
- [ ] `id()`
- [ ] `ref()`
## Answer
3. `id()`

# Question 8
## Tags
#python, #package, #init.py
## Question
What is the purpose of the `__init__.py` file in a Python package?
## Options
- [ ] It indicates to Python that the directory should be treated as a package.
- [ ] It is a configuration file used to set environment variables.
- [ ] It is a script that automatically runs at startup of the Python interpreter.
- [ ] It contains build and version information for the package.
## Answer
1. It indicates to Python that the directory should be treated as a package.

# Question 9
## Tags
#python, #dunder_method #dunder_str, #string_function
## Question
What is the purpose of the `__str__` method in a Python class?
## Options
- [ ] It defines the string representation of the class’s instances for debugging and logging.
- [ ] It defines how the class’s instances should be summed using the `+` operator.
- [ ] It defines the behavior of the `==` operator for the class’s instances.
- [ ] It defines a custom constructor for creating class instances.
## Answer
1. It defines the string representation of the class’s instances for debugging and logging.

# Question 10
## Tags
#python, #data_structure, #dictionary
## Question
Which of the following is not a valid way to create a dictionary in Python?
## Options
- [ ] `dict([(1, 'a'), (2, 'b')])`
- [ ] `{1: 'a', 2: 'b'}`
- [ ] `dict(1='a', 2='b')`
- [ ] `dict(zip([1, 2], ['a', 'b']))`
## Answer
3. `dict(1='a', 2='b')`

# Question 11
## Tags
#python, #sort, #sorted #iterable
## Question
Which Python built-in function is used to sort an iterable?
## Options
- [ ] `sort()`
- [ ] `sorted()`
- [ ] `reverse()`
- [ ] `order()`
## Answer
2. `sorted()`

# Question 12
## Tags
#python #output_question #data_structure #list
## Question
What will the following code output?
```python
def func(a, b=[]):
    b.append(a)
    return b

print(func(1))
print(func(2))
```
## Options
- [ ] `[1]` and `[2]`
- [ ] `[1]` and `[1, 2]`
- [ ] `[1]` and `[2]` (in separate calls)
- [ ] Raises a `TypeError`
## Answer
1. `[1]` and `[1, 2]`

# Question 13
## Tags
#python, #oop, #static_method #decorator
## Question
What does the `@staticmethod` decorator in Python do?
## Options
- [ ] It defines a method that can only be accessed from a class instance.
- [ ] It defines a method that does not receive the instance (self) as its first argument.
- [ ] It defines a method that modifies class-level attributes.
- [ ] It defines a method that allows method overloading in Python.
## Answer
2. It defines a method that does not receive the instance (self) as its first argument.

# Question 14
## Tags
#python #output_question #data_structure #list
## Question
What will the following code output?
```python
x = [1, 2, 3]
y = x
y.append(4)
print(x)
```
## Options
- [ ] `[1, 2, 3, 4]`
- [ ] `[1, 2, 3]`
- [ ] `[1, 2, 3]` (unchanged)
- [ ] Raises a `TypeError`
## Answer
1. `[1, 2, 3, 4]`

# Question 15
## Tags
#python #generator #yield #keyword
## Question
What is the purpose of Python’s yield keyword?
## Options
- [ ] It is used to return a value and terminate a function.
- [ ] It is used to define a generator, returning values one at a time.
- [ ] It is used to pause and resume a function execution within loops.
- [ ] It is used to create asynchronous functions.
## Answer
2. It is used to define a generator, returning values one at a time.

# Question 16
## Tags
#python #output_question #data_structure #list #generator #rage
## Question
What will the following code output?
```python
x = (i**2 for i in range(3))
print(list(x))
print(list(x))
```
## Options
- [ ] `[0, 1, 4]` and `[0, 1, 4]`
- [ ] `[0, 1, 4]` and `[]`
- [ ] Raises a `TypeError`
- [ ] `[0, 1, 4]` and `[4, 1, 0]`
## Answer
2. `[0, 1, 4]` and `[]`

# Question 17
## Tags
#python #data_structure #list #string #string_split
## Question
Which of the following methods is used to convert a string into a list of words?
## Options
- [ ] `split()`
- [ ] `partition()`
- [ ] `sub()`
- [ ] `join()`
## Answer
1. `split()`

# Question 18
## Tags
#python #output_question #method #data_structure #list #default_list
## Question
What will the following code output?
```python
def foo(val, values=[]):
    values.append(val)
    return values

result1 = foo(1)
result2 = foo(2, [])
result3 = foo(3)

print(result1, result2, result3)
```
## Options
- [ ] `[1] [2] [3]`
- [ ] `[1, 3] [2] [1, 3]`
- [ ] `[1, 3] [2] [1, 3, 3]`
- [ ] `[1] [2] [1, 3]`
## Answer
4. `[1] [2] [1, 3]`

# Question 19
## Tags
## Question
Which of the following is not a valid Python data type?
## Options
- [ ] `list`
- [ ] `set`
- [ ] `tuple`
- [ ] `array`
## Answer
4. `array`

# Question 20
## Tags
#python #inbuilt_function #zip
## Question
What does the `zip()` function do in Python?
## Options
- [ ] Combines two or more iterables element-wise into tuples.
- [ ] Merges multiple dictionaries into one.
- [ ] Creates a compressed file from multiple input files.
- [ ] Splits an iterable into chunks of equal size.
## Answer
1. Combines two or more iterables element-wise into tuples.

# Question 21
## Tags
#python #output_question #data_structure #list #object_reference
## Question
What will the following code output?
```python
a = [1, 2, 3]
b = a
b[0] = 99
print(a)
```
## Options
- [ ] `[1, 2, 3]`
- [ ] `[99, 2, 3]`
- [ ] `[1, 99, 3]`
- [ ] `None`
## Answer
2. `[99, 2, 3]`

# Question 22
## Tags
#python #data_structure #dictionary #dictionary_methods
## Question
Which of the following methods can be used to remove a key-value pair from a dictionary?
## Options
- [ ] `del`
- [ ] `pop()`
- [ ] `remove()`
- [ ] Both A and B
## Answer
4. Both A and B

# Question 23
## Tags
#python #data_structure #set #logical_and #set_intersection
## Question
What will the following code output?
```python
a = {1, 2, 3}
b = {3, 4, 5}
print(a & b)
```
## Options
- [ ] `{1, 2, 3, 4, 5}`
- [ ] `{3}`
- [ ] `{}`
- [ ] `None`
## Answer
2. `{3}`

# Question 24
## Tags
#python #data_structure #list #range #list_comprehension
## Question
What will be the output of the following code?
```python
x = [i for i in range(5) if i % 2 == 0]
print(x)
```
## Options
- [ ] `[1, 3, 5]`
- [ ] `[0, 1, 2, 3, 4]`
- [ ] `[0, 2, 4]`
- [ ] `[1, 2, 3]`
## Answer
3. `[0, 2, 4]`

# Question 25
## Tags
#pyton #enumerate #data_structure #iterator #iterable #tuple
## Question
What is the purpose of the `enumerate()` function in Python?
## Options
- [ ] It generates tuples containing elements and their indices from an iterable.
- [ ] It iterates through a list in reverse order.
- [ ] It returns the size of an iterable.
- [ ] It splits an iterable into chunks.
## Answer
1. It generates tuples containing elements and their indices from an iterable.

# Question 26
## Tags
#python #reversed #data_structure #iterator #iterable #reverse_order
## Question
What does the `reversed()` function return in Python?
## Options
- [ ] A list of elements in reverse order.
- [ ] An iterator that accesses the given iterable in reverse order.
- [ ] A string with characters in reverse order.
- [ ] A tuple with elements in reverse order.
## Answer
2. An iterator that accesses the given iterable in reverse order.

# Question 27
## Tags
#python #output_question #data_structure #tuple #immutable
## Question
What will the following code output?
```python
x = (1, 2, 3)
x[0] = 10
print(x)
```
## Options
- [ ] `(10, 2, 3)`
- [ ] Raises a `TypeError`
- [ ] `[10, 2, 3]`
- [ ] `(1, 2, 3)`
## Answer
2. Raises a `TypeError`

# Question 28
## Tags
#python #iterable #all
## Question
What does the `all()` function return in Python?
## Options
- [ ] `True` if all elements in an iterable are true, otherwise `False`.
- [ ] `False` if any element in an iterable is true.
- [ ] The count of all true elements in an iterable.
- [ ] A list of all true elements in an iterable.
## Answer
1. `True` if all elements in an iterable are true, otherwise `False`.

# Question 29
## Tags
#python #output_question #data_structure #list #boolean
## Question
What will the following code output?
```python
print(bool([False, 0, None]))
```
## Options
- [ ] `False`
- [ ] `True`
- [ ] `None`
- [ ] Raises a `TypeError`
## Answer
2. `True`

# Question 30
## Tags
#python #output_question #set #logical_or #set_union
## Question
What will be the output of this code?
```python
x = {1, 2, 3}
y = {3, 4, 5}
print(x | y)
```
## Options
- [ ] `{3}`
- [ ] `{1, 2, 3, 4, 5}`
- [ ] `{}`
- [ ] `None`
## Answer
2. `{1, 2, 3, 4, 5}`

# Question 31
## Tags
#python #oop #isinstance #class #subclass #object
## Question
What does the `isinstance()` function do in Python?
## Options
- [ ] Checks if a variable exists in memory.
- [ ] Checks if an object is an instance of a specific class or subclass.
- [ ] Checks if two objects are identical.
- [ ] Checks if an object has specific attributes.
## Answer
2. Checks if an object is an instance of a specific class or subclass.

# Question 32
## Tags
#python #output_question #data_structure #dictionary #truthy
## Question
What will the following code output?
```python
print({True: "yes", 1: "no", 1.0: "maybe"})
```
## Options
- [ ] `{True: "yes", 1: "no", 1.0: "maybe"}`
- [ ] `{1.0: "maybe"}`
- [ ] `{True: "maybe"}`
- [ ] `{True: "maybe", 1: "no"}`
## Answer
3. `{True: "maybe"}`

# Question 33
## Tags
#python #string
## Question
What will be the output of this code?
```python
print(3 * "abc")
```
## Options
- [ ] `abcabcabc`
- [ ] `abc*3`
- [ ] Error
- [ ] `abcabc` `abc`
## Answer
1. `abcabcabc`

# Question 34
## Tags
#python #data_structure #set 
## Question
Which of the following is not a valid way to create a set in Python?
## Options
- [ ] `{1, 2, 3}`
- [ ] `set([1, 2, 3])`
- [ ] `set(1, 2, 3)`
- [ ] `set()`
## Answer
3. `set(1, 2, 3)`

# Question 35
## Tags
#python #data_structure #string #zfill
## Question
What does the `str.zfill(width)` method do in Python?
## Options
- [ ] Fills the string with zeros at the end to make it the given width.
- [ ] Fills the string with zeros at the beginning to make it the given width.
- [ ] Returns a string padded with spaces to the given width.
- [ ] Truncates the string to the given width.
## Answer
2. Fills the string with zeros at the beginning to make it the given width.

# Question 36
## Tags
#python #output_question #data_structure #dictionary #range #list #dictionary_comprehension
## Question
What will the following code output?
```python
print({i: i*i for i in range(3)})
```
## Options
- [ ] `{0: 0, 1: 1, 2: 4}`
- [ ] `[0: 0, 1: 1, 2: 4]`
- [ ] `{1: 1, 2: 4}`
- [ ] Raises a `SyntaxError`
## Answer
1. `{0: 0, 1: 1, 2: 4}`

# Question 37
## Tags
#python #keyword #function #lambda
## Question
What is the purpose of the lambda keyword in Python?
## Options
- [ ] Defines a single-line function without a name.
- [ ] Creates a function that modifies global variables.
- [ ] Defines a multi-line function with no arguments.
- [ ] Returns an object reference instead of a function.
## Answer
1. Defines a single-line function without a name.

# Question 38
## Tags
#python #output_question #data_structure #list #list_slicing
## Question
What will this code output?
```python
nums = [1, 2, 3, 4, 5]
print(nums[1:4])
```
## Options
- [ ] `[1, 2, 3]`
- [ ] `[2, 3, 4]`
- [ ] `[3, 4, 5]`
- [ ] Raises an `IndexError`
## Answer
2. `[2, 3, 4]`

# Question 39
## Tags
#python #data_structure #set #empty_set
## Question
Which of the following is the correct way to create an empty set in Python?
## Options
- [ ] `set()`
- [ ] `{}`
- [ ] `[]`
- [ ] `None`
## Answer
1. `set()`

# Question 40
## Tags
#python #output_question #type #data_structure #tuple
## Question
What will the following code output?
```python
print(type((1,)))
```
## Options
- [ ] `<class 'tuple'>`
- [ ] `<class 'list'>`
- [ ] `<class 'int'>`
- [ ] Raises a `SyntaxError`
## Answer
1. `<class 'tuple'>`

# Question 41
## Tags
#python #output_question #data_structure #set
## Question
What will this code output?
```python
print(len({1, 2, 2, 3, 3, 3}))
```
## Options
- [ ] 6
- [ ] 3
- [ ] 2
- [ ] 4
## Answer
2. 3

# Question 42
## Tags
#python #output_question #data_structure #list #list_slicing #object_reference
## Question
What does the following code do?
```python
x = [1, 2, 3]
y = x[:]
y[0] = 99
print(x)
```
## Options
- [ ] `[1, 2, 3]` (unchanged)
- [ ] `[99, 2, 3]`
- [ ] Raises a `TypeError`
- [ ] `[1, 99, 3]`
## Answer
1. `[1, 2, 3]` (unchanged)

# Question 42
## Tags
#python #character #ascii_value
## Question
Which function is used to get the ASCII value of a character in Python?
## Options
- [ ] `ascii()`
- [ ] `ord()`
- [ ] `chr()`
- [ ] `ordascii()`
## Answer
2. `ord()`

# Question 43
## Tags
#python #output_question #data_structure #string
## Question
What will the following code output?
```python
print("abc" * 0)
```
## Options
- [ ] `""` (empty string)
- [ ] `abc`
- [ ] `0abc`
- [ ] Raises a `TypeError`
## Answer
1. `""` (empty string)

# Question 44
## Tags
#python #output_question #data_structure #list
## Question
What will this code output?
```python
nums = [1, 2, 3]
nums.append([4, 5])
print(len(nums))
```
## Options
- [ ] 3
- [ ] 4
- [ ] 5
- [ ] Raises a `TypeError`
## Answer
2. 4

# Question 45
## Tags
#python #output_question #data_structure #list #list_append
## Question
What will the following code output?
```python
print([1, 2, 3] + [4, 5])
```
## Options
- [ ] `[1, 2, 3, 4, 5]`
- [ ] `[5, 4, 3, 2, 1]`
- [ ] `[1, 2, 3][4, 5]`
- [ ] Raises a `TypeError`
## Answer
1. `[1, 2, 3, 4, 5]`

# Question 46
## Tags
#python #output_question #scope #nonlocal 
## Question
What will this code output?
```python
x = 10
def outer():
    x = 20
    def inner():
        nonlocal x
        x += 10
        return x
    return inner()

print(outer())
```
## Options
- [ ] 30
- [ ] 40
- [ ] Raises a `SyntaxError`
- [ ] Raises an `UnboundLocalError`
## Answer
1. 30

# Question 47
## Tags
#python #output_question #data_structure #set #set_intersection #set_difference #set_add
## Question
What will this code output?
```python
a = {1, 2, 3}
b = {3, 4, 5}
c = a.intersection(b)
d = a.difference(b)
a.add(6)
print(c, d, a)
```
## Options
- [ ] `{3} {1, 2} {1, 2, 3, 6}`
- [ ] `{3} {1, 2, 3, 4, 5} {1, 2, 3, 6}`
- [ ] `{1, 2} {3} {1, 2, 6}`
- [ ] Raises a `TypeError`
## Answer
1. `{3} {1, 2} {1, 2, 3, 6}`

# Question 48
## Tags
#python #output_question #oop #class #variable_scope #scope #class_variable #instance_variable
## Question
What will this code output?
```python
class Test:
    count = 0

    def __init__(self):
        Test.count += 1

a = Test()
b = Test()
a.count += 1
print(Test.count, a.count, b.count)
```
## Options
- [ ] `1 1 1`
- [ ] `2 2 2`
- [ ] `2 3 2`
- [ ] `3 3 3`
## Answer
2. `2 3 2`

# Question 49
## Tags
#python #output_question #itertools #itertools_permutations
## Question
What will the following code output?
```python
import itertools

result = list(itertools.permutations([1, 2, 3], 2))
print(result)
```
## Options
- [ ] `[(1, 2), (2, 1), (1, 3), (3, 1), (2, 3), (3, 2)]`
- [ ] `[(1, 2), (1, 3), (2, 1), (2, 3), (3, 1), (3, 2)]`
- [ ] `[(1, 2), (2, 3), (3, 1)]`
- [ ] `[(1, 3), (2, 1), (3, 2)]`
## Answer
2. `[(1, 2), (1, 3), (2, 1), (2, 3), (3, 1), (3, 2)]`

# Question 50
## Tags
#python #output_question #data_structure #list #list_slicing
## Question
What will this code output?
```python
x = [1, 2, 3, 4]
print(x[::-2])
```
## Options
- [ ] `[4, 3]`
- [ ] `[4, 2]`
- [ ] `[4, 3, 2, 1]`
- [ ] `[4, 2, 1]`
## Answer
2. `[4, 2]`

# Question 51
## Tags
## Question
What will the following code output?
```python
a = [1, 2, 3]
b = a * 2
c = [a] * 2
a[0] = 99
print(b, c)
```
## Options
- [ ] `[1, 2, 3, 1, 2, 3], [[99, 2, 3], [99, 2, 3]]`
- [ ] `[1, 2, 3, 1, 2, 3], [[1, 2, 3], [1, 2, 3]]`
- [ ] `[99, 2, 3, 99, 2, 3], [[99, 2, 3], [99, 2, 3]]`
- [ ] Raises a `TypeError`
## Answer
1. `[1, 2, 3, 1, 2, 3], [[99, 2, 3], [99, 2, 3]]`

# Question 52
## Tags
#python #output_question #data_structure #set #set_union #set_intersection #set_difference
## Question
What will this code output?
```python
x = {1, 2, 3}
y = {3, 4, 5}
z = x | y - x & y
print(z)
```
## Options
- [ ] `{1, 2, 3, 4, 5}`
- [ ] `{1, 2, 4, 5}`
- [ ] `{4, 5}`
- [ ] Raises a `TypeError`
## Answer
2. `{1, 2, 4, 5}`

# Question 53
## Tags
#python #output_question #data_structure #list #zip #iterator #generator
## Question
What will this code output?
```python
x = [1, 2, 3]
y = [4, 5, 6]
z = zip(x, y)
print(list(z))
print(list(z))
```
## Options
- [ ] `[(1, 4), (2, 5), (3, 6)], [(1, 4), (2, 5), (3, 6)]`
- [ ] `[(1, 4), (2, 5), (3, 6)], []`
- [ ] Raises a `TypeError`
- [ ] `[(1, 4), (2, 5), (3, 6)], [(4, 5, 6)]`
## Answer
2. `[(1, 4), (2, 5), (3, 6)], []`

# Question 54
## Tags
#python #function #data_structure #list
## Question
What will this code output?
```python
def func(nums, value):
    nums.append(value)
    nums = [x * 2 for x in nums]
    return nums

lst = [1, 2, 3]
result = func(lst, 4)
print(lst, result)
```
## Options
- [ ] `[1, 2, 3], [2, 4, 6, 8]`
- [ ] `[1, 2, 3, 4], [2, 4, 6, 8]`
- [ ] `[1, 2, 3, 4], [1, 2, 3, 4]`
- [ ] Raises an `UnboundLocalError`
## Answer
2. `[1, 2, 3, 4], [2, 4, 6, 8]`

# Question 55
## Tags
#python #output_question #data_structure #list #list_comprehension #list_sum
## Question
What will this code output?
```python
x = [1, 2, 3]
y = (i * 2 for i in x)
print(sum(y) + sum(y))
```
## Options
- [ ] `12`
- [ ] `6`
- [ ] Raises a `TypeError`
- [ ] `0`
## Answer
1. 12

# Question 56
## Tags
#python #decorator
## Question
Which of the following statements about Python decorators is true?
## Options
- [ ] Decorators are functions that modify the behavior of another function or method.
- [ ] A decorator can only be applied to functions, not classes or methods.
- [ ] A decorator must always return a callable object.
- [ ] The `@` syntax for decorators was introduced in Python 2.0.
## Answer
1. Decorators are functions that modify the behavior of another function or method.

# Question 57
## Tags
#python #global_interpreter_lock
## Question
Which of the following statements about Python’s GIL (Global Interpreter Lock) is correct?
## Options
- [ ] Python’s GIL ensures that multiple threads can execute simultaneously on multi-core CPUs.
- [ ] Python’s GIL allows only one thread to execute Python bytecode at a time.
- [ ] The GIL is not present in Python implementations like CPython.
- [ ] The GIL ensures thread safety for Python’s built-in data types.
## Answer
2. Python’s GIL allows only one thread to execute Python bytecode at a time.

# Question 58
## Tags
#python #output_question #data_structure #list
## Question
What will this code output?
```python
x = [[0] * 3] * 3
x[0][0] = 1
print(x)
```
## Options
- [ ] `[[1, 0, 0], [0, 0, 0], [0, 0, 0]]`
- [ ] `[[1, 0, 0], [1, 0, 0], [1, 0, 0]]`
- [ ] `[[1, 0, 0], [0, 1, 0], [0, 0, 1]]`
- [ ] Raises an `IndexError`
## Answer
2. `[[1, 0, 0], [1, 0, 0], [1, 0, 0]]`

# Question 59
## Tags
## Question
Which of the following is the most accurate statement about Python’s `@classmethod` decorator?
## Options
- [ ] It can modify both instance and class-level attributes.
- [ ] It can access and modify class-level attributes but cannot access instance attributes.
- [ ] It is used to override the `__init__` method.
- [ ] It is equivalent to the `@staticmethod` decorator.
## Answer
2. It can access and modify class-level attributes but cannot access instance attributes.

# Question 60
## Tags
#python #output_question #oop #inheritance
## Question
What will this code output?
```python
class Parent:
    def __init__(self):
        self.value = 42

class Child(Parent):
    def __init__(self):
        super().__init__()
        self.value += 1

obj = Child()
print(obj.value)
```
## Options
- [ ] `42`
- [ ] `43`
- [ ] Raises an `AttributeError`
- [ ] Raises a `TypeError`
## Answer
2. `43`

# Question 61
## Tags
#python #output_question #oop #inheritance #method_resolution_order
## Question
What will this code output?
```python
class A:
    def greet(self):
        return "Hello from A"

class B(A):
    def greet(self):
        return "Hello from B"

class C(A):
    def greet(self):
        return "Hello from C"

class D(B, C):
    pass

obj = D()
print(obj.greet())
```
## Options
- [ ] `Hello from A`
- [ ] `Hello from B`
- [ ] `Hello from C`
- [ ] Raises an `AmbiguityError`
## Answer
2. `Hello from B`

# Question 62
## Tags
#python #output_question #package #module #init.py
## Question
What will happen when the following code is executed?
```python
from mypackage import module
```
## Options
- [ ] mypackage must have an `__init__.py` file for this import to work.
- [ ] mypackage and module are imported into the current namespace.
- [ ] The import will fail if module is not explicitly listed in mypackage.`__all__`.
- [ ] mypackage can be imported even without `__init__.py` in Python 3.3 and above.
## Answer
4. mypackage can be imported even without `__init__.py` in Python 3.3 and above.

# Question 63
## Tags
#python #output_question #scope #nonlocal
## Question
What will this code output?
```python
def outer():
    x = 10
    def inner():
        nonlocal x
        x = x + 5
        return x
    return inner

fn = outer()
print(fn())
print(fn())
```
## Options
- [ ] `10, 10`
- [ ] `15, 15`
- [ ] `15, 20`
- [ ] Raises an `UnboundLocalError`
## Answer
3. `15, 20`

# Question 64
## Tags
#python #decorator #property #getter
## Question
Which of the following best describes Python’s `@property` decorator?
## Options
- [ ] It converts a method into a getter for a property.
- [ ] It allows defining a method as a read-only property.
- [ ] It allows methods to be overridden dynamically.
- [ ] It ensures a method cannot be accessed without a valid instance.
## Answer
1. It converts a method into a getter for a property.

# Question 65
## Tags
#python #output_question #oop #variable #getter
## Question
What will this code output?
```python
class MyClass:
    def __init__(self):
        self.data = [1, 2, 3]

    def __getitem__(self, index):
        return self.data[index] + 10

obj = MyClass()
print(obj[1], obj[2])
```
## Options
- [ ] `12, 13`
- [ ] `11, 12`
- [ ] Raises an `AttributeError`
- [ ] Raises a `TypeError`
## Answer
1. `12, 13`

# Question 66
## Tags
#python #output_question #oop #inheritance #class_variable #instance_variable
## Question
What will this code output?
```python
class A:
    x = 5

    def __init__(self):
        self.x = 10

class B(A):
    pass

obj = B()
print(obj.x, A.x, B.x)
```
## Options
- [ ] `5, 5, 5`
- [ ] `10, 5, 5`
- [ ] `5, 10, 10`
- [ ] `10, 10, 5`
## Answer
2. `10, 5, 5`

# Question 67
## Tags
#python #output_question #oop #method_chaining
## Question
What will this code output?
```python
class MyClass:
    def __init__(self):
        self.value = 1

    def increment(self):
        self.value += 1
        return self

obj = MyClass()
print(obj.increment().increment().value)
```
## Options
- [ ] `1`
- [ ] `2`
- [ ] `3`
- [ ] Raises an `AttributeError`
## Answer
3. `3`

# Question 68
## Tags
#python #oop #static_method #decorator
## Question
Which of the following statements about Python’s `@staticmethod` decorator is correct?
## Options
- [ ] It can modify both class-level and instance-level attributes.
- [ ] It does not take self or cls as its first argument.
- [ ] It can only access instance-level attributes.
- [ ] It ensures the method cannot be overridden in subclasses.
## Answer
2. It does not take self or cls as its first argument.

# Question 69
## Tags
#python #identifier
## Question
What is the maximum length of a Python identifier?
## Options
- [ ] 32
- [ ] 16
- [ ] 128
- [ ] No fixed length is specified
## Answer
4. No fixed length is specified

# Question 70
## Tags
#python #output_question #arithmetic
## Question
What will be the output of the following code snippet?
```python
print(2**3 + (5 + 6)**(1 + 1))
```
## Options
- [ ] 129
- [ ] 8
- [ ] 121
- [ ] Raises a `SyntaxError`
## Answer
1. 129

# Question 71
## Tags
#python #output_question #data_type
## Question
What will be the datatype of the var in the below code snippet?
```python
var = 10
print(type(var))
var = "Hello"
print(type(var))
```
## Options
- [ ] `str` and `int`
- [ ] `int` and `int`
- [ ] `str` and `str`
- [ ] `int` and `str`
## Answer
4. `int` and `str`

# Question 72
## Tags
#python #code_block
## Question
How is a code block indicated in Python?
## Options
- [ ] Brackets
- [ ] Indentation
- [ ] Key
- [ ] Comments
## Answer
2. Indentation

# Question 73
## Tags
#python #output_question #data_structure #float #int
## Question
What will be the output of the following code snippet?
```python
print(type(5 / 2))
print(type(5 // 2))
```
## Options
- [ ] `float` and `int`
- [ ] `int` and `float`
- [ ] `float` and `float`
- [ ] `int` and `int`
## Answer
1. `float` and `int`

# Question 74
## Tags
#python #output_question #variable_swap
## Question
What will be the output of the following code snippet?
```python
a = 3
b = 1 
print(a, b)
a, b = b, a 
print(a, b)
```
## Options
- [ ] `3, 1` and `1, 3`
- [ ] `3, 1` and `3, 1`
- [ ] `1, 3` and `1, 3`
- [ ] `1, 3` and `3, 1`
## Answer
1. `3, 1` and `1, 3`

# Question 75
## Tags
#python #loop
## Question
Which of the following types of loops are not supported in Python?
## Options
- [ ] `while` loop
- [ ] `for` loop
- [ ] `do-while` loop
- [ ] None of the above
## Answer
3. `do-while` loop

# Question 76
## Tags
#python #output_question #data_structure #list #list_del
## Question
What will be the output of the following code snippet?
```python
example = ["Sunday", "Monday", "Tuesday", "Wednesday"];
del example[2]
print(example)
```
## Options
- [ ] `["Sunday", "Monday", "Tuesday", "Wednesday"]`
- [ ] `["Sunday", "Monday", "Wednesday"]`
- [ ] `["Monday", "Tuesday", "Wednesday"]`
- [ ] `["Sunday", "Monday", "Tuesday"]`
## Answer
2. `["Sunday", "Monday", "Wednesday"]`

# Question 77
## Tags
#python #output_question #data_structure #list #list_search
## Question
Which of the following is the proper syntax to check if a particular element is present in a list?
## Options
- [ ] `if element in list`
- [ ] `if element not in list`
- [ ] Both a and b
- [ ] None of the above
## Answer
3. Both a and b

# Question 78
## Tags
#python #output_question #data_structure #tuple #tuple_sort #sorted
## Question
What will be the type of the variable sorted_numbers in the below code snippet?
```python
numbers = (4, 7, 19, 2, 89, 45, 72, 22)
sorted_numbers = sorted(numbers)
print(sorted_numbers)
```
## Options
- [ ] `list`
- [ ] `tuple`
- [ ] `string`
- [ ] `int`
## Answer
1. `list`

# Question 79
## Tags
#python #output_question #data_structure #tuple #tuple_filter #filter
## Question
What will be the output of the following code snippet?
```python
numbers = (4, 7, 19, 2, 89, 45, 72, 22)
sorted_numbers = sorted(numbers)
even = lambda a: a % 2 == 0
even_numbers = filter(even, sorted_numbers)
print(type(even_numbers))
```
## Options
- [ ] `filter`
- [ ] `int`
- [ ] `list`
- [ ] `tuple`
## Answer
1. `filter`

# Question 80
## Tags
#python #output_question #data_structure #list #list_slice
## Question
What will be the output of the following code snippet?
```python
example = ["Sunday", "Monday", "Tuesday", "Wednesday"];
print(example[-3:-1])
```
## Options
- [ ] `["Monday", "Tuesday"]`
- [ ] `["Sunday", "Monday"]`
- [ ] `["Tuesday", "Wednesday"]`
- [ ] `["Wednesday", "Monday"]`
## Answer
1. `["Monday", "Tuesday"]`

# Question 81
## Tags
#python #datetime
## Question
Which of the following functions converts date to corresponding time in Python?
## Options
- [ ] `strptime()`
- [ ] `strftime()`
- [ ] Both a and b
- [ ] None of the above
## Answer
1. `strptime()`

# Question 82
## Tags
#python #args
## Question
As what datatype are the *args stored, when passed into a function?
## Options
- [ ] `list`
- [ ] `tuple`
- [ ] `dictionary`
- [ ] `set`
## Answer
2. `tuple`

# Question 83
## Tags
#python #output_question #kwargs
## Question
What will be the output of the following code snippet?
```python
def tester(**kwargs):
   for key, value in kwargs.items():
       print(key, value, end = " ")
tester(Sunday = 1, Monday = 2, Tuesday = 3, Wednesday = 4)
```
## Options
- [ ] `Sunday 1 Monday 2 Tuesday 3 Wednesday 4`
- [ ] `Sunday 1 Monday 2 Tuesday 3`
- [ ] `Wednesday 4`
- [ ] `Sunday 1`
## Answer
1. `Sunday 1 Monday 2 Tuesday 3 Wednesday 4`

# Question 84
## Tags
#python #kwargs
## Question
As what datatype are the *kwargs stored, when passed into a function?
## Options
- [ ] `list`
- [ ] `tuple`
- [ ] `dictionary`
- [ ] `set`
## Answer
3. `dictionary`

# Question 85
## Tags
#python #exception_handling
## Question
Which of the following blocks will always be executed whether an exception is encountered or not in a program?
## Options
- [ ] `except`
- [ ] `finally`
- [ ] `else`
- [ ] `try`
## Answer
2. `finally`

# Question 86
## Tags
#python #output_question #math #math_functions
## Question
What will be the output of the following code snippet?
```python
from math import *
a = 2.19
b = 3.999999
c = -3.30
print(int(a), floor(b), ceil(c), fabs(c))
```
## Options
- [ ] 2, 3, -3, 3.3
- [ ] 3, 4, -3, 3
- [ ] 2, 3, -3, 3
- [ ] 2, 3, -3, -3.3
## Answer
1. 2, 3, -3, 3.3

# Question 87
## Tags
#python #output_question #data_structure #set #set_union
## Question
What will be the output of the following code snippet?
```python
set1 = {1, 3, 5}
set2 = {2, 4, 6}
print(len(set1 + set2))
```
## Options
- [ ] 3
- [ ] 6
- [ ] 0
- [ ] Raises a `TypeError`
## Answer
4. Raises a `TypeError`

# Question 88
## Tags
#python #exception_handling
## Question
What keyword is used in Python to raise exceptions?
## Options
- [ ] `throw`
- [ ] `raise`
- [ ] `catch`
- [ ] `try`
## Answer
2. `raise`

# Question 89
## Tags
#python #output_question #data_structure #set #set_union
## Question
What will be the output of the following code snippet?
```python
s1 = {1, 2, 3, 4, 5}
s2 = {2, 4, 6}
print(s1 ^ s2)
```
## Options
- [ ] `{1, 2, 3, 4, 5}`
- [ ] `{1, 3, 5, 6}`
- [ ] `{2, 4}`
- [ ] `{1, 2, 3, 4, 5, 6}`
## Answer
2. `{1, 3, 5, 6}`

# Question 90
## Tags
#python #output_question #filter #data_structure #list
## Question
What will be the output of the following code snippet?
```python
a = [[], "abc", [0], 1, 0]
print(list(filter(bool, a)))
```
## Options
- [ ] `["abc", [0], 1]`
- [ ] `[1]`
- [ ] `["abc"]`
- [ ] `[1, "abc", [0]]`
## Answer
1. `["abc", [0], 1]`

# Question 91
## Tags
#python
## Question
In which language is Python written?
## Options
- [ ] C++
- [ ] Java
- [ ] C
- [ ] JavaScript
## Answer
3. C

# Question 92
## Tags
#python #output_question #variable_scope #global #keyword
## Question
What will be the output of the following code snippet?
```python
def func():
   global value
   value = "Local"
   
value = "Global"
func()
print(value)
```
## Options
- [ ] Raises a `NameError`
- [ ] Raises a `SyntaxError`
- [ ] `Local`
- [ ] `Global`
## Answer
3. `Local`

# Question 93
## Tags
#python #output_question #data_structure #list
## Question
What will be the output of the following code snippet?
```python
def solve(a):
   a = [1, 3, 5]
a = [2, 4, 6]
print(a)
solve(a)
print(a)
```
## Options
- [ ] `[2, 4, 6]`, `[2, 4, 6]`
- [ ] `[2, 4, 6]`, `[1, 3, 5]`
- [ ] `[1, 3, 5]`, `[1, 3, 5]`
- [ ] `[1, 3, 5]`, `[2, 4, 6]`
## Answer
1. `[2, 4, 6]`, `[2, 4, 6]`

# Question 94
## Tags
#python #comment
## Question
Which of the following character is used to give single-line comments in Python?
## Options
- [ ] `//`
- [ ] `#`
- [ ] `!`
- [ ] `/**/`
## Answer
2. `#`

# Question 95
## Tags
#python #output_question #arithmetic #operator #operator_precedence
## Question
What is the output of the following code snippet?
```python
print(2**(3**2), (2**3)**2, 2**3**2)
```
## Options
- [ ] 512, 64, 512
- [ ] 512, 512, 512
- [ ] 64, 512, 64
- [ ] 64, 64, 64
## Answer
1. 512, 64, 512

# Question 96
## Tags
#python #output_question #data_structure #boolean
## Question
What will be the output of the following Python function?
```python
print(min(max(False,-3,-4), 2,7))
```
## Options
- [ ] `-4`
- [ ] `-3`
- [ ] `2`
- [ ] `False`
## Answer
4. `False`

# Question 97
## Tags
#python #output_question #data_structure #float
## Question
What will be the output of the following Python code?
```python
x = 56.236
print("%.2f"%x)
```
## Options
- [ ] `56.236`
- [ ] `56.23`
- [ ] `56.0000`
- [ ] `56.24`
## Answer
4. `56.24`

# Question 98
## Tags
#python #output_question #data_structure #list #id #object_id
## Question
What will be the output of the following Python program?
```python
def foo(x):
    x[0] = ['def']
    x[1] = ['abc']
    return id(x)
q = ['abc', 'def']
print(id(q) == foo(q))
```
## Options
- [ ] Raises a `SyntaxError`
- [ ] `None`
- [ ] `True`
- [ ] `False`

## Answer
3. `True`

# Question 99
## Tags
#python #output_question #data_structure #set
## Question
What will be the output of the following Python program?
```python
z=set('abc')
print(z)
z.add('san')
print(z)
z.update(set(['p', 'q']))
print(z)
```
## Options
- [ ] `{"abc"}`, `{"abc", "san"}`, `{"abc", "san", "p", "q"}`
- [ ] `{"a", "b", "c"}`, `{"a", "b", "c", "san"}`, `{"a", "b", "c", "san", "p", "q"}`
- [ ] `{"abc"}`, `{"abc", "san"}`, `{"abc", "san", "pq"}`
- [ ] `{"a", "b", "c"}`, `{"a", "b", "c", "san"}`, `{"a", "b", "c", "san", "pq"}`
## Answer
1. `{"a", "b", "c"}`, `{"a", "b", "c", "san"}`, `{"a", "b", "c", "san", "p", "q"}`

# Question 100
## Tags
#python #output_question #data_structure #string #string_center
## Question
What will be the output of the following Python code?
```python
print('*', "abcde".center(6), '*', sep='')
```
## Options
- [ ] `*  abcde *`
- [ ] `*abcde *`
- [ ] `* abcde*`
- [ ] `* abcde  *`
## Answer
2. `*abcde *`

# Question 101
## Tags
#python #output_question #control_flow #while_loop #while_else
## Question
What will be the output of the following Python program?
```python
i = 0
while i < 5:
    print(i)
    i += 1
    if i == 3:
        break
else:
    print(0)
```
## Options
- [ ] Raises a `SyntaxError`
- [ ] `0 1 2 0`
- [ ] `0 1 2`
- [ ] No output
## Answer
3. `0 1 2`

# Question 102
## Tags
#python #output_question #data_structure #set
## Question
What will be the output of the following Python code snippet?
```python
z = set('abc$de')
print('a' in z)
```
## Options
- [ ] `True`
- [ ] `False`
- [ ] Raises a `SyntaxError`
- [ ] Raises a `NameError`
## Answer
1. `True`

# Question 103
## Tags
#python #output_question #data_structure #string #string_formatting #format
## Question
What will be the output of the following Python code?
```python
print("Hello {0[0]} and {0[1]}".format(('foo', 'bin')))
```
## Options
- [ ] `Hello f and o`
- [ ] `Hello foo and bin`
- [ ] Raises a `SyntaxError`
- [ ] `Hello and`
## Answer
2. `Hello foo and bin`

# Question 104
## Tags
#python #output_question #data_structure #list #list_join #string #map
## Question
What will be the output of the following Python code?
```python
x = [[0], [1]]
print((' '.join(list(map(str, x))),))
x = [[0, 1], [2, 3]]
print((' '.join(list(map(str, x))),))
```
## Options
- [ ] `[0] [1]`, `[0, 1] [2, 3]`
- [ ] `01`, `0123`
- [ ] `('[0] [1]',)`, `('[0, 1] [2, 3]',)`
- [ ] `['01', '0123']`
## Answer
3. `('[0] [1]',)`, `('[0, 1] [2, 3]',)`

# Question 105
## Tags
#python #output_question #exception_handling #try #finally
## Question
What will be the output of the following Python code?
```python
def foo():
    try:
        return 1
    finally:
        return 2
k = foo()
print(k)
```
## Options
- [ ] `1`
- [ ] `2`
- [ ] Raises a `SyntaxError`
- [ ] Raises a `NameError`
## Answer
2. `2`










# Question 101
## Tags
## Question
## Options
## Answer
