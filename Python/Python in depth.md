# INDEX
- [INDEX](#index)
- [Python Basics](#python-basics)
  - [Basic Syntax](#basic-syntax)
    - [Comments](#comments)
    - [Code structure](#code-structure)
  - [Variables, Data Types, and Basic Operations](#variables-data-types-and-basic-operations)
    - [Dynamic typing](#dynamic-typing)
    - [Variable naming conventions](#variable-naming-conventions)
    - [Basic data types:](#basic-data-types)
    - [Type conversion](#type-conversion)
    - [Type checking](#type-checking)
    - [Truthy and Falsy values](#truthy-and-falsy-values)
  - [Operators](#operators)
    - [Type of Operators](#type-of-operators)
    - [Operator Precedence](#operator-precedence)
    - [Associativity](#associativity)
  - [Input and Output](#input-and-output)
    - [`input()` function](#input-function)
    - [`print()` function](#print-function)
  - [Control Flow](#control-flow)
    - [Conditional Statements (if, elif, else)](#conditional-statements-if-elif-else)
    - [Loops](#loops)
- [Data Structures in Python](#data-structures-in-python)
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
- [Functions, Lambda Expressions and Recursion](#functions-lambda-expressions-and-recursion)
  - [Defining Functions](#defining-functions)
    - [Function Syntax](#function-syntax)
    - [Function Arguments](#function-arguments)
  - [Scope and Lifetime of Variables](#scope-and-lifetime-of-variables)
    - [Local Scope for Local Variables](#local-scope-for-local-variables)
    - [Enclosing (Non-Local) Scope:](#enclosing-non-local-scope)
    - [Global Scope for Global Variables](#global-scope-for-global-variables)
    - [Built-in Scope](#built-in-scope)
    - [LEGB Rule:](#legb-rule)
    - [Modifying Variable Scopes](#modifying-variable-scopes)
  - [Higher-Order Functions:](#higher-order-functions)
    - [A higher-order function](#a-higher-order-function)
    - [Functions as First-Class Citizens](#functions-as-first-class-citizens)
    - [Returning Functions from Functions](#returning-functions-from-functions)
    - [Common Higher-Order Functions in Python](#common-higher-order-functions-in-python)
  - [Closures](#closures)
    - [Introduction to Closures](#introduction-to-closures)
    - [Importance of Closures](#importance-of-closures)
    - [Closure Retaining State](#closure-retaining-state)
    - [How Closures Work](#how-closures-work)
    - [Practical Applications of Closures](#practical-applications-of-closures)
    - [The `nonlocal` Keyword and Closures:](#the-nonlocal-keyword-and-closures)
    - [Benefits of closures](#benefits-of-closures)
    - [Limitations of closures](#limitations-of-closures)
    - [Comparison with other concepts for state retention](#comparison-with-other-concepts-for-state-retention)
  - [Lambda Expressions](#lambda-expressions)
    - [Introduction to Lambda Expressions](#introduction-to-lambda-expressions)
    - [Common Use Cases of Lambda Expressions](#common-use-cases-of-lambda-expressions)
    - [Limitations of Lambda Expressions](#limitations-of-lambda-expressions)
    - [Lambda Expressions vs. Regular Functions](#lambda-expressions-vs-regular-functions)
  - [Decorators](#decorators)
    - [Introduction to Decorators](#introduction-to-decorators)
    - [How Decorators Work](#how-decorators-work)
    - [Common Use Cases of Decorators](#common-use-cases-of-decorators)
    - [Decorators with Arguments](#decorators-with-arguments)
    - [Chaining Decorators](#chaining-decorators)
    - [Maintaining Function Metadata](#maintaining-function-metadata)
    - [Decorators in Class Methods](#decorators-in-class-methods)
  - [Recursion](#recursion)
    - [Introduction to Recursion](#introduction-to-recursion)
    - [Advantages of Recursion](#advantages-of-recursion)
    - [Disadvantages of Recursion](#disadvantages-of-recursion)
    - [Tail Recursion](#tail-recursion)
    - [Memoization and Dynamic Programming](#memoization-and-dynamic-programming)
- [Object-Oriented Programming (OOP) in Python](#object-oriented-programming-oop-in-python)
  - [Introduction to OOP Concepts](#introduction-to-oop-concepts)
    - [Basics of OOP](#basics-of-oop)
  - [Key Concepts of OOP](#key-concepts-of-oop)
    - [Encapsulation and Abstraction](#encapsulation-and-abstraction)
    - [Inheritance:](#inheritance)
    - [Polymorphism](#polymorphism)
    - [Magic (or Dunder) Methods:](#magic-or-dunder-methods)
    - [Composition:](#composition)
  - [Advanced OOP Topics](#advanced-oop-topics)
    - [Metaclasses in Python](#metaclasses-in-python)
    - [Custom Object Creation](#custom-object-creation)
    - [Class Decorators](#class-decorators)
    - [Descriptor Protocol](#descriptor-protocol)
    - [Mixins](#mixins)
    - [Creating Custom Immutable Objects](#creating-custom-immutable-objects)
  - [Best Practices and Tips for OOP in Python](#best-practices-and-tips-for-oop-in-python)
    - [Design Principles](#design-principles)
    - [Code Organization](#code-organization)
    - [Practical Tips for Writing OOP Code](#practical-tips-for-writing-oop-code)
    - [Testing and Debugging](#testing-and-debugging)
    - [Performance Considerations](#performance-considerations)
    - [Collaboration and Code Maintenance](#collaboration-and-code-maintenance)
- [Exception Handling](#exception-handling)
  - [Exceptions](#exceptions)
    - [Introdution to Exceptions](#introdution-to-exceptions)
    - [Handling Exceptions](#handling-exceptions)
    - [Catching Specific Exceptions](#catching-specific-exceptions)
    - [Creating Custom Exceptions](#creating-custom-exceptions)
    - [Advanced Exception Handling Techniques](#advanced-exception-handling-techniques)
- [Python Modules and Packages](#python-modules-and-packages)
- [Advanced Data Structures and Algorithms in Python](#advanced-data-structures-and-algorithms-in-python)
- [Python Standard Libraries](#python-standard-libraries)
  - [Itertools and Collections](#itertools-and-collections)
  - [Regular Expressions (Regex)](#regular-expressions-regex)
  - [`collections` Module](#collections-module)
  - [`functools` Module](#functools-module)
  - [`operator` Module](#operator-module)
  - [`bisect` Module](#bisect-module)
  - [`random` Module](#random-module)
  - [`typing` Module](#typing-module)
  - [`time` and `datetime` Modules](#time-and-datetime-modules)
  - [`sys` and `os` Modules](#sys-and-os-modules)
- [Comprehensions and Generator Expressions](#comprehensions-and-generator-expressions)
- [Multithreading and Concurrency](#multithreading-and-concurrency)
- [Python Debugging and Testing](#python-debugging-and-testing)
- [Working with Files and I/O Optimization](#working-with-files-and-io-optimization)
- [Advanced Functionality and Python Tricks](#advanced-functionality-and-python-tricks)
- [Problem Solving Practice](#problem-solving-practice)
- [Python for Competitive Programming: Best Practices](#python-for-competitive-programming-best-practices)
- [Interview Questions](#interview-questions)
  - [Datatypes](#datatypes)


# Python Basics

## Basic Syntax
### Comments
- single-line (`#`)
  ```python
  # This is a python comment
  ```
- multi-line (triple quotes).
  ```python
  """ This is 
  multi-line comment """
  ```
  - Triple quotes are often used for docstrings in functions, not for regular comments.
### Code structure
- Indentation
  - Python uses indentation (spaces or tabs) to define blocks of code.
  - Mixing tabs and spaces in the same code block will cause an `IndentationError`.
- Line Continuation
  - Use backslash `\` for explicit line continuation.
  - Implicit Continuation: inside parentheses, brackets, or braces.

## Variables, Data Types, and Basic Operations
### Dynamic typing
- Python variables do not require explicit declaration of type.
### Variable naming conventions
- Start with a letter (a-z, A-Z) or an underscore (`_`).
- Followed by letters, digits (0-9), or underscores.
- Case-sensitive: `var` and `Var` are different.
- Avoid using Python reserved keywords like `if`, `else`, `for`, etc.
### Basic data types: 
- `int`
  - Whole numbers without a decimal point.
  - Python 3's `int` can handle arbitrarily large values, limited only by available memory.
  - `_` can be used for better readability
  - `e` can be used for the power of 10
  - Example
    ```python
    x = 10
    y = 10_000
    z = 10e9
    ```
- `float`
  - Numbers with a decimal point.
  - Can represent very large or very small numbers using scientific notation.
- `str`
  - Ordered sequence of characters enclosed in single, double, or triple quotes.
  - Strings are immutable; any modification results in a new string being created.
  - Example
    ```python
    x = "hi"
    x[0] = "a"  # TypeError: 'str' object does not support item assignment
    ```
- `bool`
  - Represents `True` or `False` values.
- NoneType (`None`):
  - Represents the absence of a value.
  - Commonly used as a default value for optional parameters or to reset variables.
  - Example:
    - result = None
### Type conversion
- Implicit Conversion:
  - Python automatically converts types in expressions where it’s necessary.
  - Example
    ```python
    print(3 + 2.5)  # 5.5 (int converted to float)
    ```
- Explicit Conversion:
  - Use built-in functions for explicit type conversion.Use built-in functions for explicit type conversion.
    - Example: `int()`, `float()`, `str()`, `bool()`
  - Converting `float` to `int` truncates the decimal part (no rounding).
### Type checking
- Built-In Type Checking
  - `type()` Function: Returns the type of the given object.
    ```python
    print(type(42))        # <class 'int'>
    print(type("Python"))  # <class 'str'>
    ```
  - `isinstance()` Function: Checks if an object is an instance (or subclass instance) of a specified type.
    ```python
    print(isinstance(x, int))         # True
    print(isinstance("Python", str))  # True
    ```
  - Multiple Types: You can check against multiple types by passing a tuple.
    ```python
    print(isinstance(42, (int, float)))  # True
    ```
  - `issubclass()` Function: Checks if a class is a subclass of another class.
    ```python
    print(issubclass(Dog, Animal))  # True
    print(issubclass(Dog, object))  # True, as all classes in Python inherit from 'object'
    ```
- Static Type Checking with Type Hints
  - Introduced in Python 3.5 via PEP 484, type hints allow you to indicate the expected types of variables, function arguments, and return values.
    - Syntax: Type hints use the `->` operator for return types and `:` for argument types.
      ```python
      def add(a: int, b: int) -> int:
            pass
      ```
  - Optional Types: Use `Optional` from the `typing` module to indicate that a variable can be of a specified type or `None`.
      ```python
      def greet(name: Optional[str] = None) -> str:
          pass
      ```
- Common Type Hints
  - Built-In Types**: `int`, `float`, `str`, `bool`, `list`, `dict`, `set`, `tuple`.
    - Use the `typing` module to specify container types.
      ```python
      from typing import List, Dict
      
      def process_items(items: List[int]) -> Dict[str, int]:
          pass
      ```
    - Union Types: Specify that a variable can be of multiple types using `Union`.
      ```python
      def get_value(data: Union[int, str]) -> str:
          pass
      ```
- `Any` Type: from the `typing` module can be used to indicate that a value can be of any type.
  ```python
  def process(value: Any) -> None:
      pass
  ```
- `Callable` Types: to specify a function signature.
  ```python
  def apply_function(f: Callable[[int, int], int], a: int, b: int) -> int:
      pass
  ```
- Generics: allow for more flexible type hints by defining a type that can be used with different types of data.
  ```python
  from typing import Generic, TypeVar

  T = TypeVar('T')
  
  class Box(Generic[T]):
      def __init__(self, content: T) -> None:
        self.content = content

  int_box = Box 
  str_box = Box[str]("Python")
  ```
- important Libraries
  - `mypy` is a static type checker that enforces type hints in Python.
  - `pylint` is another tool that can check code quality and enforce type hint usage.
  - `typeguard` library allows for runtime type checking based on type hints.
### Truthy and Falsy values
- `True` values
  - Non-zero numbers: `1`, `-1`
  - Non-empty sequences or collections: `[1, 2, 3]`, `"Hello"`
- `False` values
  - Zero: `0`, `0.0`
  - Empty sequences or collections: `[]`, `''`, `()`, `{}`, `set()`
  - `None`

## Operators
### Type of Operators
- Arithmetic Operators
  - Addition (`+`), Subtraction (`-`), Multiplication (`*`), Division (`/`), Floor Division(`//`), Modulus(`%`), Exponentiation(`**`)
- Comparison Operators
  - Equality (`==`), Inequality (`!=`), Greater/Less Than(`>`, `<`, `>=`, `<=`)
  - Chained Comparisons: Python allows chaining of comparison operators
    ```python
    print(1 < 2 < 3)  # True (equivalent to 1 < 2 and 2 < 3)
    ```
- Logical Operators
  - `and`, `or`, `not`
    - `and` and `or` return one of the operands, not necessarily `True` or `False`
      ```python
      print("A" and "B")  # "B" (returns the second operand)
      print("A" or "B")   # "A" (returns the first truthy operand)
      ```
    - `and` and `or` operators short-circuit (stop evaluating) as soon as the result is determined.
      ```python
      print(False and 1/0)  # Does not raise an error due to short-circuiting
      print(True or 1/0)  # Does not raise an error due to short-circuiting
      ```
- Assignment Operators
  - Basic Assignment(`=`), Augmented Assignment (`+=`, `-=`, `*=`, `/=`, `%=`, `**=`, `//=`)
### Operator Precedence
- Operator Precedence
  - Parentheses (())
  - Exponentiation (**)
  - Unary Operators (+x, -x, ~x)
  - Multiplication, Division, Modulus, Floor Division (*, /, %, //)
  - Addition, Subtraction (+, -)
  - Bitwise Shifts (>>, <<)
  - Bitwise Operators: AND (&) > Bitwise XOR (^) > Bitwise OR (|)
  - Comparison Operators (<, <=, >, >=, !=, ==, is, is not, in, not in)
  - Logical Operators: NOT (not), AND (and), OR (or)
  - Conditional Expressions: Ternary Operator
  - Assignment Operators: =, +=, -=, *=, /=, //=, %=
### Associativity
- Most operators in Python are left-associative, meaning they are evaluated from left to right.
- The exponentiation operator (**) is right-associative, meaning it is evaluated from right to left.

## Input and Output
### `input()` function
- used for taking input. optional string argument serves as a prompt to the user.
- Example
  ```python
  name: str = input("Name: ")
  age: int = int(input("Age: "))
  weight: float = float(input("Weight: "))
  ```
### `print()` function
- used for output with advanced formatting options.
- can take multiple arguments, separated by commas. It automatically inserts a space between them.
  ```python
  print(x, y, z)
  ```
- Using `+` to concatenate strings.
  ```python
  print("Hi " + name + "!")
  ```
- f-strings (Python 3.6+)
  ```python
  print(f"Hello, {first_name} {last_name}")
  ```
- `str.format()`
  ```python
  print("Hello, {} {}".format(first_name, last_name))
  ```
- Percentage `%` Formatting
  ```python
  print("Hello, %s %s" % (first_name, last_name))
  ```
- 2 optional argumenst, `sep` and `end`.By default, `print()` uses a space as a separator and ends with a newline.
  ```python
  print("Hello", "World", sep="-", end="!\n")  # Hello-World!
  ```

## Control Flow
### Conditional Statements (if, elif, else)
- `if` Statement: evaluates a condition and executes the indented block of code if the condition is true.
  ```python
  if age >= 18:
      print("You are an adult!")
  ```
- `if-else` Statement: `else` clause provides an alternative block of code to execute if the condition is false.
  ```python
  if age >= 18:
      print("You are an adult!")
  else:
      print("Sorry! You are not an adult!")
  ```
- `if-elif-else` Statement: The `elif` (short for "else if") allows you to check multiple conditions.
  ```python
  if age >= 18:
      print("You are an adult.")
  elif age >= 13:
      print("You are a teenager.")
  else:
      print("You are a child.")
  ```
- Nested `if` Statements: `if` statements can be nested inside other `if` statements to handle more complex logic.
  ```python
  if age >= 18:
      if age >= 65:
          print("You are a senior citizen.")
      else:
          print("You are an adult.")
  else:
      print("You are not an adult.")
  ```
- Ternary operators 
  - Inline `if-else` Statements
    ```python
    print("Adult" if age >= 18 else "Not an Adult")
    ```
  - Using Logical Operators as a Conditional Expression
    ```python
    print(("Adult" and age >= 18) or "Not an Adult")
    ```
### Loops
- `for` loop
    ```python
    for number in numbers:
        pass
    ```
- `while` loop
  ```python
  count = 0
  while count < 5:
      pass
  ```
- Loop control: 
  - `break`: Exits the loop prematurely, regardless of the loop condition.
    ```python
    for i in range(10):
        if i == 5:
            break
        print(i)
    ```
    - Using `break` in nested loops only exits the innermost loop.
  - `continue`
  - `else`: `else` block will execute only if the loop terminates normally (i.e., not via a `break`)
    ```python
    count = 0
    while count < 5:
        print(count)
        count += 1
    else:
        print("Loop completed without a break.")
    ```
  - `pass` statement: Does nothing and is often used as a placeholder.
    ```python
    for i in range(5):
        if i == 3:
            pass            # Do nothing
        else:
            print(i)
    ```
- Nested Loops
  ```python
  for i in range(3):
      for j in range(3):
          print(f"i = {i}, j = {j}")
  ```
- Iterating Techniques
  - Using `range()` for generating sequences.
    - `range()` generates a sequence of numbers
      ```python
      for i in range(1, 10, 2):  # [1, 2, 3, 4, 5, 6, 7, 8, 9]
          pass
      range(5) # [0, 1, 2, 3, 4]
      range (2, 5) # [2, 3, 4]
      range (1, 5, 3) # [1, 4]
      ```
  - `enumerate()` function: adds a counter to an iterable and returns it in the form of an enumerating object.
    ```python
    for index, element in enumerate(names):  # in case of dict, element contains the key of the dictionary
        pass
    ```
  - `zip()` function: is used to combine two or more iterables (e.g., lists, tuples, strings) into a single iterable of tuples. Each tuple contains elements from the corresponding position of the original iterables.
    ```python
    for roll_no, name, class in zip(roll_nos, names, classes):
        pass
    ```
    - If the iterables passed to zip() have different lengths, zip() will stop creating tuples when the shortest iterable is exhausted.
      ```python
      list1 = [1, 2, 3, 4]
      list2 = ['a', 'b', 'c']
      zipped = zip(list1, list2)
      print(list(zipped))  # [(1, 'a'), (2, 'b'), (3, 'c')]
      ```
    - `itertools.zip_longest()`: to handle cases where you want to continue pairing elements until the longest iterable is exhausted
      ```python
      list1 = [1, 2, 3, 4]
      list2 = ['a', 'b', 'c']
      zipped = zip_longest(list1, list2, fillvalue='-')
      print(list(zipped))  # [(1, 'a'), (2, 'b'), (3, 'c'), (4, '-')]
      ```

              

# Data Structures in Python

## Lists
### List creation
- Baisc List creation
  ```python
  lst = []
  lst = [1, "abc", 7, 90, {"math": 90, "english": 90}]
  ```
- List creation using `list()` Constructor
  ```python
  list_from_tuple = list((1, 2, 3))  # [1, 2, 3]
  list_from_range = list(range(5))  # [0, 1, 2, 3, 4]
  ```
### Accessing List Elements
- Indexing
  ```python
  print(fruits[0])
  print(fruits[-1])   # negative indexing, means from right; here, -1 means last element, -2 means second last element
  ```
- Slicing: `[start:stop:step]`
  ```python
  numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  print(numbers[2:5])                         # [2, 3, 4]
  print(numbers[:3])                          # [0, 1, 2] (same as [0:3])
  print(numbers[5:])                          # [5, 6, 7, 8, 9] (same as [5:10])
  print(numbers[::2])                         # [0, 2, 4, 6, 8] (every second element)
  print(numbers[::-1])                        # [9, 8, 7, 6, 5, 4, 3, 2, 1, 0] (reversed list)
  ```
### Modifying Elements
- Indexing
  ```python
  fruits[1] = "blueberry"
  ```
### List operations
- `len()` function to find out how many elements are in the list.
  ```python
  print(len(lst))
  ```
- `+` operator for list concatenation
  ```python
  list1 = [1, 2, 3]
  list2 = [4, 5, 6]
  print(list1 + list2)      # [1, 2, 3, 4, 5, 6]
  ```
- `*` operator for list repetition
  ```python
  lst = [1, 2, 3]
  print(lst * 3)            # [1, 2, 3, 1, 2, 3, 1, 2, 3]
  ```
- `in` and `not in` operators to check if an element exists in a list.
  ```python
  fruits = ["apple", "banana", "cherry"]
  print("banana" in fruits)                 # True
  print("grape" not in fruits)              # True
  ```
### List Methods
- `append()` adds an element to the end of the list.
  ```python
  fruits = ["apple", "banana"]
  fruits.append("cherry")             # ['apple', 'banana', 'cherry']
  ```
- `insert()` inserts an element at a specified position in the list.
  ```python
  fruits = ["apple", "banana"]
  fruits.insert(1, "cherry")
  print(fruits)                   # ['apple', 'cherry', 'banana']
  ```
- `extend()` extends the list by appending all the elements from another iterable (e.g., another list).
  ```python
  list1 = [1, 2, 3]
  list2 = [4, 5, 6]
  list1.extend(list2)
  print(list1)                    # [1, 2, 3, 4, 5, 6]
  ```
- `remove()` removes the first occurrence of a value.
  ```python
  fruits = ["apple", "banana", "cherry"]
  fruits.remove("banana")
  print(fruits)                             # ['apple', 'cherry']
  fruits.remove("potato")                   # ValueError: list.index(x): x not in list
  ```
- `pop()` removes and returns the element at the given index. By default, pops last element.
  ```python
  fruits = ["apple", "banana", "cherry"]
  last_fruit = fruits.pop()
  print(last_fruit, fruits)                 # ('cherry', ['apple', 'banana'])
  ```
- `clear()` removes all elements from the list.
  ```python
  fruits = ["apple", "banana", "cherry"]
  fruits.clear()
  print(fruits)                             # []
  ```
- `index()` returns the index of the first occurrence of a value.
  ```python
  fruits = ["apple", "banana", "cherry"]
  print(fruits.index("banana"))             # 1
  ```
- `count()` returns the number of occurrences of a value in the list.
  ```python
  numbers = [1, 2, 2, 3, 2]
  print(numbers.count(2))                   # 3
  ```
- `sort()` sorts the list in place. By default, it sorts in ascending order.
  ```python
  numbers = [3, 1, 4, 1, 5, 9, 2]
  numbers.sort()
  print(numbers)                            # [1, 1, 2, 3, 4, 5, 9]
  numbers.sort(reverse=True)
  print(numbers)                            # [9, 5, 4, 3, 2, 1, 1]
  ```
- `reverse()` reverses the order of the list in place.
  ```python
  numbers = [1, 2, 3, 4, 5]
  numbers.reverse()
  print(numbers)                            # [5, 4, 3, 2, 1]
  ```
- `copy()` returns a shallow copy of the list.
  ```python
  fruits = ["apple", "banana", "cherry"]
  fruits_copy = fruits.copy()
  print(fruits_copy)                        # ['apple', 'banana', 'cherry']
  ```
  - Shallow Copy creates a new list object, but the elements themselves are references to the original objects.
### List Comprehensions
- Syntax
  - [expression for item in iterable if condition]
- Example
  ```python
  squares = [x**2 for x in range(10)]
  even_squares = [x**2 for x in range(10) if x % 2 == 0]
  flat_list = [num for row in matrix for num in row]      # Flattening a Nested List with List Comprehensions
  ```

## Tuples
### Tuple Creation
- Basic Tuples creation
  ```python
  empty_tuple = ()
  single_element_tuple = (10,)
  not_a_tuple = (10)                  # just an int
  tup = (1, "apple", 3.14, True)
  ```
- Tuple creation using `tuple()` Constructor
  ```python
  tuple_from_list = tuple([1, 2, 3, 4])
  empty_tuple = tuple()
  ```
### Accessing Tuple Elements
- Indexing
  ```python
  print(fruits[0])
  print(fruits[-1])                     # negative indexing, means from right; here, -1 means last element, -2 means second last element
  ```
- Slicing: `[start:stop:step]`
  ```python
  numbers = (0, 1, 2, 3, 4, 5, 6, 7, 8, 9)
  print(numbers[2:5])                           # (2, 3, 4)
  print(numbers[:3])                            # (0, 1, 2) (same as [0:3])
  print(numbers[5:])                            # (5, 6, 7, 8, 9) (same as [5:10])
  print(numbers[::2])                           # (0, 2, 4, 6, 8) (every second element)
  print(numbers[::-1])                          # (9, 8, 7, 6, 5, 4, 3, 2, 1, 0) (reversed tuple)
  ```
### Tuple Operations
- `len()` function to find out how many elements are in the tuple.
  ```python
  print(len(tup))
  ```
- `min()` and `max()` functions return the smallest and largest elements in the tuple, respectively.
  ```python
  numbers = (4, 1, 8, 3)
  print(min(numbers))         # Output: 1
  print(max(numbers))         # Output: 8
  ```
- `sum()` returns the sum of all the numeric elements in a tuple.
  ```python
  numbers = (1, 2, 3, 4)
  print(sum(numbers))                       # Output: 10
  ```
- `sorted()` returns sorted list
  ```python
  numbers = (3, 1, 2)
  sorted_numbers = sorted(numbers)
  print(sorted_numbers)                     # Output: [1, 2, 3]
  ```
- `+` operator for tuple concatenation
  ```python
  tuple1 = (1, 2, 3)
  tuple2 = (4, 5, 6)
  print(tuple1 + tuple2)                    # (1, 2, 3, 4, 5, 6)
  ```
- `*` operator for tuple repetition
  ```python
  numbers = (0, 1)
  repeated = numbers * 3
  print(repeated)                           # (0, 1, 0, 1, 0, 1)
  ```
- `in` and `not in` operators to check if an element exists in a tuple.
  ```python
  fruits = ("apple", "banana", "cherry")
  print("banana" in fruits)                 # True
  print("grape" not in fruits)              # True
  ```
- tuples are immutable, hence the elements can not be changed. 
  ```python
  fruits = ("apple", "banana", "cherry")
  fruits[1] = "blueberry"                   # TypeError: 'tuple' object does not support item assignment
  ```
- However, if they contain mutable elements, nested elements can still be updated
  ```python
  nested_tuple = (1, 2, [3, 4])
  nested_tuple[2][0] = 100
  print(nested_tuple)                       # (1, 2, [100, 4])
  ```
### Tuple Methods
- `count()` returns the number of occurrences of a value in the tuple.
  ```python
  numbers = (1, 2, 2, 3, 2, 4)
  print(numbers.count(2))                   # 3
  ```
- `index()` returns the index of the first occurrence of a value in the tuple. Raises ValueError if the value is not found.
  ```python
  fruits = ("apple", "banana", "cherry")
  print(fruits.index("banana"))             # 1
  print(fruits.index("potato"))             # ValueError: tuple.index(x): x not in tuple
  ```
### Advanced Tuple Usage
- Tuple Packing: refers to assigning multiple values to a single tuple variable.
  ```python
  packed_tuple = 1, 2, 3                    # Packing
  print(packed_tuple)                       # (1, 2, 3)
  ```
- Tuple Unpacking: refers to assigning the elements of a tuple to individual variables.
  ```python
  a, b, c = packed_tuple                    # Unpacking
  print(a)                                  # 1
  print(b)                                  # 2
  print(c)                                  # 3
  ```
- Tuple Unpacking with * Operator
  ```python
  numbers = (1, 2, 3, 4, 5)
  a, *b, c = numbers
  print(a)                                  # 1
  print(b)                                  # [2, 3, 4]
  print(c)                                  # 5
  ```
- Tuples as Dictionary Keys: Because tuples are immutable, they can be used as keys in dictionaries, unlike lists.
  ```python
  locations = {
    (40.7128, -74.0060): "New York",
    (34.0522, -118.2437): "Los Angeles",
    (51.5074, -0.1278): "London"
  }
  print(locations[(40.7128, -74.0060)])     # New York
  ```
- Returning Multiple Values from a Function
  ```python
  def get_coordinates():
    return (40.7128, -74.0060)
  latitude, longitude = get_coordinates()
  print(latitude)                           # 40.7128
  print(longitude)                          # -74.0060
  ```
- Multiple Arguments with `*args`
  ```python
  def sum_all(*args):
    return sum(args)
  print(sum_all(1, 2, 3, 4))                # 10
  ```


## Dictionaries
### Dictionary Creation
- Basic Dictionary Creation
  ```python
  person = {}
  person = {"name": "John", "age": 30, "city": "New York"}
  ```
- Dictionary creation using `dict()` Constructor
  ```python
  person1 = dict()
  person2 = dict(name="John", age=30, city="New York")
  person3 = dict([("name", "John"), ("age", 30), ("city", "New York")])
  ```
### Accessing Dictionary Elements
- Accessing Values by Key
  ```python
  print(person["name"])                     # Output: John
  ```
- Using the `get()` Method:
  ```python
  print(person.get("name"))                 # Output: John
  print(person.get("job", "Not Found"))     # Output: Not Found
  ```
- `in` operator to check if a key exists in the dictionary.
  ```python
  if "age" in person:
    print("Age is available.")
  ```
### Modifying Dictionaries
- Adding a New Key-Value Pair
  ```python
  person["job"] = "Engineer"
  ```
- Updating an Existing Key-Value Pair
  ```python
  person["age"] = 31
  ```
- Update using `update()` Method
  ```python
  additional_info = {"job": "Engineer", "hobbies": ["Reading", "Cycling"]}
  person.update(additional_info)
  ```
- Removing Elements using the `del` Statement
  ```python
  del person["city"]
  ```
- Removing Elements using the `pop()` method: removes a key and returns its value
  ```python
  age = person.pop("age")
  ```
- Removing Elements using the `popitem()` method: removes and returns the last inserted key-value pair as a tuple
  ```python
  last_item = person.popitem()                # Output: ('hobbies', ['Reading', 'Cycling'])
  ```
- Empty dictionary using `clear()` method
  ```python
  person.clear()
  ```
- `update()` method allows you to merge one dictionary into another.
  ```python
  dict1 = {"a": 1, "b": 2}
  dict2 = {"b": 3, "c": 4}
  dict1.update(dict2)
  print(dict1)                                # Output: {'a': 1, 'b': 3, 'c': 4}
  ```
### Dictionary Operations
- Keys, Values, and Items:
  - `keys()`: Returns a view object that displays a list of all the keys in the dictionary.
    `values()`: Returns a view object that displays a list of all the values in the dictionary.
    `items()`: Returns a view object that displays a list of all the key-value pairs in the dictionary as tuples.
  ```python
  person = {"name": "John", "age": 31, "job": "Engineer"}
  print(person.keys())                        # Output: dict_keys(['name', 'age', 'job'])
  print(person.values())                      # Output: dict_values(['John', 31, 'Engineer'])
  print(person.items())                       # Output: dict_items([('name', 'John'), ('age', 31), ('job', 'Engineer')])
  ```
- Iterating Over Dictionary Keys and Values:
  ```python
  for key in person.keys():
    print(key, person[key])
  for value in person.values():
    print(value)
  for key, value in person.items():
    print(f"{key}: {value}")
  ```
- Dictionary Comprehensions
  ```python
  squares = {x: x**2 for x in range(6)}
  even_squares = {x: x**2 for x in range(6) if x % 2 == 0}
  ```
- `|` operator provides a new way to merge dictionaries, creating a new dictionary with the merged key-value pairs.
  ```python
  dict1 = {"a": 1, "b": 2}
  dict2 = {"b": 3, "c": 4}
  print(dict1 | dict2)                        # Output: {'a': 1, 'b': 3, 'c': 4}
  ```
- Dictionaries can be sorted by keys or values using the `sorted()` function, which returns a sorted list of keys or values.
  ```python
  my_dict = {"apple": 3, "banana": 1, "cherry": 2}
  sorted_by_keys = sorted(my_dict)
  sorted_by_values = sorted(my_dict.values())
  print(sorted_by_keys)                       # Output: ['apple', 'banana', 'cherry']
  print(sorted_by_values)                     # Output: [1, 2, 3]
  ```

## Sets
### Set Creation
- Basic Set creation
  ```python
  my_set = {1, 2, 3, 4}
  ```
- Set creation using `set()` Constructor
  ```python
  empty_set = set()
  another_set = set([1, 2, 3, 4])
  ```
### Modifying Set elements
- `add()` method adds a single element to the set. If the element already exists, the set remains unchanged.
  ```python
  my_set = {1, 2, 3}
  my_set.add(4)                               # my_set: {1, 2, 3, 4}
  my_set.add(2)                               # my_set: {1, 2, 3, 4}  # No duplicates allowed
  ```
- `remove()` method removes a specified element from the set. If the element does not exist, it raises a KeyError
  ```python
  my_set = {1, 2, 3}
  my_set.remove(2)                            # my_set: {1, 3}
  my_set.remove(4)                            # Raises KeyError: 4
  ```
- `discard()` method removes a specified element from the set. If the element does not exist, the set remains unchanged (no KeyError is raised).
  ```python
  my_set = {1, 2, 3}
  my_set.discard(2)                           # my_set: {1, 3}
  my_set.discard(4)                           # No error raised
  ```
- `pop()` method removes and returns an arbitrary element from the set. Since sets are unordered, you cannot predict which element will be removed.
  ```python
  my_set = {1, 2, 3}
  print(my_set.pop())                         # Output: (an arbitrary element from the set)
  ```
- `clear()` method removes all elements from the set, resulting in an empty set.
  ```python
  my_set = {1, 2, 3}
  my_set.clear()                              # my_set: set()
  ```
- `update()` method adds multiple elements to the set. The elements can be provided as an iterable (e.g., list, set, tuple).
  ```python
  my_set = {1, 2}
  my_set.update([3, 4, 5])                    # my_set: {1, 2, 3, 4, 5}
  ```
- `intersection_update()` method updates the set with only the elements that are common to both the set and the provided iterables. This is equivalent to the &= operator.
  ```python
  set1 = {1, 2, 3}
  set2 = {2, 3, 4}
  set1.intersection_update(set2)              # set1: {2, 3}
  ```
- `difference_update()` method removes all elements from the set that are also found in the provided iterables. This is equivalent to the -= operator.
  ```python
  set1 = {1, 2, 3, 4}
  set2 = {3, 4, 5}
  set1.difference_update(set2)                # set1: {1, 2}
  ```
### Other Set Methods
- `union()` method returns a new set with elements from both the set and the provided iterables. This is equivalent to the `|` operator.
  ```python
  set1 = {1, 2, 3}
  set2 = {3, 4, 5}
  print(set1.union(set2))                     # Output: {1, 2, 3, 4, 5}
  ```
- `issubset()` method returns True if all elements of the set are contained in another set, otherwise False.
  ```python
  set1 = {1, 2}
  set2 = {1, 2, 3}
  print(set1.issubset(set2))                  # Output: True
  ```
- `issuperset()` method returns True if the set contains all elements of another set, otherwise False.
  ```python
  set1 = {1, 2, 3}
  set2 = {1, 2}
  print(set1.issuperset(set2))                # Output: True
  ```
- `isdisjoint()` method returns True if the set has no elements in common with another set, otherwise False.
  ```python
  set1 = {1, 2, 3}
  set2 = {4, 5, 6}
  print(set1.isdisjoint(set2))                # Output: True
  ```
### Set Operations
- Union (`|`) combines the elements of two sets, removing duplicates.
  ```python
  set1 = {1, 2, 3}
  set2 = {3, 4, 5}
  print(set1 | set2)                          # Output: {1, 2, 3, 4, 5}
  ```
- Intersection (`&`) returns the elements that are common to both sets.
  ```python
  set1 = {1, 2, 3}
  set2 = {3, 4, 5}
  print(set1 & set2)                          # Output: {3}
  ```
- Difference (`-`) returns the elements that are in the first set but not in the second.
  ```python
  set1 = {1, 2, 3}
  set2 = {3, 4, 5}
  print(set1 - set2)                          # Output: {1, 2}
  ```
- Symmetric Difference (`^`) returns the elements that are in either set, but not in both (essentially the union minus the intersection).
  ```python
  et1 = {1, 2, 3}
  set2 = {3, 4, 5}
  print(set1 ^ set2)  # Output: {1, 2, 4, 5}
  ```
- Membership check: `in` operator to check for the presence of an element
  ```python
  my_set = {1, 2, 3}
  print(2 in my_set)                          # Output: True
  print(4 in my_set)                          # Output: False
  ```
### Advanced Set Usage
- Immutable Sets using `frozenset`
  ```python
  frozen_set = frozenset([1, 2, 3])
  ```
- Set Comprehensions
  ```python
  squares = {x**2 for x in range(6)}
  even_squares = {x**2 for x in range(6) if x % 2 == 0}
  ```


## Strings
### String creation
- Basic String creation
  ```python
  single_quote_string = 'Hello, World!'
  double_quote_string = "Hello, World!"
  multi_line_string = '''This is a
  multi-line string'''
  ```
- String creation using the str() Constructo
  ```python
  number = 123
  string_number = str(number)                 # string_number: '123'
  ```
### Accessing String Elements
- Indexing
  ```python
  text = "Python"
  print(text[0])                              # Output: 'P'
  print(text[-2])                             # Output: 'o'
  ```
- Slicing
  ```python
  print(text[1:4])                            # Output: 'yth'
  print(text[:3])                             # Output: 'Pyt'
  print(text[3:])                             # Output: 'hon'
  print(text[::2])                            # Output: 'Pto'
  print(text[::-1])                           # Output: 'nohtyP' (reversed string)
  ```
### String Operations
- `+` operator for string concatenation
  ```python
  text1 = "Hello"
  text2 = "World"
  print(text1 + " " + text2)                # Output: 'Hello World'
  ```
- `*` operator for string repetition
  ```python
  repeated_text = "Hi! " * 3                # repeated_text: 'Hi! Hi! Hi! '
  ```
- `len()` function returns the number of characters in a string.
  ```python
  print(len("Python"))                      # Output: 6
  ```
- `in` and `not in` Operators to check if a substring exists within a string.
  ```python
  text = "Python programming"
  print("Python" in text)                   # Output: True
  print("Java" not in text)                 # Output: True
  ```
### String Methods
- `lower()` and `upper()` convert the entire string to lowercase or uppercase respectively.
  ```python
  text = "Python Programming"
  print(text.lower())                       # Output: 'python programming'
  print(text.upper())                       # Output: 'PYTHON PROGRAMMING'
  ```
- `capitalize()` converts the first character of the string to uppercase and the rest to lowercase. `title()` converts the first character of each word to uppercase.
  ```python
  text = "python programming"
  print(text.capitalize())                  # Output: 'Python programming'
  print(text.title())                       # Output: 'Python Programming'
  ```
- `strip()`, `lstrip()`, and `rstrip()` remove whitespace (or other specified characters) from the beginning and/or end of the string.
  ```python
  text = "   Hello, World!   "
  print(text.strip())                       # Output: 'Hello, World!'
  print(text.lstrip())                      # Output: 'Hello, World!   '
  print(text.rstrip())                      # Output: '   Hello, World!'
  ```
- `replace()` replaces occurrences of a specified substring with another substring.
  ```python
  text = "Hello, World!"
  print(text.replace("World", "Python"))    # Output: 'Hello, Python!'
  ```
- `split()` breaks the string into a list of substrings based on a delimiter, and `join()` combines a list of strings into a single string with a specified delimiter.
  ```python
  text = "Python is fun"
  print(text.split())                       # Output: ['Python', 'is', 'fun']
  print(" ".join(words))                    # Output: 'Python is fun'
  ```
- `find()` returns the lowest index of the first occurrence of the substring (or -1 if not found), while `rfind()` returns the highest index.
  ```python
  text = "Hello, World!"
  print(text.find("o"))                     # Output: 4
  print(text.rfind("o"))                    # Output: 8
  ```
- `startswith()` and `endswith()` checks if a string starts or ends with a specified substring.
  ```python
  text = "Python programming"
  print(text.startswith("Python"))          # Output: True
  print(text.endswith("ing"))               # Output: True
  ```
- `count()` counts the number of occurrences of a substring within a string.
  ```python
  text = "banana"
  print(text.count("a"))                    # Output: 3
  ```
### String Formatting
- `format()` Method formats strings by embedding values inside placeholders {}.
  ```python
  name = "John"
  print("My name is {}.".format(name))      # Output: 'My name is John.'
  ```
- Formatted String Literals (f-strings) is a more concise way to format strings using `f"..."` syntax (introduced in Python 3.6).
  ```python
  name = "John"
  print(f"My name is {name}.")              # Output: 'My name is John.'
  ```
- Raw strings (`r"..."`) treat backslashes as literal characters, useful for regular expressions and file paths.
  ```python
  raw_string = r"C:\newfolder\test"
  print(raw_string)                         # Output: C:\newfolder\test
  ```

## Categories based on ordering in a sequence
### Ordered Sequences: 
- `list`, `tuple`, `str`, `range()`, `bytes`, `bytearray`
### Unordered Sequences: 
- `set`, `frozenset`, `dict`

## Time Complexities Comparision
### Comparision Table
| Tables                     | List | Tuple | Set  | Dictionary | String |
|----------------------------|:----:|:-----:|:----:|:----------:|:------:|
| Access By Index            | O(1) | O(1)  | N/A  | O(1)       | O(1)   |
| Insert at End              | O(1) | N/A   | O(1) | O(1)       | N/A    | 
| Insert at Beginning/Middle | O(n) | N/A   | N/A  | N/A        | N/A    |
| Delete by Value            | O(n) | N/A   | O(1) | O(1)       | N/A    |
| Delete by Index            | O(n) | N/A   | N/A  | O(1)       | N/A    |
| Membership Testing         | O(n) | O(n)  | O(1) | O(1)       | O(n)   |
| Iterating                  | O(n) | O(n)  | O(n) | O(n)       | O(n)   |

### Rule of Thumb
- Lists and tuples are ideal for ordered collections where you need to access elements by index, but lists allow mutability, whereas tuples are immutable.
- Sets and dictionaries are excellent for fast membership testing and frequent inserts/deletes, with dictionaries offering key-value mapping.
- Strings are specialized for handling text data, with fast access but no mutability, making them similar to tuples in behavior.

# Functions, Lambda Expressions and Recursion

## Defining Functions
### Function Syntax
- Syntax
  ```python
  def function_name(parameters):
      """docstring"""
      # Function body
      # Code to execute
      return value

  function_name(arguments)
  ```
- Explanation
  - `def`: This keyword is used to start the function definition.
  - `function_name`: A unique identifier for the function. The naming conventions follow the same rules as variable names.
  - `parameters`: A comma-separated list of arguments that the function can accept. These are optional, and you can define a function without any parameters.
  - `:`: A colon at the end of the function declaration line, indicating the start of the function body.
  - `"""docstring"""`: An optional string that describes what the function does.
  - Function Body: The indented block of code that performs the function's operations.
  - `return`: The keyword used to send a result back to the caller. If no return statement is present, the function returns None by default.
  - Arguments: The actual values passed to the function when it is called.
### Function Arguments
- Positional Arguments: are the most straightforward way to pass values to a function. The arguments are assigned to the parameters in the order in which they are passed. The order of positional arguments is crucial.
  ```python
  def greet(name, message):
      print(f"{message}, {name}!")

  greet("Alice", "Hello")                         # Output: Hello, Alice!
  ```
- Keyword Arguments: allow you to specify the value of a function parameter by explicitly naming the parameter in the function call.
  ```python
  def greet(name, message):
      print(f"{message}, {name}!")

  greet(message="Good morning", name="Bob")       # Output: Good morning, Bob!
  ```
- Default Arguments: allow you to define a default value for a parameter. If no argument is passed for that parameter, the default value is used. This makes some parameters optional.
  ```python
  def greet(name, message="Hello"):
      print(f"{message}, {name}!")

  greet("Dave")                                   # Output: Hello, Dave!
  greet("Eve", "Hi")                              # Output: Hi, Eve!
  ```
  - Caveats with Mutable Default Arguments: Be careful when using mutable objects (like lists or dictionaries) as default arguments. If the mutable object is modified, the changes persist across function calls.
    ```python
    ''' Unexpected Behavior '''
    def append_to_list(value, my_list=[]):
        my_list.append(value)
        return my_list

    print(append_to_list(1))                      # Output: [1]
    print(append_to_list(2))                      # Output: [1, 2]  # Unexpected behavior!

    ''' Correct approach '''
    def append_to_list(value, my_list=None):
        if my_list is None:
            my_list = []
        my_list.append(value)
        return my_list

    print(append_to_list(1))                      # Output: [1]
    print(append_to_list(2))                      # Output: [2]
    ```
- Variable-Length Arguments: Python provides mechanisms to handle an arbitrary number of arguments using *args and **kwargs.
  ```python
  def add(*numbers):
      return sum(numbers)

  print(add(1, 2, 3))                             # Output: 6
  print(add(4, 5))                                # Output: 9

  def greet(**kwargs):
      for key, value in kwargs.items():
          print(f"{key}: {value}", end=", ")

  greet(name="Alice", age=30, city="New York")    # Output: name: Alice, age: 30, city: New York, 
  ```
- Unpacking Arguments
  - Unpacking Sequences into Arguments: use the * operator to unpack elements from a list, tuple, or other sequence into individual positional arguments for a function.
    ```python
    def multiply(a, b, c):
        return a * b * c

    numbers = [2, 3, 4]
    print(multiply(*numbers))                     # Output: 24
    ```
  - Unpacking Dictionaries into Keyword Arguments: use the ** operator to unpack key-value pairs from a dictionary into individual keyword arguments for a function.
  ```python
  def describe_person(name, age, city):
      print(f"Name: {name}, Age: {age}")

  person_info = {"name": "Alice", "age": 30}
  describe_person(**person_info)                  # Output: Name: Alice, Age: 30
  ```
- Keyword-Only Arguments: are parameters that can only be supplied using their name, not as positional arguments. This is enforced by placing an asterisk * before the parameter names.
    ```python
    def greet(name, *, message="Hello"):
        print(f"{message}, {name}!")

    greet("Alice", message="Good morning")          # Output: Good morning, Alice!
    greet("Alice", "Good morning")                  # Raises TypeError: greet() takes 1 positional argument but 2 were given
    ```

## Scope and Lifetime of Variables
### Local Scope for Local Variables
- A variable defined inside a function or a block is said to have a local scope. This means the variable is accessible only within that function or block where it is defined.
- Local variables are created when the function is called and destroyed when the function execution is finished.
- Example
  ```python
  def my_function():
      x = 10              # x is a local variable
      print(x)
  my_function()           # Output: 10
  # print(x)              # Raises NameError: name 'x' is not defined
  ```
### Enclosing (Non-Local) Scope:
- Variables defined in the outer function of a nested function are said to have an enclosing scope. These variables are accessible within the nested (inner) function but are not in the global scope.
- Enclosing scope variables can be accessed by inner functions but cannot be directly modified unless explicitly declared using the nonlocal keyword (discussed later).
- Example
  ```python
  def outer_function():
      x = "outer variable"

      def inner_function():
          print(x)             # Accesses x from the enclosing scope
      inner_function()

  outer_function()             # Output: outer variable
  ```
### Global Scope for Global Variables
- A variable defined at the top level of a script or module, or explicitly declared as global inside a function, has a global scope. It can be accessed from any function or block within the same module.
- Global variables are created when the program starts and remain in existence until the program terminates.
- Example
  ```python
  x = "global variable"

  def my_function():
      print(x)              # Accesses the global variable

  my_function()             # Output: global variable
  ```
### Built-in Scope
- Built-in scope refers to the scope of special reserved keywords and functions provided by Python itself, such as print(), len(), range(), etc. These are accessible from any part of the code.
- Built-in scope is always available and cannot be overridden easily without reassigning the built-in names (which is not recommended).
- Example
  ```python
  print(len([1, 2, 3]))     # Uses built-in functions print() and len()
  ```
### LEGB Rule: 
- defines the order in which Python looks for variables:
  - `L: Local` — Variables defined within the current function.
  - `E: Enclosing` — Variables in the local scope of any enclosing functions, especially in nested functions.
  - `G: Global` — Variables defined at the top level of a module or explicitly declared global using the global keyword.
  - `B: Built-in` — Names reserved by Python (like print, len, etc.).
### Modifying Variable Scopes
- The `global` Keyword: 
  - is used to declare that a variable inside a function is global, meaning it refers to a global variable rather than a local one.
  - Example
    ```python
    x = "global x"

    def my_function():
        global x
        x = "modified global x"
        print(x)

    my_function()                 # Output: modified global x
    print(x)                      # Output: modified global x
    ```
- The `nonlocal` Keyword
  - is used to declare that a variable inside a nested function (inner function) is not local to that function, but also not global—it's from the enclosing function's scope.
  - Example
    ```python
    def outer_function():
        x = "enclosing x"

        def inner_function():
            nonlocal x
            x = "modified enclosing x"
            print(x)                      # Output: modified enclosing x
        
        inner_function()
        print(x)                          # Output: modified enclosing x
    
    outer_function()
    ```


## Higher-Order Functions: 
### A higher-order function
- Definition: is a function that does at least one of the following:
  - Takes one or more functions as arguments.
  - Returns a function as its result.
### Functions as First-Class Citizens
- In Python, functions can be passed around as arguments, returned from other functions, and assigned to variables just like any other object.
- Example
  ```python
  def square(x):
      return x * x

  def apply_function(func, value):      # apply_function is a higher-order function because it takes another function (square) as an argument.
      return func(value)

  result = apply_function(square, 5)
  print(result)                         # Output: 25
  ```
### Returning Functions from Functions
- In Python, A function can return another function as its result
- Example
  ```python
  def outer_function(message):                      # outer_function returns inner_function

      def inner_function():
          print(message)

      return inner_function

  my_function = outer_function("Hello, World!")
  my_function()                                     # Output: Hello, World!
  ```
### Common Higher-Order Functions in Python
- `map()`: Applies a function to all the items in an input list (or other iterable) and returns an iterator.
  ```python
  def square(x):
      return x * x

  numbers = [1, 2, 3, 4]
  squared_numbers = map(square, numbers)
  print(list(squared_numbers))                   # Output: [1, 4, 9, 16]
  ```
- `filter()`: Filters the elements in an iterable, returning only those for which the function returns True.
  ```python
  def is_even(x):
      return x % 2 == 0

  numbers = [1, 2, 3, 4, 5, 6]
  even_numbers = filter(is_even, numbers)
  print(list(even_numbers))                     # Output: [2, 4, 6]
  ```
- `reduce()`: applies a function cumulatively to the items of an iterable, reducing it to a single value (imported from functools).
  ```python
  from functools import reduce

  def multiply(x, y):
      return x * y

  numbers = [1, 2, 3, 4]
  product = reduce(multiply, numbers)
  print(product)                                 # Output: 24
  ```
- `any()`: Returns True if at least one element in the iterable is true.
  ```python
  numbers = [0, 1, 2, 3]
  print(any(numbers))           # Output: True
  ```
- `all()`: Returns True if all elements in the iterable are true.
  ```python
  numbers = [1, 2, 3, 4]
  print(all(numbers))           # Output: True
  ```
- `zip()`: Combines elements from multiple iterables into tuples.
  ```python
  names = ["Alice", "Bob", "Charlie"]
  scores = [85, 90, 95]
  combined = zip(names, scores)
  print(list(combined))                           # Output: [('Alice', 85), ('Bob', 90), ('Charlie', 95)]
  ```
- `enumerate()`: Adds a counter to an iterable, returning an enumerate object.
  ```python
  items = ["apple", "banana", "cherry"]
  for index, item in enumerate(items, start=1):
      print(index, item)                          # Output: (1, apple), (2, banana), (3, cherry)
  ```
- `reversed()`: Returns a reversed iterator over the elements of a sequence.
  ```python
  numbers = [1, 2, 3, 4]
  reversed_numbers = reversed(numbers)
  print(list(reversed_numbers))                   # Output: [4, 3, 2, 1]
  ```
- `sorted()` with `key` Function: Sorts an iterable based on a key function.
  - syntax
    ```python
    sorted(iterable, key=None, reverse=False)

    # iterable: The sequence (like a list, tuple, etc.) that you want to sort.
    # key: A function that extracts a comparison key from each element. The default is None, meaning elements are compared directly.
    # reverse: If True, the sorted list is reversed (descending order). Default is False.
    ```
  - `len`: sort using length of each element
    ```python
    words = ["apple", "banana", "cherry", "date"]
    sorted_words = sorted(words, key=len)
    print(sorted_words)                               # Output: ['date', 'apple', 'banana', 'cherry']
    ```
  - Sorting by a Specific Attribute using lambda
    ```python
    students = [
        {"name": "John", "grade": 90},
        {"name": "Jane", "grade": 85},
        {"name": "Dave", "grade": 95}
    ]
    sorted_students = sorted(students, key=lambda x: x['grade'])
    print(sorted_students)
    # Output: [{'name': 'Jane', 'grade': 85}, {'name': 'John', 'grade': 90}, {'name': 'Dave', 'grade': 95}]
    ```
  - Sorting by Multiple Criteria using lambda
    ```python
    employees = [
        {"name": "John", "age": 25, "salary": 50000},
        {"name": "Jane", "age": 30, "salary": 60000},
        {"name": "Dave", "age": 25, "salary": 55000}
    ]
    sorted_employees = sorted(employees, key=lambda x: (x['age'], x['salary']))
    print(sorted_employees)
    # Output: [{'name': 'John', 'age': 25, 'salary': 50000}, {'name': 'Dave', 'age': 25, 'salary': 55000}, {'name': 'Jane', 'age': 30, 'salary': 60000}]
    ```
  - `reverse=True`: Sorting in Reverse Order
    ```python
    numbers = [3, 1, 4, 1, 5, 9]
    sorted_numbers = sorted(numbers, reverse=True)
    print(sorted_numbers)  # Output: [9, 5, 4, 3, 1, 1]
    ```
  - Case-Insensitive Sorting by lower / upper casing the string elements
    ```python
    words = ["Banana", "apple", "Cherry", "date"]
    sorted_words = sorted(words, key=str.lower)
    print(sorted_words)  # Output: ['apple', 'Banana', 'Cherry', 'date']
    ```
  - Sorting by Absolute Values of integer elements
    ```python
    numbers = [-5, 3, -2, 7, -1]
    sorted_numbers = sorted(numbers, key=abs)
    print(sorted_numbers)  # Output: [-1, -2, 3, -5, 7]
    ```
  - Sorting Tuples or Lists by Elements
    ```python
    points = [(1, 2), (3, 1), (1, 1), (2, 2)]
    sorted_points = sorted(points, key=lambda x: x[1])
    print(sorted_points)  # Output: [(1, 1), (3, 1), (1, 2), (2, 2)]
    ```
  - Custom Sorting with `functools.cmp_to_key`
    ```python
    from functools import cmp_to_key

    def compare(x, y):
        return (x > y) - (x < y)

    numbers = [3, 2, 5, 4, 1]
    sorted_numbers = sorted(numbers, key=cmp_to_key(compare))
    print(sorted_numbers)  # Output: [1, 2, 3, 4, 5]
    ```

## Closures
### Introduction to Closures
- A closure is a function that "remembers" the values from its surrounding environment (enclosing scope) even after that environment is gone.
- Imagine a function that creates another function. The created function can still access the variables that were in the scope where it was created, even if those variables are no longer in use.
- Example
  ```python
  def make_multiplier(factor):
      def multiplier(number):
          return number * factor
      return multiplier

  double = make_multiplier(2)         # 'double' is a function that multiplies by 2
  triple = make_multiplier(3)         # 'triple' is a function that multiplies by 3

  print(double(5))  # Output: 10
  print(triple(5))  # Output: 15
  ```
### Importance of Closures
- Custom Function Generators: Closures are great for creating functions that behave differently based on some initial conditions or settings.
- Data Hiding: Closures allow for encapsulating data (like the factor in the example) that you don't want to expose directly, making your code more modular and secure.
### Closure Retaining State
- Example
  ```python
  def counter():
      count = 0
      def increment():
          nonlocal count
          count += 1
          return count
      return increment

  counter1 = counter()
  print(counter1())  # Output: 1
  print(counter1())  # Output: 2

  counter2 = counter()
  print(counter2())  # Output: 1

  """
  counter is a function that initializes count to 0.
  increment is an inner function that increases count by 1 each time it is called.
  The nonlocal keyword is used so that increment modifies count in the enclosing scope, rather than creating a new local variable.
  Each time counter is called, a new increment function is created with its own count variable.
  Thus, counter1 and counter2 are independent of each other.
  """
  ```
### How Closures Work
- Lexical Scoping: means that a function's scope is determined by its position in the source code. The closure "remembers" the scope in which it was created.
  - When inner_function is created in the outer_function, it "captures" the environment at that time, which includes any variables and their values in the outer scope.
- Persistent Local Variables: In the closure, the variables from the enclosing scope are preserved and can be used even after the outer function has completed.
### Practical Applications of Closures
- Function Factories: Closures are ideal for creating "function factories" where a general function generates more specific functions with pre-configured settings.
  ```python
  def make_multiplier(factor):        # make_multiplier generates functions like double and triple, which multiply by 2 and 3 respectively.
      def multiply(number):
          return number * factor
      return multiply

  double = make_multiplier(2)
  triple = make_multiplier(3)

  print(double(10))                   # Output: 20
  print(triple(10))                   # Output: 30
  ```
- Data Encapsulation: Closures can encapsulate private data, providing a way to protect or hide certain values within a function.
  ```python
  def bank_account(initial_balance):        # Here, balance is encapsulated within bank_account, and the only way to modify it is through the deposit and withdraw functions.
      balance = initial_balance

      def deposit(amount):
          nonlocal balance
          balance += amount
          return balance

      def withdraw(amount):
          nonlocal balance
          if balance >= amount:
              balance -= amount
              return balance
          else:
              return "Insufficient funds"

      return deposit, withdraw

  deposit, withdraw = bank_account(100)
  print(deposit(50))                        # Output: 150
  print(withdraw(30))                       # Output: 120
  print(withdraw(200))                      # Output: Insufficient funds
  ```
  - Implementing Decorators: Closures are commonly used to implement decorators, which are functions that modify the behavior of other functions.
    ```python
    def logger(func):
        def wrapper(*args, **kwargs):
            print(f"Calling {func.__name__} with arguments {args} and {kwargs}")
            result = func(*args, **kwargs)
            print(f"{func.__name__} returned {result}")
            return result
        return wrapper

    @logger
    def add(x, y):
        return x + y

    print(add(3, 4))
    # Output:
    # Calling add with arguments (3, 4) and {}
    # add returned 7
    # 7
    ```
### The `nonlocal` Keyword and Closures:
- The `nonlocal` keyword allows you to modify a variable in the enclosing (but non-global) scope of a nested function.
  ```python
  def outer_function():
      value = 0

      def increment():
          nonlocal value
          value += 1
          return value

      return increment

  counter = outer_function()
  print(counter())  # Output: 1
  print(counter())  # Output: 2
  ```
### Benefits of closures
- State Retention: Closures allow you to retain state across function calls without relying on global variables.
- Encapsulation: They provide a way to encapsulate private data within functions, protecting it from outside interference.
- Custom Function Creation: Closures are ideal for creating specialized functions with pre-configured settings (like in function factories).
- Functional Programming: They fit well into the functional programming paradigm, allowing functions to be treated as first-class citizens with preserved environments.
### Limitations of closures
- Complexity: Closures can make code harder to understand and debug, especially for beginners, because the connection between the inner and outer functions isn't always obvious.
- Potential for Memory Leaks: If not managed carefully, closures can lead to memory leaks because they keep references to variables that might otherwise be garbage-collected.
- Difficulty in Testing: Testing functions that use closures can be more challenging due to their encapsulated state and dependencies on outer variables.
### Comparison with other concepts for state retention
- Closures vs. Global Variables: Closures retain local scope, avoiding global state and reducing the risk of side effects. Global variables, in contrast, are accessible everywhere, which can lead to unintended consequences.
- Closures vs. Objects (OOP): Closures and objects in object-oriented programming (OOP) can both be used to retain state. However, closures do so in a more functional, lightweight way, while objects encapsulate state and behavior in a more structured form.

## Lambda Expressions
### Introduction to Lambda Expressions
- A lambda expression is a small, anonymous function.
  - Defined using the `lambda` keyword, Unlike regular functions defined with `def`
  - lambda functions are defined in a single line of code and can have any number of input parameters but only one expression.
  - Anonymous: Lambda functions do not have a name (unless you assign them to a variable).
  - Single Expression: The body of a lambda function is limited to a single expression.
  - Immediate Use: Often used where a small function is needed for a short period.
- Syntax
  ```python
  lambda arguments: expression
  ```
- Example
  ```python
  """
  Here, lambda x, y: x + y creates a function that takes two arguments, x and y, and returns their sum.
  The lambda function is assigned to add, which can then be called like a regular function.
  """

  add = lambda x, y: x + y
  print(add(2, 3))              # Output: 5
  ```
### Common Use Cases of Lambda Expressions
- As Arguments to Higher-Order Functions: Lambda expressions are often used as arguments to higher-order functions like `map()`, `filter()`, `sorted()`, and `reduce()`.
  ```python
  numbers = [1, 2, 3, 4]
  squared = map(lambda x: x * x, numbers)
  print(list(squared))                                      # Output: [1, 4, 9, 16]
  even_numbers = filter(lambda x: x % 2 == 0, numbers)
  print(list(even_numbers))                                 # Output: [2, 4]
  ```
- In Sorting Operations: Lambda functions are useful in custom sorting, where the key parameter of the sorted() function requires a function to determine the sort order.
  ```python
  words = ["apple", "banana", "cherry", "date"]
  sorted_words = sorted(words, key=lambda x: len(x))
  print(sorted_words)                                       # Output: ['date', 'apple', 'banana', 'cherry']
  ```
- In Place of Short Functions: For functions that are simple enough to be expressed in one line, lambda functions can be used instead of defining a full function with `def`.
  ```python
  def apply_twice(func, arg):
      return func(func(arg))

  result = apply_twice(lambda x: x * 2, 5)
  print(result)                                             # Output: 20
  ```
### Limitations of Lambda Expressions
- Single Expression Limitation: A lambda function is limited to a single expression. You cannot include multiple statements or complex logic within a lambda function.
- Lack of Documentation and Readability: Lambda functions, being anonymous and concise, can sometimes make code less readable, especially for complex operations.
  ```python
  # A more complex lambda might be harder to understand
  result = reduce(lambda acc, x: acc + x if x % 2 == 0 else acc, [1, 2, 3, 4, 5], 0)
  ```
- Debugging Difficulty: Since lambda functions are anonymous and typically used inline, they can be harder to debug compared to named functions.
### Lambda Expressions vs. Regular Functions
- Use Lambda when: 
  - you need a small function for a short period.
  - the function is simple enough to fit in a single expression.
  - you need to pass a function as an argument to another function and it won’t be reused elsewhere.
- Use Function when
  - the function has complex logic, multiple statements, or requires extensive documentation.
  - you need to reuse the function in multiple places.
  - readability is a priority.

## Decorators
### Introduction to Decorators
- A decorator is a function that takes another function as an argument, extends or alters its behavior, and returns a new function with the enhanced or modified behavior.
  - Imagine you have a function that does something specific, and you want to add extra functionality before or after that function runs (like logging, timing, or checking permissions). Instead of modifying the original function, you can "wrap" it with a decorator that adds the extra functionality.
- Synax
  ```python
  @decorator_name
  def function_to_decorate():
      pass
  ```
- Example
  ```python
  def my_decorator(func):
      def wrapper():
          print("Something is happening before the function is called.")
          func()
          print("Something is happening after the function is called.")
      return wrapper

  @my_decorator
  def say_hello():
      print("Hello!")

  say_hello()
  ```
### How Decorators Work
- Higher-Order Functions and Closures
  - A decorator is a higher-order function because it takes a function as an argument and returns a new function.
  - The wrapper function inside a decorator is an example of a closure, as it retains access to the original function (func) and any arguments passed to it.
- The `@` Syntax: provides a convenient way to apply decorators without manually wrapping functions.
  - without decorator
    ```python
    def say_hello():
        print("Hello!")

    say_hello = my_decorator(say_hello)
    say_hello()
    ```
  - with decorator
    ```python
    @my_decorator
    def say_hello():
        print("Hello!")

    say_hello()
    ```
### Common Use Cases of Decorators
- Logging: Automatically log function calls, arguments, and return values.
  ```python
  def logger(func):
      def wrapper(*args, **kwargs):
          print(f"Calling {func.__name__} with args: {args}, kwargs: {kwargs}")
          result = func(*args, **kwargs)
          print(f"{func.__name__} returned {result}")
          return result
      return wrapper

  @logger
  def add(a, b):
      return a + b

  add(2, 3)
  # Output:
  # Calling add with args: (2, 3), kwargs: {}
  # add returned 5
  ```
- Access Control and Authentication: Enforce permissions, authentication, or other access control mechanisms before allowing a function to execute.
  ```python
  def requires_authentication(func):
      def wrapper(user, *args, **kwargs):
          if not user.is_authenticated:
              raise PermissionError("User is not authenticated")
          return func(user, *args, **kwargs)
      return wrapper

  @requires_authentication
  def get_user_data(user):
      return "User data"

  # Example usage:
  class User:
      def __init__(self, authenticated):
          self.is_authenticated = authenticated

  user = User(authenticated=True)
  print(get_user_data(user))                                            # Output: User data
  ```
- Caching Results: Cache the result of expensive function calls to avoid redundant computations.
  ```python
  def cache(func):
      cached_results = {}
      def wrapper(*args):
          if args in cached_results:
              return cached_results[args]
          result = func(*args)
          cached_results[args] = result
          return result
      return wrapper

  @cache
  def expensive_computation(x):
      print("Computing...")
      return x * x

  print(expensive_computation(4))                 # Output: Computing... 16
  print(expensive_computation(4))                 # Output: 16 (cached, no "Computing..." message)
  ```
- Timing Functions: Measure the time taken by a function to execute, useful for performance monitoring.
  ```python
  import time

  def timer(func):
      def wrapper(*args, **kwargs):
          start_time = time.time()
          result = func(*args, **kwargs)
          end_time = time.time()
          print(f"{func.__name__} took {end_time - start_time:.4f} seconds")
          return result
      return wrapper

  @timer
  def slow_function():
      time.sleep(2)
      return "Done"

  print(slow_function())
  # Output:
  # slow_function took 2.000x seconds
  # Done
  ```
### Decorators with Arguments
- Example: Repeated Execution: Create a decorator that repeats the execution of a function a specified number of times.
  ```python
  def repeat(num_times):
      def decorator_repeat(func):
          def wrapper(*args, **kwargs):
              for _ in range(num_times):
                  result = func(*args, **kwargs)
              return result
          return wrapper
      return decorator_repeat

  @repeat(num_times=3)
  def say_hello():
      print("Hello!")

  say_hello()
  # Output:
  # Hello!
  # Hello!
  # Hello!
  ```
### Chaining Decorators
- You can apply multiple decorators to a single function by stacking them. The decorators are applied from top to bottom.
- Example
  ```python
  def bold(func):
      def wrapper():
          return "<b>" + func() + "</b>"
      return wrapper

  def italic(func):
      def wrapper():
          return "<i>" + func() + "</i>"
      return wrapper

  @bold
  @italic
  def greet():
      return "Hello!"

  print(greet())                              # Output: <b><i>Hello!</i></b>

  ```
### Maintaining Function Metadata
- When you apply a decorator, the original function’s metadata (like its name, docstring, etc.) is replaced by the wrapper function’s metadata. To preserve the original function’s metadata, Python provides the functools.wraps decorator.
- Example
  ```python
  from functools import wraps

  def my_decorator(func):
      @wraps(func)
      def wrapper(*args, **kwargs):
          print("Something before the function")
          result = func(*args, **kwargs)
          print("Something after the function")
          return result
      return wrapper

  @my_decorator
  def say_hello():
      """This function says hello."""
      print("Hello!")

  print(say_hello.__name__)                     # Output: say_hello
  print(say_hello.__doc__)                      # Output: This function says hello.
  ```
### Decorators in Class Methods
- Decorators can also be applied to methods within classes. This is common in frameworks like Django and Flask, where decorators are used to define routes, permissions, etc.
- Example
  ```python
  def log_method_call(func):
      @wraps(func)
      def wrapper(self, *args, **kwargs):
          print(f"Calling method {func.__name__}")
          return func(self, *args, **kwargs)
      return wrapper

  class MyClass:
      @log_method_call
      def my_method(self):
          print("Method is running")

  obj = MyClass()
  obj.my_method()
  # Output:
  # Calling method my_method
  # Method is running
  ```

## Recursion
### Introduction to Recursion
- occurs when a function calls itself directly or indirectly to solve a smaller instance of the same problem.
- Key Components:
  - Base Case: The condition under which the recursive function stops calling itself, preventing infinite recursion.
  - Recursive Case: The part of the function where the function calls itself with a modified argument.
- Example: Factorial
  ```python
  def factorial(n):
      if n == 0:
          return 1                          # Base case
      else:
          return n * factorial(n - 1)       # Recursive case

  print(factorial(5))                       # Output: 120
  ```
### Advantages of Recursion
- Simplifies Code: can make code more concise and easier to understand
- Reduces Need for Auxiliary Data Structures: Recursive solutions often eliminate the need for explicit stacks, queues, or other auxiliary data structures that iterative solutions might require.
### Disadvantages of Recursion
- Risk of Stack Overflow: Every recursive call consumes stack space. If the recursion depth is too large (e.g., for very deep trees or large input sizes), this can lead to a stack overflow, causing the program to crash.
- Performance Overhead: Recursive functions can be less efficient than iterative solutions due to the overhead of multiple function calls and stack usage
- Harder to Debug: Recursive code can be harder to debug and understand, due to the non-linear flow of execution.
### Tail Recursion
- is a special form of recursion where the recursive call is the last thing the function does. In tail-recursive functions, there is no need to keep track of the previous state once the function calls itself.
- Example
  ```python
  def tail_recursive_factorial(n, accumulator=1):
      if n == 0:
          return accumulator
      else:
          return tail_recursive_factorial(n - 1, n * accumulator)

  ```
### Memoization and Dynamic Programming
- Memoization: is an optimization technique where you store the results of expensive function calls and return the cached result when the same inputs occur again.
  ```python
  memo = {}

  def fibonacci_memo(n):
      if n in memo:
          return memo[n]
      if n <= 1:
          return n
      memo[n] = fibonacci_memo(n - 1) + fibonacci_memo(n - 2)
      return memo[n]

  print(fibonacci_memo(50))                                       # Output: 12586269025
  ```
- Dynamic Programming: is a more generalized approach to solving problems by breaking them down into simpler subproblems, solving each subproblem once, and storing the solution for future use.
  ```python
  def min_coins(coins, amount):
      dp = [float('inf')] * (amount + 1)
      dp[0] = 0

      for coin in coins:
          for x in range(coin, amount + 1):
              dp[x] = min(dp[x], dp[x - coin] + 1)

      return dp[amount] if dp[amount] != float('inf') else -1

  print(min_coins([1, 2, 5], 11))                                 # Output: 3
  ```


# Object-Oriented Programming (OOP) in Python

## Introduction to OOP Concepts
### Basics of OOP
- Classes: A class is a blueprint or template for creating objects. It defines a set of attributes (variables) and methods (functions) that the objects created from the class will have.
  ```python
  class Dog:
      species = "Canis familiaris"          # Class attribute

      def __init__(self, name):             # Initializer / Instance Attributes
          self.name = name

      def bark(self):                       # Method
          return f"{self.name} says woof!"
  ```
- Objects: An object is an instance of a class. When a class is defined, no memory is allocated until an object of that class is created. Objects are specific instances that hold data and can perform tasks defined in the class.
  ```python
  my_dog = Dog("Buddy", 3)                  # Creating an Object
  print(my_dog.name)                        # Output: Buddy
  ```
- Attributes: are the data stored inside an object. They represent the state or properties of an object.
  - Types of Attributes:
    - Instance Attributes: Attributes that are unique to each object. Defined inside the `__init__()` method.
    - Class Attributes: Attributes that are shared across all instances of a class. Defined outside any methods in the class body.
    ```python
    class Car:
        wheels = 4                            # Class attribute

        def __init__(self, make):
            self.make = make                  # Instance attributes

    my_car = Car("Toyota", "Corolla")
    print(my_car.wheels)                      # Output: 4
    print(my_car.make)                        # Output: Toyota
    ```
  - Accessing and Modifying Attributes
    - You can access attributes using dot notation (object.attribute).
    - Attributes can be modified after object creation if they are public.
    ```python
    my_car.model = "Camry"
    print(my_car.model)                       # Output: Camry
    ```
- Methods: are functions defined within a class that describe the behaviors or actions that an object can perform. They operate on the attributes of the object.
  - Types of Methods:
    - Instance Methods: The most common type of method. They operate on individual instances of a class. The first parameter is always `self`, which refers to the specific instance of the class.
      ```python
      class Circle:
          def __init__(self, radius):
              self.radius = radius

          def area(self):
              return 3.14159 * (self.radius ** 2)

      my_circle = Circle(5)
      print(my_circle.area())                 # Output: 78.53975
      ```
    - Class Methods: Operate on the class itself rather than on individual instances. The first parameter is `cls`, which refers to the class. They are defined using the `@classmethod` decorator.
      ```python
      class Circle:
          pi = 3.14159

          def __init__(self, radius):
              self.radius = radius

          @classmethod
          def from_diameter(cls, diameter):
              return cls(diameter / 2)

      circle = Circle.from_diameter(10)
      print(circle.radius)                    # Output: 5
      ```
    - Static Methods: Do not operate on class or instance attributes. They are used for utility functions that belong to the class logically but do not need access to the class or instance. They are defined using the `@staticmethod` decorator.
      ```python
      class MathOperations:
          @staticmethod
          def add(x, y):
              return x + y

      result = MathOperations.add(5, 3)
      print(result)                           # Output: 8
      ```

## Key Concepts of OOP
### Encapsulation and Abstraction
- **Encapsulation:** is the process of wrapping data and the methods that manipulate that data into a single unit (a class). It is a way of restricting access to certain components and preventing the accidental modification of data.
  - Level of Access Control in Python
    ```python
    class ExampleClass:
        def __init__(self, public_data, protected_data, private_data):
            self.public_data = public_data            # Public attribute
            self._protected_data = protected_data     # Protected attribute
            self.__private_data = private_data        # Private attribute

        def public_method(self):
            return f"Public method accessed: {self.public_data}"

        def _protected_method(self):
            return f"Protected method accessed: {self._protected_data}"

        def __private_method(self):
            return f"Private method accessed: {self.__private_data}"

        def access_private_method(self):
            return self.__private_method()

    # Creating an instance of ExampleClass
    example = ExampleClass("Public", "Protected", "Private")

    # Accessing the public attribute and method
    print(example.public_data)            # Output: Public
    print(example.public_method())        # Output: Public method accessed: Public

    # Accessing the protected attribute and method
    print(example._protected_data)         # Output: Protected
    print(example._protected_method())     # Output: Protected method accessed: Protected

    # Attempting to access the private attribute and method directly (will raise an error)
    # print(example.__private_data)        # AttributeError: 'ExampleClass' object has no attribute '__private_data'
    # print(example.__private_method())    # AttributeError: 'ExampleClass' object has no attribute '__private_method'

    # Accessing the private attribute and method through a public method
    print(example.access_private_method()) # Output: Private method accessed: Private
    ```
    - Public Attributes and Methods: are accessible from anywhere, both inside and outside the class. They are defined without any leading underscores.
    - Protected attributes and methods are intended to be accessed only within the class and its subclasses. They are indicated by a single leading underscore (`_`).
    - Private attributes and methods are meant to be accessed only within the class itself. They are indicated by a double leading underscore (`__`), which triggers name mangling to make it harder to access them from outside the class.
      - Name mangling: is the process by which Python internally changes the name of a private attribute or method to include the class name as a prefix. This transformation helps to protect the attribute or method from accidental access or modification outside the class.
        - When you define a private attribute or method using a double underscore prefix (`__`), Python automatically changes its name to `_ClassName__AttributeName`. This new name is used internally to refer to the attribute or method.
          ```python
          class ExampleClass:
              def __init__(self, value):
                  self.__private_attribute = value  # Private attribute

              def __private_method(self):
                  return f"Private method accessed with value: {self.__private_attribute}"

              def access_private(self):
                  return self.__private_method()

          # Create an instance of the class
          example = ExampleClass("Secret Value")

          # Accessing the private attribute and method directly (will raise an error)
          # print(example.__private_attribute)  # AttributeError: 'ExampleClass' object has no attribute '__private_attribute'
          # print(example.__private_method())   # AttributeError: 'ExampleClass' object has no attribute '__private_method'

          # Accessing the private method via a public method
          print(example.access_private())  # Output: Private method accessed with value: Secret Value

          # Accessing the private attribute using name mangling
          print(example._ExampleClass__private_attribute)  # Output: Secret Value

          ```
        - Name Mangling in Subclass
          ```python
          class ParentClass:
              def __init__(self):
                  self.__private_attribute = "Parent's Private"

              def get_private(self):
                  return self.__private_attribute

          class ChildClass(ParentClass):
              def __init__(self):
                  super().__init__()
                  self.__private_attribute = "Child's Private"  # New private attribute in the child class

              def get_child_private(self):
                  return self.__private_attribute

          # Create an instance of ChildClass
          child = ChildClass()

          # Accessing the private attributes
          print(child.get_private())  # Output: Parent's Private
          print(child.get_child_private())  # Output: Child's Private

          # Accessing the name-mangled private attributes directly
          print(child._ParentClass__private_attribute)  # Output: Parent's Private
          print(child._ChildClass__private_attribute)   # Output: Child's Private
          ```
        - Limitations of Name Mangling
          - Not True Privacy as access still possible: Name mangling is not intended to provide true privacy. It is simply a way to avoid accidental access. Since the name-mangled version of the attribute can still be accessed from outside the class, it doesn't prevent deliberate access.
          - No Protection Across Modules: Name mangling only works within the same module. If you import the class into another module, you can still access the name-mangled attributes and methods.
          - Potential for Misuse as it only Discourages Direct Access: Name mangling discourages direct access to private attributes and methods by making their names less obvious, but it doesn't make it impossible. Developers should respect the intended privacy of these members.
  - Best Practices for Encapsulation
    - Use Properties for Access Control: Use `@property` to provide controlled access to private attributes. This allows you to add logic for validation or transformation when getting or setting attribute values.
    - Limit Access with Protected and Private Attributes: Use protected (`_attribute`) and private (`__attribute`) attributes to limit access to sensitive data and ensure that it can only be modified in controlled ways.
    - Avoid Over-Encapsulation: Only encapsulate data that needs protection or controlled access. Avoid encapsulating attributes that are simple and do not require special handling.
- Abstraction: is the process of exposing only the essential features of an object while hiding the underlying implementation details. It allows you to interact with objects at a higher level, without needing to understand or manage the complexities of their inner workings.
  - Abstract Classes: is a class that cannot be instantiated on its own and is meant to be subclassed. It typically includes one or more abstract methods, which are methods that are declared but contain no implementation. Abstract classes define a common interface that must be implemented by all subclasses.
    - The `abc` Module: Python provides the abc module (short for Abstract Base Classes), which allows you to create abstract classes and methods.
    - To create an abstract class, inherit from `abc.ABC` and use the `@abstractmethod` decorator to define abstract methods.
    ```python
    from abc import ABC, abstractmethod

    class Shape(ABC):
        @abstractmethod
        def area(self):
            pass

        @abstractmethod
        def perimeter(self):
            pass

    class Rectangle(Shape):
        def __init__(self, width, height):
            self.width = width
            self.height = height

        def area(self):
            return self.width * self.height

        def perimeter(self):
            return 2 * (self.width + self.height)

    class Circle(Shape):
        def __init__(self, radius):
            self.radius = radius

        def area(self):
            return 3.14159 * (self.radius ** 2)

        def perimeter(self):
            return 2 * 3.14159 * self.radius

    # Creating objects of the subclasses
    rect = Rectangle(10, 20)
    circle = Circle(5)

    print(f"Rectangle Area: {rect.area()}")               # Output: Rectangle Area: 200
    print(f"Rectangle Perimeter: {rect.perimeter()}")     # Output: Rectangle Perimeter: 60
    print(f"Circle Area: {circle.area()}")                # Output: Circle Area: 78.53975
    print(f"Circle Perimeter: {circle.perimeter()}")      # Output: Circle Perimeter: 31.4159
    ```
  - Interfaces: While Python doesn't have a formal `interface` keyword like some other languages (e.g., Java), the concept of interfaces is still applicable. Abstract classes with only abstract methods can effectively serve as interfaces.
    ```python
    from abc import ABC, abstractmethod

    class Printable(ABC):
        @abstractmethod
        def print(self):
            pass

    class Document(Printable):
        def __init__(self, content):
            self.content = content

        def print(self):
            print(f"Document Content: {self.content}")

    class Image(Printable):
        def __init__(self, path):
            self.path = path

        def print(self):
            print(f"Image Path: {self.path}")

    # Using the classes
    doc = Document("This is a document.")
    img = Image("/path/to/image.png")

    doc.print()                                             # Output: Document Content: This is a document.
    img.print()                                             # Output: Image Path: /path/to/image.png
    ```
  - Getters and setters
    - Getters are methods that retrieve or access the value of an attribute in a controlled manner. They provide a way to read the value of a private or protected attribute while hiding the implementation details.
    - Setters are methods that allow you to modify the value of an attribute in a controlled way. They provide a mechanism to validate or enforce constraints on the data before setting the attribute.
    ```python
    class Person:
        def __init__(self, name, age):
            self._name = name
            self._age = age

        # Getter for name
        def get_name(self):
            return self._name

        # Setter for name
        def set_name(self, value):
            if not value:
                raise ValueError("Name cannot be empty")
            self._name = value

        # Getter for age
        def get_age(self):
            return self._age

        # Setter for age
        def set_age(self, value):
            if value < 0:
                raise ValueError("Age cannot be negative")
            self._age = value

    # Create an instance of Person
    person = Person("Alice", 30)

    # Accessing and modifying attributes using getters and setters
    print(person.get_name())  # Output: Alice
    person.set_age(35)
    print(person.get_age())   # Output: 35
    ```
  - Property Decorators(`@property`): Python provides a more elegant way to encapsulate access to an attribute using the `@property` decorator
    - The `@property` decorator is used to turn a method into a getter. This allows you to access the method as if it were an attribute. It is often used to control access to private attributes.
    - The `@<property>.setter` decorator is used to define the corresponding setter for a property. This allows you to modify the value of an attribute in a controlled way.
    ```python
    class Car:
        def __init__(self, make, model, year):
            self.__year = year                              # Private attribute
            self.make = make
            self.model = model

        @property
        def year(self):
            return self.__year

        @year.setter                                        # Don't include this setter, if you want a read-only property
        def year(self, value):
            if value >= 1886:                               # The year the first car was invented
                self.__year = value
            else:
                raise ValueError("Invalid year for a car")

    my_car = Car("Ford", "Mustang", 2020)
    print(my_car.year)                                      # Output: 2020
    my_car.year = 2021
    print(my_car.year)                                      # Output: 2021
    ```
- Abstraction vs. Encapsulation
  - Purpose
    - Abstraction focuses on hiding the complex implementation details and exposing only the necessary parts of an object. It defines what an object does without showing how it does it.
    - Encapsulation is about bundling data (attributes) and methods that operate on that data into a single unit (class) and restricting access to certain parts of an object to protect its internal state.
  - Implementation
    - Abstraction is achieved through abstract classes, interfaces, and methods that expose essential functionality while hiding the underlying complexity.
    - Encapsulation is achieved through access control (public, protected, private attributes and methods) and properties that control access to an object's data.
### Inheritance: 
- is a mechanism in OOP that allows one class (the child or derived class) to inherit attributes and methods from another class (the parent or base class). The child class can also have additional attributes and methods or override the behavior of inherited methods.
- Syntax
  ```python
  class ChildClass(ParentClass):
      # additional attributes and methods
  ```
- Types of Inheritance in Python
  - Single Inheritance: occurs when a class inherits from one parent class.
    ```python
    class Animal:                                   # Parent Class
        def __init__(self, name):
            self.name = name

        def speak(self):
            return f"{self.name} makes a sound"

    class Dog(Animal):                              # Child Class inheriting from Parent Class
        def speak(self):
            return f"{self.name} barks"

    my_dog = Dog("Buddy")                           # Create an instance of Dog
    print(my_dog.speak())                           # Output: Buddy barks
    ```
  - Multiple Inheritance: occurs when a class inherits from more than one parent class.
    ```python
    class Flyer:
        def fly(self):
            return "Flying"

    class Swimmer:
        def swim(self):
            return "Swimming"

    class Duck(Flyer, Swimmer):
        pass

    my_duck = Duck()
    print(my_duck.fly())                  # Output: Flying
    print(my_duck.swim())                 # Output: Swimming
    ```
  - Multilevel Inheritance: occurs when a class is derived from another class, which is also derived from another class.
    ```python
    class Animal:
        def eat(self):
            return "Eating"

    class Mammal(Animal):
        def breathe(self):
            return "Breathing"

    class Dog(Mammal):
        def bark(self):
            return "Barking"

    my_dog = Dog()
    print(my_dog.eat())                   # Output: Eating
    print(my_dog.breathe())               # Output: Breathing
    print(my_dog.bark())                  # Output: Barking
    ```
  - Hierarchical Inheritance: occurs when multiple classes inherit from the same parent class.
    ```python
    class Animal:
        def move(self):
            return "Moving"

    class Dog(Animal):
        def bark(self):
            return "Barking"

    class Cat(Animal):
        def meow(self):
            return "Meowing"

    my_dog = Dog()
    my_cat = Cat()

    print(my_dog.move())                  # Output: Moving
    print(my_cat.move())                  # Output: Moving
    ```
  - Hybrid Inheritance: is a combination of two or more types of inheritance.
- The super() Function: allows you to access methods of a parent class from within a child class, enabling you to build upon or extend the functionality of the parent class.
  ```python
  class Animal:
      def __init__(self, name):
          self.name = name

      def speak(self):
          return f"{self.name} makes a sound"

  class Dog(Animal):
      def __init__(self, name, breed):
          super().__init__(name)  # Call the parent class's __init__ method
          self.breed = breed

      def speak(self):
          return f"{self.name}, the {self.breed}, barks"

  my_dog = Dog("Buddy", "Golden Retriever")
  print(my_dog.speak())  # Output: Buddy, the Golden Retriever, barks
  ```
- Method Resolution Order (MRO): is the order in which methods are inherited from a hierarchy of classes. This is particularly important in multiple inheritance scenarios, where a class may inherit from multiple parent classes.
    ```python
    class A:
        def method(self):
            return "A"

    class B(A):
        def method(self):
            return "B"

    class C(A):
        def method(self):
            return "C"

    class D(B, C):
        pass

    d = D()
    print(d.method())  # Output: B
    print(D.mro())     # Output: [<class '__main__.D'>, <class '__main__.B'>, <class '__main__.C'>, <class '__main__.A'>, <class 'object'>]
    ```
    - The C3 Linearization Algorithm is an algorithm used in Python to determine the order in which classes are considered (i.e., the Method Resolution Order, or MRO) when a method is called on an object.
      - The Algorithm Steps
        - Start with the Class Itself: Begin the MRO with the class itself.
        - Merge the MROs of the parent classes, preserving the order in which the parent classes are listed and ensuring that a class always precedes its own parents in the MRO.
        - Ensure that the resulting MRO is consistent, meaning that each parent class appears before any of its own parents.
      - Complex Example with Multiple Inheritance
        ```python
        class X:
            def method(self):
                return "X"

        class Y:
            def method(self):
                return "Y"

        class Z(X, Y):
            def method(self):
                return "Z"

        class A(X, Z):
            def method(self):
                return "A"

        class B(Y, Z):
            pass

        class C(A, B):
            pass

        c = C()

        print(C.mro())          # Output: [<class '__main__.C'>, <class '__main__.A'>, <class '__main__.B'>, <class '__main__.Y'>, <class '__main__.Z'>, <class '__main__.X'>, <class 'object'>]

        print(c.method())       # Output: A
        ```
### Polymorphism
- is the ability of different objects to respond to the same method call in a way that is appropriate for their class.
- Types of Polymorphism
  - Method Overloading (Compile-Time Polymorphism): refers to the ability to define multiple methods with the same name but different signatures (i.e., different parameters).
    ```python
    class Example:
        def add(self, a, b, c=0):
            return a + b + c

    obj = Example()
    print(obj.add(1, 2))                  # Output: 3 (uses two arguments)
    print(obj.add(1, 2, 3))               # Output: 6 (uses three arguments)
    ```
  - Method Overriding (Runtime Polymorphism): occurs when a child class provides a specific implementation of a method that is already defined in its parent class. 
    ```python
    class Animal:
        def sound(self):
            return "Some sound"

    class Dog(Animal):
        def sound(self):
            return "Bark"

    class Cat(Animal):
        def sound(self):
            return "Meow"

    animals = [Dog(), Cat(), Animal()]                # List of animals

    for animal in animals:
        print(animal.sound())
    ```
- Duck typing: is a form of polymorphism where the actual type of an object is less important than the methods it supports. The name comes from the saying: "If it looks like a duck, swims like a duck, and quacks like a duck, then it probably is a duck."
  ```python
  """
  In this example, the make_it_quack function takes any object and calls its quack method.
  It doesn't matter whether the object is actually an instance of a Duck class.
  As long as the object has a quack method, it can be passed to make_it_quack.
  """
  class Duck:
      def quack(self):
          return "Quack"

  class Dog:
      def quack(self):
          return "Woof (but pretending to quack)"

  def make_it_quack(thing):
      print(thing.quack())

  duck = Duck()
  dog = Dog()

  make_it_quack(duck)                                 # Output: Quack
  make_it_quack(dog)                                  # Output: Woof (but pretending to quack)
  ```
- Operator Overloading: allows you to define or change the behavior of built-in operators (+, -, *, etc.) when they are applied to objects of a user-defined class. This is done by defining special methods in the class that correspond to the operators.
  - Python provides a set of special methods (also known as magic methods or dunder methods) that you can implement in your class to overload operators.
  - Arithmetic Operators
    - `__add__(self, other)` : Overloads the `+` operator.
    - `__sub__(self, other)` : Overloads the `-` operator.
    - `__mul__(self, other)` : Overloads the `*` operator.
    - `__truediv__(self, other)` : Overloads the `/` operator.
    - `__floordiv__(self, other)`  : Overloads the `//` operator.
    - `__mod__(self, other)` : Overloads the `%` operator.
    - `__pow__(self, other)` : Overloads the `**` operator.
  - Comparison Operators:
    - `__eq__(self, other)`: Overloads the `==` operator.
    - `__ne__(self, other)`: Overloads the `!=` operator.
    - `__lt__(self, other)`: Overloads the `<` operator.
    - `__le__(self, other)`: Overloads the `<=` operator.
    - `__gt__(self, other)`: Overloads the `>` operator.
    - `__ge__(self, other)`: Overloads the `>=` operator.
  - Unary Operators:
    - `__neg__(self)`: Overloads the `unary -` operator (negation).
    - `__pos__(self)`: Overloads the `unary +` operator (positive).
    - `__abs__(self)`: Overloads the `abs()` function.
    - `__invert__(self)`: Overloads the `~` operator (bitwise inversion).
  - Assignment Operators:
    - `__iadd__(self, other)`: Overloads the `+=` operator.
    - `__isub__(self, other)`: Overloads the `-=` operator.
    - `__imul__(self, other)`: Overloads the `*=` operator.
    - `__itruediv__(self, other)`: Overloads the `/=` operator.
    - `__ifloordiv__(self, other)`: Overloads the `//=` operator.
    - `__imod__(self, other)`: Overloads the `%=` operator.
    - `__ipow__(self, other)`: Overloads the `**=` operator.
### Magic (or Dunder) Methods:
- are special methods that are automatically invoked by Python in response to certain operations or events. 
- These methods are not meant to be called directly by the user but are used internally by Python to execute specific behaviors.
  - Commonly Used Magic (Dunder) Methods
    - Initialization and Representation Methods
      - `__init__(self, ...)`: This method is called when an instance of the class is created. It initializes the object with the provided arguments.
        ```python
        class Car:
            def __init__(self, make, model):
                self.make = make
                self.model = model

        my_car = Car("Toyota", "Corolla")
        ```
      - `__new__(cls, ...)`: This method is called before __init__(). It is responsible for creating a new instance of the class. It is rarely overridden but can be useful for customizing instance creation.
        ```python
        class Singleton:
            _instance = None

            def __new__(cls, *args, **kwargs):
                if not cls._instance:
                    cls._instance = super(Singleton, cls).__new__(cls, *args, **kwargs)
                return cls._instance
        ```
      - `__str__(self)`: This method is called by the str() function and by the print statement to get a string representation of the object. It should return a user-friendly string.
        ```python
        class Car:
            def __init__(self, make, model):
                self.make = make
                self.model = model

            def __str__(self):
                return f"{self.make} {self.model}"

        my_car = Car("Toyota", "Corolla")
        print(my_car)                                                       # Output: Toyota Corolla
        ```
      - `__repr__(self)`: This method is called by the `repr()` function and by the interactive interpreter to get a string representation of the object. It should return a string that, if passed to `eval()`, would recreate the object.
        ```python
        class Car:
            def __init__(self, make, model):
                self.make = make
                self.model = model

            def __repr__(self):
                return f"Car(make='{self.make}', model='{self.model}')"

        my_car = Car("Toyota", "Corolla")
        print(repr(my_car))                                                 # Output: Car(make='Toyota', model='Corolla')
        ```
    - Arithmetic Operator Methods
      - `__add__(self, other)`: This method is called to implement the addition operator (+). It defines the behavior for `self + other`.
        ```python
        class Vector:
            def __init__(self, x, y):
                self.x = x
                self.y = y

            def __add__(self, other):
                return Vector(self.x + other.x, self.y + other.y)

            def __repr__(self):
                return f"Vector({self.x}, {self.y})"

        v1 = Vector(2, 3)
        v2 = Vector(4, 5)
        print(v1 + v2)                                                # Output: Vector(6, 8)
        ```
      - `__sub__(self, other)`: This method is called to implement the subtraction operator (`-`). It defines the behavior for `self - other`.
        ```python
        class Vector:
            def __init__(self, x, y):
                self.x = x
                self.y = y

            def __sub__(self, other):
                return Vector(self.x - other.x, self.y - other.y)

            def __repr__(self):
                return f"Vector({self.x}, {self.y})"

        v1 = Vector(5, 7)
        v2 = Vector(3, 2)
        print(v1 - v2)                                                # Output: Vector(2, 5)
        ```
      - `__mul__(self, other)`: This method is called to implement the multiplication operator (`*`). It defines the behavior for `self * other`.
        ```python
        class Vector:
            def __init__(self, x, y):
                self.x = x
                self.y = y

            def __mul__(self, scalar):
                return Vector(self.x * scalar, self.y * scalar)

            def __repr__(self):
                return f"Vector({self.x}, {self.y})"

        v = Vector(2, 3)
        print(v * 3)                                                  # Output: Vector(6, 9)
        ```
      - `__truediv__(self, other)`: This method is called to implement true division (`/`). It defines the behavior for `self / other`.
        ```python
        class Vector:
            def __init__(self, x, y):
                self.x = x
                self.y = y

            def __truediv__(self, scalar):
                return Vector(self.x / scalar, self.y / scalar)

            def __repr__(self):
                return f"Vector({self.x}, {self.y})"

        v = Vector(6, 9)
        print(v / 3)                                                  # Output: Vector(2.0, 3.0)
        ```
    - Comparison Operator Methods
      - `__eq__(self, other)`: This method is called to implement the equality operator (`==`). It defines the behavior for `self == other`.
        ```python
        class Point:
            def __init__(self, x, y):
                self.x = x
                self.y = y

            def __eq__(self, other):
                return self.x == other.x and self.y == other.y

        p1 = Point(1, 2)
        p2 = Point(1, 2)
        print(p1 == p2)                                               # Output: True
        ```
      - `__lt__(self, other)`: This method is called to implement the less-than operator (`<`). It defines the behavior for `self < other`.
        ```python
        class Point:
            def __init__(self, x, y):
                self.x = x
                self.y = y

            def __lt__(self, other):
                return self.x < other.x and self.y < other.y

        p1 = Point(1, 2)
        p2 = Point(3, 4)
        print(p1 < p2)                                                # Output: True
        ```
      - `__le__(self, other)`: This method is called to implement the less-than-or-equal-to operator (`<=`). It defines the behavior for `self <= other`.
        ```python
        class Point:
            def __init__(self, x, y):
                self.x = x
                self.y = y

            def __le__(self, other):
                return self.x <= other.x and self.y <= other.y

        p1 = Point(1, 2)
        p2 = Point(3, 4)
        print(p1 <= p2)                                               # Output: True
        ```
    - Unary Operator Methods
      - `__neg__(self)`: This method is called to implement the unary negation operator (`-`). It defines the behavior for `-self`.
        ```python
        class Vector:
            def __init__(self, x, y):
                self.x = x
                self.y = y

            def __neg__(self):
                return Vector(-self.x, -self.y)

            def __repr__(self):
                return f"Vector({self.x}, {self.y})"

        v = Vector(2, 3)
        print(-v)                                           # Output: Vector(-2, -3)
        ```
      - `__pos__(self)`: This method is called to implement the unary plus operator (`+`). It defines the behavior for `+self`.
        ```python
        class Vector:
            def __init__(self, x, y):
                self.x = x
                self.y = y

            def __pos__(self):
                return self

            def __repr__(self):
                return f"Vector({self.x}, {self.y})"

        v = Vector(2, 3)
        print(+v)                                       # Output: Vector(2, 3)
        ```
      - `__abs__(self)`: This method is called to implement the abs() function. It defines the behavior for `abs(self)`.
        ```python
        class Vector:
            def __init__(self, x, y):
                self.x = x
                self.y = y

            def __abs__(self):
                return (self.x**2 + self.y**2) ** 0.5

        v = Vector(3, 4)
        print(abs(v))                                   # Output: 5.0
        ```
    - Container Methods
      - `__len__(self)`: This method is called by the `len()` function to return the length of the object.
        ```python
        class MyList:
            def __init__(self, *items):
                self.items = list(items)

            def __len__(self):
                return len(self.items)

        lst = MyList(1, 2, 3, 4)
        print(len(lst))                       # Output: 4
        ```
      - `__getitem__(self, key)`: This method is called to access an item using the `[]` operator.
        ```python
        class MyList:
            def __init__(self, *items):
                self.items = list(items)

            def __getitem__(self, index):
                return self.items[index]

        lst = MyList(10, 20, 30, 40)
        print(lst[2])                         # Output: 30
        ```
      - `__setitem__(self, key, value)`: This method is called to set the value of an item using the `[]` operator.
        ```python
        class MyList:
            def __init__(self, *items):
                self.items = list(items)

            def __setitem__(self, index, value):
                self.items[index] = value

        lst = MyList(10, 20, 30, 40)
        lst[2] = 300
        print(lst.items)                          # Output: [10, 20, 300, 40]
        ```
      - `__delitem__(self, key)`: This method is called to delete an item using the `del` statement.
        ```python
        class MyList:
            def __init__(self, *items):
                self.items = list(items)

            def __delitem__(self, index):
                del self.items[index]

        lst = MyList(10, 20, 30, 40)
        del lst[2]
        print(lst.items)                    # Output: [10, 20, 40]
        ```
      - `__contains__(self, item)`: This method is called to implement membership testing with the `in` and `not in` operators.
        ```python
        class MyList:
            def __init__(self, *items):
                self.items = list(items)

            def __contains__(self, item):
                return item in self.items

        lst = MyList(10, 20, 30, 40)
        print(30 in lst)                    # Output: True
        ```
    - Customizing Object Lifecycle Methods
      - `__new__(cls, ...)`: This method is responsible for creating a new instance of the class. It is called before `__init__()`.
        ```python
        class Singleton:
            _instance = None

            def __new__(cls, *args, **kwargs):
                if not cls._instance:
                    cls._instance = super(Singleton, cls).__new__(cls, *args, **kwargs)
                return cls._instance
        ```
      - ```__del__(self)```: This method is called when an object is about to be destroyed. It is the destructor method, but its use is generally discouraged in favor of context managers.
        ```python
        class FileHandler:
            def __init__(self, filename):
                self.file = open(filename, 'w')

            def __del__(self):
                self.file.close()

        handler = FileHandler("test.txt")
        ```
### Composition: 
- is a design principle where one class contains references to one or more objects of other classes as part of its attributes
- Example
  ```python
  class Engine:
      def __init__(self, horsepower):
          self.horsepower = horsepower

      def start(self):
          return "Engine starting..."

      def stop(self):
          return "Engine stopping..."

  class Car:
      def __init__(self, make, model, engine):
          self.make = make
          self.model = model
          self.engine = engine  # Composition: Car "has an" engine

      def start(self):
          return f"{self.make} {self.model} {self.engine.start()}"

      def stop(self):
          return f"{self.make} {self.model} {self.engine.stop()}"

  # Creating an Engine object
  engine = Engine(150)

  # Creating a Car object with the Engine object
  my_car = Car("Toyota", "Corolla", engine)

  # Using the Car's methods
  print(my_car.start())  # Output: Toyota Corolla Engine starting...
  print(my_car.stop())   # Output: Toyota Corolla Engine stopping...
  ```
- Composition vs. Inheritance
  - Type of Relationship
    - Inheritance represents an "is-a" relationship where a subclass inherits properties and behaviors from a parent class. For example, a Dog class might inherit from an Animal class, implying that a dog "is a" type of animal.
    - Composition represents a "has-a" relationship where a class contains one or more objects of other classes. For example, a Car class might have an Engine object, implying that a car "has an" engine.
  - Coupling
    - Inheritance creates a strong coupling between the parent and child classes. Changes in the parent class can have unintended effects on all child classes.
    - Composition leads to looser coupling, as the composed objects can be replaced or changed independently of the containing class.
  - Hierarchy
    - Inheritance is typically used in a single hierarchy, where classes form a tree-like structure.
    - Composition allows classes to be made up of multiple components, each handling a specific aspect of the functionality.
- Delegation: In delegation, the composed object (i.e., the component) handles certain tasks on behalf of the containing class. This is done by calling methods of the composed object directly from the containing class. The difference lies in the fact that the containing class has more control and can potentially alter the method signature, perform additional operations before or after the delegate's method call, or even modify the arguments or return value.
  ```python
  class Printer:
      def print_document(self, document):
          print(f"Printing: {document}")

  class Office:
      def __init__(self):
          self.printer = Printer()              # Composition with delegation

      def print_report(self, report):
          self.printer.print_document(report)   # Delegation

  office = Office()
  office.print_report("Annual Report")
  ```
  - Forwarding is a more specific form of delegation technique where the composed object handles method calls, but the method signature and call are managed by the containing class.
    ```python
    class Printer:
        def print_document(self, document):
            print(f"Printing: {document}")

    class Office:
        def __init__(self):
            self.printer = Printer()

        def forward_print(self, document):
            processed_document = f"[Task] {document}"         # Pre-process the document
            self.printer.print_document(processed_document)   # Forwarding with additional processing

    office = Office()
    office.print_report("Annual Report")
    ```
## Advanced OOP Topics
### Metaclasses in Python
- Introduction to Metaclasses
  - A metaclass is a class that defines the behavior of other classes. In other words, just as objects are instances of classes, classes are instances of metaclasses.
  ```python
  class MyMeta(type):
      def __new__(cls, name, bases, dct):
          print(f"Creating class {name}")
          return super().__new__(cls, name, bases, dct)

  class MyClass(metaclass=MyMeta):
      pass

  # Creating an instance of MyClass
  my_instance = MyClass()
  ```
- Why Use Metaclasses?
  - Customization: Metaclasses allow you to customize the class creation process, enabling you to control how classes are constructed, modify the class before it is fully created, or even automatically add new methods or attributes.
  - Enforcing Rules: Metaclasses can enforce certain rules or patterns in your class design, ensuring consistency across multiple classes without having to manually add the same code to each one.
  - Automatic Registration: They can be used to automatically register classes in a registry or perform other actions when classes are defined.
- The `__new__()` and `__init__()` Methods in Metaclasses
  - `__new__()`:
    - The `__new__()` method is responsible for creating a new class. It is called before the class is actually created, and it returns the newly created class.
    - In a metaclass, `__new__()` is used to control the creation of the class itself (not instances of the class).
  - `__init__()`:
    - The `__init__()` method is called after the class has been created. It initializes the class by setting any necessary attributes or performing any required setup.
    - In a metaclass, `__init__()` can be used to modify or customize the class after it has been created.
  - Example
    ```python
    class MyMeta(type):
        def __new__(cls, name, bases, dct):
            dct['class_id'] = name.lower()
            return super().__new__(cls, name, bases, dct)

    class MyClass(metaclass=MyMeta):
        pass

    # Checking the class attribute
    print(MyClass.class_id)  # Output: myclass
    ```
- Metaclass Use Cases
  - Enforcing Class Design: Metaclasses can enforce that certain attributes or methods are present in a class or follow specific naming conventions.
    ```python
    class AttributeEnforcerMeta(type):
        def __init__(cls, name, bases, dct):
            if not hasattr(cls, 'required_attribute'):
                raise TypeError(f"Class {name} is missing required attribute 'required_attribute'")
            super().__init__(name, bases, dct)

    class MyClass(metaclass=AttributeEnforcerMeta):
        required_attribute = "I am required"

    # This will work fine, but if you remove `required_attribute`, a TypeError will be raised.
    # The AttributeEnforcerMeta metaclass checks if the required_attribute is present in any class that uses this metaclass. If the attribute is missing, a TypeError is raised.
    ```
  - Automatic Class Registration: Metaclasses can be used to automatically register classes in a global registry.
    ```python
    class RegistryMeta(type):
          registry = {}

          def __init__(cls, name, bases, dct):
              if name != 'BaseClass':
                  RegistryMeta.registry[name] = cls
              super().__init__(name, bases, dct)

      class BaseClass(metaclass=RegistryMeta):
          pass

      class ClassA(BaseClass):
          pass

      class ClassB(BaseClass):
          pass

      # Checking the registry
      print(RegistryMeta.registry)
      # Output: {'ClassA': <class '__main__.ClassA'>, 'ClassB': <class '__main__.ClassB'>}
      ```
- Metaclasses and Inheritance: Metaclasses follow the inheritance chain just like classes do. If you inherit from a class with a metaclass, the child class will automatically use the same metaclass unless you explicitly override it.
  ```python
  class MyMeta(type):
      pass

  class BaseClass(metaclass=MyMeta):
      pass

  class SubClass(BaseClass):
      pass

  print(type(SubClass))  # Output: <class '__main__.MyMeta'>
  ```

### Custom Object Creation
- `__init__()` and `__new__()`: 
  - `__init__()` is commonly used for initializing objects after they’ve been created
  - `__new__()` gives you control over the actual creation of the object itself
- The `__new__()` Method
  - Basics
    - `__new__()` is a special method in Python responsible for creating a new instance of a class. It is called before `__init__()` and is the first step of instance creation.
    - `__new__()` is typically overridden in scenarios where you need to control the creation of a new object, such as when implementing singletons, immutable objects, or when inheriting from immutable types like `tuple` or `str`.
  - Structure
    - The `__new__()` method receives the class itself (`cls`) as its first argument, followed by any additional arguments passed during object instantiation.
    - It returns a new instance of the class, usually by calling `super().__new__(cls, *args, **kwargs)`.
  - Example
    ```python
    """
    __new__() is overridden to print a message when a new instance is created. 
    The instance is then passed to __init__() for initialization.
    """
    class MyClass:
        def __new__(cls, *args, **kwargs):
            print("Creating a new instance of MyClass")
            instance = super().__new__(cls)
            return instance
        
        def __init__(self, value):
            print("Initializing the instance")
            self.value = value

    # Creating an instance of MyClass
    obj = MyClass(10)
    # Output:
    # Creating a new instance of MyClass
    # Initializing the instance
    ```
  - When to Override `__new__()`:
    - Immutable Objects: When you need to create instances of immutable types like `str`, `int`, or `tuple`, where object creation needs to be tightly controlled.
    - Singleton Pattern: Implementing the Singleton pattern, where only one instance of a class should exist.
    - Custom Metaclasses: When working with metaclasses, you might need to override `__new__()` to customize class creation.
- The `__init__()` Method
  - Basics
    - `__init__()` is the initializer method in Python, called after `__new__()` to initialize the newly created object. It is where you set up the initial state of the object.
    - `__init__()` is used to initialize instance attributes and perform any setup tasks necessary after the object is created.
  - Structure
    - The `__init__()` method receives the instance (`self`) as its first argument, followed by any additional arguments passed during object instantiation.
  - Example
    ```python
    """
    __init__() is used here to set the value attribute when a new instance of MyClass is created.
    """
    class MyClass:
        def __init__(self, value):
            print("Initializing the instance")
            self.value = value

    # Creating an instance of MyClass
    obj = MyClass(10)
    # Output:
    # Initializing the instance
    ```
- `__new__()` vs. `__init__()`
  - `__new__()`:
    - Responsible for creating a new instance of the class.
    - It is the first method called during object instantiation.
    - Returns the newly created instance.
    - Typically used for immutable objects or when altering the creation process itself.
  - `__init__()`:
    - Responsible for initializing the instance after it has been created.
    - Called after `__new__()`.
    - Does not return anything; it simply sets up the object.
    - Used for setting initial attributes and performing setup tasks.
- Use Cases for Custom Object Creation
  - Immutable Objects: cannot be modified after they are created. Overriding `__new__()` is necessary when you want to customize how these objects are created.
    ```python
    """
    Here, MyString is a subclass of str.
    The __new__() method is used to create the immutable string object.
    The __init__() method is used for any additional setup or logging.
    """
    class MyString(str):
        def __new__(cls, value):
            # Create the immutable string object
            instance = super().__new__(cls, value)
            return instance
        
        def __init__(self, value):
            print("Initializing MyString")
        
        def __repr__(self):
            return f"MyString({super().__repr__()})"

    # Creating an instance of MyString
    my_str = MyString("Hello")
    print(my_str)  # Output: MyString('Hello')
    ```
  - Singleton Pattern: ensures that only one instance of a class is created.
    ```python
    """
    The __new__() method is overridden to ensure that only one instance of Singleton is ever created.
    If an instance already exists, __new__() returns it instead of creating a new one.
    """
    class Singleton:
        _instance = None
        
        def __new__(cls, *args, **kwargs):
            if not cls._instance:
                cls._instance = super().__new__(cls, *args, **kwargs)
            return cls._instance
        
        def __init__(self, value):
            self.value = value

    # Creating instances of Singleton
    s1 = Singleton(10)
    s2 = Singleton(20)

    print(s1.value)  # Output: 20
    print(s2.value)  # Output: 20
    print(s1 is s2)  # Output: True
    ```
  - Customizing Object Creation with Metaclasses: Metaclasses can customize object creation by defining or altering the class itself.
    ```python
    """
    Here, the MyMeta metaclass adds a custom_attr attribute to MyClass during its creation, before any instances are made.
    """
    class MyMeta(type):
        def __new__(cls, name, bases, dct):
            dct['custom_attr'] = "Custom Attribute"
            return super().__new__(cls, name, bases, dct)

    class MyClass(metaclass=MyMeta):
        pass

    # Creating an instance of MyClass
    obj = MyClass()
    print(obj.custom_attr)  # Output: Custom Attribute
    ```
### Class Decorators
- Basics
  - A class decorator is a function that is applied to a class to modify or extend its behavior.
  - It takes a class as its input and returns either the same class or a modified version of it.
- Example
  ```python
  """
  The add_method decorator function takes MyClass as an argument, adds an extra_method to it, and then returns the modified class.
  When MyClass is instantiated, the object now has both the original method and the new method added by the decorator.
  """
  def add_method(cls):
      cls.extra_method = lambda self: "This is an extra method"
      return cls

  @add_method
  class MyClass:
      def original_method(self):
          return "This is the original method"

  # Creating an instance of MyClass
  obj = MyClass()

  # Using the original method
  print(obj.original_method())  # Output: This is the original method

  # Using the method added by the decorator
  print(obj.extra_method())  # Output: This is an extra method
  ```
- Applying Decorators to Classes
  - Chaining Multiple Class Decorators: You can chain multiple decorators on a single class, with each decorator being applied in the order they are listed.
    ```python
    """
    Here, the add_method and add_attribute decorators are both applied to MyClass.
    The class gains both the new method and the new attribute, demonstrating how decorators can be stacked to apply multiple modifications.
    """
    def add_method(cls):
        cls.extra_method = lambda self: "This is an extra method"
        return cls

    def add_attribute(cls):
        cls.extra_attribute = "This is an extra attribute"
        return cls

    @add_method
    @add_attribute
    class MyClass:
        def original_method(self):
            return "This is the original method"

    # Creating an instance of MyClass
    obj = MyClass()

    # Using the original method
    print(obj.original_method())  # Output: This is the original method

    # Using the method and attribute added by the decorators
    print(obj.extra_method())      # Output: This is an extra method
    print(obj.extra_attribute)     # Output: This is an extra attribute
    ```
  - Validating Class Attributes: A class decorator can be used to validate that certain required attributes or methods are present in a class.
    ```python
    """
    The validate_class decorator checks if the class has a required_method.
    If it does not, a TypeError is raised.
    In this case, MyClass implements the required method, so the decorator allows the class to be created.
    """
    def validate_class(cls):
        if not hasattr(cls, 'required_method'):
            raise TypeError(f"Class {cls.__name__} is missing required method 'required_method'")
        return cls

    @validate_class
    class MyClass:
        def required_method(self):
            return "This is the required method"

    # Creating an instance of MyClass
    obj = MyClass()
    print(obj.required_method())  # Output: This is the required method
    ```
  - Automatically Registering Classes: Class decorators can also be used to automatically register classes in a registry or to perform other automatic setup tasks.
    ```python
    registry = {}

    def register_class(cls):
        registry[cls.__name__] = cls
        return cls

    @register_class
    class MyClass:
        def my_method(self):
            return "This is my method"

    # Checking the registry
    print(registry)                       # Output: {'MyClass': <class '__main__.MyClass'>}

    # Creating an instance of MyClass
    obj = registry['MyClass']()
    print(obj.my_method())                # Output: This is my method
    ```
  - Combining Class Decorators with Metaclasses: In advanced scenarios, you might combine class decorators with metaclasses to achieve even more powerful customizations.
    ```python
    """
    In this example, MyClass is enhanced by both a class decorator and a metaclass.
    The class decorator adds a class_name attribute, while the metaclass adds a meta_added attribute.
    The result is a class that combines the functionality of both enhancements.
    """
    def add_class_name(cls):
        cls.class_name = cls.__name__
        return cls

    class MyMeta(type):
        def __new__(cls, name, bases, dct):
            dct['meta_added'] = "Added by metaclass"
            return super().__new__(cls, name, bases, dct)

    @add_class_name
    class MyClass(metaclass=MyMeta):
        pass

    # Creating an instance of MyClass
    obj = MyClass()

    # Accessing attributes added by the decorator and metaclass
    print(obj.class_name)   # Output: MyClass
    print(obj.meta_added)   # Output: Added by metaclass
    ```
- Class Decorators vs. Metaclasses: While both class decorators and metaclasses can be used to modify classes, they serve different purposes and have different use cases:
  - **Class Decorators**
    - **Simplicity:** Easier to write and understand, making them ideal for simpler modifications.
    - **Focus:** Best for modifying or enhancing a single class or a small set of classes.
    - **Order of Execution:** Applied after the class is created.
  - **Metaclasses**
    - **Power:** More powerful and flexible, allowing deep customization of class behavior.
    - **Breadth:** Suitable for controlling the creation and behavior of multiple related classes in a consistent way.
    - **Order of Execution:** Applied during class creation, before the class decorator.
### Descriptor Protocol
- Basics
  - The descriptor protocol is a set of methods (`__get__()`, `__set__()`, and `__delete__()`) that allow an object to manage attribute access in another object. 
  - Descriptors are objects that implement one or more of these methods.
- The Methods of the Descriptor Protocol
  - `__get__()`: Called when an attribute is accessed. It retrieves the attribute value.
    - Parameters
      - `self`: The descriptor instance.
      - `instance`: The instance that the attribute was accessed on (or `None` if accessed through the class).
      - `owner`: The class that owns the attribute.
    - Example
      ```python
      class Descriptor:
          def __get__(self, instance, owner):
              print(f"Getting value, instance: {instance}, owner: {owner}")
              return 42

      class MyClass:
          attr = Descriptor()

      # Accessing the descriptor
      obj = MyClass()  
      print(obj.attr)  
      # Output: 
      # Getting value, instance: <__main__.MyClass object at ...>, owner: <class '__main__.MyClass'>
      # 42
      ```
  - `__set__(self, instance, value)`: Called when an attribute is assigned a value. It handles the attribute assignment.
    - Parameters:
      - `self`: The descriptor instance.
      - `instance`: The instance that the attribute is being set on.
      - `value`: The value being assigned to the attribute.
    - Example
      ```python
      class Descriptor:
          def __set__(self, instance, value):
              print(f"Setting value to {value}")
              instance._value = value

      class MyClass:
          attr = Descriptor()

      # Setting the descriptor
      obj = MyClass()
      obj.attr = 100  # Output: Setting value to 100
      ```
  - `__delete__(self, instance)`: Called when an attribute is deleted. It handles the attribute deletion.
    - Parameters:
      - `self`: The descriptor instance.
      - `instance`: The instance that the attribute is being deleted from.
    - Example:
      ```python
      class Descriptor:
          def __delete__(self, instance):
              print("Deleting value")
              del instance._value

      class MyClass:
          attr = Descriptor()

      # Deleting the descriptor
      obj = MyClass()
      del obj.attr  # Output: Deleting value
      ```
- **Types of Descriptors:** Descriptors can be categorized based on which methods of the descriptor protocol they implement.
  - **Data Descriptors:** A descriptor that implements both `__get__()` and `__set__()` (or `__delete__()`). Data descriptors control both attribute access and modification.
    ```python
    """
    Here, DataDescriptor implements both __get__() and __set__(), making it a data descriptor that controls both reading and writing of the attribute.
    """
    class DataDescriptor:
        def __get__(self, instance, owner):
            return instance._value

        def __set__(self, instance, value):
            instance._value = value

    class MyClass:
        attr = DataDescriptor()

    obj = MyClass()
    obj.attr = 10             # Setting a value
    print(obj.attr)           # Output: 10
    ```
  - **Non-Data Descriptors:** A descriptor that implements only `__get__()`. Non-data descriptors control only attribute access, leaving assignment and deletion to be handled normally.
    ```python
    """
    NonDataDescriptor implements only __get__(), so it controls only how the attribute is accessed.
    The assignment and deletion of attr would follow the normal behavior unless overridden.
    """
    class NonDataDescriptor:
        def __get__(self, instance, owner):
            return "Non-data descriptor value"

    class MyClass:
        attr = NonDataDescriptor()

    obj = MyClass()
    print(obj.attr)  # Output: Non-data descriptor value
    ```
- Use Cases for Descriptors
  - **Properties:** `@property` decorator is built on the descriptor protocol. It allows you to define methods that act as getters, setters, and deleters for an attribute.
    ```python
    """
    The @property decorator provides a clean interface for managing attribute access and validation without exposing internal implementation details.
    """
    class MyClass:
        def __init__(self, value):
            self._value = value
        
        @property
        def value(self):
            return self._value
        
        @value.setter
        def value(self, new_value):
            if new_value < 0:
                raise ValueError("Value must be non-negative")
            self._value = new_value

    # Using the property
    obj = MyClass(10)
    print(obj.value)  # Output: 10
    obj.value = 20    # Valid
    # obj.value = -5  # Would raise ValueError
    ```
      - **Static Methods:** Static methods in Python do not receive an implicit first argument (`self` or `cls`). They are just regular functions that happen to be defined inside a class. The `@staticmethod` decorator turns a function into a static method, which is implemented using the descriptor protocol.
        ```python
        """
        The StaticMethod descriptor wraps a function and returns it as-is, regardless of whether it’s accessed from an instance or a class.
        """
        class StaticMethod:
            def __init__(self, func):
                self.func = func

            def __get__(self, instance, owner):
                return self.func
        ```
      - **Class Methods:** Class methods receive the class (`cls`) as their first argument instead of an instance. The `@classmethod` decorator is used to create class methods, and it is implemented using the descriptor protocol.
        ```python
        """
        The ClassMethod descriptor wraps a function and returns a method bound to the class (owner) rather than to an instance.
        This allows the method to receive the class as its first argument.
        """
        class ClassMethod:
            def __init__(self, func):
                self.func = func

            def __get__(self, instance, owner):
                return MethodType(self.func, owner)
        ```
      
  - **Type Checking and Validation:** Descriptors can be used to enforce type constraints or perform validation when attributes are set.
    ```python
    """
    The TypedDescriptor enforces that the name attribute must be a string and the age attribute must be an integer.
    If a wrong type is assigned, a TypeError is raised.
    """
    class TypedDescriptor:
        def __init__(self, name, expected_type):
            self.name = name
            self.expected_type = expected_type

        def __get__(self, instance, owner):
            return instance.__dict__.get(self.name)

        def __set__(self, instance, value):
            if not isinstance(value, self.expected_type):
                raise TypeError(f"Expected {self.expected_type}")
            instance.__dict__[self.name] = value

    class MyClass:
        name = TypedDescriptor('name', str)
        age = TypedDescriptor('age', int)

    obj = MyClass()
    obj.name = "Alice"  # Valid
    obj.age = 30        # Valid
    # obj.age = "thirty"  # Would raise TypeError
    ```
  - **Lazy Attribute Evaluation:** Descriptors can be used to implement lazy evaluation, where the value of an attribute is calculated the first time it is accessed and then cached for subsequent access.
    ```python
    class LazyProperty:
        def __init__(self, func):
            self.func = func
            self.name = func.__name__

        def __get__(self, instance, owner):
            if self.name not in instance.__dict__:
                instance.__dict__[self.name] = self.func(instance)
            return instance.__dict__[self.name]

    class MyClass:
        @LazyProperty
        def expensive_calculation(self):
            print("Computing value...")
            return 42

    obj = MyClass()
    print(obj.expensive_calculation)  # Output: Computing value... 42
    print(obj.expensive_calculation)  # Output: 42
    ```
  - **Methods:** In Python, when you define a function inside a class, it is automatically transformed into an instance method. The descriptor protocol is responsible for binding the method to an instance when it is accessed.
    ```python
    """
    When obj.my_method() is called, the my_method function is retrieved from the class using the descriptor protocol, and Python automatically passes obj as the first argument (self) to the method.
    When accessed through the class (MyClass.my_method), the function is not bound to any instance, so it remains a plain function.
    """
    class MyClass:
        def my_method(self):
            return "Instance method called"

    # Creating an instance of MyClass
    obj = MyClass()

    # Accessing the method from the instance
    print(obj.my_method())  # Output: Instance method called

    # Accessing the method from the class (unbound method in Python 2, plain function in Python 3)
    print(MyClass.my_method)  # Output: <function MyClass.my_method at 0x...>
    ```
    - The method binding is handled by the descriptor protocol, specifically by the __get__() method of the function object. Here’s a conceptual example of what happens under the hood:
      ```python
      """
      The __get__() method checks if the method is being accessed on an instance (instance is not None).
      If so, it returns a bound method object; otherwise, it returns the original function object.
      """
      class Function:
          def __get__(self, instance, owner):
              if instance is None:
                  return self
              return MethodType(self, instance)
      ```
### Mixins
- **Introduction**
  - A mixin is a class that provides methods to be used by other classes through multiple inheritance.
  - A mixin is not meant to stand on its own; instead, it’s designed to be combined with other classes to add specific functionality.
- **Characteristics of Mixins**
  - **No Instantiation:** Mixins are not meant to be instantiated on their own. They are designed to be used in conjunction with other classes.
  - **Single Responsibility:** A mixin typically provides one specific piece of functionality or behavior. This makes it easier to compose multiple mixins into a single class.
  - **Use with Multiple Inheritance:** Mixins are most effective when used with multiple inheritance, allowing you to "mix in" the desired behavior into a class that already inherits from another base class.

- Practical Use Cases for Mixins
  - Example: Adding Serialization Capabilities
    ```python
    """
    The SerializableMixin class provides methods to serialize an object into a dictionary or JSON format.
    By inheriting from SerializableMixin, the Person class automatically gains these serialization capabilities.
    """
    import json

    class SerializableMixin:
        def to_dict(self):
            return {key: getattr(self, key) for key in self.__dict__}

        def to_json(self):
            return json.dumps(self.to_dict())

    class Person(SerializableMixin):
        def __init__(self, name, age):
            self.name = name
            self.age = age

    p = Person("Alice", 30)
    print(p.to_dict())              # Output: {'name': 'Alice', 'age': 30}
    print(p.to_json())              # Output: {"name": "Alice", "age": 30}
    ```
  - Example: Adding Access Control
    ```python
    class AccessControlMixin:
        def check_access(self, user_role, required_role):
            if user_role != required_role:
                raise PermissionError("Access denied")

    class Document(AccessControlMixin):
        def __init__(self, content, required_role):
            self.content = content
            self.required_role = required_role

        def view(self, user_role):
            self.check_access(user_role, self.required_role)
            return self.content

    doc = Document("Top Secret Document", required_role="admin")
    try:
        print(doc.view("user"))                     # Raises PermissionError
    except PermissionError as e:
        print(e)                                    # Output: Access denied

    print(doc.view("admin"))                        # Output: Top Secret Document
    ```
- Mixins vs. Inheritance
  - Purpose
    - Traditional inheritance is used to create a new class that is a specialized version of an existing class. It represents an "is-a" relationship, where the subclass is a specific type of the superclass.
    - Mixins are used to add specific, reusable pieces of functionality to a class. They do not represent an "is-a" relationship but rather a "has-a" relationship or a "can-do" capability. Mixins are not meant to be standalone classes; they are designed to be used in combination with other classes.
  - Coupling
    - Classes in a traditional inheritance hierarchy are tightly coupled. Changes to the parent class can have wide-reaching effects on all subclasses, which may lead to unintended consequences or require significant refactoring.
    - Mixins allow for loose coupling between the behavior they provide and the classes that use them. Mixins can be added or removed without affecting the overall class hierarchy, making the system more flexible and easier to modify.
  - Inheritance Path
    - Traditional inheritance typically follows a single path, where each class is a specialization of its parent. 
    - Mixins promote composition over inheritance. A class can be composed of multiple mixins, each providing a small piece of functionality. 
  - Example
    ```python
    """
    ElectricCar combines the basic vehicle behavior from Vehicle with logging from LoggerMixin and charging capability from ElectricMixin.
    This approach keeps the code modular and avoids deep inheritance hierarchies.
    """
    class Vehicle:
        def move(self):
            print("Vehicle moves")

    class LoggerMixin:
        def log(self, message):
            print(f"[LOG]: {message}")

    class ElectricMixin:
        def charge(self):
            print("Charging battery")

    class ElectricCar(Vehicle, LoggerMixin, ElectricMixin):
        def drive(self):
            self.log("Driving the electric car")
            print("Electric car drives")

    car = ElectricCar()
    car.move()   # Inherited from Vehicle
    car.charge() # Provided by ElectricMixin
    car.drive()  # Defined in ElectricCar, uses LoggerMixin
    ```
### Creating Custom Immutable Objects
- Introduction to Immutable Objects
  - An immutable object is an object whose data or state cannot be changed after it is created. Once you create an immutable object, you cannot modify its attributes or the contents it holds.
  - Common Immutable Types in Python: `int`, `float`, `str`, `tuple`, `frozenset`, `bytes`
- Example
  ```python
  """
  The ImmutablePoint class is designed to be immutable.
  The __setattr__() method is overridden to prevent any modification of attributes after they are set in the __init__() method.
  If you attempt to modify x or y, an AttributeError is raised.
  """
  class ImmutablePoint:
      def __init__(self, x, y):
          super().__setattr__('x', x)
          super().__setattr__('y', y)

      def __setattr__(self, name, value):
          raise AttributeError("Cannot modify immutable object")

      def __repr__(self):
          return f"ImmutablePoint(x={self.x}, y={self.y})"

  # Creating an immutable point
  p = ImmutablePoint(10, 20)
  print(p)  # Output: ImmutablePoint(x=10, y=20)

  # Attempting to modify an attribute raises an error
  # p.x = 30  # Raises AttributeError: Cannot modify immutable object
  ```
- Using `__new__()` for Immutability: For immutable types like tuples or strings, Python uses the `__new__()` method rather than `__init__()` to create instances. Similar approach can be used in the custom immutable classes.
  ```python
  class ImmutableRectangle:
      def __new__(cls, width, height):
          instance = super().__new__(cls)
          instance._width = width
          instance._height = height
          return instance

      @property
      def width(self):
          return self._width

      @property
      def height(self):
          return self._height

      def __repr__(self):
          return f"ImmutableRectangle(width={self.width}, height={self.height})"

  # Creating an immutable rectangle
  r = ImmutableRectangle(5, 10)
  print(r)  # Output: ImmutableRectangle(width=5, height=10)

  # Attempting to modify the attributes is not possible
  # r.width = 7  # Raises AttributeError because 'width' is a read-only property
  ```
- Properties of Immutable Objects
  - No Need for Deep Copies: Since immutable objects cannot change, copying them is unnecessary. For example, copying a tuple just returns a reference to the original tuple.
    ```python
    t1 = (1, 2, 3)
    t2 = t1
    t3 = t1[:]
    print(t1 is t2)  # Output: True
    print(t1 is t3)  # Output: True
    ```
  - Memory Efficiency: Immutable objects can be more memory-efficient because Python can share references to the same object across different parts of a program.
  - Cacheability: Immutable objects can be cached or memoized, as their state will not change, leading to potential performance improvements.
  - Python interns small integers and strings, reusing them across a program to save memory.
    ```python
    """
    Here, a and b both reference the same integer object 10, and s1 and s2 both reference the same string "hello".
    This reuse of objects is possible because integers and strings are immutable.
    """
    a = 10
    b = 10
    print(a is b)  # Output: True

    s1 = "hello"
    s2 = "hello"
    print(s1 is s2)  # Output: True
    ```

## Best Practices and Tips for OOP in Python
### Design Principles
- **Follow the SOLID Principles:** The SOLID principles are a set of five design principles intended to make software design more understandable, flexible, and maintainable.
- **Use Encapsulation Effectively**
  - Use private (`__`) and protected (`_`) attributes to hide internal state and prevent direct access from outside the class.
  - Provide getter and setter methods to control access to attributes, or use the `@property` decorator to create managed attributes.
- **Favor Composition Over Inheritance:** Composition involves creating classes that are composed of other classes, rather than inheriting from a base class. This allows for more flexible and reusable designs.
  - Use composition when the relationship is more "has-a" than "is-a".
  - Prefer composition for adding functionality, and use inheritance only when there is a clear hierarchical relationship.
- **Keep Classes Small and Focused:** Ensure each class has a single responsibility or a closely related set of responsibilities. Large classes that do too much can be difficult to maintain and understand.
  - If a class is getting too large, consider breaking it down into smaller, more focused classes.
  - Use mixins or helper classes to move unrelated responsibilities out of the main class.
### Code Organization
- Use Modules and Packages to Organize Code
  - **Modules:** Use modules to organize related classes and functions. A module is simply a Python file with a `.py` extension, and it should contain code that is related in functionality.
  - **Packages:** Use packages to group related modules together. A package is a directory containing a special `__init__.py` file, along with one or more modules. Packages allow for better code organization in larger projects.
- **Follow the Python Naming Conventions:** Follow Python’s PEP 8 style guide for naming classes, methods, variables, and modules. Consistent naming makes your code more readable and easier to understand.
  - Use CamelCase for class names (e.g., MyClass).
  - Use snake_case for method and variable names (e.g., my_method, my_variable).
  - Keep module names short and lowercase (e.g., utils.py).
- **Keep the Interface Clean** : Define a clear and minimal public interface for your classes. Avoid exposing unnecessary details to the user of the class.
  - Use private and protected attributes to hide internal details.
  - Only expose methods and attributes that are essential for using the class.
- **Separation of Concerns:** Ensure that each part of your code has a specific responsibility. This can involve separating business logic, data access, and user interface code into different layers or modules.
  - Use patterns like MVC (Model-View-Controller) to separate different concerns in your application.
  - Keep business logic in service or manager classes, separate from data access code or user interface code.
### Practical Tips for Writing OOP Code
- **Use Properties to Control Attribute Access:** Use properties to control how attributes are accessed and modified, especially if you need to enforce constraints or trigger side effects when an attribute is set.
- **Leverage Python’s Special Methods:** Python’s special methods (also known as dunder methods) allow you to define how objects of your class behave in certain operations, such as addition, comparison, and string representation.
  - Implement `__str__()` and `__repr__()` to provide meaningful string representations of your objects.
  - Implement comparison methods like `__eq__()`, `__lt__()`, and `__hash__()` to enable object comparison and usage in sets and dictionaries.
- **Avoid Premature Optimization:** Focus on writing clean, readable code before worrying about optimization. Premature optimization can lead to complex code that is difficult to maintain.
  - Write code that is clear and easy to understand. Optimize only if there is a proven performance issue.
    - Example
      ```python
      # Clear and simple code
      squares = [x * x for x in range(10)]

      # Avoid unnecessary complexity
      squares = [pow(x, 2) for x in range(10)]
      ```
- **Avoid Overengineering:** Avoid adding unnecessary layers of abstraction or complexity to your code. Overengineering can make the code harder to understand and maintain.
  - Use simple inheritance hierarchies and avoid deep inheritance chains.
  - Only add complexity when it solves a real problem or improves code clarity.
- **Use Docstrings to Document Your Code:** Use docstrings to document your classes, methods, and modules. This makes your code more maintainable and easier for others (and your future self) to understand.
- **Use Abstract Base Classes (ABCs):** Abstract Base Classes provide a way to define a common interface for a group of classes. Use them when you want to ensure that all subclasses implement certain methods.
### Testing and Debugging
- **Write Unit Tests:** Write unit tests for your classes to ensure that they behave as expected. Testing helps catch bugs early and makes your code more reliable.
- **Write Unit Tests:** Write unit tests for your classes to ensure that they behave as expected. Testing helps catch bugs early and makes your code more reliable.
- **Use Logging for Debugging and Monitoring:** Use logging to track the execution of your program and diagnose issues. Logging provides insight into how your code is running and can help identify problems.
  - Use the logging module to log messages at different levels (DEBUG, INFO, WARNING, ERROR, CRITICAL).
  - Avoid using print() statements for debugging; logging is more flexible and can be configured to write to different outputs.
### Performance Considerations
- **Object Creation:** Creating and destroying objects can be costly in terms of memory and performance. Be mindful of how often objects are created, especially in tight loops or high-performance sections of your code.
  - Consider using object pools or reusing objects where appropriate.
  - Avoid unnecessary object creation inside loops.
- **Optimize with Built-In Data Structures:** Use Python’s built-in data structures (`list`, `dict`, `set`, `tuple`) efficiently. They are optimized for performance and should be preferred over custom implementations unless necessary.
  - Avoid unnecessary conversions between data structures.
- **Profile and Optimize Bottlenecks:** Use profiling tools (eg `cProfile`, `timeit`) to identify performance bottlenecks in your code. Optimize only the parts of the code that are proven to be slow.
### Collaboration and Code Maintenance
- **Write Clear and Understandable Code:** Prioritize writing clear and understandable code. Clear code is easier for others to read, understand, and maintain.
  - Use meaningful variable and method names.
  - Avoid writing overly clever or obscure code.
- **Keep Your Code DRY (Don’t Repeat Yourself):** Avoid duplicating code. Reuse code through functions, classes, and modules to reduce redundancy and make maintenance easier.
  - If you find yourself copying and pasting code, consider refactoring it into a reusable function or method.
  - Use inheritance or mixins to share behavior across classes.

# Exception Handling

## Exceptions
### Introdution to Exceptions
- An exception is an event that occurs during the execution of a program that disrupts the normal flow of instructions.
- In Python, exceptions are objects that represent these error conditions.
- **Built-in Exceptions**
  - **Base Exceptions:** These are the fundamental exceptions that all other exceptions derive from.
    - `BaseException`: The base class for all built-in exceptions.
    - `SystemExit`: Raised by the `sys.exit()` function.
    - `KeyboardInterrupt`: Raised when the user hits the interrupt key (usually Ctrl+C).
    - `GeneratorExit`: Raised when a generator's `close()` method is called.
  - **Standard Error Exceptions:** is the base class for most built-in exceptions, excluding system-exiting exceptions.
    - `Exception`: The base class for most built-in exceptions.
  - **Arithmetic Errors**
    - `ArithmeticError`: The base class for arithmetic errors.
      - `FloatingPointError`: Raised when a floating point operation fails.
      - `OverflowError`: Raised when a calculation exceeds maximum limit for a numeric type.
      - `ZeroDivisionError`: Raised when dividing by zero.
  - **Lookup Errors**
    - `LookupError`: The base class for lookup errors.
      - `IndexError`: Raised when a sequence index is out of range.
      - `KeyError`: Raised when a dictionary key is not found.
  - **Import Errors**
    - `ImportError`: Raised when an import fails.
      - `ModuleNotFoundError`: Raised when a module cannot be found.
  - **Attribute Errors**
    - `AttributeError`: Raised when attribute reference or assignment fails.
  - **OS and System Errors:** Exceptions related to operating system or system-related issues.
    - `OSError`: The base class for all OS-related errors.
      - `BlockingIOError`: Raised when an operation would block on an object (e.g., socket).
      - `ChildProcessError`: Raised when a child process fails.
      - `ConnectionError`: The base class for connection-related errors.
        - `BrokenPipeError`: Raised when a pipe is broken.
        - `ConnectionAbortedError`: Raised when a connection is aborted.
        - `ConnectionRefusedError`: Raised when a connection is refused.
        - `ConnectionResetError`: Raised when a connection is reset by the peer.
      - `FileExistsError`: Raised when trying to create a file or directory that already exists.
      - `FileNotFoundError`: Raised when a file or directory is requested but cannot be found.
      - `InterruptedError`: Raised when a system call is interrupted.
      - `IsADirectoryError`: Raised when a directory is expected but a file is found.
      - `NotADirectoryError`: Raised when a file is expected but a directory is found.
      - `PermissionError`: Raised when trying to perform an operation without the necessary permissions.
      - `ProcessLookupError`: Raised when a process cannot be found.
      - `TimeoutError`: Raised when a system function times out.
  - **Assertion and Integrity Errors:** Exceptions raised for logical integrity or consistency errors.
    - `AssertionError`: Raised when an assert statement fails.
    - `MemoryError`: Raised when an operation runs out of memory.
    - `ReferenceError`: Raised when a weak reference is used in an inappropriate context.
    - `RuntimeError`: Raised when an error is detected that doesn't fall into any specific category.
      - `NotImplementedError`: Raised when an abstract method that needs to be implemented is not.
      - `RecursionError`: Raised when the maximum recursion depth is exceeded.
  - **Syntax and Parsing Errors:** Exceptions related to syntax or parsing issues.
    - `SyntaxError`: Raised when the parser encounters a syntax error.
      - `IndentationError`: Raised when indentation is not correct.
        - `TabError`: Raised when tabs and spaces are mixed in indentation.
    - `SystemError`: Raised when the interpreter detects an internal error.
  - **Type and Value Errors:** Exceptions related to incorrect types or values.
    - `TypeError`: Raised when an operation or function is applied to an object of inappropriate type.
    - `ValueError`: Raised when a function receives an argument of the correct type but an inappropriate value.
    - `UnicodeError`: The base class for Unicode-related encoding/decoding errors.
      - `UnicodeDecodeError`: Raised when a Unicode decoding error occurs.
      - `UnicodeEncodeError`: Raised when a Unicode encoding error occurs.
      - `UnicodeTranslateError`: Raised when a Unicode translation error occurs.
  - **Warnings:** Categories of warnings for different levels of concern.
    - `Warning`: The base class for all warning categories.
      - `DeprecationWarning`: Raised for deprecated features.
      - `PendingDeprecationWarning`: Raised for features that are deprecated but not yet removed.
      - `RuntimeWarning`: Raised for runtime warnings (e.g., deprecated features).
      - `SyntaxWarning`: Raised for syntax-related warnings.
      - `UserWarning`: Raised for user-defined warnings.
      - `FutureWarning`: Raised for warnings about changes that will happen in the future.
      - `ImportWarning`: Raised for warnings related to module imports.
      - `UnicodeWarning`: Raised for warnings related to Unicode.
      - `BytesWarning`: Raised when a bytes-related warning occurs.
      - `ResourceWarning`: Raised for resource usage warnings (e.g., unclosed files).
  - **Iteration and Generator Errors:** Exceptions raised during iteration or by generators.
    - `StopIteration`: Raised to signal the end of an iterator.
    - `StopAsyncIteration`: Raised to signal the end of an asynchronous iterator.
    - `GeneratorExit`: Raised when a generator or coroutine is closed.
  - **System-Related Exceptions:** Special exceptions related to system behavior.
    - `SystemExit`: Raised by the sys.exit() function.
    - `KeyboardInterrupt`: Raised when the user hits the interrupt key (Ctrl+C).
    - `GeneratorExit`: Raised when a generator or coroutine’s close() method is called.
- **Exception Hierarchy**
  - **Base Classes:** All built-in exceptions in Python inherit from the `BaseException` class. The most common base class for exceptions is `Exception`.
  - Hierarchy Example
    ```plaintext
    BaseException
    └── Exception
      ├── ArithmeticError
      │   └── ZeroDivisionError
      └── LookupError
          ├── IndexError
          └── KeyError
    ```
- **Raising Exceptions:** `raise` Statement is used to explicitly trigger an exception in Python. This is useful when you want to enforce certain conditions in your code.
  ```python
  def divide(a, b):
      if b == 0:
          raise ZeroDivisionError("Cannot divide by zero")
      return a / b

  print(divide(10, 0))          # Raises ZeroDivisionError
  print(divide(10, 2))          # Output: 5.0
  ```
### Handling Exceptions
- **The try-except Block:** 
  - The `try` block lets you test a block of code for errors. The except block lets you handle the error.
    ```python
    try:
        result = 10 / 0
    except ZeroDivisionError:
        print("Cannot divide by zero")
    ```
  - **Multiple Exceptions:** handle multiple exceptions by specifying multiple `except` blocks.
    ```python
    try:
        value = int("abc")
    except ValueError:
        print("Conversion error: Value is not a number")
    except TypeError:
        print("Type error: Invalid type")
    ```
  - **The else Block:** is executed if the `try` block does not raise an exception. It’s useful for code that should run only if no exceptions occur.
    ```python
    try:
      result = 10 / 2
    except ZeroDivisionError:
        print("Cannot divide by zero")
    else:
        print(f"Result is {result}")        # Output: Result is 5.0
    ```
  - **The finally block:** is executed no matter what—whether an exception occurs or not. It’s typically used to clean up resources (e.g., closing files or database connections).
    ```python
    try:
        file = open("example.txt", "r")
    except FileNotFoundError:
        print("File not found")
    finally:
        file.close()                  # Ensures the file is closed even if an exception occurs
    ```
### Catching Specific Exceptions
- Catching Multiple Exceptions in One Block
  ```python
  try:
      x = int(input("Enter a number: "))
      y = 10 / x
  except (ValueError, ZeroDivisionError) as e:
      print(f"Error occurred: {e}")
  ```
- Catching All Exceptions using `Exception`. However, this is generally discouraged.
  ```python
  try:
      result = some_undefined_function()
  except Exception as e:
      print(f"An error occurred: {e}")
  ```
### Creating Custom Exceptions
- Defining Custom Exceptions: Custom exceptions are typically subclasses of `Exception`. This allows you to create meaningful, application-specific error types.
- Example
  ```python
  class InsufficientFundsError(Exception):
      def __init__(self, balance, amount):
          self.balance = balance
          self.amount = amount
          super().__init__(f"Insufficient fund: {amount}, but balance is only {balance}")

  def withdraw(balance, amount):
      if amount > balance:
          raise InsufficientFundsError(balance, amount)
      return balance - amount

  try:
      balance = withdraw(100, 150)
  except InsufficientFundsError as e:
      print(e)                # Output: Attempted to withdraw 150, but balance is only 100
  ```
### Advanced Exception Handling Techniques
- **Using the with Statement for Resource Management:** The `with` statement in Python simplifies resource management by automatically handling exceptions and ensuring that resources are cleaned up.
  ```python
  with open("example.txt", "r") as file:
      data = file.read()
  # The file is automatically closed when the block is exited
  ```
- **Custom Context Managers:** You can create custom context managers using the `contextlib` module or by implementing the `__enter__()` and `__exit__()` methods.
  ```python
  from contextlib import contextmanager

  @contextmanager
  def open_file(filename, mode):
      file = open(filename, mode)
      try:
          yield file
      finally:
          file.close()

  with open_file("example.txt", "w") as file:
      file.write("Hello, World!")
  ```
- **Exception Chaining with from:** Python allows you to chain exceptions using the `from` keyword, making it easier to understand the sequence of events that led to an error.
  ```python
  """
  This technique preserves the original exception while raising a new one, providing more context for debugging.
  """
  try:
      result = 10 / 0
  except ZeroDivisionError as e:
      raise ValueError("Invalid calculation") from e
  ```

# Python Modules and Packages
  - Modules
    - Creating and importing custom modules.
    - Importing specific functions or classes from a module.
    - Understanding the `__name__` variable.
  - Standard Library Modules
    - Overview of important modules: `math`, `random`, `time`, `os`, `sys`.
    - Practical examples using these modules in competitive programming.
  - Packages
    - Creating and using packages.
    - `__init__.py` file and its significance.
    - Understanding relative imports.

# Advanced Data Structures and Algorithms in Python
  - Heaps
    - Introduction to `heapq` module.
    - Implementing min-heap and max-heap.
    - Practical problems using heaps: Kth largest/smallest elements, priority queues.
  - Deque
    - Introduction to `collections.deque`.
    - Advantages of deque over list for append and pop operations.
    - Sliding window problems using deque.
  - Sorting
    - Built-in sorting functions: `sorted()` vs `list.sort()`.
    - Sorting with custom keys: lambda functions.
    - Stability in sorting algorithms.
  - Binary Search
    - Implementing binary search manually.
    - Using `bisect` module for binary search operations.
    - Practical problems: finding insert positions, search intervals.

# Python Standard Libraries
## Itertools and Collections
  - Itertools
    - Permutations and combinations using `permutations()` and `combinations()`.
    - Infinite iterators: `count()`, `cycle()`, `repeat()`.
    - Combinatoric Iterators: `product()`, `permutations()`, `combinations()`, `combinations_with_replacement()`
    - Terminating Iterators: `accumulate()`, `chain()`, `compress()`, `dropwhile()`, `takewhile()`
    - Grouping and Filtering: `groupby()`, `filterfalse()`
    - Practical Applications
     - Generating all possible combinations for brute-force solutions.
     - Efficient looping and filtering in large datasets.
    - Practical use cases in competitive programming.
  - Collections Module
    - Automatic dictionary initialization with default values: defaultdict
    - Counting frequency of elements efficiently: Counter
    - Maintaining insertion order in dictionaries: OrderedDict
  - Custom Iterators
    - Creating custom iterator classes with `__iter__()` and `__next__()`.
    - Practical examples: infinite sequences, stateful iterators.
  - Generator Functions
    - Understanding the difference between generator functions and generator expressions.
    - Use cases in lazy evaluation and large data processing.

## Regular Expressions (Regex)
  - Introduction to Regex
    - Basics of regular expressions: literals, metacharacters, and character classes.
    - Compiling regex patterns using `re` module.
  - Pattern Matching
    - Using `match()`, `search()`, and `findall()`.
    - Practical examples: extracting data, validating inputs.
  - Groups and Backreferences
    - Using capture groups for complex matching.
    - Named groups and accessing matched groups.
  - Substitution and Splitting
    - Using `sub()` for pattern substitution.
    - Splitting strings with `split()`.

## `collections` Module
  - Automatic dictionary initialization: `defaultdict`
  - Counting elements in an iterable: `Counter`
  - Double-ended queue (`deque`) operations: `append()`, `appendleft()`, `pop()`, `popleft()`.
  - Maintaining insertion order in dictionaries: `OrderedDict`
  - Creating lightweight, immutable objects: `namedtuple`

## `functools` Module
   - Higher-Order Functions
     - Using `reduce()` for cumulative operations.
     - Function composition with `partial()`.
   - Memoization
     - Implementing memoization with `@lru_cache` decorator.
     - Applications in dynamic programming problems.
   - Comparison Functions
     - Custom sorting with `cmp_to_key()`.
   - Practical Applications
     - Optimizing recursive solutions with memoization.
     - Reducing boilerplate code with `partial()`.

## `operator` Module
   - Arithmetic Operators: `add()`, `sub()`, `mul()`, `truediv()`, `floordiv()`
   - Logical operations: `and_()`, `or_()`, `not_()`
   - Itemgetter and Attrgetter
   - Comparison Functions: `eq()`, `ne()`, `lt()`, `le()`, `gt()`, `ge()`

## `bisect` Module
   - Binary Search Operations
     - `bisect_left()` and `bisect_right()` for finding insertion points.
     - `insort_left()` and `insort_right()` for inserting elements.

## `random` Module
   - Basic Random Number Generation
     - Generating random integers, floating-point numbers.
   - Shuffling sequences with `shuffle()`.
   - Probability Distributions: Generating numbers from specific distributions: `uniform()`, `normalvariate()`, `betavariate()`.
   - Random Sampling
     - Sampling without replacement using `sample()`.
     - Choosing random elements with `choice()`.

## `typing` Module

## `time` and `datetime` Modules
   - Time Handling
     - Using `time()` for performance measurement.
     - Sleep intervals with `sleep()`.
   - Date and Time Manipulation
     - Creating and formatting dates with `datetime`.
     - Date arithmetic: adding and subtracting time periods.
   - Performance Measurement
     - Using `timeit` for precise benchmarking.
     - Profiling code execution time.
   - Practical Applications
     - Benchmarking solutions in competitive programming.
     - Managing time constraints in real-time scenarios.

## `sys` and `os` Modules
   - System-Specific Parameters
     - Accessing command-line arguments with `sys.argv`.
     - Using `sys.stdin` and `sys.stdout` for fast I/O.
   - OS Operations
     - Handling file paths with `os.path`.
     - Working with environment variables.
     - Directory and file manipulation: `listdir()`, `mkdir()`, `remove()`.
   - Practical Applications
     - Fast I/O handling in competitive programming.
     - Managing environment-specific settings.

# Comprehensions and Generator Expressions
  - List Comprehensions
    - Advanced use cases with conditionals and nested loops.
    - Performance considerations compared to traditional loops.
  - Dictionary and Set Comprehensions
    - Creating dictionaries and sets using comprehensions.
    - Examples: frequency counts, reversing dictionaries.
  - Generator Expressions
    - Creating generator expressions for memory-efficient looping.
    - Use cases in large data processing tasks.

# Multithreading and Concurrency
  - Introduction to Multithreading
    - Understanding threading and multiprocessing in Python.
    - The `threading` module and creating threads.
  - Concurrency in Python
    - Introduction to concurrent programming.
    - Using `concurrent.futures` for parallel execution.
  - Synchronization Primitives
    - Locks, Semaphores, and Conditions.
    - Using `Queue` for thread-safe data exchange.
  - Practical Applications
    - Parallelizing algorithms for better performance.
    - Case studies in competitive programming scenarios.

# Python Debugging and Testing
  - Debugging Techniques
    - Using `print()` for debugging vs proper debugging tools.
    - Introduction to Python debugger: `pdb`.
    - Setting breakpoints, stepping through code, inspecting variables.
  - Writing Test Cases
    - Introduction to `unittest` framework.
    - Writing unit tests for functions and modules.
    - Understanding `assert` statements and exception testing.
  - Test-Driven Development (TDD)
    - Concept of TDD and its benefits.
    - Writing tests before coding.
  - Profiling and Optimization
    - Using `cProfile` for performance profiling.
    - Identifying bottlenecks and optimizing code.
    - Memory profiling with `memory_profiler`.

# Working with Files and I/O Optimization
  - File Handling
    - Reading from and writing to files.
      - Opening files with `open()`: modes (`r`, `w`, `a`, `b`).
      - Reading from files: `read()`, `readline()`, `readlines()`.
      - Writing to files: `write()`, `writelines()`.
      - Using `with` statement for automatic file closure.
    - Reading large files efficiently: line by line processing.
  - File Operations
    - Checking file existence and properties: `os.path.exists()`, `os.path.getsize()`.
    - Renaming and deleting files with `os.rename()`, `os.remove()`.
  - Working with Directories
    - Creating and removing directories with `os.mkdir()`, `os.rmdir()`.
    - Listing directory contents with `os.listdir()`.
  - Efficient Input and Output in Competitive Programming
    - Using `sys.stdin` and `sys.stdout` for fast I/O.
    - Buffering input and output for speed.
  - Understanding Buffering
    - Implications of buffered vs unbuffered I/O.
    - Using `flush()` and controlling buffer behavior.

# Advanced Functionality and Python Tricks
  - Decorators
    - Syntax for creating and applying decorators.
    - Common use cases: logging, memoization, access control.
  - Generators
    - Creating generators using `yield`.
    - Advantages of generators for memory efficiency.
    - Example: Infinite sequences, processing large datasets.
  - Context Managers
    - Using the `with` statement beyond file handling.
    - Writing custom context managers with `__enter__` and `__exit__` methods.
    - Practical examples: managing resources, setting up and tearing down environments.

# Problem Solving Practice
  - Implementing Competitive Programming Problems
    - Practice problems covering key topics: recursion, dynamic programming, searching, sorting.
    - Focus on optimizing time and space complexity.
  - Identifying and Avoiding Common Pitfalls
    - Handling Python’s dynamic typing pitfalls.
    - Recognizing when Python’s flexibility might introduce performance issues.
  - Real-world Competitive Programming Scenarios
    - Understanding constraints and edge cases.
    - Practical tips for debugging and testing solutions.

# Python for Competitive Programming: Best Practices
  - Code Structuring and Organization
    - Writing clean and maintainable code.
    - Organizing code into functions, classes, and modules.
    - Documenting code with comments and docstrings.
  - Effective Use of Python’s Standard Library
    - Leveraging Python’s extensive standard library.
    - Case studies on using standard library for common competitive programming problems.
  - Avoiding Common Python Pitfalls
    - Mutable default arguments.
    - Understanding Python’s pass-by-object-reference model.
    - Pitfalls with floating-point arithmetic.
  - Performance Considerations
    - Choosing the right data structures for the task.
    - Minimizing time complexity in Python’s dynamic environment.
    - Space complexity considerations in recursive and iterative solutions.

# Interview Questions
## Datatypes
- Categorize Python datatypes based on their mutability.
  - Immutable: `int`, `float`, `str`, `tuple`
  - Mutable: `list`, `dict`, `set`
- Explain the arguments of `range` function
  - `range` function takes 3 arguments: `start`, `end`, and `step`
  - `start` is inclusive, whereas `end` is exclusive
  - default value of `start` is 0, whereas that of `step` is 1
- Is `None` same as an Empty Sequences?
  - x = []
  - print(x == None)  # False
  - print(x == [])    # True
- What error does Python throw in case value type is not same as hinted for the variable?
  - Type hints are not enforced by Python itself; they are only suggestions. If type hints are ignored, Python will not throw an error by default.
  - x: int = "hi"  # does not result into an error
- What should be the default value, in case we pass a mutable value to a Python function?
  - Use `None` as the default value and create a new list inside the function.
    - Example:
      - def append_to_list(value, my_list=[]):
          my_list.append(value)
          return my_list
        print(append_to_list(1))  # [1]
        print(append_to_list(2))  # [1, 2] - Same list is reused!
- What is Floating-Point Precision Issues in Python?
  - Issue Explanation
    - Floating-point numbers in Python (and most other programming languages) are represented using a format defined by the IEEE 754 standard. This standard is designed to represent a wide range of real numbers, but it does so using a finite amount of memory, which means it cannot represent all real numbers exactly.
    - Binary Representation of Floats: Computers store numbers in binary (base-2). While integers can be represented exactly in binary, many decimal fractions (base-10) cannot be represented precisely in binary.
      - For example, the decimal number 0.1 does not have an exact representation in binary. When 0.1 is converted to binary, it becomes an infinitely repeating fraction (something like 0.000110011001100110011...).
    - Imprecision in Representation: Because binary representation of some decimal fractions is not exact, when Python stores these fractions in memory, it has to truncate the binary representation to fit within the allocated memory (usually 64 bits for a float). This truncation leads to a small error in the stored value.
      - For instance, 0.1 in Python might be stored as something like 0.10000000000000000555, which is very close to but not exactly 0.1.
    - Cumulative Errors: When performing arithmetic operations on floating-point numbers, these small inaccuracies can accumulate, leading to results that are slightly off.
      - print(0.1 + 0.2)  # 0.30000000000000004
    - Comparison Issues: Because of these precision errors, comparing floating-point numbers for equality can lead to unexpected results.
      - print(0.1 + 0.2 == 0.3)  # False; 0.1 + 0.2 = 0.30000000000000004
  - Fix
    - Rounding
      - print(round(0.1 + 0.2, 2) == 0.3)  # True
    - Using a Tolerance for Comparisons
      - tolerance = 1e-9
      - print(abs((0.1 + 0.2) - 0.3) < tolerance)  # True
    - Decimal Module: allows for more precise control over arithmetic operations and can be used when high precision is required.
      - print(Decimal('0.1') + Decimal('0.2'))  # Exactly 0.3
- Why to use `typing` library instead of built-in datatypes?
  - The typing library in Python is used to provide type hints that are more expressive and flexible than the basic built-in data types like int, str, list, etc.
  - Enhanced Type Definitions: The typing library allows you to define more complex and precise types than just using the basic types alone.
    - Generic Types
      - Basic types like list or dict only specify the container type but not the type of elements inside the container. Using typing.List or typing.Dict allows you to specify the type of elements they contain.
        - def process_numbers(numbers: List[int]) -> None:
        - def count_occurrences(words: Dict[str, int]) -> None:
      - Union Types: Sometimes a variable can be of multiple types. Using Union from the typing library allows you to express this.
        - def process(value: Union[int, float]) -> float:
      - Optional Types: is used to indicate that a variable can either be of a specific type or `None`.
        - def greet(name: Optional[str] = None) -> str:
    - Custom and Complex Types
      - `typing` library allows you to define custom types, which can help to make the code more readable and easier to manage
        - Type Aliases: You can create type aliases for more complex types to make your code more readable.
          - Coordinate = Tuple[int, int]
            Path = List[Coordinate]
            def calculate_path(path: Path) -> None:
        - Generic Types and Type Variables: TypeVar and generics allow you to define functions or classes that work with any type but still provide type safety.
          - from typing import TypeVar, List
            T = TypeVar('T')
            def get_first_element(elements: List[T]) -> T:
- What happens when user inputs a value that can not be typecasted to the type provided. eg inserting name in place of `int` age
  - It returns in a `ValueError`
  - Use `try-except` blocks to handle invalid inputs gracefully.
- Can we have a `list` as an element of a `set`?
  - Sets cannot contain mutable elements like `lists` or `dictionaries` because they are not hashable. 
  - my_set = {1, 2, 3}
    my_set.add([4, 5])  # TypeError: unhashable type: 'list'

- What is the difference between `remove()` and `discard()` set methods?
  - The `remove()` method raises a `KeyError` if the element is not found, whereas `discard()` does not. 
- Why is string concatenation in a loop considered bad idea in Python?
  - Concatenating strings in a loop using + can be inefficient because each concatenation creates a new string, leading to quadratic time complexity.
    - result = ""
      for i in range(10):
        result += str(i)  # Inefficient
      print(result)  # Output: '0123456789'
  - Solution is to use a list to collect strings and then join them.
    - result = []
      for i in range(10):
        result.append(str(i))
      print("".join(result))  # Output: '0123456789'
- If strings are immutable, how can we get an updated string?
  - text = "Hello"
    new_text = "h" + text[1:]
    print(new_text)  # Output: 'hello'






Multiplier Interviews
1. peer programming (dsa)
2. technical discussion
3. design system

1. Base
2. eSOPs
3. Var (upto 10% of annual package)