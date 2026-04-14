# TODO - Fix catégories AddProduct (Railway)

## ✅ Étape 1: Commande créée
- [x] `Backend/apps/products/management/commands/seed_categories.py`

## ⏳ Étapes suivantes:
1. **Local (test):**
   ```
   cd Backend
   python manage.py seed_categories
   ```
   Vérifiez que catégories apparaissent dans http://localhost:8000/api/products/categories/

2. **Railway (production):**
   ```
   # Option 1: Railway CLI
   railway run python manage.py seed_categories
   
   # Option 2: Railway dashboard > Deploy > Run command
   cd Backend && python manage.py seed_categories
   
   # Option 3: Ajouter à post-deploy script dans railway.json
   ```

3. **Vérification:**
   - Ouvrir formulaire "Créer une annonce"
   - Dropdown catégories doit lister: Électronique, Véhicules, etc.
   - Test création annonce complète

## 🚀 Automatiser pour futurs déploiements
Ajouter à `railway.json` ou script post-deploy.

**Prochaine étape ? Dites-moi après exécution Railway !**

