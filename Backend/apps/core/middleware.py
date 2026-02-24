"""
Core Middleware
Middleware personnalisés pour AfriRent
"""
import logging
import time
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware(MiddlewareMixin):
    """
    Middleware pour logger toutes les requêtes API
    Utile pour le debugging et le monitoring
    """
    
    def process_request(self, request):
        """Enregistre le début de la requête"""
        request.start_time = time.time()
        
        # Logger les infos de la requête
        logger.info(
            f"REQUEST: {request.method} {request.path} "
            f"from {self.get_client_ip(request)}"
        )
        
    def process_response(self, request, response):
        """Enregistre la fin de la requête avec le temps d'exécution"""
        if hasattr(request, 'start_time'):
            duration = time.time() - request.start_time
            logger.info(
                f"RESPONSE: {request.method} {request.path} "
                f"- Status: {response.status_code} "
                f"- Duration: {duration:.2f}s"
            )
        
        return response
    
    @staticmethod
    def get_client_ip(request):
        """Récupère l'IP réelle du client (gère les proxies)"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class PerformanceMonitoringMiddleware(MiddlewareMixin):
    """
    Middleware pour monitorer les performances
    Alerte si une requête prend trop de temps
    """
    
    SLOW_REQUEST_THRESHOLD = 2.0  # secondes
    
    def process_request(self, request):
        request.start_time = time.time()
    
    def process_response(self, request, response):
        if hasattr(request, 'start_time'):
            duration = time.time() - request.start_time
            
            if duration > self.SLOW_REQUEST_THRESHOLD:
                logger.warning(
                    f"⚠️ SLOW REQUEST: {request.method} {request.path} "
                    f"took {duration:.2f}s (threshold: {self.SLOW_REQUEST_THRESHOLD}s)"
                )
        
        return response