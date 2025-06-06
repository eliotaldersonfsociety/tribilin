// schema.ts
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const epaycoOrders = sqliteTable('epayco_orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  reference_code: text('reference_code').notNull().unique(),
  clerk_id: text('clerk_id').notNull(),
  amount: real('amount').notNull(),
  tax: real('tax').notNull(),
  tax_base: real('tax_base').notNull(),
  tip: real('tip').notNull().default(0), // 👈 AÑADE ESTA LÍNEA
  status: text('status').notNull().default('PENDING'),
  transaction_id: text('transaction_id'),
  buyer_email: text('buyer_email').notNull(),
  buyer_name: text('buyer_name').notNull(),
  shipping_address: text('shipping_address').notNull(),
  shipping_city: text('shipping_city').notNull(),
  shipping_country: text('shipping_country').notNull(),
  phone: text('phone').notNull(),
  document_type: text('document_type').notNull(),
  document_number: text('document_number').notNull(),
  processing_date: integer('processing_date'),
  updated_at: integer('updated_at', { mode: 'timestamp' }).notNull().defaultNow(),
  ref_payco: text('ref_payco')
});

export type EpaycoOrder = typeof epaycoOrders.$inferSelect;
export type NewEpaycoOrder = typeof epaycoOrders.$inferInsert;

export const epaycoOrderItems = sqliteTable('epayco_order_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  order_id: integer('order_id').notNull(), // Asegúrate de que esta línea coincida con el nombre de la columna
  product_id: text('product_id').notNull(), // Asegúrate de que esta línea coincida con el nombre de la columna
  title: text('title').notNull(), // Asegúrate de que esta línea coincida con el nombre de la columna
  price: real('price').notNull(),
  quantity: integer('quantity').notNull()
});

export type EpaycoOrderItem = typeof epaycoOrderItems.$inferSelect;
export type NewEpaycoOrderItem = typeof epaycoOrderItems.$inferInsert;
