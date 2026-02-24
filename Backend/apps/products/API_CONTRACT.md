# 📦 API Contract - Products Module

**Module Owner:** Personne 2 (You)  
**Status:** ✅ Initial Implementation  
**Last Updated:** 2024

---

## 🎯 Overview

L'API Products gère :
- ✅ Catégories de produits
- ✅ CRUD Produits/Annonces
- ✅ Images de produits
- ✅ Filtres et recherche avancée
- ✅ Gestion de statuts

---

## 📋 Endpoints

### **Categories** (Read-only)

#### GET `/api/products/categories/`
Lister toutes les catégories actives

**Response:** 
```json
{
  "count": 10,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "Électronique",
      "slug": "electronique",
      "description": "Produits électroniques...",
      "icon": "Smartphone",
      "products_count": 45,
      "is_active": true
    }
  ]
}
```

#### GET `/api/products/categories/{slug}/`
Détail d'une catégorie

**Response:**
```json
{
  "id": 1,
  "name": "Électronique",
  "slug": "electronique",
  "description": "Produits électroniques...",
  "icon": "Smartphone",
  "products_count": 45,
  "is_active": true
}
```

---

### **Products**

#### GET `/api/products/`
Lister tous les produits **actifs**

**Query Parameters:**
- `page` (int): Numéro de page (défaut: 1)
- `category` (str): Filtrer par catégorie (slug)
- `min_price` (int): Prix minimum
- `max_price` (int): Prix maximum
- `condition` (str): État du produit (new, good, fair, damaged)
- `status` (str): Statut (active, sold, inactive)
- `is_featured` (bool): Seulement les produits en vedette
- `location` (str): Localisation (contient)
- `seller` (str): Username du vendeur
- `search` (str): Recherche dans titre
- `ordering` (str): Tri (-created_at, price, views_count)

**Response:**
```json
{
  "count": 125,
  "next": "http://localhost:8000/api/products/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "iPhone 13",
      "price": 500000,
      "location": "Cotonou",
      "condition": "good",
      "status": "active",
      "main_image": {
        "id": 1,
        "image": "https://cloudinary.com/.../image.jpg",
        "order": 0
      },
      "seller": {
        "id": 2,
        "username": "john_doe",
        "avatar_url": "https://...",
        "is_verified": true,
        "full_name": "John Doe"
      },
      "category": {
        "id": 1,
        "name": "Électronique",
        "slug": "electronique",
        "icon": "Smartphone"
      },
      "is_featured": false,
      "views_count": 42,
      "created_at": "2024-01-10T14:30:00Z"
    }
  ]
}
```

#### GET `/api/products/{id}/`
Détail complet d'un produit

**Response:**
```json
{
  "id": 1,
  "title": "iPhone 13",
  "description": "iPhone 13 en très bon état, aucun défaut...",
  "price": 500000,
  "location": "Cotonou",
  "condition": "good",
  "status": "active",
  "category": {
    "id": 1,
    "name": "Électronique",
    "slug": "electronique",
    "icon": "Smartphone"
  },
  "images": [
    {
      "id": 1,
      "image": "https://cloudinary.com/.../img1.jpg",
      "order": 0
    },
    {
      "id": 2,
      "image": "https://cloudinary.com/.../img2.jpg",
      "order": 1
    }
  ],
  "seller": {
    "id": 2,
    "username": "john_doe",
    "avatar_url": "https://...",
    "is_verified": true,
    "full_name": "John Doe"
  },
  "seller_stats": {
    "username": "john_doe",
    "is_verified": true,
    "avatar": "https://...",
    "member_since": "2023-06-15T10:00:00Z"
  },
  "views_count": 42,
  "is_featured": false,
  "created_at": "2024-01-10T14:30:00Z",
  "updated_at": "2024-01-10T14:30:00Z"
}
```

#### POST `/api/products/` (**Authentifié**)
Créer un nouveau produit

**Request:**
```json
{
  "title": "iPhone 14",
  "description": "Très bon état, batterie récente",
  "price": 600000,
  "condition": "good",
  "category": 1,
  "location": "Cotonou - Akron"
}
```

**Response:** 201 Created
```json
{
  "id": 3,
  "title": "iPhone 14",
  "description": "Très bon état, batterie récente",
  "price": 600000,
  "condition": "good",
  "category": 1,
  "location": "Cotonou - Akron",
  "status": "active",
  "is_featured": false,
  "created_at": "2024-01-15T10:00:00Z"
}
```

#### PUT `/api/products/{id}/` (**Authentifié + Propriétaire**)
Remplacer complètement un produit

**Request:**
```json
{
  "title": "iPhone 14 - PRIX RÉDUIT",
  "description": "Très bon état, batterie récente",
  "price": 550000,
  "condition": "good",
  "category": 1,
  "location": "Cotonou - Akron"
}
```

**Response:** 200 OK

#### PATCH `/api/products/{id}/` (**Authentifié + Propriétaire**)
Modification partielle d'un produit

**Request:**
```json
{
  "price": 550000,
  "title": "iPhone 14 - PRIX RÉDUIT"
}
```

**Response:** 200 OK

#### DELETE `/api/products/{id}/` (**Authentifié + Propriétaire**)
Supprimer un produit

**Response:** 204 No Content

---

