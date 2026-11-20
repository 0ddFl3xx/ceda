import { config } from "dotenv";
config({ path: ".env.local" });

async function bootstrapAdmin() {
  const email = process.env.CEDA_BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  if (!email) throw new Error("Set CEDA_BOOTSTRAP_ADMIN_EMAIL in .env.local to the verified account that should receive initial administrator access.");

  const [{ db }, { and, eq }, { roles, user, userRoles }, { ensureBuiltinRoles }, { writeAudit }] = await Promise.all([
    import("./index"),
    import("drizzle-orm"),
    import("./schema"),
    import("../lib/server/builtin-roles"),
    import("../lib/server/audit"),
  ]);

  try {
    await db.transaction(async (tx) => {
      await ensureBuiltinRoles(tx);
      const [account] = await tx.select({ id: user.id, emailVerified: user.emailVerified }).from(user).where(eq(user.email, email)).limit(1);
      if (!account) throw new Error("No account matches CEDA_BOOTSTRAP_ADMIN_EMAIL. Create and verify that account first.");
      if (!account.emailVerified) throw new Error("Verify the account email before granting administrator access.");
      const [adminRole] = await tx.select({ id: roles.id }).from(roles).where(eq(roles.key, "admin")).limit(1);
      if (!adminRole) throw new Error("The built-in administrator role could not be initialized.");

      const [existingAdmin] = await tx.select({ roleId: userRoles.roleId }).from(userRoles)
        .where(and(eq(userRoles.userId, account.id), eq(userRoles.roleId, adminRole.id))).limit(1);
      if (existingAdmin) return;
      const [priorRole] = await tx.select({ userId: userRoles.userId }).from(userRoles)
        .where(eq(userRoles.userId, account.id)).limit(1);
      await tx.insert(userRoles).values({ userId: account.id, roleId: adminRole.id, assignedBy: account.id }).onConflictDoNothing();
      await writeAudit(tx, {
        actorId: account.id,
        action: "role.bootstrap_assigned",
        entityType: "user",
        entityId: account.id,
        metadata: { role: "admin", initialBootstrap: true, hadPriorRole: Boolean(priorRole) },
      });
    });
    console.info("Initial administrator role is ready for the configured verified account.");
  } finally {
    await db.$client.end();
  }
}

bootstrapAdmin().catch((error: unknown) => {
  console.error("Administrator bootstrap failed.", error instanceof Error ? error.message : "Unknown error");
  process.exitCode = 1;
});
