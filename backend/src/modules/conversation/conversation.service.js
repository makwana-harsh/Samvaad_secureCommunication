import mongoose from "mongoose";
import Conversation from "../../models/Conversation.model.js";
import User from "../../models/User.model.js";
import Message from "../../models/Message.model.js";

export const getConversationsService = async ({
  userId,
  tab = "friends_and_groups",
  search = "",
  page = 1,
  limit = 15,
}) => {
  const currentUserId = new mongoose.Types.ObjectId(userId);
  const skip = (page - 1) * limit;

  // ----------------------------------------------------
  // STEP A: Handle "Friends & Groups" Tab
  // ----------------------------------------------------
  if (tab === "friends_and_groups" || tab === "friends") {
    // 1. Fetch user's friends list
    const currentUser = await User.findById(userId).select("friends").lean();
    const friendIds = currentUser?.friends || [];

    // 2. Base Match for existing Conversations (Permanent Private OR Joined Groups)
    const matchStage = {
      $or: [
        { type: "private", messageRetentionDays: null, participants: currentUserId },
        { type: "group" },
      ],
    };

    const pipeline = [
      { $match: matchStage },
      // Lookup Group Details
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
      // Keep groups where user is a member or keep private chats
      {
        $match: {
          $or: [{ type: "private" }, { "groupDetails.members": currentUserId }],
        },
      },
      // Lookup Private Participants
      {
        $lookup: {
          from: "User",
          localField: "participants",
          foreignField: "_id",
          as: "participantDetails",
        },
      },
      // Lookup Last Message Sender Details
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

    // Search Filter
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
                  $or: [{ userName: searchRegex }, { fullName: searchRegex }],
                },
              },
            },
          ],
        },
      });
    }

    const rawConversations = await Conversation.aggregate(pipeline);

    // Track friends who already have conversation entries
    const existingFriendConvUserIds = new Set();
    
    // Transform existing conversation documents
    const cardPromises = rawConversations.map(async (conv) => {
      // Calculate unread messages
      const unreadCount = await Message.countDocuments({
        conversationId: conv._id,
        senderId: { $ne: currentUserId },
        createdAt: { $gt: conv.lastMessageAt || new Date(0) },
      });

      if (conv.type === "group") {
        return {
          cardId: `group_${conv._id}`,
          conversationId: conv._id,
          type: "group",
          name: conv.groupDetails?.groupName || "Group Chat",
          avatar: conv.groupDetails?.avatar || null,
          lastMessage: conv.lastMessage || null,
          lastMessageAt: conv.lastMessageAt || conv.updatedAt,
          senderUserName: conv.lastSenderDetails
            ? conv.lastSenderDetails._id.toString() === userId
              ? "You"
              : conv.lastSenderDetails.userName
            : null,
          unreadCount,
          updatedAt: conv.lastMessageAt || conv.updatedAt,
        };
      }

      // Private Friend Conversation
      const otherParticipant = conv.participantDetails.find(
        (p) => p._id.toString() !== userId
      );

      if (otherParticipant) {
        existingFriendConvUserIds.add(otherParticipant._id.toString());
      }

      return {
        cardId: `user_${otherParticipant?._id}`,
        conversationId: conv._id,
        type: "private",
        isFriend: true,
        targetUser: {
          _id: otherParticipant?._id,
          userName: otherParticipant?.userName || "Unknown",
          avatar: otherParticipant?.avatar || null,
          isOnline: otherParticipant?.isOnline || false,
          lastSeen: otherParticipant?.lastSeen || null,
        },
        lastMessage: conv.lastMessage || null,
        senderUserName: null,
        lastMessageAt: conv.lastMessageAt || null,
        unreadCount,
        updatedAt: conv.lastMessageAt || conv.updatedAt,
      };
    });

    let cards = await Promise.all(cardPromises);

    // 3. Find Friends without an active Conversation document yet
    const friendsWithoutConvIds = friendIds.filter(
      (id) => !existingFriendConvUserIds.has(id.toString())
    );

    if (friendsWithoutConvIds.length > 0) {
      const searchFilter = {
        _id: { $in: friendsWithoutConvIds },
        ...(search.trim()
          ? {
              $or: [
                { userName: { $regex: search.trim(), $options: "i" } },
                { fullName: { $regex: search.trim(), $options: "i" } },
              ],
            }
          : {}),
      };

      const newFriends = await User.find(searchFilter)
        .select("userName fullName avatar isOnline lastSeen updatedAt")
        .lean();

      const newFriendCards = newFriends.map((friend) => ({
        cardId: `user_${friend._id}`,
        conversationId: null,
        type: "private",
        isFriend: true,
        targetUser: {
          _id: friend._id,
          userName: friend.userName,
          avatar: friend.avatar,
          isOnline: friend.isOnline,
          lastSeen: friend.lastSeen,
        },
        lastMessage: null,
        senderUserName: null,
        lastMessageAt: null,
        unreadCount: 0,
        updatedAt: friend.updatedAt || new Date(0),
      }));

      cards = [...cards, ...newFriendCards];
    }

    // Sort cards by latest activity / timestamp
    cards.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    const total = cards.length;
    const paginatedCards = cards.slice(skip, skip + limit);

    return {
      cards: paginatedCards,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + limit < total,
      },
    };
  }

  // ----------------------------------------------------
  // STEP B: Handle "Temporary Chats" Tab
  // ----------------------------------------------------
  const matchStage = {
    type: "private",
    participants: currentUserId,
    messageRetentionDays: { $ne: null },
    lastMessage: { $ne: null }, // Must have at least 1 message
  };

  const pipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: "User",
        localField: "participants",
        foreignField: "_id",
        as: "participantDetails",
      },
    },
  ];

  if (search.trim()) {
    const searchRegex = new RegExp(search.trim(), "i");
    pipeline.push({
      $match: {
        participantDetails: {
          $elemMatch: {
            _id: { $ne: currentUserId },
            $or: [{ userName: searchRegex }, { fullName: searchRegex }],
          },
        },
      },
    });
  }

  pipeline.push({ $sort: { lastMessageAt: -1, updatedAt: -1 } });

  const rawTempConvs = await Conversation.aggregate(pipeline);

  const tempCardsPromises = rawTempConvs.map(async (conv) => {
    const otherParticipant = conv.participantDetails.find(
      (p) => p._id.toString() !== userId
    );

    const unreadCount = await Message.countDocuments({
      conversationId: conv._id,
      senderId: { $ne: currentUserId },
      createdAt: { $gt: conv.lastMessageAt || new Date(0) },
    });

    return {
      cardId: `conv_${conv._id}`,
      conversationId: conv._id,
      type: "private",
      isFriend: false,
      targetUser: {
        _id: otherParticipant?._id,
        userName: otherParticipant?.userName || "Unknown",
        avatar: otherParticipant?.avatar || null,
        lastSeen: otherParticipant?.lastSeen || null,
      },
      lastMessage: conv.lastMessage,
      senderUserName: null,
      lastMessageAt: conv.lastMessageAt || conv.updatedAt,
      messageRetentionDays: conv.messageRetentionDays,
      unreadCount,
      updatedAt: conv.lastMessageAt || conv.updatedAt,
    };
  });

  const tempCards = await Promise.all(tempCardsPromises);
  const total = tempCards.length;
  const paginatedCards = tempCards.slice(skip, skip + limit);

  return {
    cards: paginatedCards,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + limit < total,
    },
  };
};