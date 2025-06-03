// app/api/pagos/actualizar-estado/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { transactions } from '@/lib/transaction/schema';
import { orders } from '@/lib/payu/schema';

// app/api/pagos/actualizar/route.ts
export async function POST(req: NextRequest) {
    const { id, referenceCode, status, type } = await req.json();
    
    try {
      if (type === 'saldo') {
        await db.transactions
          .update(transactions)
          .set({ status })
          .where(eq(transactions.id, Number(id)));
      } else {
        await db.payu
          .update(orders)
          .set({ status })
          .where(eq(orders.referenceCode, referenceCode));
      }
      
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error updating status:', error);
      return NextResponse.json(
        { error: 'Error al actualizar el estado' },
        { status: 500 }
      );
    }
  }
