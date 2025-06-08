import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/index';
import { epaycoOrders, epaycoOrderItems } from '@/lib/epayco/schema';
import { users, products } from '@/lib/usuarios/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { getAuth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validación con Zod
    const pagoSchema = z.object({
      productos: z.array(z.object({
        id: z.number(),
        name: z.string(),
        quantity: z.number().int().positive(),
      })),
      total: z.number().positive(),
      type: z.string().optional(),
    });
    const parseResult = pagoSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: 'Datos inválidos en el pago', detalles: parseResult.error.errors }, { status: 400 });
    }

    const { productos, total, type } = parseResult.data;

    // Obtener usuario autenticado con Clerk
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Buscar el usuario en la base de datos por clerk_id
    const userResult = await db.users
      .select()
      .from(users)
      .where(eq(users.clerk_id, userId));

    if (!userResult.length) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const currentSaldo = Number(userResult[0].saldo);
    if (currentSaldo < total) {
      return NextResponse.json({ error: "Saldo insuficiente" }, { status: 400 });
    }

    // Verificar que todos los productos existan y tengan stock
    for (const producto of productos) {
      const prodArr = await db.products
        .select()
        .from(products)
        .where(eq(products.id, producto.id));
      const prod = prodArr[0];

      if (!prod) {
        return NextResponse.json(
          { error: `Producto no encontrado: ${producto.name}` },
          { status: 404 }
        );
      }

      if (prod.quantity < producto.quantity) {
        return NextResponse.json(
          { error: `Stock insuficiente para ${producto.name}` },
          { status: 400 }
        );
      }
    }

    // Procesar la transacción
    try {
      // 1. Actualizar saldo del usuario
      const newBalance = currentSaldo - total;
      await db.users
        .update(users)
        .set({ saldo: newBalance.toString() })
        .where(eq(users.clerk_id, userId));

      // 2. Generar código de referencia único para pagos con saldo
      const orderId = Date.now().toString(); // Puedes usar UUID o un generador más robusto
      const referenceCode = `SALDO_${orderId}`;

      // 3. Calcular campos obligatorios del esquema
      const taxRate = 0.19; // 19% de impuesto
      const taxBase = total * taxRate; // tax_base basado en el subtotal
      const buyerName = body.name || `${userResult[0].first_name} ${userResult[0].last_name}`.trim();
      const buyerEmail = userResult[0].email || '';
      const documentType = body.documentType || 'CC';
      const documentNumber = body.document || '';

      // 4. Insertar en epaycoOrders
      await db.epayco.insert(epaycoOrders).values({
        id: orderId,
        reference_code: referenceCode,
        clerk_id: userId,
        amount: total,
        tax: total * taxRate,
        tax_base: taxBase,
        tip: 0,
        status: 'APPROVED',
        shipping_address: body.address || '',
        shipping_city: body.city || '',
        shipping_country: body.country || 'Colombia',
        phone: body.phone || '',
        buyer_email: buyerEmail,
        buyer_name: buyerName,
        document_type: documentType,
        document_number: documentNumber,
        processing_date: Math.floor(Date.now() / 1000), // Fecha de procesamiento en segundos
        updated_at: Math.floor(Date.now() / 1000), // Fecha de actualización en segundos
        transaction_id: null,
        ref_payco: null,
      });

      // 5. Insertar items en epayco_order_items
      for (const producto of productos) {
        const prodArr = await db.products
          .select()
          .from(products)
          .where(eq(products.id, producto.id));
        const prod = prodArr[0];

        await db.epayco.insert(epaycoOrderItems).values({
          order_id: orderId,
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

      // 6. Actualizar stock de productos
      for (const producto of productos) {
        const prodArr = await db.products
          .select()
          .from(products)
          .where(eq(products.id, producto.id));
        const prod = prodArr[0];

        await db.products
          .update(products)
          .set({
            quantity: prod.quantity - producto.quantity,
          })
          .where(eq(products.id, producto.id));
      }

      // 7. Actualizar datos de envío del usuario SOLO si están vacíos
      const envioFields = [
        'address', 'city', 'country', 'phone'
      ];
      const envioUpdate: Record<string, any> = {};
      const usuarioActual = userResult[0];

      for (const field of envioFields) {
        const key = field as keyof typeof usuarioActual;
        if (
          (usuarioActual[key] === undefined || usuarioActual[key] === null || usuarioActual[key] === "") &&
          body[field] !== undefined && body[field] !== null && body[field] !== ""
        ) {
          envioUpdate[field] = body[field];
        }
      }

      if (Object.keys(envioUpdate).length > 0) {
        await db.users
          .update(users)
          .set(envioUpdate)
          .where(eq(users.clerk_id, userId));
      }

      return NextResponse.json({ 
        success: true,
        message: 'Pago procesado correctamente',
        newBalance: newBalance.toString(),
        orderId: orderId,
        referenceCode: referenceCode
      });

    } catch (error) {
      throw error;
    }

  } catch (error: any) {
    console.error('Error al procesar la transacción:', error);
    return NextResponse.json(
      { 
        error: 'Error al procesar la transacción',
        details: error?.message || 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
