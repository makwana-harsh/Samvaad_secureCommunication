# Feature-Based Project Structure (Version 1)

```text
communication-platform/
│
├── client/
│   │
│   ├── public/
│   │
│   ├── src/
│   │   │
│   │   ├── assets/
│   │   │     ├── images/
│   │   │     ├── icons/
│   │   │     └── fonts/
│   │   │
│   │   ├── components/
│   │   │     ├── common/
│   │   │     ├── profile/
│   │   │     ├── friend/
│   │   │     ├── group/
│   │   │     └── chat/
│   │   │
│   │   ├── pages/
│   │   │     ├── Auth/
│   │   │     │     ├── Login.jsx
│   │   │     │     └── Register.jsx
│   │   │     │
│   │   │     ├── Home/
│   │   │     │     └── Home.jsx
│   │   │     │
│   │   │     ├── Conversations/
│   │   │     │     └── Conversations.jsx
│   │   │     │
│   │   │     ├── Discover/
│   │   │     │     └── Discover.jsx
│   │   │     │
│   │   │     └── Profile/
│   │   │           └── Profile.jsx
│   │   │
│   │   ├── layouts/
│   │   │     ├── MainLayout.jsx
│   │   │     └── AuthLayout.jsx
│   │   │
│   │   ├── routes/
│   │   │     ├── AppRoutes.jsx
│   │   │     └── ProtectedRoute.jsx
│   │   │
│   │   ├── context/
│   │   │     ├── AuthContext.jsx
│   │   │     ├── UserContext.jsx
│   │   │     └── SocketContext.jsx
│   │   │
│   │   ├── hooks/
│   │   │     ├── useAuth.js
│   │   │     ├── useSocket.js
│   │   │     ├── useDebounce.js
│   │   │     └── useClickOutside.js
│   │   │
│   │   ├── services/
│   │   │     ├── api/
│   │   │     │     ├── auth.api.js
│   │   │     │     ├── user.api.js
│   │   │     │     ├── request.api.js
│   │   │     │     ├── group.api.js
│   │   │     │     ├── conversation.api.js
│   │   │     │     └── message.api.js
│   │   │     │
│   │   │     └── socket/
│   │   │           └── socket.js
│   │   │
│   │   ├── utils/
│   │   │     ├── formatDate.js
│   │   │     ├── formatFileSize.js
│   │   │     └── validators.js
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   │
│   ├── src/
│   │   │
│   │   ├── config/
│   │   │     ├── db.js
│   │   │     └── env.js
│   │   │
│   │   ├── middleware/
│   │   │     ├── auth.middleware.js
│   │   │     ├── error.middleware.js
│   │   │     └── upload.middleware.js
│   │   │
│   │   ├── modules/
│   │   │     │
│   │   │     ├── auth/
│   │   │     │     ├── auth.routes.js
│   │   │     │     ├── auth.controller.js
│   │   │     │     ├── auth.service.js
│   │   │     │     └── auth.validation.js
│   │   │     │
│   │   │     ├── user/
│   │   │     │     ├── user.model.js
│   │   │     │     ├── user.routes.js
│   │   │     │     ├── user.controller.js
│   │   │     │     ├── user.service.js
│   │   │     │     └── user.validation.js
│   │   │     │
│   │   │     ├── request/
│   │   │     │     ├── request.model.js
│   │   │     │     ├── request.routes.js
│   │   │     │     ├── request.controller.js
│   │   │     │     ├── request.service.js
│   │   │     │     └── request.validation.js
│   │   │     │
│   │   │     ├── group/
│   │   │     │     ├── group.model.js
│   │   │     │     ├── group.routes.js
│   │   │     │     ├── group.controller.js
│   │   │     │     ├── group.service.js
│   │   │     │     └── group.validation.js
│   │   │     │
│   │   │     ├── conversation/
│   │   │     │     ├── conversation.model.js
│   │   │     │     ├── conversation.routes.js
│   │   │     │     ├── conversation.controller.js
│   │   │     │     ├── conversation.service.js
│   │   │     │     └── conversation.validation.js
│   │   │     │
│   │   │     └── message/
│   │   │           ├── message.model.js
│   │   │           ├── message.routes.js
│   │   │           ├── message.controller.js
│   │   │           ├── message.service.js
│   │   │           └── message.validation.js
│   │   │
│   │   ├── sockets/
│   │   │     ├── socket.js
│   │   │     └── events.js
│   │   │
│   │   ├── utils/
│   │   │     ├── ApiError.js
│   │   │     ├── ApiResponse.js
│   │   │     ├── jwt.js
│   │   │     └── upload.js
│   │   │
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── uploads/
│   │     ├── profiles/
│   │     ├── groups/
│   │     └── messages/
│   │
│   ├── package.json
│   └── .env
│
├── docs/
│
├── .gitignore
├── README.md
├── LICENSE
└── package.json
```

---

# Folder Responsibilities

## config/

Application configuration.

* Database Connection
* Environment Variables

---

## middleware/

Reusable middleware used across the application.

Examples:

* JWT Authentication
* Error Handling
* File Upload

---

## modules/

Each business feature lives inside its own module.

Every module contains:

* Model
* Routes
* Controller
* Service
* Validation

Nothing related to that feature exists outside its folder.

---

## sockets/

Contains all Socket.IO configuration and event handling.

---

## utils/

Reusable helper functions and shared classes.

Examples:

* JWT utilities
* API response formatter
* Custom error classes
* Upload helpers

---

## uploads/

Stores uploaded files locally during Version 1.

Later this will be replaced by cloud storage (e.g., Cloudinary).
