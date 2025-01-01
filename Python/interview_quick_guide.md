- [List Comprehensions](#list-comprehensions)
  - [what it is?](#what-it-is)
  - [python example](#python-example)
- [Generator Expressions](#generator-expressions)
  - [what it is?](#what-it-is-1)
  - [Example](#example)
  - [Related topics](#related-topics)
- [Generators](#generators)
  - [what are they?](#what-are-they)
  - [Example](#example-1)
  - [Generator vs Iterator](#generator-vs-iterator)
  - [Related Topics](#related-topics-1)
- [Lambda Functions](#lambda-functions)
  - [what are they?](#what-are-they-1)
  - [Example](#example-2)
- [Decorators](#decorators)
  - [what are they?](#what-are-they-2)
  - [Example](#example-3)
- [Mixin Classes](#mixin-classes)
  - [What are they?](#what-are-they-3)
  - [Example](#example-4)
  - [Related Topics](#related-topics-2)
- [Context Managers (`with` statement)](#context-managers-with-statement)
  - [What and Why?](#what-and-why)
  - [Example](#example-5)
  - [Creating your own Context Manager](#creating-your-own-context-manager)
- [Multiple Inheritance](#multiple-inheritance)
  - [What and Why?](#what-and-why-1)
  - [syntax](#syntax)
  - [Example](#example-6)
  - [Diamond Problem and MRO](#diamond-problem-and-mro)
- [Iterators and Iteration Protocol](#iterators-and-iteration-protocol)
  - [Iterables and Iterators](#iterables-and-iterators)
  - [Example](#example-7)
  - [Related Topics](#related-topics-3)
- [Method Resolution Order (MRO)](#method-resolution-order-mro)
  - [What?](#what)
  - [How Does Python Calculate the MRO?](#how-does-python-calculate-the-mro)
  - [Example](#example-8)
  - [Related Topics](#related-topics-4)
- [Polymorphism](#polymorphism)
  - [what?](#what-1)
  - [Example](#example-9)
  - [Related Topics](#related-topics-5)
- [Metaclasses](#metaclasses)
- [The Global Interpreter Lock (GIL)](#the-global-interpreter-lock-gil)
- [Concurrency with Threads (conceptual)](#concurrency-with-threads-conceptual)
- [Concurrency with Multiple Processes (conceptual)](#concurrency-with-multiple-processes-conceptual)
- [Asynchronous Programming (`async` / `await`)](#asynchronous-programming-async--await)
- [Asynchronous Generators](#asynchronous-generators)
- [Asynchronous Context Managers](#asynchronous-context-managers)
- [Reflection and Introspection (`dir()`, `getattr()`, etc.)](#reflection-and-introspection-dir-getattr-etc)
- [Memory Management \& Reference Counting](#memory-management--reference-counting)
- [Garbage Collection](#garbage-collection)
- [Type Hints \& Annotations (PEP 484)](#type-hints--annotations-pep-484)
- [Pythonic Best Practices (PEP 8)](#pythonic-best-practices-pep-8)
- [Functional Programming Concepts (`map`, `filter`, `reduce`)](#functional-programming-concepts-map-filter-reduce)
- [Slicing and Slice Objects](#slicing-and-slice-objects)
- [Shallow vs Deep Copy](#shallow-vs-deep-copy)
- [Exception Handling and Custom Exceptions](#exception-handling-and-custom-exceptions)
- [Dunder Methods](#dunder-methods)
- [Operator Overloading](#operator-overloading)
- [Overriding vs Overloading Methods](#overriding-vs-overloading-methods)
- [Security Considerations (`eval`, `exec`)](#security-considerations-eval-exec)
- [Packing and Unpacking Arguments (`*args`, `**kwargs`)](#packing-and-unpacking-arguments-args-kwargs)
- [Name Binding and Scoping Rules (`global`, `nonlocal`)](#name-binding-and-scoping-rules-global-nonlocal)
- [Class Variables vs Instance Variables](#class-variables-vs-instance-variables)
- [Use of `super()` in Inheritance](#use-of-super-in-inheritance)
- [Property Decorators (`@property`)](#property-decorators-property)
- [Class Decorators](#class-decorators)
- [Late Binding Closures](#late-binding-closures)
- [Chaining Comparisons (e.g., `1 < x < 10`)](#chaining-comparisons-eg-1--x--10)


## List Comprehensions
### what it is?
- List comprehensions provide a concise way to create lists.
- Instead of writing several lines of code with loops and append(), a list comprehension can do it all in a single, readable line.
### python example
```python
# Using list comprehension
numbers = [x * 2 for x in range(10)]

# Traditional way
numbers = []
for x in range(10):
    numbers.append(x * 2)
```

## Generator Expressions
### what it is?
- Generator expressions look like **list comprehensions** but use **parentheses** instead of brackets.
- They **don’t create the entire list in memory at once**. 
- Instead, they **generate items one by one** (on-the-fly).
- create a **generator object**, which is an iterator.
- Any iterator can be advanced using Python’s built-in `next()` function.
- They are **memory-efficient** because they only produce one item at a time.
- Great for scenarios where you **don’t need the entire list stored in memory all at once**.
### Example
```python
# List comprehension (creates a full list)
numbers_list = [x * 2 for x in range(10)]

# Generator expression (creates items on the fly)
numbers_generator = (x * 2 for x in range(10))

# You can iterate over the generator
for ind in range(10):
    print(next(numbers_generator))  # yield generator expression using `next` function
```
### Related topics
[List Comprehensions](#list-comprehensions)

## Generators
### what are they?
- Generators are special functions that let you **produce a sequence of values one at a time**, rather than building and returning a complete list at once.
- Every time a generator’s `yield` is reached, the function “pauses” and gives back a value. **When the function is resumed, it continues right after the yield**.
- Write a generator function using `def` and `yield` statements.
- Generators are **memory efficient**, as they generate items only when needed.
- Generators make the Code Cleaner. They’re a concise way to manage data that comes in sequences (e.g., reading lines from a file).
### Example
```python
def count_down(start):
    """
    The function count_down “pauses” each time it hits yield and 
    resumes from the same spot when the next item is requested.
    """
    while start > 0:
        yield start
        start -= 1

for num in count_down(3):
    print(num)
# Output: 3, 2, 1
```
### Generator vs Iterator
- Generators are a special type of iterators that are created by yield or generator expression. Iterators are any object providing __iter__() and __next__().
- When we say “generator,” we usually mean a function or expression using yield. However, all generator functions automatically create an iterator object (technically a “generator object”).
- Because that “generator object” implements the [iterator protocol](#iterators-and-iteration-protocol), it is an iterator.
### Related Topics
[Generator Expression](#generator-expressions) [Iterators and Iteration Protocol](#iterators-and-iteration-protocol)

## Lambda Functions
### what are they?
- A lambda function is a **small**, **anonymous** function (meaning it doesn’t have a name like a regular `def` function).
- It can take **any number of arguments** but only **one expression**.
- They allow **concise function definition** for simple tasks.
- Often used as an **inline function** for short operations, especially when passing a function as an argument to another function (e.g., `map`, `filter`).
### Example
```python
# Equivalent lambda function
add_two_lambda = lambda n: n + 2

# Using it in map
numbers = [1, 2, 3, 4]
results = list(map(lambda n: n + 2, numbers))  # [3, 4, 5, 6]
```

## Decorators
### what are they?
- Decorators allow you to **modify or wrap the behavior of functions (or classes)** without changing their actual code. 
- They are **functions that take another function as an argument**, do some processing, and **return a modified or enhanced version of that function**.
- They help keep your code **DRY (Don’t Repeat Yourself)** by extracting reusable behavior (e.g., logging, timing, authentication checks) into a single place.
### Example
```python
def logging_decorator(func):
    def wrapper():
        print("calling function...")
        func()
        print("... fuction exited")
    return wrapper

@logging_decorator
def say_hello():
    print("Hello!")

say_hello()  # When you call say_hello(), it actually runs the wrapper.
```

## Mixin Classes
### What are they?
- A Mixin is a special kind of class that’s designed to provide **extra functionality to other classes through inheritance**.
- A Mixin class typically doesn’t stand on its own; it’s **meant to be “mixed” into another class** to add specific features.
- They let you **add small, reusable behaviors** across multiple classes without duplicating code.
- They keep your **code more modular** than using large base classes or complicated inheritance hierarchies.
### Example
```python
class LogMixin:  # provides logging functionality
    def log(self, message):
        print(f"[LOG] {message}")

class BaseProcessor:
    def process(self, data):
        print(f"Processing {data}")

class DataProcessor(BaseProcessor, LogMixin):  # inherits logging ability without needing to redefine it
    def process_and_log(self, data):
        self.process(data)
        self.log("Data processed successfully.")

dp = DataProcessor()
dp.process_and_log("SampleData")
```
### Related Topics
[Decorators](#decorators)


## Context Managers (`with` statement)
### What and Why?
- A context manager lets you **set something up before a block of code runs and then automatically clean it up afterward**, even if an error occurs.
- You typically use it with the `with` statement.
- They ensure **resources are properly closed or released** (`files`, `database connections`, `locks`, etc.).
- They keep your code simpler and more reliable by reducing the chance of forgetting cleanup steps.
### Example
```python
with open('some_file.txt', 'r') as file:
    data = file.read()
    print(data)
# The file is automatically closed here, even if an error happens in the block.
```
### Creating your own Context Manager
- You can also **create your own context manager** using a class with `__enter__` and `__exit__` methods:
```python
class MyContextManager:
    def __enter__(self):
        print("Entering the block")
        return self  # Whatever is returned here is assigned to the 'as' variable
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        print("Exiting the block")

with MyContextManager() as mgr:
    print("Inside the block")
```

## Multiple Inheritance
### What and Why?
- allows a class to inherit from more than one parent class.
- helps combining features from different classes into a single class.
- Allows “mixins” to add specific functionalities (e.g., logging, serialization) without large single-inheritance chains.
### syntax
```python
class Child(Parent1, Parent2):
```
### Example
```python
class Flyable:
    def fly(self):
        print("Flying!")

class Swimmable:
    def swim(self):
        print("Swimming!")

class Duck(Flyable, Swimmable):
    pass

donald = Duck()
donald.fly()    # "Flying!"
donald.swim()   # "Swimming!"
```
### Diamond Problem and MRO
- When two parent classes share a common ancestor and define methods with the same name, you get something like:
```python
class P1:
def greet(self):
    print("Hello from P1")

class P2:
    def greet(self):
        print("Hello from P2")

class C1(P1, P2):
    pass

obj_c = C1()
obj_c.greet()  
```
- In Python, multiple inheritance is allowed, and MRO ensures that Python determines a single, consistent path to follow for method lookup.
- Read more about [MRO](#method-resolution-order-mro)

## Iterators and Iteration Protocol
### Iterables and Iterators
- An **iterable** is any **object** that has an `__iter__()` method **returning an iterator object**.
- An iterator is any object that implements the methods:
    - `__iter__()` (returns the iterator object itself), and
    - `__next__()` (returns the next item or raises `StopIteration`).
- This protocol is what powers for loops, list comprehensions, and **anything that loops over data in Python**.
- Under the hood, `for ele in lst` repeatedly calls `next(lst)` until `StopIteration` occurs.
### Example
```python
class SimpleIterator:
    def __init__(self, limit):
        self.limit = limit
        self.current = 0

    def __iter__(self):
        return self  # This makes it an iterator

    def __next__(self):
        if self.current < self.limit:
            val = self.current
            self.current += 1
            return val
        else:
            raise StopIteration

my_iter = SimpleIterator(3)
print(next(my_iter))  # 0
print(next(my_iter))  # 1
print(next(my_iter))  # 2
print(next(my_iter))  # Raises StopIteration
```
### Related Topics
[Generators](#generators), [Dunder Methods](#dunder-methods)

## Method Resolution Order (MRO)
### What?
- When you call a method (or access an attribute) on an object, Python looks it up in the class hierarchy in a specific order.
- This lookup path is called the **Method Resolution Order (MRO)**.
### How Does Python Calculate the MRO?
- Python uses the C3 linearization algorithm.
- In simple terms, it tries to create an order that respects:
    - The order in which classes are listed in the inheritance tuple.
    - The order of inheritance in parent classes, ensuring a consistent and unambiguous sequence.
### Example
```python
"""
The `do_something()` method is found by searching `D → B → A → C → A again` (but it won’t revisit A if it’s already found that method).
"""
class A:
    def do_something(self):
        print("A")

class B(A):
    def do_something(self):
        print("B")

class C(A):
    def do_something(self):
        print("C")

class D(B, C):
    pass

d = D()
d.do_something()

print(D.__mro__)
# (<class '__main__.D'>, <class '__main__.B'>, <class '__main__.C'>, <class '__main__.A'>, <class 'object'>)
```
### Related Topics
[Multiple Inheritance](#multiple-inheritance)

## Polymorphism
### what?
- “Poly” means many; “morph” means form.
- it means one interface (like a method name) can be used with different underlying forms (different classes), each providing its own implementation.
- Duck Typing is a form of polymorphism in Python: if two different classes implement the same method name, Python can call that method on either class without worrying about the class type.
### Example
```python
class Dog:
    def speak(self):
        return "Woof!"

class Cat:
    def speak(self):
        return "Meow!"

class Fish:
    pass

def interact(animal):
    print(animal.speak())

interact(Dog())   # "Woof!"
interact(Cat())   # "Meow!"
interact(Fish())  # Raises AttributeError: 'Fish' object has no attribute 'speak'
"""
To ensure that every object passed to `interact()` implements `speak()`,
implement an Abstract Class `Animal` with abstractmethod `speak()`
Inherit both `Dog` and `Cat` from this `Animal` class, and make `interact()` argument type as `Animal`.
```
### Related Topics


## Metaclasses
## The Global Interpreter Lock (GIL)
## Concurrency with Threads (conceptual)
## Concurrency with Multiple Processes (conceptual)
## Asynchronous Programming (`async` / `await`)
## Asynchronous Generators
## Asynchronous Context Managers
## Reflection and Introspection (`dir()`, `getattr()`, etc.)
## Memory Management & Reference Counting
## Garbage Collection
## Type Hints & Annotations (PEP 484)
## Pythonic Best Practices (PEP 8)
## Functional Programming Concepts (`map`, `filter`, `reduce`)
## Slicing and Slice Objects
## Shallow vs Deep Copy
## Exception Handling and Custom Exceptions
## Dunder Methods
## Operator Overloading
## Overriding vs Overloading Methods
## Security Considerations (`eval`, `exec`)
## Packing and Unpacking Arguments (`*args`, `**kwargs`)
## Name Binding and Scoping Rules (`global`, `nonlocal`)
## Class Variables vs Instance Variables
## Use of `super()` in Inheritance
## Property Decorators (`@property`)
## Class Decorators
## Late Binding Closures
## Chaining Comparisons (e.g., `1 < x < 10`)