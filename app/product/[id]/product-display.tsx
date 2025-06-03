"use client"; // Asegúrate de que esta directiva esté si es necesaria

import { useCartStore } from "@/lib/cartStore";
import { useWishlistStore } from "@/lib/wishlistStore";
import Image from "next/image";
import { Minus, Plus, ShoppingCart, Heart, Share2, Truck, RotateCcw, Shield } from "lucide-react";
// Importa useState para los estados locales
import { useState, useEffect } from "react";
import Ofert from "@/components/oferta/page"; // Asegúrate que la ruta sea correcta
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "react-toastify";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import CommentsPage from "@/components/comentarios";
import { Card, CardContent } from "@/components/ui/card";
import CountdownTimer from "@/components/countdown-timer";
import FAQ from "@/app/preguntas/page";
import { useUser } from "@clerk/nextjs";
// Interfaz para definir la estructura del objeto producto
interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  costPerItem?: number;
  vendor?: string;
  productType?: string;
  status?: boolean; // Indica si está en stock
  category?: string;
  tags?: string;
  sku?: string;
  barcode?: string;
  quantity?: number; // Cantidad disponible
  trackInventory?: boolean;
  images: string[]; // Lista de URLs de imágenes
  sizes?: string[]; // Tallas como S, M, L
  sizeRange?: { min: number; max: number }; // Rango de tallas numéricas (ej. zapatos)
  colors?: string[]; // Lista de colores disponibles
}

// Loader personalizado para Next/Image (opcional)
const customLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  return `${src}?w=${width}&q=${quality || 75}`;
};

// Funciones para generar datos aleatorios (si son necesarias)
const getRandomRating = () => parseFloat((Math.random() * (5 - 3.8) + 3.8).toFixed(1));
const getRandomReviews = () => Math.floor(Math.random() * (107 - 23 + 1)) + 23;

