// app/api/epayco/order/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/epayco/db';
import { epaycoOrders, epaycoOrderItems } from '@/lib/epayco/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');

    const orderId = parseInt(idParam || '', 10);
    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'ID de orden inválido' }, { status: 400 });
    }

    const order = await db
      .select()
      .from(epaycoOrders)
      .where(eq(epaycoOrders.id, orderId))
      .limit(1);

    if (!order || order.length === 0) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    const orderItems = await db
      .select()
      .from(epaycoOrderItems)
      .where(eq(epaycoOrderItems.orderId, orderId));

    return NextResponse.json({
      ...order[0],
      items: orderItems.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image || undefined,
        color: item.color || undefined,
        size: item.size || undefined,
        sizeRange: item.sizeRange || undefined,
      })),
    });

  } catch (error) {
    console.error('Error al obtener detalles de la orden:', error);
    return NextResponse.json(
      { error: 'Error al obtener detalles de la orden' },
      { status: 500 }
    );
  }
}
