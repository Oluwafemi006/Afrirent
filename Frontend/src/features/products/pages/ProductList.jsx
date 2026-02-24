/**
 * ProductList Page
 * Affiche la liste des produits avec filtres et recherche
 */

import { useState, useEffect } from 'react';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';
import { Search, Filter, Loader } from 'lucide-react';
import { getCategories } from '../api/products';

const ProductList = () => {
  const [searchParams, setSearchParams] = useState({
    search: '',
    category: '',
    min_price: '',
    max_price: '',
    condition: '',
    ordering: '-created_at',
    page: 1,
  });

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        setCategories(response.data.results || response.data);
      } catch (err) {
        console.error('Erreur chargement catégories:', err);
      }
    };
    fetchCategories();
  }, []);

  const { products, loading, error, pagination } = useProducts(
    Object.fromEntries(
      Object.entries(searchParams).filter(([_, v]) => v !== '')
    )
  );

  const handleSearchChange = (e) => {
    setSearchParams({ ...searchParams, search: e.target.value, page: 1 });
  };

  const handleFilterChange = (filterName, value) => {
    setSearchParams({ ...searchParams, [filterName]: value, page: 1 });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Découvrez nos annonces
          </h1>
        </div>

        {/* Recherche */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cherchez une annonce..."
              value={searchParams.search}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtres */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <select
              value={searchParams.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toutes les catégories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Prix min (FCFA)"
              value={searchParams.min_price}
              onChange={(e) => handleFilterChange('min_price', e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="number"
              placeholder="Prix max (FCFA)"
              value={searchParams.max_price}
              onChange={(e) => handleFilterChange('max_price', e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
              value={searchParams.condition}
              onChange={(e) => handleFilterChange('condition', e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les états</option>
              <option value="new">Neuf</option>
              <option value="good">Bon état</option>
              <option value="fair">Acceptable</option>
              <option value="damaged">Endommagé</option>
            </select>
          </div>
        </div>

        {/* Résultats */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">Aucune annonce trouvée</p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-gray-600">
              {pagination?.count} résultats trouvés
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination && (pagination.next || pagination.previous) && (
              <div className="flex justify-center gap-4">
                <button
                  disabled={!pagination.previous}
                  onClick={() => handleFilterChange('page', searchParams.page - 1)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300"
                >
                  Précédent
                </button>
                <span className="py-2">
                  Page {searchParams.page} / {Math.ceil(pagination.count / 20)}
                </span>
                <button
                  disabled={!pagination.next}
                  onClick={() => handleFilterChange('page', searchParams.page + 1)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300"
                >
                  Suivant
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductList;
