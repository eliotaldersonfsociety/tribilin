// lib/db/db3.ts
import { createClient } from '@libsql/client/web';
import { drizzle } from 'drizzle-orm/libsql';

const client = createClient({
  url: process.env.TURSO_DATABASE_AUTH_URL!,
  authToken: process.env.TURSO_DATABASE_AUTH_TOKEN!,
});

const db3 = drizzle(client);

export default db3;
