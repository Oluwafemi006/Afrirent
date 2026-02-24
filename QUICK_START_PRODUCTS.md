# ⚡ Quick Start - Module Products

**TL;DR Version - Lire ceci en premier**

---

## 🎯 Ce qui a été fait pour vous

✅ **Backend (Django):**
- App `products` entièrement créée
- 3 Models: Category, Product, ProductImage  
- 2 ViewSets: CategoryViewSet, ProductViewSet
- 6 Serializers (list, detail, create, minimal)
- Permissions personnalisées
- Filtres avancés (prix, catégorie, condition, etc.)
- Admin Django magnifique avec inline images
- Tests complets
- 11 Endpoints API

✅ **Frontend (React):**
- Structure dossier `features/products`
- API client isolée (15+ fonctions)
- 2 Hooks React personnalisés
- Composant ProductCard
- Page ProductList avec recherche et filtres

✅ **Documentation:**
- `API_CONTRACT.md` - Spec technique complète
- `README.md` - Guide technique
- `IMPLEMENTATION_GUIDE.md` - Pas-à-pas installation

---

## 🚀 Les 3 Étapes pour Démarrer

### Étape 1: Migrations (5 min)
```bash
cd Backend
python manage.py migrate products
```

**C'est tout!** La base de données est prête.

### Étape 2: Tester l'API (5 min)
```bash
python manage.py runserver
# Aller à: http://localhost:8000/swagger/
```

Vous verrez tous les endpoints disponibles. Testez:
- GET `/api/products/`
- GET `/api/products/categories/`

### Étape 3: Frontend (5 min)
```bash
cd Frontend
npm run dev
# Aller à: http://localhost:5173/products
```

Vous devriez voir une page avec une liste vide (normal, pas de données yet).

---

## 📋 10 Secondes Par Endpoint

### GET `/api/products/`
```
Liste tous les produits avec filters
Paramètres: category, min_price, max_price, search, condition, etc.
```

### GET `/api/products/{id}/`
```
Détail d'un produit avec toutes les images et infos vendeur
```

### POST `/api/products/` (Auth)
```
Créer un produit
Body: title, description, price, condition, category, location
```

### PATCH `/api/products/{id}/` (Auth + Owner)
```
Modifier un produit (vendeur seulement)
```

### DELETE `/api/products/{id}/` (Auth + Owner)
```
Supprimer un produit (vendeur seulement)
```

### GET `/api/products/my-products/` (Auth)
```
Voir TOUS ses produits (vendeur seulement)
Support les mêmes filtres que GET /api/products/
```

### PATCH `/api/products/{id}/status/` (Auth + Owner)
```
Changer statut: active, sold, inactive, pending
Exemple: {"status": "sold"}
```

### POST `/api/products/{id}/upload_images/` (Auth + Owner)
```
Uploader des images supplémentaires (max 5 total)
multipart/form-data avec champ 'images'
```

### GET `/api/products/categories/`
```
Lister toutes les catégories
```

---

## 🔧 Configuration Nécessaire

### `.env` Backend (copy from `.env.example`)
```bash
# Obligatoire
SECRET_KEY=your_secret_key
DATABASE_NAME=marketplace_db
DATABASE_USER=marketplace_user
DATABASE_PASSWORD=password

# Pour images (Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

### `.env` Frontend
```bash
VITE_API_URL=http://localhost:8000
```

---

## 📁 Structure Fichiers

```
Backend/
├── apps/products/              ← Votre app (TOUT EST LÀ!)
│   ├── models.py
│   ├── views.py
│   ├── serializers.py
│   ├── urls.py
│   ├── admin.py
│   ├── tests.py
│   └── migrations/

Frontend/
└── src/features/products/      ← Votre folder React
    ├── api/products.js
    ├── hooks/useProducts.js
    ├── components/ProductCard.jsx
    └── pages/ProductList.jsx
```

---

## 🧪 Tester Sans Frontend

### Créer un produit (cURL)
```bash
# 1. S'authentifier
TOKEN=$(curl -X POST http://localhost:8000/api/auth/token/ \
  -d "username=testuser&password=testpass123" \
  | jq -r '.access')

