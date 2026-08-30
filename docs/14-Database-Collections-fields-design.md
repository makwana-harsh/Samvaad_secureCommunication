# Collection 1 – Users

## Purpose

The **Users** collection is the core collection of the application. It stores authentication information, profile details, friendship relationships, group memberships, and user activity required throughout the communication platform.

---

# Fields

| Field          | Type       | Required | Description                                            |
| -------------- | ---------- | :------: | ------------------------------------------------------ |
| `_id`          | ObjectId   |     ✅    | Unique identifier for the user.                        |
| `username`     | String     |     ✅    | Unique username used for searching and identification. |
| `fullName`     | String     |     ✅    | User's display name.                                   |
| `email`        | String     |     ✅    | Email address used for authentication like sending otp.|
| `mobile`       | String     |     ✅    | Contact number.                                        |
| `password`     | String     |     ✅    | Hashed user password.                                  |
| `avatar`       | String     |     ❌    | URL of the user's profile picture.                     |    //profile picture
| `bio`          | String     |     ❌    | Short introduction about the user.                     |
| `location`     | String     |     ❌    | User's city or location.                               |
| `dob`          | Date       |     ❌    | User's date of birth.                                  |
| `friends`      | ObjectId[] |     ✅    | List of friend user IDs.                               |
| `joinedGroups` | ObjectId[] |     ✅    | List of groups the user has joined.                    |
| `blockedUsers` | ObjectId[] |     ✅    | List of groups the user has blocked.                   |
| `isOnline`     | Boolean    |     ✅    | Indicates whether the user is currently online.        |
| `lastSeen`     | Date       |     ❌    | Timestamp of the user's last activity.                 |
| `createdAt`    | Date       |     ✅    | Account creation timestamp.                            |
| `updatedAt`    | Date       |     ✅    | Last profile update timestamp.                         |

---

# Relationships

| Relationship             | Target Collection |
| ------------------------ | ----------------- |
| Friends                  | Users             |
| Joined Groups            | Groups            |
| Participates In          | Conversations     |
| Sends Messages           | Messages          |
| Sends Friend Requests    | Friend Requests   |
| Receives Friend Requests | Friend Requests   |

---

# Notes

* `username` must be unique across the platform.
* Passwords are always stored in hashed form.
* `friends` stores only the IDs of accepted friends.
* `joinedGroups` stores the IDs of groups the user is currently a member of.
* Incoming and outgoing friend requests are **not** stored in this collection. They are managed by the **Friend Requests** collection.
* Private conversations and group conversations are **not** stored in this collection. They are retrieved through the **Conversations** collection.
* User avatars are stored externally (e.g., Cloudinary), and only the URL is stored in the database.

---

# Future Enhancements

The following fields are intentionally excluded from Version 1 and may be added in future releases:

* Theme Preference
* Account Status
* Two-Factor Authentication
* Profile Visibility
* Notification Preferences
* Custom Status
* Social Links
* Device Information
* Blocked Users
* Privacy Settings


---


# Collection 2 – Requests

## Purpose

* The **requests** collections is a centrel collections for handling all the types of requests/invitations like group invitations, friends requests etc.

* In this collection, we have a field `type` that indicates wheather it is group invitation request or single user friend request. 

* If type = "group": senderId = Group Admin's User ID, receiverId = Invited User's User ID, groupId = Target Group's ID.

* If type = "friend": senderId = Request Sender's User ID, receiverId = Request Receiver's User ID, groupId = null (or omitted).

---

# Collection Fields

| Field      | Type     | Required   | Description                               |
| ---------- | -------- | --------   | ----------------------------------------- |
| _id        | ObjectId | ✅        | Unique request identifier                 |
| type       | String   | ✅        | Request type (`friend` or `group`)        |
| senderId   | ObjectId | ✅        | User who created the request              |
| receiverId | ObjectId | ✅        | User receiving the request                |
| groupId    | ObjectId | ❌        | Target group (only for group invitations) |
| status     | String   | ✅        | Current request status (`pending`)        |
| createdAt  | Date     | ✅        | Request creation timestamp                |
| updatedAt  | Date     | ✅        | Last modification timestamp               |

