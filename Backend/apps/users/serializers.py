"""
Users Serializers
Sérialiseurs pour la gestion des utilisateurs
"""
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import User, Profile


class ProfileSerializer(serializers.ModelSerializer):
    """
    Sérialiseur pour le profil utilisateur
    Gère toutes les informations complémentaires du profil
    """
    age = serializers.ReadOnlyField()
    is_complete = serializers.ReadOnlyField()
    
    class Meta:
        model = Profile
        fields = [
            'id',
            'phone_number',
            'address',
            'dob',
            'age',
            'is_complete',
            'identity_document',
            'identity_verified_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'identity_verified_at', 'created_at', 'updated_at']
    
    def validate_phone_number(self, value):
        """Validation personnalisée du numéro de téléphone"""
        if value and not value.startswith('+'):
            raise serializers.ValidationError(
                "Le numéro de téléphone doit commencer par '+' (format international)"
            )
        return value
    
    def validate_dob(self, value):
        """Validation de la date de naissance (min 18 ans)"""
        if value:
            from datetime import date
            today = date.today()
            age = today.year - value.year - ((today.month, today.day) < (value.month, value.day))
            if age < 18:
                raise serializers.ValidationError(
                    "Vous devez avoir au moins 18 ans pour utiliser AfriRent"
                )
        return value


class UserSerializer(serializers.ModelSerializer):
    """
    Sérialiseur complet pour User
    Inclut le profil en nested pour faciliter la gestion
    Utilisé pour les opérations CRUD complètes
    """
    profile = ProfileSerializer(read_only=True)
    full_name = serializers.ReadOnlyField()
    avatar_url = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'full_name',
            'avatar',
            'avatar_url',
            'is_verified',
            'bio',
            'date_joined',
            'last_login',
            'profile',
        ]
        read_only_fields = ['id', 'date_joined', 'last_login', 'is_verified']
        extra_kwargs = {
            'avatar': {'required': False},
        }
    
    def validate_email(self, value):
        """Validation de l'email (unicité)"""
        user = self.context.get('request').user if 'request' in self.context else None
        if User.objects.filter(email=value).exclude(pk=user.pk if user else None).exists():
            raise serializers.ValidationError(
                "Un utilisateur avec cet email existe déjà."
            )
        return value.lower()
    
    def validate_username(self, value):
        """Validation du username (unicité et format)"""
        user = self.context.get('request').user if 'request' in self.context else None
        if User.objects.filter(username=value).exclude(pk=user.pk if user else None).exists():
            raise serializers.ValidationError(
                "Ce nom d'utilisateur est déjà pris."
            )
        if len(value) < 3:
            raise serializers.ValidationError(
                "Le nom d'utilisateur doit contenir au moins 3 caractères."
            )
        return value


class UserMinimalSerializer(serializers.ModelSerializer):
    """
    Sérialiseur minimal pour User
    Utilisé pour les relations dans d'autres apps (products, transactions, etc.)
    
    ⚠️ IMPORTANT POUR LES AUTRES DÉVELOPPEURS:
    Importez ce serializer pour afficher les infos utilisateur dans vos apps:
    
    from apps.users.serializers import UserMinimalSerializer
    
    class ProductSerializer(serializers.ModelSerializer):
        owner = UserMinimalSerializer(read_only=True)
        ...
    """
    avatar_url = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'avatar_url', 'is_verified', 'full_name']
        read_only_fields = fields


class RegisterSerializer(serializers.ModelSerializer):
    """
    Sérialiseur pour l'inscription (register)
    Gère la création d'un nouvel utilisateur avec validation du mot de passe
    """
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'password',
            'password_confirm',
            'first_name',
            'last_name',
        ]
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
        }
    
    def validate(self, attrs):
        """Validation des mots de passe"""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                "password_confirm": "Les mots de passe ne correspondent pas."
            })
        return attrs
    
    def create(self, validated_data):
        """Création de l'utilisateur avec mot de passe hashé"""
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'].lower(),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Sérialiseur pour la mise à jour du profil
    Permet de modifier User + Profile dans une seule requête
    """
    # Champs du Profile (nested)
    phone_number = serializers.CharField(
        source='profile.phone_number',
        required=False,
        allow_blank=True
    )
    address = serializers.CharField(
        source='profile.address',
        required=False,
        allow_blank=True
    )
    dob = serializers.DateField(
        source='profile.dob',
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = User
        fields = [
            'first_name',
            'last_name',
            'bio',
            'avatar',
            'phone_number',
            'address',
            'dob',
        ]
    
    def update(self, instance, validated_data):
        """Mise à jour User + Profile en une seule transaction"""
        profile_data = validated_data.pop('profile', {})
        
        # Mettre à jour User
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Mettre à jour Profile
        if profile_data:
            profile = instance.profile
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()
        
        return instance


class VerifyIdentitySerializer(serializers.Serializer):
    """
    Sérialiseur pour la vérification d'identité
    Permet d'uploader un document d'identité (CNI/Passeport)
    """
    identity_document = serializers.ImageField(required=True)
    
    def validate_identity_document(self, value):
        """Validation du document (taille et format)"""
        # Vérifier la taille (max 5MB)
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError(
                "Le fichier ne doit pas dépasser 5MB"
            )
        
        # Vérifier le format
        allowed_formats = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
        if value.content_type not in allowed_formats:
            raise serializers.ValidationError(
                "Format non supporté. Utilisez JPG, PNG ou PDF"
            )
        
        return value


class UserStatsSerializer(serializers.Serializer):
    """
    Sérialiseur pour les statistiques utilisateur
    Utilisé par l'endpoint /users/{id}/stats/
    """
    products_count = serializers.IntegerField()
    reviews_count = serializers.IntegerField()
    transactions_count = serializers.IntegerField()
    is_verified = serializers.BooleanField()
    member_since = serializers.DateTimeField()