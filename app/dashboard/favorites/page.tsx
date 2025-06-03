"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/dashboard-layout";

interface WishlistItem {
  id: number;
  productId: number;
}

interface Product {
  id: number;
  title: string;
  price: number;
  images: string; // JSON string de array de imágenes
}

export default function FavoritesPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      setLoading(true);
      // Intenta primero cargar del localStorage
      const local = localStorage.getItem('favoritos');
      if (local) {
        try {
          const prods = JSON.parse(local);
          console.log('Favoritos obtenidos de localStorage:', prods);
          setProducts(prods);
          setLoading(false);
          return;
        } catch {}
      }
      // Si no hay en localStorage, pide a la API
      const res = await fetch("/api/wishlist");
      if (!res.ok) {
        setWishlist([]);
        setProducts([]);
        setLoading(false);
        return;
      }
      const data = await res.json();
      console.log('Respuesta de /api/wishlist:', data);
      if (Array.isArray(data)) {
        setWishlist(data);
        // Extrae los productos directamente del campo 'product'
        const prods = data
          .map((item) => {
            if (item.product) {
              try {
                return JSON.parse(item.product);
              } catch {
                return null;
              }
            }
            return null;
          })
          .filter(Boolean);
        setProducts(prods);
        // Guarda en localStorage
        localStorage.setItem('favoritos', JSON.stringify(prods));
        console.log('Favoritos obtenidos de la API y guardados en localStorage:', prods);
      } else {
        setWishlist([]);
        setProducts([]);
      }
      setLoading(false);
    };
    fetchWishlist();
  }, []);

  const handleRemove = async (productId: number) => {
    await fetch(`/api/wishlist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    setWishlist((prev) => prev.filter((item) => item.productId !== productId));
    setProducts((prev) => prev.filter((item) => item.id !== productId));
  };

  return (
    <DashboardLayout>
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Mis Favoritos</h1>
      {loading ? (
        <p>Cargando favoritos...</p>
      ) : products.length === 0 ? (
        <p className="text-gray-500">No tienes productos en favoritos.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product) => {
            let img = "/no-image.png";
            try {
              // Soporta tanto array como string JSON
              const imgs = Array.isArray(product.images)
                ? product.images
                : JSON.parse(product.images);
              if (imgs && imgs.length > 0) img = imgs[0];
            } catch {}
            return (
              <div key={product.id} className="border rounded-lg p-4 flex flex-col items-center bg-white shadow">
                {product.title === 'Producto no disponible' ? (
                  <>
                    <div className="w-40 h-40 flex items-center justify-center bg-gray-100 text-gray-400 mb-2 rounded">
                      <span>Sin imagen</span>
                    </div>
                    <h2 className="font-semibold text-lg mb-1 text-center text-gray-400">{product.title}</h2>
                    <p className="text-gray-400 mb-2">Este producto ya no está disponible.</p>
                  </>
                ) : (
                  <>
                    <img
                      src={img}
                      alt={product.title}
                      width={160}
                      height={160}
                      className="object-contain mb-2 rounded"
                    />
                    <h2 className="font-semibold text-lg mb-1 text-center">{product.title}</h2>
                    <p className="text-slate-700 font-bold mb-2">${product.price.toFixed(2)}</p>
                    <div className="flex gap-2">
                      <Button variant="destructive" onClick={() => handleRemove(product.id)}>
                        Quitar de favoritos
                      </Button>
                      <Link href={`/product/${product.id}`}>
                        <Button variant="outline">Ver producto</Button>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
    </DashboardLayout>
  );
} 