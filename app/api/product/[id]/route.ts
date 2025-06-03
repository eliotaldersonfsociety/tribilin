//app/api/product/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import db from '@/lib/db';
import { productsTable } from '@/lib/products/schema';

export async function GET(request: NextRequest) {
  const urlParts = request.nextUrl.pathname.split("/");
  const id = urlParts[urlParts.length - 1];

  console.log("❤️ ID recibido en la solicitud:", id);

  try {
    if (id && !isNaN(Number(id))) {
      const numericId = parseInt(id, 10);
      console.log("✅ ID convertido a número:", numericId);

      const product = await db.products
        .select()
        .from(productsTable)
        .where(eq(productsTable.id, numericId))
        .limit(1);

      console.log("📦 Producto obtenido de la base de datos:", product);

      if (product.length === 0) {
        console.warn("⚠️ Producto no encontrado en la base de datos");
        return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
      }

      let images: string[] = [];
      if (Array.isArray(product[0].images)) {
        images = product[0].images;
      } else if (typeof product[0].images === "string") {
        try {
          let parsed = JSON.parse(product[0].images);
          if (typeof parsed === "string") {
            parsed = JSON.parse(parsed);
          }
          images = Array.isArray(parsed) ? parsed : [];
        } catch {
          images = [];
        }
      }

      const rawSizes = product[0].sizes;
      let sizes: string[] = [];

      if (Array.isArray(rawSizes)) {
        sizes = rawSizes;
      } else if (typeof rawSizes === "string") {
        try {
          sizes = JSON.parse(rawSizes);
          if (!Array.isArray(sizes)) sizes = [];
        } catch {
          sizes = [];
        }
      }

      const rawColors = product[0].colors;
      let colors: string[] = [];

      if (Array.isArray(rawColors)) {
        colors = rawColors;
      } else if (typeof rawColors === "string") {
        try {
          colors = JSON.parse(rawColors);
          if (!Array.isArray(colors)) colors = [];
        } catch {
          colors = [];
        }
      }

      const formattedProduct = {
        ...product[0],
        images,
        sizes,
        colors,
      };

      return NextResponse.json(formattedProduct);
    }

    console.warn("⚠️ ID de producto no proporcionado o inválido");
    return NextResponse.json({ error: "ID de producto no proporcionado o inválido" }, { status: 400 });
  } catch (error) {
    console.error("💥 Error al obtener producto:", error);
    return NextResponse.json({ error: "Error al obtener producto" }, { status: 500 });
  }
}

// 🔹 PUT: Actualizar un producto por ID
export async function PUT(request: NextRequest) {
  const urlParts = request.nextUrl.pathname.split("/");
  const id = urlParts[urlParts.length - 1];

  console.log("🛠️ ID recibido en la solicitud PUT:", id);

  try {
    if (id && !isNaN(Number(id))) {
      const numericId = parseInt(id, 10);
      console.log("✅ ID convertido a número:", numericId);

      const body = await request.json();

      const updatedData = {
        ...body,
        images: Array.isArray(body.images) ? JSON.stringify(body.images) : "[]",
      };

      const result = await db.products
        .update(productsTable)
        .set(updatedData)
        .where(eq(productsTable.id, numericId));

      console.log("✅ Producto actualizado:", result);

      return NextResponse.json({ message: "Producto actualizado correctamente" });
    }

    console.warn("⚠️ ID de producto no proporcionado o inválido");
    return NextResponse.json({ error: "ID de producto no proporcionado o inválido" }, { status: 400 });
  } catch (error) {
    console.error("💥 Error al actualizar producto:", error);
    return NextResponse.json(
      { error: "Error al actualizar producto", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// 🔹 DELETE: Eliminar un producto por ID
export async function DELETE(request: NextRequest) {
  const urlParts = request.nextUrl.pathname.split("/");
  const id = urlParts[urlParts.length - 1];

  console.log("🗑️ ID recibido en la solicitud DELETE:", id);

  try {
    if (id && !isNaN(Number(id))) {
      const productId = parseInt(id, 10);
      console.log("✅ ID convertido a número:", productId);

      const [product] = await db.products
        .select()
        .from(productsTable)
        .where(eq(productsTable.id, productId))
        .limit(1);

      console.log("🔍 Producto encontrado antes de eliminar:", product);

      if (!product) {
        console.warn("⚠️ Producto no encontrado para eliminar");
        return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
      }

      await db.products.delete(productsTable).where(eq(productsTable.id, productId));

      console.log("🧹 Producto eliminado exitosamente");

      return NextResponse.json({
        success: true,
        message: "Producto eliminado exitosamente",
        deletedId: productId,
      });
    }

    console.warn("⚠️ ID de producto no proporcionado o inválido");
    return NextResponse.json({ error: "ID de producto no proporcionado o inválido" }, { status: 400 });
  } catch (error) {
    console.error("💥 Error al eliminar producto:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
