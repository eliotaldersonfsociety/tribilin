import { db } from '@/lib/db';
import { transactions as transactionsTable, ProductItem } from '@/lib/transaction/schema';
import { orders } from '@/lib/payu/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { users as usersTable } from '@/lib/usuarios/schema';

interface Transaction {
  id: number;
  user_id: string;
  amount: number;
  type: string;
  description: string;
  created_at: string | number;
  products: string | ProductItem[];
  subtotal: number;
  tip: number;
  shipping: string;
  taxes: number;
  total: number;
}

export async function GET(req: NextRequest): Promise<Response> {
  try {
    // Obtener parámetros de la URL
    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const type = url.searchParams.get('type') || 'saldo';
    const limit = 10;
    const offset = (page - 1) * limit;

    // Autenticación con Clerk
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Buscar datos del usuario en la base de datos
    const userResult = await db.users
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerk_id, userId));

    if (!userResult.length) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
    const user = userResult[0];

    let transactions;
    let totalCount = 0;

    if (type === 'payu') {
      // Transacciones PayU (por email)
      const payuTransactions = await db.payu
        .select({
          id: orders.referenceCode,
          user_id: orders.buyerEmail,
          amount: orders.TX_VALUE,
          type: sql<string>`'CARD'`,
          description: sql<string>`''`,
          created_at: orders.processingDate,
          products: sql<string>`json_array(json_object(
            'name', 'Compra PayU',
            'price', ${orders.TX_VALUE},
            'quantity', 1
          ))`,
          subtotal: orders.TX_VALUE,
          tip: sql<number>`0`,
          shipping: sql<string>`'Gratis'`,
          taxes: sql<number>`0`,
          total: orders.TX_VALUE
        })
        .from(orders)
        .where(eq(orders.buyerEmail, user.email))
        .orderBy(desc(orders.processingDate))
        .prepare();

      const results = await payuTransactions.execute();
      totalCount = results.length;
      transactions = results.slice(offset, offset + limit);
    } else {
      // Transacciones regulares (por clerk_id)
      const regularTransactions = await db.transactions
        .select()
        .from(transactionsTable)
        .where(eq(transactionsTable.user_id, userId))
        .orderBy(desc(transactionsTable.created_at))
        .prepare();

      const results = await regularTransactions.execute();
      const sortedResults = (results as Transaction[]).sort((a, b) => {
        const dateA = typeof a.created_at === 'string' ? new Date(a.created_at).getTime() : Number(a.created_at);
        const dateB = typeof b.created_at === 'string' ? new Date(b.created_at).getTime() : Number(b.created_at);
        return dateB - dateA;
      });
      totalCount = sortedResults.length;
      transactions = sortedResults
        .slice(offset, offset + limit)
        .map(tx => {
          let parsedProducts: ProductItem[];
          try {
            parsedProducts = typeof tx.products === 'string' ? JSON.parse(tx.products.replace(/\n/g, '').trim()) : tx.products as ProductItem[];
          } catch (error) {
            parsedProducts = [{
              name: tx.description || 'Producto sin nombre',
              price: tx.total || 0,
              quantity: 1
            }];
          }
          return {
            ...tx,
            products: parsedProducts
          };
        });
    }

    // Agregar datos del usuario a las transacciones
    const purchasesWithUserData = transactions.map((purchase: any) => ({
      ...purchase,
      customer: {
        name: user.first_name || null,
        email: user.email || null,
        address: user.address || null,
        house_apt: user.house_apt || null,
        city: user.city || null,
        state: user.state || null,
        postal_code: user.postal_code || null,
        phone: user.phone || null
      }
    }));

    return NextResponse.json({
      purchases: purchasesWithUserData,
      pagination: {
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        currentPage: page,
        hasMore: offset + transactions.length < totalCount
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      error: 'Error al procesar la solicitud',
      details: error.message
    }, { status: 500 });
  }
}
