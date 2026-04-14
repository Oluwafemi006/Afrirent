import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2, ShoppingBag, X } from 'lucide-react';
import { toast } from 'react-toastify';
import useCartStore from '../../../stores/cartStore';

const Cart = () => {
  const { cart, loading, fetchCart, removeItem, clearAll } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const items = cart?.items || [];

  const handleClearCart = () => {
    if (window.confirm('Êtes-vous sûr de vouloir vider votre panier ?')) {
      clearAll();
    }
  };

  const handleCheckout = () => {
    toast.info('Fonctionnalité de paiement bientôt disponible');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <ShoppingCart className="mx-auto text-gray-300 mb-4" size={64} />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Votre panier est vide</h2>
            <p className="text-gray-500 mb-6">Découvrez nos annonces et ajoutez des produits à votre panier</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <ShoppingBag size={20} />
              Voir les annonces
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Mon panier</h1>
          <button
            onClick={handleClearCart}
            className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition"
          >
            <Trash2 size={18} />
            Vider le panier
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-md p-4 flex flex-col sm:flex-row gap-4"
              >
                <div className="w-full sm:w-32 h-32 flex-shrink-0">
                  <img
                    src={item.product.main_image?.image}
                    alt={item.product.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <Link
                    to={`/products/${item.product.id}`}
                    className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition line-clamp-1"
                  >
                    {item.product.title}
                  </Link>
                  <p className="text-sm text-gray-500 mt-1">
                    Vendeur : {item.product.seller?.username}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {item.product.category?.name && (
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">
                        {item.product.category.name}
                      </span>
                    )}
                    {item.product.condition && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {item.product.condition}
                      </span>
                    )}
                    {item.product.location && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {item.product.location}
                      </span>
                    )}
                  </div>
                  <p className="text-lg font-bold text-blue-600 mt-2">
                    {Number(item.product.price).toLocaleString()} FCFA
                  </p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-end">
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                    title="Retirer du panier"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:w-80">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Résumé</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Articles</span>
                  <span>{cart?.items_count || items.length}</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>{Number(cart?.total || 0).toLocaleString()} FCFA</span>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Procéder au paiement
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
