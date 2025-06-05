import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { db } from '@/lib/epayco/db';
import { epaycoOrders, epaycoOrderItems } from '@/lib/epayco/schema';
import { generateReferenceCode, calculateTaxBase } from '@/lib/epayco/utils';
import { EPAYCO_STATUS } from '@/lib/epayco/config';

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const {
      amount,
      items,
      buyer_email,
      buyer_name,
      shipping_address,
      shipping_city,
      shipping_country,
      phone,
      document_type,
      document_number,
    } = await req.json();

    if (!amount || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Datos de la orden incompletos' },
        { status: 400 }
      );
    }

    // Adjust the destructuring to match the property names returned by calculateTaxBase
    const { taxBase: tax_base, tax } = calculateTaxBase(amount);
    const reference_code = generateReferenceCode();

    // Crear la orden en la base de datos
    const [order] = await db
      .insert(epaycoOrders)
      .values({
        reference_code,
        clerk_id: userId,
        amount,
        tax,
        tax_base, // Use the renamed variable here
        status: EPAYCO_STATUS.PENDING,
        buyer_email,
        buyer_name,
        shipping_address,
        shipping_city: shipping_city || 'N/A',
        shipping_country: shipping_country || 'CO',
        phone,
        document_type,
        document_number,
        processing_date: Date.now()
      })
      .returning();

    // Insertar los items de la orden
    await db.insert(epaycoOrderItems).values(
      items.map((item: any) => ({
        order_id: order.id,
        product_id: item.id,
        title: item.name,
        price: item.price,
        quantity: item.quantity
      }))
    );

    return NextResponse.json({
      success: true,
      orderId: order.id,
      referenceCode: order.reference_code
    });

  } catch (error) {
    console.error('Error procesando el pago:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
