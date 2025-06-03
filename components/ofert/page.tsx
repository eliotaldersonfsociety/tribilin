"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Product {
  id: number;
  title: string;
  description?: string;
  images: string[]; // La API retorna un array de strings
  sale_price: string;
  compareAtPrice: string;
  price: string;
}

// Loader personalizado que retorna la URL sin cambios
const customLoader = ({ src }: { src: string }) => src;

export default function Ofert() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [itemsToShow, setItemsToShow] = useState(2);

  // Fetch de productos desde el endpoint /api/products/
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      let loadedProducts: Product[] = [];

      // 1. Intentar cargar desde localStorage
      let cachedProducts = localStorage.getItem("cached_products");
      if (!cachedProducts) {
        cachedProducts = localStorage.getItem("products");
      }
      if (cachedProducts) {
        try {
          const parsed = JSON.parse(cachedProducts);
          const productsArray = Array.isArray(parsed) ? parsed : parsed.products;
          if (productsArray && productsArray.length > 0) {
            loadedProducts = productsArray;
            setProducts(loadedProducts);
            setLoading(false);
            console.log("✅ Productos cargados desde localStorage:", loadedProducts);
            return;
          }
        } catch (e) {
          console.error("❌ Error al parsear productos de localStorage:", e);
        }
      }

      // 2. Si no hay productos en localStorage, cargar desde la API
      try {
        const res = await fetch("/api/products/");
        if (!res.ok) {
          console.error("Error fetching products:", res.statusText);
          setLoading(false);
          return;
        }
        const data = await res.json();
        setProducts(data);
        console.log("🌐 Productos cargados desde la API:", data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Acción de agregar al carrito (por ahora solo loguea el producto)
  const handleAddToCart = (product: Product) => {
    console.log("Producto agregado:", product);
  };

  // Manejo del scroll en el carrusel
  const scroll = useCallback(
    (direction: "left" | "right") => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const scrollAmount = 320; // Ancho aproximado de una tarjeta + margen
        if (direction === "left") {
          container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
          setCurrentProductIndex(Math.max(0, currentProductIndex - 1));
        } else {
          container.scrollBy({ left: scrollAmount, behavior: "smooth" });
          setCurrentProductIndex(
            Math.min(products.length - 1, currentProductIndex + 1)
          );
        }
      }
    },
    [currentProductIndex, products.length]
  );

  // Ciclo automático cada 5 segundos para cambiar de producto
  useEffect(() => {
    if (products.length === 0) return;
    const interval = setInterval(() => {
      setCurrentProductIndex((prevIndex) =>
        prevIndex === products.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [products]);

  useEffect(() => {
    const updateItemsToShow = () => {
      setItemsToShow(window.innerWidth < 768 ? 2 : 3);
    };
    updateItemsToShow();
    window.addEventListener("resize", updateItemsToShow);
    return () => window.removeEventListener("resize", updateItemsToShow);
  }, []);

  return (
    <div className="bg-gray-100 w-full py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative w-full max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Ofertas del Día</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentProductIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentProductIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentProductIndex((prev) => Math.min(products.length - 1, prev + 1))}
                disabled={currentProductIndex >= products.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {loading ? (
            <p className="text-center text-lg font-semibold">Cargando productos...</p>
          ) : (
            <div className="flex justify-center items-center">
              <div className="flex gap-2 overflow-x-auto snap-x scrollbar-hide">
                {products
                  .slice(currentProductIndex, currentProductIndex + itemsToShow)
                  .map((product) => {
                    const discount =
                      product.sale_price && product.compareAtPrice && parseFloat(product.compareAtPrice) > 0
                        ? Math.round(
                            ((parseFloat(product.compareAtPrice) - parseFloat(product.sale_price)) /
                              parseFloat(product.compareAtPrice)) *
                              100
                          )
                        : 0;
                    return (
                      <div
                        key={product.id}
                        className="min-w-[140px] max-w-[160px] mx-2 bg-white rounded-lg shadow-md border border-gray-200 flex flex-col snap-center hover:shadow-lg transition-shadow duration-300"
                      >
                        <div className="relative h-24 w-full bg-gray-100">
                          {product.images && product.images.length > 0 ? (
                            <Image
                              loader={customLoader}
                              src={product.images[0] || "/placeholder.svg"}
                              alt={product.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                              No disponible
                            </div>
                          )}
                          <div className="absolute top-2 right-2">
                            {discount > 0 && (
                              <span className="px-2 py-1 text-xs font-semibold rounded bg-red-500 text-white">
                                -{discount}%
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="p-2 flex-1 flex flex-col">
                          <h2 className="font-semibold text-sm mb-1 line-clamp-1">{product.title}</h2>
                          <p className="text-gray-500 text-xs mb-2 line-clamp-2">{product.description || ""}</p>
                          <div className="mt-auto flex justify-between items-center">
                            <div>
                              <p className="font-bold text-sm">${product.sale_price || product.price}</p>
                            </div>
                            <Link href={`/product/${product.id}`}>
                              <button className="bg-blue-500 hover:bg-blue-600 transition-colors text-white px-2 py-1 rounded text-xs">
                                Ver
                              </button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
          {/* Indicadores de scroll */}
          <div className="flex justify-center gap-1 mt-2">
            {products.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentProductIndex ? "w-6 bg-blue-500" : "w-1.5 bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
