"""
Products URL Configuration
"""
from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import CategoryViewSet, ProductViewSet, FavoriteViewSet, CartViewSet

category_router = SimpleRouter()
category_router.register(r'categories', CategoryViewSet, basename='category')

favorite_router = SimpleRouter()
favorite_router.register(r'favorites', FavoriteViewSet, basename='favorite')

cart_router = SimpleRouter()
cart_router.register(r'cart', CartViewSet, basename='cart')

product_router = SimpleRouter()
product_router.register(r'', ProductViewSet, basename='product')

urlpatterns = [
    path('', include(category_router.urls)),
    path('', include(favorite_router.urls)),
    path('', include(cart_router.urls)),
    path('', include(product_router.urls)),
]
