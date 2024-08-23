# SOLID Principles

## Quick Glance
### Single Responsibility Principle (SRP)
- **One Class, One Job:** If you describe what a class does in more than one sentence, it probably has more than one responsibility.
### Open/Closed Principle (OCP)
- **Extend, Don’t Modify:** Instead of changing existing code, add new code (like new classes or methods) to achieve new functionality.
### Liskov Substitution Principle (LSP)
- **Substitute Without Breaking:** Any instance of a subclass should replace a superclass instance without causing errors or altering the expected behavior.
### Interface Segregation Principle (ISP)
- **Small, Specific Interfaces:** Instead of one big interface, break it into smaller ones that are client-specific. Only implement what you need.
### Dependency Inversion Principle (DIP)
- **Depend on Abstractions, Not Concrete Classes:** High-level modules (business logic) should depend on interfaces or abstract classes, not specific implementations. This allows flexibility in changing implementations without affecting the system.

## Single Responsibility Principle (SRP)
### Basics
- It states that a class should have only one reason to change, meaning it should have only one job or responsibility.
- It ensures that each class is focused on a specific task, making it easier to understand, test, and maintain.
- **One Class, One Job:** If you describe what a class does in more than one sentence, it probably has more than one responsibility.
### Example
- Consider a class that handles both user data and email sending. This class has two reasons to change: if the user data structure changes or if the email sending mechanism changes.
  ```python
  """
  The UserData class is responsible for handling user data, while the EmailSender class is responsible for sending emails.
  By separating these responsibilities, each class adheres to the SRP, making the system easier to modify.
  If email sending logic changes, only the EmailSender class needs to be modified.
  """
  class UserData:
      def __init__(self, name, email):
          self.name = name
          self.email = email

      def get_details(self):
          return f"User: {self.name}, Email: {self.email}"

  class EmailSender:                          # Pull out EmailSender as a new class instead of combining with UserData
      def send_email(self, email, message):
          print(f"Sending email to {email}: {message}")

  user = UserData("John Doe", "john@example.com")
  email_sender = EmailSender()
  email_sender.send_email(user.email, "Welcome to our platform!")

  ```

## Open/Closed Principle (OCP)
### Basics
- It states that a class should be open for extension but closed for modification.
- In other words, the behavior of a class can be extended without modifying its source code, often achieved through inheritance or interfaces.
- **Extend, Don’t Modify:** Instead of changing existing code, add new code (like new classes or methods) to achieve new functionality.
### Example
- Suppose you have a Shape class and want to calculate the area of different shapes like rectangles and circles.
  ```python
  """
  The Shape class is an abstract class, which defines a contract for calculating the area.
  Rectangle and Circle classes extend the Shape class and implement the area method. 
  If you need to add a new shape, you can create a new class that inherits from Shape without modifying existing classes. 
  This approach follows the OCP by allowing extensions through new classes rather than changing existing code.
  """
  from abc import ABC, abstractmethod

  class Shape(ABC):
      @abstractmethod
      def area(self):
          pass

  class Rectangle(Shape):
      def __init__(self, width, height):
          self.width = width
          self.height = height

      def area(self):
          return self.width * self.height

  class Circle(Shape):
      def __init__(self, radius):
          self.radius = radius

      def area(self):
          return 3.14 * self.radius ** 2

  # Usage
  shapes = [Rectangle(5, 10), Circle(7)]
  for shape in shapes:
      print(f"Area: {shape.area()}")
  ```

## Liskov Substitution Principle (LSP)
### Basics
- It states that objects of a superclass should be replaceable with objects of a subclass without affecting the correctness of the program.
- In other words, subclasses should behave in a way that does not violate the expectations set by the superclass.
- **Substitute Without Breaking:** Any instance of a subclass should replace a superclass instance without causing errors or altering the expected behavior.
### Example
- Consider a Bird class with a fly method. A subclass Penguin inherits from Bird but cannot fly.
  ```python
  """
  The Penguin class violates the LSP because it cannot fulfill the fly method expected by the Bird class.
  A better design would be to avoid inheriting Penguin from Bird if it cannot fly or refactor the design to account for non-flying birds.
  """
  class Bird:
      def fly(self):
          return "Flying"

  class Sparrow(Bird):
      def fly(self):
          return "Sparrow flying"

  class Penguin(Bird):
      def fly(self):
          raise NotImplementedError("Penguins cannot fly")

  def let_bird_fly(bird: Bird):
      print(bird.fly())

  sparrow = Sparrow()
  penguin = Penguin()

  let_bird_fly(sparrow)
  let_bird_fly(penguin)             # raises an error
  ```

## Interface Segregation Principle (ISP)
### Basics
- It states that no client should be forced to depend on methods it does not use.
- It advocates for creating specific interfaces rather than a single, large, general-purpose interface.
- **Small, Specific Interfaces:** Instead of one big interface, break it into smaller ones that are client-specific. Only implement what you need.
### Example:
- Imagine a Printer interface with methods to print, scan, and fax. Not all devices can perform all these functions.
  ```python
  """
  Printer and Scanner are separate interfaces. 
  The SimplePrinter class only implements the Printer interface because it doesn't need to scan documents.
  The MultiFunctionDevice class implements both interfaces.
  This design adheres to the ISP by not forcing SimplePrinter to implement unnecessary methods.
  """
  from abc import ABC, abstractmethod

  class Printer(ABC):
      @abstractmethod
      def print(self, document):
          pass

  class Scanner(ABC):
      @abstractmethod
      def scan(self, document):
          pass

  class MultiFunctionDevice(Printer, Scanner):
      def print(self, document):
          print(f"Printing: {document}")

      def scan(self, document):
          print(f"Scanning: {document}")

  class SimplePrinter(Printer):
      def print(self, document):
          print(f"Printing: {document}")

  printer = SimplePrinter()
  printer.print("My Document")

  multi_function_device = MultiFunctionDevice()
  multi_function_device.print("Another Document")
  multi_function_device.scan("Another Document")
  ```

## Dependency Inversion Principle (DIP)
### Basics
- The Dependency Inversion Principle states that high-level modules should not depend on low-level modules. Both should depend on abstractions.
- Additionally, abstractions should not depend on details, and details should depend on abstractions.
- **Depend on Abstractions, Not Concrete Classes:** High-level modules (business logic) should depend on interfaces or abstract classes, not specific implementations. This allows flexibility in changing implementations without affecting the system.
### Example
- Consider an application where a UserService depends on a concrete EmailService.
  ```python
  """
  The UserService class depends on the EmailService abstraction rather than a concrete implementation.
  This allows UserService to work with any class that implements EmailService, adhering to the DIP.
  If you later switch to a different email service implementation, you can do so without modifying UserService.
  """
  from abc import ABC, abstractmethod

  class EmailService(ABC):
      @abstractmethod
      def send_email(self, message):
          pass

  class SmtpEmailService(EmailService):
      def send_email(self, message):
          print(f"Sending email via SMTP: {message}")

  class UserService:
      def __init__(self, email_service: EmailService):
          self.email_service = email_service

      def notify_user(self, message):
          self.email_service.send_email(message)

  email_service = SmtpEmailService()
  user_service = UserService(email_service)
  user_service.notify_user("Hello, User!")
  ```