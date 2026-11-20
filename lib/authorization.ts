import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { roles, userRoles } from "@/db/schema";

export type PortalRole = "submitter" | "evaluator" | "adjudicator" | "admin" | "consultant" | "committee_member";

export async function requireUser(returnTo = "/dashboard") {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  return session.user;
}

export async function getUserRoles(userId: string): Promise<PortalRole[]> {
  const rows = await db.select({ key: roles.key })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.userId, userId));
  return rows.map((row) => row.key as PortalRole);
}

export async function requireRole(requiredRole: PortalRole, returnTo: string) {
  const user = await requireUser(returnTo);
  const roles = await getUserRoles(user.id);

  if (!roles.includes(requiredRole)) redirect("/forbidden");
  return user;
}
