import mongoose from "mongoose";
import User from "../../models/User.model.js";
import Group from "../../models/Group.model.js";
import Conversation from "../../models/Conversation.model.js";

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const paginate = (items, page, limit) => {
    const total = items.length;
    const start = (page - 1) * limit;

    return {
        data: items.slice(start, start + limit),
        pagination: {
            currentPage: page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasMore: page * limit < total,
        },
    };
};

const getPrivateKey = (userA, userB) => {
    return [userA.toString(), userB.toString()].sort().join("_");
};

export const getConversationsService = async ({
    userId,
    tab = "friends",
    search = "",
    page = 1,
    limit = 15,
}) => {
    const currentUserId = new mongoose.Types.ObjectId(userId);
    const regex = search ? new RegExp(escapeRegex(search), "i") : null;

    if (tab === "temporary") {
        const conversations = await Conversation.find({
            type: "private",
            participants: currentUserId,
            messageRetentionDays: { $ne: null },
        })
            .populate("participants", "_id userName fullName avatar isOnline lastSeen")
            .populate("lastMessageSenderId", "_id userName")
            .sort({ lastMessageAt: -1, updatedAt: -1 })
            .lean();

        let cards = conversations.map((conversation) => {
            const otherUser = conversation.participants.find(
                (user) => user._id.toString() !== userId.toString()
            );

            return {
                cardId: conversation._id,
                conversationId: conversation._id,
                type: "temporary",
                userId: otherUser?._id || null,
                userName: otherUser?.userName || "Unknown",
                fullName: otherUser?.fullName || "",
                avatar: otherUser?.avatar || null,
                isOnline: otherUser?.isOnline || false,
                lastSeen: otherUser?.lastSeen || null,
                lastMessage: conversation.lastMessage || null,
                lastMessageAt: conversation.lastMessageAt || conversation.updatedAt,
                senderUserName: conversation.lastMessageSenderId
                    ? conversation.lastMessageSenderId._id.toString() === userId.toString()
                        ? "You"
                        : conversation.lastMessageSenderId.userName
                    : null,
                messageRetentionDays: conversation.messageRetentionDays,
            };
        });

        if (regex) cards = cards.filter((card) => regex.test(card.userName) || regex.test(card.fullName));

        const result = paginate(cards, page, limit);
        return { conversations: result.data, pagination: result.pagination };
    }

    const currentUser = await User.findById(userId)
        .select("friends joinedGroups")
        .populate("friends", "_id userName fullName avatar isOnline lastSeen")
        .lean();

    if (!currentUser) throw new Error("User not found");

    const groups = await Group.find({ members: currentUserId })
        .select("_id groupName avatar conversationId")
        .lean();

    const friendIds = (currentUser.friends || []).map((friend) => friend._id);
    const privateKeys = friendIds.map((friendId) => getPrivateKey(userId, friendId));

    const privateConversations = await Conversation.find({
        privateConversationKey: { $in: privateKeys },
        messageRetentionDays: null,
    })
        .populate("lastMessageSenderId", "_id userName")
        .lean();

    const privateMap = new Map(
        privateConversations.map((conversation) => [
            conversation.privateConversationKey,
            conversation,
        ])
    );

    const friendCards = (currentUser.friends || []).map((friend) => {
        const conversation = privateMap.get(getPrivateKey(userId, friend._id));

        return {
            cardId: `user-${friend._id}`,
            conversationId: conversation?._id || null,
            type: "friend",
            userId: friend._id,
            userName: friend.userName,
            fullName: friend.fullName,
            avatar: friend.avatar,
            isOnline: friend.isOnline || false,
            lastSeen: friend.lastSeen || null,
            lastMessage: conversation?.lastMessage || null,
            lastMessageAt: conversation?.lastMessageAt || null,
            senderUserName: conversation?.lastMessageSenderId
                ? conversation.lastMessageSenderId._id.toString() === userId.toString()
                    ? "You"
                    : conversation.lastMessageSenderId.userName
                : null,
        };
    });

    const groupConversationIds = groups.map((group) => group.conversationId).filter(Boolean);

    const groupConversations = await Conversation.find({
        _id: { $in: groupConversationIds },
    })
        .populate("lastMessageSenderId", "_id userName")
        .lean();

    const groupConversationMap = new Map(
        groupConversations.map((conversation) => [
            conversation._id.toString(),
            conversation,
        ])
    );

    const groupCards = groups.map((group) => {
        const conversation = groupConversationMap.get(group.conversationId?.toString());

        return {
            cardId: `group-${group._id}`,
            conversationId: group.conversationId,
            type: "group",
            groupId: group._id,
            groupName: group.groupName,
            avatar: group.avatar,
            lastMessage: conversation?.lastMessage || null,
            lastMessageAt: conversation?.lastMessageAt || null,
            senderUserName: conversation?.lastMessageSenderId
                ? conversation.lastMessageSenderId._id.toString() === userId.toString()
                    ? "You"
                    : conversation.lastMessageSenderId.userName
                : null,
        };
    });

    let cards = [...friendCards, ...groupCards];

    if (regex) {
        cards = cards.filter((card) => {
            if (card.type === "group") return regex.test(card.groupName);
            return regex.test(card.userName) || regex.test(card.fullName);
        });
    }

    cards.sort((a, b) => {
        if (!a.lastMessageAt && !b.lastMessageAt) return 0;
        if (!a.lastMessageAt) return 1;
        if (!b.lastMessageAt) return -1;
        return new Date(b.lastMessageAt) - new Date(a.lastMessageAt);
    });

    const result = paginate(cards, page, limit);

    return {
        conversations: result.data,
        pagination: result.pagination,
    };
};

export const getOrCreatePrivateConversationService = async (userId, targetUserId) => {
    if (!mongoose.isValidObjectId(targetUserId)) throw new Error("Invalid user ID");
    if (userId.toString() === targetUserId.toString()) throw new Error("Cannot message yourself");

    const [currentUser, targetUser] = await Promise.all([
        User.findById(userId).select("friends").lean(),
        User.findById(targetUserId).select("_id userName fullName avatar isOnline lastSeen").lean(),
    ]);

    if (!currentUser || !targetUser) throw new Error("User not found");

    const isFriend = (currentUser.friends || []).some(
        (friendId) => friendId.toString() === targetUserId.toString()
    );

    const privateConversationKey = getPrivateKey(userId, targetUserId);

    let conversation = await Conversation.findOne({ privateConversationKey });

    if (!conversation) {
        conversation = await Conversation.create({
            type: "private",
            participants: [userId, targetUserId],
            privateConversationKey,
            messageRetentionDays: isFriend ? null : 30,
        });
    }

    return {
        conversationId: conversation._id,
        type: conversation.messageRetentionDays ? "temporary" : "friend",
        targetUser: {
            _id: targetUser._id,
            userName: targetUser.userName,
            fullName: targetUser.fullName,
            avatar: targetUser.avatar,
            isOnline: targetUser.isOnline,
            lastSeen: targetUser.lastSeen,
        },
    };
};


export const getOnlineFriendsService = async (userId) => {
    const user = await User.findById(userId)
        .select("friends")
        .populate({
            path: "friends",
            select: "_id userName avatar isOnline",
            match: { isOnline: true },
        })
        .lean();

    if (!user) throw new Error("User not found");

    return user.friends || [];
};