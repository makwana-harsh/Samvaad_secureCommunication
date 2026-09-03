import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["private", "group"],
      required: true,
    },

    /*
     * Used only for private conversations.
     *
     * Exactly two users.
     */
    participants: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      default: [],
    },

    /*
     * Used only for group conversations.
     */
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      default: null,
    },

    /*
     * Used to guarantee that only one private
     * conversation exists between two users.
     *
     * Example:
     *
     * userA_userB
     *
     * The IDs must always be stored in sorted order
     * before generating this value.
     */
    privateConversationKey: {
      type: String,
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

    /*
     * null:
     *     Permanent conversation
     *
     * 30:
     *     Messages remain for 30 days
     *
     * This is mainly used for temporary
     * non-friend conversations.
     */
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
 * Find conversations involving a user.
 */
conversationSchema.index({
  participants: 1,
  updatedAt: -1,
});

/*
 * Find a group's conversation.
 */
conversationSchema.index({
  groupId: 1,
});

/*
 * Guarantees one private conversation
 * for one pair of users.
 *
 * sparse allows multiple documents where
 * privateConversationKey is null.
 */
conversationSchema.index(
  {
    privateConversationKey: 1,
  },
  {
    unique: true,
    sparse: true,
  }
);

const Conversation = mongoose.model(
  "Conversation",
  conversationSchema
);

export default Conversation;