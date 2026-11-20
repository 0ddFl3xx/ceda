import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return <main id="main-content" className="flex-1 bg-white px-4 py-12 sm:px-6 sm:py-16">
    <div className="mx-auto max-w-2xl"><Suspense fallback={<div className="auth-card" aria-busy="true">Loading sign-in…</div>}><LoginForm /></Suspense></div>
  </main>;
}
