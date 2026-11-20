"use server";

import { randomUUID } from "node:crypto";
import { and, asc, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { categories, evaluatorAssignments, feedback, formFields, ideaStageHistory, ideas, ideaVersions, workflowStages } from "@/db/schema";
import { requireRole } from "@/lib/authorization";
import { writeAudit } from "@/lib/server/audit";
import { notifyIdeaFollowers } from "@/lib/server/idea-alerts";
import { insertInAppNotifications } from "@/lib/server/notifications";
import { validateDynamicAnswers } from "@/lib/server/submission-validation";
import type { SubmissionState } from "@/app/submit/actions";

const uuidPattern = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i;

export async function resubmitIdeaAction(_previous: SubmissionState, formData: FormData): Promise<SubmissionState> {
  const submitter = await requireRole("submitter", "/dashboard");
  const ideaId = String(formData.get("ideaId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "");
  const responseText = String(formData.get("response") ?? "").trim();
  if (!uuidPattern.test(ideaId)) return { error: "This submission is unavailable." };

  const [idea] = await db.select({
    id: ideas.id,
    referenceNo: ideas.referenceNo,
    callId: ideas.callId,
    categoryId: ideas.categoryId,
    currentStageId: ideas.currentStageId,
    currentVersionId: ideas.currentVersionId,
    status: ideas.status,
  }).from(ideas).where(and(eq(ideas.id, ideaId), eq(ideas.submitterId, submitter.id))).limit(1);
  if (!idea || idea.status !== "changes_requested") return { error: "This submission is not waiting for changes." };

  const fieldErrors: Record<string, string> = {};
  if (title.length < 5 || title.length > 255) fieldErrors.title = "Use between 5 and 255 characters.";
  if (summary.length < 30 || summary.length > 5000) fieldErrors.summary = "Use between 30 and 5,000 characters.";
  if (responseText.length < 20 || responseText.length > 5000) fieldErrors.response = "Explain how you addressed the feedback (20–5,000 characters).";

  const [fieldDefinitions, stageRows, categoryRows, lastVersion] = await Promise.all([
    db.select({ key: formFields.key, label: formFields.label, type: formFields.type, required: formFields.required, options: formFields.options })
      .from(formFields).where(and(eq(formFields.callId, idea.callId), eq(formFields.isActive, true))).orderBy(asc(formFields.position)),
    db.select({ id: workflowStages.id, name: workflowStages.name }).from(workflowStages)
      .where(and(eq(workflowStages.callId, idea.callId), eq(workflowStages.type, "evaluation"))).orderBy(asc(workflowStages.position)).limit(1),
    uuidPattern.test(categoryId)
      ? db.select({ id: categories.id }).from(categories).where(and(eq(categories.id, categoryId), eq(categories.isActive, true))).limit(1)
      : Promise.resolve([]),
    db.select({ versionNo: ideaVersions.versionNo }).from(ideaVersions)
      .where(eq(ideaVersions.ideaId, idea.id)).orderBy(desc(ideaVersions.versionNo)).limit(1),
  ]);
  if (!stageRows[0]) return { error: "This opportunity has no evaluation stage configured. Contact CEDA for help." };
  if (!categoryRows[0]) fieldErrors.categoryId = "Choose a valid category.";
  const { answers, fieldErrors: answerErrors } = validateDynamicAnswers(formData, fieldDefinitions);
  Object.assign(fieldErrors, answerErrors);
  if (Object.keys(fieldErrors).length) return { error: "Review the highlighted fields and try again.", fieldErrors };

  const now = new Date();
  const versionNo = (lastVersion[0]?.versionNo ?? 0) + 1;
  const versionId = randomUUID();
  const stage = stageRows[0];
  await db.transaction(async (tx) => {
    const [latestFeedback] = await tx.select({ id: feedback.id }).from(feedback)
      .where(and(eq(feedback.ideaId, idea.id), eq(feedback.isInternal, false), eq(feedback.requiresResponse, true)))
      .orderBy(desc(feedback.createdAt)).limit(1);
    if (latestFeedback) await tx.update(feedback).set({ requiresResponse: false }).where(eq(feedback.id, latestFeedback.id));
    await tx.insert(feedback).values({
      ideaId: idea.id,
      ideaVersionId: idea.currentVersionId,
      stageId: idea.currentStageId,
      authorId: submitter.id,
      parentId: latestFeedback?.id ?? null,
      body: responseText,
      isInternal: false,
    });
    await tx.insert(ideaVersions).values({
      id: versionId,
      ideaId: idea.id,
      versionNo,
      title,
      summary,
      answers,
      createdBy: submitter.id,
      submittedAt: now,
    });
    await tx.update(ideas).set({
      currentVersionId: versionId,
      currentStageId: stage.id,
      categoryId,
      status: "in_review",
      submittedAt: now,
    }).where(eq(ideas.id, idea.id));
    await tx.insert(ideaStageHistory).values({
      ideaId: idea.id,
      fromStageId: idea.currentStageId,
      toStageId: stage.id,
      toStatus: "in_review",
      actorId: submitter.id,
      note: `Resubmitted as version ${versionNo} after requested changes.`,
    });

    const existingAssignments = await tx.select({ id: evaluatorAssignments.id, evaluatorId: evaluatorAssignments.evaluatorId })
      .from(evaluatorAssignments).innerJoin(workflowStages, eq(evaluatorAssignments.stageId, workflowStages.id))
      .where(and(eq(evaluatorAssignments.ideaId, idea.id), eq(workflowStages.callId, idea.callId), eq(workflowStages.type, "evaluation")));
    if (existingAssignments.length) {
      for (const assignment of existingAssignments) {
        await tx.update(evaluatorAssignments).set({ status: "pending" }).where(eq(evaluatorAssignments.id, assignment.id));
        await insertInAppNotifications(tx, [{
          userId: assignment.evaluatorId,
          ideaId: idea.id,
          type: "evaluation_assigned",
          title: "Resubmission ready for review",
          body: `Submission ${idea.referenceNo} has a new version (${versionNo}) for your review.`,
        }]);
      }
    }
    await insertInAppNotifications(tx, [{
      userId: submitter.id,
      ideaId: idea.id,
      type: "idea_resubmitted",
      title: "Updated submission received",
      body: `Version ${versionNo} of ${idea.referenceNo} has been submitted for review.`,
    }]);
    await notifyIdeaFollowers(tx, {
      ideaId: idea.id,
      actorId: submitter.id,
      type: "idea_resubmitted",
      title: "A followed idea was resubmitted",
      body: `Submission ${idea.referenceNo} has a new version (${versionNo}) for review.`,
    });
    await writeAudit(tx, {
      actorId: submitter.id,
      action: "idea.resubmitted",
      entityType: "idea",
      entityId: idea.id,
      metadata: { referenceNo: idea.referenceNo, versionNo, previousVersionId: idea.currentVersionId, versionId },
    });
  });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/submissions/${idea.id}`);
  revalidatePath("/evaluator");
  return { referenceNo: idea.referenceNo };
}
