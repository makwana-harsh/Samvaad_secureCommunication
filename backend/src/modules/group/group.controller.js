import { getGroupDetailsSchema, joinGroupSchema, leaveGroupSchema, inviteUserSchema, groupInvitationActionSchema} from "./group.validation.js";

import { getGroupDetailsService, joinGroupService, leaveGroupService, inviteUserService, acceptInvitationService, rejectInvitationService} from "./group.service.js";

const getUserId = (req) => req.user.id || req.user._id;

const handleError = (res, error, fallbackMessage) => {
    if (error.name === "ZodError" || error.issues) {
        return res.status(400).json({
            success: false,
            message: error.issues?.[0]?.message || "Invalid input",
        });
    }

    return res.status(400).json({
        success: false,
        message: error.message || fallbackMessage,
    });
};

export const getGroupDetails = async (req, res) => {
    try {
        const { groupId } = getGroupDetailsSchema.parse(req.params);
        const group = await getGroupDetailsService(groupId, getUserId(req));

        return res.status(200).json({
            success: true,
            data: group,
        });
    } 
    catch (error) {
        return handleError(res, error, "Failed to fetch group details");
    }
};

export const joinGroup = async (req, res) => {
    try {
        const { groupId } = joinGroupSchema.parse(req.params);
        const result = await joinGroupService(groupId, getUserId(req));

        return res.status(200).json({
            success: true,
            message: "Joined group successfully",
            data: result,
        });
    } 
    catch (error) {
        return handleError(res, error, "Failed to join group");
    }
};

export const leaveGroup = async (req, res) => {
    try {
        const { groupId } = leaveGroupSchema.parse(req.params);
        const result = await leaveGroupService(groupId, getUserId(req));

        return res.status(200).json({
            success: true,
            message: "Left group successfully",
            data: result,
        });
    } 
    catch (error) {
        return handleError(res, error, "Failed to leave group");
    }
};

export const inviteUser = async (req, res) => {
    try {
        const { groupId, userName } = inviteUserSchema.parse({
            ...req.params,
            ...req.body,
        });

        const result = await inviteUserService(groupId, getUserId(req), userName);

        return res.status(201).json({
            success: true,
            message: "Invitation sent successfully",
            data: result,
        });
    } 
    catch (error) {
        return handleError(res, error, "Failed to send invitation");
    }
};

export const acceptInvitation = async (req, res) => {
    try {
        const { groupId, requestId } = groupInvitationActionSchema.parse(req.params);

        const result = await acceptInvitationService(
            groupId,
            requestId,
            getUserId(req)
        );

        return res.status(200).json({
            success: true,
            message: "Invitation accepted",
            data: result,
        });
    } 
    catch (error) {
        return handleError(res, error, "Failed to accept invitation");
    }
};

export const rejectInvitation = async (req, res) => {
    try {
        const { groupId, requestId } = groupInvitationActionSchema.parse(req.params);

        const result = await rejectInvitationService(
            groupId,
            requestId,
            getUserId(req)
        );

        return res.status(200).json({
            success: true,
            message: "Invitation rejected",
            data: result,
        });
    } 
    catch (error) {
        return handleError(res, error, "Failed to reject invitation");
    }
};