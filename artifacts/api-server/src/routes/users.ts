import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateUserBody } from "@workspace/api-zod";
import { logAudit } from "../lib/audit.js";

const router = Router();

router.get("/", async (_req, res) => {
  const users = await db.select().from(usersTable).orderBy(usersTable.createdAt);
  res.json(users);
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

router.post("/", async (req, res) => {
  const data = CreateUserBody.parse(req.body);
  const [user] = await db.insert(usersTable).values(data).returning();
  await logAudit({ action: "CREATE", entityType: "user", entityId: user.id, newValue: JSON.stringify(data) });
  res.status(201).json(user);
});

export default router;
