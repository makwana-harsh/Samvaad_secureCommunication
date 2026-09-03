import { z } from "zod";

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .min(3, "Full name must be at least 3 characters")
    .max(50, "Full name cannot exceed 50 characters")
    .trim(),

  mobileNo: z
    .string()
    .min(10, "Mobile number must be at least 10 digits")
    .max(15, "Mobile number cannot exceed 15 digits")
    .trim(),

  bio: z
    .string()
    .max(700, "Bio cannot exceed 250 characters")
    .trim()
    .optional()
    .nullable(),

  location: z
    .string()
    .max(100, "Location cannot exceed 100 characters")
    .trim()
    .optional()
    .nullable(),

  dob: z
    .string()
    .optional()
    .nullable(),
});