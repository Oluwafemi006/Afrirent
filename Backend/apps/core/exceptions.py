"""
Core Exceptions
Gestion centralisée des erreurs pour AfriRent
"""
from rest_framework.views import exception_handler
from rest_framework.exceptions import APIException
from rest_framework import status


def custom_exception_handler(exc, context):
    """
    Gestionnaire d'exceptions personnalisé
    Retourne des erreurs formatées de manière cohérente
    """
    # Appeler le gestionnaire par défaut de DRF
    response = exception_handler(exc, context)
    
    if response is not None:
        # Formatter la réponse d'erreur
        custom_response = {
            'error': {
                'status_code': response.status_code,
                'message': _get_error_message(response.data),
                'details': response.data if isinstance(response.data, dict) else {}
            }
        }
        response.data = custom_response
    
    return response


def _get_error_message(data):
    """Extrait le message d'erreur principal"""
    if isinstance(data, dict):
        # Chercher le premier message d'erreur
        for key, value in data.items():
            if isinstance(value, list) and len(value) > 0:
                return f"{key}: {value[0]}"
            elif isinstance(value, str):
                return f"{key}: {value}"
        return "Une erreur est survenue"
    elif isinstance(data, list) and len(data) > 0:
        return str(data[0])
    return str(data)


class ServiceUnavailable(APIException):
    """Exception pour les services temporairement indisponibles"""
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    default_detail = "Service temporairement indisponible"
    default_code = 'service_unavailable'


class PaymentRequired(APIException):
    """Exception pour les actions nécessitant un paiement"""
    status_code = status.HTTP_402_PAYMENT_REQUIRED
    default_detail = "Paiement requis pour cette action"
    default_code = 'payment_required'


class ResourceConflict(APIException):
    """Exception pour les conflits de ressources"""
    status_code = status.HTTP_409_CONFLICT
    default_detail = "Conflit avec une ressource existante"
    default_code = 'resource_conflict'