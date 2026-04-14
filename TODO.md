# TODO Déploiement Afrirent

## ✅ Étapes terminées
- [x] Créer plan déploiement
- [x] Corriger Backend production.py (ALLOWED_HOSTS, SSL Railway)
- [x] Créer TODO.md & updates

## 🔄 En cours
- [ ] Push changes & redeploy Railway/Netlify

## ⏳ À faire
1. **Frontend/.env** : Ajouter `VITE_API_URL=https://afrirent-production.up.railway.app/api`
2. **Railway vars** (dashboard.railway.app/project):
   ```
   SECRET_KEY=your_secret
   DB_NAME=postgres (auto)
   DB_USER=postgres (auto)
   DB_PASSWORD=...
   DB_HOST=containers-us-west-123.railway.app
   DB_PORT=5432
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   EMAIL_HOST=smtp.gmail.com
   EMAIL_HOST_USER=...
   EMAIL_HOST_PASSWORD=app_password
   ALLOWED_HOSTS=afrirent-production.up.railway.app,.railway.app
   ```
3. **Netlify vars** (netlify.com/sites → Env vars): `VITE_API_URL=https://afrirent-production.up.railway.app/api`
4. **Vérifier** :
   - Backend: https://afrirent-production.up.railway.app/swagger/
   - Frontend: Login, liste produits (F12 → Network → API calls)
5. Migrations si nouvelles: Railway → "Deployments" → Run `python manage.py migrate`
6. Tester upload image (Cloudinary)

**Commande après edits**: `git add . && git commit -m "Fix prod deploy: hosts/SSL/API URL" && git push`

