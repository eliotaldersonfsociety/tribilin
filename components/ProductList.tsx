'use client';

import { useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/productcard/page';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductList() {
  const { products, loading, error, refreshProducts } = useProducts();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">Error: {error}</p>
        <button
          onClick={refreshProducts}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={{
            ...product,
            description: product.description ?? undefined,
            compareAtPrice: product.compareAtPrice ?? undefined,
            costPerItem: product.costPerItem ?? undefined,
            vendor: product.vendor ?? undefined,
            productType: product.productType ?? undefined,
            category: product.category ?? undefined,
            tags: Array.isArray(product.tags) ? product.tags.join(",") : product.tags ?? undefined,
            sku: product.sku ?? undefined,
            barcode: product.barcode ?? undefined,
            status: typeof product.status === "number" ? product.status === 1 : product.status ?? undefined,
            trackInventory: typeof product.trackInventory === "number" ? product.trackInventory === 1 : product.trackInventory ?? undefined,
          }}
        />
      ))}
    </div>
  );
} 
