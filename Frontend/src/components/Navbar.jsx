import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Menu, X, PlusCircle, Search, ShoppingBag, Heart, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import useAuthStore from '../stores/authStore';
import useFavoriteStore from '../stores/favoriteStore';
import UserAvatar from './UserAvatar';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
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
    `px-3 py-2 rounded-lg text-sm font-medium transition ${
      isActive(path)
        ? 'text-white bg-white bg-opacity-10'
        : 'text-blue-100 hover:text-white hover:bg-white hover:bg-opacity-5'
    }`;

  const favCount = favoriteIds?.size || 0;

  return (
    <nav className="bg-primary text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 flex-shrink-0">
            <div className="w-10 h-10 bg-white bg-opacity-10 rounded-xl flex items-center justify-center border border-white border-opacity-20">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-2xl font-bold block leading-none">Afrirent</span>
              <span className="text-[10px] text-blue-200 uppercase tracking-widest font-semibold">Petites Annonces</span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link to="/" className={navLinkClass('/')}>Accueil</Link>
            <Link to="/products" className={navLinkClass('/products')}>Découvrir</Link>
            {isAuthenticated && (
              <>
                <Link to="/products/my-products" className={navLinkClass('/products/my-products')}>Mes annonces</Link>
                <Link to="/messages" className={navLinkClass('/messages')}>Messages</Link>
              </>
            )}
            <Link to="/contact" className={navLinkClass('/contact')}>Aide</Link>
          </div>

          {/* Desktop Right */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link 
              to="/products/new" 
              className="flex items-center space-x-2 border border-white border-opacity-50 px-4 py-2 rounded-full text-sm font-semibold hover:bg-white hover:text-primary transition shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Publier</span>
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4 ml-2 pl-4 border-l border-white border-opacity-20">
                <Link to="/messages" className="relative p-2 text-blue-100 hover:text-white transition">
                  <MessageSquare className="w-5 h-5" />
                </Link>
                <Link to="/favorites" className="relative p-2 text-blue-100 hover:text-white transition">
                  <Heart className="w-5 h-5" />
                  {favCount > 0 && (
                    <span className="absolute top-0 right-0 bg-accent text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                      {favCount > 9 ? '9+' : favCount}
                    </span>
                  )}
                </Link>
                <Link to="/profile" className="flex items-center space-x-2 hover:opacity-80 transition bg-white bg-opacity-5 p-1 pr-3 rounded-full border border-white border-opacity-10">
                  <UserAvatar user={user} size="sm" />
                  <span className="text-sm font-medium">{user?.username}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-blue-100 hover:text-red-400 transition"
                  title="Déconnexion"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="bg-white text-primary px-5 py-2 rounded-full text-sm font-bold hover:bg-blue-50 transition shadow-md"
                >
                  Connexion
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
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
              className="lg:hidden overflow-hidden border-t border-white border-opacity-10"
            >
              <div className="py-4 space-y-1">
                <Link to="/" className="block px-4 py-2 hover:bg-white hover:bg-opacity-5" onClick={() => setMobileMenuOpen(false)}>Accueil</Link>
                <Link to="/products" className="block px-4 py-2 hover:bg-white hover:bg-opacity-5" onClick={() => setMobileMenuOpen(false)}>Découvrir</Link>
                <Link to="/products/new" className="block px-4 py-2 text-accent font-bold" onClick={() => setMobileMenuOpen(false)}>Publier une annonce</Link>
                
                {isAuthenticated ? (
                  <>
                    <Link to="/products/my-products" className="block px-4 py-2 hover:bg-white hover:bg-opacity-5" onClick={() => setMobileMenuOpen(false)}>Mes annonces</Link>
                    <Link to="/messages" className="block px-4 py-2 hover:bg-white hover:bg-opacity-5" onClick={() => setMobileMenuOpen(false)}>Messages</Link>
                    <Link to="/favorites" className="flex items-center justify-between px-4 py-2 hover:bg-white hover:bg-opacity-5" onClick={() => setMobileMenuOpen(false)}>
                      <span>Favoris</span>
                      {favCount > 0 && <span className="bg-accent text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{favCount}</span>}
                    </Link>
                    <Link to="/profile" className="block px-4 py-2 hover:bg-white hover:bg-opacity-5" onClick={() => setMobileMenuOpen(false)}>Mon Profil</Link>
                    <button
                      onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                      className="block w-full text-left px-4 py-2 text-red-300 hover:bg-white hover:bg-opacity-5"
                    >
                      Déconnexion
                    </button>
                  </>
                ) : (
                  <div className="pt-2 px-4">
                    <Link
                      to="/login"
                      className="block w-full bg-white text-primary text-center py-2 rounded-lg font-bold"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Connexion / Inscription
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
