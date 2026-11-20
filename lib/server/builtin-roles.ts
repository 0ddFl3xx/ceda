import { eq } from "drizzle-orm";
import { db } from "../../db";
import { rolePermissions, roles } from "../../db/schema";
import { builtinRoles } from "../../db/role-data";

type DatabaseTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export async function ensureBuiltinRoles(tx: DatabaseTransaction) {
  for (const roleDefinition of builtinRoles) {
    await tx.insert(roles).values({
      key: roleDefinition.key,
      name: roleDefinition.name,
      description: roleDefinition.description,
      isSystem: true,
    }).onConflictDoNothing({ target: roles.key });

    const [role] = await tx.select({ id: roles.id })
      .from(roles)
      .where(eq(roles.key, roleDefinition.key))
      .limit(1);
    if (!role) throw new Error(`Unable to ensure built-in role ${roleDefinition.key}.`);

    for (const permission of roleDefinition.permissions) {
      await tx.insert(rolePermissions).values({ roleId: role.id, permission }).onConflictDoNothing();
    }
  }
}
