import Request from "../../models/Request.model.js";
import User from "../../models/User.model.js";
import { emitToUser } from "../../sockets/socket.manager.js";

const getFriendProfile = (user) => ({
    _id: user._id.toString(),
    userName: user.userName,
    fullName: user.fullName,
    avatar: user.avatar,
    bio: user.bio,
    emailId: user.emailId,
    mobileNo: user.mobileNo,
    location: user.location,
    dob: user.dob,
    friends: user.friends || [],
    friendsCount: (user.friends || []).length,
    privateGroups: user.privateGroups || [],
    publicGroups: user.publicGroups || [],
});

const getUserWithFriends = (userId) =>
    User.findById(userId)
        .select(
            "fullName userName avatar bio emailId mobileNo location friends dob privateGroups publicGroups"
        )
        .populate("friends", "_id userName fullName avatar")
        .lean();

export const sendFriendRequestService = async (senderId, receiverId) => {
    const senderIdStr = senderId.toString();
    const receiverIdStr = receiverId.toString();

    if (senderIdStr === receiverIdStr) {
        throw new Error("You cannot send a friend request to yourself");
    }

    const senderUser = await User.findById(senderId)
        .select("friends fullName userName avatar")
        .lean();

    const receiverUser = await User.findById(receiverId)
        .select("friends")
        .lean();

    if (!senderUser) throw new Error("Sender user not found");
    if (!receiverUser) throw new Error("Target user not found");

    const isAlreadyFriend = (senderUser.friends || [])
        .map((id) => id.toString())
        .includes(receiverIdStr);

    if (isAlreadyFriend) {
        throw new Error("You are already friends with this user");
    }

    const existingRequest = await Request.findOne({
        type: "friend",
        status: "pending",
        $or: [
            { senderId, receiverId },
            { senderId: receiverId, receiverId: senderId },
        ],
    });

    if (existingRequest) {
        if (existingRequest.senderId.toString() === senderIdStr) {
            throw new Error("Friend request already sent");
        }

        return await acceptFriendRequestService(
            senderId,
            existingRequest._id
        );
    }

    const newRequest = await Request.create({
        type: "friend",
        senderId,
        receiverId,
        status: "pending",
    });

    emitToUser(receiverIdStr, "request:received", {
        requestId: newRequest._id.toString(),
        sender: {
            _id: senderUser._id.toString(),
            fullName: senderUser.fullName,
            userName: senderUser.userName,
            avatar: senderUser.avatar,
        },
    });

    emitToUser(senderIdStr, "request:sent_success", {
        requestId: newRequest._id.toString(),
        receiverId: receiverIdStr,
    });

    return newRequest;
};

export const cancelFriendRequestService = async (
    currentUserId,
    requestId
) => {
    const request = await Request.findOne({
        _id: requestId,
        senderId: currentUserId,
        type: "friend",
        status: "pending",
    });

    if (!request) {
        throw new Error("Pending outgoing friend request not found");
    }

    const receiverIdStr = request.receiverId.toString();
    const senderIdStr = currentUserId.toString();

    await Request.findByIdAndDelete(requestId);

    emitToUser(receiverIdStr, "request:cancelled", {
        requestId: requestId.toString(),
        senderId: senderIdStr,
    });

    emitToUser(senderIdStr, "request:cancel_success", {
        requestId: requestId.toString(),
        receiverId: receiverIdStr,
    });

    return { success: true };
};

export const acceptFriendRequestService = async (
    currentUserId,
    requestId
) => {
    const request = await Request.findOne({
        _id: requestId,
        receiverId: currentUserId,
        type: "friend",
        status: "pending",
    });

    if (!request) {
        throw new Error("Pending friend request not found");
    }

    const senderId = request.senderId;
    const senderIdStr = senderId.toString();
    const receiverIdStr = currentUserId.toString();

    await Promise.all([
        User.findByIdAndUpdate(
            currentUserId,
            { $addToSet: { friends: senderId } }
        ),
        User.findByIdAndUpdate(
            senderId,
            { $addToSet: { friends: currentUserId } }
        ),
    ]);

    await Request.findByIdAndDelete(requestId);

    const [senderUser, receiverUser] = await Promise.all([
        getUserWithFriends(senderId),
        getUserWithFriends(currentUserId),
    ]);

    if (!senderUser || !receiverUser) {
        throw new Error("Unable to load updated friend profiles");
    }

    const acceptedBy = getFriendProfile(receiverUser);
    const newFriend = getFriendProfile(senderUser);

    emitToUser(senderIdStr, "request:accepted", {
        requestId: requestId.toString(),
        acceptedBy,
    });

    emitToUser(receiverIdStr, "request:accept_success", {
        requestId: requestId.toString(),
        newFriend,
    });

    return {
        success: true,
        requestId: requestId.toString(),
        friendProfile: newFriend,
    };
};

export const rejectFriendRequestService = async (
    currentUserId,
    requestId
) => {
    const request = await Request.findOne({
        _id: requestId,
        receiverId: currentUserId,
        type: "friend",
        status: "pending",
    });

    if (!request) {
        throw new Error("Pending friend request not found");
    }

    const senderIdStr = request.senderId.toString();
    const receiverIdStr = currentUserId.toString();

    await Request.findByIdAndDelete(requestId);

    emitToUser(senderIdStr, "request:rejected", {
        requestId: requestId.toString(),
        rejectedBy: receiverIdStr,
    });

    emitToUser(receiverIdStr, "request:reject_success", {
        requestId: requestId.toString(),
        senderId: senderIdStr,
    });

    return {
        success: true,
        requestId: requestId.toString(),
    };
};