* Note : all the rules for requests colletion are provided in `request-lifecycle.md` file.
* status have only three values for current version :- pending, accepted, rejected

---


# Collection 3 – Groups

## Purpose

The **Groups** collection stores all information related to groups within the platform.

It maintains group details, membership, visibility settings, and administrator information. Messages and requests are managed by their respective collections.

---

# Collection Fields

| Field          | Type       | Required | Description                          |
| -------------- | ---------- | -------- | ------------------------------------ |
| _id            | ObjectId   | ✅        | Unique group identifier              |
| groupName      | String     | ✅        | Group name                           |
| bio            | String     | ❌        | Optional group description           |
| avatar         | String     | ❌        | Group profile picture URL            |
| visibility     | String     | ✅        | `public` or `private`                |
| adminId        | ObjectId   | ✅        | User ID of the group creator (admin) |
| members        | ObjectId[] | ✅        | List of all group members            |
| conversationId | ObjectId   | ✅        | Associated conversation document     |
| createdAt      | Date       | ✅        | Group creation timestamp             |
| updatedAt      | Date       | ✅        | Last update timestamp                |

---

# Business Rules

## Group Creation

* Any registered user can create a group.
* The creator automatically becomes the Group Admin.
* The creator is automatically added to the `members` list.
* A corresponding conversation is created and linked through `conversationId`.

---

## Group Visibility

### Public Group

* Visible on the Discover page.
* Any user can join without an invitation.

### Private Group

* Hidden from the Discover page.
* Users can only join through a Group Invitation.

---

## Group Membership

* A user cannot join the same group more than once.
* Every member's User ID is stored in the `members` array.
* Every joined group is also added to the user's `joinedGroups[]`.

---

## Group Administrator

In Version 1:

* Every group has exactly one admin.
* The admin is the group creator.
* Admin rights cannot be transferred.

### Admin Permissions

* Invite users.
* Remove members.
* Edit group name.
* Edit group bio.
* Change group avatar.
* Delete the group.

---

## Group Members

Members can:

* Send messages.
* View group details.
* Leave the group.

Members cannot:

* Invite users.
* Remove users.
* Edit group information.
* Delete the group.

---

# Future Enhancements

* Multiple Admins
* Moderator Role
* Admin Transfer
* Member Roles
* Join Requests
* Member Limits
* Group Categories
* Pinned Messages
* Announcement Groups


---


# Collection 4 – Conversations

## Purpose

The **Conversations** collection represents every chat within the platform.

A conversation can be either:

* Private Conversation
* Group Conversation

Every message belongs to exactly one conversation.

This collection stores only the information required to efficiently display the conversation list. User relationships (friends, blocked users, etc.) are managed through the **Users** collection.

---

# Collection Fields

| Field               | Type       | Required | Description                                                   |
| ------------------- | ---------- | -------- | ------------------------------------------------------------- |
| _id                 | ObjectId   | ✅        | Unique conversation identifier                                |
| type                | String     | ✅        | `private` or `group`                                          |
| participants        | ObjectId[] | ❌        | List of participant User IDs (only for private conversations) |
| groupId             | ObjectId   | ❌        | Related Group ID (only for group conversations)               |
| lastMessage         | String     | ❌        | Preview of the latest message shown in the conversation list  |
| lastMessageSenderId | ObjectId   | ❌        | User ID of the sender of the latest message                   |
| lastMessageAt       | Date       | ❌        | Timestamp of the latest message                               |
| messageRetentionDays| Integer    | ❌        | Time period for every message                                 |
| createdAt           | Date       | ✅        | Conversation creation timestamp                               |
| updatedAt           | Date       | ✅        | Last update timestamp                                         |

---

