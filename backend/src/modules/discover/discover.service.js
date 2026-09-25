import mongoose from "mongoose";
import User from "../../models/User.model.js";
import Group from "../../models/Group.model.js";

export const getDiscoverFeedService = async (currentUserId, { search, page, limit }) => {
  const userIdObj = new mongoose.Types.ObjectId(currentUserId);
  const searchRegex = new RegExp(search.trim(), "i");
  const skip = (page - 1) * limit;

  // 1. Build Filter Match Stages
  const userMatchStage = { _id: { $ne: userIdObj } };
  if (search.trim()) {
    userMatchStage.userName = searchRegex;
  }

  const groupMatchStage = { visibility: "public" };
  if (search.trim()) {
    groupMatchStage.groupName = searchRegex;
  }

  // 2. Fetch Total Document Counts
  const [totalUsers, totalGroups] = await Promise.all([
    User.countDocuments(userMatchStage),
    Group.countDocuments(groupMatchStage),
  ]);

  const totalCount = totalUsers + totalGroups;

  // 3. Query All Filtered Matching IDs First (Lightweight)
  const [userDocs, groupDocs] = await Promise.all([
    User.find(userMatchStage).select("_id").lean(),
    Group.find(groupMatchStage).select("_id").lean(),
  ]);

  // Interleave raw IDs to build a master sequence
  const interleavedMeta = [];
  const maxLen = Math.max(userDocs.length, groupDocs.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < userDocs.length) {
      interleavedMeta.push({ id: userDocs[i]._id, type: "user" });
    }
    if (i < groupDocs.length) {
      interleavedMeta.push({ id: groupDocs[i]._id, type: "group" });
    }
  }

  // Slice exact page window from master sequence
  const pageSlice = interleavedMeta.slice(skip, skip + limit);

  const userIdsToFetch = pageSlice
    .filter((item) => item.type === "user")
    .map((item) => item.id);
  const groupIdsToFetch = pageSlice
    .filter((item) => item.type === "group")
    .map((item) => item.id);

  // 4. Fetch Full Document Details for the Current Page Only
  const [rawUsers, rawGroups] = await Promise.all([
    userIdsToFetch.length > 0
      ? User.find({ _id: { $in: userIdsToFetch } })
          .select("_id fullName userName avatar bio friends")
          .lean()
      : [],
    groupIdsToFetch.length > 0
      ? Group.find({ _id: { $in: groupIdsToFetch } })
          .select("_id groupName bio avatar members")
          .lean()
      : [],
  ]);

  const userMap = new Map(rawUsers.map((u) => [u._id.toString(), u]));
  const groupMap = new Map(rawGroups.map((g) => [g._id.toString(), g]));

  // Re-assemble in exact interleaved order
  const paginatedCards = [];
  for (const item of pageSlice) {
    const idStr = item.id.toString();
    if (item.type === "user" && userMap.has(idStr)) {
      const u = userMap.get(idStr);
      paginatedCards.push({
        cardType: "user",
        _id: u._id,
        userName: u.userName,
        fullName: u.fullName,
        avatar: u.avatar,
        friendsCount: u.friends ? u.friends.length : 0,
      });
    } else if (item.type === "group" && groupMap.has(idStr)) {
      const g = groupMap.get(idStr);
      paginatedCards.push({
        cardType: "group",
        _id: g._id,
        groupName: g.groupName,
        avatar: g.avatar,
        membersCount: g.members ? g.members.length : 0,
      });
    }
  }

  const hasMore = skip + paginatedCards.length < totalCount;

  return {
    cards: paginatedCards,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit) || 1,
      totalCount,
      hasMore,
    },
  };
};