// app/api/pagos/numerodepagos/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/epayco/db';
import { epaycoOrders } from '@/lib/epayco/schema';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    const [result] = await db
      .select({
        count: sql<number>`COUNT(*)`,
        lastPurchaseDate: sql<string>`MAX(processing_date)`, // Obtiene la fecha más reciente
      })
      .from(epaycoOrders);

    return NextResponse.json({
      count: result.count,
      lastPurchaseDate: result.lastPurchaseDate || null,
    });
  } catch (error) {
    console.error('Error al contar órdenes:', error);
    return NextResponse.json({ error: 'Error al contar las órdenes' }, { status: 500 });
  }
}
