import { useState, useEffect } from 'react';

interface Product {
  id: number;
  title: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  costPerItem: number | null;
  vendor: string | null;
  productType: string | null;
  status: number;
  category: string | null;
  tags: string[];
  sku: string | null;
  barcode: string | null;
  quantity: number;
  trackInventory: number;
  images: string[];
  sizes: string[];
  sizeRange: { min: number; max: number };
  colors: string[];
}

interface CachedData {
  products: Product[];
  timestamp: number;
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 1 día en milisegundos
const CACHE_KEY = 'cached_products';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Verificar si hay datos en caché
        const cachedData = localStorage.getItem(CACHE_KEY);
        
        if (cachedData) {
          const { products: cachedProducts, timestamp }: CachedData = JSON.parse(cachedData);
          const now = Date.now();
          
          // Verificar si la caché aún es válida (menos de 1 día)
          if (now - timestamp < CACHE_DURATION) {
            setProducts(cachedProducts);
            setLoading(false);
            return;
          }
        }

        // Si no hay caché o expiró, obtener nuevos datos
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error('Error al cargar los productos');
        }

        const newProducts = await response.json();
        
        // Guardar en localStorage con timestamp
        const cacheData: CachedData = {
          products: newProducts,
          timestamp: Date.now()
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        
        setProducts(newProducts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const refreshProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Error al actualizar los productos');
      }

      const newProducts = await response.json();
      
      // Actualizar caché
      const cacheData: CachedData = {
        products: newProducts,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      
      setProducts(newProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return {
    products,
    loading,
    error,
    refreshProducts
  };
} 