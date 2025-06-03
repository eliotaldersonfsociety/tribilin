// components/hero-banner.tsx
"use client"; // This component needs client-side features (Tailwind, Button interaction)

import { Button } from "@/components/ui/button"; // Assuming this path is correct
import Link from "next/link"; // Use Next.js Link for internal navigation

export default function HeroBanner() {
  return (
    <div className="w-full overflow-hidden">
      <div className="flex flex-col md:flex-row w-full h-auto md:h-[500px]">
        {/* Sección de imagen (izquierda) */}
        <div className="relative w-full md:w-1/2 h-[300px] md:h-full">
          {/* Using regular <img> for static assets is fine, Next/Image can be used too */}
          <img
            src="/banner7.webp"
            alt="Woman opening a package from Tienda Texas - Aprovecha envío gratis en tu primera compra" // Improved alt text for SEO
            className="object-cover w-full h-full"
            // Consider adding width/height props if you switch to Next/Image
          />
        </div>

        {/* Sección de texto con fondo de imagen (derecha) */}
        <div
          className="relative flex items-center justify-center w-full md:w-1/2 bg-cover bg-[center_top_40%] md:bg-center p-6 md:p-12"
          style={{ backgroundImage: "url('/banner77.webp')" }} // Consider using Next/Image for background too
        >
          {/* Contenedor con blur solo alrededor del texto */}
          <div className="bg-black/40 backdrop-blur-sm rounded-lg p-6 md:p-10 max-w-xl text-white text-center">
            <h1 className="text-3xl md:text-5xl lg:text-6xl mb-2">
              <span className="font-bold">ENVÍO GRATIS</span>
              <br />
              <span className="font-extralight">EN TU PRIMERA COMPRA</span>
            </h1>
            <p className="mt-4 mb-6 text-lg md:text-xl font-light">
              Descubre nuestra selección de productos de calidad y aprovecha esta oferta especial en tu primera compra con envío gratuito. {/* Slightly more descriptive */}
            </p>
            {/* Assuming the button links to the product listing or a category */}
            <Link href="#product-list" passHref> {/* Link to the product list section */}
               <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white">
                 Comprar Ahora
               </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}