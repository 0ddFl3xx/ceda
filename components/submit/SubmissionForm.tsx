"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Check, ChevronLeft, ChevronRight, CircleCheck, FileText, Save } from "lucide-react";
import { saveSubmissionDraft, submitIdeaAction, type SubmissionState } from "@/app/submit/actions";

type Field = {
  key: string;
  label: string;
  helpText: string | null;
  type: "text" | "textarea" | "number" | "select" | "multiselect" | "checkbox" | "date" | "url";
  required: boolean;
  options: string[] | null;
  sectionKey: string;
};

type Draft = { id: string; categoryId: string | null; title: string; summary: string; answers: Record<string, unknown>; termsAccepted: boolean } | null;
type Props = {
  call: { id: string; title: string; description: string | null; closesAt: string | null };
  fields: Field[];
  categories: { id: string; name: string; description: string | null }[];
  initialDraft: Draft;
};

const sections = [
  { key: "terms_and_conditions", label: "Terms and Conditions", description: "Name your idea and confirm the terms." },
  { key: "general_information", label: "General Information", description: "Tell us who is applying and where the idea fits." },
  { key: "solution_status", label: "Solution Status", description: "Show how far your solution has progressed." },
  { key: "solution_overview", label: "Solution Overview", description: "Explain the problem and your proposed solution." },
  { key: "type_of_innovation", label: "Type of Innovation", description: "Select the kind of innovation you are proposing." },
  { key: "additional_information", label: "Additional Information", description: "Add the remaining details requested for this opportunity." },
  { key: "solution_documents", label: "Solution Documents", description: "Add links to supporting documents and prototypes." },
];
const solutionStages = ["Idea or concept", "Prototype in development", "Pilot or testing", "Ready to launch", "Already operating"];
const innovationTypes = ["Product", "Service", "Process", "Technology", "Business model", "Social innovation"];
const inputClass = "mt-2 block min-h-12 w-full rounded-xl border border-[#9A8175] bg-white px-3.5 py-3 text-base text-ceda-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ceda-burgundy";

function printValue(value: unknown) {
  if (typeof value === "string" || typeof value === "number") return String(value);
  return "";
}

function FieldControl({ field, value, active, error }: { field: Field; value: unknown; active: boolean; error?: string }) {
  const id = `answer-${field.key}`;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [field.helpText ? hintId : "", error ? errorId : ""].filter(Boolean).join(" ") || undefined;
  const common = { id, name: `answer:${field.key}`, required: active && field.required, "aria-describedby": describedBy, "aria-invalid": Boolean(error), className: inputClass };
  if (field.type === "checkbox") return <div>
    <label htmlFor={id} className="flex min-h-12 items-start gap-3 text-sm leading-6 text-ceda-body"><input id={id} name={`answer:${field.key}`} type="checkbox" value="on" required={active && field.required} defaultChecked={value === true || value === "true"} aria-describedby={describedBy} aria-invalid={Boolean(error)} className="mt-1 h-5 w-5 accent-ceda-burgundy" /><span className="font-semibold text-ceda-ink">{field.label}{field.required && <span aria-hidden="true" className="text-ceda-burgundy"> *</span>}</span></label>
    {field.helpText && <p id={hintId} className="mt-1 text-sm text-ceda-muted">{field.helpText}</p>}{error && <p id={errorId} className="mt-1 text-sm text-red-800">{error}</p>}
  </div>;
  if (field.type === "multiselect") return <fieldset aria-describedby={describedBy}>
    <legend className="text-sm font-semibold text-ceda-ink">{field.label}{field.required && <span aria-hidden="true" className="text-ceda-burgundy"> *</span>}</legend>
    {field.helpText && <p id={hintId} className="mt-1 text-sm text-ceda-muted">{field.helpText}</p>}
    <div className="mt-2 grid gap-2 sm:grid-cols-2">{(field.options ?? []).map((option, index) => <label key={option} htmlFor={`${id}-${index}`} className="flex min-h-12 items-center gap-3 rounded-xl border border-ceda-line bg-white px-3 text-sm text-ceda-body"><input id={`${id}-${index}`} type="checkbox" name={`answer:${field.key}`} value={option} defaultChecked={Array.isArray(value) && value.includes(option)} className="h-5 w-5 accent-ceda-burgundy" />{option}</label>)}</div>
    {error && <p id={errorId} className="mt-1 text-sm text-red-800">{error}</p>}
  </fieldset>;
  return <div>
    <label htmlFor={id} className="block text-sm font-semibold text-ceda-ink">{field.label}{field.required && <span aria-hidden="true" className="text-ceda-burgundy"> *</span>}</label>
    {field.helpText && <p id={hintId} className="mt-1 text-sm text-ceda-muted">{field.helpText}</p>}
    {field.type === "textarea" ? <textarea {...common} defaultValue={printValue(value)} rows={5} maxLength={5000} /> : null}
    {field.type === "select" ? <select {...common} defaultValue={printValue(value)}><option value="">Select an option</option>{(field.options ?? []).map((option) => <option key={option} value={option}>{option}</option>)}</select> : null}
    {field.type === "number" ? <input {...common} type="number" step="any" defaultValue={printValue(value)} /> : null}
    {field.type === "date" ? <input {...common} type="date" defaultValue={printValue(value)} /> : null}
    {field.type === "url" ? <input {...common} type="url" inputMode="url" maxLength={4000} defaultValue={printValue(value)} placeholder="https://" /> : null}
    {field.type === "text" ? <input {...common} type="text" maxLength={4000} defaultValue={printValue(value)} /> : null}
    {error && <p id={errorId} className="mt-1 text-sm text-red-800">{error}</p>}
  </div>;
}

