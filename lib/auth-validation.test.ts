import { describe, expect, it } from "vitest";
import { signupSchema } from "./auth-validation";

describe("registration input", () => {
  const valid = {
    name: "Mpho Entrepreneur",
    email: "mpho@example.co.bw",
    password: "A-secure-password-2026!",
    dataProtectionConsent: true,
  };

  it("accepts a complete registration with privacy consent", () => {
    expect(signupSchema.safeParse(valid).success).toBe(true);
  });

  it("requires consent before account creation", () => {
    expect(signupSchema.safeParse({ ...valid, dataProtectionConsent: false }).success).toBe(false);
  });

  it("rejects short passwords and invalid email addresses", () => {
    expect(signupSchema.safeParse({ ...valid, password: "short" }).success).toBe(false);
    expect(signupSchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false);
  });
});
