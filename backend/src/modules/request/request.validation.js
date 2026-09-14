import { z } from "zod";

export const sendRequestSchema = z.object({
    receiverId: z.string().min(1, "Receiver ID is required"),
});

export const cancelRequestSchema = z.object({
    requestId: z.string().min(1, "Request ID is required"),
});

export const acceptRequestSchema = z.object({
    requestId: z.string().min(1, "Request ID is required"),
});

export const rejectRequestSchema = z.object({
    requestId: z.string().min(1, "Request ID is required"),
});