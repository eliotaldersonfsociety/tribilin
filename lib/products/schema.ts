import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const productsTable = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  price: real("price").notNull(),
  compare_at_price: real("compare_at_price"),
  cost_per_item: real("cost_per_item"),
  vendor: text("vendor"),
  product_type: text("product_type"),
  status: integer("status").notNull().default(1),
  category: text("category"),
  tags: text("tags"),
  sku: text("sku"),
  barcode: text("barcode"),
  quantity: integer("quantity").notNull().default(0),
  track_inventory: integer("track_inventory", { mode: "boolean" }).default(false),
  images: text("images").notNull(),
  sizes: text("sizes").notNull(),
  size_range: text("size_range").notNull(),
  colors: text("colors").notNull(),
});

export type Product = typeof productsTable.$inferSelect;
export type NewProduct = typeof productsTable.$inferInsert; 

