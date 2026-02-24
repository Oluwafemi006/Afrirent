"""
Users Views - FICHIER COMPLET
Toutes les vues pour l'authentification et la gestion des utilisateurs
"""
from rest_framework import viewsets, status, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import authenticate
from django.utils import timezone
import logging

from .models import User, Profile
from .serializers import (
    UserSerializer,
    UserMinimalSerializer,
    RegisterSerializer,
    UserUpdateSerializer,
    VerifyIdentitySerializer,
    UserStatsSerializer,
)
from .permissions import IsOwnerOrReadOnly

logger = logging.getLogger(__name__)


# =============================================================================
# PARTIE 1 : AUTHENTIFICATION (Register, Login, Logout, Me)
# =============================================================================

class RegisterView(generics.CreateAPIView):
    """
    POST /api/auth/register/
    
    Inscription d'un nouvel utilisateur
    
    Body JSON:
    {
        "username": "johndoe",
        "email": "john@example.com",
        "password": "SecurePass123!",
        "password_confirm": "SecurePass123!",
        "first_name": "John",
        "last_name": "Doe"
    }
    
    Response 201:
    {
        "user": {...},
        "tokens": {
            "refresh": "...",
            "access": "..."
        },
        "message": "Compte créé avec succès"
    }
    """
    
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Générer les tokens JWT
        refresh = RefreshToken.for_user(user)
        
        # Sérialiser l'utilisateur créé
        user_serializer = UserSerializer(user)
        
        logger.info(f"✅ Nouvel utilisateur inscrit: {user.username}")
        
        return Response({
            'user': user_serializer.data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'Compte créé avec succès'
        }, status=status.HTTP_201_CREATED)


