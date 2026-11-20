import Link from "next/link";
import { Suspense } from "react";
import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { evaluatorAssignments, ideaVersions, ideas, innovationCalls, roles, user, userRoles, workflowStages } from "@/db/schema";
import { PageStub } from "@/components/PageStub";
import { requireRole } from "@/lib/authorization";
import { assignEvaluator } from "@/app/admin/reviews/actions";

const selectClass = "min-h-10 rounded-lg border border-[#9A8175] bg-white px-3 text-sm text-ceda-ink";

export default function AdminReviewsPage({ searchParams }: PageProps<"/admin/reviews">) {
  return <Suspense fallback={<PageStub title="Review assignments" description="Checking administrator access…" />}><ReviewAssignmentContent searchParams={searchParams} /></Suspense>;
}

async function ReviewAssignmentContent({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  await requireRole("admin", "/admin/reviews");
  const query = await searchParams;
  const [submissions, stages, evaluators, assignmentRows] = await Promise.all([
    db.select({ id: ideas.id, referenceNo: ideas.referenceNo, status: ideas.status, submitterId: ideas.submitterId, callId: ideas.callId, currentStageId: ideas.currentStageId, callTitle: innovationCalls.title, title: ideaVersions.title })
      .from(ideas).innerJoin(innovationCalls, eq(ideas.callId, innovationCalls.id))
      .leftJoin(ideaVersions, eq(ideas.currentVersionId, ideaVersions.id))
      .where(inArray(ideas.status, ["submitted", "in_review", "changes_requested"]))
      .orderBy(desc(ideas.submittedAt)).limit(200),
    db.select({ id: workflowStages.id, callId: workflowStages.callId, name: workflowStages.name, position: workflowStages.position })
      .from(workflowStages).where(eq(workflowStages.type, "evaluation")).orderBy(workflowStages.position),
    db.select({ id: user.id, name: user.name }).from(user)
      .innerJoin(userRoles, eq(userRoles.userId, user.id)).innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(roles.key, "evaluator")).orderBy(user.name),
    db.select({ ideaId: evaluatorAssignments.ideaId, stageId: evaluatorAssignments.stageId, evaluatorName: user.name, status: evaluatorAssignments.status })
      .from(evaluatorAssignments).innerJoin(user, eq(evaluatorAssignments.evaluatorId, user.id)),
  ]);
  const assignmentsByIdea = new Map<string, typeof assignmentRows>();
  for (const row of assignmentRows) assignmentsByIdea.set(row.ideaId, [...(assignmentsByIdea.get(row.ideaId) ?? []), row]);
  const notice = query.notice === "exists" ? "That evaluator is already assigned to this stage." : query.error ? "Choose a submission, evaluation stage, and eligible evaluator." : "";

  return <main id="main-content" className="flex-1 bg-white px-4 py-10 sm:px-6 sm:py-14"><div className="mx-auto max-w-[1100px]">
    <Link href="/admin" className="text-sm font-semibold text-ceda-burgundy underline underline-offset-4">← Back to administration</Link>
    <header className="mt-5"><p className="text-xs font-bold uppercase tracking-[0.18em] text-ceda-burgundy">Evaluation setup</p><h1 className="mt-2 text-3xl font-bold text-ceda-ink">Review assignments</h1><p className="mt-2 text-sm text-ceda-muted">Assign each submission to an evaluator at an evaluation stage.</p></header>
    {notice && <p className="mt-5 rounded-xl border border-ceda-line bg-[#FFF9F4] p-4 text-sm text-ceda-body" role="status">{notice}</p>}
    {!evaluators.length && <p className="mt-5 rounded-xl border border-amber-700/30 bg-amber-50 p-4 text-sm text-amber-950">No evaluator accounts are assigned yet. Add evaluator roles in user administration first.</p>}
    <div className="mt-7 space-y-4">{submissions.map((idea) => {
      const callStages = stages.filter((stage) => stage.callId === idea.callId);
      const firstEvaluation = callStages[0];
      const availableStages = callStages.filter((stage) => stage.id === idea.currentStageId || (idea.status === "submitted" && stage.id === firstEvaluation?.id));
      const currentAssignments = assignmentsByIdea.get(idea.id) ?? [];
      const assignedStageIds = new Set(currentAssignments.map((item) => item.stageId));
      return <article key={idea.id} className="rounded-2xl border border-ceda-line bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><p className="text-xs font-bold uppercase tracking-wide text-ceda-burgundy">{idea.referenceNo} · {idea.status.replaceAll("_", " ")}</p><h2 id={`submission-${idea.id}`} className="mt-2 text-xl font-bold text-ceda-ink">{idea.title ?? "Untitled idea"}</h2><p className="mt-1 text-sm text-ceda-muted">{idea.callTitle}</p><ul className="mt-3 space-y-1 text-xs text-ceda-body">{currentAssignments.map((assignment, index) => <li key={`${assignment.stageId}-${index}`}>{assignment.evaluatorName} · {assignment.status.replaceAll("_", " ")}</li>)}</ul></div>
        {availableStages.length > 0 && evaluators.length > 0 && <form action={assignEvaluator} aria-labelledby={`submission-${idea.id}`} className="flex flex-wrap items-end gap-2"><input type="hidden" name="ideaId" value={idea.id} /><div><label htmlFor={`stage-${idea.id}`} className="block text-xs font-semibold text-ceda-ink">Stage</label><select id={`stage-${idea.id}`} name="stageId" required defaultValue="" className={selectClass}><option value="" disabled>Select stage</option>{availableStages.map((stage) => <option key={stage.id} value={stage.id}>{stage.name}{assignedStageIds.has(stage.id) ? " (has assignments)" : ""}</option>)}</select></div><div><label htmlFor={`evaluator-${idea.id}`} className="block text-xs font-semibold text-ceda-ink">Evaluator</label><select id={`evaluator-${idea.id}`} name="evaluatorId" required defaultValue="" className={selectClass}><option value="" disabled>Select evaluator</option>{evaluators.filter((evaluator) => evaluator.id !== idea.submitterId).map((evaluator) => <option key={evaluator.id} value={evaluator.id}>{evaluator.name}</option>)}</select></div><button type="submit" className="min-h-10 rounded-full bg-ceda-burgundy px-4 text-sm font-bold text-white hover:bg-[#5C150D]">Assign</button></form>}
      </div></article>;
    })}</div>
    {!submissions.length && <p className="mt-7 rounded-2xl bg-[#FFF9F4] p-6 text-sm text-ceda-muted">No submissions are ready for evaluation.</p>}
  </div></main>;
}
