"use client"
import { useState, useEffect } from "react"
import { DashboardLayouts } from "@/components/dashboard-layouts"
import { PurchaseDetailsModal } from "@/components/purchase-details-modal"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PurchaseItem {
  id?: number;
  name: string;
  title?: string;
  price: number;
  quantity: number;
  image?: string;
  color?: string;
  size?: string;
  sizeRange?: string | null;
}

interface Purchase {
  id: string | number;
  referenceCode?: string;
  description: string;
  total: number | string;
  updated_at: number | string;
  created_at: number | string;
  products: string | PurchaseItem[];
  items?: PurchaseItem[];
  status?: string;
  user_id?: string;
  user_email?: string;
  buyer_name?: string;
}

export default function PurchasesAdminPage() {
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totalItems, setTotalItems] = useState(0);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/pagos/todas?page=${currentPage}&timestamp=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache' }
      });
      const data = await res.json();
      setPurchases(Array.isArray(data.purchases) ? [...data.purchases] : []);
      setTotalItems(data.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching purchases:', error);
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, [currentPage]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/pagos/todas?page=${currentPage}`, {
        headers: { 'Cache-Control': 'no-store' }
      });
      const data = await res.json();
      setPurchases(Array.isArray(data.purchases) ? [...data.purchases] : []);
      setTotalItems(data.pagination?.total || 0);
    } catch (error) {
      console.error('Error refreshing purchases:', error);
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setIsModalOpen(true);
  };

  const handleChangeStatus = async (newStatus: string) => {
    if (!selectedPurchase) return;

    setPurchases(prev => prev.map(p =>
      p.id === selectedPurchase.id ? { ...p, status: newStatus } : p
    ));

    setIsModalOpen(false);

    try {
      await fetch('/api/pagos/actualizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedPurchase.id, status: newStatus }),
      });

      const res = await fetch(`/api/pagos/todas?page=${currentPage}&rand=${Math.random()}`, {
        headers: { 'Cache-Control': 'no-cache' }
      });
      const data = await res.json();
      setPurchases(data.purchases);
    } catch (error) {
      console.error('Error updating purchase status:', error);
      setPurchases(prev => prev.map(p =>
        p.id === selectedPurchase?.id ? { ...p, status: selectedPurchase?.status } : p
      ));
    }
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const renderPurchasesTable = (purchases: Purchase[]) => {
    if (purchases.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No hay compras registradas.</p>
        </div>
      );
    }

    return (
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th>Usuario</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
            <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
            <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {purchases.map((purchase) => {
            const validItems = Array.isArray(purchase.products)
              ? purchase.products
              : typeof purchase.products === 'string'
                ? JSON.parse(purchase.products)
                : [];

            const userNameOrEmail = purchase.buyer_name || purchase.user_email || '-';
            const productTitle = validItems.length > 0
              ? validItems.map((item: PurchaseItem) => item.title || item.name).join(', ')
              : purchase.description || 'Sin descripción';

            const date = new Date(Number(purchase.created_at));
            const formattedDate = !isNaN(date.getTime()) ? date.toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : 'Fecha inválida';

            const total = typeof purchase.total === 'number'
              ? purchase.total.toFixed(2)
              : parseFloat(purchase.total || '0').toFixed(2);

            return (
              <tr
                key={`${purchase.referenceCode || purchase.id}_${purchase.status}_${purchase.updated_at}`}
                onClick={() => handleRowClick(purchase)}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td>{userNameOrEmail}</td>
                <td className="px-4 py-3 text-xs sm:text-sm whitespace-nowrap">
                  {`#${purchase.id}`}
                </td>
                <td className="px-4 py-3 text-xs sm:text-sm">
                  <div className="line-clamp-2">
                    {productTitle}
                  </div>
                </td>
                <td className="hidden sm:table-cell px-4 py-3 text-xs sm:text-sm whitespace-nowrap">
                  {formattedDate}
                </td>
                <td className="hidden sm:table-cell px-4 py-3 text-xs sm:text-sm">
                  <Badge>
                    {purchase.status || 'Pendiente'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right text-xs sm:text-sm whitespace-nowrap">
                  ${total}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <DashboardLayouts>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <h2 className="text-2xl font-bold">Todas las Compras</h2>
        <Card>
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Compras</h3>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            {loading ? (
              <div className="p-6 text-center">Cargando compras...</div>
            ) : (
              <>
                <div className="rounded-lg border overflow-hidden">
                  <div className="overflow-x-auto">
                    {renderPurchasesTable(purchases)}
                  </div>
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 py-4 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1 || loading}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      Página {currentPage} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage >= totalPages || loading}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>
        {selectedPurchase && (
          <PurchaseDetailsModal
            purchase={selectedPurchase}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onStatusChange={handleChangeStatus}
          />
        )}
      </div>
    </DashboardLayouts>
  );
}
