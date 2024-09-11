# Overview of NestJS

## What is NestJS?
- NestJS is a progressive **Node.js framework** that builds efficient, reliable, and scalable server-side applications.
- It’s built with and fully supports **TypeScript**, but can also accommodate **JavaScript**.
- NestJS draws heavily on the concepts of **object-oriented programming (OOP)**, **functional programming (FP)**, and **functional reactive programming (FRP)**.

## Advantages
- **Modularity:** NestJS applications are split into small, reusable modules. This structure allows you to easily separate concerns, organize your code, and scale the application as it grows.
- **TypeScript Benefits:**
  - **Type Safety:** As NestJS is built with TypeScript, it offers static type-checking, reducing runtime errors and improving developer productivity.
  - **Modern JavaScript:** You can use all ES6+ features, including async/await, classes, and decorators.
- **Extensibility:** NestJS provides out-of-the-box support for many libraries and tools, including `TypeORM` (for working with databases), `Passport.js` (for authentication), `Bull` (for queues), and more.
- **Scalability:** Designed with scalability in mind, NestJS offers support for microservices, allowing applications to scale across multiple servers or services, promoting a highly flexible architecture.
- **Efficient Routing and Middleware:** Leveraging `Express.js` (or `Fastify`), `NestJS` uses the powerful routing and middleware capabilities of these frameworks. Middleware in `NestJS` helps in tasks like logging, authentication, and request transformation, keeping the controllers clean and focused.
- **Enterprise-Grade Application Development:** NestJS simplifies the development of large-scale applications with dependency injection, service-oriented architecture, and support for modular design patterns. These features are crucial for building maintainable and robust applications.

## Feature benefits
- **Decorator-Based API:** NestJS uses decorators to provide a clean, declarative approach to handling controllers, services, and modules. Decorators make it easier to grasp the flow of data within the application. For instance, the `@Controller` and `@Get` decorators help define routes cleanly.
- **Dependency Injection:** One of the core concepts in NestJS is dependency injection. It allows services to be injected into controllers and other services, promoting a cleaner separation of concerns. This pattern leads to more maintainable and testable code.
- **Modular Architecture:** NestJS encourages a modular architecture, allowing developers to break their application into multiple feature modules. Each module handles a specific domain or functionality, which makes it easier to manage and scale large applications.
  - Example: You could have separate modules for authentication, user management, database interaction, etc.
- **Middleware and Interceptors:** Middleware can be used to manipulate requests before they reach the route handlers, for purposes like logging, validation, or authentication. Interceptors, on the other hand, handle the response transformation, logging, or error handling after the request is processed.
- **Express and Fastify Support:** By default, NestJS is built on top of Express.js, but it can also integrate with Fastify, a high-performance Node.js framework, to improve the speed and efficiency of your application.
- **Cross-Platform Applications:** NestJS can be used to build not just REST APIs but also GraphQL APIs, WebSocket-based applications, and microservices. This makes it a versatile choice for various types of server-side applications.

## Comparison with Other Frameworks (Express, Koa, etc.)
- While Node.js frameworks like Express.js and Koa.js are popular, NestJS offers several advantages that make it stand out.
- **Opinionated Framework:** Unlike **Express.js**, which is unopinionated and leaves architectural decisions to the developer, NestJS provides a highly structured and opinionated framework. This means the code organization is consistent and promotes best practices, leading to better-maintained codebases.
- **TypeScript First:** While frameworks like **Express** and **Koa** can be used with **TypeScript**, they do not provide built-in support. NestJS is designed around **TypeScript**, offering first-class support and out-of-the-box tools for static type checking.
- **Built-in Dependency Injection:** NestJS comes with a built-in dependency injection system, making it easier to write modular, maintainable, and testable code. Express and Koa don’t offer DI out-of-the-box and require external libraries or custom solutions.
- **Modular Design:** NestJS’s modular architecture is designed to scale with your application. It’s easy to break large applications into smaller, reusable modules. In contrast, Express applications typically require a more manual approach to structuring large codebases.

