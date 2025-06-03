import { NextResponse } from "next/server";
import db from "@/lib/db";
import { eq } from "drizzle-orm";
import { users } from "@/lib/register/schema";

export async function POST(req: Request) {
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop(); // Extrae el id de la URL
  const { amount } = await req.json();

  if (!amount || isNaN(amount) || amount <= 0) {
    return NextResponse.json({ error: "Monto inválido" }, { status: 400 });
  }

  try {
    // Buscar el usuario por ID
    const userArr = await db.users.select().from(users).where(eq(users.id, Number(id)));
    const user = userArr[0];
    if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

    // El campo puede ser string o integer, lo convertimos a número
    const currentBalance = typeof user.saldo === 'string' ? parseFloat(user.saldo) : Number(user.saldo) || 0;
    const newBalance = currentBalance + Number(amount);
    await db.users.update(users).set({ saldo: newBalance }).where(eq(users.id, Number(id)));

    return NextResponse.json({ message: "Saldo actualizado", newBalance });
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar saldo" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const allUsers = await db.users.select().from(users);
    return NextResponse.json(allUsers);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener usuarios" }, { status: 500 });
  }
}
