# Authentication APIs
| Method | Endpoint             | Purpose                                    |
| ------ | -------------------- | ------------------------------------------ |
| POST   | `/api/auth/register` | Create a new account                       |
| POST   | `/api/auth/login`    | Authenticate user                          |
| POST   | `/api/auth/logout`   | Logout current user                        |
| GET    | `/api/auth/me`       | Get currently logged-in user's information |


# User's APIs

| Method | Endpoint                   | Purpose                         |
| ------ | -------------------------- | ------------------------------- |
| GET    | `/api/users/me`            | Get logged-in user's profile    |
| PATCH  | `/api/users/me`            | Update logged-in user's profile |
| GET    | `/api/users/search`        | Search users                    |
| GET    | `/api/users/:userId`       | View another user's profile     |
| GET    | `/api/users/friends`       | Get friend list                 |
| POST   | `/api/users/block/:userId` | Block a user                    |
| DELETE | `/api/users/block/:userId` | Unblock a user                  |
| GET    | `/api/users/blocked`       | Get blocked users               |


# Request APIs

| Method | Endpoint                          | Purpose                                |
| ------ | --------------------------------- | -------------------------------------- |
| POST   | `/api/requests`                   | Create a new request (friend or group) |
| GET    | `/api/requests`                   | Get all pending requests               |
| PATCH  | `/api/requests/:requestId/accept` | Accept a request                       |
| PATCH  | `/api/requests/:requestId/reject` | Reject a request                       |


# Group APIs

| Method | Endpoint                               | Purpose                                     |
| ------ | -------------------------------------- | ------------------------------------------- |
| POST   | `/api/groups`                          | Create a new group                          |
| GET    | `/api/groups`                          | Get all groups joined by the logged-in user |
| GET    | `/api/groups/discover`                 | Get all public groups for the Discover page |
| GET    | `/api/groups/:groupId`                 | Get detailed information about a group      |
| PATCH  | `/api/groups/:groupId`                 | Update group information                    |
| POST   | `/api/groups/:groupId/join`            | Join a public group                         |
| DELETE | `/api/groups/:groupId/leave`           | Leave a group                               |
| DELETE | `/api/groups/:groupId`                 | Delete a group (Admin only)                 |
| DELETE | `/api/groups/:groupId/members/:userId` | Remove a member (Admin only)                |


# Conversation APIs

| Method | Endpoint                             | Purpose                                                                |
| ------ | ------------------------------------ | ---------------------------------------------------------------------- |
| GET    | `/api/conversations`                 | Get all conversations                                                  |
| GET    | `/api/conversations/:conversationId` | Get conversation metadata                                              |
| POST   | `/api/conversations/private`         | Get an existing private conversation or create one if it doesn't exist |


# Message APIs

| Method | Endpoint                        | Purpose                            |
| ------ | ------------------------------- | ---------------------------------- |
| GET    | `/api/messages/:conversationId` | Get all messages of a conversation | or `GET /api/messages/:conversationId?page=1&limit=30` for pagination 
| POST   | `/api/messages`                 | Send a message                     |   This endpoint is used to store last message in the conversation collection.
