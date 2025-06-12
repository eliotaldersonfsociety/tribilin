import { NextResponse } from 'next/server';
import { db } from '@/lib/epayco/db';
import { epaycoOrders, epaycoOrderItems } from '@/lib/epayco/schema';
import { eq, sql } from 'drizzle-orm';

// ✅ Agrega esto si no lo has definido
type PurchaseItem = {
  id: number;
  name?: string;
  title?: string;
  price: number;
  quantity: number;
  image?: string;
  color?: string;
  size?: string;
  sizeRange?: string;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = 10;
  const offset = (page - 1) * limit;

  try {
    // Consulta para obtener las compras con sus respectivos items
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
        items: sql<PurchaseItem[]>`json_agg(
          json_build_object(
            'id', ${epaycoOrderItems.id},
            'name', ${epaycoOrderItems.name},
            'title', ${epaycoOrderItems.title},
            'price', ${epaycoOrderItems.price},
            'quantity', ${epaycoOrderItems.quantity},
            'image', ${epaycoOrderItems.image},
            'color', ${epaycoOrderItems.color},
            'size', ${epaycoOrderItems.size},
            'sizeRange', ${epaycoOrderItems.sizeRange}
          )
        )`.as('items')
      })
      .from(epaycoOrders)
      .leftJoin(
        epaycoOrderItems,
        eq(epaycoOrders.id, epaycoOrderItems.order_id)
      )
      .groupBy(epaycoOrders.id)
      .limit(limit)
      .offset(offset);

    // Obtener el total de compras para la paginación
    const [{ count }] = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${epaycoOrders.id})` })
      .from(epaycoOrders);

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
