// app/api/epayco/order/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/epayco/db';
import { epaycoOrders, epaycoOrderItems } from '@/lib/epayco/schema';
import { generateReferenceCode, calculateTaxBase } from '@/lib/epayco/utils';
import { EPAYCO_STATUS } from '@/lib/epayco/config';

export async function POST(request: NextRequest) {
  try {
    const { items, deliveryInfo, total, tax } = await request.json();
    console.log('Datos recibidos:', { items, deliveryInfo, total, tax });

    const reference_code = generateReferenceCode();
    console.log('Código de referencia generado:', reference_code);

    // Validar datos requeridos
    if (!deliveryInfo || !deliveryInfo.email || !deliveryInfo.name || !deliveryInfo.address || !deliveryInfo.phone || !deliveryInfo.documentType || !deliveryInfo.document) {
      console.error('Datos de entrega incompletos');
      return NextResponse.json({ error: 'Datos de entrega incompletos' }, { status: 400 });
    }

    // Asegúrate de que el nombre de la propiedad coincida con lo que devuelve calculateTaxBase
    const { taxBase: tax_base } = calculateTaxBase(total, tax);

    // Crear la orden en la base de datos
    const [order] = await db.insert(epaycoOrders).values({
      reference_code,
      clerk_id: deliveryInfo.clerk_id,
      amount: total,
      tax: tax || 0,
      tax_base: tax_base,
      status: EPAYCO_STATUS.PENDING,
      buyer_email: deliveryInfo.email,
      buyer_name: deliveryInfo.name,
      shipping_address: deliveryInfo.address,
      shipping_city: deliveryInfo.city || 'N/A',
      shipping_country: 'CO',
      phone: deliveryInfo.phone,
      document_type: deliveryInfo.documentType,
      document_number: deliveryInfo.document,
      processing_date: Date.now()
    }).returning();

    console.log('Orden creada:', order);

    // Guardar los items del pedido
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.id.toString(),
      title: item.name,
      price: item.price,
      quantity: item.quantity
    }));

    await db.insert(epaycoOrderItems).values(orderItems);
    console.log('Ítems de la orden guardados');

    return NextResponse.json({ orderId: order.id, referenceCode: order.reference_code, amount: Number(order.amount), tax: Number(order.tax) });

  } catch (error) {
    console.error('Error creando la orden:', error);
    return NextResponse.json({ error: 'Error creando la orden', details: error instanceof Error ? error.message : 'Error desconocido' }, { status: 500 });
  }
}