// Componente principal
export default function ProductDisplay({ product }: { product: Product }) {
  console.log("Datos COMPLETOS del producto recibidos:", JSON.stringify(product, null, 2));
  console.log(">>> Tipo de product.quantity:", typeof product.quantity, "|| Valor:", product.quantity);
  // Hooks de Zustand para carrito y wishlist
  const addToCart = useCartStore(state => state.addToCart);
  const {
    addToWishlist,
    removeFromWishlist,
    wishlist,
    isProductInWishlist,
    setWishlist,
    fetchWishlist
  } = useWishlistStore();
  const { isSignedIn, isLoaded, user } = useUser();

  // Estados locales del componente
  const [selectedImage, setSelectedImage] = useState(0); // Índice de la imagen principal mostrada
  const [quantity, setQuantity] = useState(1); // Cantidad seleccionada por el usuario
  const [selectedColor, setSelectedColor] = useState<string | null>(null); // Color seleccionado
  const [selectedSize, setSelectedSize] = useState<string | null>(null); // Talla seleccionada (S, M, L)
  const [selectedSizeRange, setSelectedSizeRange] = useState<number | null>(null); // Talla numérica seleccionada
  const [isWishlistButtonActive, setIsWishlistButtonActive] = useState(false); // Controla si el botón de wishlist está activo (rojo)
  const [isWishlistLoading, setIsWishlistLoading] = useState(false); // Controla el estado de carga del botón wishlist

  // Calcula el porcentaje de descuento si existe precio de comparación
  const discountPercentage = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  // Genera una calificación y estrellas aleatorias (puedes reemplazar esto con datos reales)
  const rating = getRandomRating();
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  // Funciones para manejar la cantidad
  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  // Función para añadir al carrito
  const handleAddToCart = () => {
    // Aquí podrías añadir validaciones (ej. si se seleccionó color/talla si son requeridos)
    if (product.colors && product.colors.length > 0 && !selectedColor) {
        toast.warn("Por favor, selecciona un color.");
        return;
    }
     if (product.sizes && product.sizes.length > 0 && product.category !== 'zapatos' && !selectedSize) {
        toast.warn("Por favor, selecciona una talla.");
        return;
    }
     if (product.sizeRange && product.category !== 'Moda' && !selectedSizeRange) {
        toast.warn("Por favor, selecciona una talla numérica.");
        return;
    }

    addToCart({
      id: product.id,
      name: product.title,
      price: product.price,
      image: product.images?.[0] || '/placeholder.svg', // Usa la primera imagen o un placeholder
      quantity: quantity, // Usa la cantidad seleccionada
      color: selectedColor,
      size: selectedSize,
      sizeRange: selectedSizeRange,
    });
    toast.success(`${quantity} "${product.title}" añadido(s) al carrito!`);
    setQuantity(1); // Resetea la cantidad a 1 después de añadir
  };

  useEffect(() => {
    const inWishlist = isProductInWishlist(product.id);
    setIsWishlistButtonActive(inWishlist);
  }, [isProductInWishlist, product.id, wishlist]);
  
  const handleWishlistAction = async () => {
    if (!isSignedIn) {
      toast.info("Debes iniciar sesión para añadir a favoritos.");
      return;
    }
    setIsWishlistLoading(true);
    try {
      await addToWishlist(product.id, product);
      // Puedes mostrar un toast genérico aquí si quieres
      toast.success("Favoritos actualizado");
    } finally {
      setIsWishlistLoading(false);
    }
  };

  useEffect(() => {
    if (isSignedIn) {
      fetchWishlist();
    } else {
      setWishlist([]); // O null, según tu lógica
    }
  }, [isSignedIn]);

  // Prueba de toast y logs
  useEffect(() => {
    console.log("useToast hook ejecutado");
  }, []);

  // Renderizado de Skeleton mientras carga el producto
  if (!product || !product.title || !product.images || product.price === undefined) {
    return (
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
  }

  // Handlers para cambios en color, talla y rango de talla
  const handleColorChange = (color: string) => {
    setSelectedColor(color);
  };

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
  };

  const handleSizeRangeChange = (sizeRange: number) => {
    setSelectedSizeRange(sizeRange);
  };

  // Función para compartir el producto
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: product.description,
          url: window.location.href,
        });
        toast.success("Producto compartido exitosamente");
      } catch (error) {
        console.error("Share error:", error)
        toast.error("Error al compartir el producto");
      }
    } else {
      toast.info("La función de compartir no está soportada en este navegador");
       // Fallback: Copiar al portapapeles
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Enlace copiado al portapapeles");
      } catch (err) {
        toast.error("No se pudo copiar el enlace");
      }
    }
  };

  function renderStars(rating: number) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <>
        {Array.from({ length: fullStars }).map((_, i) => (
          <svg key={`full-${i}`} className="w-4 h-4 fill-yellow-400 text-yellow-400" viewBox="0 0 24 24">
            <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
          </svg>
        ))}
        {hasHalfStar && (
          <svg key="half" className="w-4 h-4" viewBox="0 0 24 24">
            <defs>
              <linearGradient id="half-grad">
                <stop offset="50%" stopColor="#facc15" />
                <stop offset="50%" stopColor="#d1d5db" />
              </linearGradient>
            </defs>
            <path
              fill="url(#half-grad)"
              d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z"
            />
          </svg>
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <svg key={`empty-${i}`} className="w-4 h-4 text-gray-300" viewBox="0 0 24 24">
            <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
          </svg>
        ))}
      </>
    );
  }

  // --- Renderizado del Componente ---
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Breadcrumbs */}
      <div className="text-sm text-muted-foreground mb-6">
        <span className="hover:underline cursor-pointer">Home</span> /
        <span className="hover:underline cursor-pointer mx-2">{product.category || "Products"}</span> /
        <span className="font-medium text-foreground">{product.title}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Columna Izquierda: Imágenes y Oferta */}
        <div className="space-y-4">
          {product.images?.length > 0 ? (
            <>
              {/* Imagen Principal */}
              <div className="relative aspect-square overflow-hidden rounded-lg border bg-background">
                <Image
                  loader={customLoader}
                  src={product.images[selectedImage]}
                  alt={product.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Añade sizes para optimizar
                  className="object-contain" // object-contain para ver toda la imagen
                  priority // Carga esta imagen primero
                />
                {discountPercentage > 0 && (
                  <Badge className="absolute top-4 left-4 bg-red-500 hover:bg-red-600 text-white">
                    Save {discountPercentage}%
                  </Badge>
                )}
              </div>
              {/* Miniaturas */}
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <div
                      key={index}
                      className={`relative aspect-square overflow-hidden rounded-md border bg-background cursor-pointer transition-all ${
                        selectedImage === index ? "ring-2 ring-primary ring-offset-2" : "hover:opacity-80"
                      }`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <Image
                        loader={customLoader}
                        src={image}
                        alt={`${product.title} - Image ${index + 1}`}
                        fill
                        sizes="10vw" // Tamaño pequeño para miniaturas
                        className="object-contain"
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            // Placeholder si no hay imágenes
            <div className="relative aspect-square overflow-hidden rounded-lg border bg-gray-100">
              <Image
                loader={customLoader}
                src="/placeholder.svg" // Asegúrate que este placeholder exista en tu carpeta public
                alt={product.title}
                fill
                className="object-cover text-gray-300" // object-cover para llenar el espacio
              />
               <span className="absolute inset-0 flex items-center justify-center text-muted-foreground">No Image</span>
            </div>
          )}
          {/* Componente de Oferta */}
          <Ofert />
        </div>

        {/* Columna Derecha: Detalles, Opciones y Acciones */}
        <div className="flex flex-col space-y-6">
          {/* Información Principal */}
          <div className="space-y-2">
            {product.vendor && (
              <div className="text-sm text-muted-foreground">
                Vendido por: <span className="hover:underline cursor-pointer font-medium">{product.vendor}</span>
              </div>
            )}
            <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">{product.title}</h1>

            {/* Calificación y Reviews */}
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {renderStars(rating)}
              </div>
              <span className="font-medium">{rating} de 5</span>
              <span className="text-sm text-muted-foreground">({getRandomReviews()} valoraciones)</span>
            </div>

            {/* Precio */}
            <div className="flex items-baseline gap-3 mt-2">
              <p className="text-2xl text-green-600 font-bold ">
                ${product.price ? product.price.toFixed(2) : 'N/A'}
              </p>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <p className="text-base text-red-600 text-muted-foreground line-through">
                  ${product.compareAtPrice.toFixed(2)}
                </p>
              )}
            </div>

            {/* Estado y Cantidad */}
            <div className="flex items-center gap-2">
              {product.status ? (
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                  In stock
                </Badge>
              ) : (
                <Badge variant="destructive">
                  Out of stock
                </Badge>
              )}
              {product.quantity !== undefined && product.quantity > 0 && (
                <span className="text-sm text-muted-foreground">{product.quantity <= 10 ? `Only ${product.quantity} left!` : `${product.quantity} units available`}</span>
              )}
               {product.quantity !== undefined && product.quantity <= 0 && !product.status && (
                 <span className="text-sm text-red-600">Currently unavailable</span>
               )}
            </div>
          </div>

          <Separator />

          {/* Descripción Corta y SKU */}
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-muted-foreground">{product.description?.substring(0, 150)}{product.description && product.description.length > 150 ? '...' : ''}</p> {/* Muestra solo una parte */}
            </div>
            {product.sku && (
              <div className="flex items-center text-sm">
                <span className="text-muted-foreground mr-2">SKU:</span>
                <span>{product.sku}</span>
              </div>
            )}
          </div>

          {/* Opciones: Cantidad, Talla, Color */}
          <div className="space-y-4 mt-6">
            {/* Selector de Cantidad */}
            <div className="flex items-center space-x-2">
                <Label htmlFor="quantity" className="text-base mr-4">Quantity:</Label>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={decreaseQuantity} aria-label="Decrease quantity">
                    <Minus className="h-3 w-3" />
                </Button>
                <span id="quantity" className="w-12 text-center font-medium">{quantity}</span>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={increaseQuantity} aria-label="Increase quantity" disabled={product.trackInventory && product.quantity !== undefined && quantity >= product.quantity}>
                    <Plus className="h-3 w-3" />
                </Button>
            </div>


            {/* Selector de Talla (S, M, L) */}
            {product.sizes && product.sizes.length > 0 && product.category !== 'zapatos' && (
              <div className="space-y-2">
                <Label htmlFor="size-group" className="text-base">Size</Label>
                <RadioGroup id="size-group" onValueChange={handleSizeChange} value={selectedSize || ''} className="flex flex-wrap items-center gap-2">
                  {product.sizes.map((size) => (
                    <Label
                      key={size}
                      htmlFor={`size-${size}`}
                      className={`border cursor-pointer rounded-md px-3 py-1.5 text-sm flex items-center justify-center gap-2 transition-colors ${selectedSize === size ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2' : 'hover:bg-muted'}`}
                    >
                      <RadioGroupItem value={size} id={`size-${size}`} className="sr-only" />
                      {size}
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Selector de Talla Numérica (Rango) */}
            {product.sizeRange && product.category !== 'Moda' && (() => {
              const { min, max } = product.sizeRange;
              // Asegurarse que min y max sean números válidos
              if (typeof min !== 'number' || typeof max !== 'number' || min > max) return null;
              return (
                <div className="space-y-2">
                  <Label htmlFor="size-range-group" className="text-base">Size</Label>
                  <RadioGroup
                    id="size-range-group"
                    value={selectedSizeRange?.toString() || ''}
                    onValueChange={(value) => handleSizeRangeChange(Number(value))}
                    className="flex flex-wrap items-center gap-2"
                  >
                    {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((size) => (
                      <Label
                        key={size}
                        htmlFor={`size-range-${size}`}
                        className={`border cursor-pointer rounded-md px-3 py-1.5 text-sm flex items-center justify-center gap-2 transition-colors ${selectedSizeRange === size ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2' : 'hover:bg-muted'}`}
                      >
                        <RadioGroupItem value={size.toString()} id={`size-range-${size}`} className="sr-only" />
                        {size}
                      </Label>
                    ))}
                  </RadioGroup>
                </div>
              );
            })()}

            {/* Selector de Color */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="color-group" className="text-base">Color</Label>
                <RadioGroup id="color-group" value={selectedColor || ''} onValueChange={handleColorChange} className="flex flex-wrap items-center gap-2">
                  {product.colors.map((color) => (
                    <Label
                      key={color}
                      htmlFor={`color-${color}`}
                       className={`border cursor-pointer rounded-md p-1 flex items-center justify-center gap-2 transition-colors ${selectedColor === color ? 'ring-2 ring-primary ring-offset-2' : 'hover:opacity-80'}`}
                      // Añade título para accesibilidad y ver el nombre al pasar el ratón
                       title={color}
                    >
                       {/* Escondemos el radio button real */}
                      <RadioGroupItem value={color} id={`color-${color}`} className="sr-only" />
                       {/* Mostramos el círculo de color */}
                      <span
                        className="w-6 h-6 rounded-full border border-gray-300"
                        style={{ backgroundColor: color.toLowerCase() }} // Asegura minúsculas para nombres CSS
                       />
                    </Label>
                  ))}
                </RadioGroup>
                {/* Opcional: Mostrar nombre del color seleccionado */}
                {selectedColor && <span className="text-sm text-muted-foreground ml-2">Selected: {selectedColor}</span>}
              </div>
            )}

            {/* Botones de Acción: Add to Cart y Wishlist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
            <Button
              size="lg"
              className="w-full bg-green-600 text-white animate-bounce"
              onClick={handleAddToCart}
              disabled={!product.status || (product.trackInventory && product.quantity !== undefined && product.quantity <= 0) || isWishlistLoading}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
              <Button
                size="lg"
                variant="secondary"
                disabled={isWishlistLoading}
                className={`w-full flex items-center justify-center gap-2 transition-colors duration-200 ${
                  isWishlistButtonActive
                    ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-300'
                    : 'hover:bg-gray-100'
                } ${
                  isWishlistLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={handleWishlistAction}
              >
                {isWishlistLoading ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-t-2 border-b-2 border-current rounded-full mr-2"></span>
                    Procesando...
                  </>
                ) : (
                  <>
                    <Heart className={`h-4 w-4 ${isWishlistButtonActive ? 'fill-red-500 text-red-600' : 'text-gray-500'}`} />
                    {isWishlistButtonActive ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                  </>
                )}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Información Adicional: Envío, Devoluciones, etc. */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span>Free shipping over $50</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span>30-day easy returns</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span>2-year warranty</span>
            </div>
            <div className="flex items-center gap-2">
              <Share2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="hover:underline cursor-pointer" onClick={handleShare}>Share this product</span>
            </div>
          </div>

          <Separator />

          {/* Pestañas: Descripción, Detalles, Envío */}
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="pt-4 text-muted-foreground">
              <p>{product.description || "No description available."}</p>
              {/* Podrías añadir más contenido aquí si lo tienes */}
            </TabsContent>

            <TabsContent value="details" className="pt-4">
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Product ID</span>
                  <span className="font-medium">{product.id}</span>
                </li>
                {product.category && (
                  <li className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium">{product.category}</span>
                  </li>
                )}
                 {product.vendor && (
                   <li className="flex justify-between py-1 border-b">
                     <span className="text-muted-foreground">Vendor</span>
                     <span className="font-medium">{product.vendor}</span>
                   </li>
                 )}
                {product.productType && (
                   <li className="flex justify-between py-1 border-b">
                     <span className="text-muted-foreground">Type</span>
                     <span className="font-medium">{product.productType}</span>
                   </li>
                 )}
                {product.sku && (
                  <li className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground">SKU</span>
                    <span className="font-medium">{product.sku}</span>
                  </li>
                 )}
                {product.barcode && (
                  <li className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground">Barcode (GTIN)</span>
                    <span className="font-medium">{product.barcode}</span>
                  </li>
                 )}
                {product.tags && typeof product.tags === 'string' && product.tags.trim() !== '' && (
                  <li className="flex flex-col sm:flex-row justify-between py-2 border-b">
                    <span className="text-muted-foreground mb-1 sm:mb-0">Tags</span>
                    <div className="flex flex-wrap gap-1 justify-start sm:justify-end">
                      {product.tags.split(",").map((tag) => tag.trim()).filter(Boolean).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs font-normal">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </li>
                )}
                 {/* Puedes añadir más detalles como materiales, peso, dimensiones si los tienes */}
              </ul>
            </TabsContent>

            <TabsContent value="shipping" className="pt-4 text-muted-foreground space-y-2">
              <p><strong>Standard Shipping:</strong> Free on orders over $50. Typically arrives in 3-5 business days.</p>
              <p><strong>Express Shipping:</strong> Available at checkout for faster delivery (1-2 business days).</p>
              <p><strong>International Shipping:</strong> Available to select countries. Rates and delivery times vary.</p>
              <p>Please note: Shipping times may be affected by holidays and carrier delays.</p>
            </TabsContent>
          </Tabs>
          <FAQ />
        </div> {/* Fin Columna Derecha */}
      </div> {/* Fin Grid Principal */}
      <CommentsPage averageRating={typeof rating === 'number' ? rating : 5} />
    </div> // Fin Container
  );
}
