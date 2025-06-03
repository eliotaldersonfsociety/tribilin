import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { visitas } from "@/lib/visitas/schema";
import { eq } from "drizzle-orm";

// Fuera de la función GET, para que persista en memoria
const ipCountryCache: Record<string, { country: string, timestamp: number }> = {};
const CACHE_DURATION = 60 * 60 * 1000; // 1 hora en milisegundos

async function getCountryByIp(ip: string): Promise<string> {
  try {
    if (ip === "127.0.0.1" || ip === "127:0:1" || ip === "unknown") return "Desconocido";
    const now = Date.now();
    // Si está en cache y no ha expirado
    if (ipCountryCache[ip] && (now - ipCountryCache[ip].timestamp < CACHE_DURATION)) {
      return ipCountryCache[ip].country;
    }
    const res = await fetch(`http://ip-api.com/json/${ip}`);
    const data = await res.json();
    const country = data.country || "Desconocido";
    // Guarda en cache
    ipCountryCache[ip] = { country, timestamp: now };
    return country;
  } catch {
    return "Desconocido";
  }
}

export async function POST(request: Request) {
  console.log("[VISITAS] Endpoint llamado");
  try {
    const { pathname } = await request.json().catch(() => ({ pathname: "/" }));
    console.log("[VISITAS] Pathname recibido:", pathname);

    // Obtener la IP del visitante
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";
    console.log("[VISITAS] IP detectada:", ip);

    // Buscar si ya existe la IP
    const existing = await db.visitas.select().from(visitas).where(eq(visitas.ip, ip));
    if (existing.length > 0) {
      // Actualiza el contador y las rutas
      const actual = existing[0];
      let rutas: string[] = [];
      try {
        rutas = actual.rutas ? JSON.parse(actual.rutas) : [];
      } catch {
        rutas = [];
      }
      // Agrega la ruta solo si no existe
      if (!rutas.includes(pathname)) {
        rutas.push(pathname);
      }
      await db.visitas
        .update(visitas)
        .set({
          visita: (actual.visita || 1) + 1,
          rutas: JSON.stringify(rutas),
        })
        .where(eq(visitas.ip, ip));
      return NextResponse.json({ ok: true, updated: true, rutas });
    } else {
      // Si no existe, crea el registro
      await db.visitas.insert(visitas).values({
        ip,
        fecha: new Date().toISOString(),
        rutas: JSON.stringify([pathname]),
        visita: 1,
      });
      return NextResponse.json({ ok: true, created: true, rutas: [pathname] });
    }
  } catch (error) {
    console.log("[VISITAS] Error en el endpoint:", error);
    return NextResponse.json({ ok: false, error: error?.toString() }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Obtén todas las visitas
    const all = await db.visitas.select().from(visitas);

    // Total de visitas
    const total = all.reduce((sum, v) => sum + (v.visita || 1), 0);

    // Visitas por ruta
    const rutasCount: Record<string, number> = {};
    const countryCount: Record<string, number> = {};

    // Obtén los países en paralelo
    const countries = await Promise.all(
      all.map(async v => {
        let rutas: string[] = [];
        try { rutas = v.rutas ? JSON.parse(v.rutas) : []; } catch {}
        rutas.forEach(ruta => {
          rutasCount[ruta] = (rutasCount[ruta] || 0) + 1;
        });
        const country = await getCountryByIp(v.ip);
        return { country, visita: v.visita || 1 };
      })
    );

    countries.forEach(({ country, visita }) => {
      countryCount[country] = (countryCount[country] || 0) + visita;
    });

    return NextResponse.json({
      total,
      rutasCount,
      countryCount,
    });
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener estadísticas" }, { status: 500 });
  }
}

