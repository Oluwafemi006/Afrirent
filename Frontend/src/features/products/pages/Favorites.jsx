import { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Heart, MapPin, Eye, ShoppingCart, PackageOpen } from 'lucide-react';
import useAuthStore from '../../../stores/authStore';
import useFavoriteStore from '../../../stores/favoriteStore';
import useCartStore from '../../../stores/cartStore';

const conditionLabels = {
  new: '🆕 Neuf',
  good: '✨ Bon état',
  fair: '👍 Acceptable',
  damaged: '⚠️ Endommagé',
};

const Favorites = () => {
  const { isAuthenticated } = useAuthStore();
  const { favorites, loading, fetchFavorites, toggle } = useFavoriteStore();
  const { addItem } = useCartStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    }
  }, [isAuthenticated, fetchFavorites]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes favoris</h1>
          <p className="text-gray-600">
            {favorites.length > 0
              ? `${favorites.length} annonce${favorites.length > 1 ? 's' : ''} sauvegardée${favorites.length > 1 ? 's' : ''}`
              : ''}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : favorites.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <PackageOpen size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg mb-4">
              Vous n'avez aucun favori pour le moment
            </p>
            <Link
              to="/products"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Découvrir les annonces
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((fav) => {
              const product = fav.product;
              return (
                <div
                  key={fav.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className="relative bg-gray-200 h-48 overflow-hidden group">
                    {product.main_image ? (
                      <Link to={`/products/${product.id}`}>
                        <img
                          src={product.main_image.image}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </Link>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        Pas d'image
                      </div>
                    )}

                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                      {conditionLabels[product.condition] || product.condition}
                    </div>

                    <button
                      onClick={() => toggle(product.id)}
                      className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow hover:scale-110 transition-transform"
                    >
                      <Heart size={18} className="text-red-500 fill-red-500" />
                    </button>
                  </div>

                  <div className="p-4">
                    <Link to={`/products/${product.id}`}>
                      <h3 className="font-semibold text-lg text-gray-900 truncate hover:text-blue-600">
                        {product.title}
                      </h3>
                    </Link>

                    <p className="text-2xl font-bold text-blue-600 my-2">
                      {Number(product.price).toLocaleString('fr-FR')} FCFA
                    </p>

                    <div className="flex items-center text-gray-600 text-sm mb-3">
                      <MapPin size={16} className="mr-1" />
                      <span>{product.location}</span>
                    </div>

                    <div className="flex items-center mb-3 pb-3 border-b">
                      {product.seller?.avatar_url && (
                        <img
                          src={product.seller.avatar_url}
                          alt={product.seller.username}
                          className="w-8 h-8 rounded-full mr-2"
                        />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {product.seller?.username}
                        </p>
                        {product.seller?.is_verified && (
                          <span className="text-xs text-green-600">✓ Vérifié</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-gray-500 text-sm mb-3">
                      <div className="flex items-center gap-2">
                        <Eye size={16} />
                        <span>{product.views_count}</span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {product.category?.name}
                      </span>
                    </div>

                    <button
                      onClick={() => addItem(product.id)}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <ShoppingCart size={16} />
                      Ajouter au panier
                    </button>

                    <p className="text-xs text-gray-400 mt-3">
                      Ajouté le{' '}
                      {new Date(fav.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
