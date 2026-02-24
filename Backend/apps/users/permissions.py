"""
Users Permissions
Permissions personnalisées pour la gestion des utilisateurs
"""
from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Permission custom : L'utilisateur ne peut modifier que son propre profil
    
    - Lecture (GET): Tout le monde (authentifié)
    - Écriture (PUT, PATCH, DELETE): Seulement le propriétaire
    
    ⚠️ IMPORTANT POUR LES AUTRES DÉVELOPPEURS:
    Réutilisez cette permission dans vos apps pour protéger les ressources:
    
    from apps.users.permissions import IsOwnerOrReadOnly
    
    class ProductViewSet(viewsets.ModelViewSet):
        permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    """
    
    def has_object_permission(self, request, view, obj):
        # Les méthodes de lecture sont autorisées pour tous
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Les méthodes d'écriture ne sont autorisées que pour le propriétaire
        # Gère à la fois les objets User et les objets avec un champ 'user'
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return obj == request.user


class IsVerifiedUser(permissions.BasePermission):
    """
    Permission : Seuls les utilisateurs vérifiés peuvent effectuer l'action
    Utile pour restreindre certaines fonctionnalités aux utilisateurs de confiance
    
    Exemple d'utilisation:
    class CreateTransactionView(APIView):
        permission_classes = [IsAuthenticated, IsVerifiedUser]
    """
    
    message = "Vous devez vérifier votre identité pour effectuer cette action."
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_verified


class IsOwner(permissions.BasePermission):
    """
    Permission stricte : L'utilisateur doit être le propriétaire
    Pas de lecture publique, uniquement le propriétaire peut accéder
    
    Exemple pour des données sensibles:
    class WalletView(APIView):
        permission_classes = [IsAuthenticated, IsOwner]
    """
    
    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return obj == request.user


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Permission : Seuls les admins peuvent modifier, tous peuvent lire
    Utile pour les ressources globales (catégories, settings, etc.)
    """
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff