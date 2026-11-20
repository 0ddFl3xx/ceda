import nodemailer from "nodemailer";

type AuthMailType = "sign-in" | "email-verification" | "forget-password" | "change-email";

export async function sendAuthCode(email: string, otp: string, type: AuthMailType) {
  const user = process.env.GMAIL_USER?.trim();
  // Google displays App Passwords in groups separated by spaces; SMTP expects
  // the same credential without the display formatting.
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "");

  if (!user || !pass) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Gmail SMTP credentials are required in production.");
    }
    console.info(`[dev email] ${type} code for ${email}: ${otp}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
  const subject =
    type === "forget-password"
      ? "Reset your CEDA Innovation Portal password"
      : type === "sign-in"
        ? "Your CEDA Innovation Portal sign-in code"
        : "Verify your CEDA Innovation Portal email";

  await transporter.sendMail({
    from: `CEDA Innovation Portal <${user}>`,
    to: email,
    subject,
    text: `Your verification code is ${otp}. It expires in five minutes. If you did not request this, you can ignore this email.`,
  });
}
