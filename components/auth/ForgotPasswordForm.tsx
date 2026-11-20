"use client";

import { FormEvent, useState } from "react";
import { PasswordInput } from "@/components/auth/PasswordInput";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function requestCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const response = await fetch("/api/auth/email-otp/request-password-reset", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }) }).catch(() => null);
    setPending(false);
    setSent(true);
    setMessage(response?.ok ? "If an account matches that email, a reset code has been sent." : "We could not send a reset code. Please try again shortly.");
  }

  async function resetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const data = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/email-otp/reset-password", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, otp: data.get("otp"), password: data.get("password") }) }).catch(() => null);
    const result = await response?.json().catch(() => null);
    setPending(false);
    setMessage(response?.ok ? "Your password has been changed. You can sign in now." : result?.message ?? result?.error?.message ?? "That code could not be verified. Please check it and try again.");
  }

  return (
    <section className="auth-card">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-ceda-burgundy">Account recovery</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-ceda-ink">Reset your password</h1>
      <p className="mt-3 text-sm leading-6 text-ceda-muted">We’ll send a one-time code to your account email.</p>
      {message && <p className="auth-feedback" role="status" aria-live="polite">{message}</p>}
      <form className="mt-6 space-y-4" onSubmit={requestCode} aria-labelledby="recovery-heading">
        <h2 id="recovery-heading" className="sr-only">Request a password reset code</h2>
        <div className="auth-field"><label htmlFor="email">Email address</label><input id="email" name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
        <button className="auth-primary" type="submit" disabled={pending}>{pending ? "Sending…" : "Send reset code"}</button>
      </form>
      {sent && <form className="mt-6 space-y-4 border-t border-ceda-line pt-6" onSubmit={resetPassword} aria-labelledby="reset-heading">
        <h2 id="reset-heading" className="font-semibold text-ceda-ink">Choose a new password</h2>
        <div className="auth-field"><label htmlFor="otp">Six-digit reset code</label><input id="otp" name="otp" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" minLength={6} maxLength={6} required /></div>
        <div className="auth-field"><label htmlFor="password">New password</label><PasswordInput id="password" name="password" autoComplete="new-password" minLength={12} maxLength={128} required /></div>
        <button className="auth-primary" type="submit" disabled={pending}>{pending ? "Updating…" : "Change password"}</button>
      </form>}
    </section>
  );
}
