import Link from "next/link";

export default function ForbiddenPage() {
  return <main id="main-content" className="flex-1 bg-white px-4 py-16 sm:px-6">
    <section className="mx-auto max-w-3xl rounded-2xl border border-ceda-line bg-surface-muted p-8 sm:p-12">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-ceda-burgundy">Access restricted</p>
      <h1 className="mt-3 text-3xl font-bold text-ceda-ink">You don’t have access to this workspace</h1>
      <p className="mt-4 leading-7 text-ceda-muted">If you believe you need this role, contact a portal administrator.</p>
      <Link href="/dashboard" className="mt-7 inline-flex min-h-11 items-center rounded-full bg-ceda-burgundy px-6 font-semibold text-white">Go to my dashboard</Link>
    </section>
  </main>;
}
