import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { users, products, transactions } from '@/lib/usuarios/schema';
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
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Buscar el usuario en la base de datos por clerk_id
    const userResult = await db.users
      .select()
      .from(users)
      .where(eq(users.clerk_id, userId));

    if (!userResult.length) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const currentSaldo = Number(userResult[0].saldo);
    if (currentSaldo < total) {
      return NextResponse.json(
        { error: "Saldo insuficiente" },
        { status: 400 }
      );
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

      // 2. Crear la transacción
      const [transactionResult] = await db.transactions
        .insert(transactions)
        .values({
          user_id: userId,
          amount: total,
          type: 'saldo',
          description: 'Compra de productos',
          products: JSON.stringify(productos),
          subtotal: total,
          tip: 0,
          shipping: '0',
          taxes: 0,
          total: total
        })
        .returning();

      // 3. Actualizar stock de productos
      for (const producto of productos) {
        const prodArr = await db.products
          .select()
          .from(products)
          .where(eq(products.id, producto.id));
        const prod = prodArr[0];

        if (!prod) {
          throw new Error(`Producto no encontrado: ${producto.name}`);
        }

        await db.products
          .update(products)
          .set({
            quantity: prod.quantity - producto.quantity,
          })
          .where(eq(products.id, producto.id));
      }

      // 4. Actualizar datos de envío del usuario SOLO si el campo está vacío/nulo en la base de datos
      const envioFields = [
        'address', 'house_apt', 'city', 'state', 'country', 'postal_code', 'phone', 'first_name', 'last_name'
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
        orderId: transactionResult.id
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

            
        
