// app/api/epayco/order/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/epayco/db';
import { epaycoOrders, epaycoOrderItems } from '@/lib/epayco/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    // Extract the orderId from the URL
    const id = req.url.split('/').pop(); // This gets the last part of the URL
    const orderId = parseInt(id || '', 10);

    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    const order = await db
      .select()
      .from(epaycoOrders)
      .where(eq(epaycoOrders.id, orderId))
      .limit(1);

    if (!order || order.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const orderItems = await db
      .select()
      .from(epaycoOrderItems)
      .where(eq(epaycoOrderItems.order_id, orderId));

    return NextResponse.json({
      ...order[0],
      items: orderItems,
    });

  } catch (error) {
    console.error('Error fetching order details:', error);
    return NextResponse.json(
      { error: 'Error fetching order details' },
      { status: 500 }
    );
  }
}
