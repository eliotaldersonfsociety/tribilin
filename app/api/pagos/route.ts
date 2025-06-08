// ./app/api/pagos/route.ts
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/index';
import { epaycoOrders, epaycoOrderItems } from '@/lib/epayco/schema';
import { users, products } from '@/lib/usuarios/schema';
import { eq } from 'drizzle-orm';
import { getAuth } from '@clerk/nextjs/server';
import { sql } from 'drizzle-orm'; // Importamos sql para tipos numéricos en SQLite

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productos, total } = body;

    // Obtener usuario autenticado
    const { userId } = await getAuth(request);
    if (!userId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    // Buscar usuario
    const userResult = await db.users.select().from(users).where(eq(users.clerk_id, userId));
    if (!userResult.length) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

    const currentSaldo = Number(userResult[0].saldo);
    if (currentSaldo < total) return NextResponse.json({ error: "Saldo insuficiente" }, { status: 400 });

    // Verificar stock
    for (const producto of productos) {
      const prodArr = await db.products.select().from(products).where(eq(products.id, producto.id));
      const prod = prodArr[0];
      if (!prod || prod.quantity < producto.quantity) {
        return NextResponse.json({ error: `Stock insuficiente para ${producto.name}` }, { status: 400 });
      }
    }

    // Procesar transacción
    try {
      // 1. Actualizar saldo
      const newBalance = currentSaldo - total;
      await db.users.update(users)
        .set({ saldo: newBalance.toString() })
        .where(eq(users.clerk_id, userId));

      // 2. Generar código de referencia
      const referenceCode = `SALDO_${Date.now().toString()}`;

      // 3. Calcular campos obligatorios
      const buyerName = body.name || `${userResult[0].first_name} ${userResult[0].last_name}`.trim();
      const buyerEmail = userResult[0].email || '';
      const documentType = body.documentType || 'CC';
      const documentNumber = body.document || '';

      // 4. Insertar en epayco_orders y devolver el ID generado
      const [inserted] = await db.epayco.insert(epaycoOrders)
        .values({
          reference_code: referenceCode,
          clerk_id: userId,
          amount: sql<number>`CAST(${total} AS REAL)`,
          tax: sql<number>`CAST(${total * 0.19} AS REAL)`,
          tax_base: sql<number>`CAST(${total * 0.19} AS REAL)`,
          tip: sql<number>`0`,
          status: 'APPROVED',
          shipping_address: body.address || '',
          shipping_city: body.city || '',
          shipping_country: 'Colombia',
          phone: body.phone || '',
          buyer_email: buyerEmail,
          buyer_name: buyerName,
          document_type: documentType,
          document_number: documentNumber,
          processing_date: sql<number>`${Math.floor(Date.now() / 1000)}`,
          updated_at: sql<number>`${Math.floor(Date.now() / 1000)}`,
          transaction_id: null,
          ref_payco: null,
        })
        .returning({ id: epaycoOrders.id }); // ✅ Obtiene el ID directamente

      const insertedId = inserted.id;

      // 5. Insertar items en epayco_order_items
      for (const producto of productos) {
        const prodArr = await db.products.select().from(products).where(eq(products.id, producto.id));
        const prod = prodArr[0];
        await db.insert(epaycoOrderItems).values({
          order_id: insertedId,
          product_id: producto.id.toString(),
          title: producto.name,
          price: producto.price,
          quantity: producto.quantity,
          image: producto.image?.toString() || '',
          color: producto.color || '',
          size: producto.size || '',
          size_range: producto.sizeRange || '',
        });
      }

      // 6. Actualizar stock
      for (const producto of productos) {
        const prodArr = await db.products.select().from(products).where(eq(products.id, producto.id));
        const prod = prodArr[0];
        await db.update(products)
          .set({ quantity: prod.quantity - producto.quantity })
          .where(eq(products.id, producto.id));
      }

      return NextResponse.json({
        success: true,
        message: 'Pago procesado',
        newBalance: newBalance.toString(),
        orderId: insertedId.toString(),
        referenceCode: referenceCode
      });

    } catch (error) {
      console.error('Error en transacción:', error);
      throw error;
    }

  } catch (error: any) {
    console.error('Error al procesar la transacción:', error);
    return NextResponse.json(
      { error: 'Error al procesar la transacción', details: error?.message || 'Error desconocido' },
      { status: 500 }
    );
  }
}
