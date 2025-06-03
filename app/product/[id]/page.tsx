"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ProductDisplay from "./product-display";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  costPerItem?: number;
  vendor?: string;
  productType?: string;
  status?: boolean;
  category?: string;
  tags?: string;
  sku?: string;
  barcode?: string;
  quantity?: number;
  trackInventory?: boolean;
  images: string[];
  sizes?: string[];
  sizeRange?: { min: number; max: number };
  colors?: string[];
}

export default function ProductPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    console.log("Product ID from URL:", params.id);
    if (!params.id) {
      router.push("/404");
      return;
    }

    // Intentar obtener el producto desde localStorage
    let cachedProducts = localStorage.getItem("cached_products");
    if (!cachedProducts) {
      cachedProducts = localStorage.getItem("products");
    }
    if (cachedProducts) {
      try {
        const parsed = JSON.parse(cachedProducts);
        // Si es un array
        const productsArray = Array.isArray(parsed) ? parsed : parsed.products;
        const productFromCache = productsArray.find((p: any) => String(p.id) === String(params.id));
        if (productFromCache) {
          console.log("Producto cargado desde localStorage:", productFromCache);
          setProduct(productFromCache);
          return;
        }
      } catch (e) {
        // Si hay error, ignora y sigue con la API
      }
    }

    console.log("Producto no encontrado en localStorage, consultando API...");

    // Si no está en localStorage, hacer la consulta a la API
    fetch(`/api/product/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Producto recibido desde la API:", data);
        if (data.length === 0) {
          router.push("/404");
        } else {
          setProduct(data);
        }
      })
      .catch(() => router.push("/404"));
  }, [params.id, router]);

  if (!product) return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Skeleton height={50} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        <div className="space-y-4">
          <Skeleton height={400} />
          <Skeleton height={100} />
        </div>
        <div className="flex flex-col space-y-6">
          <Skeleton height={30} width={200} />
          <Skeleton height={20} width={150} />
          <Skeleton height={50} />
          <Skeleton height={30} width={100} />
          <Skeleton height={20} width={150} />
          <Skeleton height={50} />
          <Skeleton height={50} />
        </div>
      </div>
    </div>
  );

  return <ProductDisplay product={product} />;
}
