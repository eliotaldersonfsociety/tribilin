"use client";
import Link from "next/link";
import Image from "next/image";
import { Eye, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types/product"; // Importa la interfaz compartida

const customLoader = ({ 
  src, 
  width, 
  quality 
}: { 
  src: string; 
  width: number; 
  quality?: number 
}) => `${src}?w=${width}&q=${quality || 75}`;

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  // Función para determinar el estado como string
  const getStatusLabel = (status?: boolean) => {
    if (typeof status === 'boolean') return status ? "Activo" : "Inactivo";
    return "Desconocido";
  };

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <div className="relative h-48 bg-gray-100">
        {product.images?.length > 0 ? (
          <Image
            loader={customLoader}
            src={product.images[0]}
            alt={product.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Sin imagen
          </div>
        )}

        {product.status !== undefined && (
          <Badge 
            className="absolute top-2 right-2" 
            variant={product.status ? "default" : "secondary"}
          >
            {getStatusLabel(product.status)}
          </Badge>
        )}
      </div>

      <CardContent className="flex-grow pt-4">
        <h2 className="font-semibold text-lg line-clamp-1">{product.title}</h2>
        
        <p className="text-muted-foreground text-sm line-clamp-2 mt-1">
          {product.description || "Sin descripción"}
        </p>
        
        <div className="mt-2 font-medium">
          ${product.price.toFixed(2)}
          {product.compareAtPrice && (
            <span className="text-muted-foreground line-through ml-2 text-sm">
              ${product.compareAtPrice.toFixed(2)}
            </span>
          )}
        </div>

        {product.category && (
          <Badge variant="outline" className="mt-2">
            {product.category}
          </Badge>
        )}
      </CardContent>

      <CardFooter className="border-t pt-4 flex gap-2">
        <Link href={`/product/${product.id}`} className="flex-1">
          <Button variant="outline" className="w-full" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Ver
          </Button>
        </Link>
        
        <Link href={`/panel/productos/${product.id}/edit`} className="flex-1">
          <Button className="w-full" size="sm">
            <Pencil className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
