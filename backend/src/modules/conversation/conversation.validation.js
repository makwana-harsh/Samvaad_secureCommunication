import { z } from "zod";

export const getConversationsSchema = z.object({
  tab: z.enum(["friends_and_groups", "temporary"], {
    required_error: "Tab query parameter is required",
  }),
  search: z.string().optional().default(""),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(15),
});