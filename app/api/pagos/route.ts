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
    console.log('1. Iniciando solicitud POST /api/pagos');

    const body = await request.json();
    console.log('2. Cuerpo de la solicitud:', body);

    const { productos, total, tip } = body;

    if (!productos || !Array.isArray(productos)) {
      console.error('⚠️ Productos no válidos:', productos);
      return NextResponse.json({ error: "Productos no proporcionados o formato incorrecto" }, { status: 400 });
    }

    if (typeof total !== 'number' || isNaN(total)) {
      console.error('⚠️ Total no válido:', total);
      return NextResponse.json({ error: "Total no válido" }, { status: 400 });
    }

    // Obtener usuario autenticado
    const { userId } = await getAuth(request);
    console.log('3. Usuario autenticado:', userId);

    if (!userId) {
      console.warn('❌ No autorizado: usuario no autenticado');
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Buscar usuario
    const userResult = await db.users.select().from(users).where(eq(users.clerk_id, userId));
    console.log('4. Resultado de búsqueda de usuario:', userResult);

    if (!userResult.length) {
      console.warn('❌ Usuario no encontrado:', userId);
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const currentSaldo = Number(userResult[0].saldo);
    console.log('5. Saldo actual del usuario:', currentSaldo);
    console.log('   Total requerido:', total);

    if (currentSaldo < total) {
      console.warn('❌ Saldo insuficiente para realizar el pago');
      return NextResponse.json({ error: "Saldo insuficiente" }, { status: 400 });
    }

    // Verificar stock
    console.log('6. Verificando stock...');
    for (const producto of productos) {
      const prodArr = await db.products.select().from(products).where(eq(products.id, producto.id));
      const prod = prodArr[0];
      console.log(`   Producto ${producto.id}:`, prod);

      if (!prod || prod.quantity < producto.quantity) {
        console.warn(`❌ Stock insuficiente para ${producto.name}`);
        return NextResponse.json({ error: `Stock insuficiente para ${producto.name}` }, { status: 400 });
      }
    }

    // Procesar transacción
    try {
      // 1. Actualizar saldo
      const newBalance = currentSaldo - total;
      console.log('7. Actualizando saldo a:', newBalance);

      await db.users.update(users)
        .set({ saldo: newBalance.toString() })
        .where(eq(users.clerk_id, userId));

      console.log('8. Saldo actualizado correctamente');

      // 2. Generar código de referenciaaaa
      const referenceCode = `SALDO_${Date.now().toString()}`;
      console.log('9. Código de referencia generado:', referenceCode);

      // 3. Calcular campos obligatorios
      const buyerName = body.name || `${userResult[0].first_name} ${userResult[0].last_name}`.trim();
      const buyerEmail = userResult[0].email || '';
      const documentType = body.documentType || 'CC';
      const documentNumber = body.document || '';

      console.log('10. Campos obligatorios calculados:', {
        buyerName,
        buyerEmail,
        documentType,
        documentNumber
      });

      // 4. Insertar en epayco_orders y devolver el ID generado
      console.log('11. Insertando orden en ePayco...');

      const [inserted] = await db.epayco.insert(epaycoOrders)
        .values({
          reference_code: referenceCode,
          clerk_id: userId,
          amount: sql<number>`CAST(${total} AS REAL)`,
          tax: sql<number>`CAST(${total * 0.19} AS REAL)`,
          tax_base: sql<number>`CAST(${total * 0.19} AS REAL)`,
          tip: sql<number>`${tip || 0}`,
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

      const insertedId = inserted?.id;
      console.log('12. Orden insertada con ID:', insertedId);

      if (!insertedId) {
        throw new Error('No se pudo obtener el ID de la orden insertada');
      }

      // 5. Insertar items en epayco_order_items
      console.log('13. Insertando items de la orden...');

      for (const producto of productos) {
        const prodArr = await db.products.select().from(products).where(eq(products.id, producto.id));
        const prod = prodArr[0];

        await db.epayco.insert(epaycoOrderItems).values({
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

        console.log(`   Item insertado: ${producto.id} - ${producto.name}`);
      }

      // 6. Actualizar stock
      console.log('14. Actualizando stock...');

      for (const producto of productos) {
        const prodArr = await db.products.select().from(products).where(eq(products.id, producto.id));
        const prod = prodArr[0];

        await db.products.update(products)
          .set({ quantity: prod.quantity - producto.quantity })
          .where(eq(products.id, producto.id));

        console.log(`   Stock actualizado para producto: ${producto.id}`);
      }

      console.log('✅ Pago procesado exitosamente');

      return NextResponse.json({
        success: true,
        message: 'Pago procesado',
        newBalance: newBalance.toString(),
        orderId: insertedId.toString(),
        referenceCode: referenceCode
      });

    } catch (error) {
      console.error('🚨 Error en transacción:', error);
      throw error;
    }

  } catch (error: any) {
    console.error('💥 Error general en API:', error);
    return NextResponse.json(
      { error: 'Error al procesar la transacción', details: error?.message || 'Error desconocido' },
      { status: 500 }
    );
  }
}
