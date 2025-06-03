import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  price: real("price").notNull(),
  compareAtPrice: real("compare_at_price"),
  costPerItem: real("cost_per_item"),
  vendor: text("vendor"),
  productType: text("product_type").default('physical'),
  status: integer("status", { mode: "boolean" }).notNull().default(true),
  category: text("category"),
  tags: text("tags"),
  sku: text("sku"),
  barcode: text("barcode"),
  quantity: integer("quantity").notNull().default(0),
  trackInventory: integer("track_inventory", { mode: "boolean" }).default(false),
  images: text("images", { mode: "json" }).notNull().$type<string[]>().default([]),
  sizes: text("sizes", { mode: "json" }).notNull().$type<string[]>().default([]),
  sizeRange: text("size_range", { mode: "json" })
    .notNull()
    .$type<{ min: number; max: number }>()
    .default({ min: 0, max: 0 }),
  colors: text("colors", { mode: "json" }).notNull().$type<string[]>().default([]),
});

// Esquema Zod para validación
export const insertProductSchema = createInsertSchema(products, {
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  price: z.number().positive("El precio debe ser un número positivo"),
  images: z.array(z.string().url("Las imágenes deben ser URLs válidas")).min(1),
  sizes: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),
  sizeRange: z.object({
    min: z.number().min(0, "El tamaño mínimo no puede ser negativo"),
    max: z.number().min(0, "El tamaño máximo no puede ser negativo")
  }).default({ min: 0, max: 0 })
});

// Tipos TypeScript
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
