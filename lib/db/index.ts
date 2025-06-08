import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as wishlistSchema from '@/lib/wishlist/schema';
import * as usersSchema from '@/lib/register/schema';
import * as productsSchema from '@/lib/products/schema';
import * as transactionsSchema from '@/lib/transaction/schema';
import * as visitasSchema from '@/lib/visitas/schema';
import * as orders from '@/lib/payu/schema';
import * as epaycoSchema from '@/lib/epayco/schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { productsTable } from "@/lib/products/schema";
import { auth } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";
import { users } from "@/lib/usuarios/schema";


// Cliente para productos y wishlist (comparten la misma base de datos)
const productsClient = createClient({
  url: process.env.PRODUCTS_DB_URL!,
  authToken: process.env.PRODUCTS_DB_TOKEN
});

// Cliente para usuarios
const usersClient = createClient({
  url: process.env.USERS_DB_URL!,
  authToken: process.env.USERS_DB_TOKEN
});

// Cliente para transacciones
const transactionsClient = createClient({
  url: process.env.TRANSACTIONS_DB_URL!,
  authToken: process.env.TRANSACTIONS_DB_TOKEN
});

// Cliente para PayU
const payuClient = createClient({
  url: process.env.PAYU_DB_URL!,
  authToken: process.env.PAYU_DB_TOKEN
});

const visitasClient = createClient({
  url: process.env.VISITAS_DB_URL!,
  authToken: process.env.VISITAS_DB_TOKEN
});

const epaycoClient = createClient({
  url: process.env.TURSO_URL!, // Define esta variable en .env
  authToken: process.env.TURSO_AUTH_TOKEN
});

// Instancias de Drizzle con sus respectivos esquemas
const productsDb = drizzle(productsClient);
const usersDb = drizzle(usersClient);
const transactionsDb = drizzle(transactionsClient);
const payuDb = drizzle(payuClient);
const visitasDb = drizzle(visitasClient);
const epaycoDb = drizzle(epaycoClient, {
  schema: {
    epaycoOrders: epaycoSchema.epaycoOrders,
    epaycoOrderItems: epaycoSchema.epaycoOrderItems
  }
});

export const db = {
  products: productsDb,
  wishlist: transactionsDb,
  users: usersDb,
  transactions: transactionsDb,
  payu: payuDb,
  payus: transactionsDb,
  visitas: visitasDb,
  epayco: epaycoDb
} as const;

export type DB = typeof db;
export default db;

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  console.log("userId recibido:", userId);

  if (!userId) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  // ... resto del código ...
}
