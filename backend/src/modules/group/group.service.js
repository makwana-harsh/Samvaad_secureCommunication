import mongoose from "mongoose";
import Group from "../../models/Group.model.js";
import Conversation from "../../models/Conversation.model.js";
import Message from "../../models/Message.model.js";
import Request from "../../models/Request.model.js";
import User from "../../models/User.model.js";
import { uploadGroupAvatar } from "../../utils/cloudinary.js";
import { emitToUser } from "../../sockets/socket.manager.js";

const createSystemMessage = async (conversationId, content, session) => {
    const [message] = await Message.create(
        [{
            conversationId,
            senderId: null,
            messageType: "system",
            content,
            expiresAt: null,
        }],
        { session }
    );

    await Conversation.findByIdAndUpdate(
        conversationId,
        {
            lastMessage: content,
            lastMessageSenderId: null,
            lastMessageAt: message.createdAt,
        },
        { session }
    );

    return message;
};

const emitGroupMessage = (members, message) => {
    const socketData = {
        message,
        conversationUpdate: {
            conversationId: message.conversationId,
            lastMessage: message.content,
            lastMessageAt: message.createdAt,
            senderId: null,
            senderUserName: null,
        },
    };

    members.forEach((memberId) => {
        emitToUser(memberId.toString(), "message:new", socketData);
    });
};

export const getGroupDetailsService = async (groupId, currentUserId) => {
    const group = await Group.findById(groupId)
        .populate("adminId", "_id userName fullName avatar")
        .populate("members", "_id userName avatar")
        .lean();

    if (!group) throw new Error("Group not found");

    const currentUserIdStr = currentUserId.toString();

    const isMember = group.members.some(
        (member) => member._id.toString() === currentUserIdStr
    );

    if (group.visibility === "private" && !isMember) {
        throw new Error("You do not have access to this private group");
    }

    return {
        _id: group._id,
        groupName: group.groupName,
        bio: group.bio,
        avatar: group.avatar,
        visibility: group.visibility,
        admin: group.adminId,
        members: group.members,
        conversationId: group.conversationId,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
        isMember,
        isAdmin: group.adminId._id.toString() === currentUserIdStr,
    };
};

export const joinGroupService = async (groupId, currentUserId) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const group = await Group.findById(groupId).session(session);

        if (!group) throw new Error("Group not found");

        if (group.visibility !== "public") {
            throw new Error("Private groups cannot be joined directly");
        }

        const currentUserIdStr = currentUserId.toString();

        const alreadyMember = group.members.some(
            (id) => id.toString() === currentUserIdStr
        );

        if (alreadyMember) {
            throw new Error("You are already a member of this group");
        }

        const user = await User.findById(currentUserId)
            .select("_id userName fullName avatar")
            .session(session);

        if (!user) throw new Error("User not found");

        group.members.push(currentUserId);
        await group.save({ session });

        await Conversation.findByIdAndUpdate(
            group.conversationId,
            { $addToSet: { participants: currentUserId } },
            { session }
        );

        await User.findByIdAndUpdate(
            currentUserId,
            { $addToSet: { joinedGroups: group._id } },
            { session }
        );

        const message = await createSystemMessage(
            group.conversationId,
            `${user.userName} has joined the group`,
            session
        );

        await session.commitTransaction();

        emitGroupMessage(group.members, message);

        return {
            groupId: group._id,
            conversationId: group.conversationId,
            message,
        };
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        await session.endSession();
    }
};

export const leaveGroupService = async (groupId, currentUserId) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const group = await Group.findById(groupId).session(session);

        if (!group) throw new Error("Group not found");

        const currentUserIdStr = currentUserId.toString();

        const isMember = group.members.some(
            (id) => id.toString() === currentUserIdStr
        );

        if (!isMember) {
            throw new Error("You are not a member of this group");
        }

        const user = await User.findById(currentUserId)
            .select("_id userName")
            .session(session);

        if (!user) throw new Error("User not found");

        const isAdmin = group.adminId.toString() === currentUserIdStr;

        if (isAdmin && group.members.length > 1) {
            throw new Error("Admin cannot leave while other members are in the group");
        }

        if (isAdmin && group.members.length === 1) {
            await Message.deleteMany(
                { conversationId: group.conversationId },
                { session }
            );

            await Request.deleteMany(
                { groupId: group._id, type: "group" },
                { session }
            );

            await Conversation.findByIdAndDelete(
                group.conversationId,
                { session }
            );

            await Group.findByIdAndDelete(
                group._id,
                { session }
            );

            await User.findByIdAndUpdate(
                currentUserId,
                { $pull: { joinedGroups: group._id } },
                { session }
            );

            await session.commitTransaction();

            return {
                deleted: true,
                groupId: group._id,
            };
        }

        group.members = group.members.filter(
            (id) => id.toString() !== currentUserIdStr
        );

        await group.save({ session });

        await Conversation.findByIdAndUpdate(
            group.conversationId,
            { $pull: { participants: currentUserId } },
            { session }
        );

        await User.findByIdAndUpdate(
            currentUserId,
            { $pull: { joinedGroups: group._id } },
            { session }
        );

        const message = await createSystemMessage(
            group.conversationId,
            `${user.userName} has left the group`,
            session
        );

        await session.commitTransaction();

        emitGroupMessage(group.members, message);

        return {
            deleted: false,
            groupId: group._id,
            conversationId: group.conversationId,
            message,
        };
    } 
    catch (error) {
        await session.abortTransaction();
        throw error;
    } 
    finally {
        await session.endSession();
    }
};