class LoginView(TokenObtainPairView):
    """
    POST /api/auth/login/
    
    Connexion utilisateur (JWT)
    
    Body JSON:
    {
        "username": "johndoe",  // ou email
        "password": "SecurePass123!"
    }
    
    Response 200:
    {
        "user": {...},
        "tokens": {
            "refresh": "...",
            "access": "..."
        },
        "message": "Connexion réussie"
    }
    """
    
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response({
                'error': 'Username/email et mot de passe requis'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Permettre la connexion avec email ou username
        user = None
        if '@' in username:
            # Tentative de connexion avec email
            try:
                user_obj = User.objects.get(email=username.lower())
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                pass
        else:
            # Connexion avec username
            user = authenticate(username=username, password=password)
        
        if user is None:
            return Response({
                'error': 'Identifiants incorrects'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Générer les tokens
        refresh = RefreshToken.for_user(user)
        
        # Sérialiser l'utilisateur
        user_serializer = UserSerializer(user)
        
        logger.info(f"✅ Connexion réussie: {user.username}")
        
        return Response({
            'user': user_serializer.data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'Connexion réussie'
        }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    POST /api/auth/logout/
    
    Déconnexion utilisateur (blacklist du refresh token)
    
    Body JSON:
    {
        "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
    }
    
    Response 200:
    {
        "message": "Déconnexion réussie"
    }
    """
    try:
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({
                'error': 'Refresh token requis'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        token = RefreshToken(refresh_token)
        token.blacklist()
        
        logger.info(f"✅ Déconnexion: {request.user.username}")
        
        return Response({
            'message': 'Déconnexion réussie'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"❌ Erreur lors de la déconnexion: {str(e)}")
        return Response({
            'error': 'Token invalide'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    """
    GET /api/auth/me/
    
    Récupère les informations de l'utilisateur connecté
    
    Response 200:
    {
        "id": 1,
        "username": "johndoe",
        "email": "john@example.com",
        "full_name": "John Doe",
        "avatar_url": "https://...",
        "is_verified": false,
        "profile": {...}
    }
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


# =============================================================================
# PARTIE 2 : GESTION UTILISATEURS (CRUD, Stats, Vérification)
# =============================================================================

class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour la gestion des utilisateurs
    
    Endpoints:
    - GET /api/auth/users/ - Liste des utilisateurs
    - GET /api/auth/users/{id}/ - Détail d'un utilisateur
    - PUT /api/auth/users/{id}/ - Modifier son profil (owner only)
    - PATCH /api/auth/users/{id}/ - Modification partielle
    - DELETE /api/auth/users/{id}/ - Supprimer son compte (owner only)
    
    Actions custom:
    - POST /api/auth/users/verify/ - Upload document d'identité
    - GET /api/auth/users/{id}/stats/ - Statistiques utilisateur
    - POST /api/auth/users/{id}/approve_verification/ - [ADMIN] Approuver vérification
    """
    
    queryset = User.objects.select_related('profile').all()
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_serializer_class(self):
        """Retourne le serializer approprié selon l'action"""
        if self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        elif self.action == 'list':
            return UserMinimalSerializer
        return UserSerializer
    
    def get_queryset(self):
        """
        Optimise les requêtes avec select_related
        Filtre optionnel par is_verified
        """
        queryset = super().get_queryset()
        
        # Filtre optionnel: ?verified=true
        verified = self.request.query_params.get('verified')
        if verified is not None:
            is_verified = verified.lower() == 'true'
            queryset = queryset.filter(is_verified=is_verified)
        
        # Recherche par username ou email
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                username__icontains=search
            ) | queryset.filter(
                email__icontains=search
            )
        
        return queryset
    
    def update(self, request, *args, **kwargs):
        """
        PUT /api/auth/users/{id}/
        
        Mise à jour complète du profil (User + Profile)
        
        Body JSON:
        {
            "first_name": "John",
            "last_name": "Doe",
            "bio": "Passionné de location...",
            "avatar": <file>,
            "phone_number": "+22912345678",
            "address": "Cotonou, Akpakpa",
            "dob": "1990-01-15"
        }
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Retourner le user complet après mise à jour
        user_serializer = UserSerializer(instance)
        
        logger.info(f"✏️ Profil mis à jour: {instance.username}")
        
        return Response(user_serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        """
        DELETE /api/auth/users/{id}/
        
        Suppression du compte
        """
        instance = self.get_object()
        username = instance.username
        self.perform_destroy(instance)
        
        logger.warning(f"🗑️ Compte supprimé: {username}")
        
        return Response({
            'message': 'Compte supprimé avec succès'
        }, status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def verify(self, request):
        """
        POST /api/auth/users/verify/
        
        Upload d'un document d'identité pour vérification
        
        Body (multipart/form-data):
        - identity_document: <file> (CNI ou Passeport, max 5MB)
        
        Response 200:
        {
            "message": "Document envoyé avec succès",
            "status": "pending_verification"
        }
        """
        serializer = VerifyIdentitySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Sauvegarder le document dans le profil
        profile = request.user.profile
        profile.identity_document = serializer.validated_data['identity_document']
        profile.save()
        
        logger.info(f"📄 Document d'identité uploadé: {request.user.username}")
        
        return Response({
            'message': 'Document envoyé avec succès. Vérification en cours.',
            'status': 'pending_verification',
            'user': UserSerializer(request.user).data
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def stats(self, request, pk=None):
        """
        GET /api/auth/users/{id}/stats/
        
        Récupère les statistiques d'un utilisateur
        
        Response 200:
        {
            "products_count": 5,
            "reviews_count": 12,
            "transactions_count": 8,
            "is_verified": true,
            "member_since": "2024-01-15T10:30:00Z"
        }
        """
        user = self.get_object()
        stats = user.get_stats()
        serializer = UserStatsSerializer(stats)
        
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def approve_verification(self, request, pk=None):
        """
        POST /api/auth/users/{id}/approve_verification/
        
        [ADMIN ONLY] Approuver la vérification d'identité
        
        Endpoint réservé aux administrateurs pour valider manuellement
        les documents d'identité uploadés par les utilisateurs
        """
        if not request.user.is_staff:
            return Response({
                'error': 'Vous devez être administrateur'
            }, status=status.HTTP_403_FORBIDDEN)
        
        user = self.get_object()
        
        if not user.profile.identity_document:
            return Response({
                'error': 'Aucun document à vérifier'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Approuver la vérification
        user.is_verified = True
        user.profile.identity_verified_at = timezone.now()
        user.save()
        user.profile.save()
        
        logger.info(f"✅ Vérification approuvée: {user.username} par {request.user.username}")
        
        return Response({
            'message': 'Vérification approuvée avec succès',
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)