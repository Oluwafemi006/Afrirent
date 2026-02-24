import { create } from 'zustand';
import { getFavorites, toggleFavorite, checkFavorite } from '../features/products/api/favorites';
import { toast } from 'react-toastify';

const useFavoriteStore = create((set, get) => ({
  favorites: [],
  favoriteIds: new Set(),
  loading: false,

  fetchFavorites: async () => {
    try {
      set({ loading: true });
      const response = await getFavorites();
      const favs = response.data.results || response.data;
      const ids = new Set(favs.map(f => f.product.id));
      set({ favorites: favs, favoriteIds: ids, loading: false });
    } catch (error) {
      set({ loading: false });
    }
  },

  toggle: async (productId) => {
    try {
      const response = await toggleFavorite(productId);
      const { is_favorited } = response.data;
      
      set(state => {
        const newIds = new Set(state.favoriteIds);
        if (is_favorited) {
          newIds.add(productId);
        } else {
          newIds.delete(productId);
        }
        return { favoriteIds: newIds };
      });

      toast.success(is_favorited ? 'Ajouté aux favoris' : 'Retiré des favoris');
      get().fetchFavorites();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour des favoris');
    }
  },

  isFavorited: (productId) => {
    return get().favoriteIds.has(productId);
  },

  resetFavorites: () => set({ favorites: [], favoriteIds: new Set() }),
}));

export default useFavoriteStore;
