import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Menu, X, ShoppingBag, PlusCircle, Package, ShoppingCart, Heart } from 'lucide-react';
import { useState } from 'react';
import useAuthStore from '../stores/authStore';
import useCartStore from '../stores/cartStore';
import useFavoriteStore from '../stores/favoriteStore';
import UserAvatar from './UserAvatar';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { cart } = useCartStore();
  const { favoriteIds } = useFavoriteStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
      isActive(path)
        ? 'bg-primary-50 text-primary-700'
        : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
    }`;

  const cartCount = cart?.items_count || 0;
  const favCount = favoriteIds?.size || 0;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent hidden sm:block">
              AfriRent
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-1">
            {isAuthenticated ? (
              <>
                <Link to="/products" className={navLinkClass('/products')}>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Annonces</span>
                </Link>
                <Link to="/products/my-products" className={navLinkClass('/products/my-products')}>
                  <Package className="w-4 h-4" />
                  <span>Mes Annonces</span>
                </Link>
                <Link to="/products/new" className={navLinkClass('/products/new')}>
                  <PlusCircle className="w-4 h-4" />
                  <span>Publier</span>
                </Link>
                <Link to="/favorites" className={`${navLinkClass('/favorites')} relative`}>
                  <Heart className="w-4 h-4" />
                  <span>Favoris</span>
                  {favCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                      {favCount > 9 ? '9+' : favCount}
                    </span>
                  )}
                </Link>
                <Link to="/cart" className={`${navLinkClass('/cart')} relative`}>
                  <ShoppingCart className="w-4 h-4" />
                  <span>Panier</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Link>
              </>
            ) : (
              <Link to="/products" className={navLinkClass('/products')}>
                <ShoppingBag className="w-4 h-4" />
                <span>Annonces</span>
              </Link>
            )}
          </div>

          {/* Desktop Right */}
          <div className="hidden lg:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="flex items-center space-x-2 hover:opacity-80 transition">
                  <UserAvatar user={user} size="md" />
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 leading-tight">{user?.username}</p>
                    <p className="text-xs text-gray-500 leading-tight">{user?.email}</p>
                  </div>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="flex items-center space-x-1.5 bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Déconnexion</span>
                </motion.button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-primary-600 text-sm font-semibold transition"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:shadow-lg transition"
                >
                  S'inscrire
                </Link>
              </div>
            )}
          </div>

          {/* Mobile: icons + burger */}
          <div className="flex lg:hidden items-center space-x-2">
            {isAuthenticated && (
              <>
                <Link to="/favorites" className="relative p-2 rounded-lg hover:bg-gray-100">
                  <Heart className="w-5 h-5 text-gray-600" />
                  {favCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full font-bold">
                      {favCount > 9 ? '9+' : favCount}
                    </span>
                  )}
                </Link>
                <Link to="/cart" className="relative p-2 rounded-lg hover:bg-gray-100">
                  <ShoppingCart className="w-5 h-5 text-gray-600" />
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-primary-600 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full font-bold">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Link>
              </>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden overflow-hidden border-t border-gray-100"
            >
              <div className="py-3 space-y-1">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center space-x-3 px-4 py-3 mb-2 bg-gray-50 rounded-lg mx-2">
                      <UserAvatar user={user} size="md" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{user?.username}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                    </div>
                    <Link
                      to="/products"
                      className="flex items-center space-x-3 px-4 py-2.5 rounded-lg hover:bg-gray-50 mx-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <ShoppingBag className="w-5 h-5 text-gray-500" />
                      <span className="text-gray-700 font-medium">Annonces</span>
                    </Link>
                    <Link
                      to="/products/my-products"
                      className="flex items-center space-x-3 px-4 py-2.5 rounded-lg hover:bg-gray-50 mx-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Package className="w-5 h-5 text-gray-500" />
                      <span className="text-gray-700 font-medium">Mes Annonces</span>
                    </Link>
                    <Link
                      to="/products/new"
                      className="flex items-center space-x-3 px-4 py-2.5 rounded-lg hover:bg-gray-50 mx-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <PlusCircle className="w-5 h-5 text-gray-500" />
                      <span className="text-gray-700 font-medium">Publier</span>
                    </Link>
                    <Link
                      to="/favorites"
                      className="flex items-center justify-between px-4 py-2.5 rounded-lg hover:bg-gray-50 mx-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="flex items-center space-x-3">
                        <Heart className="w-5 h-5 text-gray-500" />
                        <span className="text-gray-700 font-medium">Favoris</span>
                      </div>
                      {favCount > 0 && (
                        <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                          {favCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      to="/cart"
                      className="flex items-center justify-between px-4 py-2.5 rounded-lg hover:bg-gray-50 mx-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="flex items-center space-x-3">
                        <ShoppingCart className="w-5 h-5 text-gray-500" />
                        <span className="text-gray-700 font-medium">Panier</span>
                      </div>
                      {cartCount > 0 && (
                        <span className="bg-primary-100 text-primary-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                          {cartCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center space-x-3 px-4 py-2.5 rounded-lg hover:bg-gray-50 mx-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="w-5 h-5 text-gray-500" />
                      <span className="text-gray-700 font-medium">Mon Profil</span>
                    </Link>
                    <div className="border-t border-gray-100 mt-2 pt-2 mx-2">
                      <button
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center space-x-3 px-4 py-2.5 rounded-lg hover:bg-red-50 text-red-600 w-full"
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Déconnexion</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Link
                      to="/products"
                      className="flex items-center space-x-3 px-4 py-2.5 rounded-lg hover:bg-gray-50 mx-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <ShoppingBag className="w-5 h-5 text-gray-500" />
                      <span className="text-gray-700 font-medium">Annonces</span>
                    </Link>
                    <div className="border-t border-gray-100 mt-2 pt-2 mx-2 space-y-2">
                      <Link
                        to="/login"
                        className="block px-4 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Connexion
                      </Link>
                      <Link
                        to="/register"
                        className="block px-4 py-2.5 rounded-lg bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-center font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        S'inscrire
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
