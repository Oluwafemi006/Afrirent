# AfriRent URL Configuration

from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from django.conf import settings
from django.conf.urls.static import static
from decouple import config

# drf-spectacular → Swagger moderne et sans bug
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

# Admin URL configurable pour plus de sécurité (Security through obscurity)
ADMIN_URL = config('ADMIN_URL', default='admin/')
if not ADMIN_URL.endswith('/'):
    ADMIN_URL += '/'

urlpatterns = [
    # Racine → Swagger direct (plus jamais 404)
    path('', RedirectView.as_view(url='/swagger/', permanent=False)),

    # Documentation API (super beau, rapide, à jour)
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('swagger/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # Admin & API
    path(ADMIN_URL, admin.site.urls),
    path('api/', include('apps.core.urls')),
    path('api/auth/', include('apps.users.urls')),
    path('api/products/', include('apps.products.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Personnalisation Admin
admin.site.site_header = "AfriRent Administration"
admin.site.site_title = "AfriRent Admin"
admin.site.index_title = "Bienvenue sur AfriRent"