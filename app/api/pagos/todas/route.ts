// app/api/pagos/todas/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/epayco/db';
import { epaycoOrders, epaycoOrderItems } from '@/lib/epayco/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = 10;
  const type = searchParams.get('type') || 'saldo';
  const offset = (page - 1) * limit;

  try {
    const purchases = await db
      .select({
        id: epaycoOrders.id,
        referenceCode: epaycoOrders.reference_code,
        amount: epaycoOrders.amount,
        tax: epaycoOrders.tax,
        status: epaycoOrders.status,
        buyerEmail: epaycoOrders.buyer_email,
        buyerName: epaycoOrders.buyer_name,
        processingDate: epaycoOrders.processing_date,
      })
      .from(epaycoOrders)
      .leftJoin(
        epaycoOrderItems,
        eq(epaycoOrders.id, epaycoOrderItems.order_id)
      )
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${epaycoOrders.id})` })
      .from(epaycoOrders)
      .leftJoin(
        epaycoOrderItems,
        eq(epaycoOrders.id, epaycoOrderItems.order_id)
      );

    return NextResponse.json({
      purchases,
      pagination: {
        total: count,
        page,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error('Error al obtener las compras:', error);
    return NextResponse.json({ error: 'Error al obtener las compras' }, { status: 500 });
  }
}
