"""
Users URLs
Routes pour l'authentification et la gestion des utilisateurs
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView,
    LoginView,
    logout_view,
    current_user_view,
    UserViewSet,
)

# Router pour le ViewSet
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    # Authentication endpoints
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', logout_view, name='logout'),
    path('me/', current_user_view, name='current-user'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    
    # User CRUD endpoints (via router)
    path('', include(router.urls)),
]

"""
📚 DOCUMENTATION DES ENDPOINTS

=== AUTHENTIFICATION ===

1. POST /api/auth/register/
   - Inscription d'un nouvel utilisateur
   - Public (AllowAny)
   - Body: username, email, password, password_confirm, first_name, last_name
   - Retourne: user + tokens JWT

2. POST /api/auth/login/
   - Connexion (avec username ou email)
   - Public (AllowAny)
   - Body: username (ou email), password
   - Retourne: user + tokens JWT

3. POST /api/auth/logout/
   - Déconnexion (blacklist refresh token)
   - Authentification requise
   - Body: refresh token
   - Retourne: message de confirmation

4. GET /api/auth/me/
   - Récupère le profil de l'utilisateur connecté
   - Authentification requise
   - Retourne: user complet avec profil

5. POST /api/auth/token/refresh/
   - Rafraîchit l'access token
   - Public (mais nécessite refresh token valide)
   - Body: refresh token
   - Retourne: nouveau access token

=== GESTION UTILISATEURS ===

6. GET /api/auth/users/
   - Liste des utilisateurs
   - Authentification requise
   - Query params: ?verified=true, ?search=john
   - Retourne: liste paginée (UserMinimalSerializer)

7. GET /api/auth/users/{id}/
   - Détail d'un utilisateur
   - Authentification requise
   - Retourne: user complet (UserSerializer)

8. PUT /api/auth/users/{id}/
   - Modification complète du profil
   - Authentification + IsOwner
   - Body: first_name, last_name, bio, avatar, phone_number, address, dob
   - Retourne: user mis à jour

9. PATCH /api/auth/users/{id}/
   - Modification partielle du profil
   - Authentification + IsOwner
   - Body: champs à modifier
   - Retourne: user mis à jour

10. DELETE /api/auth/users/{id}/
    - Suppression du compte
    - Authentification + IsOwner
    - Retourne: message de confirmation

11. POST /api/auth/users/verify/
    - Upload document d'identité
    - Authentification requise
    - Body (multipart): identity_document (file)
    - Retourne: message + status pending_verification

12. GET /api/auth/users/{id}/stats/
    - Statistiques de l'utilisateur
    - Authentification requise
    - Retourne: products_count, reviews_count, transactions_count, etc.

13. POST /api/auth/users/{id}/approve_verification/
    - [ADMIN] Approuver la vérification d'identité
    - Staff only
    - Retourne: user vérifié

=== POUR LES AUTRES DÉVELOPPEURS ===

Exemples d'utilisation dans vos apps:

1. Afficher l'utilisateur propriétaire d'un produit:
   from apps.users.serializers import UserMinimalSerializer
   
   class ProductSerializer(serializers.ModelSerializer):
       owner = UserMinimalSerializer(read_only=True)

2. Protéger une ressource (seul le propriétaire peut modifier):
   from apps.users.permissions import IsOwnerOrReadOnly
   
   class ProductViewSet(viewsets.ModelViewSet):
       permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

3. Restreindre aux utilisateurs vérifiés:
   from apps.users.permissions import IsVerifiedUser
   
   class CreateTransactionView(APIView):
       permission_classes = [IsAuthenticated, IsVerifiedUser]

4. Récupérer l'utilisateur dans vos views:
   owner = request.user  # Utilisateur connecté
   
5. Filtrer par propriétaire:
   Product.objects.filter(owner=request.user)
"""