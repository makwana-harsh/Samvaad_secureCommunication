# User Flow

## Purpose

This document defines how users interact with the application from the moment they open it until they complete various tasks. It serves as a blueprint for designing the UI, APIs, database interactions, and real-time communication logic.

---

# User Roles

## Guest

A user who has not logged in.

Permissions:

- Register
- Login
- View Landing Page

---

## Authenticated User

A registered user who has successfully logged in.

Permissions:

- View Chats
- Search Users
- Send Messages
- Receive Messages
- Create Groups
- Manage Profile
- Upload Media
- Logout

---

# Primary User Flow

```
Open Application
        │
        ▼
Is User Logged In?
        │
 ┌──────┴──────┐
 │             │
No            Yes
 │             │
 ▼             ▼
Login      Load Home
 │             │
 ▼             ▼
Authenticate
 │
 ▼
Load Dashboard
 │
 ▼
Connect Socket.IO
 │
 ▼
Load Conversations
 │
 ▼
Select Conversation
 │
 ▼
Load Message History
 │
 ▼
Start Chatting
```

---

# Authentication Flow

```
Open App
    │
    ▼
Login Page
    │
    ▼
Enter Credentials
    │
    ▼
Validate Input
    │
    ▼
Send Login Request
    │
    ▼
Authentication Success?
    │
 ┌──┴─────┐
 │         │
No        Yes
 │         │
 ▼         ▼
Show Error Generate JWT
            │
            ▼
Store Token
            │
            ▼
Navigate Home
            │
            ▼
Connect Socket
```

---

# Registration Flow

```
Register Page
      │
      ▼
Enter Details
      │
      ▼
Validate Form
      │
      ▼
Create Account
      │
      ▼
Account Created
      │
      ▼
Redirect Login
```

---

# Private Chat Flow

```
Open Chat
     │
     ▼
Load Previous Messages
     │
     ▼
User Types Message
     │
     ▼
Click Send
     │
     ▼
Validate Message
     │
     ▼
Emit Socket Event
     │
     ▼
Server Receives Message
     │
     ▼
Save to Database
     │
     ▼
Receiver Online?
     │
 ┌───┴────┐
 │        │
No       Yes
 │        │
 ▼        ▼
Store    Deliver Instantly
 │        │
 └───┬────┘
     ▼
Update Conversation
```

---

# Receiving Message Flow

```
Message Arrives
      │
      ▼
Socket Event Triggered
      │
      ▼
Display Message
      │
      ▼
Update Conversation Preview
      │
      ▼
Scroll If Active Chat
      │
      ▼
Mark Delivered
```

---

# Typing Indicator Flow

```
User Starts Typing
       │
       ▼
Emit Typing Event
       │
       ▼
Receiver Sees
"Typing..."
       │
       ▼
User Stops Typing
       │
       ▼
Emit Stop Typing
       │
       ▼
Hide Indicator
```

---

# Group Chat Flow

```
Create Group
      │
      ▼
Select Members
      │
      ▼
Enter Group Name
      │
      ▼
Create Group
      │
      ▼
Notify Members
      │
      ▼
Open Group Chat
```

---

# Media Sharing Flow

```
Choose File
      │
      ▼
Validate File
      │
      ▼
Upload File
      │
      ▼
Receive File URL
      │
      ▼
Create Message
      │
      ▼
Send Socket Event
      │
      ▼
Receiver Downloads Preview
```

---

# Logout Flow

```
Click Logout
      │
      ▼
Disconnect Socket
      │
      ▼
Clear Local Storage
      │
      ▼
Invalidate Session (Optional)
      │
      ▼
Redirect Login
```

---

# Error Flows

## Network Lost

```
Connection Lost
      │
      ▼
Show Offline Banner
      │
      ▼
Retry Connection
      │
      ▼
Reconnect Socket
      │
      ▼
Reload Pending Messages
```

---

## Invalid Token

```
API Request
      │
      ▼
401 Unauthorized
      │
      ▼
Clear Token
      │
      ▼
Redirect Login
```

---

<!-- # Future User Flows

- Voice Calling
- Video Calling
- Message Reactions
- Read Receipts
- AI Assistant
- Story/Status
- Multi-device Sync
- End-to-End Encryption Key Exchange -->