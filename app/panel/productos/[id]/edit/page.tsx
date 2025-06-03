"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductForm from "@/app/panel/productos/_components/product-form";
import { SVGCartLoader } from "@/components/loader/page";

async function getProduct(id: string) {
  const res = await fetch(`/api/product/${id}`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error("No se pudo obtener el producto");
  }

  return res.json();
}

export default function EditProduct() {
  const params = useParams();
  const id = params?.id;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || typeof id !== "string" || isNaN(Number(id))) {
      setError("ID de producto inválido");
      setLoading(false);
      return;
    }
    getProduct(id)
      .then(setProduct)
      .catch((err) => {
        setError("Producto no encontrado o error de servidor");
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <SVGCartLoader />
      </div>
    );
  }
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;
  if (!product) return <p className="text-center mt-10">Producto no encontrado</p>;

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/product/${id}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Editar Producto</h1>
      </div>

      <ProductForm initialData={product} />
    </div>
  );
}