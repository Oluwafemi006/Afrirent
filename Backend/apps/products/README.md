# 📦 Products Module

**Status:** ✅ Complete  
**Owner:** Personne 2  
**Dependencies:** users, core

---

## 📋 Vue d'ensemble

Le module `products` gère :
- **Catégories** : Classification des annonces
- **Produits** : Annonces de vente créées par les utilisateurs
- **Images** : Photos des produits (stockage Cloudinary)
- **Filtres & Recherche** : Filtrage avancé par prix, condition, localisation, etc.

---

## 🗂️ Structure du Fichier

```
products/
├── migrations/              # Migrations Django
│   └── 0001_initial.py     # Création des tables
├── __init__.py
├── admin.py                 # Interface admin Django
├── apps.py                  # Configuration de l'app
├── filters.py               # Filtres DjangoFilter
├── models.py                # Models: Category, Product, ProductImage
├── permissions.py           # Permissions personnalisées
├── serializers.py           # Sérializers DRF
├── tests.py                 # Tests unitaires
├── urls.py                  # Configuration des routes
├── views.py                 # ViewSets et logique API
├── API_CONTRACT.md          # Contrat d'interface (ce module)
└── README.md                # Ce fichier
```

---

## 🗄️ Models

### `Category`
```python
class Category(models.Model):
    name: str              # Unique
    slug: str              # URL-friendly (unique)
    description: str       # Optionnel
    icon: str              # Nom icône Lucide React
    order: int             # Ordre d'affichage
    is_active: bool        # Afficher/Masquer
    created_at: datetime   # Auto
    updated_at: datetime   # Auto
```

**Exemple:**
```python
Category.objects.create(
    name='Électronique',
    slug='electronique',
    icon='Smartphone',
    order=1
)
```

---

### `Product`
```python
class Product(models.Model):
    # Relations
    seller: ForeignKey[User]           # Vendeur du produit
    category: ForeignKey[Category]     # Catégorie (nullable)
    
    # Infos produit
    title: str                          # Titre de l'annonce
    description: str                    # Description détaillée
    price: Decimal                      # Prix en FCFA
    status: str                         # active | sold | inactive | pending
    condition: str                      # new | good | fair | damaged
    location: str                       # Localisation (quartier/ville)
    
    # Vedette
    is_featured: bool                  # En vedette (payant)
    featured_until: datetime           # Expiration de la vedette
    
    # Stats
    views_count: int                    # Compteur de vues
    created_at: datetime                # Auto
    updated_at: datetime                # Auto
```

**Propriétés utiles:**
```python
product.is_available        # Retourne True si status == 'active'
product.main_image          # Première image (objet ProductImage)
product.main_image_url      # URL de la première image
product.increment_views()   # Incrémenter les vues (+1)
```

---

### `ProductImage`
```python
class ProductImage(models.Model):
    product: ForeignKey[Product]    # Produit parent
    image: CloudinaryField          # Image stockée
    order: int                       # Ordre d'affichage (0 = principale)
    uploaded_at: datetime            # Auto
```

**Règles:**
- Max 5 images par produit
- Une image par numéro d'ordre par produit (unique_together)
- Stockage automatique sur Cloudinary
- Transformation auto: 800x800px

---

## 🔗 Relations & Dépendances

### Dépendances pour Products
```
User (apps.users)
    ↓ (seller)
Product
    ├─ Images
    └─ Category
```

### Qui dépend de Products?
```
Transaction (Personne 3)
    └─ Product (lier une transaction à un produit)

Favorites (Personne 4)
    └─ Product (favori = user + product)

Reviews (Personne 4)
    └─ Product (avis sur un produit)
```

---

## 🚀 Utilisation

### Dans l'Admin Django
```bash
python manage.py createsuperuser
# Aller à http://localhost:8000/admin/
```

Vous pouvez:
- ✅ Créer/modifier/supprimer catégories et produits
- ✅ Uploader et gérer les images
- ✅ Marquer comme "Vedette"
- ✅ Changer le statut en masse

### API REST

**Voir `API_CONTRACT.md` pour la doc complète**

