//@/lib/db/schema.ts
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clerk_id: text("clerk_id").unique(),
  name: text("name").notNull(),
  lastname: text("lastname").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  address: text("address"),
  postal_code: text("postal_code"),
  saldo: text("saldo").default('0.00'),
  isAdmin: integer("is_admin", { mode: "boolean" }).default(false),
  phone: text("phone"),
});

export const products = sqliteTable("products", {
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

export const transactions = sqliteTable("transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  user_id: text("user_id").notNull(),
  amount: real("amount").notNull(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  created_at: integer("created_at", { mode: "timestamp" }).defaultNow(),
  products: text("products").notNull(),
  subtotal: real("subtotal").notNull(),
  tip: real("tip").notNull(),
  shipping: text("shipping").notNull(),
  taxes: real("taxes").notNull(),
  total: real("total").notNull(),
});

export const purchases = sqliteTable("purchases", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  created_at: integer("created_at", { mode: "timestamp" }).defaultNow(),
  item_name: text("item_name").notNull(),
  price: real("price").notNull(),
  status: text("status", { enum: ["por enviar", "enviado", "entregado", "pending"] }).default("pending"),
  name: text("name").notNull(),
  lastname: text("lastname").notNull(),
  direction: text("direction").notNull(),
  postalcode: text("postalcode").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  payment_method: text("payment_method").notNull(),
  quantity: integer("quantity").notNull(),
  user_id: integer("user_id").references(() => users.id),
});

// Tipos generados automáticamente
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type Purchase = typeof purchases.$inferSelect;
export type NewPurchase = typeof purchases.$inferInsert;
