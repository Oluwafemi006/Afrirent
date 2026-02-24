# 🚀 Guide d'Intégration Frontend - Products

**Comment intégrer l'API Products dans votre HomePage et créer les pages manquantes**

---

## 📋 Résumé

Vous avez une **HomePage magnifique** avec données hardcodées.  
Je vous ai créé l'**API + composants**.  
Maintenant on les relie ensemble! 🔗

---

## ✅ Étape 1: Connecter HomePage à l'API (2h)

### 1.1 Modifier `pages/Home.jsx`

**AVANT:**
```jsx
const HomePage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState([]);

  // Données hardcodées
  const categories = [
    { name: 'Vêtements', icon: '👕', count: 2345, ... }
  ];

  const products = [
    { id: 1, title: 'iPhone 12 Pro', ... }
  ];
```

**APRÈS:**
```jsx
import { useEffect } from 'react';
import { getCategories } from '../features/products/api/products';
import { useProducts } from '../features/products/hooks/useProducts';

const HomePage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Categories depuis API
  useEffect(() => {
    getCategories()
      .then(res => setCategories(res.data.results))
      .catch(err => console.error('Erreur categories:', err))
      .finally(() => setCategoriesLoading(false));
  }, []);

  // Products depuis API (premiers 4)
  const { products, loading: productsLoading } = useProducts({ page: 1 });

  // Gestion favoris - pour maintenant, garder en local
  // (sera intégré avec l'API quand Personne 4 fera favorites)
  const [favorites, setFavorites] = useState([]);

  const toggleFavorite = (productId) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // ... rest of the code
};
```

### 1.2 Corriger la Section Categories

**AVANT:**
```jsx
<motion.div 
  variants={containerVariants}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true }}
  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
>
  {categories.map((category, index) => (
    // ... card
  ))}
</motion.div>
```

**APRÈS:**
```jsx
{categoriesLoading ? (
  <div className="flex justify-center py-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
  </div>
) : (
  <motion.div 
    variants={containerVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
  >
    {categories.map((category) => (
      <motion.div
        key={category.id}
        variants={itemVariants}
        whileHover={{ scale: 1.08, y: -8 }}
        whileTap={{ scale: 0.98 }}
        className="bg-gradient-to-br from-orange-100 to-orange-50 p-6 rounded-2xl cursor-pointer shadow-lg hover:shadow-2xl transition-all"
      >
        <div className="text-5xl mb-3 text-center">
          {/* Vous pouvez utiliser category.icon s'il existe, ou un emoji générique */}
          {category.icon || '📦'}
        </div>
        <div className="font-semibold text-center text-gray-900">
          {category.name}
        </div>
        <div className="text-sm text-center text-gray-600 mt-1">
          {/* Compter les produits depuis l'API */}
          {category.products_count || 0} articles
        </div>
      </motion.div>
    ))}
  </motion.div>
)}
```

### 1.3 Corriger la Section Featured Products

**AVANT:**
```jsx
{products.map((product) => (
  <motion.div
    key={product.id}
    // ... card avec données hardcodées
```

**APRÈS:**
```jsx
{productsLoading ? (
  <div className="flex justify-center py-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
  </div>
) : products.length === 0 ? (
  <div className="text-center py-8 text-gray-500">
    Aucun produit disponible
  </div>
) : (
  <motion.div 
    variants={containerVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
  >
    {products.slice(0, 4).map((product) => (
      // Utiliser mon ProductCard au lieu de code dupliqué!
      // Option 1: Utiliser mon composant
      <ProductCard 
        key={product.id}
        product={product}
        onFavoriteClick={() => toggleFavorite(product.id)}
      />
      
      // Option 2: Garder votre code (si vous préférez)
      // <motion.div key={product.id}> ... </motion.div>
    ))}
  </motion.div>
)}
```

### 1.4 Ajouter les Imports
```jsx
// En haut du fichier
import { useNavigate } from 'react-router-dom';
import ProductCard from '../features/products/components/ProductCard';
import { useProducts } from '../features/products/hooks/useProducts';
import { getCategories } from '../features/products/api/products';
```

### 1.5 Corriger le Bouton "Voir tout"
```jsx
// AVANT (ne fait rien)
<motion.button
  className="text-orange-500 font-semibold flex items-center gap-1"
>
  Voir tout <ChevronRight size={20} />
</motion.button>

// APRÈS (navigue vers ProductList)
const navigate = useNavigate();

<motion.button
  onClick={() => navigate('/products')}
  className="text-orange-500 font-semibold flex items-center gap-1 cursor-pointer"
>
  Voir tout <ChevronRight size={20} />
</motion.button>
```

---

## ✅ Étape 2: Ajouter les Routes (30 min)

