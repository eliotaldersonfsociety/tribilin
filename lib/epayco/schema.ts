import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const epaycoOrders = sqliteTable('epayco_orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  referenceCode: text('referenceCode').notNull().unique(),
  clerk_id: text('clerk_id').notNull(),
  amount: real('amount').notNull(),
  tax: real('tax').notNull(),
  taxBase: real('taxBase').notNull(),
  currency: text('currency').notNull().default('COP'),
  status: text('status').notNull().default('PENDING'),
  transactionId: text('transactionId'),
  processingDate: integer('processingDate'),
  buyerEmail: text('buyerEmail').notNull(),
  buyerName: text('buyerName').notNull(),
  shippingAddress: text('shippingAddress').notNull(),
  shippingCity: text('shippingCity').notNull(),
  shippingCountry: text('shippingCountry').notNull(),
  phone: text('phone').notNull(),
  documentType: text('documentType').notNull(),
  documentNumber: text('documentNumber').notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().defaultNow(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().defaultNow()
});

export type EpaycoOrder = typeof epaycoOrders.$inferSelect;
export type NewEpaycoOrder = typeof epaycoOrders.$inferInsert;

export const epaycoOrderItems = sqliteTable('epayco_order_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderId: integer('orderId').notNull(),
  productId: text('productId').notNull(),
  name: text('name').notNull(),
  price: real('price').notNull(),
  quantity: integer('quantity').notNull(),
  image: text('image'),
  color: text('color'),
  size: text('size'),
  sizeRange: text('sizeRange'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().defaultNow()
});

export type EpaycoOrderItem = typeof epaycoOrderItems.$inferSelect;
export type NewEpaycoOrderItem = typeof epaycoOrderItems.$inferInsert;
