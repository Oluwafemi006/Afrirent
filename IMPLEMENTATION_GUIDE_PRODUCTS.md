# 🚀 Guide d'Implémentation - Module Products

**Personne 2 - Responsable Module Products**

---

## 📋 Table des Matières
1. [Setup Initial](#setup-initial)
2. [Mise à Jour de la Configuration](#mise-à-jour-de-la-configuration)
3. [Exécution des Migrations](#exécution-des-migrations)
4. [Vérification et Tests](#vérification-et-tests)
5. [Développement Frontend](#développement-frontend)
6. [Déploiement](#déploiement)

---

## ✅ Setup Initial

### Étape 1: Mettre à jour les dépendances

```bash
cd Backend
pip install -r requirements.txt
```

### Étape 2: Vérifier la structure

```bash
ls -la apps/products/
```

Vous devriez voir:
- `__init__.py`
- `admin.py`
- `apps.py`
- `filters.py`
- `models.py`
- `permissions.py`
- `serializers.py`
- `tests.py`
- `urls.py`
- `views.py`
- `API_CONTRACT.md`
- `README.md`
- `migrations/0001_initial.py`

---

## 🔧 Mise à Jour de la Configuration

### Vérifier que l'app est enregistrée

**Vérifier `/Backend/config/settings/base.py`:**

```python
LOCAL_APPS = [
    'apps.core',
    'apps.users',
    'apps.products',  # ← Devrait être là
]

THIRD_PARTY_APPS = [
    ...
    'django_filters',  # ← Devrait être là
]
```

**Vérifier `/Backend/config/urls.py`:**

```python
urlpatterns = [
    ...
    path('api/products/', include('apps.products.urls')),  # ← Devrait être là
]
```

---

## 🗄️ Exécution des Migrations

### Étape 1: Créer la migration (déjà faite, mais au cas où)

```bash
cd Backend
python manage.py makemigrations products
```

### Étape 2: Appliquer la migration

```bash
python manage.py migrate products
```

**Output attendu:**
```
Running migrations:
  Applying products.0001_initial... OK
```

### Étape 3: Vérifier dans la DB

```bash
python manage.py shell
```

```python
from apps.products.models import Category, Product, ProductImage
print(f"Categories: {Category.objects.count()}")
print(f"Products: {Product.objects.count()}")
print(f"Images: {ProductImage.objects.count()}")
exit()
```

---

## 🧪 Vérification et Tests

### Lancer les tests

```bash
# Tests du module products
python manage.py test apps.products

# Tests avec couverture
pip install pytest pytest-django pytest-cov
pytest apps/products/tests.py --cov=apps.products -v
```

**Output attendu:** ✅ Tous les tests passent

### Tester manuellement via Swagger

1. Lancer le serveur:
   ```bash
   python manage.py runserver
   ```

2. Aller à: http://localhost:8000/swagger/

3. Tester les endpoints:
   - ✅ GET `/api/products/` (sans auth)
   - ✅ GET `/api/products/categories/` (sans auth)
   - ✅ POST `/api/products/` (avec auth) → Créer un produit
   - ✅ PATCH `/api/products/{id}/status/` (avec auth) → Changer statut

### Test cURL

```bash
# Lister produits
curl -X GET http://localhost:8000/api/products/

# Lister catégories
curl -X GET http://localhost:8000/api/products/categories/

# Chercher produits
curl -X GET "http://localhost:8000/api/products/?category=electronique&min_price=100000"
```

---

## 🎨 Développement Frontend

### Étape 1: Installer les dépendances

```bash
cd Frontend
npm install
```

### Étape 2: Configurer l'API URL

**Créer `.env.local` (ne pas versionner):**

```
VITE_API_URL=http://localhost:8000
```

### Étape 3: Vérifier les fichiers créés

```bash
ls -la src/features/products/
```

Vous devriez voir:
- `api/products.js` - Appels API
- `hooks/useProducts.js` - Hooks React
- `components/ProductCard.jsx` - Composant carte
- `pages/ProductList.jsx` - Page liste

### Étape 4: Intégrer ProductList dans le router

**Modifier `src/App.jsx`:**

```jsx
import ProductList from './features/products/pages/ProductList';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ... autres routes */}
        <Route path="/products" element={<ProductList />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### Étape 5: Tester le frontend

```bash
npm run dev
```

Aller à: http://localhost:5173/products

Vous devriez voir:
- ✅ Liste des produits
- ✅ Champ de recherche
- ✅ Filtres
- ✅ Cartes produits

---

## 📊 Créer des Données de Test

### Dans l'Admin Django

1. Aller à: http://localhost:8000/admin/
2. Se connecter avec le superuser
3. Créer quelques catégories:
   - Électronique
   - Vêtements
   - Meubles

4. Créer des produits de test (affichage admin très amélioré!)

### Ou via Python shell

```bash
python manage.py shell
```

```python
from django.contrib.auth import get_user_model
from apps.products.models import Category, Product

User = get_user_model()

# Créer une catégorie
cat = Category.objects.create(
    name='Électronique',
    slug='electronique',
    icon='Smartphone',
    order=1
)

# Créer un utilisateur test
user = User.objects.create_user(
    username='seller1',
    email='seller1@test.com',
    password='testpass123'
)

# Créer un produit
product = Product.objects.create(
    seller=user,
    category=cat,
    title='iPhone 13',
    description='Très bon état, batterie 95%',
    price=500000,
    condition='good',
    location='Cotonou',
    status='active'
)

print(f"Produit créé: {product.title}")
exit()
```

---

## 🚀 Prochaines Étapes

### Après cette implémentation complète

#### Étape 1: Pages détail produit
```javascript
// src/features/products/pages/ProductDetail.jsx
```

#### Étape 2: Création d'annonce
```javascript
// src/features/products/pages/AddProduct.jsx
// src/features/products/components/ProductForm.jsx
```

#### Étape 3: Gestion utilisateur
```javascript
// src/features/products/pages/MyProducts.jsx
```

#### Étape 4: Upload d'images
```javascript
// src/features/products/components/ImageUploader.jsx
```

---

## 🐛 Dépannage

### Erreur: "No module named 'django_filters'"

```bash
pip install django-filter==23.5
```

### Erreur: "products app not registered"

Vérifier:
1. `apps/products/__init__.py` existe
2. `'apps.products'` dans `INSTALLED_APPS` (base.py)
3. Redémarrer le serveur

### Erreur: "migration conflicts"

```bash
python manage.py migrate --fake-initial products
python manage.py migrate products
```

### Images ne s'affichent pas

1. Vérifier Cloudinary credentials dans `.env`
2. Tester l'upload dans admin Django
3. Vérifier le dossier `afrirent/products` sur Cloudinary

### Authentification JWT ne marche pas

```bash
# Vérifier le token
curl -X GET http://localhost:8000/api/auth/me/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ✨ Points Clés à Retenir

### Architecture
- ✅ App modulaire (séparation concerns)
- ✅ Models + Serializers + ViewSets
- ✅ Permissions personnalisées
- ✅ Filtres DjangoFilter

### Frontend
- ✅ Hooks personnalisés (useProducts)
- ✅ API isolée (api/products.js)
- ✅ Composants réutilisables (ProductCard)
- ✅ Gestion d'erreurs

### Tests
- ✅ Couverture de base
- ✅ Tests API
- ✅ Tests permissions

### Documentation
- ✅ API Contract détaillé
- ✅ README complet
- ✅ Commentaires dans le code

---

## 📞 Méthode de Communication

**Si vous bloquez sur quelque chose:**

1. Vérifier le troubleshooting au-dessus
2. Consulter `API_CONTRACT.md` pour les specs API
3. Consulter `README.md` pour les détails techniques
4. Contacter l'équipe via Slack #dev-help

---

## ✅ Checklist d'Implémentation

- [ ] App créée et enregistrée
- [ ] Migrations exécutées
- [ ] Tests passants
- [ ] Admin configuré
- [ ] Données de test créées
- [ ] API testée via Swagger
- [ ] Frontend structure créée
- [ ] ProductList fonctionnelle
- [ ] Recherche et filtres testés
- [ ] Documentation relue
- [ ] Commit git dans feature/products

---

## 🎯 Workflow Git Recommandé

```bash
# 1. Créer votre branche
git checkout -b feature/products

# 2. Faire votre travail
# ... implémentation complète

# 3. Tests et vérification
python manage.py test apps.products
npm run dev  # Vérifier front

# 4. Commiter régulièrement
git add apps/products/
git commit -m "feat(products): models et API CRUD"

git add Frontend/src/features/products/
git commit -m "feat(products): frontend liste et recherche"

# 5. Pousser
git push origin feature/products

# 6. Créer Pull Request
# Aller sur GitHub → Compare & Pull Request
```

---

**Last Updated:** 2024-01-15  
**Status:** ✅ Ready for Implementation  
**Estimated Time:** 4 weeks for complete implementation including frontend

