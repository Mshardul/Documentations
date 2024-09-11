
- [Exceptions](#exceptions)
  - [Introdution to Exceptions](#introdution-to-exceptions)
  - [Built-in Exceptions](#built-in-exceptions)
    - [Base Exceptions](#base-exceptions)
    - [Standard Error Exceptions](#standard-error-exceptions)
    - [Arithmetic Errors](#arithmetic-errors)
    - [Lookup Errors](#lookup-errors)
    - [Import Errors](#import-errors)
    - [OS and System Errors](#os-and-system-errors)
    - [Assertion and Integrity Errors](#assertion-and-integrity-errors)
    - [Syntax and Parsing Errors](#syntax-and-parsing-errors)
    - [Type and Value Errors](#type-and-value-errors)
    - [Warnings](#warnings)
    - [Iteration and Generator Errors](#iteration-and-generator-errors)
    - [System-Related Exceptions](#system-related-exceptions)
  - [Exception Hierarchy](#exception-hierarchy)
  - [Raising Exceptions](#raising-exceptions)
  - [Handling Exceptions](#handling-exceptions)
    - [The try-except Block](#the-try-except-block)
    - [Multiple Exceptions](#multiple-exceptions)
    - [The else Block](#the-else-block)
    - [The finally block](#the-finally-block)
  - [Catching Specific Exceptions](#catching-specific-exceptions)
    - [Catching Multiple Exceptions in One Block](#catching-multiple-exceptions-in-one-block)
    - [Catching All Exceptions using `Exception`.](#catching-all-exceptions-using-exception)
  - [Creating Custom Exceptions](#creating-custom-exceptions)
    - [Example](#example)
  - [Advanced Exception Handling Techniques](#advanced-exception-handling-techniques)
    - [Using the `with` Statement for Resource Management](#using-the-with-statement-for-resource-management)
    - [Custom Context Managers](#custom-context-managers)
    - [Exception Chaining with from](#exception-chaining-with-from)

# Exceptions

## Introdution to Exceptions
- An exception is an event that occurs during the execution of a program that disrupts the normal flow of instructions.
- In Python, exceptions are objects that represent these error conditions.

## Built-in Exceptions
### Base Exceptions
- These are the fundamental exceptions that all other exceptions derive from.
- `BaseException`: The base class for all built-in exceptions.
- `SystemExit`: Raised by the `sys.exit()` function.
- `KeyboardInterrupt`: Raised when the user hits the interrupt key (usually Ctrl+C).
- `GeneratorExit`: Raised when a generator's `close()` method is called.
### Standard Error Exceptions
- is the base class for most built-in exceptions, excluding system-exiting exceptions.
- `Exception`: The base class for most built-in exceptions.
### Arithmetic Errors
- `ArithmeticError`: The base class for arithmetic errors.
  - `FloatingPointError`: Raised when a floating point operation fails.
  - `OverflowError`: Raised when a calculation exceeds maximum limit for a numeric type.
  - `ZeroDivisionError`: Raised when dividing by zero.
### Lookup Errors
- `LookupError`: The base class for lookup errors.
  - `IndexError`: Raised when a sequence index is out of range.
  - `KeyError`: Raised when a dictionary key is not found.
### Import Errors
- `ImportError`: Raised when an import fails.
  - `ModuleNotFoundError`: Raised when a module cannot be found.
- Attribute Errors
- `AttributeError`: Raised when attribute reference or assignment fails.
### OS and System Errors 
- Exceptions related to operating system or system-related issues.
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
### Assertion and Integrity Errors
- Exceptions raised for logical integrity or consistency errors.
- `AssertionError`: Raised when an assert statement fails.
- `MemoryError`: Raised when an operation runs out of memory.
- `ReferenceError`: Raised when a weak reference is used in an inappropriate context.
- `RuntimeError`: Raised when an error is detected that doesn't fall into any specific category.
  - `NotImplementedError`: Raised when an abstract method that needs to be implemented is not.
  - `RecursionError`: Raised when the maximum recursion depth is exceeded.
### Syntax and Parsing Errors
- Exceptions related to syntax or parsing issues.
- `SyntaxError`: Raised when the parser encounters a syntax error.
  - `IndentationError`: Raised when indentation is not correct.
    - `TabError`: Raised when tabs and spaces are mixed in indentation.
- `SystemError`: Raised when the interpreter detects an internal error.
### Type and Value Errors
- Exceptions related to incorrect types or values.
- `TypeError`: Raised when an operation or function is applied to an object of inappropriate type.
- `ValueError`: Raised when a function receives an argument of the correct type but an inappropriate value.
- `UnicodeError`: The base class for Unicode-related encoding/decoding errors.
  - `UnicodeDecodeError`: Raised when a Unicode decoding error occurs.
  - `UnicodeEncodeError`: Raised when a Unicode encoding error occurs.
  - `UnicodeTranslateError`: Raised when a Unicode translation error occurs.
### Warnings
- Categories of warnings for different levels of concern.
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
### Iteration and Generator Errors
- Exceptions raised during iteration or by generators.
- `StopIteration`: Raised to signal the end of an iterator.
- `StopAsyncIteration`: Raised to signal the end of an asynchronous iterator.
- `GeneratorExit`: Raised when a generator or coroutine is closed.
### System-Related Exceptions
- Special exceptions related to system behavior.
- `SystemExit`: Raised by the sys.exit() function.
- `KeyboardInterrupt`: Raised when the user hits the interrupt key (Ctrl+C).
- `GeneratorExit`: Raised when a generator or coroutine’s close() method is called.

## Exception Hierarchy
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

## Raising Exceptions
- `raise` Statement is used to explicitly trigger an exception in Python. This is useful when you want to enforce certain conditions in your code.
  ```python
  def divide(a, b):
      if b == 0:
          raise ZeroDivisionError("Cannot divide by zero")
      return a / b

  print(divide(10, 0))          # Raises ZeroDivisionError
  print(divide(10, 2))          # Output: 5.0
  ```

## Handling Exceptions
### The try-except Block
- The `try` block lets you test a block of code for errors. The except block lets you handle the error.
  ```python
  try:
      result = 10 / 0
  except ZeroDivisionError:
      print("Cannot divide by zero")
  ```
### Multiple Exceptions
- handle multiple exceptions by specifying multiple `except` blocks.
  ```python
  try:
      value = int("abc")
  except ValueError:
      print("Conversion error: Value is not a number")
  except TypeError:
      print("Type error: Invalid type")
  ```
### The else Block
- is executed if the `try` block does not raise an exception. It’s useful for code that should run only if no exceptions occur.
  ```python
  try:
    result = 10 / 2
  except ZeroDivisionError:
      print("Cannot divide by zero")
  else:
      print(f"Result is {result}")        # Output: Result is 5.0
  ```
### The finally block
- is executed no matter what—whether an exception occurs or not. It’s typically used to clean up resources (e.g., closing files or database connections).
  ```python
  try:
      file = open("example.txt", "r")
  except FileNotFoundError:
      print("File not found")
  finally:
      file.close()                  # Ensures the file is closed even if an exception occurs
  ```

## Catching Specific Exceptions
### Catching Multiple Exceptions in One Block
```python
try:
    x = int(input("Enter a number: "))
    y = 10 / x
except (ValueError, ZeroDivisionError) as e:
    print(f"Error occurred: {e}")
```
### Catching All Exceptions using `Exception`. 
  ```python
  """ However, this is generally discouraged. """
  try:
      result = some_undefined_function()
  except Exception as e:
      print(f"An error occurred: {e}")
  ```

## Creating Custom Exceptions
- Defining Custom Exceptions: Custom exceptions are typically subclasses of `Exception`. This allows you to create meaningful, application-specific error types.
### Example
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

## Advanced Exception Handling Techniques
### Using the `with` Statement for Resource Management
- The `with` statement in Python simplifies resource management by automatically handling exceptions and ensuring that resources are cleaned up.
```python
with open("example.txt", "r") as file:
    data = file.read()
# The file is automatically closed when the block is exited
```
### Custom Context Managers
- You can create custom context managers using the `contextlib` module or by implementing the `__enter__()` and `__exit__()` methods.
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
### Exception Chaining with from
- Python allows you to chain exceptions using the `from` keyword, making it easier to understand the sequence of events that led to an error.
  ```python
  """
  This technique preserves the original exception while raising a new one, providing more context for debugging.
  """
  try:
      result = 10 / 0
  except ZeroDivisionError as e:
      raise ValueError("Invalid calculation") from e
  ```
