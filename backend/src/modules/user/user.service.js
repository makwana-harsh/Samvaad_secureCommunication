import mongoose from "mongoose";
import User from "../../models/User.model.js";
import Request from "../../models/Request.model.js";
import Conversation from "../../models/Conversation.model.js";
import Group from "../../models/Group.model.js"; // 👈 FIX 1: Import Group model
import { emitToUser } from "../../sockets/socket.manager.js";

export const getUserProfileService = async (currentUserId, targetUserId) => {
  const currentUserIdStr = currentUserId.toString();
  const targetUserIdStr = targetUserId.toString();

  const currentUser = await User.findById(currentUserId).select("friends").lean();
  if (!currentUser) throw new Error("Current user not found");

  const isSelf = currentUserIdStr === targetUserIdStr;
  const isFriend = (currentUser.friends || [])
    .map((id) => id.toString())
    .includes(targetUserIdStr);

  const targetUser = await User.findById(targetUserId)
    .select("-password")
    .populate("friends", "_id userName avatar")
    .lean();

  if (!targetUser) throw new Error("User not found");

  let relationshipStatus = "self";
  let activeRequestId = null; // 👈 1. Declare at function scope

  if (!isSelf) {
    if (isFriend) {
      relationshipStatus = "friend";
    } else {
      const pendingReq = await Request.findOne({
        type: "friend",
        status: "pending",
        $or: [
          { senderId: currentUserId, receiverId: targetUserId },
          { senderId: targetUserId, receiverId: currentUserId },
        ],
      }).lean();

      if (pendingReq) {
        activeRequestId = pendingReq._id; // 👈 2. Assign the request ID
        relationshipStatus =
          pendingReq.senderId.toString() === currentUserIdStr
            ? "pending_sent"
            : "pending_received";
      } else {
        relationshipStatus = "none";
      }
    }
  }

  const canViewFullDetails = isSelf || isFriend;

  const userGroups = await Group.find({ members: targetUserId })
    .select("_id groupName bio avatar visibility")
    .lean();

  const publicGroups = userGroups.filter((g) => g.visibility === "public");
  const privateGroups = userGroups.filter((g) => g.visibility === "private");

  return {
    _id: targetUser._id,
    userName: targetUser.userName,
    fullName: targetUser.fullName,
    avatar: targetUser.avatar,
    bio: targetUser.bio,
    relationshipStatus,
    activeRequestId, // 👈 3. Safely returns ObjectId or null
    emailId: targetUser.emailId,
    dob: targetUser.dob,
    friendsCount: (targetUser.friends || []).length,

    friends: canViewFullDetails ? targetUser.friends : [],
    publicGroups,
    privateGroups: canViewFullDetails ? privateGroups : [],

    mobileNo: canViewFullDetails ? targetUser.mobileNo : null,
    location: canViewFullDetails ? targetUser.location : null,
  };
};

export const searchUsersService = async (currentUserId, search, page, limit) => {
    const currentUser = await User.findById(currentUserId).select("friends").lean();
    if (!currentUser) throw new Error("User not found");

    const query = {
        _id: { $ne: currentUserId },
    };

    if (search) {
        const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        query.userName = { $regex: safeSearch, $options: "i" };
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
        User.find(query)
            .select("_id userName fullName avatar")
            .sort({ userName: 1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        User.countDocuments(query),
    ]);

    const friendIds = new Set(
        (currentUser.friends || []).map((id) => id.toString())
    );

    return {
        users: users.map((user) => ({
            ...user,
            isFriend: friendIds.has(user._id.toString()),
        })),
        pagination: {
            currentPage: page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasMore: page * limit < total,
        },
    };
};


export const unfriendUserService = async (currentUserId, targetUserId) => {
  const currentUserIdObj = new mongoose.Types.ObjectId(currentUserId);
  const targetUserIdObj = new mongoose.Types.ObjectId(targetUserId);

  if (currentUserId.toString() === targetUserId.toString()) {
    throw new Error("You cannot unfriend yourself");
  }

  await User.findByIdAndUpdate(currentUserId, {
    $pull: { friends: targetUserIdObj },
  });

  await User.findByIdAndUpdate(targetUserId, {
    $pull: { friends: currentUserIdObj },
  });

  const sortedKeys = [currentUserId.toString(), targetUserId.toString()].sort();
  const privateKey = `${sortedKeys[0]}_${sortedKeys[1]}`;

  await Conversation.findOneAndUpdate(
    { type: "private", privateConversationKey: privateKey },
    { $set: { messageRetentionDays: 30 } }
  );

  const currentUserIdStr = currentUserId.toString();
  const targetUserIdStr = targetUserId.toString();

  const [targetProfile, currentProfile] = await Promise.all([
    getUserProfileService(currentUserId, targetUserId),
    getUserProfileService(targetUserId, currentUserId),
  ]);

  emitToUser(targetUserIdStr, "user:unfriended", {
    unfriendedBy: currentUserIdStr,
    profile: currentProfile,
  });

  emitToUser(currentUserIdStr, "user:unfriend_success", {
    targetUserId: targetUserIdStr,
    profile: targetProfile,
  });

  return { success: true };
};