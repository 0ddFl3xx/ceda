import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().max(255),
  password: z.string().min(12).max(128),
  dataProtectionConsent: z.literal(true),
});
