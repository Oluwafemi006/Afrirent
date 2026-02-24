"""
Products Filters
Filtres personnalisés pour recherche et filtrage
"""
from django_filters import rest_framework as filters
from .models import Product


class ProductFilter(filters.FilterSet):
    category = filters.CharFilter(
        field_name='category__slug',
        label='Catégorie (slug)'
    )
    
    seller = filters.CharFilter(
        field_name='seller__username',
        label='Vendeur (username)'
    )
    
    status = filters.ChoiceFilter(
        choices=Product.STATUS_CHOICES,
        label='Statut'
    )
    
    condition = filters.ChoiceFilter(
        choices=Product.CONDITION_CHOICES,
        label='État du produit'
    )
    
    min_price = filters.NumberFilter(
        field_name='price',
        lookup_expr='gte',
        label='Prix minimum'
    )
    
    max_price = filters.NumberFilter(
        field_name='price',
        lookup_expr='lte',
        label='Prix maximum'
    )
    
    location = filters.CharFilter(
        field_name='location',
        lookup_expr='icontains',
        label='Localisation'
    )
    
    is_featured = filters.BooleanFilter(
        label='En vedette seulement'
    )
    
    class Meta:
        model = Product
        fields = [
            'status',
            'condition',
            'category',
            'seller',
            'is_featured',
        ]
