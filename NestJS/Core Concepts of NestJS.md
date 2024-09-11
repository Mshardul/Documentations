# Lifecycle Events in NestJS

## What are Lifecycle Events?
- NestJS provides several hooks that you can tap into during different phases of the application’s lifecycle.
- These hooks give you the opportunity to perform actions such as initializing services, connecting to databases, or cleaning up resources during application shutdown.
- The lifecycle events in NestJS can be divided into two broad categories:
  - **Application Lifecycle Events:** Manage the lifecycle of the entire application, including startup and shutdown.
  - **Request Lifecycle Events:** Manage the flow of an individual HTTP request as it passes through middleware, guards, pipes, interceptors, and filters.

## Application Lifecycle Events:
- `onModuleInit():` Called when a module is initialized.
  - used to perform initialization logic for a specific module or service, such as establishing a database connection or fetching some essential data.
- `onModuleDestroy():` Called when a module is destroyed.
  - used for cleaning up resources such as closing database connections or stopping background tasks when a module is no longer needed.
- `beforeApplicationShutdown(signal: string):` Called before the application shuts down.
  - used for handling graceful shutdowns, such as notifying other services or closing connections before the application terminates.
- `onApplicationBootstrap():` Called once the application has bootstrapped and is ready.
  - used for starting background jobs, scheduling tasks, or performing tasks that require the application to be fully initialized.
- `onApplicationShutdown(signal: string):` Called when the application is shutting down.
  - used for cleaning up resources and performing final shutdown procedures, like logging shutdown events or closing remaining connections.
- `afterApplicationBootstrap():` Called immediately after `onApplicationBootstrap()`, but after all other hooks and lifecycle events have been triggered.
  - used for performing post-initialization checks or tasks after everything else has been initialized in the application.

## Request Lifecycle Events
- `Middleware:` Executes before the request reaches the route handlers (controllers).
  - Useful for logging, authentication, or modifying requests, such as adding custom headers or logging request details.
- `Guards:` Executes before route handlers, used to determine whether the current request is authorized to access a particular route.
  - Useful for authorization checks, such as validating JWT tokens or implementing role-based access control.
- `Interceptors (before request):` Executes before the controller method is invoked, allowing you to modify or transform the incoming request.
  - Useful for logging request metadata, transforming data, or performing cross-cutting concerns like caching.
- `Pipes (before request):` Validates and transforms incoming request data before it reaches the controller.
  - Useful for validating input data, converting types, or ensuring that the data adheres to predefined schemas.
- `Controllers:` Handle incoming HTTP requests and return responses.
  - Controllers delegate logic to services and are responsible for processing incoming requests and sending out responses.
- `Interceptors (after request):` Executes after the controller method has completed and before the response is sent back to the client, allowing you to transform the outgoing response.
  - Useful for modifying responses, adding headers, measuring execution times, or implementing caching strategies.
- `Exception Filters:` Catches exceptions thrown during request processing and sends an appropriate response to the client.
  - Useful for handling global or specific errors, returning custom error messages, and sending proper HTTP status codes for different types of exceptions.
- `Response:` The final stage where the processed response is sent back to the client.
  - This stage handles the delivery of the final response to the client, after all other lifecycle stages (middleware, guards, pipes, interceptors, and filters) have processed the request and response.


# Chapter 2: Core Concepts of NestJS

## Deep Dive into Modules
- What are Modules in NestJS?
- Creating and Using Modules
- Organizing Application with Feature Modules
- Dynamic Modules Explained
- Global Modules

## Understanding Controllers
- Defining Controllers in NestJS
- Routing in NestJS Controllers
- Handling Route and Query Parameters
- Asynchronous Controllers
- Advanced Routing Techniques

## Providers and Services
- What are Providers in NestJS?
- Using Services for Business Logic
- Provider Injection and Scope
- Asynchronous Providers
- Custom Providers and Factories

## Dependency Injection in NestJS
- How Dependency Injection Works
- Injecting Dependencies in Controllers and Services
- Optional and Custom Providers
- Handling Circular Dependencies

## Exploring Pipes
- Introduction to Pipes
- Built-in Pipes for Data Validation and Transformation
- Creating Custom Pipes
- Applying Pipes Globally, Per Route, and Per Parameter
- Error Handling in Pipes

## Guards and Authorization
- What are Guards in NestJS?
- Role of Guards in Authorization
- Creating Custom Guards
- Combining Guards with Middleware
- Guarding Routes Based on Roles

## Filters and Exception Handling
- Built-in Exception Filters in NestJS
- Creating Custom Exception Filters
- Global Exception Filters
- Handling Synchronous and Asynchronous Exceptions
- Common Error Handling Patterns

## Interceptors for Response Transformation
- Introduction to Interceptors
- Using Interceptors for Response Manipulation
- Logging and Monitoring with Interceptors
- Handling Errors in Interceptors
- Applying Interceptors Globally or Per Route

## Middleware in NestJS
- Introduction to Middleware in NestJS
- Applying Middleware to Routes and Controllers
- Creating Custom Middleware
- Request Lifecycle with Middleware
- NestJS vs Express Middleware