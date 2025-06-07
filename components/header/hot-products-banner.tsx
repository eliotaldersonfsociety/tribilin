// components/hot-products-banner.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronDown, Flame, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/lib/cartStore";

interface Product {
  id: number;
  title: string;
  price: number;
  images: string[];
  // Agregamos campos opcionales por si la API los tiene
  // description?: string;
  // quantity?: number;
  // status?: boolean;
}

// La interfaz para los datos guardados en localStorage (objeto con ID como clave)
interface ProductsLocalStorage {
    [id: number]: Product;
}


function getRandomProducts<T extends Product>(array: T[], count: number): T[] {
    if (!array || array.length === 0) return [];
    const shuffled = array.slice().sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
}


const customLoader = ({ src, width, quality }: { src: string, width: number, quality?: number }) => {
    return src;
};


export default function HotProductsBanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [hotProducts, setHotProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const addToCart = useCartStore(state => state.addToCart);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      setError(null);
      let allProducts: Product[] = [];
      let loadedFrom = "API"; // Para saber de dónde cargamos

      try {
        // 1. Intentar cargar desde localStorage
        let cachedProducts = localStorage.getItem("cached_products");
        if (!cachedProducts) {
          cachedProducts = localStorage.getItem("products");
        }
        if (cachedProducts) {
          try {
            const parsed = JSON.parse(cachedProducts);
            // Si es un array, úsalo directamente. Si es un objeto con .products, usa ese array.
            const productsArray = Array.isArray(parsed) ? parsed : parsed.products;
            if (productsArray && productsArray.length > 0) {
              allProducts = productsArray;
              loadedFrom = "localStorage";
              console.log("Productos cargados desde localStorage para HotProductsBanner");
            }
          } catch (e) {
            console.error("Error parsing localStorage products:", e);
            localStorage.removeItem("cached_products");
            localStorage.removeItem("products");
            allProducts = [];
          }
        }

        // 2. Si no se cargó desde localStorage o falló, cargar desde la API
        if (allProducts.length === 0) {
           console.log("Cargando productos desde API para HotProductsBanner");
           const res = await fetch("/api/products"); // Tu endpoint original
           if (!res.ok) {
             throw new Error(`Error al cargar productos desde API: ${res.status}`);
           }
           allProducts = await res.json();
           loadedFrom = "API";

           // Opcional: Si este componente carga de la API porque localStorage estaba vacío,
           // podrías guardar la lista completa en localStorage aquí también,
           // para que esté disponible para ProductGrid o futuras cargas.
           // Pero idealmente, el componente que maneja la lista completa (ProductGrid)
           // es el que debería guardar en localStorage. Asumimos que ya lo hace.
        }

        // 3. Seleccionar productos calientes de la lista obtenida (de localStorage o API)
        // *** RECUERDA: Esto selecciona 4 al azar de la lista completa. No son necesariamente los MÁS hot reales. ***
        // Si tu API tiene una lógica para darte los hot, modifica el paso 2 para llamar a `/api/hot-products`
        // y luego usa `setHotProducts(data)` directamente.
        const selectedHotProducts = getRandomProducts(allProducts, 4);
        setHotProducts(selectedHotProducts);

      } catch (err: any) {
        console.error(`Error general al cargar productos (${loadedFrom}):`, err);
        setError(`No se pudieron cargar los productos calientes desde ${loadedFrom === "API" ? "la API" : "localStorage"}.`);
        setHotProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []); // El array vacío asegura que se ejecute solo una vez al montar

  // Función para el botón de agregar al carrito
  const handleAddToCart = (product: Product) => {
     if (!product || typeof product.id === 'undefined' || typeof product.price === 'undefined' || !product.title) {
         console.error("Intento de agregar producto inválido al carrito:", product);
         // Opcional: Mostrar un mensaje al usuario
         return;
     }
     addToCart({
        id: product.id,
        name: product.title,
        price: product.price,
        image: product.images?.[0] || "/placeholder.svg",
        quantity: 1,
     });
     console.log(`Producto ${product.title} (${product.id}) agregado al carrito!`);
     // Opcional: Mostrar una notificación al usuario (toast)
  };


  return (
    <div className="w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-full py-1.5 text-sm font-medium bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-red-700 hover:to-orange-600 transition-colors duration-200"
      >
        <Flame className="h-4 w-4 mr-2 text-white" />
        Lo más hot
        <ChevronDown
          className={`h-4 w-4 ml-2 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <div
        className={`w-full bg-black/95 backdrop-blur-md text-white overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[600px] opacity-100 py-6 md:py-8" : "max-h-0 opacity-0 py-0" // Ajusta py a 0 cuando está cerrado
        }`}
      >
        <div className="container mx-auto px-4">
          {isLoading && (
            <div className="text-center py-4 flex justify-center items-center text-gray-300">
                <RotateCw className="animate-spin mr-2 h-5 w-5" /> Cargando productos...
            </div>
          )}

          {error && (
            <div className="text-center py-4 text-red-400">
                {error}
            </div>
          )}

          {!isLoading && !error && hotProducts.length === 0 && (
             <div className="text-center py-4 text-gray-400">
                 No se encontraron productos calientes en este momento.
             </div>
          )}

          {!isLoading && !error && hotProducts.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {hotProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white/10 hover:bg-white/20 transition-colors duration-200 rounded-lg p-3 flex flex-col cursor-pointer"
                >
                  <div className="relative mb-2 aspect-square w-full">
                    <Image
                      loader={customLoader}
                      unoptimized={false}
                      src={product.images?.[0] || "/placeholder.svg"}
                      alt={`Imagen de ${product.title ?? 'Producto'}`} // Mejorar alt text
                      fill
                      className="object-cover rounded-md"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                    <Badge className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-1 py-0.5">Hot</Badge>
                  </div>
                  {/* Asegura que title/price existen antes de mostrar */}
                  <h3 className="font-medium text-sm mb-1 line-clamp-2">{product.title ?? 'Producto sin título'}</h3>
                  <div className="flex items-center justify-between mt-auto pt-2">
                    <span className="font-bold text-base">${(product.price ?? 0).toFixed(2)}</span>
                    <Button
                      size="sm"
                      className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white transition-colors duration-200"
                       // Asegura que el product sea válido antes de pasar a handleAddToCart
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                    >
                      Agregar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
