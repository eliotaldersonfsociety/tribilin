// app/api/epayco/order/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/epayco/db';
import { epaycoOrders, epaycoOrderItems } from '@/lib/epayco/schema';
import { generateReferenceCode } from '@/lib/epayco/utils';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string | string[];
  color?: string;
  size?: string;
  sizeRange?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { items, deliveryInfo, total, tax } = await request.json();
    const referenceCode = generateReferenceCode();

    // Crear la orden en la base de datos
    const [order] = await db.insert(epaycoOrders).values({
      referenceCode,
      clerk_id: deliveryInfo.clerk_id,
      amount: total,
      tax: tax || 0,
      taxBase: total - (tax || 0),
      buyerEmail: deliveryInfo.email,
      buyerName: deliveryInfo.name,
      shippingAddress: deliveryInfo.address,
      shippingCity: deliveryInfo.city || 'N/A',
      shippingCountry: 'CO',
      phone: deliveryInfo.phone,
      documentType: deliveryInfo.documentType,
      documentNumber: deliveryInfo.document
    }).returning();

    // Guardar los items del pedido
    await db.insert(epaycoOrderItems).values(
      items.map((item: CartItem) => ({
        orderId: order.id,
        productId: item.id.toString(),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        color: item.color,
        size: item.size,
        sizeRange: item.sizeRange
      }))
    );

    return NextResponse.json({ orderId: order.id, referenceCode });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Error creating order' }, { status: 500 });
  }
}
