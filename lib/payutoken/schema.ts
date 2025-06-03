// lib/db/schema/payuTokens.ts
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const payu_tokens = pgTable('payu_tokens', {
  referenceCode: text('referenceCode').primaryKey(),
  token: text('token').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});
