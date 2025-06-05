// app/api/epayco/by-transaction/[transaction_id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/epayco/db';
import { epaycoOrders, epaycoOrderItems } from '@/lib/epayco/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    // Extraer el transaction_id de la URL
    const transactionId = req.url.split('/').pop();

    if (!transactionId) {
      return NextResponse.json({ error: 'Transaction ID faltante' }, { status: 400 });
    }

    const order = await db
      .select()
      .from(epaycoOrders)
      .where(eq(epaycoOrders.transaction_id, transactionId))
      .limit(1);

    if (!order || order.length === 0) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    const orderData = order[0];

    const orderItems = await db
      .select()
      .from(epaycoOrderItems)
      .where(eq(epaycoOrderItems.order_id, orderData.id));

    return NextResponse.json({
      id: orderData.id,
      referenceCode: orderData.reference_code,
      transaction_id: orderData.transaction_id,
      amount: orderData.amount,
      tax: orderData.tax,
      status: orderData.status,
      shipping_address: orderData.shipping_address,
      buyer_email: orderData.buyer_email,
      items: orderItems.map(item => ({
        id: item.id,
        name: item.title,
        quantity: item.quantity,
        price: item.price,
      })),
    });
  } catch (error) {
    console.error('Error al buscar la orden por transaction_id:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
