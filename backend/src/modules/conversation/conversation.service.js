import Conversation from "../../models/Conversation.model.js";
import mongoose from "mongoose";

/**
 * Fetch paginated conversations for a user based on active tab and search term.
 */
export const getConversationsService = async ({
  userId,
  tab = "friends",
  search = "",
  page = 1,
  limit = 15,
}) => {
  const currentUserId = new mongoose.Types.ObjectId(userId);
  const skip = (page - 1) * limit;

  // 1. Build Tab Match Stage
  let matchStage = {};

  if (tab === "temporary") {
    matchStage = {
      type: "private",
      messageRetentionDays: { $ne: null },
      participants: currentUserId,
    };
  } else {
    // Friends & Groups tab
    matchStage = {
      $or: [
        {
          type: "private",
          messageRetentionDays: null,
          participants: currentUserId,
        },
        {
          type: "group",
        },
      ],
    };
  }

  // 2. Construct Aggregation Pipeline
  const pipeline = [
    { $match: matchStage },

    // Lookup Group Details (Collection name: "Group")
    {
      $lookup: {
        from: "Group",
        localField: "groupId",
        foreignField: "_id",
        as: "groupDetails",
      },
    },

    {
      $unwind: {
        path: "$groupDetails",
        preserveNullAndEmptyArrays: true,
      },
    },

    // Ensure user is either in a private chat or is a member of the group
    {
      $match: {
        $or: [
          { type: "private" },
          { "groupDetails.members": currentUserId },
        ],
      },
    },

    // Lookup Participants (Collection name: "User")
    {
      $lookup: {
        from: "User",
        localField: "participants",
        foreignField: "_id",
        as: "participantDetails",
      },
    },

    // Lookup Last Message Sender Details (Collection name: "User")
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

  // 3. Search Filter
  if (search.trim()) {
    const searchRegex = new RegExp(search.trim(), "i");
    pipeline.push({
      $match: {
        $or: [
          { "groupDetails.groupName": searchRegex },
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

  // 4. Sort and Facet for Pagination
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

  // 5. Transform Output
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