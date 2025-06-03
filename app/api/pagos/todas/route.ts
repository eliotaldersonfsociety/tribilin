import { db } from '@/lib/db';
import { transactions as transactionsTable, ProductItem } from '@/lib/transaction/schema';
import { orders } from '@/lib/payu/schema';
import { users as usersTable } from '@/lib/usuarios/schema';
import { eq, desc, sql, inArray } from 'drizzle-orm';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(req: NextRequest): Promise<Response> {
  try {
    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const type = url.searchParams.get('type') || 'saldo';
    const limit = 10;
    const offset = (page - 1) * limit;

    let transactions: any[] = [];
    let totalCount = 0;

    if (type === 'payu') {
      // Todas las compras PayU
      const payuTransactions = await db.payu
        .select({
          id: orders.referenceCode,
          user_id: orders.buyerEmail,
          user_email: orders.buyerEmail,
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
          total: orders.TX_VALUE,
          status: orders.status
        })
        .from(orders)
        .orderBy(desc(orders.processingDate))
        .prepare();

      const results = await payuTransactions.execute();
      console.log("PayU results:", results);
      totalCount = results.length;
      const ids = results.map(r => r.id);
      console.log("IDs únicos en results:", new Set(ids).size, "Total:", ids.length);
      transactions = results.slice(offset, offset + limit).map(tx => ({
        ...tx,
        user_email: tx.user_email || tx.user_id
      }));
    } else {
      // Todas las compras con saldo
      const results = await db.transactions
        .select()
        .from(transactionsTable)
        .orderBy(desc(transactionsTable.created_at));

      console.log("Saldo results:", results);
      totalCount = results.length;

      // Obtén todos los clerk_id únicos de las transacciones de la página actual
      const userIds = results
        .slice(offset, offset + limit)
        .map(tx => tx.user_id)
        .filter((v, i, a) => a.indexOf(v) === i);

      // Busca los emails de esos usuarios
      const users = await db.users
        .select({ clerk_id: usersTable.clerk_id, email: usersTable.email })
        .from(usersTable)
        .where(inArray(usersTable.clerk_id, userIds));

      // Crea un mapa de clerk_id a email
      const userIdToEmail = Object.fromEntries(users.map(u => [u.clerk_id, u.email]));

      transactions = results
        .slice(offset, offset + limit)
        .map(tx => {
          console.log("tx.id:", tx.id, "tx.status:", tx.status);
          let parsedProducts: ProductItem[];
          try {
            if (typeof tx.products === 'string') {
              parsedProducts = JSON.parse((tx.products as string).replace(/\n/g, '').trim());
            } else if (Array.isArray(tx.products)) {
              parsedProducts = tx.products;
            } else {
              parsedProducts = [];
            }
          } catch (error) {
            parsedProducts = [{
              name: tx.description || 'Producto sin nombre',
              price: tx.total || 0,
              quantity: 1
            }];
          }
          return {
            ...tx,
            user_email: userIdToEmail[tx.user_id] || tx.user_id || "",
            products: parsedProducts,
            status: tx.status
          };
        });
    }

    console.log("Transacciones devueltas al frontend:", transactions);

    // Opcional: puedes incluir datos del usuario en cada compra
    // (solo para saldo, para PayU ya viene el email)
    // Si quieres, puedes hacer un join o una consulta adicional aquí

    return NextResponse.json({
      purchases: transactions,
      pagination: {
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        currentPage: page,
        hasMore: offset + transactions.length < totalCount
      }
    });
  } catch (error: any) {
    console.error("Error en /api/pagos/todas:", error);
    return NextResponse.json({
      error: 'Error al procesar la solicitud',
      details: error.message
    }, { status: 500 });
  }
}
