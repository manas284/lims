import { db, auditLogsTable } from "@workspace/db";

interface AuditParams {
  userId?: number;
  action: string;
  entityType: string;
  entityId?: number;
  oldValue?: string;
  newValue?: string;
}

export async function logAudit(params: AuditParams) {
  try {
    await db.insert(auditLogsTable).values({
      userId: params.userId ?? null,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId ?? null,
      oldValue: params.oldValue ?? null,
      newValue: params.newValue ?? null,
    });
  } catch (err) {
    console.error("Failed to log audit:", err);
  }
}

export function generateBarcode(id: number): string {
  return `SAMPLE-${String(id).padStart(5, "0")}`;
}
