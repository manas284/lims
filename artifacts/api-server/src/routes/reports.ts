import { Router } from "express";
import { db, reportsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateReportBody } from "@workspace/api-zod";
import { logAudit } from "../lib/audit.js";

const router = Router();

router.get("/", async (_req, res) => {
  const reports = await db.select().from(reportsTable).orderBy(reportsTable.createdAt);
  res.json(reports);
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [report] = await db.select().from(reportsTable).where(eq(reportsTable.id, id));
  if (!report) return res.status(404).json({ error: "Report not found" });
  res.json(report);
});

router.post("/", async (req, res) => {
  const data = CreateReportBody.parse(req.body);
  const [report] = await db.insert(reportsTable).values(data).returning();
  await logAudit({ action: "CREATE", entityType: "report", entityId: report.id, newValue: JSON.stringify(data) });
  res.status(201).json(report);
});

export default router;
