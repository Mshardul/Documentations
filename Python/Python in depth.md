# INDEX
- [INDEX](#index)
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