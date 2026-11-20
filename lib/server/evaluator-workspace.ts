import "server-only";

import { and, asc, eq, or } from "drizzle-orm";
import { db } from "@/db";
import { criteria, evaluatorAssignments, feedback, ideaVersions, ideas, innovationCalls, user, workflowStages } from "@/db/schema";

export async function getEvaluatorAssignments(evaluatorId: string) {
  return db.select({
    id: evaluatorAssignments.id,
    status: evaluatorAssignments.status,
    dueAt: evaluatorAssignments.dueAt,
    ideaId: ideas.id,
    referenceNo: ideas.referenceNo,
    ideaStatus: ideas.status,
    title: ideaVersions.title,
    summary: ideaVersions.summary,
    callTitle: innovationCalls.title,
    stageName: workflowStages.name,
  })
    .from(evaluatorAssignments)
    .innerJoin(ideas, eq(evaluatorAssignments.ideaId, ideas.id))
    .innerJoin(ideaVersions, eq(ideas.currentVersionId, ideaVersions.id))
    .innerJoin(innovationCalls, eq(ideas.callId, innovationCalls.id))
    .innerJoin(workflowStages, eq(evaluatorAssignments.stageId, workflowStages.id))
    .where(and(
      eq(evaluatorAssignments.evaluatorId, evaluatorId),
      or(eq(ideas.currentStageId, evaluatorAssignments.stageId), eq(evaluatorAssignments.status, "submitted")),
    ))
    .orderBy(asc(evaluatorAssignments.status), asc(evaluatorAssignments.dueAt));
}

export async function getEvaluatorAssignment(assignmentId: string, evaluatorId: string) {
  const [assignment] = await db.select({
    id: evaluatorAssignments.id,
    status: evaluatorAssignments.status,
    ideaId: ideas.id,
    referenceNo: ideas.referenceNo,
    ideaStatus: ideas.status,
    currentVersionId: ideaVersions.id,
    title: ideaVersions.title,
    summary: ideaVersions.summary,
    answers: ideaVersions.answers,
    callTitle: innovationCalls.title,
    stageId: workflowStages.id,
    stageName: workflowStages.name,
  })
    .from(evaluatorAssignments)
    .innerJoin(ideas, eq(evaluatorAssignments.ideaId, ideas.id))
    .innerJoin(ideaVersions, eq(ideas.currentVersionId, ideaVersions.id))
    .innerJoin(innovationCalls, eq(ideas.callId, innovationCalls.id))
    .innerJoin(workflowStages, eq(evaluatorAssignments.stageId, workflowStages.id))
    .where(and(
      eq(evaluatorAssignments.id, assignmentId),
      eq(evaluatorAssignments.evaluatorId, evaluatorId),
      eq(ideas.currentStageId, evaluatorAssignments.stageId),
      eq(ideas.status, "in_review"),
    ))
    .limit(1);
  if (!assignment) return null;

  const scoringCriteria = await db.select({
    id: criteria.id,
    name: criteria.name,
    description: criteria.description,
    maxScore: criteria.maxScore,
    weight: criteria.weight,
  })
    .from(criteria)
    .where(and(eq(criteria.stageId, assignment.stageId), eq(criteria.isArchived, false)))
    .orderBy(asc(criteria.position));

  const internalNotes = await db.select({ id: feedback.id, body: feedback.body, authorName: user.name, createdAt: feedback.createdAt })
    .from(feedback)
    .innerJoin(user, eq(feedback.authorId, user.id))
    .where(and(
      eq(feedback.ideaId, assignment.ideaId),
      eq(feedback.ideaVersionId, assignment.currentVersionId),
      eq(feedback.stageId, assignment.stageId),
      eq(feedback.isInternal, true),
    ))
    .orderBy(asc(feedback.createdAt));

  return { assignment, criteria: scoringCriteria, internalNotes };
}
