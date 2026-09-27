import mongoose from "mongoose";
import Message from "../../models/Message.model.js";
import Conversation from "../../models/Conversation.model.js";
import Group from "../../models/Group.model.js";
import User from "../../models/User.model.js";
import { emitToUser } from "../../sockets/socket.manager.js";
import { uploadChatMessageAttachment,generateChatAttachmentPreview } from "../../utils/cloudinary.js";

const getConversationAccess = async (userId, conversationId) => {
    if (!mongoose.isValidObjectId(conversationId)) throw new Error("Invalid conversation ID");

    const conversation = await Conversation.findById(conversationId).lean();
    if (!conversation) throw new Error("Conversation not found");

    if (conversation.type === "private") {
        const allowed = (conversation.participants || []).some(
            (id) => id.toString() === userId.toString()
        );

        if (!allowed) throw new Error("You are not part of this conversation");

        return {
            conversation,
            recipientIds: conversation.participants.map((id) => id.toString()),
        };
    }

    const group = await Group.findOne({
        _id: conversation.groupId,
        members: userId,
    }).select("members").lean();

    if (!group) throw new Error("You are not a member of this group");

    return {
        conversation,
        recipientIds: group.members.map((id) => id.toString()),
    };
};

export const getMessagesService = async ({
    userId,
    conversationId,
    page = 1,
    limit = 30,
}) => {
    await getConversationAccess(userId, conversationId);

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
        Message.find({ conversationId })
            .populate("senderId", "_id userName avatar")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Message.countDocuments({ conversationId }),
    ]);

    return {
        messages: messages.reverse(),
        pagination: {
            currentPage: page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasMore: page * limit < total,
        },
    };
};

export const sendMessageService = async ({
    userId,
    conversationId,
    content,
}) => {
    const cleanContent = typeof content === "string" ? content.trim() : "";

    if (!cleanContent) throw new Error("Message cannot be empty");
    if (cleanContent.length > 5000) throw new Error("Message is too long");

    const { conversation, recipientIds } = await getConversationAccess(userId, conversationId);

    const sender = await User.findById(userId).select("_id userName avatar").lean();
    if (!sender) throw new Error("Sender not found");

    let expiresAt = null;

    if (conversation.messageRetentionDays) {
        expiresAt = new Date(
            Date.now() + conversation.messageRetentionDays * 24 * 60 * 60 * 1000
        );
    }

    const createdMessage = await Message.create({
        conversationId,
        senderId: userId,
        messageType: "text",
        content: cleanContent,
        expiresAt,
    });

    const now = createdMessage.createdAt;

    await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: cleanContent,
        lastMessageSenderId: userId,
        lastMessageAt: now,
    });

    const message = {
        _id: createdMessage._id,
        conversationId: createdMessage.conversationId,
        senderId: {
            _id: sender._id,
            userName: sender.userName,
            avatar: sender.avatar,
        },
        messageType: "text",
        content: cleanContent,
        expiresAt,
        createdAt: createdMessage.createdAt,
    };

    const socketData = {
        message,
        conversationUpdate: {
            conversationId: conversation._id,
            lastMessage: cleanContent,
            lastMessageAt: now,
            senderId: sender._id,
            senderUserName: sender.userName,
        },
    };

    recipientIds.forEach((recipientId) => {
        emitToUser(recipientId, "message:new", socketData);
    });

    return message;
};


export const sendAttachmentService = async ({
    userId,
    conversationId,
    file,
}) => {
    if (!file) throw new Error("File is required");

    const { conversation, recipientIds } =
        await getConversationAccess(userId, conversationId);

    const sender = await User.findById(userId)
        .select("_id userName avatar")
        .lean();

    if (!sender) throw new Error("Sender not found");

    let messageType = "file";

    if (file.mimetype.startsWith("image/")) messageType = "image";
    else if (file.mimetype.startsWith("video/")) messageType = "video";
    else if (file.mimetype.startsWith("audio/")) messageType = "audio";

    let expiresAt = null;

    if (conversation.messageRetentionDays) {
        expiresAt = new Date(
            Date.now() +
            conversation.messageRetentionDays * 24 * 60 * 60 * 1000
        );
    }

    // Generate ID before upload so Cloudinary filename = Message ID
    const messageId = new mongoose.Types.ObjectId();

    const uploaded = await uploadChatMessageAttachment(
        file.buffer,
        conversationId,
        messageId,
        file.mimetype,
        file.originalname
    );

    const thumbnailUrl = generateChatAttachmentPreview(
        uploaded.public_id,
        uploaded.resource_type
    );

    const createdMessage = await Message.create({
        _id: messageId,
        conversationId,
        senderId: userId,
        messageType,

        content: uploaded.secure_url,
        thumbnailUrl,

        originalFileName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,

        cloudinaryPublicId: uploaded.public_id,
        cloudinaryResourceType: uploaded.resource_type,

        expiresAt,
    });

    const labels = {
        image: "📷 Image",
        video: "🎥 Video",
        audio: "🎵 Audio",
        file: "📎 File",
    };

    const lastMessage = labels[messageType];

    await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage,
        lastMessageSenderId: userId,
        lastMessageAt: createdMessage.createdAt,
    });

    const message = {
        _id: createdMessage._id,
        conversationId: createdMessage.conversationId,

        senderId: {
            _id: sender._id,
            userName: sender.userName,
            avatar: sender.avatar,
        },

        messageType,
        content: uploaded.secure_url,
        thumbnailUrl,

        originalFileName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,

        cloudinaryPublicId: uploaded.public_id,
        cloudinaryResourceType: uploaded.resource_type,

        expiresAt,
        createdAt: createdMessage.createdAt,
    };

    const socketData = {
        message,

        conversationUpdate: {
            conversationId: conversation._id,
            lastMessage,
            lastMessageAt: createdMessage.createdAt,
            senderId: sender._id,
            senderUserName: sender.userName,
        },
    };

    recipientIds.forEach((recipientId) => {
        emitToUser(recipientId, "message:new", socketData);
    });

    return message;
};