#### GET `/api/products/my-products/`  (**Authentifié**)
Lister **TOUS** mes produits (indépendamment du statut)

Supporte les mêmes filtres que GET `/api/products/`

**Response:** Même format que GET `/api/products/`

---

#### PATCH `/api/products/{id}/status/` (**Authentifié + Propriétaire**)
Changer le statut d'un produit

**Request:**
```json
{
  "status": "sold"
}
```

**Status Valides:**
- `active` : Actif et visible
- `sold` : Vendu (masqué du public)
- `inactive` : Désactivé (masqué du public)
- `pending` : En attente de vérification

**Response:** 200 OK
```json
{
  "message": "Produit marqué comme sold",
  "product": { ... }  // Produit complet mis à jour
}
```

---

#### POST `/api/products/{id}/increment_views/` (**Public**)
Incrémenter le compteur de vues

**Response:** 200 OK
```json
{
  "views_count": 43
}
```

---

#### POST `/api/products/{id}/upload_images/` (**Authentifié + Propriétaire**)
Uploader des images supplémentaires

**Request:** 
- Content-Type: `multipart/form-data`
- Field: `images` (multiple files)

Max 5 images totales par produit

**Response:** 201 Created
```json
{
  "message": "2 image(s) uploadée(s)",
  "product": { ... }  // Produit mis à jour avec images
}
```

---

## 🔐 Authentification & Permissions

| Endpoint | Public | Authentifié | Propriétaire |
|----------|--------|-------------|--------------|
| GET `/api/products/` | ✅ | ✅ | ✅ |
| GET `/api/products/{id}/` | ✅ | ✅ | ✅ |
| POST `/api/products/` | ❌ | ✅ | - |
| PUT/PATCH `/api/products/{id}/` | ❌ | ✅* | ✅* |
| DELETE `/api/products/{id}/` | ❌ | ✅* | ✅* |
| GET `/api/products/my-products/` | ❌ | ✅ | - |
| PATCH `/api/products/{id}/status/` | ❌ | ✅* | ✅* |
| POST `/api/products/{id}/increment_views/` | ✅ | ✅ | ✅ |
| POST `/api/products/{id}/upload_images/` | ❌ | ✅* | ✅* |
| GET `/api/products/categories/` | ✅ | ✅ | ✅ |

*Seulement pour le propriétaire du produit*

---

## 📤 Upload d'Images

**Limites:**
- Max 5 images par produit
- Format acceptés: JPG, PNG, GIF
- Taille max par image: 5 Mo
- Les images sont stockées sur Cloudinary
- Transformation automatique: 800x800px, qualité auto

**Exemple avec cURL:**
```bash
curl -X POST http://localhost:8000/api/products/1/upload_images/ \
  -H "Authorization: Bearer <token>" \
  -F "images=@image1.jpg" \
  -F "images=@image2.jpg"
```

---

## 🔄 Statuts de Produit

| Statut | Visible au Public | Visible par Propriétaire | Description |
|--------|------------------|-------------------------|-------------|
| `active` | ✅ | ✅ | Produit en vente |
| `sold` | ❌ | ✅ | Produit vendu |
| `inactive` | ❌ | ✅ | Produit désactivé |
| `pending` | ❌ | ✅ | En attente de validation |

---

## 🎯 Cas d'Usage Frontend

### Cas 1: Afficher la liste des produits
```javascript
GET /api/products/?page=1&status=active
```

### Cas 2: Chercher par catégorie et prix
```javascript
GET /api/products/?category=electronique&min_price=100000&max_price=1000000
```

### Cas 3: Créer un produit avec images
```javascript
1. POST /api/products/  // Créer le produit
2. POST /api/products/{id}/upload_images/  // Uploader les images
```

### Cas 4: Afficher ses propres produits
```javascript
GET /api/products/my-products/  // Inclut les produits non actifs
```

### Cas 5: Marquer un produit comme vendu
```javascript
PATCH /api/products/{id}/status/
{ "status": "sold" }
```

---

## ⚠️ Notes Importantes

### Pour les autres modules (Personne 3+)

**Importer le serializer minimal pour le vendeur:**
```python
from apps.products.serializers import ProductMinimalSerializer, ProductListSerializer
```

**Structure de Product minimale:**
```json
{
  "id": 1,
  "title": "iPhone 13",
  "price": 500000,
  "image": "https://...",
  "status": "active"
}
```

**Vérifier que l'article existe avant transaction:**
```python
# Pour la Personne 3 (Transactions)
try:
    product = Product.objects.get(id=product_id)
    if product.status != 'active':
        # Erreur: produit non disponible
except Product.DoesNotExist:
    # Erreur: produit n'existe pas
```

---

## 🧪 Exemples de Requêtes

### Liste avec filtres
```bash
curl -X GET "http://localhost:8000/api/products/?category=electronique&min_price=100000&max_price=1000000&ordering=-created_at"
```

### Créer un produit
```bash
curl -X POST http://localhost:8000/api/products/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "iPhone 13",
    "description": "Bon état",
    "price": 500000,
    "condition": "good",
    "category": 1,
    "location": "Cotonou"
  }'
```

### Mes produits
```bash
curl -X GET http://localhost:8000/api/products/my-products/ \
  -H "Authorization: Bearer <token>"
```

---

**Status:** ✅ Stable  
**Version:** 1.0  
**Last Tested:** 2024-01-15
