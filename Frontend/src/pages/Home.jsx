import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Zap, Users, ArrowRight } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import { getProducts } from '../features/products/api/products';
import ProductCard from '../features/products/components/ProductCard';

export default function Home() {
  const { user, isAuthenticated } = useAuthStore();
  const [latestProducts, setLatestProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const response = await getProducts({ ordering: '-created_at', page_size: 8 });
        setLatestProducts(response.data.results || response.data);
      } catch (err) {
        console.error('Erreur chargement produits:', err);
      } finally {
        setProductsLoading(false);
      }
    };
    fetchLatest();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {isAuthenticated && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-8 inline-block"
              >
                <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-6 py-3 rounded-full shadow-lg">
                  <p className="text-lg">
                    👋 Bienvenue, <span className="font-bold">{user?.username}</span> !
                  </p>
                </div>
              </motion.div>
            )}

            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Louez et gagnez en
              <span className="block bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                toute confiance
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              La plateforme de location entre particuliers la plus sécurisée d'Afrique. Paiements protégés, utilisateurs vérifiés.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/products/new"
                    className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition flex items-center justify-center space-x-2"
                  >
                    <span>Créer une annonce</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/products"
                    className="border-2 border-primary-600 text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary-50 transition"
                  >
                    Parcourir les produits
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition flex items-center justify-center space-x-2"
                  >
                    <span>Commencer gratuitement</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/login"
                    className="border-2 border-primary-600 text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary-50 transition"
                  >
                    Se connecter
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      </section>

      {/* Dernières annonces */}
      {latestProducts.length > 0 && (
        <section className="py-16 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                Dernières annonces
              </h2>
              <p className="text-lg text-gray-600">
                Découvrez les articles récemment publiés sur AfriRent
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {latestProducts.slice(0, 8).map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>

            <div className="text-center">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition"
              >
                Voir toutes les annonces
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir AfriRent ?
            </h2>
            <p className="text-xl text-gray-600">
              Une plateforme pensée pour votre sécurité et votre tranquillité
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Paiements sécurisés',
                description: 'Système de séquestre qui protège vos transactions. Votre argent est en sécurité jusqu\'à la livraison.',
                color: 'from-green-400 to-green-600',
              },
              {
                icon: Users,
                title: 'Communauté vérifiée',
                description: 'Tous les utilisateurs passent par une vérification d\'identité. Louez en toute confiance.',
                color: 'from-blue-400 to-blue-600',
              },
              {
                icon: Zap,
                title: 'Simple et rapide',
                description: 'Publiez une annonce en 2 minutes. Trouvez ce dont vous avez besoin instantanément.',
                color: 'from-purple-400 to-purple-600',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-3xl p-12 text-center text-white shadow-2xl"
            >
              <h2 className="text-4xl font-bold mb-4">
                Prêt à commencer ?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Rejoignez des milliers d'utilisateurs qui louent et gagnent en toute sécurité
              </p>
              <Link
                to="/register"
                className="inline-block bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition"
              >
                Créer mon compte gratuitement
              </Link>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
}