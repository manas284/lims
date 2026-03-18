import { Router } from "express";
import { db, samplesTable, testsTable, inventoryTable, workflowsTable, auditLogsTable } from "@workspace/db";
import { eq, lte, count, desc, not } from "drizzle-orm";

const router = Router();

router.get("/stats", async (_req, res) => {
  const [totalSamplesResult] = await db.select({ count: count() }).from(samplesTable);
  const [activeSamplesResult] = await db.select({ count: count() }).from(samplesTable)
    .where(not(eq(samplesTable.status, "approved")));
  const [pendingTestsResult] = await db.select({ count: count() }).from(testsTable)
    .where(eq(testsTable.status, "pending"));
  const [completedTestsResult] = await db.select({ count: count() }).from(testsTable)
    .where(eq(testsTable.status, "completed"));
  const [lowStockResult] = await db.select({ count: count() }).from(inventoryTable)
    .where(lte(inventoryTable.quantity, inventoryTable.threshold));
  const [activeWorkflowsResult] = await db.select({ count: count() }).from(workflowsTable)
    .where(eq(workflowsTable.status, "active"));

  const recentSamples = await db.select().from(samplesTable)
    .orderBy(desc(samplesTable.createdAt))
    .limit(5);
  const recentAuditLogs = await db.select().from(auditLogsTable)
    .orderBy(desc(auditLogsTable.timestamp))
    .limit(10);

  res.json({
    totalSamples: totalSamplesResult.count,
    activeSamples: activeSamplesResult.count,
    pendingTests: pendingTestsResult.count,
    completedTests: completedTestsResult.count,
    lowStockItems: lowStockResult.count,
    activeWorkflows: activeWorkflowsResult.count,
    recentSamples,
    recentAuditLogs,
  });
});

export default router;
