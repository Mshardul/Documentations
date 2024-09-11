- [Introduction to OOP Concepts](#introduction-to-oop-concepts)
  - [Basics of OOP](#basics-of-oop)
    - [Classes](#classes)
    - [Objects](#objects)
    - [Attributes](#attributes)
    - [Methods](#methods)
- [Key Concepts of OOP](#key-concepts-of-oop)
  - [Encapsulation and Abstraction](#encapsulation-and-abstraction)
    - [Encapsulation](#encapsulation)
    - [Abstraction](#abstraction)
    - [Abstraction vs. Encapsulation](#abstraction-vs-encapsulation)
  - [Inheritance:](#inheritance)
    - [Syntax](#syntax)
    - [Types of Inheritance in Python](#types-of-inheritance-in-python)
    - [The super() Function](#the-super-function)
    - [Method Resolution Order (MRO)](#method-resolution-order-mro)
  - [Polymorphism](#polymorphism)
    - [Types of Polymorphism](#types-of-polymorphism)
    - [Duck typing](#duck-typing)
    - [Operator Overloading](#operator-overloading)
  - [Magic (or Dunder) Methods:](#magic-or-dunder-methods)
    - [Commonly Used Magic (Dunder) Methods](#commonly-used-magic-dunder-methods)
  - [Composition:](#composition)
    - [Example](#example)
    - [Composition vs. Inheritance](#composition-vs-inheritance)
    - [Delegation](#delegation)
- [Advanced OOP Topics](#advanced-oop-topics)
  - [Name Mangling](#name-mangling)
    - [Example](#example-1)
    - [Name Mangling in Subclass](#name-mangling-in-subclass)
    - [Limitations of Name Mangling](#limitations-of-name-mangling)
  - [Metaclasses in Python](#metaclasses-in-python)
    - [Introduction to Metaclasses](#introduction-to-metaclasses)
    - [Why Use Metaclasses?](#why-use-metaclasses)
    - [The `__new__()` and `__init__()` Methods in Metaclasses](#the-__new__-and-__init__-methods-in-metaclasses)
    - [Metaclass Use Cases](#metaclass-use-cases)
  - [Custom Object Creation](#custom-object-creation)
    - [`__init__()` and `__new__()`:](#__init__-and-__new__)
    - [The `__new__()` Method](#the-__new__-method)
    - [The `__init__()` Method](#the-__init__-method)
    - [`__new__()` vs. `__init__()`](#__new__-vs-__init__)
    - [Use Cases for Custom Object Creation](#use-cases-for-custom-object-creation)
  - [Class Decorators](#class-decorators)
    - [Basics](#basics)
    - [Example](#example-2)
    - [Applying Decorators to Classes](#applying-decorators-to-classes)
    - [Class Decorators vs. Metaclasses:](#class-decorators-vs-metaclasses)
  - [Descriptor Protocol](#descriptor-protocol)
    - [Basics](#basics-1)
    - [`__get__()` Method](#__get__-method)
    - [`__set__(self, instance, value)`](#__set__self-instance-value)
    - [`__delete__(self, instance)`](#__delete__self-instance)
    - [Types of Descriptors](#types-of-descriptors)
    - [Use Cases for Descriptors](#use-cases-for-descriptors)
  - [Mixins](#mixins)
    - [Introduction](#introduction)
    - [Characteristics of Mixins](#characteristics-of-mixins)
    - [Practical Use Cases for Mixins](#practical-use-cases-for-mixins)
    - [Mixins vs. Inheritance](#mixins-vs-inheritance)
  - [Creating Custom Immutable Objects](#creating-custom-immutable-objects)
    - [Introduction to Immutable Objects](#introduction-to-immutable-objects)
    - [Example](#example-3)
    - [Using `__new__()` for Immutability:](#using-__new__-for-immutability)
    - [Properties of Immutable Objects](#properties-of-immutable-objects)
- [Best Practices and Tips for OOP in Python](#best-practices-and-tips-for-oop-in-python)
  - [Design Principles](#design-principles)
  - [Code Organization](#code-organization)
  - [Practical Tips for Writing OOP Code](#practical-tips-for-writing-oop-code)
  - [Testing and Debugging](#testing-and-debugging)
  - [Performance Considerations](#performance-considerations)
  - [Collaboration and Code Maintenance](#collaboration-and-code-maintenance)

# Introduction to OOP Concepts

## Basics of OOP
### Classes
- A class is a blueprint or template for creating objects. It defines a set of attributes (variables) and methods (functions) that the objects created from the class will have.
```python
class Dog:
    species = "Canis familiaris"          # Class attribute

    def __init__(self, name):             # Initializer / Instance Attributes
        self.name = name

    def bark(self):                       # Method
        return f"{self.name} says woof!"
```
### Objects
- An object is an instance of a class. When a class is defined, no memory is allocated until an object of that class is created. Objects are specific instances that hold data and can perform tasks defined in the class.
```python
my_dog = Dog("Buddy", 3)                  # Creating an Object
print(my_dog.name)                        # Output: Buddy
```
### Attributes
- are the data stored inside an object. They represent the state or properties of an object.
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
### Methods
- are functions defined within a class that describe the behaviors or actions that an object can perform. They operate on the attributes of the object.
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

# Key Concepts of OOP

## Encapsulation and Abstraction
### Encapsulation
- is the process of wrapping data and the methods that manipulate that data into a single unit (a class). It is a way of restricting access to certain components and preventing the accidental modification of data.
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
  - **Public Attributes and Methods** are accessible from anywhere, both inside and outside the class. They are defined without any leading underscores.
  - **Protected attributes and methods** are intended to be accessed only within the class and its subclasses. They are indicated by a single leading underscore (`_`).
  - **Private attributes and methods** are meant to be accessed only within the class itself. They are indicated by a double leading underscore (`__`), which triggers name mangling to make it harder to access them from outside the class. Read about Name Mangling [here](#name-mangling)
- Best Practices for Encapsulation
  - Use Properties for Access Control: Use `@property` to provide controlled access to private attributes. This allows you to add logic for validation or transformation when getting or setting attribute values.
  - Limit Access with Protected and Private Attributes: Use protected (`_attribute`) and private (`__attribute`) attributes to limit access to sensitive data and ensure that it can only be modified in controlled ways.
  - Avoid Over-Encapsulation: Only encapsulate data that needs protection or controlled access. Avoid encapsulating attributes that are simple and do not require special handling.
### Abstraction
- is the process of exposing only the essential features of an object while hiding the underlying implementation details. It allows you to interact with objects at a higher level, without needing to understand or manage the complexities of their inner workings.
- **Abstract Classes:** is a class that cannot be instantiated on its own and is meant to be subclassed. It typically includes one or more abstract methods, which are methods that are declared but contain no implementation. Abstract classes define a common interface that must be implemented by all subclasses.
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
- **Interfaces:** While Python doesn't have a formal `interface` keyword like some other languages (e.g., Java), the concept of interfaces is still applicable. Abstract classes with only abstract methods can effectively serve as interfaces.
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
- **Getters and setters**
  - **Getters** are methods that retrieve or access the value of an attribute in a controlled manner. They provide a way to read the value of a private or protected attribute while hiding the implementation details.
  - **Setters** are methods that allow you to modify the value of an attribute in a controlled way. They provide a mechanism to validate or enforce constraints on the data before setting the attribute.
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
- **Property Decorators**(`@property`): Python provides a more elegant way to encapsulate access to an attribute using the `@property` decorator
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
### Abstraction vs. Encapsulation
- **Purpose**
  - Abstraction focuses on hiding the complex implementation details and exposing only the necessary parts of an object. It defines what an object does without showing how it does it.
  - Encapsulation is about bundling data (attributes) and methods that operate on that data into a single unit (class) and restricting access to certain parts of an object to protect its internal state.
- **Implementation**
  - Abstraction is achieved through abstract classes, interfaces, and methods that expose essential functionality while hiding the underlying complexity.
  - Encapsulation is achieved through access control (public, protected, private attributes and methods) and properties that control access to an object's data.

## Inheritance: 
- is a mechanism in OOP that allows one class (the child or derived class) to inherit attributes and methods from another class (the parent or base class). The child class can also have additional attributes and methods or override the behavior of inherited methods.
### Syntax
```python
class ChildClass(ParentClass):
    # additional attributes and methods
```
### Types of Inheritance in Python
- **Single Inheritance:** occurs when a class inherits from one parent class.
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
- **Multiple Inheritance:** occurs when a class inherits from more than one parent class.
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
- **Multilevel Inheritance:** occurs when a class is derived from another class, which is also derived from another class.
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
- **Hierarchical Inheritance:** occurs when multiple classes inherit from the same parent class.
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
- **Hybrid Inheritance:** is a combination of two or more types of inheritance.
### The super() Function
- allows you to access methods of a parent class from within a child class, enabling you to build upon or extend the functionality of the parent class.
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
### Method Resolution Order (MRO)
- is the order in which methods are inherited from a hierarchy of classes. This is particularly important in multiple inheritance scenarios, where a class may inherit from multiple parent classes.
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
- The C3 Linearization Algorithm is an algorithm used in Python to determine the order in which classes are considered (i.e., the Method Resolution Order, or MRO) when a method is called on an object. The Algorithm Steps are as follows
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

## Polymorphism
- is the ability of different objects to respond to the same method call in a way that is appropriate for their class.
### Types of Polymorphism
- **Method Overloading (Compile-Time Polymorphism):** refers to the ability to define multiple methods with the same name but different signatures (i.e., different parameters).
  ```python
  class Example:
      def add(self, a, b, c=0):
          return a + b + c

  obj = Example()
  print(obj.add(1, 2))                  # Output: 3 (uses two arguments)
  print(obj.add(1, 2, 3))               # Output: 6 (uses three arguments)
  ```
- **Method Overriding (Runtime Polymorphism):** occurs when a child class provides a specific implementation of a method that is already defined in its parent class. 
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
### Duck typing
- is a form of polymorphism where the actual type of an object is less important than the methods it supports. The name comes from the saying: "If it looks like a duck, swims like a duck, and quacks like a duck, then it probably is a duck."
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
### Operator Overloading
- allows you to define or change the behavior of built-in operators (+, -, *, etc.) when they are applied to objects of a user-defined class. This is done by defining special methods in the class that correspond to the operators.
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

## Magic (or Dunder) Methods:
- are special methods that are automatically invoked by Python in response to certain operations or events. 
- These methods are not meant to be called directly by the user but are used internally by Python to execute specific behaviors.
### Commonly Used Magic (Dunder) Methods
- **Initialization and Representation Methods**
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
- **Arithmetic Operator Methods**
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
- **Comparison Operator Methods**
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
- **Unary Operator Methods**
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
- **Container Methods**
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
- **Customizing Object Lifecycle Methods**
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

## Composition: 
- is a design principle where one class contains references to one or more objects of other classes as part of its attributes
### Example
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
### Composition vs. Inheritance
- Type of Relationship
  - Inheritance represents an "is-a" relationship where a subclass inherits properties and behaviors from a parent class. For example, a Dog class might inherit from an Animal class, implying that a dog "is a" type of animal.
  - Composition represents a "has-a" relationship where a class contains one or more objects of other classes. For example, a Car class might have an Engine object, implying that a car "has an" engine.
- Coupling
  - Inheritance creates a strong coupling between the parent and child classes. Changes in the parent class can have unintended effects on all child classes.
  - Composition leads to looser coupling, as the composed objects can be replaced or changed independently of the containing class.
- Hierarchy
  - Inheritance is typically used in a single hierarchy, where classes form a tree-like structure.
  - Composition allows classes to be made up of multiple components, each handling a specific aspect of the functionality.
### Delegation
- In delegation, the composed object (i.e., the component) handles certain tasks on behalf of the containing class. This is done by calling methods of the composed object directly from the containing class. The difference lies in the fact that the containing class has more control and can potentially alter the method signature, perform additional operations before or after the delegate's method call, or even modify the arguments or return value.
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

# Advanced OOP Topics

## Name Mangling
- is the process by which Python internally changes the name of a private attribute or method to include the class name as a prefix. This transformation helps to protect the attribute or method from accidental access or modification outside the class.
- When you define a private attribute or method using a double underscore prefix (`__`), Python automatically changes its name to `_ClassName__AttributeName`. This new name is used internally to refer to the attribute or method.
### Example
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
### Name Mangling in Subclass
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
### Limitations of Name Mangling
  - Not True Privacy as access still possible: Name mangling is not intended to provide true privacy. It is simply a way to avoid accidental access. Since the name-mangled version of the attribute can still be accessed from outside the class, it doesn't prevent deliberate access.
  - No Protection Across Modules: Name mangling only works within the same module. If you import the class into another module, you can still access the name-mangled attributes and methods.
  - Potential for Misuse as it only Discourages Direct Access: Name mangling discourages direct access to private attributes and methods by making their names less obvious, but it doesn't make it impossible. Developers should respect the intended privacy of these members.

## Metaclasses in Python
### Introduction to Metaclasses
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
### Why Use Metaclasses?
- Customization: Metaclasses allow you to customize the class creation process, enabling you to control how classes are constructed, modify the class before it is fully created, or even automatically add new methods or attributes.
- Enforcing Rules: Metaclasses can enforce certain rules or patterns in your class design, ensuring consistency across multiple classes without having to manually add the same code to each one.
- Automatic Registration: They can be used to automatically register classes in a registry or perform other actions when classes are defined.
### The `__new__()` and `__init__()` Methods in Metaclasses
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
### Metaclass Use Cases
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
### Metaclasses and Inheritance: Metaclasses follow the inheritance chain just like classes do. If you inherit from a class with a metaclass, the child class will automatically use the same metaclass unless you explicitly override it.
  ```python
  class MyMeta(type):
      pass

  class BaseClass(metaclass=MyMeta):
      pass

  class SubClass(BaseClass):
      pass

  print(type(SubClass))  # Output: <class '__main__.MyMeta'>
  ```

## Custom Object Creation
### `__init__()` and `__new__()`: 
- `__init__()` is commonly used for initializing objects after they’ve been created
- `__new__()` gives you control over the actual creation of the object itself
### The `__new__()` Method
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
### The `__init__()` Method
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
### `__new__()` vs. `__init__()`
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
### Use Cases for Custom Object Creation
- **Immutable Objects:** cannot be modified after they are created. Overriding `__new__()` is necessary when you want to customize how these objects are created.
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
- **Singleton Pattern:** ensures that only one instance of a class is created.
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
- **Customizing Object Creation with Metaclasses:** Metaclasses can customize object creation by defining or altering the class itself.
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

## Class Decorators
### Basics
- A class decorator is a function that is applied to a class to modify or extend its behavior.
- It takes a class as its input and returns either the same class or a modified version of it.
### Example
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
### Applying Decorators to Classes
- **Chaining Multiple Class Decorators:** You can chain multiple decorators on a single class, with each decorator being applied in the order they are listed.
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
- **Validating Class Attributes:** A class decorator can be used to validate that certain required attributes or methods are present in a class.
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
- **Automatically Registering Classes:** Class decorators can also be used to automatically register classes in a registry or to perform other automatic setup tasks.
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
- **Combining Class Decorators with Metaclasses:** In advanced scenarios, you might combine class decorators with metaclasses to achieve even more powerful customizations.
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
### Class Decorators vs. Metaclasses: 
- While both class decorators and metaclasses can be used to modify classes, they serve different purposes and have different use cases:
- **Class Decorators**
  - **Simplicity:** Easier to write and understand, making them ideal for simpler modifications.
  - **Focus:** Best for modifying or enhancing a single class or a small set of classes.
  - **Order of Execution:** Applied after the class is created.
- **Metaclasses**
  - **Power:** More powerful and flexible, allowing deep customization of class behavior.
  - **Breadth:** Suitable for controlling the creation and behavior of multiple related classes in a consistent way.
  - **Order of Execution:** Applied during class creation, before the class decorator.

## Descriptor Protocol
### Basics
- The descriptor protocol is a set of methods (`__get__()`, `__set__()`, and `__delete__()`) that allow an object to manage attribute access in another object. 
- Descriptors are objects that implement one or more of these methods.
### `__get__()` Method
- Called when an attribute is accessed. It retrieves the attribute value.
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
### `__set__(self, instance, value)`
- Called when an attribute is assigned a value. It handles the attribute assignment.
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
### `__delete__(self, instance)`
- Called when an attribute is deleted. It handles the attribute deletion.
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
### Types of Descriptors
- Descriptors can be categorized based on which methods of the descriptor protocol they implement.
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
### Use Cases for Descriptors
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

## Mixins
### Introduction
- A mixin is a class that provides methods to be used by other classes through multiple inheritance.
- A mixin is not meant to stand on its own; instead, it’s designed to be combined with other classes to add specific functionality.
### Characteristics of Mixins
- **No Instantiation:** Mixins are not meant to be instantiated on their own. They are designed to be used in conjunction with other classes.
- **Single Responsibility:** A mixin typically provides one specific piece of functionality or behavior. This makes it easier to compose multiple mixins into a single class.
- **Use with Multiple Inheritance:** Mixins are most effective when used with multiple inheritance, allowing you to "mix in" the desired behavior into a class that already inherits from another base class.

### Practical Use Cases for Mixins
- **Example: Adding Serialization Capabilities**
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
- **Example: Adding Access Control**
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
### Mixins vs. Inheritance
- **Purpose**
  - Traditional inheritance is used to create a new class that is a specialized version of an existing class. It represents an "is-a" relationship, where the subclass is a specific type of the superclass.
  - Mixins are used to add specific, reusable pieces of functionality to a class. They do not represent an "is-a" relationship but rather a "has-a" relationship or a "can-do" capability. Mixins are not meant to be standalone classes; they are designed to be used in combination with other classes.
- **Coupling**
  - Classes in a traditional inheritance hierarchy are tightly coupled. Changes to the parent class can have wide-reaching effects on all subclasses, which may lead to unintended consequences or require significant refactoring.
  - Mixins allow for loose coupling between the behavior they provide and the classes that use them. Mixins can be added or removed without affecting the overall class hierarchy, making the system more flexible and easier to modify.
- **Inheritance Path**
  - Traditional inheritance typically follows a single path, where each class is a specialization of its parent. 
  - Mixins promote composition over inheritance. A class can be composed of multiple mixins, each providing a small piece of functionality. 
- **Example**
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

## Creating Custom Immutable Objects
### Introduction to Immutable Objects
- An immutable object is an object whose data or state cannot be changed after it is created. Once you create an immutable object, you cannot modify its attributes or the contents it holds.
- Common Immutable Types in Python: `int`, `float`, `str`, `tuple`, `frozenset`, `bytes`
### Example
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
### Using `__new__()` for Immutability:
- For immutable types like tuples or strings, Python uses the `__new__()` method rather than `__init__()` to create instances. Similar approach can be used in the custom immutable classes.
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
### Properties of Immutable Objects
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

# Best Practices and Tips for OOP in Python

## Design Principles
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

## Code Organization
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

## Practical Tips for Writing OOP Code
- **Use Properties to Control Attribute Access:** Use properties to control how attributes are accessed and modified, especially if you need to enforce constraints or trigger side effects when an attribute is set.
- **Leverage Python’s Special Methods:** Python’s special methods (also known as dunder methods) allow you to define how objects of your class behave in certain operations, such as addition, comparison, and string representation.
  - Implement `__str__()` and `__repr__()` to provide meaningful string representations of your objects.
  - Implement comparison methods like `__eq__()`, `__lt__()`, and `__hash__()` to enable object comparison and usage in sets and dictionaries.
- **Avoid Premature Optimization:** Focus on writing clean, readable code before worrying about optimization. Premature optimization can lead to complex code that is difficult to maintain.
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

## Testing and Debugging
- **Write Unit Tests:** Write unit tests for your classes to ensure that they behave as expected. Testing helps catch bugs early and makes your code more reliable.
- **Write Unit Tests:** Write unit tests for your classes to ensure that they behave as expected. Testing helps catch bugs early and makes your code more reliable.
- **Use Logging for Debugging and Monitoring:** Use logging to track the execution of your program and diagnose issues. Logging provides insight into how your code is running and can help identify problems.
  - Use the logging module to log messages at different levels (DEBUG, INFO, WARNING, ERROR, CRITICAL).
  - Avoid using print() statements for debugging; logging is more flexible and can be configured to write to different outputs.

## Performance Considerations
- **Object Creation:** Creating and destroying objects can be costly in terms of memory and performance. Be mindful of how often objects are created, especially in tight loops or high-performance sections of your code.
  - Consider using object pools or reusing objects where appropriate.
  - Avoid unnecessary object creation inside loops.
- **Optimize with Built-In Data Structures:** Use Python’s built-in data structures (`list`, `dict`, `set`, `tuple`) efficiently. They are optimized for performance and should be preferred over custom implementations unless necessary.
  - Avoid unnecessary conversions between data structures.
- **Profile and Optimize Bottlenecks:** Use profiling tools (eg `cProfile`, `timeit`) to identify performance bottlenecks in your code. Optimize only the parts of the code that are proven to be slow.

## Collaboration and Code Maintenance
- **Write Clear and Understandable Code:** Prioritize writing clear and understandable code. Clear code is easier for others to read, understand, and maintain.
  - Use meaningful variable and method names.
  - Avoid writing overly clever or obscure code.
- **Keep Your Code DRY (Don’t Repeat Yourself):** Avoid duplicating code. Reuse code through functions, classes, and modules to reduce redundancy and make maintenance easier.
  - If you find yourself copying and pasting code, consider refactoring it into a reusable function or method.
  - Use inheritance or mixins to share behavior across classes.
