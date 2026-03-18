import { Router } from "express";
import { db, testsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { CreateTestBody, UpdateTestBody, ListTestsQueryParams } from "@workspace/api-zod";
import { logAudit } from "../lib/audit.js";

const router = Router();

router.get("/", async (req, res) => {
  const query = ListTestsQueryParams.parse(req.query);
  let conditions: any[] = [];
  if (query.sampleId) conditions.push(eq(testsTable.sampleId, query.sampleId));
  if (query.status) conditions.push(eq(testsTable.status, query.status));
  const tests = await db.select().from(testsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(testsTable.createdAt);
  res.json(tests);
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [test] = await db.select().from(testsTable).where(eq(testsTable.id, id));
  if (!test) return res.status(404).json({ error: "Test not found" });
  res.json(test);
});

router.post("/", async (req, res) => {
  const data = CreateTestBody.parse(req.body);
  const [test] = await db.insert(testsTable).values({
    ...data,
    status: "pending",
  }).returning();
  await logAudit({ action: "CREATE", entityType: "test", entityId: test.id, newValue: JSON.stringify(data) });
  res.status(201).json(test);
});

router.patch("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const data = UpdateTestBody.parse(req.body);
  const [old] = await db.select().from(testsTable).where(eq(testsTable.id, id));
  if (!old) return res.status(404).json({ error: "Test not found" });
  const [updated] = await db.update(testsTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(testsTable.id, id))
    .returning();
  await logAudit({ action: "UPDATE", entityType: "test", entityId: id, oldValue: JSON.stringify(old), newValue: JSON.stringify(data) });
  res.json(updated);
});

export default router;