## Setting Up a New NestJS Project
### Pre-requisites
- Install nodejs.
```bash
node -v  # verify node installation
```
- Install a package manager (eg npm).
```bash
npm -v  # verify npm installation
```
- Install NestJS CLI
```bash
npm install -g @nestjs/cli  # install nestjs cli
nest --version              # verify nestjs installation
```
### Getting started with NestJS Project
- Create a new NestJS Project
```bash
nest new project-name  # create a new nestjs project
```
- Understanding the Project Structure
```bash
src/
  ├── app.controller.ts         # Sample controller
  ├── app.controller.spec.ts    # Test for controller
  ├── app.module.ts             # Root module
  ├── app.service.ts            # Sample service
  └── main.ts                   # Entry point of the application
test/
  └── app.e2e-spec.ts           # End-to-end test
  └── jest-e2e.json             # Jest configuration for e2e tests
nest-cli.json                   # Configuration for Nest CLI
package.json                    # Project dependencies
tsconfig.json                   # TypeScript configuration
```
  - app.controller.ts: Contains a basic controller, which handles HTTP requests. The controller routes incoming requests to appropriate services.
  - app.module.ts: The root module of your application, which imports other modules and connects components like controllers and providers.
  - app.service.ts: A service provider that contains the business logic of the application. Services are typically injected into controllers.
  - main.ts: The entry point of the application where the NestJS app is bootstrapped.
  - package.json: Contains the list of dependencies and scripts for your application.
  - tsconfig.json: Configuration file for TypeScript compiler settings.
- Running the Application
```bash
npm run start       # run the application
npm run start:dev   # run application in development mode with hot-reload
npm run start:prod  # run application in production mode
```
### Exploring the First Application
- **main.ts** (application starting point)
```typescript
import { NestFactory } from '@nestjs/core';   // NestFactory: Used to create the application instance.
import { AppModule } from './app.module';     // AppModule: The root module of your application.

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    await app.listen(3000);                     // app.listen(3000): Starts the HTTP server on port 3000.
}
bootstrap();
```
- **app.module.ts** (Default Module)
```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
    imports: [],                  // imports: This is where you import other modules that you want
    controllers: [AppController], // controllers: array includes the controllers that belong to this module.
    providers: [AppService],      // providers: array contains the services and other providers that will be available to the controllers.

})
export class AppModule {}
```
- **app.controller.ts** (Default Controller)
```typescript
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()                           // @Controller(): Declares a controller.
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()                                // @Get(): Maps HTTP GET requests to the specified route.
    getHello(): string {
        return this.appService.getHello();  // appService.getHello(): Calls the getHello() method from the service.
    }
}
```
- **app.service.ts** (Default Service)
```typescript
import { Injectable } from '@nestjs/common';

@Injectable()     // @Injectable(): Marks a class as a service that can be injected into controllers or other components.
export class AppService {
    getHello(): string {
        return 'Hello World!';
    }
}
```
## High-Level Application Flow
### Flow
- A client sends a request.
- The request is routed to the appropriate controller.
- The controller calls a service to handle the business logic.
- The service processes the request and returns a response to the controller.
- The controller sends the response back to the client.

## Key Components
### Modules: Organizing Your Application
- In NestJS, every application begins with a module.
- Modules are essential for grouping related components like controllers, services, and providers.
- The root module, typically called `AppModule`, bootstraps the entire application.
- **Responsibilities**
  - **Organization:** Modules group related functionality, making the application modular.
  - **Scalability:** As the application grows, new modules can be created to handle specific features (e.g., UserModule, AuthModule).
### Controllers: Handling Incoming Requests
- Controllers in NestJS handle incoming HTTP requests and return appropriate responses.
- They are decorated with the `@Controller()` decorator, and specific routes are defined with decorators like `@Get()`, `@Post()`, `@Put()`, etc.
- **Responsibilities**
  - **Routing:** Controllers handle the routing logic by mapping specific HTTP requests to methods.
  - **Delegation:** Controllers typically delegate business logic to services and focus solely on request handling and response generation.
### Services: Handling Business Logic
- Services contain the core business logic of the application.
- They are marked with the `@Injectable()` decorator, which allows them to be injected into controllers and other services using NestJS’s dependency injection system.
- **Responsibilities**
  - **Encapsulation:** Services encapsulate the core logic, keeping controllers lightweight.
  - **Reusability:** Services can be injected into multiple controllers or modules, improving code reusability and separation of concerns.
### The Main Application Entry Point (main.ts)
- **Responsibilities**
  - **Bootstrapping:** The main.ts file is where the application starts. It calls the bootstrap function to initialize the application.
  - **Application-Level Configuration:** This is also where you can apply global middleware, security configurations, and other application-wide settings.