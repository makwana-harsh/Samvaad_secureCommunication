# 11. Coding Guidelines

> **Version:** 1.0
> **Project:** Real-Time Communication Platform
> **Purpose:** Define coding standards and best practices to ensure consistency, readability, maintainability, and scalability across the project.

---

# 1. General Principles

- Write code for humans first, computers second.
- Keep functions small and focused.
- Follow the Single Responsibility Principle (SRP).
- Avoid premature optimization.
- Prefer readability over cleverness.
- Write reusable and modular code.
- Every module should have one responsibility.

---

# 2. Naming Conventions

## Variables

Use descriptive camelCase names.

✅ Good

```js
const currentUser
const unreadMessages
const conversationId
const socketConnection
```

❌ Bad

```js
const data
const obj
const temp
const x
```

---

## Functions

Functions should start with verbs.

```js
createUser()

sendMessage()

fetchConversations()

validateToken()

uploadImage()
```

---

## Boolean Variables

Use prefixes like:

```js
isOnline

hasPermission

canEdit

isAdmin

isTyping
```

---

## Constants

Use UPPER_SNAKE_CASE.

```js
MAX_FILE_SIZE

JWT_SECRET

MESSAGE_LIMIT

API_VERSION
```

---

## Components

React components use PascalCase.

```
ChatWindow.jsx

MessageBubble.jsx

Sidebar.jsx

Navbar.jsx

UserCard.jsx
```

---

## Files

Backend

```
user.controller.js

message.service.js

conversation.model.js

auth.middleware.js
```

Frontend

```
ChatWindow.jsx

Sidebar.jsx

LoginPage.jsx
```

---

# 3. Folder Responsibility

Every folder should have a clear responsibility.

Example Backend

```
controllers/
Only request handling

services/
Business logic

models/
Database schema

routes/
API routes

middlewares/
Express middleware

validators/
Input validation

utils/
Helper functions

config/
Configuration

socket/
Socket.IO logic
```

Never mix responsibilities.

---

# 4. Function Guidelines

A function should do only ONE thing.

✅ Good

```js
createConversation()

deleteConversation()

getConversationMessages()
```

❌ Bad

```js
handleEverything()
```

---

Function length

Recommended

20–40 lines

Maximum

60 lines

If longer, split it.

---

# 5. Controller Guidelines

Controllers should remain thin.

Controller

```
Receive Request

↓

Validate

↓

Call Service

↓

Return Response
```

Avoid business logic inside controllers.

Bad

```js
router.post(...)

↓

50 lines of logic
```

Good

```js
const conversation = await conversationService.create(...)
```

---

# 6. Service Layer

Business logic belongs here.

Examples

```
Authentication

Message Processing

Group Management

Notification Logic

File Validation
```

Services should never know about Express request/response objects.

---

# 7. Database Guidelines

Always use Mongoose Models.

Never access MongoDB directly from controllers.

Bad

```js
User.find(...)
```

inside controller.

Good

```
Controller

↓

Service

↓

Repository/Model
```

---

# 8. Error Handling

Never ignore errors.

Always use centralized error handling.

Bad

```js
try {

} catch(e){}
```

Good

```js
next(error)
```

Create custom error classes.

Example

```
ValidationError

AuthenticationError

AuthorizationError

ResourceNotFoundError

ConflictError
```

---

# 9. Async/Await

Always prefer async/await.

Avoid Promise chains.

Good

```js
const user = await User.findById(id)
```

Avoid

```js
User.findById(id)
.then(...)
.catch(...)
```

---

# 10. Input Validation

Validate every request.

Examples

```
Email

Password

File Size

Image Type

Message Length

Phone Number
```

Never trust frontend input.

---

# 11. Environment Variables

Never hardcode secrets.

Bad

```js
const secret="abc123"
```

Good

```env
JWT_SECRET=

MONGODB_URI=

PORT=

CLIENT_URL=

CLOUDINARY_API_KEY=
```

---

# 12. Logging

Never use console.log in production code.

Development

```
console.log()
```

Production

Use structured logging.

Example

```
Request Started

Database Connected

User Logged In

Socket Connected

Message Delivered
```

