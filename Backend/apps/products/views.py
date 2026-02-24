"""
Products Views
APIs pour la gestion des produits
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Category, Product, ProductImage, Favorite, Cart, CartItem
from .serializers import (
    CategorySerializer,
    ProductListSerializer,
    ProductDetailSerializer,
    ProductCreateUpdateSerializer,
    FavoriteSerializer,
    CartItemSerializer,
    CartSerializer,
)
from .permissions import IsProductOwner
from .filters import ProductFilter


class CategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour les catégories
    GET: public (liste catégories actives)
    POST: authentifié (créer une nouvelle catégorie)
    """
    
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]
    
    def get_queryset(self):
        return Category.objects.filter(is_active=True).order_by('order')
    
    def perform_create(self, serializer):
        name = serializer.validated_data.get('name', '')
        slug = name.lower().replace(' ', '-').replace("'", '')
        import re
        slug = re.sub(r'[^a-z0-9-]', '', slug)
        serializer.save(slug=slug)


class ProductViewSet(viewsets.ModelViewSet):
    """
    ViewSet complet pour les produits
    
    Endpoints:
        GET    /api/products/                 - Liste tous les produits (avec filtres)
        POST   /api/products/                 - Créer un nouveau produit
        GET    /api/products/{id}/            - Détail d'un produit
        PUT    /api/products/{id}/            - Modifier un produit
        PATCH  /api/products/{id}/            - Modification partielle
        DELETE /api/products/{id}/            - Supprimer un produit
        GET    /api/products/my-products/     - Mes produits (vendeur)
        PATCH  /api/products/{id}/status/     - Changer le statut du produit
    """
    
    queryset = Product.objects.all()
    permission_classes = [AllowAny]
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'increment_views']:
            return [AllowAny()]
        elif self.action == 'create':
            return [IsAuthenticated()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsProductOwner()]
        return super().get_permissions()
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['title', 'description', 'location']
    ordering_fields = ['price', 'created_at', 'views_count']
    ordering = ['-created_at']  # Tri par défaut
    
    def get_serializer_class(self):
        """
        Utilise différents serializers selon l'action
        """
        if self.action == 'list':
            return ProductListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ProductCreateUpdateSerializer
        return ProductDetailSerializer
    
    def get_queryset(self):
        """
        Optimiser les requêtes avec select_related et prefetch_related
        """
        queryset = super().get_queryset()
        queryset = queryset.select_related(
            'seller',
            'category'
        ).prefetch_related('images')
        
        # Filtrer par statut 'actif' pour les utilisateurs non propriétaires
        # (sauf pour le endpoint /my-products/)
        if self.action != 'my_products':
            if not self.request.user.is_authenticated:
                queryset = queryset.filter(status='active')
            else:
                # L'utilisateur voit ses propres produits (quel que soit le statut)
                # ET les produits actifs des autres
                from django.db.models import Q
                queryset = queryset.filter(
                    Q(status='active') | Q(seller=self.request.user)
                )
        
        return queryset
    
    def perform_create(self, serializer):
        """
        Créer un produit avec le vendeur = utilisateur connecté
        """
        serializer.save(seller=self.request.user)
    
    def perform_update(self, serializer):
        """
        Vérifier que l'utilisateur modifie bien son propre produit
        """
        if serializer.instance.seller != self.request.user:
            self.permission_denied(self.request)
        serializer.save()
    
    @action(detail=False, methods=['get'], url_path='my-products', permission_classes=[IsAuthenticated])
    def my_products(self, request):
        """
        GET /api/products/my-products/
        Retourne tous mes produits (indépendamment du statut)
        """
        products = Product.objects.filter(
            seller=request.user
        ).select_related('category', 'seller').prefetch_related('images')
        
        # Appliquer les filtres
        filtered_products = self.filter_queryset(products)
        
        # Pagination
        page = self.paginate_queryset(filtered_products)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(filtered_products, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated, IsProductOwner])
    def status(self, request, pk=None):
        """
        PATCH /api/products/{id}/status/
        Changer le statut du produit
        Body: {"status": "sold"} ou "inactive"
        """
        product = self.get_object()
        
        # Vérifier les permissions
        self.check_object_permissions(request, product)
        
        new_status = request.data.get('status')
        if new_status not in dict(Product.STATUS_CHOICES):
            return Response(
                {'error': f'Statut invalide. Choix: {list(dict(Product.STATUS_CHOICES).keys())}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        product.status = new_status
        product.save(update_fields=['status', 'updated_at'])
        
        serializer = ProductDetailSerializer(product)
        return Response(
            {
                'message': f'Produit marqué comme {new_status}',
                'product': serializer.data
            },
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    def increment_views(self, request, pk=None):
        """
        POST /api/products/{id}/increment_views/
        Incrémenter le compteur de vues
        """
        product = self.get_object()
        session_key = f'viewed_product_{product.id}'
        if not request.session.get(session_key, False):
            product.increment_views()
            request.session[session_key] = True
        return Response(
            {'views_count': product.views_count},
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def upload_images(self, request, pk=None):
        """
        POST /api/products/{id}/upload_images/
        Uploader des images supplémentaires
        Body: {"images": [file1, file2, ...]}
        """
        product = self.get_object()
        
        # Vérifier les permissions
        if product.seller != request.user:
            return Response(
                {'error': 'Vous ne pouvez modifier que vos propres produits'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        files = request.FILES.getlist('images')
        if not files:
            return Response(
                {'error': 'Aucune image fournie'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        for f in files:
            if f.size > 5 * 1024 * 1024:
                return Response(
                    {'error': f'L\'image {f.name} dépasse 5 Mo'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Vérifier le nombre total d'images
        existing_count = product.images.count()
        if existing_count + len(files) > 5:
            return Response(
                {'error': f'Vous pouvez avoir max 5 images (actuellement {existing_count})'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Créer les images
        created_images = []
        for order, image in enumerate(files, start=existing_count):
            product_image = ProductImage.objects.create(
                product=product,
                image=image,
                order=order
            )
            created_images.append(product_image)
        
        serializer = ProductDetailSerializer(product)
        return Response(
            {
                'message': f'{len(created_images)} image(s) uploadée(s)',
                'product': serializer.data
            },
            status=status.HTTP_201_CREATED
        )


class FavoriteViewSet(viewsets.GenericViewSet):
    serializer_class = FavoriteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user).select_related('product__seller', 'product__category').prefetch_related('product__images')

    def list(self, request):
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='toggle/(?P<product_id>[^/.]+)')
    def toggle(self, request, product_id=None):
        try:
            product = Product.objects.get(pk=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Produit non trouvé'}, status=status.HTTP_404_NOT_FOUND)
        
        favorite, created = Favorite.objects.get_or_create(user=request.user, product=product)
        if not created:
            favorite.delete()
            return Response({'status': 'removed', 'is_favorited': False})
        return Response({'status': 'added', 'is_favorited': True}, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='check/(?P<product_id>[^/.]+)')
    def check(self, request, product_id=None):
        is_favorited = Favorite.objects.filter(user=request.user, product_id=product_id).exists()
        return Response({'is_favorited': is_favorited})


class CartViewSet(viewsets.GenericViewSet):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def _get_cart(self, user):
        cart, _ = Cart.objects.get_or_create(user=user)
        return cart

    def list(self, request):
        cart = self._get_cart(request.user)
        serializer = self.get_serializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='add/(?P<product_id>[^/.]+)')
    def add(self, request, product_id=None):
        try:
            product = Product.objects.get(pk=product_id, status='active')
        except Product.DoesNotExist:
            return Response({'error': 'Produit non trouvé ou indisponible'}, status=status.HTTP_404_NOT_FOUND)
        
        if product.seller == request.user:
            return Response({'error': 'Vous ne pouvez pas ajouter votre propre produit au panier'}, status=status.HTTP_400_BAD_REQUEST)
        
        cart = self._get_cart(request.user)
        _, created = CartItem.objects.get_or_create(cart=cart, product=product)
        if not created:
            return Response({'error': 'Produit déjà dans le panier'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = self.get_serializer(cart)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['delete'], url_path='remove/(?P<product_id>[^/.]+)')
    def remove(self, request, product_id=None):
        cart = self._get_cart(request.user)
        deleted, _ = CartItem.objects.filter(cart=cart, product_id=product_id).delete()
        if not deleted:
            return Response({'error': 'Produit non trouvé dans le panier'}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['delete'], url_path='clear')
    def clear(self, request):
        cart = self._get_cart(request.user)
        cart.items.all().delete()
        serializer = self.get_serializer(cart)
        return Response(serializer.data)
