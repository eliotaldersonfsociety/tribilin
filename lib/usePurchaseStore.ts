import create from 'zustand';
import { persist } from 'zustand/middleware';

interface Purchase {
  id: string | number;
  description: string;
  total: number;
  amount?: number;
  created_at: number | string;
  products: string | any[];
  items?: any[];
  status?: string;
  payuData?: {
    transactionState: string;
    paymentMethod: number;
    authorizationCode: string;
  };
  user_id?: string;
  user_email?: string;
}

interface PurchaseState {
  purchases: Purchase[];
  fetchPurchases: (page: number, type: 'saldo' | 'payu') => Promise<void>;
  updatePurchaseStatus: (id: string | number, newStatus: string, type: 'saldo' | 'payu') => Promise<void>;
}

export const usePurchaseStore = create<PurchaseState>()(
  persist(
    (set) => ({
      purchases: [],

      fetchPurchases: async (page: number, type: 'saldo' | 'payu') => {
        const url = `/api/pagos/todas?page=${page}&type=${type}`;
        const res = await fetch(url);
        const data = await res.json();
        console.log("Compras recibidas del backend:", data.purchases);

        if (data.purchases) {
          const parsedPurchases = data.purchases.map((purchase: Purchase) => {
            try {
              return {
                ...purchase,
                total: purchase.amount || purchase.total,
                products: typeof purchase.products === 'string'
                  ? JSON.parse(purchase.products.replace(/\n/g, '').trim())
                  : purchase.products,
                payuData: purchase.payuData || null,
                user_email: purchase.user_email || purchase.user_id || ""
              };
            } catch (error) {
              return {
                ...purchase,
                total: purchase.amount || purchase.total,
                products: [{
                  name: purchase.description || 'Producto sin nombre',
                  price: purchase.total || 0,
                  quantity: 1
                }],
                payuData: purchase.payuData || null,
                user_email: purchase.user_email || purchase.user_id || ""
              };
            }
          });
          set({ purchases: parsedPurchases });
        }
      },

      updatePurchaseStatus: async (id: string | number, newStatus: string, type: 'saldo' | 'payu') => {
        await fetch(`/api/pagos/todas/${id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus, type }),
        });

        set((state) => ({
          purchases: state.purchases.map((purchase) =>
            purchase.id === id ? { ...purchase, status: newStatus } : purchase
          ),
        }));
      },
    }),
    {
      name: 'purchase-storage', // nombre único para el almacenamiento en localStorage
      getStorage: () => localStorage, // (opcional) por defecto usa localStorage
    }
  )
);
