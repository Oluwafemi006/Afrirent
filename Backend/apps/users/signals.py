"""
Users Signals
Signaux pour automatiser certaines actions sur les modèles User/Profile
"""
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone
import logging

from .models import User, Profile

logger = logging.getLogger(__name__)


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Signal: Créer automatiquement un Profile lors de la création d'un User
    
    Déclenché après: User.objects.create() ou user.save() (si nouveau)
    Action: Crée un objet Profile lié au User
    """
    if created:
        Profile.objects.create(user=instance)
        logger.info(f"✅ Profile créé automatiquement pour l'utilisateur: {instance.username}")


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """
    Signal: Sauvegarder le Profile lorsque le User est sauvegardé
    
    Garantit que le profil est toujours synchronisé avec le user
    """
    if hasattr(instance, 'profile'):
        instance.profile.save()


@receiver(post_save, sender=Profile)
def check_identity_verification(sender, instance, **kwargs):
    """
    Signal: Vérifier si le document d'identité a été uploadé
    
    Si un document est ajouté et que l'utilisateur n'est pas encore vérifié,
    on peut déclencher un processus de vérification manuelle (par un admin)
    """
    if instance.identity_document and not instance.user.is_verified:
        logger.info(
            f"📄 Document d'identité uploadé pour {instance.user.username}. "
            f"En attente de vérification manuelle."
        )
        # TODO: Envoyer une notification à l'équipe de modération
        # TODO: Créer une tâche de vérification dans le système


@receiver(post_save, sender=Profile)
def log_profile_update(sender, instance, created, **kwargs):
    """
    Signal: Logger les mises à jour du profil
    
    Utile pour l'audit et le debugging
    """
    if not created:
        logger.info(
            f"✏️ Profil mis à jour pour {instance.user.username} "
            f"(complet: {instance.is_complete})"
        )


@receiver(pre_save, sender=User)
def normalize_email(sender, instance, **kwargs):
    """
    Signal: Normaliser l'email avant sauvegarde
    
    Convertit l'email en minuscules pour éviter les doublons
    """
    if instance.email:
        instance.email = instance.email.lower()


# Fonction d'initialisation à appeler dans apps.py
def init_signals():
    """
    Initialise tous les signaux
    À appeler dans apps/users/apps.py:
    
    class UsersConfig(AppConfig):
        def ready(self):
            import apps.users.signals
            apps.users.signals.init_signals()
    """
    logger.info("🔌 Signaux users initialisés")