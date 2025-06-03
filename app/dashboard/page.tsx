'use client';

import { DashboardLayout } from "@/components/dashboard-layout";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useUser } from "@clerk/nextjs";

export default function DashboardPage() {
  const { isSignedIn, user } = useUser();
  const router = useRouter();

  interface Product {
    id: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
    color?: string;
    size?: string;
    sizeRange?: string | null;
  }

  interface Purchase {
    id: string;
    description: string;
    total: number;
    created_at: string;
    products: Product[];
  }

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [lastWishlistId, setLastWishlistId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [saldo, setSaldo] = useState<number | null>(null);
  const purchasesPerPage = 5;
  const [wishlistCount, setWishlistCount] = useState<number | null>(null);

  useEffect(() => {
    if (isSignedIn && user) {
      // Intentar cargar de localStorage primero
      const comprasGuardadas = localStorage.getItem('compras_pendientes');
      if (comprasGuardadas) {
        setPurchases(JSON.parse(comprasGuardadas));
      }

      // Luego hacer fetch para actualizar (y guardar de nuevo)
      fetch('/api/pagos/numerodepagos')
        .then(response => response.json())
        .then(data => {
          if (data.purchases) {
            setPurchases(data.purchases);
            localStorage.setItem('compras_pendientes', JSON.stringify(data.purchases));
          }
        });

      // WISHLIST: 1. Intentar cargar el número de productos favoritos de localStorage
      const localWishlistCount = localStorage.getItem('dashboard_wishlistCount');
      if (localWishlistCount !== null) {
        setWishlistCount(Number(localWishlistCount));
      }

      // WISHLIST: 2. Hacer fetch a la API para obtener el número actualizado
      fetch('/api/wishlist/numero')
        .then(res => {
          if (res.status === 401) {
            setWishlistCount(null);
            localStorage.removeItem('dashboard_wishlistCount');
            // Opcional: mostrar un toast o redirigir a login
            return null;
          }
          return res.json();
        })
        .then(data => {
          if (data && typeof data.wishlistCount === 'number') {
            setWishlistCount(data.wishlistCount);
            localStorage.setItem('dashboard_wishlistCount', data.wishlistCount);
          }
        })
        .catch(error => {
          console.error('Error al obtener el número de productos favoritos:', error);
        });

      // SALDO: 1. Intentar cargar de localStorage
      const localSaldo = localStorage.getItem('dashboard_saldo');
      if (localSaldo) {
        setSaldo(Number(localSaldo));
        setLoading(false);
      }

      // SALDO: 2. Hacer fetch a la API (NO envíes userId, Clerk lo detecta solo)
      fetch('/api/balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: "include",
      })
        .then(response => response.json())
        .then(data => {
          if (data.saldo !== undefined) {
            setSaldo(data.saldo);
            localStorage.setItem('dashboard_saldo', data.saldo);
          }
          setLoading(false);
        })
        .catch(error => {
          console.error('Error al obtener el saldo:', error);
          setLoading(false);
        });
    }
  }, [isSignedIn, user]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col gap-4 p-4 md:p-8">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-lg border bg-card p-4 sm:p-6 shadow-sm">
                <div className="flex flex-row items-center justify-between pb-2">
                  <Skeleton width={150} height={20} />
                </div>
                <Skeleton width={100} height={30} />
                <Skeleton width={120} height={20} />
              </div>
            ))}
          </div>
          <div className="rounded-lg border shadow-sm">
            <div className="p-6">
              <Skeleton width={200} height={30} />
              <Skeleton width={300} height={20} className="mt-2" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!isSignedIn || !user) {
    return <div>No estás autenticado</div>;
  }

  const name = user.firstName || '';
  const lastname = user.lastName || '';
  const email = user.primaryEmailAddress?.emailAddress || '';

  const lastPurchaseId = purchases.length > 0 ? purchases[0].id : 'N/A';
  const lastPurchaseDate = purchases.length > 0 ? new Date(purchases[0].created_at).toLocaleDateString() : 'N/A';

  // Lógica de paginación
  const indexOfLastPurchase = currentPage * purchasesPerPage;
  const indexOfFirstPurchase = indexOfLastPurchase - purchasesPerPage;
  const currentPurchases = purchases.slice(indexOfFirstPurchase, indexOfLastPurchase);
  const totalPages = Math.ceil(purchases.length / purchasesPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const productosValidos = currentPurchases.map(purchase => purchase.products).flat().filter(item => !!item.id && !isNaN(Number(item.id)));
  if (productosValidos.length !== currentPurchases.map(purchase => purchase.products).flat().length) {
    toast.error("Hay productos inválidos en tu carrito. Por favor, actualiza tu carrito.");
    return;
  }

  const comprasPendientes = JSON.parse(localStorage.getItem('compras_pendientes') || '[]');

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 p-4 md:p-8">
        {/* Cards principales */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-card p-4 sm:p-6 shadow-sm">
            <div className="flex flex-row items-center justify-between pb-2">
              <div className="text-sm font-medium">Saldo Disponible:</div>
            </div>
            <div className="text-xl sm:text-2xl font-bold">${saldo !== null ? Number(saldo).toFixed(2) : '0.00'}</div>
            <div className="text-xs text-muted-foreground">+15% desde el mes pasado</div>
          </div>

          <div className="rounded-lg border bg-card p-4 sm:p-6 shadow-sm">
            <div className="flex flex-row items-center justify-between pb-2">
              <div className="text-sm font-medium">Compras Pendientes</div>
            </div>
            <div className="text-xl sm:text-2xl font-bold">{lastPurchaseId}</div>
            <div className="text-xs text-muted-foreground">Última compra: {lastPurchaseDate}</div>
          </div>

          <div className="rounded-lg border bg-card p-4 sm:p-6 shadow-sm">
            <div className="flex flex-row items-center justify-between pb-2">
              <div className="text-sm font-medium">Productos Favoritos</div>
            </div>
            <div className="text-xl sm:text-2xl font-bold">{wishlistCount === 0 ? 'Sin productos' : wishlistCount}</div>
            <div className="text-xs text-muted-foreground">Numero de Producto</div>
          </div>

          <div className="rounded-lg border bg-card p-4 sm:p-6 shadow-sm">
            <div className="flex flex-row items-center justify-between pb-2">
              <div className="text-sm font-medium">Usuario:</div>
            </div>
            <div className="text-xl sm:text-2xl font-bold">{name}</div>
            <div className="text-xs text-muted-foreground">{lastname}</div>
            <div className="text-xs text-muted-foreground">{email}</div>
          </div>
        </div>

        {/* Mensaje de bienvenida */}
        <div className="rounded-lg border shadow-sm">
          <div className="p-6">
            <h2 className="text-xl font-semibold">Bienvenido a tu Dashboard</h2>
            <p className="mt-2 text-muted-foreground">
              Aquí podrás gestionar tu perfil, revisar tus compras y más. Utiliza el menú lateral para navegar.
            </p>
          </div>
        </div>

        {/* Sección de compras */}
        <div className="rounded-lg border shadow-sm">
          <div className="p-6">
            <h2 className="text-xl font-semibold">Tus Compras</h2>
            {currentPurchases.length > 0 ? (
              <>
                <ul>
                  {currentPurchases.map(purchase => (
                    <li key={purchase.id} className="mt-4 border-b pb-4">
                      <div className="text-sm font-medium space-y-2">
                        {purchase.products.map(product => {
                          console.log('Imagen producto:', product.name, product.image);
                          return (
                            <div key={product.id} className="flex items-center gap-3">
                              <img
                                src={product.image || '/file.svg'}
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                              <div>
                                <div>{product.quantity} x {product.name}</div>
                                {product.color && (
                                  <div className="text-xs text-muted-foreground">Color: {product.color}</div>
                                )}
                                {product.size && (
                                  <div className="text-xs text-muted-foreground">Talla: {product.size}</div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">SKU: {purchase.id}</div>
                      <div className="text-xs text-muted-foreground">Total: ${purchase.total}</div>
                      <div className="text-xs text-muted-foreground">Fecha: {new Date(purchase.created_at).toLocaleDateString()}</div>
                    </li>
                  ))}
                </ul>

                {/* Controles de paginación */}
                <div className="flex justify-between items-center mt-6">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="text-black px-4 py-2 bg-black-200 rounded hover:bg-black hover:text-white disabled:opacity-90"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="text-black px-4 py-2 bg-black-200 rounded hover:bg-black hover:text-white disabled:opacity-90"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <p className="mt-2 text-muted-foreground">No tienes compras recientes.</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
