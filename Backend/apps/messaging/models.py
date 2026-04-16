from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from apps.products.models import Product

User = get_user_model()

class Conversation(models.Model):
    """
    Une conversation entre un acheteur et un vendeur à propos d'un produit.
    """
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='conversations',
        verbose_name=_('produit')
    )
    buyer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='buying_conversations',
        verbose_name=_('acheteur')
    )
    seller = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='selling_conversations',
        verbose_name=_('vendeur')
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('conversation')
        verbose_name_plural = _('conversations')
        unique_together = ('product', 'buyer', 'seller')
        ordering = ['-updated_at']

    def __str__(self):
        return f"Chat: {self.buyer.username} - {self.seller.username} ({self.product.title})"

    @property
    def last_message(self):
        return self.messages.first()

class Message(models.Model):
    """
    Un message individuel au sein d'une conversation.
    """
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages',
        verbose_name=_('conversation')
    )
    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='sent_messages',
        verbose_name=_('expéditeur')
    )
    content = models.TextField(_('contenu'))
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('message')
        verbose_name_plural = _('messages')
        ordering = ['-created_at']  # Plus récent en premier pour faciliter l'accès au dernier message

    def __str__(self):
        return f"De {self.sender.username} le {self.created_at}"
