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