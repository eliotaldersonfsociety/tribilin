import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import db from "@/lib/db/index";
import { productsTable } from "@/lib/products/schema";


// Esquemas Zod para validación
const insertProductSchema = createInsertSchema(productsTable).extend({
  sizes: z.array(z.string()).nullable(),
  sizeRange: z.object({ min: z.number(), max: z.number() }).nullable(),
  colors: z.array(z.string()).nullable(),
});
const selectProductSchema = createSelectSchema(productsTable);

// Tipo TypeScript basado en Zod
type Product = z.infer<typeof selectProductSchema>;

// Mapeo de estados
const statusMap = {
  active: 1,
  draft: 0,
} as const;

type StatusKey = keyof typeof statusMap;

function parseMaybeJSONOrCSV(value: any): string[] {
  if (!value || value === "" || value === "null") return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return typeof value === "string" ? value.split(",").map((v) => v.trim()) : [];
  }
}

function parseMaybeJSON(value: any, fallback: any = {}) {
  if (!value || value === "" || value === "null") return fallback;
  try {
    return typeof value === "string" ? JSON.parse(value) : value;
  } catch {
    return fallback;
  }
  return fallback;
}

function getValidImages(images: any): string[] {
  const imgs = parseMaybeJSONOrCSV(images);
  if (!imgs.length || !imgs[0]) {
    return ["/no-image.png"]; // Cambia esta ruta por la de tu imagen por defecto si lo deseas
  }
  return imgs;
}

export async function GET(req: NextRequest) {
  try {
    console.log("Iniciando la obtención de productos...");
    
    // Intentar obtener productos de la base de datos
    const allProducts = await db.products.select().from(productsTable);
    
    console.log("Productos obtenidos:", allProducts);
    
    // Verificar si no se encontraron productos
    if (!allProducts.length) {
      console.log("No se encontraron productos en la base de datos.");
      return NextResponse.json({ message: "No se encontraron productos" }, { status: 404 });
    }
    
    // Formatear los productos
    const formattedProducts = allProducts.map((product: any) => {
      console.log("Formateando producto:", product);
      return {
        ...product,
        status: product.status ?? 0,
        images: getValidImages(product.images),
        tags: parseMaybeJSONOrCSV(product.tags),
        sizes: parseMaybeJSONOrCSV(product.sizes),
        size_range: parseMaybeJSON(product.size_range, { min: 18, max: 45 }),
        colors: parseMaybeJSONOrCSV(product.colors),
      };
    });

    console.log("Productos formateados:", formattedProducts);

    // Devolver los productos formateados
    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error("❌ Error al obtener productos:", error);
    
    // Verificar el tipo de error y loguearlo
    if (error instanceof Error) {
      console.error("Mensaje de error:", error.message);
      console.error("Pila de errores:", error.stack);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Si no es una instancia de Error, devolvemos un error genérico
    console.error("Error desconocido:", error);
    return NextResponse.json({ error: "Error al obtener productos" }, { status: 500 });
  }
}
