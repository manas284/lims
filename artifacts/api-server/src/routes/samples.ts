import { Router } from "express";
import { db, samplesTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { CreateSampleBody, UpdateSampleBody, ListSamplesQueryParams } from "@workspace/api-zod";
import { logAudit, generateBarcode } from "../lib/audit.js";

const router = Router();

router.get("/", async (req, res) => {
  const query = ListSamplesQueryParams.parse(req.query);
  let conditions: any[] = [];
  if (query.status) conditions.push(eq(samplesTable.status, query.status));
  if (query.type) conditions.push(eq(samplesTable.type, query.type));
  const samples = await db.select().from(samplesTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(samplesTable.createdAt);
  res.json(samples);
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [sample] = await db.select().from(samplesTable).where(eq(samplesTable.id, id));
  if (!sample) return res.status(404).json({ error: "Sample not found" });
  res.json(sample);
});

router.post("/", async (req, res) => {
  const data = CreateSampleBody.parse(req.body);
  const tempBarcode = "TEMP";
  const [sample] = await db.insert(samplesTable).values({
    ...data,
    barcode: tempBarcode,
    status: data.status ?? "received",
    priority: data.priority ?? "normal",
  }).returning();
  const barcode = generateBarcode(sample.id);
  const [updated] = await db.update(samplesTable)
    .set({ barcode })
    .where(eq(samplesTable.id, sample.id))
    .returning();
  await logAudit({ action: "CREATE", entityType: "sample", entityId: updated.id, newValue: JSON.stringify({ type: data.type, barcode }) });
  res.status(201).json(updated);
});

router.patch("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const data = UpdateSampleBody.parse(req.body);
  const [old] = await db.select().from(samplesTable).where(eq(samplesTable.id, id));
  if (!old) return res.status(404).json({ error: "Sample not found" });
  const [updated] = await db.update(samplesTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(samplesTable.id, id))
    .returning();
  await logAudit({ action: "UPDATE", entityType: "sample", entityId: id, oldValue: JSON.stringify(old), newValue: JSON.stringify(data) });
  res.json(updated);
});

export default router;
