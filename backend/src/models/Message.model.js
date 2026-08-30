import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    messageType: {
      type: String,
      enum: [
        "text",
        "image",
        "video",
        "audio",
        "file",
        "system",
      ],
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    /*
     * This field is calculated from:
     *
     * conversation.messageRetentionDays
     *
     * It is null for conversations where
     * messages should not automatically expire.
     */
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "Message",
  }
);

/*
 * Message history query:
 *
 * Find messages belonging to a conversation
 * and return them ordered by creation time.
 */
messageSchema.index({
  conversationId: 1,
  createdAt: 1,
});

/*
 * TTL index.
 *
 * MongoDB automatically removes a Message
 * when expiresAt is reached.
 *
 * The partial filter ensures that only messages
 * having an actual Date in expiresAt participate
 * in the TTL index.
 */
messageSchema.index(
  {
    expiresAt: 1,
  },
  {
    expireAfterSeconds: 0,
    partialFilterExpression: {
      expiresAt: {
        $type: "date",
      },
    },
  }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;