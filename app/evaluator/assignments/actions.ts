"use server";

import { and, asc, eq, gt, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { evaluationScores, evaluations, evaluatorAssignments, feedback, ideaStageHistory, ideas, workflowStages } from "@/db/schema";
import { requireRole } from "@/lib/authorization";
import { getEvaluatorAssignment } from "@/lib/server/evaluator-workspace";
import { writeAudit } from "@/lib/server/audit";
import { notifyIdeaFollowers } from "@/lib/server/idea-alerts";
import { insertInAppNotifications } from "@/lib/server/notifications";

export type EvaluationState = { error?: string; totalScore?: string };
export type InternalNoteState = { error?: string; success?: string };
const uuidPattern = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i;

export async function addEvaluatorInternalNote(_previous: InternalNoteState, formData: FormData): Promise<InternalNoteState> {
  const evaluator = await requireRole("evaluator", "/evaluator");
  const assignmentId = String(formData.get("assignmentId") ?? "");
  const versionId = String(formData.get("versionId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!uuidPattern.test(assignmentId)) return { error: "This assignment is unavailable." };
  const result = await getEvaluatorAssignment(assignmentId, evaluator.id);
  if (!result || result.assignment.currentVersionId !== versionId || result.assignment.status === "submitted") {
    return { error: "This review is no longer open for private notes." };
  }
  if (body.length < 3 || body.length > 5000) return { error: "Write between 3 and 5,000 characters." };

  await db.transaction(async (tx) => {
    await tx.insert(feedback).values({
      ideaId: result.assignment.ideaId,
      ideaVersionId: result.assignment.currentVersionId,
      stageId: result.assignment.stageId,
      authorId: evaluator.id,
      body,
      isInternal: true,
    });
    await writeAudit(tx, {
      actorId: evaluator.id,
      action: "evaluation.internal_note_added",
      entityType: "idea",
      entityId: result.assignment.ideaId,
      metadata: { versionId: result.assignment.currentVersionId, stageId: result.assignment.stageId },
    });
  });

  revalidatePath(`/evaluator/assignments/${assignmentId}`);
  return { success: "Private note saved for this review version." };
}

export async function submitEvaluation(_previous: EvaluationState, formData: FormData): Promise<EvaluationState> {
  const evaluator = await requireRole("evaluator", "/evaluator");
  const assignmentId = String(formData.get("assignmentId") ?? "");
  if (!uuidPattern.test(assignmentId)) return { error: "This assignment is unavailable." };
  const result = await getEvaluatorAssignment(assignmentId, evaluator.id);
  if (!result) return { error: "This assignment is unavailable." };
  if (result.assignment.status === "submitted") return { error: "This review has already been submitted." };
  if (String(formData.get("versionId") ?? "") !== result.assignment.currentVersionId) return { error: "The submission changed while you were reviewing it. Reload and review the latest version." };
  if (!result.criteria.length) return { error: "This stage has no active scoring criteria. Contact a portal administrator." };

  const scores: { criterionId: string; score: number; comment: string | null }[] = [];
  const fieldErrors: string[] = [];
  let weightedTotal = 0;
  let totalWeight = 0;
  for (const criterion of result.criteria) {
    const rawScore = formData.get(`score:${criterion.id}`);
    const score = typeof rawScore === "string" ? Number(rawScore) : Number.NaN;
    const commentValue = formData.get(`comment:${criterion.id}`);
    const comment = typeof commentValue === "string" ? commentValue.trim() : "";
    if (!Number.isFinite(score) || score < 0 || score > criterion.maxScore) {
      fieldErrors.push(`${criterion.name}: enter a score from 0 to ${criterion.maxScore}.`);
      continue;
    }
    if (comment.length > 2000) {
      fieldErrors.push(`${criterion.name}: keep comments under 2,000 characters.`);
      continue;
    }
    const weight = Number(criterion.weight);
    weightedTotal += (score / criterion.maxScore) * weight;
    totalWeight += weight;
    scores.push({ criterionId: criterion.id, score, comment: comment || null });
  }
  if (fieldErrors.length) return { error: fieldErrors.join(" ") };
  const overallCommentValue = formData.get("overallComment");
  const overallComment = typeof overallCommentValue === "string" ? overallCommentValue.trim() : "";
  if (overallComment.length > 5000) return { error: "Keep the overall review comment under 5,000 characters." };
  const totalScore = totalWeight ? (weightedTotal / totalWeight) * 100 : 0;
  const now = new Date();
  const { assignment } = result;

  await db.transaction(async (tx) => {
    const [savedEvaluation] = await tx.insert(evaluations).values({
      assignmentId: assignment.id,
      ideaVersionId: assignment.currentVersionId,
      overallComment: overallComment || null,
      totalScore: totalScore.toFixed(2),
      submittedAt: now,
    }).returning({ id: evaluations.id });
    if (!savedEvaluation) throw new Error("The evaluation could not be saved.");

    await tx.insert(evaluationScores).values(scores.map((score) => ({ ...score, evaluationId: savedEvaluation.id, score: score.score.toFixed(2) })));
    await tx.update(evaluatorAssignments).set({ status: "submitted" }).where(eq(evaluatorAssignments.id, assignment.id));

    const [idea] = await tx.select({ id: ideas.id, callId: ideas.callId, submitterId: ideas.submitterId, currentStageId: ideas.currentStageId })
      .from(ideas).where(eq(ideas.id, assignment.ideaId)).limit(1);
    if (!idea) throw new Error("The assigned submission no longer exists.");
    const remaining = await tx.select({ id: evaluatorAssignments.id }).from(evaluatorAssignments)
      .where(and(eq(evaluatorAssignments.ideaId, idea.id), eq(evaluatorAssignments.stageId, assignment.stageId), ne(evaluatorAssignments.status, "submitted")));

    if (!remaining.length && idea.currentStageId === assignment.stageId) {
      const [currentStage] = await tx.select({ position: workflowStages.position }).from(workflowStages)
        .where(eq(workflowStages.id, assignment.stageId)).limit(1);
      if (currentStage) {
        const [nextStage] = await tx.select({ id: workflowStages.id, name: workflowStages.name }).from(workflowStages)
          .where(and(eq(workflowStages.callId, idea.callId), gt(workflowStages.position, currentStage.position)))
          .orderBy(asc(workflowStages.position)).limit(1);
        if (nextStage) {
          await tx.update(ideas).set({ currentStageId: nextStage.id }).where(eq(ideas.id, idea.id));
          await tx.insert(ideaStageHistory).values({
            ideaId: idea.id,
            fromStageId: assignment.stageId,
            toStageId: nextStage.id,
            toStatus: "in_review",
            actorId: evaluator.id,
            note: `Evaluation completed. Moved to ${nextStage.name}.`,
          });
          await insertInAppNotifications(tx, [{
            userId: idea.submitterId,
            ideaId: idea.id,
            type: "status_changed",
            title: "Review stage completed",
            body: `Your submission ${assignment.referenceNo} has moved to ${nextStage.name}.`,
          }]);
          await notifyIdeaFollowers(tx, {
            ideaId: idea.id,
            actorId: evaluator.id,
            excludeUserIds: [idea.submitterId],
            type: "status_changed",
            title: "Review stage completed",
            body: `Submission ${assignment.referenceNo} has moved to ${nextStage.name}.`,
          });
        }
      }
    }

    await insertInAppNotifications(tx, [{
      userId: idea.submitterId,
      ideaId: idea.id,
      type: "evaluation_completed",
      title: "An evaluator completed a review",
      body: `A review has been completed for submission ${assignment.referenceNo}.`,
    }]);
    await writeAudit(tx, {
      actorId: evaluator.id,
      action: "evaluation.submitted",
      entityType: "evaluation",
      entityId: savedEvaluation.id,
      metadata: { ideaId: idea.id, versionId: assignment.currentVersionId, stageId: assignment.stageId, scoreCount: scores.length, totalScore: totalScore.toFixed(2) },
    });
  });

  revalidatePath("/evaluator");
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/submissions/${assignment.ideaId}`);
  return { totalScore: totalScore.toFixed(2) };
}