export function SubmissionForm({ call, fields, categories, initialDraft }: Props) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [draftId, setDraftId] = useState(initialDraft?.id ?? "");
  const [savedMessage, setSavedMessage] = useState("");
  const [state, setState] = useState<SubmissionState>({});
  const [pending, startTransition] = useTransition();
  const answerValues = initialDraft?.answers ?? {};

  function goToSection(index: number) {
    setActive(index);
    requestAnimationFrame(() => {
      const heading = sectionRefs.current[index]?.querySelector<HTMLElement>("[data-step-heading]");
      heading?.focus();
    });
  }

  function firstInvalid(indexes: number[]) {
    for (const index of indexes) {
      const panel = sectionRefs.current[index];
      const invalid = panel?.querySelector<HTMLElement>("input:invalid, select:invalid, textarea:invalid");
      if (invalid) return { index, invalid };
    }
    return null;
  }

  async function saveDraft() {
    if (!formRef.current) return false;
    setSavedMessage("Saving your application…");
    const result = await saveSubmissionDraft(new FormData(formRef.current));
    if (result.error || !result.draftId) {
      setSavedMessage("");
      setState(result);
      return false;
    }
    setDraftId(result.draftId);
    setState({});
    setSavedMessage("Draft saved");
    return true;
  }

  async function continueToNext() {
    const invalid = firstInvalid([active]);
    if (invalid) { invalid.invalid.focus(); (invalid.invalid as HTMLInputElement).reportValidity?.(); return; }
    startTransition(async () => {
      const saved = await saveDraft();
      if (saved) goToSection(Math.min(active + 1, sections.length - 1));
    });
  }

  async function saveAndExit() {
    startTransition(async () => {
      const saved = await saveDraft();
      if (saved) { router.push("/dashboard"); router.refresh(); }
    });
  }

  async function submitApplication() {
    const invalid = firstInvalid(sections.map((_, index) => index));
    if (invalid) { goToSection(invalid.index); requestAnimationFrame(() => { invalid.invalid.focus(); (invalid.invalid as HTMLInputElement).reportValidity?.(); }); return; }
    if (!formRef.current) return;
    setState({});
    startTransition(async () => {
      const result = await submitIdeaAction(new FormData(formRef.current!));
      setState(result);
      if (result.error && result.fieldErrors) {
        const key = Object.keys(result.fieldErrors)[0];
        const sectionKey = key === "categoryId" ? "general_information" : key === "solutionStatus" ? "solution_status" : key === "summary" ? "solution_overview" : key === "innovationTypes" ? "type_of_innovation" : key === "termsAccepted" || key === "title" ? "terms_and_conditions" : fields.find((field) => field.key === key)?.sectionKey;
        const sectionIndex = sections.findIndex((section) => section.key === sectionKey);
        if (sectionIndex >= 0) goToSection(sectionIndex);
      }
    });
  }

  if (state.referenceNo) return <section className="rounded-3xl border border-green-800/20 bg-white p-8 shadow-sm sm:p-12" aria-live="polite">
    <CircleCheck aria-hidden="true" className="h-12 w-12 text-green-700" />
    <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-green-800">Application received</p>
    <h2 className="mt-2 text-2xl font-bold text-ceda-ink">Your reference is {state.referenceNo}</h2>
    <p className="mt-3 max-w-xl text-sm leading-6 text-ceda-muted">Your innovation submission is now in the review process. You can follow updates from your dashboard.</p>
    <Link href="/dashboard" className="mt-6 inline-flex min-h-12 items-center rounded-full bg-ceda-burgundy px-6 text-sm font-bold text-white hover:bg-[#5C150D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ceda-burgundy">Open my dashboard</Link>
  </section>;

  return <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
    <div className="min-w-0 rounded-3xl border border-ceda-line bg-white shadow-[0_12px_36px_rgba(77,31,18,0.06)]">
      <header className="border-b border-slate-100 px-5 py-6 sm:px-10 sm:py-8">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-ceda-burgundy">Innovation submission</p>
        <h2 id="submission-step-title" className="mt-2 text-2xl font-bold text-ceda-ink sm:text-3xl">{sections[active].label}</h2>
        <p className="mt-2 text-sm text-ceda-muted">{sections[active].description}</p>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
          <span className="font-semibold text-ceda-ink">{call.title}</span>
          {call.closesAt && <span className="text-ceda-muted">Closes {new Date(call.closesAt).toLocaleDateString("en-BW", { dateStyle: "medium", timeZone: "Africa/Gaborone" })}</span>}
        </div>
      </header>
      <form ref={formRef} aria-labelledby="submission-step-title" onSubmit={(event) => event.preventDefault()}>
        <input type="hidden" name="callId" value={call.id} />
        <input type="hidden" name="draftId" value={draftId} />
        {state.error && <p className="mx-5 mt-5 rounded-xl border border-red-800/25 bg-red-50 p-4 text-sm text-red-900 sm:mx-10" role="alert">{state.error}</p>}

        {sections.map((section, index) => <section key={section.key} ref={(element) => { sectionRefs.current[index] = element; }} hidden={active !== index} aria-labelledby={`step-heading-${section.key}`} className="min-h-[330px] px-5 py-6 sm:px-10 sm:py-8">
          <h3 id={`step-heading-${section.key}`} data-step-heading tabIndex={-1} className="sr-only">{section.label}</h3>
          <div className="space-y-6">
            {index === 0 && <>
              <div><label htmlFor="title" className="block text-sm font-semibold text-ceda-ink">Idea title <span aria-hidden="true" className="text-ceda-burgundy">*</span></label><p id="title-help" className="mt-1 text-sm text-ceda-muted">Give your solution a concise, memorable name.</p><input id="title" name="title" required minLength={5} maxLength={255} defaultValue={initialDraft?.title === "Untitled submission" ? "" : initialDraft?.title ?? ""} aria-describedby="title-help" className={inputClass} /></div>
              <div className="rounded-2xl border border-ceda-line p-4 sm:p-5">
                <label htmlFor="termsAccepted" className="flex items-start gap-3 text-sm leading-6 text-ceda-body"><input id="termsAccepted" name="termsAccepted" type="checkbox" value="on" required defaultChecked={initialDraft?.termsAccepted} className="mt-1 h-5 w-5 accent-ceda-burgundy" /><span><strong className="text-ceda-ink">I have read and agree to the Terms and Conditions</strong> <a href="/terms" target="_blank" rel="noreferrer" className="ml-1 font-semibold text-ceda-burgundy underline underline-offset-4">View terms</a><span className="mt-1 block text-sm text-ceda-muted">Your information will be used to assess this innovation submission and manage the review process.</span></span></label>
              </div>
              <div className="rounded-xl bg-[#FFF9F4] p-4 text-sm text-ceda-body"><strong className="text-ceda-ink">What happens next?</strong><p className="mt-1">You can save a draft at any time. Once submitted, your application receives a reference number and enters review.</p></div>
            </>}

            {index === 1 && <>
              <div><label htmlFor="categoryId" className="block text-sm font-semibold text-ceda-ink">Strategic priority area <span aria-hidden="true" className="text-ceda-burgundy">*</span></label><p className="mt-1 text-sm text-ceda-muted">Choose the area that best matches your idea.</p><select id="categoryId" name="categoryId" required defaultValue={initialDraft?.categoryId ?? ""} className={inputClass}><option value="">Select a priority area</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div>
              {categories.length === 0 && <p className="rounded-xl border border-amber-700/20 bg-amber-50 p-4 text-sm text-amber-900" role="status">This opportunity has no priority areas configured yet. Contact CEDA for help.</p>}
              {fields.filter((field) => field.sectionKey === "general_information").map((field) => <FieldControl key={field.key} field={field} value={answerValues[field.key]} active={active === index} error={state.fieldErrors?.[field.key]} />)}
              {fields.every((field) => field.sectionKey !== "general_information") && <p className="rounded-xl bg-[#FFF9F4] p-4 text-sm leading-6 text-ceda-muted">Add your priority area above. CEDA may request additional applicant details for this opportunity.</p>}
            </>}

            {index === 2 && <>
              <fieldset><legend className="text-sm font-semibold text-ceda-ink">Current solution stage <span aria-hidden="true" className="text-ceda-burgundy">*</span></legend><p className="mt-1 text-sm text-ceda-muted">Select the option that best describes your solution today.</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{solutionStages.map((stage, optionIndex) => <label key={stage} htmlFor={`solution-stage-${optionIndex}`} className="flex min-h-12 items-center gap-3 rounded-xl border border-ceda-line bg-white px-3 text-sm text-ceda-body"><input id={`solution-stage-${optionIndex}`} type="radio" name="solutionStatus" value={stage} required={active === index} defaultChecked={answerValues.solution_status === stage} className="h-5 w-5 accent-ceda-burgundy" />{stage}</label>)}</div>{state.fieldErrors?.solutionStatus && <p className="mt-2 text-sm text-red-800">{state.fieldErrors.solutionStatus}</p>}</fieldset>
              {fields.filter((field) => field.sectionKey === "solution_status").map((field) => <FieldControl key={field.key} field={field} value={answerValues[field.key]} active={active === index} error={state.fieldErrors?.[field.key]} />)}
            </>}

            {index === 3 && <>
              <div><label htmlFor="summary" className="block text-sm font-semibold text-ceda-ink">Solution overview <span aria-hidden="true" className="text-ceda-burgundy">*</span></label><p id="summary-help" className="mt-1 text-sm text-ceda-muted">Describe the challenge, who it affects, how your solution works, and the impact you expect.</p><textarea id="summary" name="summary" required minLength={30} maxLength={5000} rows={9} defaultValue={initialDraft?.summary ?? ""} aria-describedby="summary-help" aria-invalid={Boolean(state.fieldErrors?.summary)} className={inputClass} />{state.fieldErrors?.summary && <p className="mt-1 text-sm text-red-800">{state.fieldErrors.summary}</p>}</div>
              {fields.filter((field) => field.sectionKey === "solution_overview").map((field) => <FieldControl key={field.key} field={field} value={answerValues[field.key]} active={active === index} error={state.fieldErrors?.[field.key]} />)}
            </>}

            {index === 4 && <>
              <fieldset><legend className="text-sm font-semibold text-ceda-ink">Innovation type <span aria-hidden="true" className="text-ceda-burgundy">*</span></legend><p className="mt-1 text-sm text-ceda-muted">Select every type that applies.</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{innovationTypes.map((type, optionIndex) => <label key={type} htmlFor={`innovation-type-${optionIndex}`} className="flex min-h-12 items-center gap-3 rounded-xl border border-ceda-line bg-white px-3 text-sm text-ceda-body"><input id={`innovation-type-${optionIndex}`} type="checkbox" name="innovationTypes" value={type} defaultChecked={Array.isArray(answerValues.innovation_types) && answerValues.innovation_types.includes(type)} className="h-5 w-5 accent-ceda-burgundy" />{type}</label>)}</div>{state.fieldErrors?.innovationTypes && <p className="mt-2 text-sm text-red-800">{state.fieldErrors.innovationTypes}</p>}</fieldset>
              {fields.filter((field) => field.sectionKey === "type_of_innovation").map((field) => <FieldControl key={field.key} field={field} value={answerValues[field.key]} active={active === index} error={state.fieldErrors?.[field.key]} />)}
            </>}

            {index === 5 && fields.filter((field) => field.sectionKey === "additional_information").map((field) => <FieldControl key={field.key} field={field} value={answerValues[field.key]} active={active === index} error={state.fieldErrors?.[field.key]} />)}
            {index === 5 && fields.every((field) => field.sectionKey !== "additional_information") && <p className="rounded-xl bg-[#FFF9F4] p-4 text-sm leading-6 text-ceda-muted">No additional details are required for this opportunity.</p>}

            {index === 6 && <>
              <div className="rounded-xl bg-[#FFF9F4] p-4 text-sm leading-6 text-ceda-body"><FileText aria-hidden="true" className="mb-2 h-5 w-5 text-ceda-burgundy" /><strong className="text-ceda-ink">Supporting material</strong><p className="mt-1">Add secure links to a pitch deck, prototype, research, or other supporting material. Do not include confidential personal information in public links.</p></div>
              {fields.filter((field) => field.sectionKey === "solution_documents").map((field) => <FieldControl key={field.key} field={field} value={answerValues[field.key]} active={active === index} error={state.fieldErrors?.[field.key]} />)}
              {fields.every((field) => field.sectionKey !== "solution_documents") && <p className="rounded-xl border border-dashed border-ceda-line p-5 text-sm leading-6 text-ceda-muted">No supporting document links are configured for this opportunity. An administrator can add document link fields in the opportunity form settings.</p>}
            </>}
          </div>
        </section>)}

        <footer className="flex flex-col gap-3 border-t border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:px-10">
          <button type="button" onClick={() => goToSection(Math.max(0, active - 1))} disabled={active === 0 || pending} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-ceda-line px-5 text-sm font-semibold text-ceda-body hover:bg-[#FFF9F4] disabled:cursor-not-allowed disabled:opacity-50"><ChevronLeft aria-hidden="true" className="h-4 w-4" />Back</button>
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={saveAndExit} disabled={pending} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold text-ceda-muted hover:bg-surface-muted disabled:opacity-50"><Save aria-hidden="true" className="h-4 w-4" />Save &amp; Exit</button>
            {active < sections.length - 1 ? <button type="button" onClick={continueToNext} disabled={pending} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-ceda-burgundy px-7 text-sm font-bold text-white hover:bg-[#5C150D] disabled:opacity-60">Continue <ChevronRight aria-hidden="true" className="h-4 w-4" /></button> : <button type="button" onClick={submitApplication} disabled={pending || categories.length === 0} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-ceda-burgundy px-7 text-sm font-bold text-white hover:bg-[#5C150D] disabled:opacity-60">{pending ? "Submitting…" : "Submit application"}<Check aria-hidden="true" className="h-4 w-4" /></button>}
          </div>
          <span className="text-center text-xs text-ceda-muted sm:min-w-24" role="status">{pending ? "Saving…" : savedMessage}</span>
        </footer>
      </form>
    </div>

    <aside className="rounded-3xl border border-ceda-line bg-white p-4 shadow-sm lg:sticky lg:top-24" aria-label="Application progress">
      <p className="px-3 pb-2 text-xs font-bold uppercase tracking-[0.14em] text-ceda-muted">Sections</p>
      <ol className="grid gap-1 sm:grid-cols-2 lg:grid-cols-1">{sections.map((section, index) => <li key={section.key}>
        <button type="button" onClick={() => goToSection(index)} aria-current={active === index ? "step" : undefined} className={`flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-sm transition ${active === index ? "bg-[#FFF1E4] font-semibold text-ceda-burgundy" : "text-ceda-muted hover:bg-surface-muted hover:text-ceda-ink"}`}>
          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${active === index ? "bg-ceda-burgundy text-white" : "bg-slate-100 text-slate-500"}`}>{index < active ? <Check aria-hidden="true" className="h-4 w-4" /> : index + 1}</span>
          <span className="min-w-0 truncate">{section.label}</span>
        </button>
      </li>)}</ol>
      <div className="mt-4 border-t border-slate-100 pt-4"><label htmlFor="application-progress" className="text-xs font-semibold text-ceda-muted">Progress: section {active + 1} of {sections.length}</label><progress id="application-progress" max={sections.length} value={active + 1} className="mt-2 block h-2 w-full accent-ceda-burgundy">{active + 1} of {sections.length}</progress></div>
    </aside>
  </div>;
}
