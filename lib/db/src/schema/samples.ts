import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const samplesTable = pgTable("samples", {
  id: serial("id").primaryKey(),
  barcode: text("barcode").notNull().unique(),
  type: text("type").notNull(),
  status: text("status").notNull().default("received"),
  priority: text("priority").notNull().default("normal"),
  locationId: integer("location_id"),
  createdById: integer("created_by_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSampleSchema = createInsertSchema(samplesTable).omit({ id: true, barcode: true, createdAt: true, updatedAt: true });
export type InsertSample = z.infer<typeof insertSampleSchema>;
export type Sample = typeof samplesTable.$inferSelect;
