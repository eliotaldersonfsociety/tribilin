import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/epayco/db';
import { epaycoOrders } from '@/lib/epayco/schema';
import { eq, sql } from 'drizzle-orm';
import { mapEpaycoStatus } from '@/lib/epayco/config';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const {
      x_ref_payco: transaction_id,
      x_transaction_state: transactionState,
      x_id_invoice: reference_code,
      x_amount: amount,
      x_currency_code: currency,
      x_test_request: test,
    } = data;

    if (!reference_code || !transactionState) {
      return NextResponse.json(
        { error: 'Datos de confirmación incompletos' },
        { status: 400 }
      );
    }

    const status = mapEpaycoStatus(transactionState);

    // Actualizar el estado de la orden
    await db
      .update(epaycoOrders)
      .set({
        status,
        transaction_id,
        processing_date: sql`strftime('%s', 'now')`,
        updated_at: sql`strftime('%s', 'now')`,
      })
      .where(eq(epaycoOrders.reference_code, reference_code));

    return NextResponse.json({
      success: true,
      message: 'Confirmación procesada correctamente',
    });

  } catch (error) {
    console.error('Error en confirmación de ePayco:', error);
    return NextResponse.json(
      { error: 'Error procesando la confirmación' },
      { status: 500 }
    );
  }
}
