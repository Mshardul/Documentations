
- [Defining Functions](#defining-functions)
  - [Function Syntax](#function-syntax)
    - [Syntax](#syntax)
    - [Explanation](#explanation)
  - [Function Arguments](#function-arguments)
    - [Positional Arguments](#positional-arguments)
    - [Keyword Arguments](#keyword-arguments)
    - [Default Arguments](#default-arguments)
    - [Variable-Length Arguments](#variable-length-arguments)
    - [Unpacking Arguments](#unpacking-arguments)
    - [Keyword-Only Arguments](#keyword-only-arguments)
- [Scope and Lifetime of Variables](#scope-and-lifetime-of-variables)
  - [Local Scope for Local Variables](#local-scope-for-local-variables)
    - [Basics](#basics)
    - [Example](#example)
  - [Enclosing (Non-Local) Scope:](#enclosing-non-local-scope)
    - [Basics](#basics-1)
    - [Example](#example-1)
  - [Global Scope for Global Variables](#global-scope-for-global-variables)
    - [Basics](#basics-2)
    - [Example](#example-2)
  - [Built-in Scope](#built-in-scope)
    - [Basics](#basics-3)
    - [Example](#example-3)
  - [LEGB Rule:](#legb-rule)
  - [Modifying Variable Scopes](#modifying-variable-scopes)
    - [The `global` Keyword:](#the-global-keyword)
    - [The `nonlocal` Keyword](#the-nonlocal-keyword)
- [Higher-Order Functions](#higher-order-functions)
  - [A higher-order function](#a-higher-order-function)
    - [Definition](#definition)
  - [Functions as First-Class Citizens](#functions-as-first-class-citizens)
    - [Basics](#basics-4)
    - [Example](#example-4)
  - [Returning Functions from Functions](#returning-functions-from-functions)
    - [Basics](#basics-5)
    - [Example](#example-5)
  - [Common Higher-Order Functions in Python](#common-higher-order-functions-in-python)
    - [`map()`:](#map)
    - [`filter()`](#filter)
    - [`reduce()`](#reduce)
    - [`any()`:](#any)
    - [`all()`](#all)
    - [`zip()`](#zip)
    - [`enumerate()`](#enumerate)
    - [`reversed()`](#reversed)
    - [`sorted()` with `key` Function](#sorted-with-key-function)
- [Closures](#closures)
  - [Introduction to Closures](#introduction-to-closures)
    - [Basics](#basics-6)
    - [Example](#example-6)
  - [Importance of Closures](#importance-of-closures)
  - [Closure Retaining State](#closure-retaining-state)
    - [Example](#example-7)
  - [How Closures Work](#how-closures-work)
    - [Lixical Scoping](#lixical-scoping)
    - [Persistent Local Variables](#persistent-local-variables)
  - [Practical Applications of Closures](#practical-applications-of-closures)
    - [Function Factories](#function-factories)
    - [Data Encapsulation](#data-encapsulation)
    - [Implementing Decorators](#implementing-decorators)
  - [The `nonlocal` Keyword and Closures:](#the-nonlocal-keyword-and-closures)
    - [The `nonlocal` keyword](#the-nonlocal-keyword-1)
  - [Benefits of closures](#benefits-of-closures)
  - [Limitations of closures](#limitations-of-closures)
  - [Comparison with other concepts for state retention](#comparison-with-other-concepts-for-state-retention)
    - [Closures vs. Global Variables](#closures-vs-global-variables)
    - [Closures vs. Objects (OOP)](#closures-vs-objects-oop)
- [Lambda Expressions](#lambda-expressions)
  - [Introduction to Lambda Expressions](#introduction-to-lambda-expressions)
    - [Basics](#basics-7)
    - [Syntax](#syntax-1)
    - [Example](#example-8)
  - [Common Use Cases of Lambda Expressions](#common-use-cases-of-lambda-expressions)
    - [As Arguments to Higher-Order Functions](#as-arguments-to-higher-order-functions)
    - [In Sorting Operations](#in-sorting-operations)
    - [In Place of Short Functions](#in-place-of-short-functions)
  - [Limitations of Lambda Expressions](#limitations-of-lambda-expressions)
  - [Lambda Expressions vs. Regular Functions](#lambda-expressions-vs-regular-functions)
    - [Use Lambda when](#use-lambda-when)
    - [Use Function when](#use-function-when)
- [Decorators](#decorators)
  - [Introduction to Decorators](#introduction-to-decorators)
    - [Basics](#basics-8)
    - [Synax](#synax)
    - [Example](#example-9)
  - [How Decorators Work](#how-decorators-work)
    - [Higher-Order Functions and Closures](#higher-order-functions-and-closures)
    - [The `@` Syntax](#the--syntax)
  - [Common Use Cases of Decorators](#common-use-cases-of-decorators)
    - [Logging](#logging)
    - [Access Control and Authentication](#access-control-and-authentication)
    - [Caching Results](#caching-results)
    - [Timing Functions](#timing-functions)
  - [Decorators with Arguments](#decorators-with-arguments)
    - [Example: Repeated Execution](#example-repeated-execution)
  - [Chaining Decorators](#chaining-decorators)
    - [Basics](#basics-9)
    - [Example](#example-10)
  - [Maintaining Function Metadata](#maintaining-function-metadata)
    - [Basics](#basics-10)
    - [Example](#example-11)
  - [Decorators in Class Methods](#decorators-in-class-methods)
    - [Basics](#basics-11)
    - [Example](#example-12)
- [Recursion](#recursion)
  - [Introduction to Recursion](#introduction-to-recursion)
    - [Key Components:](#key-components)
    - [Example: Factorial](#example-factorial)
  - [Advantages of Recursion](#advantages-of-recursion)
  - [Disadvantages of Recursion](#disadvantages-of-recursion)
  - [Tail Recursion](#tail-recursion)
    - [Example](#example-13)
  - [Memoization and Dynamic Programming](#memoization-and-dynamic-programming)
    - [Memoization](#memoization)
    - [Dynamic Programming](#dynamic-programming)

# Defining Functions

## Function Syntax
### Syntax
```python
def function_name(parameters):
    """docstring"""
    # Function body
    # Code to execute
    return value

function_name(arguments)
```
### Explanation
- `def`: This keyword is used to start the function definition.
- `function_name`: A unique identifier for the function. The naming conventions follow the same rules as variable names.
- `parameters`: A comma-separated list of arguments that the function can accept. These are optional, and you can define a function without any parameters.
- `:`: A colon at the end of the function declaration line, indicating the start of the function body.
- `"""docstring"""`: An optional string that describes what the function does.
- Function Body: The indented block of code that performs the function's operations.
- `return`: The keyword used to send a result back to the caller. If no return statement is present, the function returns None by default.
- Arguments: The actual values passed to the function when it is called.

## Function Arguments
### Positional Arguments
- are the most straightforward way to pass values to a function. The arguments are assigned to the parameters in the order in which they are passed. The order of positional arguments is crucial.
```python
def greet(name, message):
    print(f"{message}, {name}!")

greet("Alice", "Hello")                         # Output: Hello, Alice!
```
### Keyword Arguments
- allow you to specify the value of a function parameter by explicitly naming the parameter in the function call.
```python
def greet(name, message):
    print(f"{message}, {name}!")

greet(message="Good morning", name="Bob")       # Output: Good morning, Bob!
```
### Default Arguments
- allow you to define a default value for a parameter. If no argument is passed for that parameter, the default value is used. This makes some parameters optional.
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
### Variable-Length Arguments
- Python provides mechanisms to handle an arbitrary number of arguments using `*args` and `**kwargs`.
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
### Unpacking Arguments
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
### Keyword-Only Arguments
- are parameters that can only be supplied using their name, not as positional arguments. This is enforced by placing an asterisk * before the parameter names.
```python
def greet(name, *, message="Hello"):
    print(f"{message}, {name}!")

greet("Alice", message="Good morning")          # Output: Good morning, Alice!
greet("Alice", "Good morning")                  # Raises TypeError: greet() takes 1 positional argument but 2 were given
```

# Scope and Lifetime of Variables

## Local Scope for Local Variables
### Basics
- A variable defined inside a function or a block is said to have a local scope. This means the variable is accessible only within that function or block where it is defined.
- Local variables are created when the function is called and destroyed when the function execution is finished.
### Example
```python
def my_function():
    x = 10              # x is a local variable
    print(x)
my_function()           # Output: 10
# print(x)              # Raises NameError: name 'x' is not defined
```

## Enclosing (Non-Local) Scope:
### Basics
- Variables defined in the outer function of a nested function are said to have an enclosing scope. These variables are accessible within the nested (inner) function but are not in the global scope.
- Enclosing scope variables can be accessed by inner functions but cannot be directly modified unless explicitly declared using the nonlocal keyword (discussed later).
### Example
```python
def outer_function():
    x = "outer variable"

    def inner_function():
        print(x)             # Accesses x from the enclosing scope
    inner_function()

outer_function()             # Output: outer variable
```

## Global Scope for Global Variables
### Basics
- A variable defined at the top level of a script or module, or explicitly declared as global inside a function, has a global scope. It can be accessed from any function or block within the same module.
- Global variables are created when the program starts and remain in existence until the program terminates.
### Example
```python
x = "global variable"

def my_function():
    print(x)              # Accesses the global variable

my_function()             # Output: global variable
```

## Built-in Scope
### Basics
- Built-in scope refers to the scope of special reserved keywords and functions provided by Python itself, such as print(), len(), range(), etc. These are accessible from any part of the code.
- Built-in scope is always available and cannot be overridden easily without reassigning the built-in names (which is not recommended).
### Example
```python
print(len([1, 2, 3]))     # Uses built-in functions print() and len()
```

## LEGB Rule:
- defines the order in which Python looks for variables:
  - `L: Local` — Variables defined within the current function.
  - `E: Enclosing` — Variables in the local scope of any enclosing functions, especially in nested functions.
  - `G: Global` — Variables defined at the top level of a module or explicitly declared global using the global keyword.
  - `B: Built-in` — Names reserved by Python (like print, len, etc.).

## Modifying Variable Scopes
### The `global` Keyword: 
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
### The `nonlocal` Keyword
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

# Higher-Order Functions

## A higher-order function
### Definition
- is a function that does at least one of the following:
  - Takes one or more functions as arguments.
  - Returns a function as its result.

## Functions as First-Class Citizens
### Basics
- In Python, functions can be passed around as arguments, returned from other functions, and assigned to variables just like any other object.
### Example
```python
def square(x):
    return x * x

def apply_function(func, value):      # apply_function is a higher-order function because it takes another function (square) as an argument.
    return func(value)

result = apply_function(square, 5)
print(result)                         # Output: 25
```

## Returning Functions from Functions
### Basics
- In Python, A function can return another function as its result
### Example
```python
def outer_function(message):                      # outer_function returns inner_function

    def inner_function():
        print(message)

    return inner_function

my_function = outer_function("Hello, World!")
my_function()                                     # Output: Hello, World!
```

## Common Higher-Order Functions in Python
### `map()`:
- Applies a function to all the items in an input list (or other iterable) and returns an iterator.
```python
def square(x):
    return x * x

numbers = [1, 2, 3, 4]
squared_numbers = map(square, numbers)
print(list(squared_numbers))                   # Output: [1, 4, 9, 16]
```
### `filter()`
- Filters the elements in an iterable, returning only those for which the function returns True.
```python
def is_even(x):
    return x % 2 == 0

numbers = [1, 2, 3, 4, 5, 6]
even_numbers = filter(is_even, numbers)
print(list(even_numbers))                     # Output: [2, 4, 6]
```
### `reduce()`
- applies a function cumulatively to the items of an iterable, reducing it to a single value (imported from functools).
```python
from functools import reduce

def multiply(x, y):
    return x * y

numbers = [1, 2, 3, 4]
product = reduce(multiply, numbers)
print(product)                                 # Output: 24
```
### `any()`:
- Returns True if at least one element in the iterable is true.
```python
numbers = [0, 1, 2, 3]
print(any(numbers))           # Output: True
```
### `all()`
- Returns True if all elements in the iterable are true.
```python
numbers = [1, 2, 3, 4]
print(all(numbers))           # Output: True
```
### `zip()`
- Combines elements from multiple iterables into tuples.
```python
names = ["Alice", "Bob", "Charlie"]
scores = [85, 90, 95]
combined = zip(names, scores)
print(list(combined))         # Output: [('Alice', 85), ('Bob', 90), ('Charlie', 95)]
```
### `enumerate()`
- Adds a counter to an iterable, returning an enumerate object.
```python
items = ["apple", "banana", "cherry"]
for index, item in enumerate(items, start=1):
    print(index, item)                          # Output: (1, apple), (2, banana), (3, cherry)
```
### `reversed()`
- Returns a reversed iterator over the elements of a sequence.
```python
numbers = [1, 2, 3, 4]
reversed_numbers = reversed(numbers)
print(list(reversed_numbers))                   # Output: [4, 3, 2, 1]
```
### `sorted()` with `key` Function
- Sorts an iterable based on a key function.
- Syntax
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

# Closures

## Introduction to Closures
### Basics
- A closure is a function that "remembers" the values from its surrounding environment (enclosing scope) even after that environment is gone.
- Imagine a function that creates another function. The created function can still access the variables that were in the scope where it was created, even if those variables are no longer in use.
### Example
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
## Importance of Closures
- Custom Function Generators: Closures are great for creating functions that behave differently based on some initial conditions or settings.
- Data Hiding: Closures allow for encapsulating data (like the factor in the example) that you don't want to expose directly, making your code more modular and secure.
## Closure Retaining State
### Example
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
## How Closures Work
### Lixical Scoping
- means that a function's scope is determined by its position in the source code. The closure "remembers" the scope in which it was created.
  - When inner_function is created in the outer_function, it "captures" the environment at that time, which includes any variables and their values in the outer scope.
### Persistent Local Variables
- In the closure, the variables from the enclosing scope are preserved and can be used even after the outer function has completed.

## Practical Applications of Closures
### Function Factories
- Closures are ideal for creating "function factories" where a general function generates more specific functions with pre-configured settings.
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
### Data Encapsulation
- Closures can encapsulate private data, providing a way to protect or hide certain values within a function.
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
### Implementing Decorators
- Closures are commonly used to implement decorators, which are functions that modify the behavior of other functions.
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

## The `nonlocal` Keyword and Closures:
### The `nonlocal` keyword
- allows you to modify a variable in the enclosing (but non-global) scope of a nested function.
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
## Benefits of closures
- State Retention: Closures allow you to retain state across function calls without relying on global variables.
- Encapsulation: They provide a way to encapsulate private data within functions, protecting it from outside interference.
- Custom Function Creation: Closures are ideal for creating specialized functions with pre-configured settings (like in function factories).
- Functional Programming: They fit well into the functional programming paradigm, allowing functions to be treated as first-class citizens with preserved environments.
## Limitations of closures
- Complexity: Closures can make code harder to understand and debug, especially for beginners, because the connection between the inner and outer functions isn't always obvious.
- Potential for Memory Leaks: If not managed carefully, closures can lead to memory leaks because they keep references to variables that might otherwise be garbage-collected.
- Difficulty in Testing: Testing functions that use closures can be more challenging due to their encapsulated state and dependencies on outer variables.
## Comparison with other concepts for state retention
### Closures vs. Global Variables
- Closures retain local scope, avoiding global state and reducing the risk of side effects. Global variables, in contrast, are accessible everywhere, which can lead to unintended consequences.
### Closures vs. Objects (OOP)
- Closures and objects in object-oriented programming (OOP) can both be used to retain state. However, closures do so in a more functional, lightweight way, while objects encapsulate state and behavior in a more structured form.

# Lambda Expressions

## Introduction to Lambda Expressions
### Basics
- A lambda expression is a small, anonymous function.
  - Defined using the `lambda` keyword, Unlike regular functions defined with `def`
  - lambda functions are defined in a single line of code and can have any number of input parameters but only one expression.
  - Anonymous: Lambda functions do not have a name (unless you assign them to a variable).
  - Single Expression: The body of a lambda function is limited to a single expression.
  - Immediate Use: Often used where a small function is needed for a short period.
### Syntax
```python
lambda arguments: expression
```
### Example
```python
"""
Here, lambda x, y: x + y creates a function that takes two arguments, x and y, and returns their sum.
The lambda function is assigned to add, which can then be called like a regular function.
"""

add = lambda x, y: x + y
print(add(2, 3))              # Output: 5
```

## Common Use Cases of Lambda Expressions
### As Arguments to Higher-Order Functions
- Lambda expressions are often used as arguments to higher-order functions like `map()`, `filter()`, `sorted()`, and `reduce()`.
  ```python
  numbers = [1, 2, 3, 4]
  squared = map(lambda x: x * x, numbers)
  print(list(squared))                                      # Output: [1, 4, 9, 16]
  even_numbers = filter(lambda x: x % 2 == 0, numbers)
  print(list(even_numbers))                                 # Output: [2, 4]
  ```
### In Sorting Operations
- Lambda functions are useful in custom sorting, where the key parameter of the sorted() function requires a function to determine the sort order.
  ```python
  words = ["apple", "banana", "cherry", "date"]
  sorted_words = sorted(words, key=lambda x: len(x))
  print(sorted_words)                                       # Output: ['date', 'apple', 'banana', 'cherry']
  ```
### In Place of Short Functions
- For functions that are simple enough to be expressed in one line, lambda functions can be used instead of defining a full function with `def`.
  ```python
  def apply_twice(func, arg):
      return func(func(arg))

  result = apply_twice(lambda x: x * 2, 5)
  print(result)                                             # Output: 20
  ```
## Limitations of Lambda Expressions
- Single Expression Limitation: A lambda function is limited to a single expression. You cannot include multiple statements or complex logic within a lambda function.
- Lack of Documentation and Readability: Lambda functions, being anonymous and concise, can sometimes make code less readable, especially for complex operations.
  ```python
  # A more complex lambda might be harder to understand
  result = reduce(lambda acc, x: acc + x if x % 2 == 0 else acc, [1, 2, 3, 4, 5], 0)
  ```
- Debugging Difficulty: Since lambda functions are anonymous and typically used inline, they can be harder to debug compared to named functions.
## Lambda Expressions vs. Regular Functions
### Use Lambda when
- you need a small function for a short period.
- the function is simple enough to fit in a single expression.
- you need to pass a function as an argument to another function and it won’t be reused elsewhere.
### Use Function when
- the function has complex logic, multiple statements, or requires extensive documentation.
- you need to reuse the function in multiple places.
- readability is a priority.

# Decorators

## Introduction to Decorators
### Basics
- A decorator is a function that takes another function as an argument, extends or alters its behavior, and returns a new function with the enhanced or modified behavior.
- Imagine you have a function that does something specific, and you want to add extra functionality before or after that function runs (like logging, timing, or checking permissions). Instead of modifying the original function, you can "wrap" it with a decorator that adds the extra functionality.
### Synax
```python
@decorator_name
def function_to_decorate():
    pass
```
### Example
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

## How Decorators Work
### Higher-Order Functions and Closures
- A decorator is a higher-order function because it takes a function as an argument and returns a new function.
- The wrapper function inside a decorator is an example of a closure, as it retains access to the original function (func) and any arguments passed to it.
### The `@` Syntax
- provides a convenient way to apply decorators without manually wrapping functions.
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

## Common Use Cases of Decorators
### Logging
- Automatically log function calls, arguments, and return values.
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
### Access Control and Authentication
- Enforce permissions, authentication, or other access control mechanisms before allowing a function to execute.
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

class User:
    def __init__(self, authenticated):
        self.is_authenticated = authenticated

user = User(authenticated=True)
print(get_user_data(user))                                            # Output: User data
```
### Caching Results
- Cache the result of expensive function calls to avoid redundant computations.
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
### Timing Functions
- Measure the time taken by a function to execute, useful for performance monitoring.
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

## Decorators with Arguments
### Example: Repeated Execution
- Create a decorator that repeats the execution of a function a specified number of times.
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

## Chaining Decorators
### Basics
- You can apply multiple decorators to a single function by stacking them. The decorators are applied from top to bottom.
### Example
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

print(greet())                    # Output: <b><i>Hello!</i></b>
```

## Maintaining Function Metadata
### Basics
- When you apply a decorator, the original function’s metadata (like its name, docstring, etc.) is replaced by the wrapper function’s metadata. To preserve the original function’s metadata, Python provides the functools.wraps decorator.
### Example
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

## Decorators in Class Methods
### Basics
- Decorators can also be applied to methods within classes. This is common in frameworks like Django and Flask, where decorators are used to define routes, permissions, etc.
### Example
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

# Recursion

## Introduction to Recursion
- occurs when a function calls itself directly or indirectly to solve a smaller instance of the same problem.
### Key Components:
- Base Case: The condition under which the recursive function stops calling itself, preventing infinite recursion.
- Recursive Case: The part of the function where the function calls itself with a modified argument.
### Example: Factorial
```python
def factorial(n):
    if n == 0:
        return 1                          # Base case
    else:
        return n * factorial(n - 1)       # Recursive case

print(factorial(5))                       # Output: 120
```

## Advantages of Recursion
- Simplifies Code: can make code more concise and easier to understand
- Reduces Need for Auxiliary Data Structures: Recursive solutions often eliminate the need for explicit stacks, queues, or other auxiliary data structures that iterative solutions might require.

## Disadvantages of Recursion
- Risk of Stack Overflow: Every recursive call consumes stack space. If the recursion depth is too large (e.g., for very deep trees or large input sizes), this can lead to a stack overflow, causing the program to crash.
- Performance Overhead: Recursive functions can be less efficient than iterative solutions due to the overhead of multiple function calls and stack usage
- Harder to Debug: Recursive code can be harder to debug and understand, due to the non-linear flow of execution.

## Tail Recursion
- is a special form of recursion where the recursive call is the last thing the function does. In tail-recursive functions, there is no need to keep track of the previous state once the function calls itself.
### Example
  ```python
  def tail_recursive_factorial(n, accumulator=1):
      if n == 0:
          return accumulator
      else:
          return tail_recursive_factorial(n - 1, n * accumulator)

  ```

## Memoization and Dynamic Programming
### Memoization
- is an optimization technique where you store the results of expensive function calls and return the cached result when the same inputs occur again.
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
### Dynamic Programming
- is a more generalized approach to solving problems by breaking them down into simpler subproblems, solving each subproblem once, and storing the solution for future use.
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

