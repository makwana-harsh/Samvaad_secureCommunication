# Total 5 Collections

# Collection 1 - users Collection
* _id
* username
* fullName
* email
* mobile
* password
* profilePicture
* bio
* location
* dob
* blockedUsers[] //array of references of documents of users from the users collection
* friends[]   // User IDs ,(It is Array of User IDs / References to the users collection .it store users collection's _id)

* createdAt
* updatedAt


# Collection 2 — Requests
* _id
* type  //Request type (friend or group)
* sender    // it is References of document sender inside the users collection
* receiver  // it is References of document receiver inside the users collection
* groupId // only for groups, group collections reference id
* status
    pending
    accepted
    rejected

* createdAt
* updatedAt

# Collection 3 — Groups
_id
name
bio
profilePicture  // it stores Cloudinary URL
visibility      // It has two values `public` and `private`
admin       //reference of document of user from the users collection
members[]   // array of references of documents of users from the users collection
conversationId // reference of document from Conversations collection
inviteCode      //secret link
createdAt   
updatedAt

# Collection 4 — Conversations

_id

type            
    private     // single user conversation
    group       // group conversation

participants[]      //array of references of user document from users collection. It will be empty if `coversation type === private` . 
groupId (nullable)     // If `coversation type === group` then reference of document of that group otherwise null 
lastMessage             // lastMessage in the form of string (it is not reference id)
lastMessageAt           // lastmessage time stept
createdAt   


# Collection 5 — Messages

_id

conversationId      //references of conversation document from Conversations collection.
senderId            // sender reference id from the users collection

type                    // type: text or img of the message
    text
    image

content                 //string if `type===text` and cloudinary url if `type===img`
createdAt