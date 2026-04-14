/**
 * ProductDetail Page
 * Affiche les détails d'un produit
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Eye, Calendar, Edit2, Trash2, User, Shield, Loader, AlertCircle, Heart, ShoppingCart } from 'lucide-react';
import { getProductDetail, incrementProductViews, deleteProduct } from '../api/products';
import useAuthStore from '../../../stores/authStore';
import useCartStore from '../../../stores/cartStore';
import useFavoriteStore from '../../../stores/favoriteStore';
import { toast } from 'react-toastify';

const conditionLabels = {
  new: 'Neuf',
  good: 'Bon état',
  fair: 'État acceptable',
  damaged: 'Endommagé',
};

const statusLabels = {
  active: 'Actif',
  sold: 'Vendu',
  inactive: 'Inactif',
  pending: 'En attente',
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();
  const { toggle, isFavorited } = useFavoriteStore();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      // Sécurité si l'ID est indéfini ou est la chaîne "undefined"
      if (!id || id === 'undefined') {
        setError('ID de produit invalide');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getProductDetail(id);
        setProduct(response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.detail || 'Produit non trouvé');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (id && id !== 'undefined') {
      incrementProductViews(id).catch(() => {});
    }
  }, [id]);

  const isOwner = user && product?.seller?.id === user.id;

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) return;

    try {
      setDeleting(true);
      await deleteProduct(id);
      toast.success('Annonce supprimée');
      navigate('/products');
    } catch (err) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/products')}
            className="flex items-center gap-2 text-blue-600 mb-4 hover:text-blue-700"
          >
            <ArrowLeft size={20} /> Retour aux annonces
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const images = product.images || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate('/products')}
          className="flex items-center gap-2 text-blue-600 mb-6 hover:text-blue-700"
        >
          <ArrowLeft size={20} /> Retour aux annonces
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Images */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="relative bg-gray-200 h-80 md:h-96">
                {images.length > 0 ? (
                  <img
                    src={images[selectedImage]?.image}
                    alt={product.title}
                    className="w-full h-full object-contain bg-white"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg">
                    Pas d'image disponible
                  </div>
                )}
                {product.status !== 'active' && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {statusLabels[product.status] || product.status}
                  </div>
                )}
                {product.is_featured && (
                  <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    En vedette
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {images.map((img, index) => (
                    <button
                      key={img.id || index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                        selectedImage === index ? 'border-blue-500' : 'border-transparent'
                      }`}
                    >
                      <img
                        src={img.image}
                        alt={`Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Info produit */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.title}</h1>
              <p className="text-3xl font-bold text-blue-600 mb-4">
                {Number(product.price).toLocaleString('fr-FR')} FCFA
              </p>

              <div className="space-y-3 text-gray-600">
                {product.location && (
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-gray-400" />
                    <span>{product.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Eye size={18} className="text-gray-400" />
                  <span>{product.views_count} vue(s)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-gray-400" />
                  <span>{new Date(product.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {product.category && (
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {product.category.name}
                  </span>
                )}
                <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-semibold">
                  {conditionLabels[product.condition] || product.condition}
                </span>
              </div>

              {isOwner ? (
                <div className="flex gap-3 mt-6 pt-4 border-t">
                  <Link
                    to={`/products/${id}/edit`}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    <Edit2 size={18} /> Modifier
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
                  >
                    <Trash2 size={18} /> Supprimer
                  </button>
                </div>
              ) : product.status === 'active' && (
                <div className="space-y-3 mt-6 pt-4 border-t">
                  {isAuthenticated ? (
                    <>
                      <button
                        onClick={() => addItem(product.id)}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                      >
                        <ShoppingCart size={18} /> Ajouter au panier
                      </button>
                      <button
                        onClick={() => toggle(product.id)}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition border ${
                          isFavorited(product.id)
                            ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <Heart size={18} className={isFavorited(product.id) ? 'fill-current' : ''} />
                        {isFavorited(product.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/login"
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                      Connectez-vous pour acheter
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Vendeur */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Vendeur</h2>
              <div className="flex items-center gap-3 mb-4">
                {product.seller?.avatar_url ? (
                  <img
                    src={product.seller.avatar_url}
                    alt={product.seller.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <User size={24} className="text-blue-600" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900">{product.seller?.username}</p>
                  {product.seller?.is_verified && (
                    <div className="flex items-center gap-1 text-green-600 text-sm">
                      <Shield size={14} />
                      <span>Vérifié</span>
                    </div>
                  )}
                </div>
              </div>
              {product.seller_stats?.member_since && (
                <p className="text-sm text-gray-500">
                  Membre depuis {new Date(product.seller_stats.member_since).toLocaleDateString('fr-FR')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
