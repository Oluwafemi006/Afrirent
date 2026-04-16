import { MapPin, Heart, Eye, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../../../stores/authStore';
import useFavoriteStore from '../../../stores/favoriteStore';

const ProductCard = ({ product }) => {
  if (!product) return null;

  const { isAuthenticated } = useAuthStore();
  const { toggle, isFavorited } = useFavoriteStore();

  const favorited = isAuthenticated && isFavorited(product.id);

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full group"
    >
      {/* Image Container */}
      <Link to={`/products/${product.id}`} className="relative h-48 overflow-hidden block bg-gray-100">
        {product.main_image ? (
          <img
            src={product.main_image.image}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
            <ShoppingBag size={32} className="mb-2 opacity-20" />
            <span className="text-xs">Pas d'image</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.category && (
            <span className="bg-white bg-opacity-90 backdrop-blur-sm text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
              {product.category.name}
            </span>
          )}
          {product.is_featured && (
            <span className="bg-accent text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
              ⭐ Vedette
            </span>
          )}
        </div>

        {/* Favorite Button */}
        {isAuthenticated && (
          <button
            onClick={(e) => {
              e.preventDefault();
              toggle(product.id);
            }}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
              favorited
                ? 'bg-red-500 text-white'
                : 'bg-white bg-opacity-70 text-gray-700 hover:bg-red-500 hover:text-white'
            }`}
          >
            <Heart size={18} className={favorited ? 'fill-current' : ''} />
          </button>
        )}

        {/* Condition Badge */}
        <div className="absolute bottom-3 left-3 bg-black bg-opacity-50 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-[10px] font-medium">
          {
            {
              new: 'Neuf',
              good: 'Très bon état',
              fair: 'Bon état',
              damaged: 'À réparer',
            }[product.condition] || product.condition
          }
        </div>
      </Link>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="mb-2">
          <Link to={`/products/${product.id}`}>
            <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-primary transition-colors text-lg">
              {product.title}
            </h3>
          </Link>
        </div>

        <div className="flex items-baseline space-x-1 mb-3">
          <span className="text-xl font-black text-primary">
            {Number(product.price).toLocaleString('fr-FR')}
          </span>
          <span className="text-xs font-bold text-primary">FCFA</span>
        </div>

        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-gray-500">
          <div className="flex items-center text-sm truncate mr-2">
            <MapPin size={14} className="mr-1 text-gray-400 shrink-0" />
            <span className="truncate text-xs">{product.location || 'Bénin'}</span>
          </div>
          <div className="flex items-center text-[10px] font-medium bg-gray-50 px-2 py-1 rounded-md shrink-0">
            <Eye size={12} className="mr-1" />
            {product.views_count}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
