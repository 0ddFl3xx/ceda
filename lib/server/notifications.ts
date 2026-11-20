import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { notificationPreferences, notifications, roles, user, userRoles } from "@/db/schema";
import type { DatabaseTransaction } from "@/lib/server/audit";
import { sendNotificationEmail } from "@/lib/server/mailer";

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

export async function getUsersWithRole(tx: DatabaseTransaction, roleKey: string) {
  return tx.select({ id: user.id, email: user.email }).from(user)
    .innerJoin(userRoles, eq(userRoles.userId, user.id)).innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(roles.key, roleKey));
}

export async function dispatchNotificationEmails(events: InAppNotification[]) {
  if (!events.length) return;
  const userIds = [...new Set(events.map(({ userId }) => userId))];
  const [recipients, preferences] = await Promise.all([
    db.select({ id: user.id, email: user.email, verified: user.emailVerified }).from(user).where(inArray(user.id, userIds)),
    db.select({ userId: notificationPreferences.userId, enabled: notificationPreferences.enabled })
      .from(notificationPreferences).where(and(eq(notificationPreferences.channel, "email"), inArray(notificationPreferences.userId, userIds))),
  ]);
  const recipientById = new Map(recipients.map((recipient) => [recipient.id, recipient]));
  const preferenceById = new Map(preferences.map((preference) => [preference.userId, preference.enabled]));
  await Promise.all(events.map(async (event) => {
    const recipient = recipientById.get(event.userId);
    if (!recipient?.verified || preferenceById.get(event.userId) === false || !event.title) return;
    try { await sendNotificationEmail(recipient.email, event.title, event.body ?? "You have a new CEDA Innovation Portal update."); }
    catch (error) { console.error("Notification email could not be delivered.", error); }
  }));
}
