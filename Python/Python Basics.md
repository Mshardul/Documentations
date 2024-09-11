# Basic Syntax

## Comments
### single-line (`#`)
```python
# This is a python comment
```
### multi-line (triple quotes).
```python
""" This is 
multi-line comment """
```
- Triple quotes are often used for docstrings in functions, not for regular comments.

## Code structure
### Indentation
- Python uses indentation (spaces or tabs) to define blocks of code.
- Mixing tabs and spaces in the same code block will cause an `IndentationError`.
### Line Continuation
- Use backslash `\` for explicit line continuation.
- Implicit Continuation: inside parentheses, brackets, or braces.

# Variables, Data Types, and Basic Operations

## Dynamic typing
- Python variables do not require explicit declaration of type.

## Variable naming conventions
- Start with a letter (a-z, A-Z) or an underscore (`_`).
- Followed by letters, digits (0-9), or underscores.
- Case-sensitive: `var` and `Var` are different.
- Avoid using Python reserved keywords like `if`, `else`, `for`, etc.

## Basic data types: 
### `int`
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
### `float`
- Numbers with a decimal point.
- Can represent very large or very small numbers using scientific notation.
### `str`
- Ordered sequence of characters enclosed in single, double, or triple quotes.
- Strings are immutable; any modification results in a new string being created.
- Example
  ```python
  x = "hi"
  x[0] = "a"  # TypeError: 'str' object does not support item assignment
  ```
### `bool`
- Represents `True` or `False` values.
### NoneType (`None`):
- Represents the absence of a value.
- Commonly used as a default value for optional parameters or to reset variables.
- Example:
  - result = None

## Type conversion
### Implicit Conversion:
- Python automatically converts types in expressions where it’s necessary.
- Example
  ```python
  print(3 + 2.5)  # 5.5 (int converted to float)
  ```
### Explicit Conversion:
- Use built-in functions for explicit type conversion.Use built-in functions for explicit type conversion.
  - Example: `int()`, `float()`, `str()`, `bool()`
- Converting `float` to `int` truncates the decimal part (no rounding).

## Type checking
### Built-In Type Checking
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
### Static Type Checking with Type Hints
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
### Common Type Hints
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
### `Any` Type:
- from the `typing` module can be used to indicate that a value can be of any type.
```python
def process(value: Any) -> None:
    pass
```
### `Callable` Types
- to specify a function signature.
```python
def apply_function(f: Callable[[int, int], int], a: int, b: int) -> int:
    pass
```
### Generics:
- allow for more flexible type hints by defining a type that can be used with different types of data.
  ```python
  from typing import Generic, TypeVar

  T = TypeVar('T')
  
  class Box(Generic[T]):
      def __init__(self, content: T) -> None:
        self.content = content

  int_box = Box 
  str_box = Box[str]("Python")
  ```
### important Libraries
  - `mypy` is a static type checker that enforces type hints in Python.
  - `pylint` is another tool that can check code quality and enforce type hint usage.
  - `typeguard` library allows for runtime type checking based on type hints.

## Truthy and Falsy values
### `True` values
  - Non-zero numbers: `1`, `-1`
  - Non-empty sequences or collections: `[1, 2, 3]`, `"Hello"`
### `False` values
  - Zero: `0`, `0.0`
  - Empty sequences or collections: `[]`, `''`, `()`, `{}`, `set()`
  - `None`

# Operators

## Type of Operators
### Arithmetic Operators
- Addition (`+`), Subtraction (`-`), Multiplication (`*`), Division (`/`), Floor Division(`//`), Modulus(`%`), Exponentiation(`**`)
### Comparison Operators
- Equality (`==`), Inequality (`!=`), Greater/Less Than(`>`, `<`, `>=`, `<=`)
- Chained Comparisons: Python allows chaining of comparison operators
  ```python
  print(1 < 2 < 3)  # True (equivalent to 1 < 2 and 2 < 3)
  ```
### Logical Operators
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
### Assignment Operators
- Basic Assignment(`=`), Augmented Assignment (`+=`, `-=`, `*=`, `/=`, `%=`, `**=`, `//=`)

## Operator Precedence
### Operator Precedence
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

## Associativity
### Definition
- Most operators in Python are left-associative, meaning they are evaluated from left to right.
- The exponentiation operator (**) is right-associative, meaning it is evaluated from right to left.

# Input and Output

## `input()` function
### Basics
- used for taking input. optional string argument serves as a prompt to the user.
- Example
  ```python
  name: str = input("Name: ")
  age: int = int(input("Age: "))
  weight: float = float(input("Weight: "))
  ```
## `print()` function
### Basics
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

# Control Flow

## Conditional Statements (if, elif, else)
### `if` Statement
- evaluates a condition and executes the indented block of code if the condition is true.
```python
if age >= 18:
    print("You are an adult!")
```
### `if-else` Statement
- `else` clause provides an alternative block of code to execute if the condition is false.
```python
if age >= 18:
    print("You are an adult!")
else:
    print("Sorry! You are not an adult!")
```
### `if-elif-else` Statement
- The `elif` (short for "else if") allows you to check multiple conditions.
```python
if age >= 18:
    print("You are an adult.")
elif age >= 13:
    print("You are a teenager.")
else:
    print("You are a child.")
```
### Nested `if` Statements:
- `if` statements can be nested inside other `if` statements to handle more complex logic.
```python
if age >= 18:
    if age >= 65:
        print("You are a senior citizen.")
    else:
        print("You are an adult.")
else:
    print("You are not an adult.")
```
### Ternary operators 
- Inline `if-else` Statements
  ```python
  print("Adult" if age >= 18 else "Not an Adult")
  ```
- Using Logical Operators as a Conditional Expression
  ```python
  print(("Adult" and age >= 18) or "Not an Adult")
  ```

## Loops
### `for` loop
```python
for number in numbers:
    pass
```
### `while` loop
```python
count = 0
while count < 5:
    pass
```

## Loop control: 
### `break`: 
- Exits the loop prematurely, regardless of the loop condition.
```python
for i in range(10):
    if i == 5:
        break
    print(i)
```
- Using `break` in nested loops only exits the innermost loop.
### `continue`
### `else`
- `else` block will execute only if the loop terminates normally (i.e., not via a `break`)
```python
count = 0
while count < 5:
    print(count)
    count += 1
else:
    print("Loop completed without a break.")
```
### `pass` statement
- Does nothing and is often used as a placeholder.
```python
for i in range(5):
    if i == 3:
        pass            # Do nothing
    else:
        print(i)
```

## Nested Loops
```python
for i in range(3):
    for j in range(3):
        print(f"i = {i}, j = {j}")
```

## Iterating Techniques
### `range()` for generating sequence
- `range()` generates a sequence of numbers
```python
for i in range(1, 10, 2):  # [1, 2, 3, 4, 5, 6, 7, 8, 9]
    pass
range(5) # [0, 1, 2, 3, 4]
range (2, 5) # [2, 3, 4]
range (1, 5, 3) # [1, 4]
```
### `enumerate()` function: 
- adds a counter to an iterable and returns it in the form of an enumerating object.
```python
for index, element in enumerate(names):  # in case of dict, element contains the key of the dictionary
    pass
```
### `zip()` function:
- is used to combine two or more iterables (e.g., lists, tuples, strings) into a single iterable of tuples. Each tuple contains elements from the corresponding position of the original iterables.
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

              