# messageRetentionDays Field
It contains either integer like 10, 20 , 30 or NULL value
If the value is NULL then this conversation is between friends or groups
If the value is 20, 30 then this conversation is between non-friend users
messageRetentionDays = 20 represents message's life time is 20 days, So a message whose life-time is reached 20 days will be automatically deleted from the "Messages" collection

# Conversation Types

## Private Conversation

Represents a conversation between exactly two users.

### Rules

* Contains exactly two participants.
* Created automatically when the first message is sent.
* Only one private conversation can exist between the same pair of users.
* Users do **not** need to be friends to create or continue a private conversation.

---

## Group Conversation

Represents the conversation of a group.

### Rules

* Linked to exactly one group.
* Created automatically when a group is created.
* Group members are managed through the **Groups** collection.
* The `participants` field is not used for group conversations.

---

# Last Message Preview

The conversation stores only a preview of the latest message.

Examples:

* `Hello, how are you?`
* `📷 Photo`
* `🎥 Video`
* `🎤 Voice Message`
* `📄 project.pdf`

Whenever a new message is sent:

* Update `lastMessage`.
* Update `lastMessageSenderId`.
* Update `lastMessageAt`.
* Update `updatedAt`.

---

# Relationship Rules

User relationships are **not stored** in the Conversations collection.

The backend determines permissions using the **Users** collection.

## Friends

* Friends can view each other's private profile information.
* Friends appear in the Friends page.

## Non-Friends

* Non-friends can still start and continue private conversations.
* Non-friends can only view public profile information.

## Blocked Users

* Blocked users cannot send private messages.
* Blocked users cannot send friend requests.
* Blocked users cannot send group invitations.
* Existing conversation history is preserved.

---

# Future Enhancements

* Read Receipts
* Message Reactions
* Pinned Conversations
* Archived Conversations
* Muted Conversations
* Conversation Settings
* End-to-End Encryption Metadata



---



# Collection 5 – Messages

## Purpose

The **Messages** collection stores every message exchanged within the platform.

Each message belongs to exactly one conversation.

Messages can be sent in:

* Private Conversations
* Group Conversations

---

# Collection Fields

| Field          | Type     | Required | Description                                          |
| -------------- | -------- | -------- | -----------------------------------------------------|
| _id            | ObjectId | ✅        | Unique message identifier                           |
| conversationId | ObjectId | ✅        | Conversation to which the message belongs           |
| senderId       | ObjectId | ✅        | User who sent the message                           |
| messageType    | String   | ✅        | `text`, `image`, `video`, `audio`, `file`, `system` |
| content        | String   | ✅        | Message content or file URL                         |
| createdAt      | Date     | ✅        | Message creation timestamp                          |
| updatedAt      | Date     | ✅        | Last modification timestamp                         |

---

# Message Types

Version 1 supports the following message types:

* `text`
* `image`
* `video`
* `audio`
* `file`

The `content` field stores:

* Message text (for text messages)
* Uploaded file URL (for media messages)

---

# Message Rules

## Sending Messages

* Every message belongs to exactly one conversation.
* Every message has exactly one sender.
* Messages cannot exist without a valid conversation.
* Messages cannot be sent by blocked users in private conversations.
* Group members can send messages only if they belong to the group.

---

## Private Conversations

* Both participants can send messages.
* Friendship is not required.
* If either participant has blocked the other, new messages cannot be sent.

---

## Group Conversations

* Only group members can send messages.
* Users who leave the group lose the ability to send new messages.
* Previous messages remain visible in the conversation history.

---

# Message Ordering

Messages are displayed in ascending order of their `createdAt` timestamp.

Older messages appear first, while newer messages appear at the bottom of the conversation.

---

# Conversation Updates

Whenever a new message is created:

* Update the corresponding conversation's `lastMessage`.
* Update `lastMessageSenderId`.
* Update `lastMessageAt`.
* Update `updatedAt`.

---

# Future Enhancements

* Message Editing
* Message Deletion
* Read Receipts
* Message Reactions
* Reply to Message
* Forward Message
* Pinned Messages
* Scheduled Messages
* Disappearing Messages
* End-to-End Encryption Metadata
