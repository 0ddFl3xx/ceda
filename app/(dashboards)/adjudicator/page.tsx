import { Suspense } from "react";
import { PageStub } from "@/components/PageStub";
import { requireRole } from "@/lib/authorization";
import { getAdjudicationQueue } from "@/lib/server/adjudicator-workspace";
import { decideSubmission } from "@/app/(dashboards)/adjudicator/actions";

const inputClass = "mt-1 block min-h-11 w-full rounded-xl border border-[#9A8175] bg-white px-3.5 py-2.5 text-base text-ceda-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ceda-burgundy";

export default function AdjudicatorPage({ searchParams }: PageProps<"/adjudicator">) {
  return <Suspense fallback={<PageStub title="Adjudication Workspace" description="Loading the adjudication queue…" />}><AdjudicationContent searchParams={searchParams} /></Suspense>;
}

async function AdjudicationContent({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  await requireRole("adjudicator", "/adjudicator");
  const query = await searchParams;
  const queue = await getAdjudicationQueue();
  const message = query.error === "rationale" ? "Enter a rationale of at least 20 characters." : query.error === "decided" ? "A decision already exists for the current version." : query.error ? "This submission is not available for adjudication." : "";

  return <main id="main-content" className="flex-1 bg-white px-4 py-10 sm:px-6 sm:py-14"><div className="mx-auto max-w-[1100px]">
    <p className="text-xs font-bold uppercase tracking-[0.18em] text-ceda-burgundy">Adjudicator workspace</p><h1 className="mt-2 text-3xl font-bold text-ceda-ink">Adjudication queue</h1><p className="mt-2 text-sm text-ceda-muted">Review completed evaluations and record the decision for the current submission version.</p>
    {message && <p className="mt-5 rounded-xl border border-red-800/25 bg-red-50 p-4 text-sm text-red-900" role="alert">{message}</p>}
    {queue.length ? <div className="mt-7 space-y-6">{queue.map((idea) => <article key={idea.id} className="rounded-2xl border border-ceda-line bg-white p-5 shadow-sm sm:p-7"><header><p className="text-xs font-bold uppercase tracking-wide text-ceda-burgundy">{idea.referenceNo} · {idea.callTitle}</p><h2 id={`adjudication-${idea.id}`} className="mt-2 text-2xl font-bold text-ceda-ink">{idea.title}</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-ceda-body">{idea.summary}</p></header>
      {idea.reviews.length > 0 ? <section className="mt-5" aria-label="Evaluator reviews"><h3 className="font-bold text-ceda-ink">Evaluator reviews</h3><div className="mt-3 grid gap-3 sm:grid-cols-2">{idea.reviews.map((review, index) => <div key={`${review.versionId}-${index}`} className="rounded-xl bg-[#FFF9F4] p-4"><p className="font-semibold text-ceda-ink">{review.stageName} · {review.evaluatorName}</p><p className="mt-1 text-sm font-bold text-ceda-burgundy">{review.totalScore ?? "—"} / 100</p>{review.comment && <p className="mt-2 text-sm leading-6 text-ceda-body">{review.comment}</p>}</div>)}</div></section> : <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-950">No evaluation scores are attached to the current version.</p>}
      <dl className="mt-5 divide-y divide-ceda-line border-t border-ceda-line">{Object.entries(idea.answers ?? {}).map(([key, value]) => <div key={key} className="grid gap-1 py-3 sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] sm:gap-5"><dt className="text-sm font-semibold capitalize text-ceda-ink">{key.replaceAll("_", " ")}</dt><dd className="break-words text-sm leading-6 text-ceda-body">{Array.isArray(value) ? value.join(", ") : typeof value === "boolean" ? (value ? "Yes" : "No") : String(value ?? "—")}</dd></div>)}</dl>
      <form action={decideSubmission} aria-labelledby={`adjudication-${idea.id}`} className="mt-6 grid gap-4 border-t border-ceda-line pt-5 sm:grid-cols-[minmax(0,0.35fr)_minmax(0,1fr)_auto] sm:items-end"><input type="hidden" name="ideaId" value={idea.id} /><div><label htmlFor={`decision-${idea.id}`} className="text-sm font-semibold text-ceda-ink">Decision</label><select id={`decision-${idea.id}`} name="decision" required defaultValue="" className={inputClass}><option value="" disabled>Choose decision</option><option value="approved">Approve</option><option value="needs_revision">Request changes</option><option value="rejected">Reject</option></select></div><div><label htmlFor={`rationale-${idea.id}`} className="text-sm font-semibold text-ceda-ink">Rationale <span className="text-ceda-muted">(required)</span></label><textarea id={`rationale-${idea.id}`} name="rationale" required minLength={20} maxLength={5000} rows={2} className={inputClass} /></div><button type="submit" className="min-h-11 rounded-full bg-ceda-burgundy px-5 text-sm font-bold text-white hover:bg-[#5C150D]">Record decision</button></form>
    </article>)}</div> : <section className="mt-7 rounded-2xl bg-[#FFF9F4] p-6"><h2 className="font-bold text-ceda-ink">No submissions are ready for adjudication</h2><p className="mt-2 text-sm text-ceda-muted">Submissions move here automatically after the final evaluation stage is completed.</p></section>}
  </div></main>;
}
