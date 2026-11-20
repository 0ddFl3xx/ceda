import "server-only";

import { and, asc, desc, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { ideaSubscriptions, ideaVersions, ideas, innovationCalls, workflowStages } from "@/db/schema";

export async function getCommitteeIdeas(userId: string) {
  return db.select({
    id: ideas.id,
    referenceNo: ideas.referenceNo,
    title: ideaVersions.title,
    callTitle: innovationCalls.title,
    status: ideas.status,
    stageName: workflowStages.name,
    submittedAt: ideas.submittedAt,
    followed: ideaSubscriptions.userId,
  })
    .from(ideas)
    .innerJoin(ideaVersions, eq(ideas.currentVersionId, ideaVersions.id))
    .innerJoin(innovationCalls, eq(ideas.callId, innovationCalls.id))
    .leftJoin(workflowStages, eq(ideas.currentStageId, workflowStages.id))
    .leftJoin(ideaSubscriptions, and(
      eq(ideaSubscriptions.ideaId, ideas.id),
      eq(ideaSubscriptions.userId, userId),
    ))
    .where(and(ne(ideas.status, "draft"), ne(ideas.status, "withdrawn")))
    .orderBy(desc(ideas.submittedAt), asc(ideas.referenceNo));
}