# 2. Créer le produit
curl -X POST http://localhost:8000/api/products/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "iPhone 13",
    "description": "Très bon état",
    "price": 500000,
    "condition": "good",
    "category": 1,
    "location": "Cotonou"
  }'
```

### Lire les produits
```bash
curl http://localhost:8000/api/products/ | jq .
```

### Filtrer
```bash
curl "http://localhost:8000/api/products/?category=electronique&min_price=100000&max_price=1000000" | jq .
```

---

## 🎓 Architecture Expliquée

```
API Request
    ↓
urls.py → Routage vers ViewSet
    ↓
ViewSet → Logique métier
    ↓
Serializer → Validation + Format JSON
    ↓
Model → DB
```

**Exemple concret:**
```
GET /api/products/?category=electronique
    ↓
ProductViewSet.list() appelé
    ↓
Filters appliqués (ProductFilter)
    ↓
Serializer (ProductListSerializer)
    ↓
JSON response avec 20 produits
```

---

## 🎯 Points Importants à Savoir

### 1. Authentification = JWT Token
```python
# Headers required:
Authorization: Bearer <token>
```

### 2. Permissions
- **Lecture produit:** Tout le monde SAUF produits non-actifs
- **Créer produit:** Auth requis
- **Modifier/Supprimer:** Auth + Propriétaire

### 3. Statuts Produit
| Statut | Public | Propriétaire |
|--------|--------|--------------|
| active | ✅ Visible | ✅ Visible |
| sold | ❌ Caché | ✅ Visible |
| inactive | ❌ Caché | ✅ Visible |
| pending | ❌ Caché | ✅ Visible |

### 4. Images
- Max 5 par produit
- Automatiquement sur Cloudinary
- Redimensionnées 800x800px

---

## ⚠️ Erreurs Courantes

### "Migration not applied"
```bash
python manage.py migrate products
```

### "Unauthorized" sur POST
```python
# Besoin du token JWT
curl -H "Authorization: Bearer YOUR_TOKEN" ...
```

### "Permission denied"
```python
# Vous n'êtes pas propriétaire du produit
# Ou vous n'êtes pas authentifié
```

### Images ne s'affichent pas
```python
# Vérifier .env CLOUDINARY_* variables
# Vérifier que l'app Cloudinary est enregistrée
```

---

## 🔄 Workflow Recommandé

### Jour 1
```bash
# Setup
python manage.py migrate products
python manage.py runserver

# Test
# Aller à http://localhost:8000/swagger/
# Tester GET /api/products/categories/
```

### Jour 2-3
```bash
# Frontend
cd Frontend && npm run dev
# Voir ProductList page marcher
```

### Jour 4+
```bash
# Implémenter pages additionnelles
# - ProductDetail
# - AddProduct
# - MyProducts
```

---

## 📞 Aide Rapide

**Code Review?**  
Lire `API_CONTRACT.md`

**Détails techniques?**  
Lire `README.md` dans `apps/products/`

**Installation complète?**  
Lire `IMPLEMENTATION_GUIDE_PRODUCTS.md`

**Tests?**  
```bash
python manage.py test apps.products -v 2
```

**Admin Django?**  
```bash
python manage.py createsuperuser
# http://localhost:8000/admin/
```

---

## ✨ Prochaines Pages à Créer

| Page | Fichier | Complexité | Dépend de |
|------|---------|-----------|-----------|
| ProductDetail | `pages/ProductDetail.jsx` | Facile | GET `/api/products/{id}` |
| AddProduct | `pages/AddProduct.jsx` | Medium | POST `/api/products/` |
| EditProduct | `pages/EditProduct.jsx` | Medium | PATCH `/api/products/{id}/` |
| MyProducts | `pages/MyProducts.jsx` | Easy | GET `/api/products/my-products/` |

---

## 🎉 Vous Êtes Prêts!

Tout ce dont vous avez besoin est:
1. ✅ App Django créée
2. ✅ API REST fonctionnelle
3. ✅ Frontend structure créée
4. ✅ Documentation complète
5. ✅ Tests inclus

**Temps pour démarrer: < 5 minutes**

```bash
# 1. Migrate
python manage.py migrate products

# 2. Run
python manage.py runserver

# 3. Test
# http://localhost:8000/swagger/
```

Bon développement! 🚀

---

**Questions?** Consulter les 3 docs principales dans Backend/apps/products/
