# Software Requirements Specification (SRS)

## Project Name

Samvaad

---

# 1. Purpose

The purpose of this project is to build a production-grade real-time communication platform that enables secure, reliable, and low-latency communication between users through instant messaging and media sharing.

The application should follow modern software engineering practices with emphasis on scalability, maintainability, security, and modular architecture.

---

# 2. Project Scope

The system will allow users to:

- Create an account
- Authenticate securely
- Find and communicate with other users
- Exchange real-time messages
- Create and participate in group conversations
- Share media files
- Receive instant message updates
- Access chat history across sessions

The project is intended to serve as both a practical communication platform and a demonstration of production-grade full-stack development.

---

# 3. Stakeholders

## Primary Users

- Individual users
- Group members
- Group administrators

## Development Team

- Full Stack Developer (Me)

---

# 4. Functional Requirements

## Authentication

The system shall:

- Allow users to register using email and password.
- Allow secure login.
- Allow logout from active sessions.
- Store passwords in hashed form.
- Protect authenticated routes.
- Support JWT-based authentication.

---

## User Profile

The system shall:

- Allow users to edit profile information.
- Allow profile picture upload.
- Display online/offline status.
- Display last seen information.
- Support searching users.

---

## Conversations

The system shall:

- Create one-to-one conversations.
- Automatically create conversations on first message.
- Retrieve conversation history.
- Sort conversations by latest activity.
- Show unread message count.

---

## Messaging

The system shall:

- Send messages in real time.
- Receive messages instantly.
- Store every message permanently.
- Support text messages.
- Support image messages.
- Support document sharing.
- Display timestamps.
- Allow deleting own messages.
<!-- - Allow editing recently sent messages. -->

---

## Groups

The system shall:

- Create groups.
- Add and remove members.
- Assign administrators.
- Rename groups.
- Display group information.

---

## Media

The system shall:

- Upload images.
- Upload documents.
- Preview supported files.
- Validate upload size.
- Validate supported file types.

---

## Notifications

The system shall:

- Notify users of new messages.
- Notify users when added to groups.
<!-- - Notify users about mentions. -->
<!-- - Display unread counts. -->

---

## Real-Time Communication

The system shall:

- Maintain WebSocket connections.
- Display typing indicators.
- Display delivery status.
- Display read receipts.
- Detect online users.
- Detect offline users.
- Reconnect automatically after network interruption.

---

# 5. Non-Functional Requirements

## Performance

- Message delivery should feel instantaneous under normal network conditions.
- Conversation history should load quickly.
- UI interactions should remain responsive.

---

## Scalability

The architecture should:

- Support increasing numbers of users.
- Support increasing message volume.
- Allow horizontal scaling in future.
- Keep modules loosely coupled.

---

## Reliability

The system should:

- Prevent message loss.
- Recover gracefully after temporary network failures.
- Preserve message history.

---

## Security

The system shall:

- Hash passwords.
- Validate every request.
- Protect private routes.
- Restrict unauthorized access.
- Validate uploaded files.
- Prevent common web vulnerabilities through secure coding practices.

---

## Maintainability

The codebase should:

- Follow consistent folder structure.
- Use reusable components.
- Separate business logic from routing.
- Be easy to extend.

---

## Usability

The application should:

- Provide a clean interface.
- Minimize user actions.
<!-- - Be mobile responsive. -->
<!-- - Support keyboard accessibility where appropriate. -->

---

# 6. Constraints

Current project constraints include:

- Single developer.
- Limited infrastructure budget.
- Initial deployment as a modular monolith.
- MongoDB as the primary database.
- React for frontend.
- Node.js and Express for backend.
- Socket.IO for real-time communication.

---

# 7. Assumptions

It is assumed that:

- Users have internet connectivity.
- Users access the application through modern web browsers.
- Email addresses are unique.
- Usernames are unique
- The server remains available during normal operation.

---

# 8. Out of Scope (Version 1)

The following features are intentionally excluded from the first production release:

- Voice calling
- Video calling
- Screen sharing
- Stories / Status
- Business accounts
- Payments
- AI assistant
- End-to-end encryption
- Multi-device synchronization
- Offline desktop client

These may be considered in future versions.

---

# 9. Success Criteria

The project will be considered successful when:

- Users can register and authenticate securely.
- Real-time messaging works reliably.
- Messages are persisted correctly.
- Group conversations function as expected.
- Media uploads work correctly.
- The application is deployable in a production environment.
- The architecture remains modular and maintainable.