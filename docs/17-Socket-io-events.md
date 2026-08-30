# Socket.IO Event Design

## Purpose

Socket.IO is responsible for all **real-time communication** within the platform.

Unlike HTTP APIs, Socket.IO maintains a persistent connection between the client and the server, allowing instant communication without refreshing the page.

Socket.IO is **not** responsible for modifying the database directly. Every business operation (creating groups, leaving groups, accepting requests, etc.) is first handled by the backend. After the database is successfully updated, the server emits Socket.IO events to synchronize all connected clients.

---

# Client → Server Events

These events are emitted by the frontend.

| Event          | Purpose                               |
| -------------- | ------------------------------------- |
| `message:send` | Send a new message to a conversation. |
| `typing:start` | Notify that the user started typing.  |
| `typing:stop`  | Notify that the user stopped typing.  |

---

# Server → Client Events

These events are emitted by the backend after processing a request.

| Event             | Purpose                                                       |
| ----------------- | ------------------------------------------------------------- |
| `user:online`     | Notify friends that a user came online.                       |
| `user:offline`    | Notify friends that a user went offline.                      |
| `message:receive` | Deliver a newly created message to conversation members.      |
| `typing:start`    | Show typing indicator.                                        |
| `typing:stop`     | Hide typing indicator.                                        |
| `request:new`     | Notify a user about a new friend request or group invitation. |

---

# Connection Events

These events are automatically managed by Socket.IO.

| Event        | Purpose                                                           |
| ------------ | ----------------------------------------------------------------- |
| `connect`    | Establish socket connection after authentication.                 |
| `disconnect` | Close socket connection when the user leaves or loses connection. |

---

# Event Flows

## User Connection

```text
User Login
      │
      ▼
Socket Connect
      │
      ▼
Update User Status
(isOnline = true)
      │
      ▼
Emit user:online
```

---

## User Disconnection

```text
Socket Disconnect
      │
      ▼
Update User Status
(isOnline = false)
(lastSeen = current time)
      │
      ▼
Emit user:offline
```

---

## Send Message

```text
Frontend
      │
message:send
      │
      ▼
Backend
      │
      ▼
Validate Request
      │
      ▼
Store Message
      │
      ▼
Update Conversation
(lastMessage, lastMessageAt)
      │
      ▼
Emit message:receive
      │
      ▼
Receiver(s)
```

---

## Typing Indicator

```text
User Starts Typing
      │
typing:start
      │
      ▼
Backend
      │
      ▼
Emit typing:start
      │
      ▼
Receiver Sees
"Rahul is typing..."
```

When typing stops:

```text
typing:stop
      │
      ▼
Emit typing:stop
```

---

## Friend Request Notification

```text
HTTP API
(Create Friend Request)
      │
      ▼
Database Updated
      │
      ▼
Emit request:new
      │
      ▼
Receiver Instantly Sees New Request
```

---

## Group Invitation Notification

```text
HTTP API
(Create Group Invitation)
      │
      ▼
Database Updated
      │
      ▼
Emit request:new
      │
      ▼
Receiver Instantly Sees Group Invitation
```

---

## Group Member Joined

```text
HTTP API
(Accept Group Invitation
or Join Public Group)
      │
      ▼
Database Updated
      │
      ▼
Create System Message
"Meet joined the group."
      │
      ▼
Emit message:receive
      │
      ▼
All Online Group Members See It Instantly
```

---

## Group Member Left

```text
HTTP API
(Leave Group)
      │
      ▼
Database Updated
      │
      ▼
Create System Message
"Rahul left the group."
      │
      ▼
Emit message:receive
      │
      ▼
All Online Group Members See It Instantly
```

---

# System Messages

The following actions are stored as normal messages with:

```text
messageType = "system"
```

Examples:

* Rahul created the group.
* Meet joined the group.
* Rahul left the group.
* Rahul removed Aman from the group.
* Group name changed.
* Group profile picture updated.

System messages become part of the permanent chat history and are delivered through the normal `message:receive` event.

---

# Design Principles

* HTTP APIs perform all business operations and database updates.
* Socket.IO is responsible only for real-time synchronization.
* Every database-changing operation is completed before any Socket.IO event is emitted.
* All connected users remain synchronized without refreshing the page.

---

# Version 1 Socket.IO Events

| Event             | Direction       | Purpose                                               |
| ----------------- | --------------- | ----------------------------------------------------- |
| `connect`         | Client → Server | Establish socket connection                           |
| `disconnect`      | Client → Server | Close socket connection                               |
| `message:send`    | Client → Server | Send a new message                                    |
| `message:receive` | Server → Client | Deliver a message                                     |
| `typing:start`    | Client ↔ Server | Show typing indicator                                 |
| `typing:stop`     | Client ↔ Server | Hide typing indicator                                 |
| `user:online`     | Server → Client | Notify friends that a user is online                  |
| `user:offline`    | Server → Client | Notify friends that a user went offline               |
| `request:new`     | Server → Client | Notify about a new friend request or group invitation |
