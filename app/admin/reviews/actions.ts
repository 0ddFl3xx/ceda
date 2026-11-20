"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { evaluatorAssignments, ideaStageHistory, ideas, roles, user, userRoles, workflowStages } from "@/db/schema";
import { requireRole } from "@/lib/authorization";
import { writeAudit } from "@/lib/server/audit";
import { notifyIdeaFollowers } from "@/lib/server/idea-alerts";
import { insertInAppNotifications } from "@/lib/server/notifications";

const uuidPattern = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i;

export async function assignEvaluator(formData: FormData) {
  const admin = await requireRole("admin", "/admin/reviews");
  const ideaId = String(formData.get("ideaId") ?? "");
  const stageId = String(formData.get("stageId") ?? "");
  const evaluatorId = String(formData.get("evaluatorId") ?? "");
  if (!uuidPattern.test(ideaId) || !uuidPattern.test(stageId) || !evaluatorId || evaluatorId.length > 255) redirect("/admin/reviews?error=invalid");

  const [idea] = await db.select({ id: ideas.id, referenceNo: ideas.referenceNo, callId: ideas.callId, submitterId: ideas.submitterId, currentStageId: ideas.currentStageId, status: ideas.status })
    .from(ideas).where(eq(ideas.id, ideaId)).limit(1);
  if (!idea) redirect("/admin/reviews?error=invalid");
  const [stage] = await db.select({ id: workflowStages.id, name: workflowStages.name, type: workflowStages.type })
    .from(workflowStages).where(and(eq(workflowStages.id, stageId), eq(workflowStages.callId, idea.callId))).limit(1);
  const [currentStage] = idea.currentStageId
    ? await db.select({ type: workflowStages.type }).from(workflowStages).where(eq(workflowStages.id, idea.currentStageId)).limit(1)
    : [];
  const [firstEvaluationStage] = await db.select({ id: workflowStages.id }).from(workflowStages)
    .where(and(eq(workflowStages.callId, idea.callId), eq(workflowStages.type, "evaluation")))
    .orderBy(workflowStages.position).limit(1);
  const isInitialEvaluation = Boolean(firstEvaluationStage && currentStage && ["intake", "screening"].includes(currentStage.type) && stage?.id === firstEvaluationStage.id);
  const [evaluator] = await db.select({ id: user.id, name: user.name })
    .from(user).innerJoin(userRoles, eq(userRoles.userId, user.id)).innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(and(eq(user.id, evaluatorId), eq(roles.key, "evaluator"))).limit(1);
  if (!stage || stage.type !== "evaluation" || !evaluator || evaluator.id === idea.submitterId || (stage.id !== idea.currentStageId && !isInitialEvaluation)) redirect("/admin/reviews?error=invalid");

  const [existing] = await db.select({ id: evaluatorAssignments.id }).from(evaluatorAssignments)
    .where(and(eq(evaluatorAssignments.ideaId, idea.id), eq(evaluatorAssignments.stageId, stage.id), eq(evaluatorAssignments.evaluatorId, evaluator.id))).limit(1);
  if (existing) redirect("/admin/reviews?notice=exists");

  await db.transaction(async (tx) => {
    const [created] = await tx.insert(evaluatorAssignments).values({ ideaId: idea.id, stageId: stage.id, evaluatorId: evaluator.id, assignedBy: admin.id })
      .onConflictDoNothing().returning({ id: evaluatorAssignments.id });
    if (!created) return;
    if (idea.currentStageId !== stage.id || idea.status !== "in_review") {
      await tx.update(ideas).set({ currentStageId: stage.id, status: "in_review" }).where(eq(ideas.id, idea.id));
      await tx.insert(ideaStageHistory).values({
        ideaId: idea.id,
        fromStageId: idea.currentStageId,
        toStageId: stage.id,
        toStatus: "in_review",
        actorId: admin.id,
        note: `Assigned to ${stage.name}.`,
      });
      await insertInAppNotifications(tx, [{
        userId: idea.submitterId,
        ideaId: idea.id,
        type: "status_changed",
        title: "Your idea is in review",
        body: `Your submission ${idea.referenceNo} has moved to ${stage.name}.`,
      }]);
      await notifyIdeaFollowers(tx, {
        ideaId: idea.id,
        actorId: admin.id,
        excludeUserIds: [idea.submitterId],
        type: "status_changed",
        title: "Idea moved into evaluation",
        body: `Submission ${idea.referenceNo} has moved to ${stage.name}.`,
      });
    }
    await insertInAppNotifications(tx, [{
      userId: evaluator.id,
      ideaId: idea.id,
      type: "evaluation_assigned",
      title: "Evaluation assigned",
      body: `You have been assigned to review submission ${idea.referenceNo}.`,
    }]);
    await writeAudit(tx, {
      actorId: admin.id,
      action: "evaluation.assigned",
      entityType: "idea",
      entityId: idea.id,
      metadata: { stageId: stage.id, evaluatorId: evaluator.id },
    });
  });
  revalidatePath("/admin/reviews");
  revalidatePath("/evaluator");
}
