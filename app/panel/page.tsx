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

    if (user && user.publicMetadata?.isAdmin) {
      fetch('/api/pagos/numerodepagos')
        .then(response => response.json())
        .then(data => {
          if (typeof data.count === 'number') {
            setNumeroDeCompras(data.count);
            localStorage.setItem('numero_de_compras', data.count.toString());
          }
        })
        .catch(error => console.error('Error al obtener el número de compras:', error));

      const localWishlistId = localStorage.getItem('dashboard_lastWishlistId');
      if (localWishlistId) setLastWishlistId(Number(localWishlistId));

      fetch('/api/wishlist/numero')
        .then(res => {
          if (res.status === 401) {
            setWishlistCount(null);
            localStorage.removeItem('dashboard_wishlistCount');
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
        .catch(error => console.error('Error al obtener el número de productos favoritos:', error));

      const localSaldo = localStorage.getItem('dashboard_saldo');
      if (localSaldo) {
        setSaldo(Number(localSaldo));
        setLoading(false);
      }

      fetch('/api/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
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

      const compras = localStorage.getItem('compras_pendientes');
      if (compras) setComprasPendientes(JSON.parse(compras));
    }
  }, [user, isLoaded]);

  const name = user?.firstName || '';
  const lastname = user?.lastName || '';
  const email = user?.primaryEmailAddress?.emailAddress || '';

  const lastPurchaseId = purchases.length > 0 ? purchases[0].id : 'N/A';
  const lastPurchaseDate = purchases.length > 0 ? new Date(purchases[0].created_at).toLocaleDateString() : 'N/A';

  const indexOfLastPurchase = currentPage * purchasesPerPage;
  const indexOfFirstPurchase = indexOfLastPurchase - purchasesPerPage;
  const currentPurchases = purchases.slice(indexOfFirstPurchase, indexOfLastPurchase);
  const totalPages = Math.ceil(purchases.length / purchasesPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const productosValidos = useMemo(() =>
    currentPurchases.map(p => p.products).flat().filter(i => !!i.id && !isNaN(Number(i.id))),
    [currentPurchases]
  );

  const hayProductosInvalidos = useMemo(() =>
    productosValidos.length !== currentPurchases.map(p => p.products).flat().length,
    [productosValidos, currentPurchases]
  );

  useEffect(() => {
    if (hayProductosInvalidos) {
      toast.error("Hay productos inválidos en tu carrito. Por favor, actualiza tu carrito.");
    }
  }, [hayProductosInvalidos]);

  const handleInternalBalancePayment = async () => {
    setLoading(true);
    try {
      return;
    } catch (error: any) {
      console.error("Error en el pago con saldo:", error);
      toast.error(error.message || "Hubo un error al procesar tu pago");
      setLoading(false);
    }
  };

  if (!isLoaded) return <div>Cargando...</div>;
  if (!user) return <div>No estás autenticado</div>;
  if (!user.publicMetadata?.isAdmin) return <div>No tienes acceso a este panel.</div>;

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

          <div className="rounded-lg border shadow-sm">
            <div className="p-6">
              <h2 className="text-xl font-semibold">Bienvenido a tu Panel</h2>
              <p className="mt-2 text-muted-foreground">
                Antonio, aquí podrás gestionar a los usuarios, revisar sus compras, recargar saldo y más. Utiliza el menú lateral para navegar.
              </p>
            </div>
          </div>

          <div className="rounded-lg border shadow-sm">
            <div className="p-6">
              <h2 className="text-xl font-semibold">Tus Compras</h2>
              {currentPurchases.length > 0 ? (
                <>
                  <ul>
                    {currentPurchases.map(purchase => (
                      <li key={purchase.id} className="mt-4 border-b pb-4">
                        <div className="text-sm font-medium space-y-2">
                          {purchase.products.map(product => (
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
                          ))}
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">SKU: {purchase.id}</div>
                        <div className="text-xs text-muted-foreground">Total: ${purchase.total}</div>
                        <div className="text-xs text-muted-foreground">Fecha: {new Date(purchase.created_at).toLocaleDateString()}</div>
                      </li>
                    ))}
                  </ul>

                  <div className="flex justify-between items-center mt-6">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className="text-black px-4 py-2 bg-black-200 rounded hover:bg-black hover:text-white disabled:opacity-90"
                    >
                      <ChevronLeft size={16} /> Anterior
                    </button>
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="text-black px-4 py-2 bg-black-200 rounded hover:bg-black hover:text-white disabled:opacity-90"
                    >
                      Siguiente <ChevronRight size={16} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-muted-foreground">No tienes compras registradas aún.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayouts>
  );
}
