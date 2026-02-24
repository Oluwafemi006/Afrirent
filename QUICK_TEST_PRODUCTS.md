# ⚡ QUICK TEST - Module Products Frontend

**Test en 10 minutes les 4 nouvelles pages**

---

## 🚀 Setup (2 min)

```bash
# Terminal 1 - Backend
cd Backend
python manage.py runserver

# Terminal 2 - Frontend
cd Frontend
npm run dev
```

Accès:
- Backend: http://localhost:8000
- Frontend: http://localhost:5173

---

## ✅ Checklist de Test

### 1. Home Page (1 min)
```
☐ Aller à http://localhost:5173
☐ Voir les 2 nouveaux boutons (si authentifié)
  - "Créer une annonce" → /products/new
  - "Parcourir les produits" → /products
```

### 2. ProductList (2 min)
```
☐ Cliquer "Parcourir les produits"
☐ Voir la liste des annonces
☐ Tester les filtres (catégorie, prix, état)
☐ Tester la recherche
☐ Cliquer sur une annonce
```

### 3. ProductDetail (2 min)
```
☐ Voir les détails complets
☐ Voir la galerie d'images (cliquer les aperçus)
☐ Voir les infos du vendeur
☐ Voir le prix, condition, localisation
☐ Voir les statistiques (vues)
☐ Si propriétaire:
   ☐ Voir le bouton "Modifier"
   ☐ Voir le select de statut
   ☐ Voir le bouton "Supprimer"
```

### 4. AddProduct (2 min)
**Si authentifié:**
```
☐ Cliquer "Créer une annonce" (Home ou ProductList)
☐ Remplir le formulaire:
   ☐ Titre
   ☐ Description
   ☐ Prix
   ☐ Catégorie
   ☐ État
   ☐ Localisation
☐ Ajouter des images (5 max)
☐ Voir les aperçus des images
☐ Cliquer "Créer l'annonce"
☐ Redirect automatique vers ProductDetail
```

### 5. MyProducts (1 min)
**Si authentifié:**
```
☐ Aller à /products/my-products
☐ Voir toutes VOS annonces
☐ Voir les statistiques (Total, Actives, etc.)
☐ Tester les filtres (Toutes, Actives, etc.)
☐ Voir les actions rapides:
   ☐ Bouton Activer/Désactiver
   ☐ Bouton Modifier
   ☐ Bouton Supprimer
```

### 6. EditProduct (1 min)
**Si propriétaire d'une annonce:**
```
☐ Depuis MyProducts: Cliquer "Modifier"
☐ Voir les champs pré-remplis
☐ Modifier un champ (ex: titre)
☐ Ajouter une image
☐ Cliquer "Mettre à jour"
☐ Voir la mise à jour confirmée
```

### 7. Responsive (1 min)
```
☐ Ouvrir DevTools (F12)
☐ Passer en mobile (375px)
☐ Tester ProductList
☐ Tester ProductDetail
☐ Tester AddProduct
☐ Tester MyProducts (cartes au lieu de table)
```

---

## 🔍 Ce qui Devrait Marcher

### ✅ Navigation
- Home → ProductList
- ProductList → ProductDetail
- ProductDetail → EditProduct (si proprio)
- Home → AddProduct (si auth)
- Home → MyProducts (si auth)

### ✅ Données
- Affichage des produits du backend
- Images depuis Cloudinary
- Catégories dynamiques
- Info vendeur correcte
- Prix formaté en FCFA

### ✅ Formulaires
- Validation avant envoi
- Upload d'images
- Message de succès
- Gestion d'erreurs

### ✅ Permissions
- Ajouter/modifier uniquement si auth
- Éditer/supprimer uniquement si proprio
- Redirection si non auth

---

## 🐛 Bugs Potentiels à Tester

```javascript
// Avant de créer une annonce
- Titre vide? → Message d'erreur ✅
- Prix vide? → Message d'erreur ✅
- Catégorie non sélectionnée? → Message d'erreur ✅
- Pas d'images? → Message d'erreur ✅

// Images
- Upload 6 images? → Max 5 warning ✅
- Supprimer une image existante? → Visible comme "Existant" ✅

// Édition
- Accès non-proprio → Erreur/redirection ✅
- Modification data → Sauvegarde ✅

// Suppression
- Pas de confirmation? → Demande confirmation ✅
- Suppression réussie → Redirection ✅
```

