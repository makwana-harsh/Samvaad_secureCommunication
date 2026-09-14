import mongoose from "mongoose";
import Group from "../../models/Group.model.js";
import Conversation from "../../models/Conversation.model.js";
import Message from "../../models/Message.model.js";
import Request from "../../models/Request.model.js";
import User from "../../models/User.model.js";
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
    members.forEach((memberId) => {
        emitToUser(memberId.toString(), "group:message_new", message);
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

    if (group.visibility !== "private") {
        throw new Error("Invitations are only required for private groups");
    }

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

    emitToUser(targetUser._id, "group:invitation_received", {
        requestId: request._id,
        groupId: group._id,
        groupName: group.groupName,
        groupAvatar: group.avatar,
        visibility: group.visibility,
        senderId: currentUserId,
    });

    return {
        requestId: request._id,
        receiver: targetUser,
    };
};

export const acceptInvitationService = async (
    groupId,
    requestId,
    currentUserId
) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const request = await Request.findOne({
            _id: requestId,
            type: "group",
            groupId,
            receiverId: currentUserId,
            status: "pending",
        }).session(session);

        if (!request) {
            throw new Error("Invitation not found or already processed");
        }

        const group = await Group.findById(groupId).session(session);

        if (!group) throw new Error("Group not found");

        if (group.visibility !== "private") {
            throw new Error("This group does not require an invitation");
        }

        const alreadyMember = group.members.some(
            (id) => id.toString() === currentUserId.toString()
        );

        if (alreadyMember) {
            await Request.deleteOne({ _id: requestId }).session(session);

            await session.commitTransaction();

            return {
                groupId: group._id,
                conversationId: group.conversationId,
            };
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

        await Request.deleteOne(
            { _id: requestId },
            { session }
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

export const rejectInvitationService = async (
    groupId,
    requestId,
    currentUserId
) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const request = await Request.findOne({
            _id: requestId,
            type: "group",
            groupId,
            receiverId: currentUserId,
            status: "pending",
        }).session(session);

        if (!request) {
            throw new Error("Invitation not found or already processed");
        }

        const group = await Group.findById(groupId).session(session);

        if (!group) throw new Error("Group not found");

        const user = await User.findById(currentUserId)
            .select("_id userName")
            .session(session);

        if (!user) throw new Error("User not found");

        const message = await createSystemMessage(
            group.conversationId,
            `${user.userName} has declined the group invitation`,
            session
        );

        await Request.deleteOne(
            { _id: requestId },
            { session }
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