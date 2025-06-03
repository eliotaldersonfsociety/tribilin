// components/shopping-cart.tsx

"use client";

import { useState, useEffect } from 'react';
import { useCartStore } from "@/lib/cartStore";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { ShoppingCartIcon as CartIcon, Plus, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose,
} from "@/components/ui/sheet";

export default function ShoppingCart() {
  const cartItems = useCartStore(state => state.cartItems);
  const addToCart = useCartStore(state => state.addToCart);
  const removeFromCart = useCartStore(state => state.removeFromCart);
  const { isSignedIn } = useAuth();

  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    if (isMounted && pathname === "/checkout" && cartItems.length === 0 && !isCheckoutLoading) {
      router.replace("/");
    }
  }, [cartItems, router, pathname, isCheckoutLoading, isMounted]);

  const handleCheckoutClick = async () => {
    if (cartItems.length === 0) {
      return;
    }

    setIsCheckoutLoading(true);
    try {
      // Pequeña pausa para permitir que el Sheet se cierre
      await new Promise(resolve => setTimeout(resolve, 100));

      if (!isSignedIn) {
        await router.push("/sign-in?redirect_url=/checkout");
        return;
      }

      // Usar replace en lugar de push para evitar problemas con el historial
      await router.replace("/checkout");
    } catch (error) {
      console.error("Error al redirigir al checkout:", error);
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const customLoader = ({ src }: { src: string }) => src;

  return (
    <Sheet>
      {isMounted ? (
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="relative focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:ring-blue-500">
            <CartIcon className="h-5 w-5" aria-label={`Carrito de Compras con ${totalQuantity} ${totalQuantity === 1 ? 'artículo' : 'artículos'}`} />
            {totalQuantity > 0 && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 px-1.5 min-w-[1.25rem] h-5 flex items-center justify-center text-xs">
                {totalQuantity}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
      ) : (
        <Button variant="ghost" size="icon" className="relative">
          <CartIcon className="h-5 w-5" aria-label="Carrito de Compras" />
        </Button>
      )}

      <SheetContent className="backdrop-blur-lg bg-background/80 p-6 flex flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="text-1x font-light text-center text-foreground">Tu Carrito de Compras</SheetTitle>
          <Image src="/tsn.png" alt="Logo Tienda Texas" width={100} height={33} className="mx-auto my-4" />
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4 pr-2 -mr-2">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-10">
              <CartIcon className="h-12 w-12 mb-4 text-gray-400" aria-hidden="true" />
              <p className="text-lg font-semibold">Tu carrito está vacío</p>
              <p className="text-sm mt-2">¡Agrega algunos productos para empezar a comprar!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4 pb-4 border-b border-gray-200 last:border-b-0">
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <Image loader={customLoader} src={item.image || "/placeholder.svg"} alt={item.name || "Imagen de Producto"} fill className="rounded-md object-cover" sizes="80px" />
                  </div>
                  <div className="flex-1 grid gap-1">
                    <h4 className="font-medium text-sm line-clamp-2 text-foreground">{item.name ?? 'Producto sin título'}</h4>
                    <p className="text-sm font-semibold text-foreground">${(item.price ?? 0).toFixed(2)} × {item.quantity ?? 0}</p>
                    {(item.color || item.size || item.sizeRange) && (
                      <div className="text-xs text-muted-foreground">
                        {item.color && <span>Color: {item.color}</span>}
                        {item.size && <span>{item.color && " | "}Talla: {item.size}</span>}
                        {item.sizeRange && <span>{(item.color || item.size) && " | "}Rango: {item.sizeRange}</span>}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button variant="outline" size="icon" className="h-7 w-7 rounded-full" onClick={() => removeFromCart(item.id)} aria-label={`Remover una unidad de ${item.name ?? 'este producto'}`}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center text-sm font-medium text-foreground">{item.quantity ?? 0}</span>
                    <Button variant="outline" size="icon" className="h-7 w-7 rounded-full" onClick={() => addToCart(item)} aria-label={`Agregar una unidad más de ${item.name ?? 'este producto'}`}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <SheetFooter className="flex-col gap-2 mt-4 sm:flex-row sm:justify-between">
            <div className="flex flex-col gap-2 w-full sm:w-auto sm:flex-row sm:justify-end">
              <SheetClose asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <span>Seguir Comprando</span>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-base py-2"
                  disabled={isCheckoutLoading || cartItems.length === 0}
                  onClick={handleCheckoutClick}
                >
                  {isCheckoutLoading ? 'Procesando...' : `Ir a Pagar (${totalQuantity} ${totalQuantity === 1 ? 'ítem' : 'ítems'})`}
                </Button>
              </SheetClose>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
