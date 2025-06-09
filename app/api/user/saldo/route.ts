import { NextRequest } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import db from '@/lib/db';
import { users } from '@/lib/usuarios/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  console.log('✅ 1. Llamada a /api/user/saldo recibida'); // ✅ Log de entrada

  try {
    const { userId } = await getAuth(request);
    console.log('🔍 2. Usuario autenticado:', userId); // ✅ Log de usuario

    if (!userId) {
      console.warn('❌ 3. No autorizado: usuario no autenticado');
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
      });
    }

    // Ejecutar consulta con log
    console.log('🔍 4. Buscando usuario en la base de datos...');
    const userResult = await db.users.select().from(usuarios).where(eq(usuarios.clerk_id, userId));

    console.log('🔍 5. Resultado de búsqueda:', userResult); // ✅ Log de resultado

    if (!userResult.length) {
      console.warn('❌ 6. Usuario no encontrado:', userId);
      return new Response(JSON.stringify({ error: 'Usuario no encontrado' }), {
        status: 404,
      });
    }

    const saldo = userResult[0].saldo;
    console.log('✅ 7. Saldo obtenido:', saldo); // ✅ Log de éxito

    return new Response(JSON.stringify({ saldo }), {
      status: 200,
    });

  } catch (error) {
    console.error('💥 8. Error interno:', error); // ✅ Log de error
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
    });
  }
}