---

# 13. Comments

Write comments only when necessary.

Bad

```js
// increment i
i++
```

Good

```js
// Retry upload if the storage provider is temporarily unavailable.
```

Code should explain itself.

---

# 14. React Guidelines

Prefer Functional Components.

Use Hooks.

Keep components small.

Split large pages into reusable components.

Avoid prop drilling.

Use Context only for global state.

Example

```
Auth Context

Socket Context

Theme Context
```

---

# 15. State Management

Keep state close to where it's used.

Local State

```
Input

Modal

Dropdown
```

Global State

```
Logged User

Socket

Theme

Notifications
```

---

# 16. API Guidelines

REST endpoints should use nouns.

Good

```
GET /users

POST /messages

GET /groups

DELETE /messages/:id
```

Avoid

```
/createUser

/getMessages

/deleteMessage
```

Use proper HTTP methods.

```
GET

POST

PUT

PATCH

DELETE
```

---

# 17. HTTP Status Codes

Use correct status codes.

```
200 OK

201 Created

204 No Content

400 Bad Request

401 Unauthorized

403 Forbidden

404 Not Found

409 Conflict

422 Validation Error

500 Internal Server Error
```

---

# 18. Socket Guidelines

Each event should have one responsibility.

Good

```
send_message

receive_message

typing_start

typing_stop

message_read

user_online

user_offline
```

Avoid giant payloads.

Only send required data.

---

# 19. Security Guidelines

Always

- Hash passwords
- Validate JWT
- Validate file uploads
- Sanitize input
- Limit request rate
- Escape user-generated content
- Protect private routes
- Verify ownership before updates/deletes

Never expose

- Passwords
- Tokens
- Secrets
- Internal server errors

---

# 20. Git Guidelines

Branch naming

```
feature/authentication

feature/private-chat

feature/groups

bugfix/socket-reconnect

hotfix/login
```

Commit message format

```
feat: implement JWT authentication

fix: resolve socket reconnection issue

refactor: move message logic to service layer

docs: update API documentation

style: improve chat layout

test: add authentication tests
```

---

# 21. Code Formatting

Use

- ESLint
- Prettier

Rules

- 2-space indentation
- Semicolons enabled
- Single quotes
- Trailing commas where applicable
- One blank line between logical blocks

Never commit unformatted code.

---

# 22. Import Order

Order imports consistently.

```js
// Node modules
import express from 'express';

// Third-party packages
import jwt from 'jsonwebtoken';

// Internal modules
import authMiddleware from '../middlewares/auth.middleware.js';
import User from '../models/user.model.js';

// Styles (React)
import './Chat.css';
```

---

# 23. Testing Philosophy

Every important feature should be testable.

Priority

```
Authentication

Messaging

Socket Events

Authorization

API Validation
```

Test

- Success cases
- Failure cases
- Edge cases

---

# 24. Documentation

Every major module should include:

- Purpose
- Dependencies
- Public methods
- Usage examples (if needed)

Keep API documentation updated whenever endpoints change.

---

# 25. Performance Guidelines

- Avoid unnecessary database queries.
- Use indexes for frequently queried fields.
- Paginate large datasets.
- Lazy-load React routes when appropriate.
- Compress uploaded media.
- Debounce search inputs.
- Avoid unnecessary re-renders.

---

# 26. Clean Code Checklist

Before every commit, ask:

- Is the code readable?
- Does each function have one responsibility?
- Are names meaningful?
- Is duplicate code removed?
- Is error handling complete?
- Is input validated?
- Is sensitive information protected?
- Are linting and formatting passing?
- Have I tested the change?

---

# 27. Definition of Done

A task is considered complete only when:

- Feature is fully implemented.
- Code follows project guidelines.
- Validation is added.
- Error handling is implemented.
- API documentation is updated.
- Tests pass.
- Linting passes.
- Code is reviewed (self-review for solo development).
- No TODOs remain unless intentionally tracked.
- Feature integrates cleanly with the existing architecture.

---

# Guiding Philosophy

> **Build software that your future self—and any other developer—can understand, maintain, and confidently extend.**