```bash
# Lister produits
curl -X GET http://localhost:8000/api/products/

# Créer produit (authentifié)
curl -X POST http://localhost:8000/api/products/ \
  -H "Authorization: Bearer <token>" \
  -d '{"title": "...", ...}'

# Modifier son produit
curl -X PATCH http://localhost:8000/api/products/1/ \
  -H "Authorization: Bearer <token>" \
  -d '{"price": 450000}'

# Marquer comme vendu
curl -X PATCH http://localhost:8000/api/products/1/status/ \
  -H "Authorization: Bearer <token>" \
  -d '{"status": "sold"}'

# Uploader images
curl -X POST http://localhost:8000/api/products/1/upload_images/ \
  -H "Authorization: Bearer <token>" \
  -F "images=@image1.jpg" \
  -F "images=@image2.jpg"
```

---

## 🧪 Tests

### Lancer les tests
```bash
# Tests pour le module products seulement
python manage.py test apps.products

# Tests avec couverture
pytest --cov=apps.products apps/products/tests.py

# Tests spécifiques
python manage.py test apps.products.tests.ProductModelTest.test_create_product
```

### Tests inclus:
- ✅ Création modèles
- ✅ Représentation string
- ✅ Validations (prix, images)
- ✅ API endpoints
- ✅ Permissions
- ✅ Authentification

---

## 📱 Frontend Integration

### Imports API
```javascript
// api/products.js
import axios from 'axios';

const API_URL = import.meta.env.REACT_APP_API_URL;

export const productAPI = {
  // Lister
  getProducts: (params) => 
    axios.get(`${API_URL}/api/products/`, { params }),
  
  // Détail
  getProduct: (id) => 
    axios.get(`${API_URL}/api/products/${id}/`),
  
  // Créer
  createProduct: (data) =>
    axios.post(`${API_URL}/api/products/`, data),
  
  // Modifier
  updateProduct: (id, data) =>
    axios.patch(`${API_URL}/api/products/${id}/`, data),
  
  // Supprimer
  deleteProduct: (id) =>
    axios.delete(`${API_URL}/api/products/${id}/`),
  
  // Statut
  changeStatus: (id, status) =>
    axios.patch(`${API_URL}/api/products/${id}/status/`, { status }),
  
  // Mes produits
  getMyProducts: (params) =>
    axios.get(`${API_URL}/api/products/my-products/`, { params }),
  
  // Upload images
  uploadImages: (id, files) => {
    const formData = new FormData();
    files.forEach(f => formData.append('images', f));
    return axios.post(`${API_URL}/api/products/${id}/upload_images/`, formData);
  },
  
  // Catégories
  getCategories: () =>
    axios.get(`${API_URL}/api/products/categories/`),
};
```

### Hook personnalisé React
```javascript
// hooks/useProducts.js
import { useState, useEffect } from 'react';
import { productAPI } from '../api/products';

export const useProducts = (params) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    productAPI.getProducts(params)
      .then(res => setProducts(res.data.results))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, [params]);

  return { products, loading, error };
};
```

---

## 🎯 Développement Futur

### Phase 2 (Non implémenté actuellement):
- [ ] Recommandations basées sur historique
- [ ] Partage produit (WhatsApp, Facebook)
- [ ] Sauvegarde automatique brouillon
- [ ] Notif quand quelqu'un demande le produit

---

## 🐛 Dépannage

### Images ne s'affichent pas
```
1. Vérifier les credentials Cloudinary (.env)
2. Vérifier le dossier 'afrirent/products' sur Cloudinary
3. Tester l'upload dans l'admin Django
```

### Erreur "Vous ne pouvez modifier que vos produits"
```
1. Vérifier que vous êtes authentifié (token JWT valide)
2. Vérifier que vous êtes propriétaire du produit
3. Renouveler le token si expiré
```

### Filtres ne fonctionnent pas
```
1. Vérifier que django-filter est installé
2. Vérifier que la dépendance est dans INSTALLED_APPS
3. Consulter les logs pour les erreurs de syntaxe
```

---

## 📞 Support

**Questions sur l'API?** → Voir `API_CONTRACT.md`  
**Bugs/Issues?** → Créer une issue sur GitHub  
**Besoin d'aide?** → Contacter @Personne 2

---

## 🔄 Changelog

### v1.0 (2024-01-15)
- ✅ Models Category, Product, ProductImage
- ✅ CRUD complet + statuts
- ✅ Upload images Cloudinary
- ✅ Filtres et recherche
- ✅ API Contract + tests

---

**Last Updated:** 2024-01-15  
**Python:** 3.11+  
**Django:** 5.0.1  
**DRF:** 3.14.0
