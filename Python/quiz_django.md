# Question 1
## Tags
#django #request_flow
## Question
Which of these flow best depicts the request processing in Django?
## Options
- [ ] setting.py -> manage.py -> urls.py -> models.py -> views.py ->  templates
- [ ] manage.py -> setting.py -> urls.py -> views.py -> models.py -> templates
- [ ] setting.py -> manage.py -> urls.py -> models.py -> views.py -> templates
- [ ] manage.py -> setting.py -> urls.py -> views.py -> models.py -> templates
## Answer
2. manage.py -> setting.py -> urls.py -> views.py -> models.py -> templates

# Question 2
## Tags
#django #urls
## Question
What happens if none of the urls match the request?
## Options
- [ ] Django returns a 404 error.
- [ ] Django returns a 500 error.
- [ ] Django returns a 405 error.
- [ ] Django returns a 200 error.
## Answer
1. Django returns a 404 error.

# Question 3
## Tags
#django #mvt #view
## Question
What is a `View` in `MVT` architecture?
## Options
- [ ] Handles what the user sees (UI).
- [ ] Handles the database and business logic (data layer).
- [ ] Handles the presentation (HTML/CSS) and renders the data sent by the view.
- [ ] Handles the business logic and interacts with the model.
## Answer
4. Handles the business logic and interacts with the model.

# Question 4
## Tags
## Question
What is a `Template` in `MVT` architecture?
## Options
- [ ] Handles what the user sees (UI).
- [ ] Handles the database and business logic (data layer).
- [ ] Handles the presentation (HTML/CSS) and renders the data sent by the view.
- [ ] Handles the business logic and interacts with the model.
## Answer
3. Handles the presentation (HTML/CSS) and renders the data sent by the view.

# Question 5
## Tags
#django #wsgi
## Question
Which of these files work as an entry point for a Django project, also used by web servers to serve the project?
## Options
- [ ] `settings.py`
- [ ] `urls.py`
- [ ] `manage.py`
- [ ] `wsgi.py`
## Answer
4. `wsgi.py`

# Question 6
## Tags
## Question
Which of these Databases serve as a default Database for Django?
## Options
- [ ] `sqlite`
- [ ] `mysql`
- [ ] `postgresql`
- [ ] `oracle`
## Answer
1. `sqlite`

# Question 7
## Tags
#django #port
## Question
What is the default port number for Django project?
## Options
- [ ] 8080
- [ ] 8000
- [ ] 8001
- [ ] 8081
## Answer
2. 8000

# Question 8
## Tags
#django #migrations
## Question
Which of these commands are used to create a migration file in Django?
## Options
- [ ] `python manage.py makemigrations`
- [ ] `python manage.py migrate`
- [ ] `python manage.py makemigration`
- [ ] `python manage.py sqlmigrate`
## Answer
3. `python manage.py makemigration`

# Question 9
## Tags
#django #models #orm #query
## Question
How do you query `Select *` and `SELECT * WHERE` SQL queries using Django ORM?
## Options
- [ ] `Users.objects.all()` and `Users.objects.filter()`
- [ ] `Users.objects.all()` and `Users.objects.get()`
- [ ] `Users.objects.get()` and `Users.objects.filter()`
- [ ] `Users.objects.get()` and `Users.objects.all()`
## Answer
1. `Users.objects.all()` and `Users.objects.filter()`

# Question 10
## Tags
#django #models #orm #query #filter #get
## Question
Which of these is true for `get()` and `filter()` methods in Django ORM, based on the number of objects returned?
## Options
- [ ] both `get()` and `filter()` return list of objects.
- [ ] both `get()` and `filter()` return a single object.
- [ ] `get()` returns a single object, while `filter()` returns a list of objects.
- [ ] `get()` returns a list of objects, while `filter()` returns a single object.
## Answer
3. `get()` returns a single object, while `filter()` returns a list of objects.

# Question 11
## Tags
#django #models #orm #query #filter #get
## Question
Which of these is true for `get()` and `filter()` methods in Django ORM, when no objects match the query?
## Options
- [ ] both `get()` and `filter()` return and empty `QuerySet`.
- [ ] both `get()` and `filter()` return `None`.
- [ ] `get()` returns `None`, while `filter()` returns an empty `QuerySet`.
- [ ] `get()` throws an error, while `filter()` returns an empty `QuerySet`.
## Answer
4. `get()` throws an error, while `filter()` returns an empty `QuerySet`.

# Question 10
## Tags
## Question
Which exceptions is raised by `get()` method in Django ORM, when more than one object match the query?
## Options
- [ ] 
## Answer







# Question 10
## Tags
## Question
## Options
## Answer