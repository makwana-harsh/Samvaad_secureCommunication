import {
  sendRequestSchema,
  cancelRequestSchema,
  acceptRequestSchema,
  rejectRequestSchema,
} from "./request.validation.js";

import {
  sendFriendRequestService,
  cancelFriendRequestService,
  acceptFriendRequestService,
  rejectFriendRequestService,
} from "./request.service.js";

export const sendRequest = async (req, res) => {
  try {
    const { receiverId } = sendRequestSchema.parse(req.body);
    const senderId = req.user.id || req.user._id;

    const result = await sendFriendRequestService(senderId, receiverId);

    return res.status(201).json({
      success: true,
      message: "Friend request sent successfully",
      data: result,
    });
  } catch (error) {
    if (error.name === "ZodError" || error.issues) {
      return res.status(400).json({ message: error.issues?.[0]?.message || "Invalid input" });
    }
    return res.status(400).json({ message: error.message || "Failed to send request" });
  }
};

export const cancelRequest = async (req, res) => {
  try {
    const { requestId } = cancelRequestSchema.parse(req.body);
    const currentUserId = req.user.id || req.user._id;

    await cancelFriendRequestService(currentUserId, requestId);

    return res.status(200).json({
      success: true,
      message: "Friend request cancelled successfully",
    });
  } catch (error) {
    if (error.name === "ZodError" || error.issues) {
      return res.status(400).json({ message: error.issues?.[0]?.message || "Invalid input" });
    }
    return res.status(400).json({ message: error.message || "Failed to cancel request" });
  }
};

export const acceptRequest = async (req, res) => {
  try {
    const { requestId } = acceptRequestSchema.parse(req.body);
    const currentUserId = req.user.id || req.user._id;

    const result = await acceptFriendRequestService(currentUserId, requestId);

    return res.status(200).json({
      success: true,
      message: "Friend request accepted",
      data: result,
    });
  } catch (error) {
    if (error.name === "ZodError" || error.issues) {
      return res.status(400).json({ message: error.issues?.[0]?.message || "Invalid input" });
    }
    return res.status(400).json({ message: error.message || "Failed to accept request" });
  }
};

export const rejectRequest = async (req, res) => {
  try {
    const { requestId } = rejectRequestSchema.parse(req.body);
    const currentUserId = req.user.id || req.user._id;
    

    await rejectFriendRequestService(currentUserId, requestId);

    return res.status(200).json({
      success: true,
      message: "Friend request rejected successfully",
    });
  } catch (error) {
    if (error.name === "ZodError" || error.issues) {
      return res.status(400).json({ message: error.issues?.[0]?.message || "Invalid input" });
    }
    return res.status(400).json({ message: error.message || "Failed to reject request" });
  }
};