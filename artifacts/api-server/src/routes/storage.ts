import { Router } from "express";
import { db, storageLocationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateStorageBody, ListStorageQueryParams } from "@workspace/api-zod";
import { logAudit } from "../lib/audit.js";

const router = Router();

router.get("/", async (req, res) => {
  const query = ListStorageQueryParams.parse(req.query);
  let locations;
  if (query.parentId) {
    locations = await db.select().from(storageLocationsTable)
      .where(eq(storageLocationsTable.parentId, query.parentId))
      .orderBy(storageLocationsTable.name);
  } else {
    locations = await db.select().from(storageLocationsTable).orderBy(storageLocationsTable.name);
  }
  res.json(locations);
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [location] = await db.select().from(storageLocationsTable).where(eq(storageLocationsTable.id, id));
  if (!location) return res.status(404).json({ error: "Storage location not found" });
  res.json(location);
});

router.post("/", async (req, res) => {
  const data = CreateStorageBody.parse(req.body);
  const [location] = await db.insert(storageLocationsTable).values(data).returning();
  await logAudit({ action: "CREATE", entityType: "storage", entityId: location.id, newValue: JSON.stringify(data) });
  res.status(201).json(location);
});

export default router;
