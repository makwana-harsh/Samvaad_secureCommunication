import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().min(3, "Full name is required").trim(),
  userName: z.string().min(3, "Username must be at least 3 characters").max(30).trim(),
  emailId: z.string().email("Invalid email address").lowercase().trim(),
  mobileNo: z.string().min(10, "Mobile number must be at least 10 digits").trim(),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export const loginSchema = z.object({
  userName: z.string().min(1, "Username is required").trim(),
  userPassword: z.string().min(1, "Password is required")
});