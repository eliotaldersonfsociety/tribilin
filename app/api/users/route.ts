import { NextResponse } from "next/server";
import db from "@/lib/db";
import { users } from "@/lib/register/schema";

export async function GET() {
  try {
    const allUsers = await db.users.select().from(users);
    return new NextResponse(JSON.stringify(allUsers), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, must-revalidate",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener usuarios" }, { status: 500 });
  }
}
