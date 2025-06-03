// app/api/update-payment-status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/index'; // Drizzle client
import { orders } from '@/lib/payu/schema'; // Drizzle schema
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  let data;
  const contentType = req.headers.get("content-type") || "";

  try {
    if (contentType.includes("application/json")) {
      data = await req.json();
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const text = await req.text();
      data = Object.fromEntries(new URLSearchParams(text));
    } else {
      // Intenta parsear como x-www-form-urlencoded por defecto si falla el JSON
      const text = await req.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = Object.fromEntries(new URLSearchParams(text));
      }
    }
  } catch (err) {
    console.error("Error parseando el body:", err);
    return new Response(JSON.stringify({ error: "Body inválido" }), { status: 400 });
  }

  console.log("Datos recibidos:", data);

  try {
    const referenceCode = data.referenceCode || data.reference_sale;
    const transactionState = data.transactionState || data.response_message_pol;

    // Validar que se proporcionaron ambos parámetros
    if (!referenceCode || !transactionState) {
      return NextResponse.json({ error: 'Referencia y estado de transacción son necesarios' }, { status: 400 });
    }

    // Actualizar el estado de la transacción en la tabla orders
    const updateResult = await db.transactions
      .update(orders)
      .set({ transactionState })
      .where(eq(orders.referenceCode, referenceCode));

    if (updateResult.rowsAffected === 0) {
      return NextResponse.json({ error: 'Orden no encontrada o ya actualizada' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Estado de pago actualizado correctamente' });
  } catch (error: any) {
    console.error('Error actualizando el estado del pago:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}
