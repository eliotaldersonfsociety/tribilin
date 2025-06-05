import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/epayco/db';
import { epaycoOrders } from '@/lib/epayco/schema';
import { eq } from 'drizzle-orm';
import { mapEpaycoStatus, EPAYCO_STATUS } from '@/lib/epayco/config';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const {
      x_ref_payco: transactionId,
      x_transaction_state: transactionState,
      x_id_invoice: reference_code, // Cambiado de referenceCode a reference_code
      x_response: response,
      x_response_reason_text: responseText,
    } = data;

    if (!reference_code) { // Cambiado de referenceCode a reference_code
      return NextResponse.json(
        { error: 'Referencia no encontrada' },
        { status: 400 }
      );
    }

    const status = mapEpaycoStatus(transactionState);
    let redirectUrl = '/checkout';

    // Buscar la orden en la base de datos
    const order = await db
      .select()
      .from(epaycoOrders)
      .where(eq(epaycoOrders.reference_code, reference_code)) // Cambiado de referenceCode a reference_code
      .limit(1);

    if (order && order.length > 0) {
      switch (status) {
        case EPAYCO_STATUS.APPROVED:
          redirectUrl = `/thankyou?orderId=${order[0].id}&status=approved`;
          break;
        case EPAYCO_STATUS.REJECTED:
        case EPAYCO_STATUS.FAILED:
          redirectUrl = `/order-failed?orderId=${order[0].id}&status=failed&reason=${encodeURIComponent(responseText)}`;
          break;
        case EPAYCO_STATUS.PENDING:
          redirectUrl = `/order-pending?orderId=${order[0].id}&status=pending`;
          break;
        default:
          redirectUrl = '/checkout';
      }
    }

    return NextResponse.json({
      success: true,
      redirectUrl,
    });

  } catch (error) {
    console.error('Error en respuesta de ePayco:', error);
    return NextResponse.json(
      { error: 'Error procesando la respuesta' },
      { status: 500 }
    );
  }
}
