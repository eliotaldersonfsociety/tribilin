import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/lib/db";
import { users } from "@/lib/usuarios/schema";
import { eq } from "drizzle-orm";

async function consultarSaldo(clerkId: string): Promise<number> {
  const result = await db.users
    .select({ saldoText: users.saldo })
    .from(users)
    .where(eq(users.clerk_id, clerkId));

  if (!result || result.length === 0) return 0;

  const saldoNum = parseFloat(result[0].saldoText ?? "0");
  return isNaN(saldoNum) ? 0 : saldoNum;
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  try {
    const saldo = await consultarSaldo(userId);
    return NextResponse.json({ saldo });
  } catch (err) {
    console.error("[BALANCE] Error:", err);
    return NextResponse.json({ message: "Error al consultar saldo" }, { status: 500 });
  }
}
