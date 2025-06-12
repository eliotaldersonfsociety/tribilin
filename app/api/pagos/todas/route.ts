// app/api/pagos/todas/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/epayco/db';
import { epaycoOrders, epaycoOrderItems } from '@/lib/epayco/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { page = 1, limit = 10, type = 'saldo' } = await request.json();
    const offset = (page - 1) * limit;

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
        items: epaycoOrderItems
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
