import { z } from "zod";

export const discoverQuerySchema = z.object({
    search: z.string().optional().default(""),
    page: z.string().optional().transform((val) => Math.max(1, parseInt(val || "1", 10))),
    limit: z.string().optional().transform((val) => Math.min(50, Math.max(1, parseInt(val || "10", 10)))),
});