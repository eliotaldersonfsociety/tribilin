import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/epayco/db';
import { epaycoOrders } from '@/lib/epayco/schema';
import { eq, sql } from 'drizzle-orm';
import { mapEpaycoStatus } from '@/lib/epayco/config';

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData(); // ✅ cambia esto
    
    const refPayco = form.get('x_ref_payco') as string;
    const transaction_id = form.get('x_ref_payco') as string;
    const transactionState = form.get('x_transaction_state') as string;
    const reference_code = form.get('x_id_invoice') as string;
    const amount = form.get('x_amount') as string;
    const currency = form.get('x_currency_code') as string;
    const test = form.get('x_test_request') as string;

    if (!reference_code || !transactionState) {
      return NextResponse.json(
        { error: 'Datos de confirmación incompletos' },
        { status: 400 }
      );
    }

    const status = mapEpaycoStatus(transactionState);

    await db
      .update(epaycoOrders)
      .set({
        status,
        transaction_id,
        ref_payco: refPayco,
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
