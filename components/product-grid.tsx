// components/product-grid.tsx
"use client"; // This must be the very first line

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge"; // Assuming this path is correct
// Skeleton loading can be kept here if you want to show a fallback
// when the *props* (products) array is empty, e.g., due to a server error.
// import Skeleton from 'react-loading-skeleton';
// import 'react-loading-skeleton/dist/skeleton.css'; // Import the CSS

// Define the Product interface (or import from a shared types file)
interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  quantity: number;
  status: boolean;
  images: string[];
}

interface ProductGridProps {
  products: Product[]; // Receives products as props from the server component
}

// Loader personalizado para permitir cualquier URL externa
// Keep this if you use external images.
const customLoader = ({ src }: { src: string }) => src;


// --- Product Grid Client Component ---
// This component receives data via props and handles client-side interactions.
export function ProductGrid({ products }: ProductGridProps) {

  // Placeholder function for Add to Cart
  const handleAddToCart = (productId: number) => {
    console.log(`Producto ${productId} agregado al carrito!`);
    // TODO: Implement actual add to cart logic:
    // - Update local cart state (e.g., using context or a state management library like Zustand/Redux)
    // - Optionally, call an API route (/api/cart) to add to a backend cart
    // - Show a notification (toast message)
  };

  // No loading state needed here for the initial render as data is server-fetched
  // The empty state rendering acts as a fallback.

  return (
    <div id="product-list" className="container mx-auto p-4"> {/* Added id for the banner link */}
      <h1 className="text-2xl font-bold mb-6">Lista de Productos</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Render a fallback (e.g., simple divs or skeletons) if products array is empty */}
        {products.length === 0 ? (
           // You can use Skeleton components here if react-loading-skeleton is installed and configured
           // Or use simple divs as a server-renderable fallback like below
           Array.from({ length: 8 }).map((_, index) => (
            <div key={`skeleton-${index}`} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 flex flex-col">
              <div className="relative h-48 w-full bg-gray-100 animate-pulse"></div> {/* Added pulse animation */}
               <div className="p-4 flex-1 flex flex-col">
                 <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                 <div className="h-4 bg-gray-200 rounded w-full mb-4 animate-pulse"></div>
                 <div className="mt-auto flex justify-between items-center">
                   <div>
                     <div className="h-6 bg-gray-200 rounded w-16 mb-1 animate-pulse"></div>
                     <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                   </div>
                   <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
                 </div>
               </div>
            </div>
          ))
        ) : (
          // Render actual products
          products.map((product) => (
            <div
              key={product.id} // Use product id as key
              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 flex flex-col"
            >
              <div className="relative h-48 w-full bg-gray-100">
                {Array.isArray(product.images) && product.images.length > 0 ? (
                  <Image
                    loader={customLoader} // Keep customLoader if external images
                    src={product.images[0] || "/placeholder.svg"}
                    alt={`Imagen de ${product.title}`} // More descriptive alt text
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw" // Added sizes prop for better performance
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">Imagen no disponible</div>
                )}
                {/* Ensure Badge component is correctly imported/defined */}
                <Badge className={`absolute top-2 right-2 ${product.status ? "bg-green-500" : "bg-red-500"}`}>
                  {product.status ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                {/* Ensure title/description are not null/undefined if possible from API */}
                <h2 className="font-semibold text-lg mb-1 line-clamp-1">{product.title ?? 'Sin Título'}</h2>
                <p className="text-gray-500 text-sm mb-2 line-clamp-2">{product.description || `Descubre más sobre ${product.title ?? 'este producto'}.`}</p>
                <div className="mt-auto flex justify-between items-center">
                  <div>
                    {/* Ensure price is a number before toFixed */}
                    <p className="font-bold text-lg">${(product.price ?? 0).toFixed(2)}</p>
                    <p className="text-sm text-gray-500">Stock: {product.quantity ?? 0}</p>
                  </div>
                  {/* Action buttons/links */}
                  <div className="flex gap-2"> {/* Use flexbox for buttons */}
                    {/* Add to Cart Button */}
                    {/* Check status and quantity more robustly */}
                    {product.status === true && (product.quantity ?? 0) > 0 && (
                       <button
                         onClick={() => handleAddToCart(product.id)}
                         className="bg-green-500 hover:bg-green-600 transition-colors text-white px-3 py-1.5 rounded text-sm"
                       >
                         Agregar al Carrito
                       </button>
                    )}
                    {/* View Product Link */}
                    <Link href={`/product/${product.id}`} passHref>
                       <button className="bg-blue-500 hover:bg-blue-600 transition-colors text-white px-3 py-1.5 rounded text-sm">
                         Ver Producto
                       </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Remove the default export here, as it's not the main page file.
// Only export the component using named export.
// export default ProductGrid; // <--- REMOVE THIS LINE