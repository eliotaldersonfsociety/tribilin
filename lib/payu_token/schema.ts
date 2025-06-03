// db/schema.ts
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const payuTokens = sqliteTable('payu_tokens', {
  referenceCode: text('referenceCode').notNull().primaryKey(),
  token: text('token').notNull(),
  createdAt: text('createdAt')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