---

## 📊 Test Data

### Créer un Produit de Test

```json
{
  "title": "iPhone 13 Pro Test",
  "description": "En excellent état, jamais tombé",
  "price": 850000,
  "category": 1,  // Électronique
  "condition": "good",
  "location": "Dakar, Plateau"
}
```

### Images de Test
- Télécharger 2-3 images d'exemple
- Format: JPG, PNG
- Taille: <5MB

---

## ✨ Bonus Tests

### Test de Réactivité
```
- Ajouter un produit
- Vérifier qu'il apparaît dans MyProducts
- Vérifier qu'il apparaît dans ProductList
- Modifier le titre
- Vérifier la mise à jour immédiate
```

### Test de Filtres
```
ProductList:
- Chercher par titre
- Filtrer par catégorie
- Filtrer par prix (min/max)
- Filtrer par condition
- Combiner les filtres

MyProducts:
- Filtrer par Toutes/Actives/Inactives/Vendues
- Voir les compteurs maj
```

### Test de Permissions
```
- Login avec utilisateur A
- Créer un produit
- Voir "Modifier" disponible
- Logout
- Login avec utilisateur B
- Voir le produit
- Pas de bouton "Modifier"
- Tenter /products/ID/edit
- → Erreur ou redirection
```

---

## 📱 Test Mobile

```bash
# Sur le même réseau local
http://192.168.x.x:5173
```

Vérifier:
- Boutons sont touchables
- Images s'affichent
- Formulaires sont lisibles
- Clavier mobile ne cache rien

---

## 🎯 Success Criteria

Tous les tests passent ✅
```
☐ Navigation fluide
☐ Données correctes
☐ Formulaires valident
☐ Images s'affichent
☐ Permissions respectées
☐ Responsive OK
☐ Pas d'erreurs console
```

---

## 📝 Notes

### URLs Clés
- Home: `/`
- Liste produits: `/products`
- Détail: `/products/:id`
- Créer: `/products/new`
- Modifier: `/products/:id/edit`
- Mes annonces: `/products/my-products`

### Tokens
- Stockés dans localStorage
- Utilisés automatiquement dans les requêtes
- Envoyés dans Authorization header

### Erreurs Attendues
- Si pas auth: redirect /login
- Si pas proprio: message d'erreur
- Si serveur down: message d'erreur
- Si image > 5MB: warning frontend

---

## ⏱️ Timeline Estimé

```
Home page               : 1 min
ProductList            : 2 min
ProductDetail          : 2 min
AddProduct             : 2 min
MyProducts             : 1 min
EditProduct            : 1 min
Responsive check       : 1 min
─────────────────────────────
Total                  : ~10 min
```

---

## 💡 Tips

1. **Ouvrir la console** (F12) pour voir les logs
2. **Network tab** pour voir les requêtes API
3. **Mobile devtools** pour tester responsive
4. **Créer plusieurs produits** pour tester les filtres
5. **Utiliser plusieurs comptes** pour tester les permissions

---

## 🆘 Si Ça Échoue

### "Produit non trouvé" (ProductDetail)
- ✅ Vérifier que le serveur Django tourne
- ✅ Vérifier l'ID du produit en URL
- ✅ Vérifier que le produit existe en DB

### "Erreur 401" (AddProduct)
- ✅ Vérifier que vous êtes authentifié
- ✅ Vérifier le token dans localStorage
- ✅ Re-login si nécessaire

### "Images non uploadées"
- ✅ Vérifier la taille des fichiers
- ✅ Vérifier la connexion Cloudinary
- ✅ Vérifier le backend logs

### "Pas de catégories"
- ✅ Vérifier que les catégories existent
- ✅ Vérifier l'endpoint /api/products/categories/
- ✅ Charger les données en admin Django

---

**Bon test!** 🚀

Tout devrait marcher. Si vous trouvez un bug, c'est un découverte! 🎉
