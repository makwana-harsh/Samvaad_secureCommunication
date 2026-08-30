# Project Overview

## Project Vision

This project is a **production-grade real-time communication platform** built using the **MERN Stack** and **Socket.IO**.

The goal is to provide a clean, fast, secure, and scalable communication experience through **private messaging** and **group conversations**. Unlike social media platforms, this application focuses entirely on communication rather than content sharing or public feeds.

The project follows a professional software engineering workflow where planning and system design are completed before implementation.

---

# Project Goals

* Build a real-time communication platform.
* Follow production-grade architecture.
* Design everything before writing code.
* Keep Version 1 simple while allowing future scalability.
* Learn professional software development practices.

---

# Target Users

The platform is designed for anyone who wants to communicate online, including:

* Students
* Friends
* Developers
* Teams
* Communities

---

# Application Pages

## Page 1 — Home

The Home page provides a quick overview of the user's communication activity.

### Components

* User Profile
* Active Friends
* Incoming Friend Requests
* Incoming Group Invitations
* (Future) User Suggestions

---

## Page 2 — Friends & Groups

The Friends & Groups page is the primary communication interface.

### Features

* Friends List
* Groups List
* Private Conversations
* Group Conversations
* Chat Window
* Group Management

---

## Page 3 — Discover

The Discover page allows users to discover people and public groups.

### Features

* Search Users
* Search Public Groups
* Active Users
* Public Group List
* Send Friend Request
* Join Public Groups

---

# Core Features

## Authentication

* User Registration
* Login
* Logout
* JWT Authentication
* Protected Routes

---

## User Management

* User Profile
* Edit Profile
* Upload Profile Picture
* Search Users
* Block Users
* Unblock Users

---

## Friend System

* Send Friend Request
* Accept Friend Request
* Reject Friend Request
* Friends List

---

## Group System

### Public Groups

* Visible on Discover page
* Anyone can join

### Private Groups

* Hidden from Discover
* Join only through invitations

### Group Admin

Admin can:

* Edit Group
* Change Group Picture
* Edit Group Bio
* Invite Users
* Remove Members
* Delete Group

### Group Members

Members can:

* Send Messages
* View Group Information
* Leave Group

---

## Messaging

Supports:

* Private Chat
* Group Chat
* Text Messages
* Image Messages
* Video Messages
* Audio Messages
* File Sharing
* System Messages

---

## Presence

* Online Status
* Offline Status
* Last Seen

---

## Typing Indicator

* Typing Started
* Typing Stopped

---

## Notifications

* Friend Requests
* Group Invitations

---

# Database Design

The project uses MongoDB with a normalized database design.

## Collections

### 1. Users

Stores:

* Authentication Information
* Profile Information
* Friends
* Joined Groups
* Blocked Users

---

### 2. Requests

Stores:

* Friend Requests
* Group Invitations

Status:

* Pending
* Accepted
* Rejected

---

### 3. Groups

Stores:

* Group Details
* Members
* Admin
* Visibility
* Conversation Reference

---

### 4. Conversations

Represents every chat.

Types:

* Private Conversation
* Group Conversation

Stores:

* Participants
* Group Reference
* Last Message
* Last Message Time

---

### 5. Messages

Stores every message.

Supported Types:

* Text
* Image
* Video
* Audio
* File
* System

---

# API Design

The backend is divided into multiple modules.

## Authentication APIs

* Register
* Login
* Logout
* Current User

---

## User APIs

* Get Profile
* Update Profile
* Search Users
* Friends List
* Block User
* Unblock User

---

## Request APIs

* Send Friend Request
* Send Group Invitation
* Accept Request
* Reject Request

---

## Group APIs

* Create Group
* Update Group
* Join Group
* Leave Group
* Delete Group
* Remove Member
* Discover Public Groups

---

## Conversation APIs

* Get Conversations
* Get Conversation Details
* Open Private Conversation

---

## Message APIs

* Get Messages
* Send Messages

---

# Real-Time Communication

Socket.IO is responsible for real-time synchronization.

## Client → Server Events

* message:send
* typing:start
* typing:stop

---

## Server → Client Events

* message:receive
* request:new
* user:online
* user:offline

---

## Connection Events

* connect
* disconnect

---

# System Messages

System-generated events are stored as normal messages.

Examples:

* Rahul created the group.
* Meet joined the group.
* Rahul left the group.
* Aman was removed from the group.
* Group name changed.
* Group profile picture updated.

---

# Technology Stack

## Frontend

* React
* React Router
* Context API
* Axios
* Socket.IO Client
* Tailwind CSS

---

## Backend

* Node.js
* Express.js
* Socket.IO
* JWT
* bcrypt
* Multer

---

## Database

* MongoDB
* Mongoose

---

## File Storage

### Version 1

* Local Storage

### Future

* Cloudinary

---

# Development Strategy

The application will be developed incrementally.

## Version 1

* Authentication
* User Profiles
* Friend Requests
* Private Messaging
* Group Messaging
* Discover Page
* Real-Time Communication

---

## Future Versions

* Read Receipts
* Message Reactions
* Edit Messages
* Delete Messages
* Emoji Picker
* Voice Calls
* Video Calls
* Push Notifications
* Multiple Group Admins
* Archived Conversations
* Pinned Chats
* End-to-End Encryption

---

# Software Engineering Workflow

The project follows a structured software development process.

```text
Product Vision
        ↓
Requirement Analysis
        ↓
Feature Planning
        ↓
UI / UX Planning
        ↓
System Design
        ↓
Database Design
        ↓
API Design
        ↓
Socket.IO Event Design
        ↓
Frontend Architecture
        ↓
Backend Architecture
        ↓
Implementation
        ↓
Testing
        ↓
Deployment
```

---

# Design Principles

* Design before implementation.
* Keep business logic inside the backend.
* Use HTTP APIs for database operations.
* Use Socket.IO only for real-time synchronization.
* Maintain a normalized database.
* Build modular and scalable architecture.
* Keep Version 1 simple.
* Plan future scalability from the beginning.

---

# Current Project Status

## Completed

* Product Vision
* Feature Planning
* UI Planning
* Database Design
* API Design
* Socket.IO Event Design

---

## Remaining Before Development

* Frontend Architecture
* Backend Architecture

After these two documents are completed, the project planning phase will be finished and implementation can begin.

---

# One-Line Summary

**A production-grade MERN Stack real-time communication platform focused on private messaging and group communication, designed using professional software engineering practices before implementation, with scalability, maintainability, and future expansion as core principles.**
