import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import db from "@/lib/db/index";
import { productsTable } from "@/lib/products/schema";

// Esquemas Zod para validación
const insertProductSchema = createInsertSchema(productsTable).extend({
  images: z.union([z.string(), z.array(z.string())]),
  sizes: z.array(z.string()).nullable(),
  size_range: z.string(),
  colors: z.array(z.string()).nullable(),
  status: z.union([z.string(), z.number()]).optional().default("draft"),
  compare_at_price: z.number().optional(),
  cost_per_item: z.number().optional(),
  product_type: z.string().optional(),
});
const selectProductSchema = createSelectSchema(productsTable);

type Product = z.infer<typeof selectProductSchema>;

const statusMap = {
  active: 1,
  draft: 0,
} as const;

type StatusKey = keyof typeof statusMap;

function parseMaybeJSONOrCSV(value: any): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return typeof value === "string" ? value.split(",").map((v) => v.trim()) : [];
  }
}

function parseMaybeJSON(value: any, fallback: any = {}): any {
  if (!value) return fallback;
  try {
    return typeof value === "string" ? JSON.parse(value) : value;
  } catch {
    return fallback;
  }
}

// Manejador POST para crear un producto
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validación con Zod
    const parseResult = insertProductSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Datos inválidos en el producto', detalles: parseResult.error.errors },
        { status: 400 }
      );
    }
    const data = parseResult.data;

    // Convertir status a número
    let status: string | number = data.status ?? "draft";
    if (typeof status === "string") {
      status = status.toLowerCase();
    }
    const numericStatus =
      typeof status === "string"
        ? statusMap[status as StatusKey] ?? statusMap.draft
        : status;

    // Insertar en la base de datos
    const result = await db.products
      .insert(productsTable)
      .values({
        ...data,
        images: JSON.stringify(data.images ?? []),
        sizes: JSON.stringify(data.sizes ?? []),
        colors: JSON.stringify(data.colors ?? []),
        status: numericStatus,
        compare_at_price: data.compare_at_price,
        cost_per_item: data.cost_per_item,
        product_type: data.product_type,
      })
      .returning();

    return NextResponse.json({ message: "Producto creado exitosamente", productId: result[0].id }, { status: 201 });
  } catch (error) {
    console.error("Error al guardar el producto:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
