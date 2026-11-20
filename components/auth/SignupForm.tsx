"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";

type Feedback = { kind: "error" | "success"; text: string } | null;

export function SignupForm() {
  const router = useRouter();
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [pending, setPending] = useState(false);
  const [emailForVerification, setEmailForVerification] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [passkeyAvailable, setPasskeyAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    const credentialApi = window.PublicKeyCredential as typeof window.PublicKeyCredential & {
      getClientCapabilities?: () => Promise<Record<string, boolean>>;
    };
    const capabilityCheck: Promise<Record<string, boolean>> = window.isSecureContext && credentialApi?.getClientCapabilities
      ? credentialApi.getClientCapabilities()
      : Promise.resolve({});
    void capabilityCheck.then((capabilities) => {
      setPasskeyAvailable(Boolean(capabilities["passkeyPlatformAuthenticator"] && capabilities["conditionalGet"]));
    }).catch(() => setPasskeyAvailable(false));
  }, []);

  async function createPasskey() {
    setPending(true);
    setFeedback(null);
    try {
      const result = await authClient.passkey.addPasskey({ name: "CEDA Innovation Portal", createSession: true });
      setPending(false);
      if (result.error) {
        setFeedback({ kind: "error", text: result.error.message ?? "We could not set up your passkey. You can still continue with your password." });
        return;
      }
    } catch (error) {
      setPending(false);
      setFeedback({ kind: "error", text: error instanceof Error ? error.message : "Passkey setup was not completed. You can still continue with your password." });
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setFeedback(null);
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim().toLowerCase();
    const response = await fetch("/api/auth/sign-up/email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: data.get("name"),
        email,
        password: data.get("password"),
        dataProtectionConsent: data.get("consent") === "on",
      }),
    }).catch(() => null);
    const result = await response?.json().catch(() => null);
    setPending(false);
    if (!response?.ok) {
      if (response?.status === 422) {
        setEmailForVerification(email);
        setFeedback({ kind: "success", text: "An account already exists for this email. Enter its verification code, or request a new code below." });
        return;
      }
      setFeedback({ kind: "error", text: result?.message ?? result?.error?.message ?? "We could not create your account. Check the details and try again." });
      return;
    }
    setEmailForVerification(email);
    setFeedback({ kind: "success", text: "Enter the six-digit code sent to your email to continue." });
  }

  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setFeedback(null);
    const data = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/email-otp/verify-email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: emailForVerification, otp: data.get("otp") }),
    }).catch(() => null);
    const result = await response?.json().catch(() => null);
    setPending(false);
    if (!response?.ok) {
      setFeedback({ kind: "error", text: result?.message ?? result?.error?.message ?? "That code could not be verified. Check it and try again." });
      return;
    }
    setEmailVerified(true);
    setFeedback({ kind: "success", text: "Email verified. Set up a passkey for faster sign-in, or continue to your account." });
  }

  return (
    <section className="auth-card">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-ceda-burgundy">Submitter account</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-ceda-ink">Create your account</h1>
      <p className="mt-3 text-sm leading-6 text-ceda-muted">Use an email address you can access. We’ll send a one-time code to verify it.</p>
      {feedback && <p className={`auth-feedback ${feedback.kind}`} role="status" aria-live="polite">{feedback.text}</p>}

      {emailVerified ? (
        <div className="mt-6 space-y-4">
          <button className="auth-primary" type="button" onClick={createPasskey} disabled={pending || passkeyAvailable !== true}>{pending ? "Setting up passkey..." : passkeyAvailable === null ? "Checking passkey support..." : "Set up a passkey"}</button>
          <p className="text-sm leading-6 text-ceda-muted">A passkey lets you sign in with your device&apos;s fingerprint, face recognition or screen lock. You can add one later after signing in.</p>
          {passkeyAvailable === false && <p className="text-sm leading-6 text-ceda-muted" role="status">This browser or device cannot create a passkey here. Continue with your password instead.</p>}
          <button className="auth-secondary w-full" type="button" onClick={() => { router.push("/dashboard"); router.refresh(); }}>Continue without a passkey</button>
        </div>
      ) : emailForVerification ? (
        <form className="mt-6 space-y-4" onSubmit={verify} aria-labelledby="verify-heading">
          <h2 id="verify-heading" className="font-semibold text-ceda-ink">Verify {emailForVerification}</h2>
          <div className="auth-field">
            <label htmlFor="otp">Six-digit email code</label>
            <input id="otp" name="otp" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" minLength={6} maxLength={6} required aria-describedby="otp-help" />
            <span id="otp-help">The code expires after five minutes.</span>
          </div>
          <button className="auth-primary" type="submit" disabled={pending}>{pending ? "Verifying…" : "Verify email"}</button>
          <p className="text-sm text-ceda-muted">If you already verified this account, <Link className="font-semibold text-ceda-burgundy underline underline-offset-4" href="/login">sign in</Link>.</p>
          <button className="auth-secondary" type="button" onClick={async () => {
            setPending(true);
            const response = await fetch("/api/auth/email-otp/send-verification-otp", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: emailForVerification, type: "email-verification" }) }).catch(() => null);
            setPending(false);
            setFeedback(response?.ok ? { kind: "success", text: "A new code has been sent." } : { kind: "error", text: "We could not resend the code. Please try again shortly." });
          }} disabled={pending}>Resend code</button>
        </form>
      ) : !emailForVerification ? (
        <form id="signup-details" className="mt-6 space-y-4" onSubmit={submit} aria-labelledby="signup-heading">
          <h2 id="signup-heading" className="sr-only">Registration details</h2>
          <div className="auth-field">
            <label htmlFor="name">Full name</label>
            <input id="name" name="name" autoComplete="name" minLength={2} maxLength={120} required />
          </div>
          <div className="auth-field">
            <label htmlFor="email">Email address</label>
            <input id="email" name="email" type="email" autoComplete="username" maxLength={255} required />
          </div>
          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} aria-describedby="password-help" required />
            <span id="password-help">Use at least 12 characters.</span>
          </div>
          <label className="auth-consent">
            <input id="signup-consent" type="checkbox" name="consent" required />
            <span>I have read the <Link href="/privacy">privacy notice</Link> and consent to the processing of my information under Botswana’s Data Protection Act 2024.</span>
          </label>
          <button className="auth-primary" type="submit" disabled={pending}>{pending ? "Creating account…" : "Create account"}</button>
        </form>
      ) : null}

      {!emailForVerification && <>
        <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wider text-ceda-muted"><span className="h-px flex-1 bg-ceda-line" />or<span className="h-px flex-1 bg-ceda-line" /></div>
        <SocialAuthButtons />
      </>}

      <p className="mt-6 text-sm text-ceda-muted">Already registered? <Link className="font-semibold text-ceda-burgundy underline underline-offset-4" href="/login">Sign in</Link></p>
    </section>
  );
}
