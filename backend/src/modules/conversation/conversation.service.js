import Conversation from "../../models/Conversation.model.js";
import mongoose from "mongoose";

/**
 * Fetch paginated conversations for a user based on active tab and search term.
 * 
 * @param {Object} params
 * @param {string} params.userId - Logged-in user's ID
 * @param {string} params.tab - "friends" or "temporary"
 * @param {string} params.search - Search string for userName or groupName
 * @param {number} params.page - Current page number
 * @param {number} params.limit - Number of conversations per page
 */
export const getConversationsService = async ({ userId, tab = "friends", search = "", page = 1, limit = 15}) => {
    const currentUserId = new mongoose.Types.ObjectId(userId);
    const skip = (page - 1) * limit;

    // 1. Base Match: User must be a participant OR the conversation belongs to a group
    const matchStage = {
        $or: [{ participants: currentUserId }],
    };

    // 2. Tab Filter Strategy
    if (tab === "temporary") {
        // Temporary chats must be private and have non-null retention days
        matchStage.type = "private";
        matchStage.messageRetentionDays = { $ne: null };
    } 
    else {
        // Permanent "Friends & Groups" tab:
        // Either permanent private conversations OR group conversations
        matchStage.$or = [
        { type: "private", messageRetentionDays: null, participants: currentUserId },
        { type: "group" },
        ];
    }

    // 3. Construct Aggregation Pipeline
    const pipeline = [
        { $match: matchStage },

        // Lookup Group Details if it's a group conversation
        {
            $lookup: {
                from: "Group",
                localField: "groupId",
                foreignField: "_id",
                as: "groupDetails",
            },
        },

        // Unwind groupDetails array if present
        {
        $unwind: {
                path: "$groupDetails",
                preserveNullAndEmptyArrays: true,
            },
        },

        // Filter out group conversations where current user is NOT a member
        {
        $match: {
                $or: [
                    { type: "private" },
                    { "groupDetails.members": currentUserId },
                ],
            },
        },

        // Lookup Participant Details for private conversations
        {
        $lookup: {
                from: "User",
                localField: "participants",
                foreignField: "_id",
                as: "participantDetails",
            },
        },

        // Lookup Sender Details for the last message
        {
        $lookup: {
                from: "User",
                localField: "lastMessageSenderId",
                foreignField: "_id",
                as: "lastSenderDetails",
            },
        },
        {
        $unwind: {
                path: "$lastSenderDetails",
                preserveNullAndEmptyArrays: true,
            },
        },
    ];

    // 4. Strict Search Filter (by userName for users, groupName for groups)
    if (search.trim()) {
        const searchRegex = new RegExp(search.trim(), "i");
        pipeline.push({
            $match: {
                $or: [
                    // Match groupName for group conversations
                    { "groupDetails.groupName": searchRegex },
                    // Match other participant's userName for private conversations (excluding current user)
                    {
                        participantDetails: {
                            $elemMatch: {
                                _id: { $ne: currentUserId },
                                userName: searchRegex,
                            },
                        },
                    },
                ],
            },
        });
    }

    // 5. Sorting and Pagination Facet
    pipeline.push(
        { $sort: { lastMessageAt: -1, updatedAt: -1 } },
        {
            $facet: {
                data: [{ $skip: skip }, { $limit: limit }],
                totalCount: [{ $count: "count" }],
            },
        }
    );

    const result = await Conversation.aggregate(pipeline);

    const rawData = result[0]?.data || [];
    const total = result[0]?.totalCount[0]?.count || 0;

    // 6. Transform response structure for cleaner frontend consumption
    const conversations = rawData.map((conv) => {
        if (conv.type === "group") {
            return {
                conversationId: conv._id,
                type: "group",
                groupName: conv.groupDetails?.groupName || "Group Chat",
                avatar: conv.groupDetails?.avatar || null,
                lastMessage: conv.lastMessage || null,
                lastMessageAt: conv.lastMessageAt || conv.updatedAt,
                senderUserName: conv.lastSenderDetails
                ? conv.lastSenderDetails._id.toString() === userId
                    ? "You"
                    : conv.lastSenderDetails.userName
                : null,
            };
        }

        // For private conversations (Friend or Temporary)
        const otherParticipant = conv.participantDetails.find(
            (p) => p._id.toString() !== userId
        );

        return {
            conversationId: conv._id,
            type: conv.messageRetentionDays ? "non-friend" : "friend",
            otherUserId: otherParticipant?._id || null,
            userName: otherParticipant?.userName || "Unknown",
            fullName: otherParticipant?.fullName || "",
            avatar: otherParticipant?.avatar || null,
            isOnline: otherParticipant?.isOnline || false,
            lastSeen: otherParticipant?.lastSeen || null,
            lastMessage: conv.lastMessage || null,
            lastMessageAt: conv.lastMessageAt || conv.updatedAt,
            messageRetentionDays: conv.messageRetentionDays || null,
        };
    });

    return {
        conversations,
        pagination: {
            currentPage: page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasMore: page * limit < total,
        },
    };
};