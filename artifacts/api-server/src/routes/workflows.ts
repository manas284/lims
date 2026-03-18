import { Router } from "express";
import { db, workflowsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { CreateWorkflowBody, UpdateWorkflowBody, ListWorkflowsQueryParams } from "@workspace/api-zod";
import { logAudit } from "../lib/audit.js";

const router = Router();

router.get("/", async (req, res) => {
  const query = ListWorkflowsQueryParams.parse(req.query);
  let conditions: any[] = [];
  if (query.sampleId) conditions.push(eq(workflowsTable.sampleId, query.sampleId));
  if (query.status) conditions.push(eq(workflowsTable.status, query.status));
  const workflows = await db.select().from(workflowsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(workflowsTable.createdAt);
  res.json(workflows);
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [workflow] = await db.select().from(workflowsTable).where(eq(workflowsTable.id, id));
  if (!workflow) return res.status(404).json({ error: "Workflow not found" });
  res.json(workflow);
});

router.post("/", async (req, res) => {
  const data = CreateWorkflowBody.parse(req.body);
  const [workflow] = await db.insert(workflowsTable).values({
    ...data,
    currentStage: "received",
    status: "active",
  }).returning();
  await logAudit({ action: "CREATE", entityType: "workflow", entityId: workflow.id, newValue: JSON.stringify(data) });
  res.status(201).json(workflow);
});

router.patch("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const data = UpdateWorkflowBody.parse(req.body);
  const [old] = await db.select().from(workflowsTable).where(eq(workflowsTable.id, id));
  if (!old) return res.status(404).json({ error: "Workflow not found" });
  const [updated] = await db.update(workflowsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(workflowsTable.id, id))
    .returning();
  await logAudit({ action: "UPDATE", entityType: "workflow", entityId: id, oldValue: JSON.stringify({ stage: old.currentStage, status: old.status }), newValue: JSON.stringify(data) });
  res.json(updated);
});

export default router;
