# Basic Setup
- Install Node
- Verify Node
```bash
node -v
```
- Install Nest CLI
```bash
npm i -g @nestjs/cli
```
- Create a new Module
```bash
nest g module user
```
- Create Controller for the Module
```bash
nest g controller user
```
- Create Service (or provider) for the Module
```bash
nest g service user
```
- 

# Controller
- responsible for handling incoming requests and returning responses to the client.
- The `routing mchanism` controls which controller receives which request. 
## Controller Skeleton
```typescript
import {
  Controller, Body, Param, Query
  Get, Post, Patch, Delete
} from '@nestjs/common';
import { UserService } from './users.service';

@Contoller('users')           // controller for '/users[...]'
export class UsersController {

  constructor(private readonly usersService: UsersService)

  @Get()                      // GET /users or /users?role=value
  getUsers(@Query('role') role?: 'Client' | 'Admin') {}

  @Get(':id')                 // GET /users/:id
  getUser(@Param('id') id: string) {}

  @Post()                     // POST /users
  addUser(@Body() user: {}) {}

  @Patch(':id')               // PATCH /users/:id
  updateUser(@Param('id') id: string, @Body() user: {}) {}

  @Delete(':id')              // DELETE /users/:id
  deleteUser(@Param('id') id: string) {}
}
```

# Providers
- Many of the basic Nest classes can be treated as `Providers` - `services`, `repositories`, `factories`, `helpers` etc.
- Main idea of a Provider is that it can be **injected** as a dependency; meaning that the object can create various relationships with each other.


# Pipes
## 2 typical use cases
- **transformation**: tranform input data to the desired form (eg from string to int)
- **validation**: evaluate input data; if valid, simply pass it through unchanged; otherwise throw an exception.