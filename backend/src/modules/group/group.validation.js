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
    groupName: z.string().trim().min(1, "Group name is required"),

    bio: z
        .string()
        .trim()
        .optional()
        .nullable(),

    avatar: z
        .string()
        .optional()
        .nullable(),

    visibility: z.enum(["public", "private"]),

    memberIds: z.preprocess(
        (value) => {
            if (typeof value === "string") {
                try {
                    return JSON.parse(value);
                } catch {
                    return value;
                }
            }

            return value;
        },
        z.array(objectId).min(2, "Select at least 2 members")
    ),
});