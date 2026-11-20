import { and, eq, inArray } from "drizzle-orm";
import { notificationPreferences, notifications } from "@/db/schema";
import type { DatabaseTransaction } from "@/lib/server/audit";

type InAppNotification = typeof notifications.$inferInsert;

export async function insertInAppNotifications(tx: DatabaseTransaction, events: InAppNotification[]) {
  if (!events.length) return;

  const userIds = [...new Set(events.map(({ userId }) => userId))];
  const preferences = await tx.select({ userId: notificationPreferences.userId, enabled: notificationPreferences.enabled })
    .from(notificationPreferences)
    .where(and(eq(notificationPreferences.channel, "in_app"), inArray(notificationPreferences.userId, userIds)));
  const disabled = new Set(preferences.filter(({ enabled }) => !enabled).map(({ userId }) => userId));
  const enabledEvents = events.filter(({ userId }) => !disabled.has(userId));
  if (enabledEvents.length) await tx.insert(notifications).values(enabledEvents);
}
