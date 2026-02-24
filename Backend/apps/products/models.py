"""
Products Models
Modèles pour la gestion des produits/annonces AfriRent
"""
from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _
from cloudinary.models import CloudinaryField

User = get_user_model()


class Category(models.Model):
    """
    Catégorie de produits
    Exemple: Électronique, Vêtements, Meubles, etc.
    
    Champs:
        - name: Nom de la catégorie (unique)
        - slug: URL-friendly identifier
        - description: Description détaillée
        - icon: Icône de la catégorie
        - order: Ordre d'affichage
        - is_active: Activée/Désactivée
        - created_at: Date de création
        - updated_at: Dernière mise à jour
    """
    
    name = models.CharField(
        _('nom'),
        max_length=100,
        unique=True,
        help_text=_("Nom unique de la catégorie")
    )
    
    slug = models.SlugField(
        _('slug'),
        unique=True,
        help_text=_("Identifiant URL-friendly")
    )
    
    description = models.TextField(
        _('description'),
        blank=True,
        help_text=_("Description détaillée de la catégorie")
    )
    
    icon = models.CharField(
        _('icône'),
        max_length=50,
        blank=True,
        help_text=_("Nom icône Lucide React (ex: 'ShoppingBag', 'Smartphone')")
    )
    
    order = models.PositiveIntegerField(
        _('ordre'),
        default=0,
        help_text=_("Position d'affichage dans la liste")
    )
    
    is_active = models.BooleanField(
        _('active'),
        default=True,
        help_text=_("Afficher cette catégorie")
    )
    
    created_at = models.DateTimeField(_('créée le'), auto_now_add=True)
    updated_at = models.DateTimeField(_('modifiée le'), auto_now=True)
    
    class Meta:
        verbose_name = _('catégorie')
        verbose_name_plural = _('catégories')
        ordering = ['order', 'name']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return self.name


class Product(models.Model):
    """
    Produit/Annonce
    Article mis en vente par un utilisateur
    
    Champs:
        - seller: Utilisateur vendeur (ForeignKey)
        - category: Catégorie du produit
        - title: Titre de l'annonce
        - description: Description détaillée
        - price: Prix en FCFA
        - status: État du produit (actif, vendu, inactif)
        - condition: État physique (nouveau, bon, acceptable)
        - location: Localisation du produit
        - views_count: Nombre de vues
        - created_at: Date de création
        - updated_at: Dernière mise à jour
        - is_featured: En vedette (payant)
    """
    
    STATUS_CHOICES = [
        ('active', _('Actif')),
        ('sold', _('Vendu')),
        ('inactive', _('Inactif')),
        ('pending', _('En attente')),
    ]
    
    CONDITION_CHOICES = [
        ('new', _('Neuf')),
        ('good', _('Bon état')),
        ('fair', _('État acceptable')),
        ('damaged', _('Endommagé')),
    ]
    
    # Relations
    seller = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='products',
        verbose_name=_('vendeur')
    )
    
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        related_name='products',
        verbose_name=_('catégorie')
    )
    
    # Informations du produit
    title = models.CharField(
        _('titre'),
        max_length=200,
        help_text=_("Titre attrayant de l'annonce (200 caractères max)")
    )
    
    description = models.TextField(
        _('description'),
        help_text=_("Description détaillée du produit")
    )
    
    price = models.DecimalField(
        _('prix'),
        max_digits=10,
        decimal_places=0,
        validators=[MinValueValidator(0)],
        help_text=_("Prix en FCFA")
    )
    
    status = models.CharField(
        _('statut'),
        max_length=20,
        choices=STATUS_CHOICES,
        default='active',
        help_text=_("État actuel de l'annonce")
    )
    
    condition = models.CharField(
        _('état du produit'),
        max_length=20,
        choices=CONDITION_CHOICES,
        default='good',
        help_text=_("Condition physique du produit")
    )
    
    location = models.CharField(
        _('localisation'),
        max_length=200,
        help_text=_("Lieu où se trouve le produit (quartier, ville)")
    )
    
    # Statistiques
    views_count = models.PositiveIntegerField(
        _('nombre de vues'),
        default=0
    )
    
    # Vedette
    is_featured = models.BooleanField(
        _('en vedette'),
        default=False,
        help_text=_("Affichage prioritaire dans les listes")
    )
    featured_until = models.DateTimeField(
        _('vedette jusqu\'au'),
        null=True,
        blank=True,
        help_text=_("Date d'expiration du statut vedette")
    )
    
    # Timestamps
    created_at = models.DateTimeField(_('créé le'), auto_now_add=True)
    updated_at = models.DateTimeField(_('modifié le'), auto_now=True)
    
    class Meta:
        verbose_name = _('produit')
        verbose_name_plural = _('produits')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['seller', 'status']),
            models.Index(fields=['category', 'status']),
            models.Index(fields=['status']),
            models.Index(fields=['-created_at']),
            models.Index(fields=['price']),
        ]
    
    def __str__(self):
        return self.title
    
    @property
    def is_available(self):
        """Vérif si le produit est disponible à la vente"""
        return self.status == 'active'
    
    @property
    def main_image(self):
        """Retourne la première image du produit"""
        return self.images.first()
    
    @property
    def main_image_url(self):
        """Retourne l'URL de la première image"""
        image = self.main_image
        return image.image.url if image else None
    
    def increment_views(self):
        """Incrémente le compteur de vues"""
        self.views_count += 1
        self.save(update_fields=['views_count'])


