import { NextRequest } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import db from '@/lib/db';
import { users } from '@/lib/usuarios/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const { userId } = await getAuth(request);

  if (!userId) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
    });
  }

  const userResult = await db.usuarios.select().from(users).where(eq(users.clerk_id, userId));
  
  if (!userResult.length) {
    return new Response(JSON.stringify({ error: 'Usuario no encontrado' }), {
      status: 404,
    });
  }

  const saldo = userResult[0].saldo;

  return new Response(JSON.stringify({ saldo }), {
    status: 200,
  });
}
