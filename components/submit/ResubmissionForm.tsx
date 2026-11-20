"use client";

import Link from "next/link";
import { useActionState } from "react";
import { resubmitIdeaAction } from "@/app/dashboard/submissions/actions";
import type { SubmissionState } from "@/app/submit/actions";

type Field = {
  key: string;
  label: string;
  helpText: string | null;
  type: "text" | "textarea" | "number" | "select" | "multiselect" | "checkbox" | "date" | "url";
  required: boolean;
  options: string[] | null;
};
type Props = {
  ideaId: string;
  title: string;
  summary: string;
  answers: Record<string, unknown>;
  categoryId: string | null;
  fields: Field[];
  categories: { id: string; name: string }[];
};
const initialState: SubmissionState = {};
const fieldClass = "mt-1 block min-h-11 w-full rounded-xl border border-[#9A8175] bg-white px-3.5 py-2.5 text-base text-ceda-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ceda-burgundy";

export function ResubmissionForm({ ideaId, title, summary, answers, categoryId, fields, categories }: Props) {
  const [state, action, pending] = useActionState(resubmitIdeaAction, initialState);
  if (state.referenceNo) return <section className="rounded-2xl border border-green-800/20 bg-green-50 p-6" aria-live="polite"><h2 className="text-xl font-bold text-ceda-ink">Updated version submitted</h2><p className="mt-2 text-sm text-ceda-body">Reference {state.referenceNo} is back in review.</p><Link href="/dashboard" className="mt-4 inline-flex min-h-11 items-center rounded-full bg-ceda-burgundy px-5 text-sm font-bold text-white">Return to dashboard</Link></section>;

  return <form action={action} aria-labelledby="resubmit-heading" className="space-y-5 rounded-2xl border border-ceda-line bg-white p-5 shadow-sm sm:p-7">
    <input type="hidden" name="ideaId" value={ideaId} />
    <div><h2 id="resubmit-heading" className="text-xl font-bold text-ceda-ink">Submit a revised version</h2><p className="mt-1 text-sm text-ceda-muted">Update the details below and explain how you addressed the requested changes. Your previous version remains in the record.</p></div>
    {state.error && <p className="rounded-xl border border-red-800/25 bg-red-50 p-4 text-sm text-red-900" role="alert">{state.error}</p>}
    <div><label htmlFor="title" className="text-sm font-semibold text-ceda-ink">Idea title *</label><input id="title" name="title" required minLength={5} maxLength={255} defaultValue={title} aria-describedby={state.fieldErrors?.title ? "title-error" : undefined} className={fieldClass} />{state.fieldErrors?.title && <p id="title-error" className="mt-1 text-sm text-red-800">{state.fieldErrors.title}</p>}</div>
    <div><label htmlFor="summary" className="text-sm font-semibold text-ceda-ink">Idea summary *</label><textarea id="summary" name="summary" required minLength={30} maxLength={5000} rows={5} defaultValue={summary} aria-describedby={state.fieldErrors?.summary ? "summary-error" : undefined} className={fieldClass} />{state.fieldErrors?.summary && <p id="summary-error" className="mt-1 text-sm text-red-800">{state.fieldErrors.summary}</p>}</div>
    <div><label htmlFor="categoryId" className="text-sm font-semibold text-ceda-ink">Category *</label><select id="categoryId" name="categoryId" required defaultValue={categoryId ?? ""} className={fieldClass}><option value="" disabled>Select a category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>{state.fieldErrors?.categoryId && <p className="mt-1 text-sm text-red-800">{state.fieldErrors.categoryId}</p>}</div>
    {fields.map((field) => {
      const id = `answer-${field.key}`;
      const value = answers[field.key];
      const selectedValues = Array.isArray(value) ? value.map(String) : [];
      const error = state.fieldErrors?.[field.key];
      const errorId = `${id}-error`;
      return <div key={field.key}>
        {field.type === "checkbox" ? <label htmlFor={id} className="flex items-start gap-3 text-sm leading-6 text-ceda-body"><input id={id} name={`answer:${field.key}`} type="checkbox" value="on" required={field.required} defaultChecked={value === true} className="mt-1 h-5 w-5 accent-ceda-burgundy" /><span className="font-semibold text-ceda-ink">{field.label}{field.required ? " *" : ""}</span></label> : <>
          {!(field.type === "select" && field.options && field.options.length <= 5) && field.type !== "multiselect" && <label htmlFor={id} className="block text-sm font-semibold text-ceda-ink">{field.label}{field.required ? " *" : ""}</label>}
          {field.type === "textarea" && <textarea id={id} name={`answer:${field.key}`} required={field.required} maxLength={4000} rows={4} defaultValue={String(value ?? "")} className={fieldClass} />}
          {field.type === "text" && <input id={id} name={`answer:${field.key}`} type="text" required={field.required} maxLength={4000} defaultValue={String(value ?? "")} className={fieldClass} />}
          {field.type === "number" && <input id={id} name={`answer:${field.key}`} type="number" step="any" required={field.required} defaultValue={String(value ?? "")} className={fieldClass} />}
          {field.type === "date" && <input id={id} name={`answer:${field.key}`} type="date" required={field.required} defaultValue={String(value ?? "")} className={fieldClass} />}
          {field.type === "url" && <input id={id} name={`answer:${field.key}`} type="url" inputMode="url" required={field.required} maxLength={4000} defaultValue={String(value ?? "")} className={fieldClass} />}
          {field.type === "select" && field.options && field.options.length > 5 && <select id={id} name={`answer:${field.key}`} required={field.required} defaultValue={String(value ?? "")} className={fieldClass}><option value="" disabled>Select an option</option>{field.options.map((option) => <option key={option} value={option}>{option}</option>)}</select>}
          {field.type === "select" && field.options && field.options.length <= 5 && <fieldset aria-describedby={error ? errorId : undefined} aria-required={field.required} className="mt-2 space-y-1"><legend className="mb-1 text-sm font-semibold text-ceda-ink">{field.label}{field.required ? " *" : ""}</legend>{field.options.map((option, index) => <label key={option} className="flex min-h-10 items-center gap-3 text-sm text-ceda-body"><input type="radio" name={`answer:${field.key}`} value={option} required={field.required && index === 0} defaultChecked={String(value ?? "") === option} className="h-5 w-5 accent-ceda-burgundy" />{option}</label>)}</fieldset>}
          {field.type === "multiselect" && field.options?.length && <fieldset aria-describedby={error ? errorId : undefined} aria-required={field.required} className="mt-2 space-y-1"><legend className="mb-1 text-sm font-semibold text-ceda-ink">{field.label}{field.required ? " *" : ""}</legend>{field.options.map((option) => <label key={option} className="flex min-h-10 items-center gap-3 text-sm text-ceda-body"><input type="checkbox" name={`answer:${field.key}`} value={option} defaultChecked={selectedValues.includes(option)} className="h-5 w-5 accent-ceda-burgundy" />{option}</label>)}</fieldset>}
        </>}
        {field.helpText && <p className="mt-1 text-sm text-ceda-muted">{field.helpText}</p>}{error && <p id={errorId} className="mt-1 text-sm text-red-800">{error}</p>}
      </div>;
    })}
    <div><label htmlFor="response" className="text-sm font-semibold text-ceda-ink">Response to feedback *</label><p id="response-hint" className="mt-1 text-sm text-ceda-muted">Describe what you changed or explain how each point was addressed.</p><textarea id="response" name="response" required minLength={20} maxLength={5000} rows={4} aria-describedby={`response-hint${state.fieldErrors?.response ? " response-error" : ""}`} className={fieldClass} />{state.fieldErrors?.response && <p id="response-error" className="mt-1 text-sm text-red-800">{state.fieldErrors.response}</p>}</div>
    <button type="submit" disabled={pending} className="inline-flex min-h-12 items-center rounded-full bg-ceda-burgundy px-6 text-sm font-bold text-white hover:bg-[#5C150D] disabled:cursor-wait disabled:opacity-60">{pending ? "Submitting revision…" : "Submit revised version"}</button>
  </form>;
}
