// app/api/epayco/order/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/epayco/db';
import { epaycoOrders, epaycoOrderItems } from '@/lib/epayco/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const id = req.url.split('/').pop(); // Extract order ID from the URL
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

    const orderData = order[0];

    const orderItems = await db
      .select()
      .from(epaycoOrderItems)
      .where(eq(epaycoOrderItems.order_id, orderId));

    // Adapt the response to match what the frontend expects
    return NextResponse.json({
      id: orderData.id,
      referenceCode: orderData.reference_code,
      amount: orderData.amount,
      tax: orderData.tax,
      tip: orderData.tip || 0,
      shipping_address: orderData.shipping_address,
      shipping_city: orderData.shipping_city,
      shipping_country: orderData.shipping_country,
      phone: orderData.phone,
      items: orderItems.map(item => ({
        id: item.id,
        name: item.title,
        quantity: item.quantity,
        price: item.price,
        image: item.image || '',
        color: item.color || '',
        size: item.size || '',
        sizeRange: item.size_range || '',
      })),
    });

  } catch (error) {
    console.error('Error fetching order details:', error);
    return NextResponse.json(
      { error: 'Error fetching order details' },
      { status: 500 }
    );
  }
}
