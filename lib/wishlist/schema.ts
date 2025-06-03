import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const wishlist = sqliteTable('wishlist', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  productId: integer('product_id').notNull(),
  product: text('product'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export type Wishlist = typeof wishlist.$inferSelect;
export type InsertWishlist = typeof wishlist.$inferInsert;

// Exportar todo el esquema para su uso en la configuración de la base de datos
export * as schema from './schema';
