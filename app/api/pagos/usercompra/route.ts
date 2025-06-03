// app/api/transactions/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import db from '@/lib/db';
import { transactions } from '@/lib/db/schema';

export async function GET(req: NextRequest) {
  try {
    // Obtener el usuario autenticado
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Consulta correcta con `where` dentro de `select()`
    const userTransactions = await db.transactions.select({
      where: eq(transactions.user_id, userId)
    });

    return NextResponse.json(userTransactions);
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
