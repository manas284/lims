import { Router } from "express";
import { db, inventoryTable } from "@workspace/db";
import { eq, lte, sql } from "drizzle-orm";
import { CreateInventoryItemBody, UpdateInventoryItemBody, ListInventoryQueryParams } from "@workspace/api-zod";
import { logAudit } from "../lib/audit.js";

const router = Router();

router.get("/", async (req, res) => {
  const query = ListInventoryQueryParams.parse(req.query);
  let items;
  if (query.lowStock) {
    items = await db.select().from(inventoryTable)
      .where(lte(inventoryTable.quantity, inventoryTable.threshold))
      .orderBy(inventoryTable.name);
  } else {
    items = await db.select().from(inventoryTable).orderBy(inventoryTable.name);
  }
  res.json(items);
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [item] = await db.select().from(inventoryTable).where(eq(inventoryTable.id, id));
  if (!item) return res.status(404).json({ error: "Item not found" });
  res.json(item);
});

router.post("/", async (req, res) => {
  const data = CreateInventoryItemBody.parse(req.body);
  const [item] = await db.insert(inventoryTable).values(data).returning();
  await logAudit({ action: "CREATE", entityType: "inventory", entityId: item.id, newValue: JSON.stringify(data) });
  res.status(201).json(item);
});

router.patch("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const data = UpdateInventoryItemBody.parse(req.body);
  const [old] = await db.select().from(inventoryTable).where(eq(inventoryTable.id, id));
  if (!old) return res.status(404).json({ error: "Item not found" });
  const [updated] = await db.update(inventoryTable)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(inventoryTable.id, id))
    .returning();
  await logAudit({ action: "UPDATE", entityType: "inventory", entityId: id, oldValue: JSON.stringify(old), newValue: JSON.stringify(data) });
  res.json(updated);
});

export default router;
