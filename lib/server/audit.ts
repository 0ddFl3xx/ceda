import { auditLogs } from "@/db/schema";
import { db } from "@/db";

export type DatabaseTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export type AuditInput = {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export async function writeAudit(tx: DatabaseTransaction, input: AuditInput) {
  await tx.insert(auditLogs).values({
    actorId: input.actorId ?? null,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId ?? null,
    metadata: input.metadata,
    ipAddress: input.ipAddress ?? null,
    userAgent: input.userAgent ?? null,
  });
}

export async function writeAuditEvent(input: AuditInput) {
  await db.transaction((tx) => writeAudit(tx, input));
}
