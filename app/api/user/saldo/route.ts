import { NextRequest } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import db from '@/lib/db';
import { users } from '@/lib/usuarios/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  console.log('✅ Iniciando solicitud a /api/user/saldo');
  try {
    const { userId } = await getAuth(request);
    console.log('🔍 Usuario autenticado:', userId);

    if (!userId) {
      console.warn('❌ No autorizado: usuario no autenticado');
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
      });
    }

    const userResult = await db.select().from(users).where(eq(users.clerk_id, userId));
    console.log('🔍 Resultado de búsqueda:', userResult);

    if (!userResult.length) {
      console.warn('❌ Usuario no encontrado:', userId);
      return new Response(JSON.stringify({ error: 'Usuario no encontrado' }), {
        status: 404,
      });
    }

    const saldo = userResult[0].saldo;
    console.log('✅ Saldo obtenido:', saldo);

    return new Response(JSON.stringify({ saldo }), {
      status: 200,
    });

  } catch (error) {
    console.error('💥 Error interno:', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
    });
  }
}
