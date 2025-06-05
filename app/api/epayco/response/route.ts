// app/api/epayco/response/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/epayco/db';
import { epaycoOrders } from '@/lib/epayco/schema';
import { eq } from 'drizzle-orm';
import { mapEpaycoStatus, EPAYCO_STATUS } from '@/lib/epayco/config';

// ✅ Manejo del GET para redirección desde ePayco
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const refPayco = searchParams.get('ref_payco');

    if (!refPayco) {
      return NextResponse.redirect('/checkout', 302);
    }

    // ePayco no nos da toda la info por GET, solo el ref_payco.
    // Redirigimos a una página donde el frontend puede hacer fetch al backend (con POST, usando x_id_invoice).
    // Esto asume que ya el webhook de "confirmation" procesó los datos correctamente.

    return NextResponse.redirect(`/thankyou/ok?ref_payco=${refPayco}`, 302);
  } catch (error) {
    console.error('Error en GET /api/epayco/response:', error);
    return NextResponse.redirect('/checkout', 302);
  }
}

// ✅ POST para cuando recibes datos estructurados desde ePayco (webhook o fetch del frontend)
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

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
    let redirectUrl = '/checkout';

    const order = await db
      .select()
      .from(epaycoOrders)
      .where(eq(epaycoOrders.reference_code, reference_code))
      .limit(1);

    if (!order || order.length === 0) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    const currentOrder = order[0];

    await db
      .update(epaycoOrders)
      .set({
        status,
        transaction_id,
        ref_payco: refPayco, // Guardar ref_payco en la base de datos
        updated_at: new Date(),
      })
      .where(eq(epaycoOrders.id, currentOrder.id));

    switch (status) {
      case EPAYCO_STATUS.APPROVED:
        redirectUrl = `/thankyou?orderId=${currentOrder.id}&status=approved`;
        break;
      case EPAYCO_STATUS.REJECTED:
      case EPAYCO_STATUS.FAILED:
        redirectUrl = `/order-failed?orderId=${currentOrder.id}&status=failed&reason=${encodeURIComponent(responseText)}`;
        break;
      case EPAYCO_STATUS.PENDING:
        redirectUrl = `/order-pending?orderId=${currentOrder.id}&status=pending`;
        break;
      default:
        redirectUrl = '/checkout';
    }

    return NextResponse.json({
      success: true,
      redirectUrl,
    });

  } catch (error) {
    console.error('Error en POST /api/epayco/response:', error);
    return NextResponse.json(
      { error: 'Error procesando la respuesta' },
      { status: 500 }
    );
  }
}
