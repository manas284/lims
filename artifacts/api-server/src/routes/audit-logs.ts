import { Router } from "express";
import { db, auditLogsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { ListAuditLogsQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  const query = ListAuditLogsQueryParams.parse(req.query);
  let conditions: any[] = [];
  if (query.userId) conditions.push(eq(auditLogsTable.userId, query.userId));
  if (query.action) conditions.push(eq(auditLogsTable.action, query.action));
  const limit = query.limit ?? 100;
  const logs = await db.select().from(auditLogsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(auditLogsTable.timestamp))
    .limit(limit);
  res.json(logs);
});

export default router;
