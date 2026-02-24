import { create } from 'zustand';
import { getCart, addToCart, removeFromCart, clearCart } from '../features/products/api/cart';
import { toast } from 'react-toastify';

const useCartStore = create((set, get) => ({
  cart: null,
  loading: false,

  fetchCart: async () => {
    try {
      set({ loading: true });
      const response = await getCart();
      set({ cart: response.data, loading: false });
    } catch (error) {
      set({ loading: false });
    }
  },

  addItem: async (productId) => {
    try {
      const response = await addToCart(productId);
      set({ cart: response.data });
      toast.success('Produit ajouté au panier');
    } catch (error) {
      const msg = error.response?.data?.error || 'Erreur lors de l\'ajout au panier';
      toast.error(msg);
    }
  },

  removeItem: async (productId) => {
    try {
      const response = await removeFromCart(productId);
      set({ cart: response.data });
      toast.success('Produit retiré du panier');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  },

  clearAll: async () => {
    try {
      const response = await clearCart();
      set({ cart: response.data });
      toast.success('Panier vidé');
    } catch (error) {
      toast.error('Erreur lors du vidage du panier');
    }
  },

  resetCart: () => set({ cart: null }),
}));

export default useCartStore;
