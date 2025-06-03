import { useCartStore } from '@/lib/cartStore';

export const useCart = () => {
  const cartItems = useCartStore(state => state.cartItems);
  const addToCart = useCartStore(state => state.addToCart);
  const removeFromCart = useCartStore(state => state.removeFromCart);
  const clearCart = useCartStore(state => state.clearCart);

  const cart = {
    items: cartItems,
    total: cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
    itemCount: cartItems.reduce((acc, item) => acc + item.quantity, 0),
  };

  return {
    cart,
    addToCart,
    removeFromCart,
    clearCart,
  };
};