// app/api/pagos/saldo/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/epayco/db';
import { epaycoOrders } from '@/lib/epayco/schema';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    // Use SQL to sum the amount column
    const [result] = await db
      .select({
        totalAmount: sql<number>`SUM(amount)`, // Sum all the amounts
      })
      .from(epaycoOrders);

    // Return the total amount as the balance
    return NextResponse.json({
      totalAmount: result.totalAmount || 0, // Return 0 if there are no records
    });
  } catch (error) {
    console.error('Error al calcular el saldo total:', error);
    return NextResponse.json(
      { error: 'Error al calcular el saldo total' },
      { status: 500 }
    );
  }
}