class ProductImage(models.Model):
    """
    Image du produit
    Un produit peut avoir plusieurs images
    
    Champs:
        - product: Lien vers le produit
        - image: Image stockée sur Cloudinary
        - order: Ordre d'affichage (1ère image = principale)
        - uploaded_at: Date d'upload
    """
    
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='images',
        verbose_name=_('produit')
    )
    
    image = CloudinaryField(
        _('image'),
        folder='afrirent/products',
        transformation={
            'width': 800,
            'height': 800,
            'crop': 'fill',
            'quality': 'auto',
        },
        help_text=_("Image du produit (max 5 Mo)")
    )
    
    order = models.PositiveIntegerField(
        _('ordre'),
        default=0,
        help_text=_("Ordre d'affichage (0 = première image)")
    )
    
    uploaded_at = models.DateTimeField(_('uploadée le'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('image de produit')
        verbose_name_plural = _('images de produit')
        ordering = ['order', 'uploaded_at']
        unique_together = [['product', 'order']]  # Une image par ordre par produit
    
    def __str__(self):
        return f"Image de {self.product.title}"


class Favorite(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='favorites',
        verbose_name=_('utilisateur')
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='favorited_by',
        verbose_name=_('produit')
    )
    created_at = models.DateTimeField(_('ajouté le'), auto_now_add=True)

    class Meta:
        verbose_name = _('favori')
        verbose_name_plural = _('favoris')
        unique_together = [['user', 'product']]
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.product.title}"


class Cart(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='cart',
        verbose_name=_('utilisateur')
    )
    created_at = models.DateTimeField(_('créé le'), auto_now_add=True)
    updated_at = models.DateTimeField(_('modifié le'), auto_now=True)

    class Meta:
        verbose_name = _('panier')
        verbose_name_plural = _('paniers')

    def __str__(self):
        return f"Panier de {self.user.username}"

    @property
    def total(self):
        return sum(item.product.price for item in self.items.select_related('product').all())

    @property
    def items_count(self):
        return self.items.count()


class CartItem(models.Model):
    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name=_('panier')
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='in_carts',
        verbose_name=_('produit')
    )
    added_at = models.DateTimeField(_('ajouté le'), auto_now_add=True)

    class Meta:
        verbose_name = _('article du panier')
        verbose_name_plural = _('articles du panier')
        unique_together = [['cart', 'product']]

    def __str__(self):
        return f"{self.product.title} dans panier de {self.cart.user.username}"
