// app/pagina/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { Metadata } from 'next';
import HeroBanner from "@/components/hero/page";
import { ProductGrid } from "@/components/product-grid";

// Define the Product interface or import from a shared types file
interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  quantity: number;
  status: boolean;
  images: string[];
}

interface CachedData {
  products: Product[];
  timestamp: number;
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 1 día en milisegundos
const CACHE_KEY = 'cached_products';

// Define metadata for the page - Good for SEO!

export default function PaginaPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Verificar si hay datos en caché
        const cachedData = localStorage.getItem(CACHE_KEY);
        
        if (cachedData) {
          try {
            const { products: cachedProducts, timestamp }: CachedData = JSON.parse(cachedData);
            const now = Date.now();
            
            // Verificar si la caché aún es válida (menos de 1 día)
            if (now - timestamp < CACHE_DURATION) {
              console.log('✅ Usando productos desde caché');
              setProducts(cachedProducts);
              setLoading(false);
              return;
            } else {
              console.log('⚠️ Caché expirada, obteniendo nuevos datos');
            }
          } catch (cacheError) {
            console.error('❌ Error al leer la caché:', cacheError);
            localStorage.removeItem(CACHE_KEY); // Limpiar caché inválida
          }
        }

        // Si no hay caché o expiró, obtener nuevos datos
        console.log('🔄 Obteniendo productos desde la API...');
        const res = await fetch('/api/products');
        
        if (!res.ok) {
          let errorText = await res.text().catch(() => 'No se pudo leer el cuerpo del error');
          console.error('❌ Error de la API:', {
            status: res.status,
            statusText: res.statusText,
            rawError: errorText
          });
          throw new Error(`Error al cargar los productos: ${res.status} - ${res.statusText}`);
        }
        

        const newProducts = await res.json();
        console.log('✅ Productos obtenidos:', newProducts.length);
        
        // Guardar en localStorage con timestamp
        const cacheData: CachedData = {
          products: newProducts,
          timestamp: Date.now()
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        console.log('💾 Productos guardados en caché');
        
        setProducts(newProducts);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        console.error('❌ Error al cargar productos:', err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const refreshProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Actualizando productos...');
      const res = await fetch('/api/products');

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('❌ Error al actualizar:', {
          status: res.status,
          statusText: res.statusText,
          error: errorData
        });
        throw new Error(`Error al actualizar los productos: ${res.status} - ${errorData.error || res.statusText}`);
      }

      const newProducts = await res.json();
      console.log('✅ Productos actualizados:', newProducts.length);
      
      // Actualizar caché
      const cacheData: CachedData = {
        products: newProducts,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      console.log('💾 Caché actualizada');
      
      setProducts(newProducts);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('❌ Error al actualizar productos:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <HeroBanner />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                <div className="bg-gray-200 h-4 w-3/4 rounded mb-2"></div>
                <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <HeroBanner />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <div className="space-y-4">
            <button
              onClick={refreshProducts}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Intentar de nuevo
            </button>
            <p className="text-sm text-gray-600">
              Si el error persiste, por favor verifica que la base de datos esté configurada correctamente.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <HeroBanner />
      <ProductGrid products={products} />
    </>
  );
}