# Request Lifecycle (Version 1)

## Purpose

The **Requests** collection manages all pending requests within the application. In Version 1, it supports:
* Friend Requests
* Group Invitations

Each request remains in the `request` collection until it is accepted, rejected.

---

# Request Types

## Friend Request

Used to establish a friendship between two users.

### Lifecycle

```text
Sender
    │
    ▼
Send Friend Request
    │
    ▼
Create Request (type = "friend")
    │
    ▼
Receiver receives request
    │
 ┌──┴─────────────┐
 │                │
Accept         Reject
 │                │
 ▼                ▼
Become Friends  Delete Request
 │
 ▼
Delete Request
```

### Accept

* Add sender to receiver's `friends[]`.
* Add receiver to sender's `friends[]`.
* Delete the request.

### Reject

* Delete the request.

### future enhancement feature : 
* request sender can cancel request before receiver accept it.

---

# Group Invitation

Used by a Group Admin to invite a user into a group.

### Sending Invitation

1. Open **Group Detailed Information component**.
2. Enter the target username.
3. Click **Send Invitation**.
4. Create a new request with:

   * `type = "group"`
   * Sender
   * Receiver
   * Group Reference
   * `status = "pending"`

### Lifecycle

```text
Admin
    │
    ▼
Send Invitation
    │
    ▼
Create Request (type = "group")
    │
    ▼
Receiver receives request
    │
 ┌──┴─────────────┐
 │                │
Accept         Reject
 │                │
 ▼                ▼
Join Group     Delete Request
 │
 ▼
Delete Request
```

### Accept

* Add the user to the group's `members[]`.
* Add the group to the user's `joinedGroups[]`.
* Delete the request.

### Reject

* Delete the request.

---

### Request Status field (important)

* Version 1 supports the following status values:
pending
accepted
rejected

* Although accepted and rejected requests are immediately deleted, the status field is retained to support future features such as request history, notifications, analytics, and audit logs.

---

# Request Rules

* Users cannot send duplicate pending friend requests.
* Group Admins cannot send duplicate pending invitations.
* Users already in a group cannot receive another invitation for the same group.
* Invitations cannot be sent to non-existent users.
* Invitations cannot be accepted if the target group no longer exists.
* Requests remain visible until they are accepted, rejected, or cancelled.

---

# Business Rules

* Friend Requests
* Users cannot send a request to themselves.
* Users cannot send requests to existing friends.
* Duplicate pending friend requests are not allowed.
* Requests can only be sent to existing users.
* Group Invitations
* Only the Group Admin can send invitations.
* Invitations can only be sent to existing users.
* Users already in the group cannot be invited again.
* Duplicate pending invitations for the same group are not allowed.

---

# Future Enhancements

* Join Requests for Private Groups
* Request Expiration
* Invitation Notifications (will be implemented status field from the request collection )
* Bulk Invitations
* Request History
* Request Analytics