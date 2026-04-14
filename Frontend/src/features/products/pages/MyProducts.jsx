/**
 * MyProducts Page
 * Liste des produits de l'utilisateur connecté
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Eye, EyeOff, AlertCircle, Loader } from 'lucide-react';
import { getMyProducts, deleteProduct, changeProductStatus } from '../api/products';
import { toast } from 'react-toastify';

const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [deleting, setDeleting] = useState(null);

  // Charger les produits
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await getMyProducts();
        setProducts(response.data.results || response.data);
        setError(null);
      } catch (err) {
        setError('Erreur lors du chargement de vos annonces');
        toast.error('Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette annonce?')) return;

    try {
      setDeleting(id);
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Annonce supprimée');
    } catch (err) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await changeProductStatus(id, newStatus);
      setProducts(prev =>
        prev.map(p => p.id === id ? { ...p, status: newStatus } : p)
      );
      toast.success(`Annonce ${newStatus === 'active' ? 'activée' : 'désactivée'}`);
    } catch (err) {
      toast.error('Erreur lors du changement de statut');
    }
  };

  const filteredProducts = filter === 'all'
    ? products
    : products.filter(p => p.status === filter);

  const stats = {
    total: products.length,
    active: products.filter(p => p.status === 'active').length,
    inactive: products.filter(p => p.status === 'inactive').length,
    sold: products.filter(p => p.status === 'sold').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes annonces</h1>
            <p className="text-gray-600 mt-2">{stats.total} annonce(s) au total</p>
          </div>
          <Link
            to="/products/new"
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            <Plus size={20} /> Créer une annonce
          </Link>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, color: 'bg-blue-50 text-blue-700' },
            { label: 'Actives', value: stats.active, color: 'bg-green-50 text-green-700' },
            { label: 'Inactives', value: stats.inactive, color: 'bg-yellow-50 text-yellow-700' },
            { label: 'Vendues', value: stats.sold, color: 'bg-gray-50 text-gray-700' },
          ].map((stat, idx) => (
            <div key={idx} className={`${stat.color} rounded-lg p-6`}>
              <p className="text-sm font-semibold opacity-75">{stat.label}</p>
              <p className="text-3xl font-bold mt-2">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            {[
              { value: 'all', label: 'Toutes' },
              { value: 'active', label: 'Actives' },
              { value: 'inactive', label: 'Inactives' },
              { value: 'sold', label: 'Vendues' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filter === opt.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Liste des annonces */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-4">
              {filter === 'all' ? 'Vous n\'avez pas encore d\'annonces' : 'Aucune annonce dans ce filtre'}
            </p>
            <Link
              to="/products/new"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Créer ma première annonce
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Desktop View */}
            <div className="hidden md:block">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Annonce</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Prix</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Statut</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Vues</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredProducts.map(product => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                            {(product.main_image || (product.images && product.images.length > 0)) ? (
                              <img src={product.main_image?.image || product.images?.[0]?.image} alt={product.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{product.title}</p>
                            <p className="text-sm text-gray-500">{product.category?.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">{product.price.toLocaleString()} FCFA</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                          product.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : product.status === 'sold'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {product.status === 'active' ? 'Actif' : product.status === 'sold' ? 'Vendu' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900">{product.views_count || 0}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleStatus(product.id, product.status)}
                            className="p-2 hover:bg-gray-100 rounded transition"
                            title={product.status === 'active' ? 'Désactiver' : 'Activer'}
                          >
                            {product.status === 'active' ? (
                              <Eye size={18} className="text-blue-600" />
                            ) : (
                              <EyeOff size={18} className="text-gray-400" />
                            )}
                          </button>
                          <Link
                            to={`/products/${product.id}/edit`}
                            className="p-2 hover:bg-gray-100 rounded transition text-blue-600"
                          >
                            <Edit2 size={18} />
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id)}
                            disabled={deleting === product.id}
                            className="p-2 hover:bg-gray-100 rounded transition text-red-600 disabled:opacity-50"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden divide-y">
              {filteredProducts.map(product => (
                <div key={product.id} className="p-4">
                  <div className="flex gap-3 mb-3">
                    <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      {(product.main_image || (product.images && product.images.length > 0)) ? (
                        <img src={product.main_image?.image || product.images?.[0]?.image} alt={product.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{product.title}</p>
                      <p className="text-sm text-gray-500">{product.price.toLocaleString()} FCFA</p>
                      <p className={`text-xs mt-1 inline-block px-2 py-0.5 rounded ${
                        product.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.status === 'active' ? 'Actif' : 'Inactif'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleStatus(product.id, product.status)}
                      className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded text-sm font-semibold hover:bg-blue-100 transition"
                    >
                      {product.status === 'active' ? 'Désactiver' : 'Activer'}
                    </button>
                    <Link
                      to={`/products/${product.id}/edit`}
                      className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm font-semibold hover:bg-gray-200 transition text-center"
                    >
                      Modifier
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id)}
                      disabled={deleting === product.id}
                      className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded text-sm font-semibold hover:bg-red-100 transition disabled:opacity-50"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProducts;
