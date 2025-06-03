import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, purchases } from '@/lib/usuarios/schema';
import { eq, desc } from 'drizzle-orm';
import { getAuth } from '@clerk/nextjs/server';

export async function GET(request: Request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Obtener el ID interno del usuario desde la tabla users
    const userResult = await db.select()
      .from(users)
      .where(eq(users.clerk_id, userId));

    if (!userResult.length) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const internalUserId = userResult[0].id;

    // Obtener todas las compras del usuario
    const userPurchases = await db.select()
      .from(purchases)
      .where(eq(purchases.user_id, internalUserId))
      .orderBy(desc(purchases.created_at));

    return NextResponse.json({
      orders: userPurchases.map(purchase => ({
        id: purchase.id,
        created_at: purchase.created_at,
        status: purchase.status,
        item: {
          id: purchase.id,
          name: purchase.item_name,
          quantity: purchase.quantity,
          price: purchase.price
        },
        shipping: {
          name: purchase.name,
          lastname: purchase.lastname,
          address: purchase.direction,
          postal: purchase.postalcode,
          phone: purchase.phone,
          email: purchase.email
        },
        payment_method: purchase.payment_method
      }))
    });

  } catch (error: any) {
    console.error('Error al obtener las órdenes del usuario:', error);
    return NextResponse.json(
      { 
        error: 'Error al obtener las órdenes',
        details: error?.message || 'Error desconocido'
      },
      { status: 500 }
    );
  }
}