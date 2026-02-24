import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect } from 'react';

import useAuthStore from './stores/authStore';
import useCartStore from './stores/cartStore';
import useFavoriteStore from './stores/favoriteStore';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Register from './pages/auth/Register';
import Login from './pages/auth/Login';
import Profile from './pages/auth/Profile';
import ProductList from './features/products/pages/ProductList';
import ProductDetail from './features/products/pages/ProductDetail';
import AddProduct from './features/products/pages/AddProduct';
import EditProduct from './features/products/pages/EditProduct';
import MyProducts from './features/products/pages/MyProducts';
import Cart from './features/products/pages/Cart';
import Favorites from './features/products/pages/Favorites';
import NotFound from './pages/NotFound';

function App() {
  const { initialize, isAuthenticated } = useAuthStore();
  const { fetchCart } = useCartStore();
  const { fetchFavorites } = useFavoriteStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
      fetchFavorites();
    }
  }, [isAuthenticated, fetchCart, fetchFavorites]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          
          {/* Products Routes */}
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/new" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
          <Route path="/products/my-products" element={<ProtectedRoute><MyProducts /></ProtectedRoute>} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/products/:id/edit" element={<ProtectedRoute><EditProduct /></ProtectedRoute>} />
          
          {/* Cart & Favorites */}
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </Router>
  );
}

export default App;