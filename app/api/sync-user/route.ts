import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { users } from "@/lib/usuarios/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const user = body.data;

  if (!user || !user.id) {
    return NextResponse.json({ error: "No user data" }, { status: 400 });
  }

  const email = user.email_addresses[0]?.email_address;

  if (!email) {
    return NextResponse.json({ error: "No email provided" }, { status: 400 });
  }

  // Verificar si ya hay un usuario con ese email
  const existing = await db.users
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (existing.length > 0) {
    // Usuario ya existe, actualiza el clerk_id
    await db.users
      .update(users)
      .set({
        clerk_id: user.id,
        phone: user.phone_numbers[0]?.phone_number,
        first_name: user.first_name ?? "",
        last_name: user.last_name ?? "",
      })
      .where(eq(users.email, email));
  } else {
    // No existe, se inserta como nuevo
    await db.users.insert(users).values({
      clerk_id: user.id,
      email,
      phone: user.phone_numbers[0]?.phone_number,
      first_name: user.first_name ?? "",
      last_name: user.last_name ?? "",
    });
  }

  return NextResponse.json({ ok: true });
}
