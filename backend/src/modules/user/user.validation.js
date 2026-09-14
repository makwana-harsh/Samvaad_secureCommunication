import { z } from "zod";

export const getProfileSchema = z.object({
    userId: z.string().min(1, "User ID is required"),
});

export const unfriendSchema = z.object({
    targetUserId: z.string().min(1, "Target User ID is required"),
});