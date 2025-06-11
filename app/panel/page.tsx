'use client';

import { DashboardLayouts } from "@/components/dashboard-layouts";
import { useUser } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

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

export default function PanelPage() {
  // TODOS los hooks aquí, sin returns antes
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [lastWishlistId, setLastWishlistId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [saldo, setSaldo] = useState<number | null>(null);
  const [comprasPendientes, setComprasPendientes] = useState<any[]>([]);
  const purchasesPerPage = 5;
  const [wishlistCount, setWishlistCount] = useState<number | null>(null);
  const [numeroDeCompras, setNumeroDeCompras] = useState<number>(0);


  useEffect(() => {
    if (isLoaded && user && !user.publicMetadata?.isAdmin) {
      router.replace("/dashboard");
    }
  }, [isLoaded, user, router]);

  useEffect(() => {
  if (user && user.publicMetadata?.isAdmin) {
    // Obtener número de compras
    fetch('/api/pagos/numerodepagos')
      .then(response => {
        console.log('Response from /api/pagos/numerodepagos:', response);
        return response.json();
      })
      .then(data => {
        console.log('Data from /api/pagos/numerodepagos:', data);
        if (typeof data.count === 'number') {
          setNumeroDeCompras(data.count); // Asegúrate de tener este estado definido
          if (typeof window !== "undefined") {
            localStorage.setItem('numero_de_compras', data.count.toString());
          }
        }
      })
      .catch(error => {
        console.error('Error al obtener el número de compras:', error);
      });
  }
}, [user]);


      // WISHLIST: 1. Intentar cargar de localStorage
      if (typeof window !== "undefined") {
        const localWishlistId = localStorage.getItem('dashboard_lastWishlistId');
        if (localWishlistId) {
          setLastWishlistId(Number(localWishlistId));
        }
      }

      // WISHLIST: 2. Hacer fetch a la API
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
      if (typeof window !== "undefined") {
        const localSaldo = localStorage.getItem('dashboard_saldo');
        if (localSaldo) {
          setSaldo(Number(localSaldo));
          setLoading(false);
        }
      }

      // SALDO: 2. Hacer fetch a la API
      fetch('/api/balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      })
        .then(response => {
          console.log('Response from /api/balance:', response);
          return response.json();
        })
        .then(data => {
          console.log('Data from /api/balance:', data);
          if (data.saldo !== undefined) {
            setSaldo(data.saldo);
            if (typeof window !== "undefined") {
              localStorage.setItem('dashboard_saldo', data.saldo);
            }
          }
          setLoading(false);
        })
        .catch(error => {
          console.error('Error al obtener el saldo:', error);
          setLoading(false);
        });

      // Cargar comprasPendientes de localStorage si existe
      if (typeof window !== "undefined") {
        const compras = localStorage.getItem('compras_pendientes');
        if (compras) {
          setComprasPendientes(JSON.parse(compras));
        }
      }
    }
  }, [user, isLoaded]);

  console.log('Before memo calculations');
  const name = user?.firstName || '';
  const lastname = user?.lastName || '';
  const email = user?.primaryEmailAddress?.emailAddress || '';

  const lastPurchaseId = purchases.length > 0 ? purchases[0].id : 'N/A';
  const lastPurchaseDate = purchases.length > 0 ? new Date(purchases[0].created_at).toLocaleDateString() : 'N/A';

  // Lógica de paginación
  const indexOfLastPurchase = currentPage * purchasesPerPage;
  const indexOfFirstPurchase = indexOfLastPurchase - purchasesPerPage;
  const currentPurchases = purchases.slice(indexOfFirstPurchase, indexOfLastPurchase);
  const totalPages = Math.ceil(purchases.length / purchasesPerPage);

  const handleNextPage = () => {
    console.log('handleNextPage called');
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    console.log('handlePrevPage called');
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const productosValidos = useMemo(() =>
    currentPurchases.map(purchase => purchase.products).flat().filter(item => !!item.id && !isNaN(Number(item.id))),
    [currentPurchases]
  );
  const hayProductosInvalidos = useMemo(() =>
    productosValidos.length !== currentPurchases.map(purchase => purchase.products).flat().length,
    [productosValidos, currentPurchases]
  );

  console.log('Before useEffect 3');
  useEffect(() => {
    console.log('Inside useEffect 3');
    if (hayProductosInvalidos) {
      toast.error("Hay productos inválidos en tu carrito. Por favor, actualiza tu carrito.");
    }
  }, [hayProductosInvalidos]);

  const handleInternalBalancePayment = async () => {
    console.log('handleInternalBalancePayment called');
    setLoading(true);
    try {
      // ... tu lógica de pago ...

      // Guardar datos en localStorage, etc.

      // const orderId = data.orderId; // <-- Comentado porque 'data' no está definido
      // router.push(`/thankyou?orderId=${orderId}`);
      return; // <-- IMPORTANTE: Detiene la ejecución aquí, el loading sigue en true
    } catch (error: any) {
      console.error("Error en el pago con saldo:", error);
      toast.error(error.message || "Hubo un error al procesar tu pago");
      setLoading(false); // Solo aquí se vuelve a habilitar el botón si hay error
    }
  };

  // AHORA SÍ, los returns condicionales
  if (!isLoaded) return <div>Cargando...</div>;
  if (!user) return <div>No estás autenticado</div>;
  if (!user.publicMetadata?.isAdmin) return <div>No tienes acceso a este panel.</div>;

  // Ahora sí, el return principal
  return (
    <DashboardLayouts>
      {hayProductosInvalidos ? (
        <div className="p-8 text-center text-red-600 font-bold text-xl">
          Error: productos inválidos en tu carrito.
        </div>
      ) : (
        <div className="flex flex-col gap-4 p-4 md:p-8">
          {/* Cards principales */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border bg-card p-4 sm:p-6 shadow-sm">
              <div className="flex flex-row items-center justify-between pb-2">
                <div className="text-sm font-medium">Ingresos Globales:</div>
              </div>
              <div className="text-xl sm:text-2xl font-bold">${saldo !== null ? Number(saldo).toFixed(2) : '0.00'}</div>
              <div className="text-xs text-muted-foreground">+15% desde el mes pasado</div>
            </div>

            <div className="rounded-lg border bg-card p-4 sm:p-6 shadow-sm">
              <div className="flex flex-row items-center justify-between pb-2">
                <div className="text-sm font-medium">Envios Pendientes</div>
              </div>
              <div className="text-xl sm:text-2xl font-bold">{lastPurchaseId}</div>
              <div className="text-xs text-muted-foreground">Última compra: {lastPurchaseDate}</div>
            </div>

            <div className="rounded-lg border bg-card p-4 sm:p-6 shadow-sm">
              <div className="flex flex-row items-center justify-between pb-2">
                <div className="text-sm font-medium">Visitantes en la Web:</div>
              </div>
              <div className="text-xl sm:text-2xl font-bold">{lastWishlistId === 0 ? 'Sin productos' : lastWishlistId}</div>
              <div className="text-xs text-muted-foreground">Numero de Producto</div>
            </div>

            <div className="rounded-lg border bg-card p-4 sm:p-6 shadow-sm">
              <div className="flex flex-row items-center justify-between pb-2">
                <div className="text-sm font-medium">Administrador:</div>
              </div>
              <div className="text-xl sm:text-2xl font-bold">{name}</div>
              <div className="text-xs text-muted-foreground">{lastname}</div>
              <div className="text-xs text-muted-foreground">{email}</div>
            </div>
          </div>

          {/* Mensaje de bienvenida */}
          <div className="rounded-lg border shadow-sm">
            <div className="p-6">
              <h2 className="text-xl font-semibold">Bienvenido a tu Panel</h2>
              <p className="mt-2 text-muted-foreground">
                Antonio, aquí podrás gestionar a los usuarios, revisar sus compras, recargar saldo y más. Utiliza el menú lateral para navegar.
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
      )}
    </DashboardLayouts>
  );
}
