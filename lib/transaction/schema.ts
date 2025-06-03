import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export interface ProductItem {
  name: string;
  price: number;
  quantity: number;
  image?: string;
  color?: string;
  size?: string;
  sizeRange?: string | null;
}

// Define la tabla 'transactions'
export const transactions = sqliteTable('transactions', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  user_id: text('user_id').notNull(),
  amount: real('amount').notNull(),
  type: text('type').notNull(),
  description: text('description').notNull(),
  created_at: integer('created_at').default(sql`(strftime('%s', 'now'))`).notNull(),
  products: text('products').notNull().$type<ProductItem[]>(),
  subtotal: real('subtotal').notNull(),
  tip: real('tip').notNull(),
  shipping: text('shipping').notNull(),
  taxes: real('taxes').notNull(),
  total: real('total').notNull(),
  status: text('status').default('Pendiente'),
});
