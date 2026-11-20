"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim().toLowerCase();
    const result = await authClient.signIn.email({
      email,
      password: String(data.get("password")),
      callbackURL: "/dashboard",
    });
    setPending(false);
    if (result.error) {
      const errorCode = (result.error as { code?: string }).code;
      if (errorCode === "EMAIL_NOT_VERIFIED" || result.error.message?.toLowerCase() === "email not verified") {
        setUnverifiedEmail(email);
        setError("Your email needs verification. We sent a new six-digit code; enter it below.");
        return;
      }
      if (errorCode === "INVALID_EMAIL_OR_PASSWORD") {
        setError("The email and password did not match. If you used this email in an earlier signup attempt, use Forgot password to set a new password; trying signup again does not change an existing password.");
        return;
      }
      setError(result.error.message ?? "Sign in failed. Check your details and try again.");
      return;
    }
    const next = params.get("next");
    router.push(next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard");
    router.refresh();
  }

  async function signInWithPasskey() {
    setPending(true);
    setError("");
    const result = await authClient.signIn.passkey({ autoFill: false });
    setPending(false);
    if (result.error) {
      setError(result.error.message ?? "Passkey sign-in was not completed.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  async function verifyEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const data = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/email-otp/verify-email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: unverifiedEmail, otp: data.get("otp") }),
    }).catch(() => null);
    const result = await response?.json().catch(() => null);
    setPending(false);
    if (!response?.ok) {
      setError(result?.message ?? result?.error?.message ?? "That code could not be verified. Request a fresh one and try again.");
      return;
    }
    router.push(params.get("next")?.startsWith("/") && !params.get("next")?.startsWith("//") ? params.get("next")! : "/dashboard");
    router.refresh();
  }

  async function resendVerificationCode() {
    setPending(true);
    setError("");
    const response = await fetch("/api/auth/email-otp/send-verification-otp", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: unverifiedEmail, type: "email-verification" }),
    }).catch(() => null);
    setPending(false);
    setError(response?.ok ? "A fresh verification code has been sent." : "We could not resend the code. Please try again shortly.");
  }

  return (
    <section className="auth-card">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-ceda-burgundy">CEDA Innovation Portal</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-ceda-ink">Sign in</h1>
      <p className="mt-3 text-sm leading-6 text-ceda-muted">Access your ideas, feedback and notifications.</p>
      {error && <p className="auth-feedback error" role="alert">{error}</p>}
      <form className="mt-6 space-y-4" onSubmit={submit} aria-labelledby="login-heading">
        <h2 id="login-heading" className="sr-only">Sign-in details</h2>
        <div className="auth-field"><label htmlFor="email">Email address</label><input id="email" name="email" type="email" autoComplete="username" required /></div>
        <div className="auth-field"><label htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="current-password" required /></div>
        <div className="text-right"><Link className="text-sm font-semibold text-ceda-burgundy underline underline-offset-4" href="/forgot-password">Forgot password?</Link></div>
        <button className="auth-primary" type="submit" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
      </form>
      {unverifiedEmail && <form className="mt-6 space-y-4 rounded-xl border border-ceda-line bg-[#FFF9F4] p-4" onSubmit={verifyEmail} aria-labelledby="login-verify-heading">
        <h2 id="login-verify-heading" className="font-semibold text-ceda-ink">Verify {unverifiedEmail}</h2>
        <div className="auth-field"><label htmlFor="login-otp">Six-digit email code</label><input id="login-otp" name="otp" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" minLength={6} maxLength={6} required /></div>
        <button className="auth-primary" type="submit" disabled={pending}>{pending ? "Verifying…" : "Verify and sign in"}</button>
        <button className="auth-secondary w-full" type="button" onClick={resendVerificationCode} disabled={pending}>Resend code</button>
      </form>}
      <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wider text-ceda-muted"><span className="h-px flex-1 bg-ceda-line" />or<span className="h-px flex-1 bg-ceda-line" /></div>
      <SocialAuthButtons />
      <button className="auth-secondary w-full" type="button" onClick={signInWithPasskey} disabled={pending}>{pending ? "Waiting for passkey…" : "Sign in with a passkey"}</button>
      <p className="mt-6 text-sm text-ceda-muted">New to the portal? <Link className="font-semibold text-ceda-burgundy underline underline-offset-4" href="/signup">Create an account</Link></p>
    </section>
  );
}
