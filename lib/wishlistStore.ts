import { create } from 'zustand';
import { toast } from 'react-toastify';

export interface WishlistItem {
  id: number;
  user_id: string | number;
  productId: number;
  title?: string;
  description?: string;
  price?: number;
  image?: string;
}

interface WishlistState {
  wishlist: WishlistItem[];
  isLoading: boolean;
  fetchWishlist: () => Promise<void>;
  addToWishlist: (productId: number, product?: any) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  isProductInWishlist: (productId: number) => boolean;
  setWishlist: (items: WishlistItem[]) => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  wishlist: [],
  isLoading: false,
  setWishlist: (items) => set({ wishlist: items }),
  fetchWishlist: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/wishlist');
      if (!res.ok) {
        set({ wishlist: [] });
        return;
      }
      const data = await res.json();
      set({ wishlist: Array.isArray(data) ? data : [] });
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      set({ wishlist: [] });
    } finally {
      set({ isLoading: false });
    }
  },
  addToWishlist: async (productId, product) => {
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product ? { productId, product } : { productId }),
      });
      if (res.status === 401) {
        toast.info("Debes iniciar sesión para añadir a favoritos.");
        return;
      }
      if (!res.ok) {
        let errorData = { error: 'Error al añadir a favoritos' };
        try {
          errorData = await res.json();
        } catch (e) {
          console.error("Error al procesar la respuesta:", await res.text());
        }
        toast.error(errorData.error || `Error ${res.status}`);
        return;
      }
      await get().fetchWishlist();
      toast.success("Añadido a favoritos");
    } catch (error) {
      console.error('Error al añadir a favoritos:', error);
      toast.error("Error al añadir a favoritos");
    }
  },
  removeFromWishlist: async (productId) => {
    try {
      const res = await fetch(`/api/wishlist?productId=${productId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        throw new Error('Error al eliminar de favoritos');
      }
      await get().fetchWishlist();
      toast.success("Eliminado de favoritos");
    } catch (error) {
      console.error('Error al eliminar de favoritos:', error);
      toast.error("Error al eliminar de favoritos");
    }
  },
  isProductInWishlist: (productId) => {
    const wishlist = get().wishlist;
    return Array.isArray(wishlist) && wishlist.some(item => item.productId === productId);
  },
})); 
