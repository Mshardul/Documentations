- [Index](#index)
- [Introduction](#introduction)
  - [Modules vs Packages](#modules-vs-packages)
- [Modules](#modules)
  - [Definition](#definition)
  - [Creating a Module](#creating-a-module)
    - [Example](#example)
- [Module Namespaces and Scoping](#module-namespaces-and-scoping)
  - [Types of Namespaces](#types-of-namespaces)
  - [The `__name__` Variable](#the-__name__-variable)
  - [Standard Library Modules](#standard-library-modules)
- [Packages](#packages)
  - [The role of `__init__.py`](#the-role-of-__init__py)
  - [Creating Executable Packages](#creating-executable-packages)
  - [Publishing Your Own Package](#publishing-your-own-package)
- [Importing Modules/Packages](#importing-modulespackages)
  - [Relative Imports in Packages](#relative-imports-in-packages)
  - [Different Import Styles](#different-import-styles)
  - [Re-importing Modules](#re-importing-modules)
  - [Dynamic Imports](#dynamic-imports)
  - [Custom Import Hooks](#custom-import-hooks)
- [Best Practices and Guidelines](#best-practices-and-guidelines)
- [Third-Party Modules and pip](#third-party-modules-and-pip)
  - [Installing Third-Party Modules with pip](#installing-third-party-modules-with-pip)
  - [Using Virtual Environments](#using-virtual-environments)


# Index

# Introduction

## Modules vs Packages
- **Modules:** These are single files (with a .py extension) that contain Python code. Modules can contain functions, classes, variables, and runnable code.
- **Packages:** A package is a collection of modules organized in directories that include a special `__init__.py` file. Packages allow you to structure your Python project into hierarchical directories, making the project more modular and easier to manage.

# Modules

## Definition
- A package in Python is a way of organizing related modules into a directory hierarchy. 
- It helps in grouping related modules, making the codebase more modular and organized. 
- Packages allow you to build a more structured project, especially as it grows in complexity.

## Creating a Module
- A package is simply a directory that contains a special file called `__init__.py`. This file can be empty or contain initialization code for the package.
- As projects grow, packages help in organizing code into a hierarchical structure.
- You can create sub-packages within packages by simply adding more directories with their own `__init__.py` files.
### Example
- Consider creating a package called **utilities** with two modules: `math_utils.py` and `string_utils.py`.
- Directory Structure
```plaintext
utilities/
    __init__.py
    math_utils.py
    string_utils.py
```
- `__init__.py`
```python
from .math_utils import add
from .string_utils import to_upper
```
- `math_utils.py`
```python
def add(a, b):
    return a + b

def subtract(a, b):
    return a - b
```
- `string_utils.py`
```python
def to_upper(s):
    return s.upper()

def to_lower(s):
    return s.lower()
```


# Module Namespaces and Scoping
- Each module in Python has its own namespace, which is a container where variable names are stored. 
- This means that variables, functions, or classes defined in one module won’t interfere with those in another module unless explicitly imported.

## Types of Namespaces
- **Global Namespace:** This is the top-level namespace where global variables reside. Each module has its own global namespace.
- **Local Namespace:** This is created when a function is called, and it contains the function’s local variables.
```python
x = "global"

def outer():
    x = "outer local"

    def inner():
        x = "inner local"
        print("Inner:", x)

    inner()
    print("Outer:", x)

outer()
print("Global:", x)

"""Output
Inner: inner local
Outer: outer local
Global: global
"""
```

## The `__name__` Variable
- The `__name__` variable in Python is a special built-in variable that provides a way to determine if a Python file is being run directly or being imported as a module.
- **Running as a Script:** When a Python script is executed directly, the `__name__` variable is set to `__main__`.
```python
# script.py
if __name__ == "__main__":
    print("This script is running directly.")
```
- **Importing as a Module:** When the script is imported into another module, `__name__` is set to the name of the module.
```python
import script

# Outputs nothing since the script is not running directly.
```

## Standard Library Modules
- Python’s standard library comes with a vast array of modules that provide functionalities for various tasks, such as file I/O, system calls, network communication, and data manipulation.
- Examples
  - **os:** Provides functions for interacting with the operating system.
  - **sys:** Provides access to some variables used or maintained by the Python interpreter.
  - **math:** Provides mathematical functions.
  - **datetime:** Provides classes for manipulating dates and times.
  - **random:** Provides functions for generating random numbers.

# Packages

## The role of `__init__.py`
- The `__init__.py` file is crucial in making Python treat directories containing the file as packages.
- It can be empty, but its presence is necessary for Python versions earlier than 3.3.

## Creating Executable Packages
- Python packages can be made executable by including an `__main__.py` file.
- This file is executed when the package is run as a script.
- Example: Consider following package structure
```plaintext
my_package/
    __init__.py
    module1.py
    __main__.py
``` 
- `__main__.py`
```python
from .module1 import greet

if __name__ == "__main__":
    print(greet("World"))
```
- Execute this package from command line
```bash
python -m my_package  # Output: Hello, World!
```

## Publishing Your Own Package
- If you’ve created a package that you want to share with the Python community, you can publish it on PyPI.
- **Setting Up Your Package:** Ensure your package follows the standard directory structure, and create a `setup.py` file with the necessary metadata.
```python
from setuptools import setup, find_packages

setup(
    name="my_package",
    version="0.1",
    packages=find_packages(),
    install_requires=[
        "requests",
    ],
    entry_points={
        "console_scripts": [
            "my_command=my_package.module:main_function",
        ],
    },
)
```
- **Building and Uploading Your Package**
```bash
python setup.py sdist bdist_wheel   # Build the package distribution
twine upload dist/*                 # Upload the package to PyPI using twine
```

# Importing Modules/Packages
- Either import a package
- Or import specific modules from a package using dot notation.
- Example
```python
import utilities.math_utils
print(utilities.math_utils.add(10, 5))  # Output: 15

from utilities.string_utils import to_upper
print(to_upper("hello"))  # Output: HELLO
```

## Relative Imports in Packages
- **Single Dot (.):** Refers to the current package/module level.
- **Double Dot (..):** Refers to the parent package/module level.
- **Triple Dot (...):** Refers to the grandparent package/module level, and so on.
```python
# app/controllers.py
from .models import User  # Importing from the same package

def create_user(name, email):
    return User(name, email)
```
- Relative imports are particularly useful when you want to ensure that your code is modular and portable across different projects.

## Different Import Styles
- **Standard Import:** `import module_name`
- **Alias Import:** `import module_name as alias` (useful for shortening module names)
- **Selective Import:** `from module_name import item_name`
- **Wildcard Import:** `from module_name import *` (not recommended due to namespace pollution)
```python
''' standard import '''
import math_operations
print(math_operations.add(3, 5))

''' alias import '''
import math_operations as mo
print(mo.subtract(10, 3))

''' selective import '''
from math_operations import add
print(add(7, 2))

''' wildcard import '''
from math_operations import *
print(subtract(15, 5))
```

## Re-importing Modules
Python caches imported modules. If you modify a module and want to re-import it without restarting the interpreter, use the `importlib.reload()` function.
- Example
```python
import importlib
import math_operations

importlib.reload(math_operations)
```

## Dynamic Imports
- Python allows you to dynamically import modules at runtime using the `importlib` module.
- Dynamic imports can be used for plugins or extension systems where the available modules depend on user input or external factors.
- Example
```python
import importlib

module_name = "math"
math_module = importlib.import_module(module_name)
print(math_module.sqrt(16))  # Output: 4.0
```

## Custom Import Hooks
- Python’s import system is flexible and allows for the customization of how modules are imported.
- This can be done by creating custom import hooks using the importlib module.
- **Creating a Custom Importer:** You can create a custom importer by modifying the sys.meta_path list, which is a list of finder objects that Python goes through when importing a module.
```python
import sys
from importlib.abc import MetaPathFinder, Loader
from importlib.util import spec_from_loader

class CustomFinder(MetaPathFinder):
    def find_spec(self, fullname, path, target=None):
        if fullname == "custom_module":
            return spec_from_loader(fullname, CustomLoader())

class CustomLoader(Loader):
    def create_module(self, spec):
        return None  # Use default module creation

    def exec_module(self, module):
        module.hello = lambda: "Hello from custom module"

sys.meta_path.insert(0, CustomFinder())

import custom_module
print(custom_module.hello())  # Output: Hello from custom module
```

# Best Practices and Guidelines
- **Keep Modules Small and Focused:** Each module should have a single responsibility. This makes the code easier to maintain and reuse.
- **Use Meaningful Names:** Module and package names should clearly indicate their purpose and contents.
- **Document Your Code:** Include docstrings in your modules, classes, and functions to explain what they do.
- **Avoiding Circular Imports:** To avoid circular imports (when two modules depend on each other directly or indirectly), refactor the code so that the interdependencies are minimized. One common approach is to move shared dependencies to a separate module.
- **Deferred Imports:** If refactoring is not feasible, import the module within a function or method rather than at the top of the file.
- **Naming Conventions:** Use lowercase with underscores for function and variable names, and CapitalizedWords for class names.
- **Import Order:** Group imports into three categories: standard library imports, related third-party imports, and local application/library-specific imports.

# Third-Party Modules and pip

## Installing Third-Party Modules with pip
- **Installing a Package:** Use the command `pip install package_name` to install a package.
- **Listing Installed Packages:** You can list all installed packages with `pip list`
- **Uninstalling a Package:** To uninstall a package, use the command `pip uninstall package_name`

## Using Virtual Environments
- A virtual environment is a self-contained directory that contains a Python installation for a particular project, along with a specific set of packages.
- Virtual environments are essential for managing dependencies and ensuring that your projects do not interfere with each other.
- **Creating a Virtual Environment:** Use the `venv` module to create a new virtual environment.
```bash
python -m venv myenv
```
- **Activating a Virtual Environment:** Activate the virtual environment using activate script
```bash
myenv\Scripts\activate  # on windows
myenv/bin/activate      # on macos/linux
```
