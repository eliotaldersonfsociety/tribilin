import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { epaycoOrders, epaycoOrderItems } from '@/lib/epayco/schema';
import { and, desc, eq, sql } from 'drizzle-orm';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const itemsPerPage = 10;
  const offset = (page - 1) * itemsPerPage;

  try {
    // Consulta total para paginación
    const totalResult = await db.select({ count: sql<number>`count(*)` }).from(epaycoOrders);
    const total = totalResult[0]?.count || 0;

    // Consulta principal con inner join y JSON agregando los items
    const purchases = await db
      .select({
        id: epaycoOrders.id,
        referenceCode: epaycoOrders.referenceCode,
        description: epaycoOrders.description,
        total: epaycoOrders.total,
        created_at: epaycoOrders.created_at,
        updated_at: epaycoOrders.updated_at,
        status: epaycoOrders.status,
        user_id: epaycoOrders.user_id,
        user_email: epaycoOrders.user_email,
        buyer_name: epaycoOrders.buyer_name,
        items: sql`json_group_array(json_object(
          'id', ${epaycoOrderItems.id},
          'name', ${epaycoOrderItems.name},
          'title', ${epaycoOrderItems.title},
          'price', ${epaycoOrderItems.price},
          'quantity', ${epaycoOrderItems.quantity},
          'image', ${epaycoOrderItems.image},
          'color', ${epaycoOrderItems.color},
          'size', ${epaycoOrderItems.size},
          'sizeRange', ${epaycoOrderItems.size_range}
        ))`.as('items')
      })
      .from(epaycoOrders)
      .leftJoin(epaycoOrderItems, eq(epaycoOrders.id, epaycoOrderItems.order_id))
      .groupBy(epaycoOrders.id)
      .orderBy(desc(epaycoOrders.created_at))
      .limit(itemsPerPage)
      .offset(offset);

    // Mapear items JSON string a objetos
    const mappedPurchases = purchases.map((purchase) => {
      let items = [];

      try {
        const parsed = JSON.parse(purchase.items as unknown as string);
        if (Array.isArray(parsed)) {
          items = parsed.map(item => ({
            ...item,
            sizeRange: item.sizeRange, // ya está en camelCase
          }));
        }
      } catch (e) {
        console.error('Error al parsear items JSON:', e);
      }

      return {
        ...purchase,
        items,
      };
    });

    return NextResponse.json({
      purchases: mappedPurchases,
      pagination: {
        total,
        currentPage: page,
        itemsPerPage,
        totalPages: Math.ceil(total / itemsPerPage),
      }
    });
  } catch (error) {
    console.error('Error en GET /api/pagos/todas:', error);
    return NextResponse.json({ error: 'Error al obtener las compras' }, { status: 500 });
  }
}
