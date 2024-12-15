# Overview of Django

## Why choose Django over other frameworks?
- All-in-one Framework:
    - Comes with ORM, admin interface, authentication, and templating out of the box.
    - Suitable for both small MVPs and enterprise-grade projects.
- Secure by Design:
    - Prevents common vulnerabilities like SQL injection, XSS, and CSRF.
    - Regularly updated to address new security concerns.
- Active Community and Documentation:
    - Large developer base for support.
    - Comprehensive and beginner-friendly documentation.
- Examples of Real-World Use:
    - Social networks like Instagram.
    - Content management systems like Wagtail CMS.
    - E-commerce platforms with dynamic catalogs and cart functionality.

## Key features of Django
- **Object-Relational Mapping (ORM):** interacts with databases using Python objects instead of raw SQL.
    ```python
    # Model
    class Book(models.Model):
        title = models.CharField(max_length=100)
        author = models.CharField(max_length=50)
        published_date = models.DateField()

    # Querying the DB
    books = Book.objects.filter(author="John Doe")
    ```
- **Admin Interface:** auto-generated and customizable interface for managing data.
    ```python
    from django.contrib import admin
    from .models import Book

    admin.site.register(Book)
    ```
- **Templating System:** dynamically renders HTML using Django Template Language (DTL).
    ```python
    <h1>{{ book.title }}</h1>
    <p>Author: {{ book.author }}</p>
    ```
- **Middleware:** processes requests and responses globally.
    ```python
    class CustomMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        print("Before view")
        response = self.get_response(request)
        print("After view")
        return response
    ```

## Benefits of using Django for rapid development
- **Faster Development**: Prebuilt components like ORM, admin panel, and authentication accelerate the process.
- **Scalability**: Supports caching, database optimization, and load balancing for high-traffic applications.
- **Maintainability**: Enforces a clean project structure and reusability through modular apps.

# MVC vs. MVT Architecture

## What is MVC architecture?
- **Model:** Manages data and business logic. Defines data structure.
- **View:** Handles user interface and presentation. HTML templates.
- **Controller:** Processes user input and communicates between Model and View. Routes requests and updates the model.

## Understanding MVT in Django
- **Model:** Defines the database schema and logic.
- **View:** Processes HTTP requests and prepares data.
- **Template:** Defines how data is presented to the user.
- **Example**
    ```python
    # Model
    class Task(models.Model):
        name = models.CharField(max_length=100)
        completed = models.BooleanField(default=False)

    # View
    from django.shortcuts import render
    from .models import Task

    def task_list(request):
        tasks = Task.objects.all()
        return render(request, 'task_list.html', {'tasks': tasks})

    # Template
    <ul>
        {% for task in tasks %}
            <li>{{ task.name }} - {% if task.completed %}Done{% else %}Pending{% endif %}</li>
        {% endfor %}
    </ul>
    ```

# Setting Up Django

## Installing Django
```bash
# verify Python installation
$ python3 --version

# set up virtual environment
$ python3 -m venv myenv

# activate virtual environment
$ source myenv/bin/activate

# install Django
$ pip install django
```

## Creating Your First Django Project
```bash
# create a new Django project
$ django-admin startproject myproject

# initialize a Django app with startapp
$ python manage.py startapp myapp
```

## Django Project File Structure
```bash
myproject/
    manage.py
    myproject/
        __init__.py
        settings.py
        urls.py
        asgi.py
        wsgi.py
```

## Register the app
- Add the app to the `INSTALLED_APPS` list in `settings.py`
```bash
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'myapp',  # Register your app here
]
```

## Starting Development Server
```bash
$ python manage.py runserver
```

## Accessing the Default Page
- Open a browser and navigate to http://127.0.0.1:8000/


# Django Project Structure Overview

## Project vs. app: Key differences
- **Project:** The overarching structure containing configurations and multiple apps. Example: A website for e-commerce.
- **App:** A modular component focusing on a specific feature. Example: A products app for managing inventory.
- A project can contain multiple apps, and an app can belong to multiple projects if designed as a reusable package.

## Customizing settings for your project
- Updating `ALLOWED_HOSTS`: Specify the domains that can serve the app:
    ```python
    ALLOWED_HOSTS = ['127.0.0.1', 'mydomain.com']
    ```
- Configuring static files: Add this in `settings.py`:
    ```python
    STATIC_URL = '/static/'
    STATICFILES_DIRS = [BASE_DIR / "static"]
    ```
- Setting up the database: an Example with PostgreSQL
    ```python
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': 'mydatabase',
            'USER': 'myuser',
            'PASSWORD': 'mypassword',
            'HOST': 'localhost',
            'PORT': '5432',
        }
    }
    ```


# Core Concepts
## URL Dispatcher and Routing
- Django’s URL dispatcher maps URLs to views, determining how requests are handled. 
- It acts as a controller in the MVT architecture:
    - URLs are defined in urls.py.
    - Each URL pattern is matched in sequence until a match is found.
- Key features:
    - Clean, human-readable URLs.
    - Support for dynamic segments (e.g., `/user/<id>`).
    - Easy-to-organize hierarchical routing.

### Defining URL patterns in urls.py
- URL patterns are defined as a list of path() or re_path() entries in `urls.py`:
    ```python
    from django.urls import path
    from . import views

    urlpatterns = [
        path('', views.home, name='home'),
        path('about/', views.about, name='about'),
    ]
    ```
- **path:** Simplified URL patterns with optional converters.
- **name:** Names the route for easy reference in templates.

### Using path converters for dynamic URLs
- Path converters extract variables from URLs and pass them as arguments to views.
- Common converters include:
    - **str:** Matches any string (default).
    - **int:** Matches integers.
    - **slug:** Matches hyphenated text.
    - **uuid:** Matches UUIDs.
- **Example**
    ```python
    # urls.py
    urlpatterns = [
        path('user/<int:id>/', views.user_profile, name='user_profile'),
    ]
    # views.py
    def user_profile(request, id):
        return HttpResponse(f"User ID: {id}")
    ```

### Best practices for organizing URL configurations
- **Modular URLs**
    - Divide URLs into app-specific `urls.py` files.
    - Use `include()` for routing.
    ```python
    from django.urls import include
    urlpatterns = [
        path('blog/', include('blog.urls')),
    ]
    ```
- **Named URLs**
    - Use name for easier template integration
    ```html
    <a href="{% url 'home' %}">Home</a>
    ```
- **Consistent Patterns**
    - Maintain consistency in route naming and organization for readability.





### Introduction to Django’s URL dispatcher
### Defining URL patterns in `urls.py`
### Using path converters for dynamic URLs
### Best practices for organizing URL configurations

## Writing Function-Based Views
### What are views in Django?
### Creating and returning HTTP responses
### Rendering templates using views
### Handling GET and POST requests in views

## Rendering Templates with Context
### Introduction to Django templates
### Passing data to templates using context dictionaries
### Using template variables in HTML
### Understanding template inheritance (base templates and blocks)

## Using Django’s Development Server
### Running the development server with `manage.py runserver`
### Managing server output and debugging errors
### Testing changes without restarting the server
### Using the `runserver` command with custom options (e.g., specifying ports)