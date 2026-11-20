"use client";

import Link from "next/link";
import { useActionState } from "react";
import { addEvaluatorInternalNote, submitEvaluation, type EvaluationState, type InternalNoteState } from "@/app/evaluator/assignments/actions";

type Criterion = { id: string; name: string; description: string | null; maxScore: number; weight: string };
type Props = {
  assignmentId: string;
  versionId: string;
  referenceNo: string;
  stageName: string;
  title: string;
  summary: string;
  answers: Record<string, unknown>;
  criteria: Criterion[];
  internalNotes: { id: string; body: string; authorName: string; createdAt: Date }[];
};

const initialState: EvaluationState = {};
const initialNoteState: InternalNoteState = {};
const inputClass = "mt-1 block min-h-11 w-full rounded-xl border border-[#9A8175] bg-white px-3.5 py-2.5 text-base text-ceda-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ceda-burgundy";

export function EvaluationForm({ assignmentId, versionId, referenceNo, stageName, title, summary, answers, criteria, internalNotes }: Props) {
  const [state, action, pending] = useActionState(submitEvaluation, initialState);
  const [noteState, noteAction, notePending] = useActionState(addEvaluatorInternalNote, initialNoteState);

  if (state.totalScore) return <section className="rounded-2xl border border-green-800/20 bg-green-50 p-6" aria-live="polite"><p className="text-xs font-bold uppercase tracking-[0.18em] text-green-900">Review submitted</p><h2 className="mt-2 text-2xl font-bold text-ceda-ink">Weighted score: {state.totalScore} / 100</h2><p className="mt-2 text-sm text-ceda-body">Your evaluation has been saved against this exact submission version.</p><Link href="/evaluator" className="mt-5 inline-flex min-h-11 items-center rounded-full bg-ceda-burgundy px-5 text-sm font-bold text-white">Return to evaluator queue</Link></section>;

  return <div className="space-y-6">
    <section className="rounded-2xl border border-ceda-line bg-white p-6 sm:p-8"><p className="text-xs font-bold uppercase tracking-wide text-ceda-burgundy">{referenceNo} · {stageName}</p><h2 className="mt-2 text-2xl font-bold text-ceda-ink">{title}</h2><p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-ceda-body">{summary}</p>
      {Object.keys(answers).length > 0 && <dl className="mt-5 divide-y divide-ceda-line border-t border-ceda-line">{Object.entries(answers).map(([key, value]) => <div key={key} className="grid gap-1 py-3 sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] sm:gap-5"><dt className="text-sm font-semibold capitalize text-ceda-ink">{key.replaceAll("_", " ")}</dt><dd className="break-words text-sm leading-6 text-ceda-body">{Array.isArray(value) ? value.join(", ") : typeof value === "boolean" ? (value ? "Yes" : "No") : String(value ?? "—")}</dd></div>)}</dl>}
    </section>
    <form action={action} aria-labelledby="evaluation-heading" className="space-y-5 rounded-2xl border border-ceda-line bg-white p-6 shadow-sm sm:p-8">
      <input type="hidden" name="assignmentId" value={assignmentId} />
      <input type="hidden" name="versionId" value={versionId} />
      <div><h2 id="evaluation-heading" className="text-xl font-bold text-ceda-ink">Score this submission</h2><p className="mt-1 text-sm text-ceda-muted">Score each criterion within its range. The combined score is normalized to 100 using the configured weights.</p></div>
      {state.error && <p role="alert" className="rounded-xl border border-red-800/25 bg-red-50 p-4 text-sm text-red-900">{state.error}</p>}
      {criteria.map((criterion, index) => <fieldset key={criterion.id} className="rounded-xl border border-ceda-line p-4 sm:p-5"><legend className="px-1 font-bold text-ceda-ink">{index + 1}. {criterion.name}</legend>{criterion.description && <p className="mt-1 text-sm leading-6 text-ceda-muted">{criterion.description}</p>}<p className="mt-2 text-xs text-ceda-muted">0–{criterion.maxScore} points · weight {criterion.weight}</p><div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,0.35fr)_minmax(0,1fr)]"><div><label htmlFor={`score-${criterion.id}`} className="text-sm font-semibold text-ceda-ink">Score</label><input id={`score-${criterion.id}`} name={`score:${criterion.id}`} type="number" min="0" max={criterion.maxScore} step="any" required className={inputClass} /></div><div><label htmlFor={`comment-${criterion.id}`} className="text-sm font-semibold text-ceda-ink">Criterion feedback</label><textarea id={`comment-${criterion.id}`} name={`comment:${criterion.id}`} maxLength={2000} rows={2} className={inputClass} /></div></div></fieldset>)}
      <div><label htmlFor="overallComment" className="text-sm font-semibold text-ceda-ink">Overall feedback <span className="font-normal text-ceda-muted">(optional)</span></label><textarea id="overallComment" name="overallComment" maxLength={5000} rows={4} className={inputClass} /></div>
      <button type="submit" disabled={pending} className="inline-flex min-h-12 items-center rounded-full bg-ceda-burgundy px-6 text-sm font-bold text-white hover:bg-[#5C150D] disabled:cursor-wait disabled:opacity-60">{pending ? "Submitting review…" : "Submit evaluation"}</button>
    </form>
    <section aria-labelledby="private-notes-heading" className="rounded-2xl border border-ceda-line bg-[#FFF9F4] p-6 sm:p-8">
      <h2 id="private-notes-heading" className="text-xl font-bold text-ceda-ink">Evaluator-only notes</h2>
      <p className="mt-1 text-sm leading-6 text-ceda-muted">These notes are tied to this submission version and are hidden from the submitter. Use the adjudication feedback action when requesting a change from the submitter.</p>
      {internalNotes.length > 0 && <ul className="mt-4 space-y-3">{internalNotes.map((note) => <li key={note.id} className="rounded-xl border border-ceda-line bg-white p-4"><p className="whitespace-pre-wrap text-sm leading-6 text-ceda-body">{note.body}</p><p className="mt-2 text-xs text-ceda-muted">{note.authorName} · {new Intl.DateTimeFormat("en-BW", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Gaborone" }).format(note.createdAt)}</p></li>)}</ul>}
      <form action={noteAction} aria-labelledby="private-note-form-heading" className="mt-5 space-y-3">
        <input type="hidden" name="assignmentId" value={assignmentId} />
        <input type="hidden" name="versionId" value={versionId} />
        <h3 id="private-note-form-heading" className="text-sm font-bold text-ceda-ink">Add a private note</h3>
        <label htmlFor="evaluator-private-note" className="sr-only">Private evaluator note</label>
        <textarea id="evaluator-private-note" name="body" required minLength={3} maxLength={5000} rows={4} aria-describedby="private-note-help" className={inputClass} />
        <p id="private-note-help" className="text-xs text-ceda-muted">3 to 5,000 characters. Only authorized staff can read this note.</p>
        {noteState.error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-900" role="alert">{noteState.error}</p>}
        {noteState.success && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-900" role="status">{noteState.success}</p>}
        <button type="submit" disabled={notePending} className="inline-flex min-h-12 items-center rounded-full border border-ceda-burgundy px-5 text-sm font-bold text-ceda-burgundy hover:bg-white disabled:cursor-wait disabled:opacity-60">{notePending ? "Saving note…" : "Save private note"}</button>
      </form>
    </section>
  </div>;
}
