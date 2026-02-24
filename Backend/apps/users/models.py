"""
Users Models
Modèles pour la gestion des utilisateurs AfriRent
"""
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
from django.utils.translation import gettext_lazy as _
from cloudinary.models import CloudinaryField


class User(AbstractUser):
    """
    Modèle User personnalisé
    Extends AbstractUser pour ajouter des champs spécifiques à AfriRent
    
    Champs:
        - username: Nom d'utilisateur unique (hérité)
        - email: Email unique (override pour le rendre obligatoire)
        - avatar: Photo de profil (Cloudinary)
        - is_verified: Indique si l'identité est vérifiée
        - bio: Biographie de l'utilisateur
        - date_joined: Date d'inscription (hérité)
        - last_login: Dernière connexion (hérité)
    
    Relations:
        - profile: OneToOne vers Profile (créé automatiquement via signal)
    """
    
    # Override email pour le rendre unique et obligatoire
    email = models.EmailField(
        _('email address'),
        unique=True,
        error_messages={
            'unique': _("Un utilisateur avec cet email existe déjà."),
        }
    )
    
    # Avatar stocké sur Cloudinary
    avatar = CloudinaryField(
        'avatar',
        blank=True,
        null=True,
        folder='afrirent/avatars',
        transformation={
            'width': 400,
            'height': 400,
            'crop': 'fill',
            'gravity': 'face',
            'quality': 'auto',
        }
    )
    
    # Vérification d'identité
    is_verified = models.BooleanField(
        _('vérifié'),
        default=False,
        help_text=_("Indique si l'identité de l'utilisateur a été vérifiée")
    )
    
    # Biographie
    bio = models.TextField(
        _('biographie'),
        blank=True,
        max_length=500,
        help_text=_("Décrivez-vous en quelques mots (500 caractères max)")
    )
    
    class Meta:
        verbose_name = _('utilisateur')
        verbose_name_plural = _('utilisateurs')
        ordering = ['-date_joined']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['username']),
            models.Index(fields=['is_verified']),
        ]
    
    def __str__(self):
        return self.username
    
    @property
    def full_name(self):
        """Retourne le nom complet ou le username si vide"""
        if self.first_name or self.last_name:
            return f"{self.first_name} {self.last_name}".strip()
        return self.username
    
    @property
    def avatar_url(self):
        """Retourne l'URL de l'avatar ou une image par défaut"""
        if self.avatar:
            return self.avatar.url
        return f"https://ui-avatars.com/api/?name={self.username}&size=400&background=6366f1&color=fff"
    
    def get_stats(self):
        """
        Retourne les statistiques de l'utilisateur
        Utilisé par l'endpoint /users/{id}/stats/
        """
        return {
            'products_count': getattr(self, 'products', []).count() if hasattr(self, 'products') else 0,
            'reviews_count': getattr(self, 'reviews_received', []).count() if hasattr(self, 'reviews_received') else 0,
            'transactions_count': getattr(self, 'transactions_as_buyer', []).count() + 
                                 getattr(self, 'transactions_as_seller', []).count() if hasattr(self, 'transactions_as_buyer') else 0,
            'is_verified': self.is_verified,
            'member_since': self.date_joined,
        }


class Profile(models.Model):
    """
    Profil utilisateur
    Informations complémentaires liées au User
    Créé automatiquement via signal post_save sur User
    
    Champs:
        - user: Lien OneToOne vers User
        - phone_number: Numéro de téléphone
        - address: Adresse complète
        - dob: Date de naissance
        - identity_document: Document d'identité (CNI/Passeport)
        - identity_verified_at: Date de vérification
        - created_at: Date de création du profil
        - updated_at: Dernière mise à jour
    """
    
    # Validation du numéro de téléphone (format international)
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Le numéro de téléphone doit être au format: '+229XXXXXXXXX'. 9 à 15 chiffres autorisés."
    )
    
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile',
        verbose_name=_('utilisateur')
    )
    
    phone_number = models.CharField(
        _('numéro de téléphone'),
        validators=[phone_regex],
        max_length=17,
        blank=True,
        help_text=_("Format: +229XXXXXXXXX")
    )
    
    address = models.TextField(
        _('adresse'),
        blank=True,
        help_text=_("Adresse complète (rue, quartier, ville)")
    )
    
    dob = models.DateField(
        _('date de naissance'),
        null=True,
        blank=True,
        help_text=_("Format: AAAA-MM-JJ")
    )
    
    # Document d'identité pour vérification
    identity_document = CloudinaryField(
        'identity_document',
        blank=True,
        null=True,
        folder='afrirent/identity_documents',
        resource_type='image',
        help_text=_("CNI ou Passeport")
    )
    
    identity_verified_at = models.DateTimeField(
        _('vérifié le'),
        null=True,
        blank=True,
        help_text=_("Date de vérification de l'identité")
    )
    
    # Timestamps
    created_at = models.DateTimeField(
        _('créé le'),
        auto_now_add=True
    )
    
    updated_at = models.DateTimeField(
        _('modifié le'),
        auto_now=True
    )
    
    class Meta:
        verbose_name = _('profil')
        verbose_name_plural = _('profils')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Profil de {self.user.username}"
    
    @property
    def age(self):
        """Calcule l'âge à partir de la date de naissance"""
        if self.dob:
            from datetime import date
            today = date.today()
            return today.year - self.dob.year - ((today.month, today.day) < (self.dob.month, self.dob.day))
        return None
    
    @property
    def is_complete(self):
        """Vérifie si le profil est complet"""
        return all([
            self.phone_number,
            self.address,
            self.dob,
            self.user.first_name,
            self.user.last_name,
        ])