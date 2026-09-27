import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
            index: true,
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        messageType: {
            type: String,
            enum: ["text", "image", "video", "audio", "file", "system"],
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        originalFileName: {
            type: String,
            default: null,
        },
        mimeType: {
            type: String,
            default: null,
        },

        fileSize: {
            type: Number,
            default: null,
        },

        thumbnailUrl: {
            type: String,
            default: null,
        },
        cloudinaryPublicId: {
            type: String,
            default: null,
        },
        cloudinaryResourceType: {
            type: String,
            default: null,
        },
        expiresAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true, collection: "Message" }
);

messageSchema.index({ conversationId: 1, createdAt: 1 });
messageSchema.index({ expiresAt: 1 });


const Message = mongoose.model("Message", messageSchema);

export default Message;



