// pages/api/wishlist/numero/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import db from '@/lib/db';
import { wishlist } from '@/lib/wishlist/schema';
import { eq } from 'drizzle-orm';

function log(message: string, data?: any) {
  console.log(`[Wishlist API] ${new Date().toISOString()} - ${message}`, data !== undefined ? data : '');
}

export async function GET(req: NextRequest) {
  log('--- GET Request Received ---');

  // Autenticación con Clerk
  const { userId } = await auth();
  if (!userId) {
    log('Unauthorized access detected. No userId.');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  log('User ID:', userId);

  try {
    log('Intentando contar el número de filas de wishlist para el usuario...');
    const result = await db.wishlist
      .select()
      .from(wishlist)
      .where(eq(wishlist.userId, userId));

    const wishlistCount = result.length;
    log('Wishlist count:', wishlistCount);
    log('--- GET Request Success ---');

    return NextResponse.json({ wishlistCount });
  } catch (error) {
    log('!!! Drizzle DB Error counting wishlist:', error);
    log('--- GET Request Failed (Drizzle DB Error) ---');
    return NextResponse.json({ error: 'Failed to count wishlist' }, { status: 500 });
  }
}
