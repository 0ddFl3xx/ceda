"use client";

import { useActionState } from "react";
import { updateProfile, type ProfileState } from "@/app/profile/actions";

const initialState: ProfileState = {};
const fieldClass = "mt-2 block min-h-12 w-full rounded-xl border border-[#9A8175] bg-white px-3.5 py-3 text-base text-ceda-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ceda-burgundy";

export function ProfileForm({ name, organisation, jobTitle }: { name: string; organisation: string; jobTitle: string }) {
  const [state, action, pending] = useActionState(updateProfile, initialState);
  return <form action={action} aria-labelledby="profile-form-heading" className="space-y-5">
    <h2 id="profile-form-heading" className="text-xl font-bold text-ceda-ink">Personal information</h2>
    <div><label htmlFor="name" className="text-sm font-semibold text-ceda-ink">Full name</label><input id="name" name="name" autoComplete="name" minLength={2} maxLength={120} required defaultValue={name} className={fieldClass} /></div>
    <div><label htmlFor="organisation" className="text-sm font-semibold text-ceda-ink">Organisation</label><input id="organisation" name="organisation" autoComplete="organization" maxLength={255} defaultValue={organisation} className={fieldClass} /></div>
    <div><label htmlFor="jobTitle" className="text-sm font-semibold text-ceda-ink">Job title</label><input id="jobTitle" name="jobTitle" autoComplete="organization-title" maxLength={150} defaultValue={jobTitle} className={fieldClass} /></div>
    {state.error && <p className="rounded-xl border border-red-800/25 bg-red-50 p-3 text-sm text-red-900" role="alert">{state.error}</p>}
    {state.success && <p className="rounded-xl border border-green-800/20 bg-green-50 p-3 text-sm text-green-900" role="status">{state.success}</p>}
    <button type="submit" disabled={pending} className="inline-flex min-h-12 items-center justify-center rounded-full bg-ceda-burgundy px-6 text-sm font-bold text-white hover:bg-[#5C150D] disabled:opacity-60">{pending ? "Saving…" : "Save profile"}</button>
  </form>;
}
