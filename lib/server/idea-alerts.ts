import { eq } from "drizzle-orm";
import { ideaSubscriptions } from "@/db/schema";
import type { DatabaseTransaction } from "@/lib/server/audit";
import { insertInAppNotifications } from "@/lib/server/notifications";

export async function notifyIdeaFollowers(
  tx: DatabaseTransaction,
  input: { ideaId: string; actorId: string; excludeUserIds?: string[]; type: string; title: string; body: string },
) {
  const followers = await tx.select({ userId: ideaSubscriptions.userId })
    .from(ideaSubscriptions)
    .where(eq(ideaSubscriptions.ideaId, input.ideaId));
  const excluded = new Set([input.actorId, ...(input.excludeUserIds ?? [])]);
  const recipients = followers.filter(({ userId }) => !excluded.has(userId));
  if (!recipients.length) return;

  await insertInAppNotifications(tx, recipients.map(({ userId }) => ({
    userId,
    ideaId: input.ideaId,
    type: input.type,
    title: input.title,
    body: input.body,
  })));
}
