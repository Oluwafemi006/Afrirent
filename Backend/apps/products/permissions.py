"""
Products Permissions
Permissions personnalisées pour l'app products
"""
from rest_framework import permissions


class IsProductOwner(permissions.BasePermission):
    """
    Permet à l'utilisateur de ne modifier que ses propres produits
    """
    
    message = "Vous ne pouvez modifier que vos propres produits."
    
    def has_object_permission(self, request, view, obj):
        # Lecture autorisée pour tous
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Modification/suppression: seulement propriétaire
        return obj.seller == request.user
