"use client"
import { useState, useEffect } from "react"
import { DashboardLayouts } from "@/components/dashboard-layouts"
import { PurchaseDetailsModal } from "@/components/purchase-details-modal"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PurchaseItem {
  id?: number;
  name: string;
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
  total: number;
  updated_at: number | string;
  created_at: number | string;
  products: string | PurchaseItem[];
  items?: PurchaseItem[];
  status?: string;
  payuData?: {
    transactionState: string;
    paymentMethod: number;
    authorizationCode: string;
  };
  user_id?: string;
  user_email?: string;
}

export default function PurchasesAdminPage() {
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState<Purchase[]>([]); // Estado solo para renderizar
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPageSaldo, setCurrentPageSaldo] = useState(1);
  const [currentPagePayu, setCurrentPagePayu] = useState(1);
  const [activeTab, setActiveTab] = useState<'saldo' | 'payu'>('saldo');
  const itemsPerPage = 10;
  const [totalItems, setTotalItems] = useState({ saldo: 0, payu: 0 });

  const fetchPurchases = async () => {
  setLoading(true);
  try {
    const type = activeTab;
    const page = activeTab === 'payu' ? currentPagePayu : currentPageSaldo;
    const res = await fetch(`/api/pagos/todas?page=${page}&type=${type}&timestamp=${Date.now()}`, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    const data = await res.json();
    setPurchases(Array.isArray(data.purchases) ? [...data.purchases] : []);
    setTotalItems((prev) => ({ ...prev, [type]: data.pagination?.total || 0 }));
  } catch (error) {
    console.error('Error fetching purchases:', error);
    setPurchases([]);
  }
  setLoading(false);
};


  // Refrescar manualmente
  const handleRefresh = async () => {
    setLoading(true);
    try {
      const type = activeTab;
      const page = activeTab === 'payu' ? currentPagePayu : currentPageSaldo;
      const res = await fetch(`/api/pagos/todas?page=${page}&type=${type}`, {
        headers: { 'Cache-Control': 'no-store' }
      });
      const data = await res.json();
      setPurchases(Array.isArray(data.purchases) ? [...data.purchases] : []);
      setTotalItems((prev) => ({ ...prev, [type]: data.pagination?.total || 0 }));
    } catch (error) {
      setPurchases([]);
    }
    setLoading(false);
  };

  // Abrir modal de detalles
  const handleRowClick = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setIsModalOpen(true);
  };

  // Cambiar estado de la compra
  const handleChangeStatus = async (newStatus: string) => {
    if (!selectedPurchase) return;
    
    // Actualización optimista
    setPurchases(prev => prev.map(p =>
      p.id === selectedPurchase.id ? { ...p, status: newStatus } : p
    ));

    setIsModalOpen(false);
  
    // Actualización en backend
    const isPayu = activeTab === 'payu';
    const payload = isPayu
      ? { referenceCode: selectedPurchase.id, status: newStatus, type: 'payu' }
      : { id: selectedPurchase.id, status: newStatus, type: 'saldo' };


  try {
    await fetch('/api/pagos/actualizar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  
    // Recarga de datos frescos
    const page = isPayu ? currentPagePayu : currentPageSaldo;
    const res = await fetch(`/api/pagos/todas?page=${page}&type=${activeTab}&rand=${Math.random()}`, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    const data = await res.json();
    setPurchases(data.purchases);
  } catch (error) {
    setPurchases(prev => prev.map(p =>
      p.id === selectedPurchase?.id ? { ...p, status: selectedPurchase?.status } : p
    ));
    console.error('Error al actualizar el estado:', error);
  }
};
  // Calcular total de páginas para cada tipo
  const totalPagesSaldo = Math.ceil(totalItems.saldo / itemsPerPage);
  const totalPagesPayu = Math.ceil(totalItems.payu / itemsPerPage);

  // Renderizar la tabla de compras
  const renderPurchasesTable = (purchases: Purchase[]) => {
    console.log("Tabla va a renderizar compras:", purchases);
    if (purchases.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No hay compras registradas en esta categoría.</p>
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
          {purchases.map((purchase, index) => {
            const validItems = Array.isArray(purchase.products)
              ? purchase.products
              : typeof purchase.products === 'string'
                ? JSON.parse(purchase.products)
                : [];
            return (
              <tr
                key={`${purchase.referenceCode || purchase.id}_${purchase.status}_${purchase.updated_at}`}
                onClick={() => handleRowClick(purchase)}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td>{purchase.user_email || '-'}</td>
                <td className="px-4 py-3 text-xs sm:text-sm whitespace-nowrap">
                  {activeTab === 'payu' ? `PayU-${purchase.id}` : `#${purchase.id}`}
                </td>
                <td className="px-4 py-3 text-xs sm:text-sm">
                  <div className="line-clamp-2">
                    {validItems.length > 0
                      ? validItems.map((item: any) => item.name).join(', ')
                      : purchase.description || 'Sin descripción'}
                  </div>
                </td>
                <td className="hidden sm:table-cell px-4 py-3 text-xs sm:text-sm whitespace-nowrap">
                  {new Date(Number(purchase.created_at)).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </td>
                <td className="hidden sm:table-cell px-4 py-3 text-xs sm:text-sm">
                  <Badge>
                    {purchase.status || 'Pendiente'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right text-xs sm:text-sm whitespace-nowrap">
                  ${typeof purchase.total === 'number'
                    ? purchase.total.toFixed(2)
                    : parseFloat(purchase.total || '0').toFixed(2)
                  }
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
        <Tabs
          defaultValue="saldo"
          className="w-full"
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value as 'saldo' | 'payu');
            if (value === 'saldo') {
              setCurrentPageSaldo(1);
            } else {
              setCurrentPagePayu(1);
            }
          }}
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="saldo" className="text-center">
              Saldo ({totalItems.saldo})
            </TabsTrigger>
            <TabsTrigger value="payu" className="text-center">
              PayU ({totalItems.payu})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="saldo" className="mt-4">
            <Card>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4">Compras con Saldo</h3>
                {loading ? (
                  <div className="p-6 text-center">Cargando compras...</div>
                ) : (
                  <>
                    <div className="rounded-lg border overflow-hidden">
                      <div className="overflow-x-auto">
                        {renderPurchasesTable(purchases)}
                      </div>
                    </div>
                    {totalPagesSaldo > 1 && (
                      <div className="flex items-center justify-center gap-2 py-4 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPageSaldo(prev => Math.max(1, prev - 1))}
                          disabled={currentPageSaldo === 1 || loading}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm">
                          Página {currentPageSaldo} de {totalPagesSaldo}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPageSaldo(prev => Math.min(totalPagesSaldo, prev + 1))}
                          disabled={currentPageSaldo >= totalPagesSaldo || loading}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </Card>
          </TabsContent>
          <TabsContent value="payu" className="mt-4">
            <Card>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4">Compras con PayU</h3>
                {loading ? (
                  <div className="p-6 text-center">Cargando compras...</div>
                ) : (
                  <>
                    <div className="rounded-lg border overflow-hidden">
                      <div className="overflow-x-auto">
                        {renderPurchasesTable(purchases)}
                      </div>
                    </div>
                    {totalPagesPayu > 1 && (
                      <div className="flex items-center justify-center gap-2 py-4 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPagePayu(prev => Math.max(1, prev - 1))}
                          disabled={currentPagePayu === 1 || loading}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm">
                          Página {currentPagePayu} de {totalPagesPayu}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPagePayu(prev => Math.min(totalPagesPayu, prev + 1))}
                          disabled={currentPagePayu >= totalPagesPayu || loading}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      {selectedPurchase && (
        <PurchaseDetailsModal
          purchase={selectedPurchase}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onStatusChange={handleChangeStatus}
        />
      )}
    </DashboardLayouts>
  );
}
