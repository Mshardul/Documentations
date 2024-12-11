- [Question 1](#question-1)
- [Question 2](#question-2)
- [Question 3](#question-3)
- [Question 4](#question-4)
- [Question 5](#question-5)
- [Question 6](#question-6)
- [Question 7](#question-7)
- [Question 8](#question-8)
- [Question 9](#question-9)
- [Question 10](#question-10)
- [Question 11](#question-11)
- [Question 12](#question-12)
- [Question 13](#question-13)
- [Question 14](#question-14)
- [Question 15](#question-15)
- [Question 16](#question-16)
- [Question 17](#question-17)
- [Question 18](#question-18)
- [Question 19](#question-19)
- [Question 20](#question-20)
- [Question 21](#question-21)
- [Question 22](#question-22)
- [Question 23](#question-23)
- [Question 24](#question-24)
- [Question 25](#question-25)
- [Question 26](#question-26)
- [Question 27](#question-27)
- [Question 28](#question-28)
- [Question 29](#question-29)
- [Question 30](#question-30)
- [Question 31](#question-31)
- [Question 32](#question-32)
- [Question 33](#question-33)
- [Question 34](#question-34)
- [Question 35](#question-35)
- [Question 36](#question-36)
- [Question 37](#question-37)
- [Question 38](#question-38)
- [Question 39](#question-39)
- [Question 40](#question-40)
- [Question 41](#question-41)
- [Question 42](#question-42)
- [Question 42](#question-42-1)
- [Question 43](#question-43)
- [Question 44](#question-44)
- [Question 45](#question-45)
- [Question 46](#question-46)
- [Question 47](#question-47)
- [Question 48](#question-48)
- [Question 49](#question-49)
- [Question 41](#question-41-1)


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
- [ ] Enclosed (non-local) variables take precedence over local variables.
- [ ] Global variables take precedence over local variables.
- [ ] Built-in variables (like len) always have the highest priority.
## Answer
2. Enclosed (non-local) variables take precedence over local variables.

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
#python, #package, #init_file
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
2. `2 2 2`

# Question 49
## Tags
#python #output_question #itertools
## Question
What will the following code output?
```python
import itertools

result = list(itertools.permutations([1, 2, 3], 2))
print(result)
```
## Options
## Answer



# Question 41
## Tags
## Question
## Options
## Answer