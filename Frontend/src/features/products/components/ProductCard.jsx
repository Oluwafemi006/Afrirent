import { MapPin, Heart, Eye, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../../stores/authStore';
import useFavoriteStore from '../../../stores/favoriteStore';
import useCartStore from '../../../stores/cartStore';

const ProductCard = ({ product }) => {
  if (!product) return null;

  const { isAuthenticated, user } = useAuthStore();
  const { toggle, isFavorited } = useFavoriteStore();
  const { addItem } = useCartStore();

  const favorited = isAuthenticated && isFavorited(product.id);
  const isOwner = user && product.seller?.id === user.id;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden flex flex-col">
      {/* Image */}
      <Link to={`/products/${product.id}`} className="relative bg-gray-200 h-48 overflow-hidden group block">
        {product.main_image ? (
          <img
            src={product.main_image.image}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Pas d'image
          </div>
        )}

        {product.is_featured && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">
            ⭐ Vedette
          </div>
        )}

        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
          {
            {
              new: '🆕 Neuf',
              good: '✨ Bon état',
              fair: '👍 Acceptable',
              damaged: '⚠️ Endommagé',
            }[product.condition] || product.condition
          }
        </div>
      </Link>

      {/* Contenu */}
      <div className="p-4 flex flex-col flex-1">
        <Link to={`/products/${product.id}`}>
          <h3 className="font-semibold text-lg text-gray-900 truncate hover:text-blue-600">
            {product.title}
          </h3>
        </Link>

        <p className="text-2xl font-bold text-blue-600 my-2">
          {Number(product.price).toLocaleString('fr-FR')} FCFA
        </p>

        {product.location && (
          <div className="flex items-center text-gray-600 text-sm mb-3">
            <MapPin size={16} className="mr-1 flex-shrink-0" />
            <span className="truncate">{product.location}</span>
          </div>
        )}

        <div className="flex items-center mb-3 pb-3 border-b">
          {product.seller?.avatar_url && (
            <img
              src={product.seller.avatar_url}
              alt={product.seller.username}
              className="w-8 h-8 rounded-full mr-2"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{product.seller?.username}</p>
            {product.seller?.is_verified && (
              <span className="text-xs text-green-600">✓ Vérifié</span>
            )}
          </div>
        </div>

        <div className="mt-auto">
          <div className="flex items-center justify-between text-gray-500 text-sm mb-3">
            <div className="flex items-center gap-1">
              <Eye size={16} />
              <span>{product.views_count}</span>
            </div>
            <span className="text-xs text-gray-400">
              {new Date(product.created_at).toLocaleDateString('fr-FR')}
            </span>
          </div>

          {isAuthenticated && !isOwner && product.status === 'active' && (
            <div className="flex gap-2">
              <button
                onClick={() => addItem(product.id)}
                className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
              >
                <ShoppingCart size={14} />
                <span>Panier</span>
              </button>
              <button
                onClick={() => toggle(product.id)}
                className={`p-2 rounded-lg border transition ${
                  favorited
                    ? 'bg-red-50 border-red-200 text-red-500'
                    : 'bg-white border-gray-300 text-gray-400 hover:text-red-500'
                }`}
              >
                <Heart size={18} className={favorited ? 'fill-current' : ''} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