export const inviteUserService = async (groupId, currentUserId, userName) => {
    const group = await Group.findById(groupId).lean();

    if (!group) throw new Error("Group not found");

    if (group.adminId.toString() !== currentUserId.toString()) {
        throw new Error("Only the group admin can invite users");
    }

    const targetUser = await User.findOne({ userName })
        .select("_id userName fullName avatar")
        .lean();

    if (!targetUser) throw new Error("User not found");

    if (targetUser._id.toString() === currentUserId.toString()) {
        throw new Error("You cannot invite yourself");
    }

    const isMember = group.members.some(
        (id) => id.toString() === targetUser._id.toString()
    );

    if (isMember) {
        throw new Error("User is already a member of this group");
    }

    const existingRequest = await Request.findOne({
        type: "group",
        senderId: currentUserId,
        receiverId: targetUser._id,
        groupId,
        status: "pending",
    });

    if (existingRequest) {
        throw new Error("Invitation already sent");
    }

    const request = await Request.create({
        type: "group",
        senderId: currentUserId,
        receiverId: targetUser._id,
        groupId,
        status: "pending",
    });

    const [admin, members] = await Promise.all([
        User.findById(group.adminId)
            .select("_id userName avatar")
            .lean(),

        User.find({ _id: { $in: group.members } })
            .select("_id userName avatar")
            .lean(),
    ]);

    emitToUser(targetUser._id, "group:invitation_received", {
        requestId: request._id,
        type: "group",
        sender: admin,
        group: {
            _id: group._id,
            groupName: group.groupName,
            bio: group.bio,
            avatar: group.avatar,
            visibility: group.visibility,
            adminId: admin,
            members,
        },
    });

    return {
        requestId: request._id,
        receiver: targetUser,
    };
};


export const createGroupService = async ({
    currentUserId,
    groupName,
    bio,
    visibility,
    memberIds,
    avatarFile,
}) => {
    const creatorId = new mongoose.Types.ObjectId(currentUserId);
    const uniqueMemberIds = [...new Set(memberIds)];

    if (uniqueMemberIds.length < 2) {
        throw new Error("Select at least two users");
    }

    if (uniqueMemberIds.includes(currentUserId.toString())) {
        throw new Error("You cannot invite yourself");
    }

    const users = await User.find({
        _id: { $in: uniqueMemberIds },
    }).select("_id userName").lean();

    if (users.length !== uniqueMemberIds.length) {
        throw new Error("One or more selected users do not exist");
    }

    const groupId = new mongoose.Types.ObjectId();
    const conversationId = new mongoose.Types.ObjectId();
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        await Group.create([{
            _id: groupId,
            groupName,
            bio: bio || null,
            avatar: null,
            visibility,
            adminId: creatorId,
            members: [creatorId],
            conversationId,
        }], { session });

        await Conversation.create([{
            _id: conversationId,
            type: "group",
            participants: [creatorId],
            groupId,
        }], { session });

        await User.findByIdAndUpdate(
            creatorId,
            { $addToSet: { joinedGroups: groupId } },
            { session }
        );

        await Request.insertMany(
            uniqueMemberIds.map((receiverId) => ({
                type: "group",
                senderId: creatorId,
                receiverId,
                groupId,
                status: "pending",
            })),
            { session }
        );

        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        await session.endSession();
    }

    let avatar = null;

    if (avatarFile) {
        const uploadResult = await uploadGroupAvatar(
            avatarFile.buffer,
            groupId
        );

        avatar = uploadResult.secure_url;

        await Group.findByIdAndUpdate(groupId, { avatar });
    }

    const [creator, requests] = await Promise.all([
        User.findById(creatorId)
            .select("_id userName avatar")
            .lean(),

        Request.find({
            type: "group",
            groupId,
            status: "pending",
        }).lean(),
    ]);

    const groupData = {
        _id: groupId,
        groupName,
        bio: bio || null,
        avatar,
        visibility,
        adminId: creator,
        members: [creator],
    };

    requests.forEach((request) => {
        emitToUser(request.receiverId, "group:invitation_received", {
            requestId: request._id,
            type: "group",
            sender: creator,
            group: groupData,
        });
    });

    const card = {
        cardId: `group-${groupId}`,
        conversationId,
        type: "group",
        groupId,
        groupName,
        avatar,
        lastMessage: null,
        lastMessageAt: null,
        senderUserName: null,
    };

    emitToUser(creatorId, "group:created", card);

    return {
        groupId,
        conversationId,
        card,
    };
};

