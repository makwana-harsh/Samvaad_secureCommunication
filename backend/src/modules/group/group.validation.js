import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

export const getGroupDetailsSchema = z.object({
    groupId: objectId,
});

export const joinGroupSchema = z.object({
    groupId: objectId,
});

export const leaveGroupSchema = z.object({
    groupId: objectId,
});

export const inviteUserSchema = z.object({
    groupId: objectId,
    userName: z.string().trim().min(1, "Username is required"),
});

export const groupInvitationActionSchema = z.object({
    groupId: objectId,
    requestId: objectId,
});
export const createGroupSchema = z.object({
    groupName: z.string().trim().min(1, "Group name is required").max(100),
    bio: z.string().trim().max(500).optional().default(""),
    visibility: z.enum(["public", "private"]),
    memberIds: z.array(objectId).min(2, "Select at least two users"),
});

export const updateGroupSchema = z.object({
    groupId: objectId,
    bio: z.string().trim().max(500).optional(),
});

export const removeGroupMemberSchema = z.object({
    groupId: objectId,
    userId: objectId,
});