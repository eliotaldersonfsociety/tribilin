import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import db from '@/lib/db';
import { wishlist } from '@/lib/wishlist/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

function log(message: string, data?: any) {
  console.log(`[Wishlist API] ${new Date().toISOString()} - ${message}`, data !== undefined ? data : '');
}

// --- GET: Obtener wishlist del usuario
export async function GET(req: NextRequest) {
  log('--- GET Request Received ---');

  const { userId } = await auth();
  log('User ID:', userId);

  if (!userId) {
    log('Unauthorized access detected. No userId.');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const rows = await db.wishlist.select().from(wishlist).where(eq(wishlist.userId, userId));
    log('DB Result (rows):', rows);
    return NextResponse.json(rows);
  } catch (error) {
    log('!!! DB Error fetching wishlist:', error);
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
  }
}

// --- POST: Agregar un producto a la wishlist
export async function POST(req: NextRequest) {
  log('--- POST Request Received ---');

  const { userId } = await auth();
  log('User ID:', userId);

  if (!userId) {
    log('Unauthorized access detected. No userId.');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Validación con Zod
  const wishlistSchema = z.object({
    productId: z.number(),
    product: z.any().optional(),
  });

  let body;
  try {
    body = await req.json();
    log('Parsed request body:', body);
  } catch (error) {
    log('!!! Error parsing request body:', error);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parseResult = wishlistSchema.safeParse(body);
  if (!parseResult.success) {
    log('!!! Error de validación Zod:', parseResult.error);
    return NextResponse.json({ error: 'Datos inválidos en la petición', detalles: parseResult.error.errors }, { status: 400 });
  }

  const { productId, product } = parseResult.data;

  try {
    const existing = await db.wishlist.select()
      .from(wishlist)
      .where(and(eq(wishlist.userId, userId), eq(wishlist.productId, productId)));

    if (existing.length > 0) {
      log('Product already in wishlist. Removing it.');
      await db.wishlist.delete(wishlist)
        .where(and(eq(wishlist.userId, userId), eq(wishlist.productId, productId)));
      return NextResponse.json({ message: 'Product removed from wishlist' }, { status: 200 });
    } else {
      const insertData: any = { userId, productId };
      if (product) insertData.product = JSON.stringify(product);
      log('Insertando en wishlist:', insertData);
      await db.wishlist.insert(wishlist).values(insertData);
      log('DB Insert successful.');
      return NextResponse.json({ message: 'Item added to wishlist' }, { status: 201 });
    }
  } catch (error) {
    log('!!! DB Error adding to wishlist:', error);
    return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 });
  }
}

// --- DELETE: Eliminar un producto de la wishlist
export async function DELETE(req: NextRequest) {
  log('--- DELETE Request Received ---');

  const { userId } = await auth();
  log('User ID:', userId);

  if (!userId) {
    log('Unauthorized access detected. No userId.');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let productId: number;
  try {
    const searchParams = req.nextUrl.searchParams;
    const productIdString = searchParams.get('productId');

    if (!productIdString) {
      log('ProductId missing in query parameters.');
      return NextResponse.json({ error: 'ProductId query parameter is required' }, { status: 400 });
    }

    productId = Number(productIdString);
    log('Parsed productId from query:', productId);

  } catch (error) {
    log('!!! Error reading productId from query parameters:', error);
    return NextResponse.json({ error: 'Invalid ProductId query parameter' }, { status: 400 });
  }

  if (isNaN(productId)) {
    log('ProductId is not a valid number after parsing:', productId);
    return NextResponse.json({ error: 'Valid ProductId (number) is required' }, { status: 400 });
  }

  try {
    const existing = await db.wishlist.select()
      .from(wishlist)
      .where(and(eq(wishlist.userId, userId), eq(wishlist.productId, productId)));

    if (existing.length === 0) {
      log('Item not found in wishlist.');
      return NextResponse.json({ error: 'Item not found in wishlist' }, { status: 404 });
    }

    await db.wishlist.delete(wishlist)
      .where(and(eq(wishlist.userId, userId), eq(wishlist.productId, productId)));

    log('Item deleted successfully.');
    return NextResponse.json({ message: 'Item removed from wishlist' }, { status: 200 });

  } catch (error) {
    log('!!! DB Error deleting from wishlist:', error);
    return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 });
  }
}