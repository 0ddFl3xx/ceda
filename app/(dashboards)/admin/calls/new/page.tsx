import Link from "next/link";
import { Suspense } from "react";
import { PageStub } from "@/components/PageStub";
import { requireRole } from "@/lib/authorization";
import { createCall } from "@/app/(dashboards)/admin/calls/actions";

const fieldClass = "mt-1 block min-h-11 w-full rounded-xl border border-[#9A8175] bg-white px-3.5 py-2.5 text-base text-ceda-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ceda-burgundy";

export default function NewCallPage({ searchParams }: PageProps<"/admin/calls/new">) {
  return <Suspense fallback={<PageStub title="Create an innovation call" description="Checking administrator access…" />}><NewCallContent searchParams={searchParams} /></Suspense>;
}

async function NewCallContent({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  await requireRole("admin", "/admin/calls/new");
  const params = await searchParams;
  const error = params.error;
  const errorText = error === "title" ? "Enter a title between 3 and 255 characters." : error === "slug" ? "Use a slug with lowercase letters, numbers, and hyphens." : error === "duplicate" ? "That URL slug is already used by another call." : error === "dates" ? "Check the opening and closing dates; closing must be later." : error ? "Check the call details and try again." : "";

  return <main id="main-content" className="flex-1 bg-white px-4 py-10 sm:px-6 sm:py-14"><div className="mx-auto max-w-3xl">
    <Link href="/admin" className="text-sm font-semibold text-ceda-burgundy underline underline-offset-4">← Back to administration</Link>
    <h1 id="create-call-heading" className="mt-5 text-3xl font-bold text-ceda-ink">Create an innovation call</h1>
    <p className="mt-2 text-sm leading-6 text-ceda-muted">New calls start with a standard review workflow. You can configure the submission form after creating the call.</p>
    {errorText && <p className="mt-5 rounded-xl border border-red-800/25 bg-red-50 p-4 text-sm text-red-900" role="alert">{errorText}</p>}
    <form action={createCall} aria-labelledby="create-call-heading" className="mt-7 space-y-5 rounded-2xl border border-ceda-line p-6 shadow-sm sm:p-8">
      <div><label htmlFor="title" className="text-sm font-semibold text-ceda-ink">Call title</label><input id="title" name="title" required minLength={3} maxLength={255} className={fieldClass} /></div>
      <div><label htmlFor="slug" className="text-sm font-semibold text-ceda-ink">URL slug</label><p id="slug-hint" className="mt-1 text-xs text-ceda-muted">Lowercase letters, numbers, and hyphens, such as youth-innovation-2027.</p><input id="slug" name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" maxLength={120} aria-describedby="slug-hint" className={fieldClass} /></div>
      <div><label htmlFor="description" className="text-sm font-semibold text-ceda-ink">Description</label><textarea id="description" name="description" maxLength={5000} rows={4} className={fieldClass} /></div>
      <div><label htmlFor="status" className="text-sm font-semibold text-ceda-ink">Initial status</label><select id="status" name="status" className={fieldClass} defaultValue="draft"><option value="draft">Draft</option><option value="open">Open</option><option value="closed">Closed</option></select></div>
      <div className="grid gap-5 sm:grid-cols-2"><div><label htmlFor="opensAt" className="text-sm font-semibold text-ceda-ink">Opens (Gaborone time)</label><input id="opensAt" name="opensAt" type="datetime-local" className={fieldClass} /></div><div><label htmlFor="closesAt" className="text-sm font-semibold text-ceda-ink">Closes (Gaborone time)</label><input id="closesAt" name="closesAt" type="datetime-local" className={fieldClass} /></div></div>
      <button className="inline-flex min-h-11 items-center rounded-full bg-ceda-burgundy px-6 text-sm font-bold text-white hover:bg-[#5C150D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ceda-burgundy" type="submit">Create call and workflow</button>
    </form>
  </div></main>;
}
