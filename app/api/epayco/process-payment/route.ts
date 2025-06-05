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
      buyerEmail,
      buyerName,
      shippingAddress,
      shippingCity,
      shippingCountry,
      phone,
      documentType,
      documentNumber,
    } = await req.json();

    if (!amount || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Datos de la orden incompletos' },
        { status: 400 }
      );
    }

    const { taxBase, tax } = calculateTaxBase(amount);
    const reference_code = generateReferenceCode(); // Cambiado de referenceCode a reference_code

    // Crear la orden en la base de datos
    const [order] = await db
      .insert(epaycoOrders)
      .values({
        reference_code, // Cambiado de referenceCode a reference_code
        clerk_id: userId,
        amount,
        tax,
        taxBase,
        status: EPAYCO_STATUS.PENDING,
        buyerEmail,
        buyerName,
        shippingAddress,
        shippingCity,
        shippingCountry,
        phone,
        documentType,
        documentNumber,
        processingDate: Date.now()
      })
      .returning();

    // Insertar los items de la orden
    await db.insert(epaycoOrderItems).values(
      items.map((item: any) => ({
        orderId: order.id,
        productId: item.id,
        title: item.name,
        price: item.price,
        quantity: item.quantity
      }))
    );

    return NextResponse.json({
      success: true,
      orderId: order.id,
      referenceCode: order.reference_code // Cambiado de referenceCode a reference_code
    });

  } catch (error) {
    console.error('Error procesando el pago:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
