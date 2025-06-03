import { create } from 'zustand';
import Cookies from 'js-cookie';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  color?: string | null;
  size?: string | null;
  sizeRange?: number | null;
}

interface CartState {
  cartItems: CartItem[];
  addToCart: (p: CartItem) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  cartItems: typeof window !== "undefined" && Cookies.get("cart") ? JSON.parse(Cookies.get("cart")!) : [],
  addToCart: (product) => set((state) => {
    const exist = state.cartItems.find(i => i.id === product.id);
    let newCart;
    if (exist) {
      newCart = state.cartItems.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
    } else {
      newCart = [...state.cartItems, { ...product, quantity: 1 }];
    }
    Cookies.set("cart", JSON.stringify(newCart), { expires: 7 });
    return { cartItems: newCart };
  }),
  removeFromCart: (productId) => set((state) => {
    const item = state.cartItems.find(i => i.id === productId);
    let newCart;
    if (!item) return { cartItems: state.cartItems };
    if (item.quantity === 1) newCart = state.cartItems.filter(i => i.id !== productId);
    else newCart = state.cartItems.map(i => i.id === productId ? { ...i, quantity: i.quantity - 1 } : i);
    if (newCart.length === 0) Cookies.remove("cart");
    else Cookies.set("cart", JSON.stringify(newCart), { expires: 7 });
    return { cartItems: newCart };
  }),
  clearCart: () => {
    Cookies.remove("cart");
    set({ cartItems: [] });
  }
})); 
