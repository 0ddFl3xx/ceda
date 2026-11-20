import Link from "next/link";
import { Suspense } from "react";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { ideaVersions, ideas, innovationCalls } from "@/db/schema";
import { PageStub } from "@/components/PageStub";
import { requireRole } from "@/lib/authorization";
import { grantAward } from "@/app/admin/awards/actions";

export default function AdminAwardsPage({ searchParams }: PageProps<"/admin/awards">) {
  return <Suspense fallback={<PageStub title="Award recognition" description="Loading approved submissions…" />}><AwardsContent searchParams={searchParams} /></Suspense>;
}

async function AwardsContent({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  await requireRole("admin", "/admin/awards");
  const [approved, query] = await Promise.all([
    db.select({ id: ideas.id, referenceNo: ideas.referenceNo, title: ideaVersions.title, callTitle: innovationCalls.title })
      .from(ideas).innerJoin(ideaVersions, eq(ideas.currentVersionId, ideaVersions.id))
      .innerJoin(innovationCalls, eq(ideas.callId, innovationCalls.id))
      .where(eq(ideas.status, "approved")).orderBy(desc(ideas.updatedAt)),
    searchParams,
  ]);
  const error = query.error === "unavailable" ? "This submission is no longer eligible for an award. Refresh the page and try again."
    : query.error === "configuration" ? "The opportunity needs an award workflow stage before an award can be granted."
      : query.error ? "Enter an award title and check the field limits." : "";

  return <main id="main-content" className="flex-1 bg-[#FFFDFC] px-4 py-10 sm:px-6 sm:py-14"><div className="mx-auto max-w-[1100px]">
    <Link href="/admin" className="text-sm font-semibold text-ceda-burgundy underline underline-offset-4">← Back to administration</Link>
    <header className="mt-5"><p className="text-xs font-bold uppercase tracking-[0.18em] text-ceda-burgundy">Recognition</p><h1 className="mt-2 text-3xl font-bold text-ceda-ink">Grant awards</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-ceda-muted">Record recognition for approved ideas. Granting an award moves the submission to the final award stage and notifies the submitter in the portal.</p></header>
    {error && <p className="mt-5 rounded-xl border border-red-800/25 bg-red-50 p-4 text-sm text-red-900" role="alert">{error}</p>}
    {approved.length ? <div className="mt-7 space-y-4">{approved.map((idea) => <article key={idea.id} className="rounded-2xl border border-ceda-line bg-white p-5 shadow-sm sm:p-6"><h2 id={`award-${idea.id}`} className="text-xl font-bold text-ceda-ink">{idea.title}</h2><p className="mt-1 text-sm text-ceda-muted">{idea.referenceNo} · {idea.callTitle}</p><form action={grantAward} aria-labelledby={`award-${idea.id}`} className="mt-5 grid gap-4 border-t border-ceda-line pt-5 md:grid-cols-2">
      <input type="hidden" name="ideaId" value={idea.id} />
      <div><label htmlFor={`award-title-${idea.id}`} className="block text-sm font-semibold text-ceda-ink">Award title <span aria-hidden="true">*</span></label><input id={`award-title-${idea.id}`} name="title" required minLength={3} maxLength={255} className="mt-1 min-h-12 w-full rounded-lg border border-[#9A8175] px-3 text-base text-ceda-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ceda-burgundy" placeholder="e.g. CEDA Innovation Award" /></div>
      <div><label htmlFor={`award-tier-${idea.id}`} className="block text-sm font-semibold text-ceda-ink">Tier <span className="font-normal text-ceda-muted">(optional)</span></label><input id={`award-tier-${idea.id}`} name="tier" maxLength={50} className="mt-1 min-h-12 w-full rounded-lg border border-[#9A8175] px-3 text-base text-ceda-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ceda-burgundy" placeholder="e.g. Gold" /></div>
      <div className="md:col-span-2"><label htmlFor={`award-description-${idea.id}`} className="block text-sm font-semibold text-ceda-ink">Recognition details <span className="font-normal text-ceda-muted">(optional)</span></label><textarea id={`award-description-${idea.id}`} name="description" rows={3} maxLength={2000} className="mt-1 w-full rounded-lg border border-[#9A8175] px-3 py-2 text-base text-ceda-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ceda-burgundy" /></div>
      <button type="submit" className="min-h-12 w-fit rounded-full bg-ceda-burgundy px-5 text-sm font-bold text-white hover:bg-[#5C150D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ceda-burgundy">Grant award</button>
    </form></article>)}</div> : <section className="mt-7 rounded-2xl border border-ceda-line bg-white p-6"><h2 className="font-bold text-ceda-ink">No approved ideas need an award</h2><p className="mt-2 text-sm text-ceda-muted">Once an adjudicator approves a submission, it will appear here.</p></section>}
  </div></main>;
}
