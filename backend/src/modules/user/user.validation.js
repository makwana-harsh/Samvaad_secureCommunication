import { z } from "zod";

export const getProfileSchema = z.object({
    userId: z.string().min(1, "User ID is required"),
});

export const unfriendSchema = z.object({
    targetUserId: z.string().min(1, "Target User ID is required"),
});

export const searchMinimalUsersSchema = z.object({
  search: z.string().trim().optional().default(""),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().positive()),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 8))
    .pipe(z.number().int().positive().max(50)),
});