this is my folder setup inside cloudinary >>
Cloudinary
│
└── Samvaad_Project/
    │
    ├── users/    // for user profile pic, the user uploaded pic name is document id of document inside User collection, all the user profile pic is stored inside here
    │   ├── <userId>
    │   └── ...
    │
    ├── groups/    //for group profile pic, the pic name is document id of that document inside Group collection, all the group profile pic is stored inside here
    │   ├── <groupId>
    │   └── ...
    │
    └── messages/
        │
        ├── <conversationId>/  // conversation document id from the Conversation model
        │   ├── <messageId>   // message id of that message document from the Message collection, it can be pic, video, audio , files etc.
        │   ├── <messageId>
        │   └── ...
        │
        ├── <conversationId>/
        │   ├── <messageId>
        │   └── ...


// What to Remember & Where This Code Interfaces
// As you build out the remaining half of your project (e.g., chat.socket.js, group messaging, and REST controllers), keep these key touchpoints in mind:

// 1. How Message Creation Interacts With Cleanup
// When sending a message (via HTTP controller or Socket.io event), your system sets the message expiration based on the conversation setting:

// JavaScript
// // Example during message creation in chat.socket.js or message.controller.js
// const conversation = await Conversation.findById(conversationId).select("messageRetentionDays");

// let expiresAt = null;
// if (conversation.messageRetentionDays) {
//   expiresAt = new Date(Date.now() + conversation.messageRetentionDays * 24 * 60 * 60 * 1000);
// }

// const newMessage = await Message.create({
//   conversationId,
//   senderId,
//   messageType,
//   content,
//   cloudinaryPublicId,
//   cloudinaryResourceType,
//   expiresAt, // 👈 Cleanup job relies on this field being set accurately!
// });

// 2. Conflict Risks & Variable Sharing
// Does it share variables with other modules?: No. The job runs independently in the background. It reads from the database and calls Cloudinary directly, so it won't conflict with active user requests.

// Socket / Realtime UI Edge Case: If an expired message is deleted while a user is currently viewing the chat room, the message won't instantly vanish from their screen unless you emit a socket event. (This is standard behavior across chat apps—a simple refresh or room rejoin fetches the updated list without the expired messages).

// How to Register It Right Now
// Ensure node-cron is installed (npm install node-cron).

// Update backend/src/jobs/messageCleanup.job.js with the optimized code above.

// In backend/src/app.js or backend/src/server.js, call initMessageCleanupScheduler() right after database connection setup:

// JavaScript
// import { initMessageCleanupScheduler } from "./jobs/messageCleanup.job.js";

// // Inside server startup
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
//   initMessageCleanupScheduler(); // 👈 Activates the scheduler
// });


// use "* * * * *" to run every minute for testing