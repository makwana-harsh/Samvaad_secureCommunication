import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["private", "group"],
      required: true,
    },

    participants: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      default: [],
    },

    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      default: null,
    },

    lastMessage: {
      type: String,
      default: null,
    },

    lastMessageSenderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    lastMessageAt: {
      type: Date,
      default: null,
    },

    messageRetentionDays: {
      type: Number,
      default: null,
      min: 1,
    },
  },
  {
    timestamps: true,
    collection: "Conversation",
  }
);

/*
 * Used to find private conversations
 * involving a particular user.
 */
conversationSchema.index({
  participants: 1,
});

/*
 * Used to find the conversation belonging
 * to a particular group.
 */
conversationSchema.index({
  groupId: 1,
});

/*
 * Useful when displaying conversations
 * ordered by recent activity.
 */
conversationSchema.index({
  participants: 1,
  updatedAt: -1,
});

const Conversation = mongoose.model(
  "Conversation",
  conversationSchema
);

export default Conversation;