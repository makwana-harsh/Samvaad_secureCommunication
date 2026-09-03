import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },

    /*
     * User who sent the message.
     *
     * For normal messages:
     * senderId = actual User ID.
     *
     * For system messages:
     * senderId can be null because the message
     * represents an event such as:
     *
     * "Rahul left the group"
     */
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
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

    /*
     * For text messages:
     *     "Hello Rahul"
     *
     * For media messages:
     *     Cloudinary secure URL
     *
     * For system messages:
     *     "Rahul left the group"
     */
    content: {
      type: String,
      required: true,
    },

    /*
     * Original filename supplied by the sender.
     *
     * Example:
     *     "holiday_photo.jpg"
     *     "project.pdf"
     *     "voice_note.mp3"
     *
     * Used when the receiver downloads the file.
     */
    originalFileName: {
      type: String,
      default: null,
    },

    /*
     * Cloudinary public ID.
     *
     * Example:
     *
     * Samvaad_Project/messages/
     * 68abc.../69xyz...
     *
     * Storing this separately makes media deletion
     * reliable.
     */
    cloudinaryPublicId: {
      type: String,
      default: null,
    },

    /*
     * Cloudinary resource type.
     *
     * Examples:
     * image
     * video
     * raw
     */
    cloudinaryResourceType: {
      type: String,
      default: null,
    },

    /*
     * For temporary non-friend conversations:
     *
     * expiresAt = exact time when this message
     * should be deleted.
     *
     * For permanent conversations:
     * expiresAt = null
     */
    expiresAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "Message",
  }
);

/*
 * Efficient message history query.
 */
messageSchema.index({
  conversationId: 1,
  createdAt: 1,
});

/*
 * Efficient cleanup query.
 */
messageSchema.index({
  expiresAt: 1,
});

const Message = mongoose.model("Message", messageSchema);

export default Message;