"""
AfriRent Development Settings
Configuration pour l'environnement de développement
"""
from .base import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['*']

# Database - PostgreSQL pour développement
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME', default='afrirent_db'),
        'USER': config('DB_USER', default='afrirent_user'),
        'PASSWORD': config('DB_PASSWORD', default='afrirent2024'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432'),
    }
}


# Configuration Cloudinary pour dev
CLOUDINARY = {
    'cloud_name': config('CLOUDINARY_CLOUD_NAME'),
    'api_key': config('CLOUDINARY_API_KEY'),
    'api_secret': config('CLOUDINARY_API_SECRET'),
}

DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'



# CORS - Autoriser le frontend React en dev
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite default port
    "http://localhost:3000",  # Alternative React port
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

# Pour faciliter le dev, autoriser tous les origins (à retirer en prod)
CORS_ALLOW_ALL_ORIGINS = True

# Debug Toolbar (optionnel)
if DEBUG:
    INSTALLED_APPS += ['django_extensions']
    
# Logging pour développement
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'apps': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}

# Cache simple pour dev
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    }
}