### 2.1 Modifier `App.jsx`

```jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/Home';
import ProductList from './features/products/pages/ProductList';

// À créer dans les étapes suivantes:
// import ProductDetail from './pages/Products/ProductDetail';
// import AddProduct from './pages/Products/AddProduct';
// import MyProducts from './pages/Products/MyProducts';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductList />} />
        {/* À ajouter plus tard */}
        {/* <Route path="/products/:id" element={<ProductDetail />} /> */}
        {/* <Route path="/sell" element={<AddProduct />} /> */}
        {/* <Route path="/my-products" element={<MyProducts />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
```

### 2.2 Mettre à Jour la Navigation

Corriger les boutons qui ne font rien:

```jsx
// Dans HomePage.jsx, ajouter des onClick:

// Bouton "Commencer à acheter"
<motion.button
  onClick={() => navigate('/products')}
  className="..."
>
  <ShoppingBag size={24} />
  Commencer à acheter
</motion.button>

// Bouton "Vendre maintenant"
<motion.button
  onClick={() => navigate('/sell')}
  className="..."
>
  <Package size={24} />
  Vendre maintenant
</motion.button>

// Dans le footer, CTA
<motion.button
  onClick={() => navigate('/sell')}
  className="..."
>
  <Package size={24} />
  Commencer à vendre
</motion.button>
```

---

## ✅ Étape 3: Créer ProductDetail (4h)

### 3.1 Créer `pages/Products/ProductDetail.jsx`

```jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, MapPin, Shield, Heart, Share2, MessageCircle, ArrowLeft } from 'lucide-react';
import { useProductDetail } from '../features/products/hooks/useProducts';
import { incrementProductViews } from '../features/products/api/products';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { product, loading, error } = useProductDetail(id);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Incrémenter les vues
  React.useEffect(() => {
    if (product) {
      incrementProductViews(product.id).catch(err => console.error(err));
    }
  }, [product]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Produit non trouvé</p>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg"
          >
            Retour aux produits
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/products')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold">{product.title}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Images */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="bg-white rounded-2xl p-4 h-96 flex items-center justify-center">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[currentImageIndex].image}
                  alt={product.title}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="text-gray-400">Pas d'image</div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      currentImageIndex === idx
                        ? 'border-orange-500'
                        : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={img.image}
                      alt={`Image ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Title & Price */}
            <div>
              <h2 className="text-4xl font-bold mb-2">{product.title}</h2>
              <p className="text-3xl font-bold text-orange-500">
                {product.price.toLocaleString('fr-FR')} FCFA
              </p>
            </div>

            {/* Condition & Location */}
            <div className="flex gap-4">
              <div className="px-4 py-2 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-600">État</p>
                <p className="font-semibold">
                  {
                    {
                      new: 'Neuf',
                      good: 'Bon état',
                      fair: 'Acceptable',
                      damaged: 'Endommagé'
                    }[product.condition]
                  }
                </p>
              </div>
              <div className="px-4 py-2 bg-gray-100 rounded-lg flex items-center gap-2">
                <MapPin size={18} />
                <div>
                  <p className="text-sm text-gray-600">Localisation</p>
                  <p className="font-semibold">{product.location}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xl font-bold mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Seller Info */}
            <div className="bg-white p-6 rounded-2xl border">
              <h3 className="text-lg font-bold mb-4">À propos du vendeur</h3>
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={product.seller_stats.avatar}
                  alt={product.seller.username}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold">{product.seller.username}</p>
                    {product.seller_stats.is_verified && (
                      <Shield size={16} className="text-green-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    Membre depuis{' '}
                    {new Date(product.seller_stats.member_since).toLocaleDateString('fr-FR')}
                  </p>
                  {product.seller.bio && (
                    <p className="text-sm text-gray-500 mt-1">{product.seller.bio}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsFavorite(!isFavorite)}
                className="flex-1 px-6 py-3 border-2 border-orange-500 text-orange-500 rounded-xl font-semibold hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
              >
                <Heart
                  size={20}
                  className={isFavorite ? 'fill-red-500 text-red-500' : ''}
                />
                {isFavorite ? 'Enregistré' : 'Enregistrer'}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle size={20} />
                Contacter
              </motion.button>
            </div>

            {/* Meta Info */}
            <div className="text-sm text-gray-500 space-y-1">
              <p>Publié le {new Date(product.created_at).toLocaleDateString('fr-FR')}</p>
              <p>Vues: {product.views_count}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
```

### 3.2 Ajouter la route dans App.jsx

```jsx
import ProductDetail from './pages/Products/ProductDetail';

<Route path="/products/:id" element={<ProductDetail />} />
```

### 3.3 Modifier ProductCard pour naviguer

```jsx
// Dans ProductCard.jsx, ajouter un onClick au "Voir" button
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product, onFavoriteClick }) => {
  const navigate = useNavigate();

  return (
    // ... existing code
    <motion.button
      whileHover={{ scale: 1.05 }}
      onClick={() => navigate(`/products/${product.id}`)}
      className="..."
    >
      Voir
    </motion.button>
  );
};
```

---

## ✅ Étape 4: Créer AddProduct (5h)

### 4.1 Créer `pages/Products/AddProduct.jsx`

```jsx
// Structure simplifiée - à adapter selon vos besoins
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { getCategories, createProduct, uploadProductImages } from '../features/products/api/products';

const AddProduct = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    condition: 'good',
    category: '',
    location: '',
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCategories().then(res => setCategories(res.data.results));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files].slice(0, 5)); // Max 5 images
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Créer le produit
      const productRes = await createProduct(formData);
      const productId = productRes.data.id;

      // Upload images si présentes
      if (images.length > 0) {
        await uploadProductImages(productId, images);
      }

      // Redirect vers le produit créé
      navigate(`/products/${productId}`);
    } catch (error) {
      console.error('Erreur création produit:', error);
      alert('Erreur lors de la création du produit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold">Créer une annonce</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-lg space-y-6">
          {/* Titre */}
          <div>
            <label className="block text-sm font-semibold mb-2">Titre de l'annonce *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="ex: iPhone 13 en bon état"
              required
              maxLength={200}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">{formData.title.length}/200</p>
          </div>

          {/* Catégorie */}
          <div>
            <label className="block text-sm font-semibold mb-2">Catégorie *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            >
              <option value="">Choisir une catégorie</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Prix */}
          <div>
            <label className="block text-sm font-semibold mb-2">Prix (FCFA) *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="0"
              required
              min="1"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          {/* Condition */}
          <div>
            <label className="block text-sm font-semibold mb-2">État du produit *</label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            >
              <option value="new">Neuf</option>
              <option value="good">Bon état</option>
              <option value="fair">Acceptable</option>
              <option value="damaged">Endommagé</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-2">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Décrivez votre produit..."
              required
              rows={5}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none resize-none"
            />
          </div>

          {/* Localisation */}
          <div>
            <label className="block text-sm font-semibold mb-2">Localisation *</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="ex: Cotonou, Akron"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-semibold mb-2">Images (max 5)</label>
            <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-orange-500 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="images"
                disabled={images.length >= 5}
              />
              <label htmlFor="images" className="cursor-pointer">
                <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                <p className="text-sm font-semibold">Cliquez pour uploader</p>
                <p className="text-xs text-gray-500">ou glissez-déposez</p>
              </label>
            </div>

            {/* Image Preview */}
            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                {images.map((img, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={URL.createObjectURL(img)}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
            >
              Annuler
            </button>
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 disabled:bg-gray-300"
            >
              {loading ? 'Création...' : 'Créer l\'annonce'}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
```

### 4.2 Ajouter route

```jsx
import AddProduct from './pages/Products/AddProduct';

<Route path="/sell" element={<AddProduct />} />
```

---

## ✅ Étape 5: Créer MyProducts (4h)

**Similar à AddProduct - page pour gérer ses annonces**

Structure:
- Liste des produits de l'utilisateur
- Statut de chaque produit
- Boutons Edit/Delete
- Statistiques (vues, favoris, messages)

---

## 🎯 Checklist Complète

### **Week 1:**
- [ ] Connecter HomePage à l'API (catégories)
- [ ] Connecter HomePage à l'API (produits)
- [ ] Ajouter routes de base
- [ ] Tester ProductList
- [ ] Commit: "feat: API integration"

### **Week 2:**
- [ ] Créer ProductDetail
- [ ] Tester ProductDetail
- [ ] Améliorer navigation
- [ ] Commit: "feat: product detail page"

### **Week 3:**
- [ ] Créer AddProduct
- [ ] Tester création d'annonce
- [ ] Upload d'images
- [ ] Commit: "feat: create product"

### **Week 4:**
- [ ] Créer MyProducts
- [ ] Edit/Delete
- [ ] Statistiques
- [ ] Commit: "feat: manage products"

---

## 🚀 Démarrer Immédiatement

### **Aujourd'hui (30 min):**
```bash
1. Copier/coller le code HomePage modifié
2. Ajouter imports
3. Tester avec npm run dev
4. Vérifier que categories/products s'affichent
```

### **Demain (1-2h):**
```bash
1. Ajouter routes dans App.jsx
2. Créer ProductDetail.jsx
3. Tester navigation
4. Commit les changements
```

---

**Prêt? Let's go! 🚀**
