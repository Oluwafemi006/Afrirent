import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, MapPin, ArrowRight, Shield, Zap, Users, 
  Home as HomeIcon, Car, Briefcase, Smartphone, 
  ShoppingBag, PenTool, Tractor, Dog, PlusCircle,
  HandCoins, CheckCircle, MessageSquare
} from 'lucide-react';
import useAuthStore from '../stores/authStore';
import { getProducts, getCategories } from '../features/products/api/products';
import ProductCard from '../features/products/components/ProductCard';

export default function Home() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [latestProducts, setLatestProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // États pour la recherche
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          getProducts({ ordering: '-created_at', page_size: 4 }),
          getCategories()
        ]);
        setLatestProducts(productsRes.data.results || productsRes.data);
        setCategories((categoriesRes.data.results || categoriesRes.data).slice(0, 8));
      } catch (err) {
        console.error('Erreur chargement données:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (locationQuery) params.append('location', locationQuery);
    navigate(`/products?${params.toString()}`);
  };

  // Mappage des icônes pour les catégories (fallback sur ShoppingBag)
  const getCategoryIcon = (slug) => {
    const icons = {
      'immobilier': HomeIcon,
      'vehicules': Car,
      'emploi': Briefcase,
      'high-tech': Smartphone,
      'mode': ShoppingBag,
      'services': PenTool,
      'agricole': Tractor,
      'animaux': Dog
    };
    return icons[slug] || ShoppingBag;
  };

  return (
    <div className="bg-gray-50">
      {/* ========== HERO SEARCH SECTION ========== */}
      <section className="bg-primary pt-12 pb-20 px-4 relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Que cherchez-vous aujourd'hui ?
            </h1>
            <p className="text-blue-100 text-lg opacity-90">
              Achetez, vendez et louez en toute sécurité partout en Afrique.
            </p>
          </motion.div>

          <motion.form 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSearch}
            className="bg-white p-2 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-2"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Ex: iPhone, appartement, voiture..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border-none focus:ring-2 focus:ring-primary outline-none text-gray-700"
              />
            </div>
            <div className="flex-1 relative border-t md:border-t-0 md:border-l border-gray-100">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Ville, Pays..." 
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border-none focus:ring-2 focus:ring-primary outline-none text-gray-700"
              />
            </div>
            <button 
              type="submit"
              className="bg-accent hover:bg-orange-600 text-white px-10 py-4 rounded-xl font-bold transition shadow-lg flex items-center justify-center space-x-2"
            >
              <span>Rechercher</span>
            </button>
          </motion.form>
        </div>

        {/* Cercles décoratifs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
      </section>

      {/* ========== CATÉGORIES ========== */}
      <section className="py-16 px-4 -mt-10 relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">Catégories populaires</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
              {categories.map((cat) => {
                const Icon = getCategoryIcon(cat.slug);
                return (
                  <Link 
                    key={cat.id}
                    to={`/products?category=${cat.slug}`}
                    className="flex flex-col items-center p-4 rounded-2xl hover:bg-primary hover:text-white transition group border border-gray-50"
                  >
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-3 group-hover:bg-white group-hover:bg-opacity-20 transition">
                      <Icon className="text-primary group-hover:text-white transition" size={24} />
                    </div>
                    <span className="font-semibold text-sm text-center">{cat.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ========== PUBLICATION RAPIDE ========== */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-6">
            <PlusCircle className="text-primary" size={32} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Vendez en un clin d'œil</h2>
          <p className="text-lg text-gray-600 mb-8">
            C'est gratuit, simple et rapide. Rejoignez des milliers de vendeurs sur Afrirent.
          </p>
          <Link 
            to="/products/new"
            className="inline-flex items-center space-x-2 bg-primary text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-xl transition"
          >
            <span>Publier mon annonce gratuitement</span>
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* ========== ANNONCES RÉCENTES ========== */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Dernières annonces</h2>
            <Link to="/products" className="text-primary font-bold flex items-center hover:underline">
              Tout voir <ArrowRight size={18} className="ml-1" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-2xl h-80 animate-pulse shadow-sm border border-gray-100"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {latestProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ========== POURQUOI AFRIRENT ========== */}
      <section className="py-20 bg-primary text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <h2 className="text-3xl font-bold text-center mb-16">Pourquoi choisir Afrirent ?</h2>
          <div className="grid md:grid-cols-4 gap-10 text-center">
            <motion.div whileHover={{ y: -5 }}>
              <div className="w-16 h-16 bg-white bg-opacity-10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white border-opacity-10 text-accent">
                <HandCoins size={32} />
              </div>
              <h3 className="font-bold text-xl mb-3 text-white">100% Gratuit</h3>
              <p className="text-blue-100 opacity-80">Publiez vos annonces sans aucun frais caché.</p>
            </motion.div>
            <motion.div whileHover={{ y: -5 }}>
              <div className="w-16 h-16 bg-white bg-opacity-10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white border-opacity-10 text-accent">
                <Smartphone size={32} />
              </div>
              <h3 className="font-bold text-xl mb-3 text-white">Mobile Money</h3>
              <p className="text-blue-100 opacity-80">Paiements sécurisés via Orange Money, MTN, Wave.</p>
            </motion.div>
            <motion.div whileHover={{ y: -5 }}>
              <div className="w-16 h-16 bg-white bg-opacity-10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white border-opacity-10 text-accent">
                <CheckCircle size={32} />
              </div>
              <h3 className="font-bold text-xl mb-3 text-white">Vérification</h3>
              <p className="text-blue-100 opacity-80">Profils vérifiés pour lutter contre les arnaques.</p>
            </motion.div>
            <motion.div whileHover={{ y: -5 }}>
              <div className="w-16 h-16 bg-white bg-opacity-10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white border-opacity-10 text-accent">
                <MessageSquare size={32} />
              </div>
              <h3 className="font-bold text-xl mb-3 text-white">Messagerie</h3>
              <p className="text-blue-100 opacity-80">Contact direct et instantané avec les vendeurs.</p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
