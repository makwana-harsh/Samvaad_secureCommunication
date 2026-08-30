# Page 1 – Home

## Purpose

Serve as the user's personal dashboard by providing quick access to profile management, active friends, and incoming friend requests.

---

## Layout (page 1 components)

* User Profile    (component 1)
* Active Friends  (component 2)
* Incoming Friend Requests or group invitation requests (component 3)

---

## User Profile   (component 1)

The User Profile component is displayed at the top of the Home page.

### Display Information

* Profile Picture
* Username
* Display Name    (Full Name)

### Interactions

* Clicking the User Profile opens a full-page **Profile Management** component.
* The Profile Management component replaces the Home page without reloading the application.

---

## Profile Management

Allows users to view and update their personal information.

### Editable Information

* Profile Picture
* Username
* Display Name    (Full Name)
* Contact Information   (Mobile no, email id )
* Location
* Date of Birth
* Bio *(Future Enhancement)*

### Statistics

* Number of Friends
* Number of Groups

---

## Active Friends or groups  (component 2)

Displays the user's currently active friends or group talks (or currenlty online friends).

### User Card

Uses the same private user card design as the **Friends & Groups** page.

### Interactions

* Clicking a user card opens the corresponding private chat by navigating to the **Friends & Groups** page.

---

## Friend Requests

Displays all pending incoming friend requests.

### User Card

Each request displays:

* Profile Picture
* Username

### Actions

* Accept Request 
* Reject Request
* After clicking any option, remove card from that list (future enhancement will provide more good UX & better options)

### Behavior

* Accepting a request adds the user to the Friends list.
* Accepting a request does not automatically open a chat.
* Rejecting a request removes it from the pending requests list.

---

## Removed Features

The following features are intentionally excluded from Version 1 to keep the application focused and manageable.

* Recent Chats

  * Chat history is already available in the **Friends & Groups** page.

* Suggested Users

  * Planned as a future enhancement based on recommendation logic such as location or mutual friends.

---

## Future Enhancements

* Suggested Friends
* Friend Request Notifications
* Profile Completion Indicator
* Custom Status
* User Activity Summary




----------------------------------------------------------------------------------------------------------------------------------------------




# Page 2 – Conversations  (old name was `Friends & Groups`)

## Purpose

Manage all private conversations and group conversations from a single page while providing quick access to chats, profiles, and group management.

---

## Layout

* Display all friends and groups in a unified conversation list.
* Private chat cards and group chat cards share the same visual design.
* Each card displays:

  * Profile / Group Picture
  * Name
  * Last Message with time stemp *(Future Enhancement)*
  * Online / Offline Status (for users)

---

## Card Interactions

### Profile Picture

* Clicking the profile picture opens profile picture settled by friend or group admin.

### Chat Card

* Clicking anywhere else on the card opens the conversation.
* The chat is displayed on the same page without a page reload (in side component).

---

## Chat Window

### Private Chat

The chat header displays:

* User Profile Picture
* Username
* Online / Offline Status


Clicking the chat header opens the user's profile/details panel. (another component)

---

### Group Chat

The chat header displays:

* Group Profile Picture
* Group Name

Clicking the chat header opens the group details panel. (another component)

---

## User Details Panel

Displays:

* Profile Picture
* Username
* Bio *(Future Enhancement)*
* Friendship Status   *(Future Enhancement)*
* Block User
* Report User *(Future Enhancement)*
* button to send request if that user is not friend

---

## Group Details Panel

Displays:

* Group Profile Picture
* Group Name
* Group Description *(Future Enhancement)*
* Group Members
* Group Administrators
* button to add new member  (only for Group Administrator)

Selecting any member opens that user's private chat.

---

## Group Permissions

### Normal Member

* View group information
* Send messages
* Leave group

### Group Administrator

* Add members
* Remove members
* Change group profile picture
* Change group name
* Delete group
* Manage group settings *(Future Enhancement)*

---

## Privacy Rules

* Only group members can access group conversations.
* Non-members cannot open or view group chats.
* Group joining permissions will be defined during the Discover module.

---

## Private Chat Features

* Block User
* Unblock User
* Blocked users cannot send messages until they are unblocked.

---

## Future Enhancements

* Search Friends
* Search Groups
* Last Message Preview
* Unread Message Counter
* Pinned Chats
* Favorite Chats
* Mute Conversation
* Archive Conversation




----------------------------------------------------------------------------------------------------------------------------------------------




# Page 3 – Discover

## Purpose

Allow users to discover other users on the platform, search by username, and send friend requests.

---

## Layout

* User Search Bar
<!-- * List of Currently Active Users -->
* List of Users
* Search Results (displayed when searching)

---

## Search

* Search users by username.
* Display matching users while searching.
* When the search field is cleared, display the active users list again.

---

## Active Users

* Display a paginated or infinitely scrollable list of currently active users.
* Each user is represented using the same card design as the private user card in the **Friends & Groups** page.

---

## User Card

Each user card displays:

* Profile Picture
* Username
* **Send Friend Request** button

---

## Card Interactions

### Profile Picture

* Clicking the profile picture opens the user's profile Picture.

### User Card

* Clicking anywhere else on the card opens the user's profile.

### Send Friend Request

* Sends a friend request to the selected user.
* Once a request is sent, the button changes its state (e.g., **Request Sent**).
* Users cannot send duplicate friend requests.

---

## Future Enhancements

* Search Filters
* Suggested Users
* Recommended Friends
* Mutual Friends
* User Categories
* Sort Users
* Advanced Search
