"""
Core URLs
Routes pour les endpoints généraux de l'application
"""
from django.urls import path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Endpoint de santé pour vérifier que l'API fonctionne
    Utilisé par les outils de monitoring
    """
    return Response({
        'status': 'healthy',
        'message': 'AfriRent API is running',
        'version': '1.0.0'
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    """
    Point d'entrée de l'API avec liens vers toutes les ressources
    """
    return Response({
        'message': 'Bienvenue sur l\'API AfriRent',
        'version': '1.0.0',
        'endpoints': {
            'auth': {
                'register': '/api/auth/register/',
                'login': '/api/auth/login/',
                'logout': '/api/auth/logout/',
                'refresh': '/api/auth/token/refresh/',
                'me': '/api/auth/me/',
            },
            'users': {
                'list': '/api/auth/users/',
                'detail': '/api/auth/users/{id}/',
                'stats': '/api/auth/users/{id}/stats/',
                'verify': '/api/auth/users/verify/',
            },
            'documentation': {
                'swagger': '/swagger/',
                'redoc': '/redoc/',
            },
        }
    })


urlpatterns = [
    path('', api_root, name='api-root'),
    path('health/', health_check, name='health-check'),
]