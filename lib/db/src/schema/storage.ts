import { pgTable, serial, text, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const storageLocationsTable = pgTable("storage_locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  parentId: integer("parent_id"),
  temperature: real("temperature"),
  capacity: integer("capacity"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertStorageSchema = createInsertSchema(storageLocationsTable).omit({ id: true, createdAt: true });
export type InsertStorage = z.infer<typeof insertStorageSchema>;
export type StorageLocation = typeof storageLocationsTable.$inferSelect;
