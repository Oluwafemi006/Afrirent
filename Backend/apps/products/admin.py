"""
Products Admin
Configuration de l'interface admin Django
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import Category, Product, ProductImage, Favorite, Cart, CartItem


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """Admin pour les catégories"""
    list_display = ['name', 'slug', 'products_count', 'is_active', 'order']
    list_editable = ['is_active', 'order']
    search_fields = ['name']
    prepopulated_fields = {'slug': ('name',)}
    list_filter = ['is_active', 'created_at']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Informations', {
            'fields': ('name', 'slug', 'description', 'icon')
        }),
        ('Configuration', {
            'fields': ('is_active', 'order')
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def products_count(self, obj):
        """Afficher le nombre de produits dans la catégorie"""
        count = obj.products.filter(status='active').count()
        return f"{count} produit(s)"
    products_count.short_description = "Produits actifs"


class ProductImageInline(admin.TabularInline):
    """Inline admin pour les images de produit"""
    model = ProductImage
    extra = 1
    fields = ['image', 'order', 'image_preview']
    readonly_fields = ['image_preview', 'uploaded_at']
    
    def image_preview(self, obj):
        """Afficher un aperçu de l'image"""
        if obj.image:
            return format_html(
                '<img src="{}" width="100" height="100" />',
                obj.image.url
            )
        return "-"
    image_preview.short_description = "Aperçu"


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """Admin pour les produits"""
    list_display = [
        'title_short',
        'seller_username',
        'price_display',
        'status_badge',
        'condition',
        'views_count',
        'is_featured',
        'created_at'
    ]
    list_filter = ['status', 'condition', 'category', 'is_featured', 'created_at']
    search_fields = ['title', 'description', 'seller__username']
    readonly_fields = ['views_count', 'created_at', 'updated_at', 'image_preview']
    
    fieldsets = (
        ('Informations du produit', {
            'fields': ('title', 'description', 'category', 'price', 'condition')
        }),
        ('Vendeur & Localisation', {
            'fields': ('seller', 'location')
        }),
        ('Statut & Visibilité', {
            'fields': ('status', 'is_featured', 'featured_until')
        }),
        ('Statistiques', {
            'fields': ('views_count', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [ProductImageInline]
    
    def title_short(self, obj):
        """Afficher le titre raccourci"""
        return obj.title[:50] + '...' if len(obj.title) > 50 else obj.title
    title_short.short_description = "Titre"
    
    def seller_username(self, obj):
        """Afficher le username du vendeur"""
        return obj.seller.username
    seller_username.short_description = "Vendeur"
    
    def price_display(self, obj):
        """Afficher le prix formaté"""
        return f"{obj.price:,.0f} FCFA"
    price_display.short_description = "Prix"
    
    def status_badge(self, obj):
        """Afficher le statut avec couleur"""
        colors = {
            'active': '#28a745',
            'sold': '#6c757d',
            'inactive': '#dc3545',
            'pending': '#ffc107',
        }
        color = colors.get(obj.status, '#6c757d')
        return format_html(
            '<span style="padding: 3px 8px; background-color: {}; color: white; '
            'border-radius: 3px;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = "Statut"
    
    def image_preview(self, obj):
        """Afficher la première image du produit"""
        image = obj.main_image
        if image and image.image:
            return format_html(
                '<img src="{}" width="300" />',
                image.image.url
            )
        return "Aucune image"
    image_preview.short_description = "Aperçu de l'image principale"
    
    actions = ['mark_as_sold', 'mark_as_active', 'mark_as_inactive']
    
    def mark_as_sold(self, request, queryset):
        """Action: marquer comme vendu"""
        updated = queryset.update(status='sold')
        self.message_user(request, f"{updated} produit(s) marqué(s) comme vendu(s)")
    mark_as_sold.short_description = "Marquer comme vendu"
    
    def mark_as_active(self, request, queryset):
        """Action: réactiver"""
        updated = queryset.update(status='active')
        self.message_user(request, f"{updated} produit(s) réactivé(s)")
    mark_as_active.short_description = "Réactiver"
    
    def mark_as_inactive(self, request, queryset):
        """Action: désactiver"""
        updated = queryset.update(status='inactive')
        self.message_user(request, f"{updated} produit(s) désactivé(s)")
    mark_as_inactive.short_description = "Désactiver"


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    """Admin pour les images de produit"""
    list_display = ['product_title', 'order', 'image_preview', 'uploaded_at']
    list_filter = ['product', 'uploaded_at']
    search_fields = ['product__title']
    readonly_fields = ['image_preview', 'uploaded_at']
    
    def product_title(self, obj):
        """Afficher le titre du produit"""
        return obj.product.title
    product_title.short_description = "Produit"
    
    def image_preview(self, obj):
        """Afficher un aperçu de l'image"""
        if obj.image:
            return format_html(
                '<img src="{}" width="150" height="150" />',
                obj.image.url
            )
        return "Pas d'image"
    image_preview.short_description = "Aperçu"


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ['user', 'product', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'product__title']
    readonly_fields = ['created_at']


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ['added_at']


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ['user', 'items_count', 'created_at', 'updated_at']
    search_fields = ['user__username']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [CartItemInline]

    def items_count(self, obj):
        return obj.items.count()
    items_count.short_description = "Nombre d'articles"


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ['cart', 'product', 'added_at']
    list_filter = ['added_at']
    search_fields = ['cart__user__username', 'product__title']
    readonly_fields = ['added_at']
