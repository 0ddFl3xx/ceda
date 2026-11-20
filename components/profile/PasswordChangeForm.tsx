"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { PasswordInput } from "@/components/auth/PasswordInput";

const fieldClass = "mt-2 block min-h-12 w-full rounded-xl border border-[#9A8175] bg-white px-3.5 py-3 text-base text-ceda-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ceda-burgundy";

export function PasswordChangeForm() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [pending, setPending] = useState(false);

  async function changePassword(formData: FormData) {
    setMessage("");
    setError(false);
    const currentPassword = String(formData.get("currentPassword") ?? "");
    const newPassword = String(formData.get("newPassword") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");
    if (newPassword.length < 8) { setError(true); setMessage("Use at least 8 characters for your new password."); return; }
    if (newPassword !== confirmPassword) { setError(true); setMessage("The new passwords do not match."); return; }
    setPending(true);
    try {
      const result = await authClient.changePassword({ currentPassword, newPassword, revokeOtherSessions: true });
      if (result.error) { setError(true); setMessage(result.error.message || "Your password could not be changed. Check your current password and try again."); return; }
      setMessage("Password changed. Other sessions have been signed out.");
      (document.getElementById("password-change-form") as HTMLFormElement | null)?.reset();
    } catch {
      setError(true);
      setMessage("Your password could not be changed right now. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return <form id="password-change-form" action={changePassword} aria-labelledby="password-heading" className="space-y-5">
    <h2 id="password-heading" className="text-xl font-bold text-ceda-ink">Change password</h2>
    <div><label htmlFor="currentPassword" className="text-sm font-semibold text-ceda-ink">Current password</label><PasswordInput id="currentPassword" name="currentPassword" autoComplete="current-password" required className={fieldClass} /></div>
    <div><label htmlFor="newPassword" className="text-sm font-semibold text-ceda-ink">New password</label><p id="new-password-hint" className="mt-1 text-xs text-ceda-muted">Use at least 8 characters.</p><PasswordInput id="newPassword" name="newPassword" autoComplete="new-password" minLength={8} required aria-describedby="new-password-hint" className={fieldClass} /></div>
    <div><label htmlFor="confirmPassword" className="text-sm font-semibold text-ceda-ink">Confirm new password</label><PasswordInput id="confirmPassword" name="confirmPassword" autoComplete="new-password" minLength={8} required className={fieldClass} /></div>
    {message && <p className={`rounded-xl p-3 text-sm ${error ? "border border-red-800/25 bg-red-50 text-red-900" : "border border-green-800/20 bg-green-50 text-green-900"}`} role={error ? "alert" : "status"}>{message}</p>}
    <button type="submit" disabled={pending} className="inline-flex min-h-12 items-center justify-center rounded-full bg-ceda-burgundy px-6 text-sm font-bold text-white hover:bg-[#5C150D] disabled:opacity-60">{pending ? "Updating…" : "Update password"}</button>
  </form>;
}