export const updateGroupService = async (groupId, currentUserId, bio, avatarFile) => {
    const group = await Group.findById(groupId);

    if (!group) throw new Error("Group not found");

    if (group.adminId.toString() !== currentUserId.toString()) {
        throw new Error("Only admin can update the group");
    }

    if (bio !== undefined) group.bio = bio || null;

    if (avatarFile) {
        const result = await uploadGroupAvatar(avatarFile.buffer, groupId);
        group.avatar = result.secure_url;
    }

    await group.save();

    const data = {
        groupId: group._id,
        bio: group.bio,
        avatar: group.avatar,
    };

    group.members.forEach((memberId) => {
        emitToUser(memberId, "group:updated", data);
    });

    return data;
};

export const removeGroupMemberService = async (groupId, currentUserId, userId) => {
    const group = await Group.findById(groupId);

    if (!group) throw new Error("Group not found");

    if (group.adminId.toString() !== currentUserId.toString()) {
        throw new Error("Only admin can remove members");
    }

    if (userId.toString() === currentUserId.toString()) {
        throw new Error("Admin cannot remove themselves");
    }

    const isMember = group.members.some(
        (id) => id.toString() === userId.toString()
    );

    if (!isMember) throw new Error("User is not a group member");

    group.members = group.members.filter(
        (id) => id.toString() !== userId.toString()
    );

    await group.save();

    await Promise.all([
        Conversation.findByIdAndUpdate(group.conversationId, {
            $pull: { participants: userId },
        }),
        User.findByIdAndUpdate(userId, {
            $pull: { joinedGroups: group._id },
        }),
    ]);

    const data = {
        groupId: group._id,
        userId,
    };

    group.members.forEach((memberId) => {
        emitToUser(memberId, "group:member_removed", data);
    });

    emitToUser(userId, "group:removed", data);

    return data;
};

export const acceptInvitationService = async (groupId, requestId, currentUserId) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const request = await Request.findOne({
            _id: requestId,
            groupId,
            receiverId: currentUserId,
            type: "group",
            status: "pending",
        }).session(session);

        if (!request) throw new Error("Pending group invitation not found");

        const group = await Group.findById(groupId).session(session);
        if (!group) throw new Error("Group not found");

        const user = await User.findById(currentUserId)
            .select("_id userName fullName avatar")
            .session(session);

        if (!user) throw new Error("User not found");

        await Group.findByIdAndUpdate(
            groupId,
            { $addToSet: { members: currentUserId } },
            { session }
        );

        await Conversation.findByIdAndUpdate(
            group.conversationId,
            { $addToSet: { participants: currentUserId } },
            { session }
        );

        await User.findByIdAndUpdate(
            currentUserId,
            { $addToSet: { joinedGroups: group._id } },
            { session }
        );

        await Request.findByIdAndDelete(requestId, { session });

        const message = await createSystemMessage(
            group.conversationId,
            `${user.userName} has joined the group`,
            session
        );

        await session.commitTransaction();

        const updatedGroup = await Group.findById(groupId)
            .select("members")
            .lean();

        emitGroupMessage(updatedGroup.members, message);

        updatedGroup.members.forEach((memberId) => {
            emitToUser(memberId, "group:member_joined", {
                groupId: group._id,
                member: {
                    _id: user._id,
                    userName: user.userName,
                    fullName: user.fullName,
                    avatar: user.avatar,
                },
            });
        });

        emitToUser(currentUserId, "group:invitation_accept_success", {
            requestId,
            groupId: group._id,
        });

        return {
            groupId: group._id,
            conversationId: group.conversationId,
        };
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        await session.endSession();
    }
};

export const rejectInvitationService = async (groupId, requestId, currentUserId) => {
    const request = await Request.findOne({
        _id: requestId,
        groupId,
        receiverId: currentUserId,
        type: "group",
        status: "pending",
    });

    if (!request) throw new Error("Pending group invitation not found");

    const senderId = request.senderId;

    await Request.findByIdAndDelete(requestId);

    emitToUser(currentUserId, "group:invitation_reject_success", {
        requestId,
        groupId,
    });

    emitToUser(senderId, "group:invitation_rejected", {
        requestId,
        groupId,
        userId: currentUserId,
    });

    return { requestId, groupId };
};