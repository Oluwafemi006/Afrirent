"""
Products Serializers
Sérialisation des modèles Product et Category
"""
from rest_framework import serializers
from .models import Category, Product, ProductImage, Favorite, Cart, CartItem
from apps.users.serializers import UserMinimalSerializer


class CategorySerializer(serializers.ModelSerializer):
    products_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = [
            'id',
            'name',
            'slug',
            'description',
            'icon',
            'products_count',
            'is_active',
        ]
        read_only_fields = ['id', 'slug', 'products_count']
        extra_kwargs = {
            'is_active': {'required': False},
            'description': {'required': False},
            'icon': {'required': False},
        }
    
    def get_products_count(self, obj):
        return obj.products.filter(status='active').count()


class CategoryMinimalSerializer(serializers.ModelSerializer):
    """Sérialiser une catégorie minimale (pour relations)"""
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'icon']


class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'order']

    def get_image(self, obj):
        return obj.image.url




class ProductListSerializer(serializers.ModelSerializer):
    """
    Sérialiser un produit (vue liste)
    Données minimales pour affichage en liste
    """
    seller = UserMinimalSerializer(read_only=True)
    category = CategoryMinimalSerializer(read_only=True)
    main_image = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id',
            'title',
            'price',
            'location',
            'condition',
            'status',
            'main_image',
            'seller',
            'category',
            'is_featured',
            'views_count',
            'created_at',
        ]
    
    def get_main_image(self, obj):
        """Retourne la première image"""
        image = obj.main_image
        if image:
            return ProductImageSerializer(image).data
        return None


class ProductDetailSerializer(serializers.ModelSerializer):
    """
    Sérialiser un produit (vue détail)
    Données complètes avec images et infos vendeur
    """
    seller = UserMinimalSerializer(read_only=True)
    category = CategoryMinimalSerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    seller_stats = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id',
            'title',
            'description',
            'price',
            'location',
            'condition',
            'status',
            'category',
            'images',
            'seller',
            'seller_stats',
            'views_count',
            'is_featured',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'seller',
            'views_count',
            'created_at',
            'updated_at',
        ]
    
    def get_seller_stats(self, obj):
        """Retourne les statistiques du vendeur"""
        return {
            'username': obj.seller.username,
            'is_verified': obj.seller.is_verified,
            'avatar': obj.seller.avatar_url,
            'member_since': obj.seller.date_joined,
        }


class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Sérialiser un produit (création/modification)
    Accepte les images et crée les ProductImage associées
    """
    images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False,
        help_text="Liste d'images à uploader (max 5 images)"
    )
    
    class Meta:
        model = Product
        fields = [
            'title',
            'description',
            'price',
            'location',
            'condition',
            'category',
            'images',
        ]
    
    def validate_price(self, value):
        """Valider que le prix est > 0"""
        if value <= 0:
            raise serializers.ValidationError("Le prix doit être supérieur à 0.")
        return value
    
    def validate_images(self, value):
        """Valider le nombre d'images (max 5)"""
        if len(value) > 5:
            raise serializers.ValidationError("Maximum 5 images autorisées par produit.")
        for img in value:
            if img.size > 5 * 1024 * 1024:
                raise serializers.ValidationError(f"L'image {img.name} dépasse 5 Mo.")
        return value
    
    def create(self, validated_data):
        """Créer le produit et ses images"""
        images_data = validated_data.pop('images', [])
        
        # Ajouter le vendeur (utilisateur connecté)
        validated_data['seller'] = self.context['request'].user
        
        # Créer le produit
        product = Product.objects.create(**validated_data)
        
        # Créer les images
        for order, image in enumerate(images_data):
            ProductImage.objects.create(
                product=product,
                image=image,
                order=order
            )
        
        return product
    
    def update(self, instance, validated_data):
        """Mettre à jour le produit (images gérées séparément)"""
        images_data = validated_data.pop('images', None)
        
        # Mettre à jour les champs du produit
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Si nouvelles images fournies, les ajouter
        if images_data is not None:
            # Supprimer les anciennes images
            instance.images.all().delete()
            
            # Créer les nouvelles
            for order, image in enumerate(images_data):
                ProductImage.objects.create(
                    product=instance,
                    image=image,
                    order=order
                )
        
        return instance


class FavoriteSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)

    class Meta:
        model = Favorite
        fields = ['id', 'product', 'created_at']
        read_only_fields = ['id', 'created_at']


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'added_at']
        read_only_fields = ['id', 'added_at']


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.ReadOnlyField()
    items_count = serializers.ReadOnlyField()

    class Meta:
        model = Cart
        fields = ['id', 'items', 'total', 'items_count', 'updated_at']
