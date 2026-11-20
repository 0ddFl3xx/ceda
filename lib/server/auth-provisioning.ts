import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { roles, user, userProfiles, userRoles } from "@/db/schema";
import { writeAudit } from "@/lib/server/audit";
import { ensureBuiltinRoles } from "@/lib/server/builtin-roles";

export async function provisionSubmitter(input: {
  userId: string;
  consentedAt: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<boolean> {
  return db.transaction(async (tx) => {
    // Fail closed before writing profile/role rows if Better Auth's account
    // isn't visible in this application's database connection.
    const [account] = await tx.select({ id: user.id }).from(user).where(eq(user.id, input.userId)).limit(1);
    if (!account) return false;

    await ensureBuiltinRoles(tx);
    const [role] = await tx.select({ id: roles.id }).from(roles).where(eq(roles.key, "submitter")).limit(1);
    if (!role) throw new Error("The submitter role could not be initialized.");

    await tx.insert(userProfiles).values({ userId: input.userId, dataConsentAt: input.consentedAt }).onConflictDoUpdate({
      target: userProfiles.userId,
      set: { dataConsentAt: input.consentedAt },
    });
    const [existingAssignment] = await tx.select({ userId: userRoles.userId })
      .from(userRoles)
      .where(and(eq(userRoles.userId, input.userId), eq(userRoles.roleId, role.id)))
      .limit(1);
    if (existingAssignment) return true;

    await tx.insert(userRoles).values({ userId: input.userId, roleId: role.id }).onConflictDoNothing();
    await writeAudit(tx, {
      actorId: input.userId,
      action: "account.registered",
      entityType: "user",
      entityId: input.userId,
      metadata: { role: "submitter", dataConsentRecorded: true },
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    });
    return true;
  });
}
