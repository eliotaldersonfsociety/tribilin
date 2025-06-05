// app/api/epayco/response/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/epayco/db';
import { epaycoOrders } from '@/lib/epayco/schema';
import { eq } from 'drizzle-orm';
import { mapEpaycoStatus, EPAYCO_STATUS } from '@/lib/epayco/config';

// Función para construir URLs absolutas
function buildAbsoluteUrl(path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  return new URL(path, baseUrl).toString();
}

// ✅ Manejo del GET para redirección desde ePayco
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const refPayco = searchParams.get('ref_payco');

     console.log('ref_payco recibido en GET:', refPayco);

    if (!refPayco) {
      return NextResponse.redirect(buildAbsoluteUrl('/checkout'), 302);
    }

    return NextResponse.redirect(buildAbsoluteUrl(`/thankyou/ok?ref_payco=${refPayco}`), 302);
  } catch (error) {
    console.error('Error en GET /api/epayco/response:', error);
    return NextResponse.redirect(buildAbsoluteUrl('/checkout'), 302);
  }
}

// ✅ POST para cuando recibes datos estructurados desde ePayco (webhook o fetch del frontend)
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log('Datos recibidos:', data); // Log para verificar los datos recibidos

    const {
      x_ref_payco: refPayco,
      x_transaction_id: transaction_id,
      x_transaction_state: transactionState,
      x_id_invoice: reference_code,
      x_response_reason_text: responseText,
    } = data;

    if (!reference_code) {
      return NextResponse.json(
        { error: 'Referencia no encontrada' },
        { status: 400 }
      );
    }

    const status = mapEpaycoStatus(transactionState);
    let redirectUrl = buildAbsoluteUrl('/checkout');

    const order = await db
      .select()
      .from(epaycoOrders)
      .where(eq(epaycoOrders.reference_code, reference_code))
      .limit(1);

    if (!order || order.length === 0) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    const currentOrder = order[0];

    // Actualizar la orden en la base de datos
    await db
      .update(epaycoOrders)
      .set({
        status,
        transaction_id,
        ref_payco: refPayco, // Guardar ref_payco
        updated_at: new Date(),
      })
      .where(eq(epaycoOrders.id, currentOrder.id));

    console.log('Orden actualizada con ref_payco:', refPayco); // Log para verificar que se guardó ref_payco

    switch (status) {
      case EPAYCO_STATUS.APPROVED:
        redirectUrl = buildAbsoluteUrl(`/thankyou?orderId=${currentOrder.id}&status=approved`);
        break;
      case EPAYCO_STATUS.REJECTED:
      case EPAYCO_STATUS.FAILED:
        redirectUrl = buildAbsoluteUrl(`/order-failed?orderId=${currentOrder.id}&status=failed&reason=${encodeURIComponent(responseText)}`);
        break;
      case EPAYCO_STATUS.PENDING:
        redirectUrl = buildAbsoluteUrl(`/order-pending?orderId=${currentOrder.id}&status=pending`);
        break;
      default:
        redirectUrl = buildAbsoluteUrl('/checkout');
    }

    return NextResponse.json({
      success: true,
      redirectUrl,
    });

  } catch (error) {
    console.error('Error en GET /api/epayco/response:', error);
    return NextResponse.json(
      { error: 'Error procesando la respuesta' },
      { status: 500 }
    );
  }
}
