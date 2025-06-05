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
    console.log('Datos recibidos:', { items, deliveryInfo, total, tax });

    const referenceCode = generateReferenceCode();
    console.log('Código de referencia generado:', referenceCode);

    // Validar datos requeridos
    if (!deliveryInfo || !deliveryInfo.email || !deliveryInfo.name || !deliveryInfo.address || !deliveryInfo.phone || !deliveryInfo.documentType || !deliveryInfo.document) {
      console.error('Datos de entrega incompletos');
      return NextResponse.json({ error: 'Datos de entrega incompletos' }, { status: 400 });
    }

    // Crear la orden en la base de datos
    const [order] = await db.insert(epaycoOrders).values({
      reference_code: referenceCode, // Cambiado de referenceCode a reference_code
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

    console.log('Orden creada:', order);

    // Guardar los items del pedido
    const orderItems = items.map((item: CartItem) => ({
      orderId: order.id,
      productId: item.id.toString(),
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      color: item.color,
      size: item.size,
      sizeRange: item.sizeRange
    }));

    await db.insert(epaycoOrderItems).values(orderItems);
    console.log('Ítems de la orden guardados');

    return NextResponse.json({ orderId: order.id, referenceCode });
  } catch (error) {
    console.error('Error creando la orden:', error);
    return NextResponse.json({ error: 'Error creando la orden', details: error instanceof Error ? error.message : 'Error desconocido' }, { status: 500 });
  }
}
