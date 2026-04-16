from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer

class ConversationViewSet(viewsets.ModelViewSet):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Un utilisateur ne voit que ses propres conversations (en tant qu'acheteur ou vendeur)
        return Conversation.objects.filter(
            Q(buyer=self.request.user) | Q(seller=self.request.user)
        ).distinct()

    def create(self, request, *args, **kwargs):
        product_id = request.data.get('product')
        seller_id = request.data.get('seller')
        buyer = request.user

        if not product_id or not seller_id:
            return Response(
                {"error": "product and seller are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Vérifier si la conversation existe déjà
        conversation = Conversation.objects.filter(
            product_id=product_id,
            buyer=buyer,
            seller_id=seller_id
        ).first()

        if not conversation:
            # Créer la conversation
            serializer = self.get_serializer(data={
                'product': product_id,
                'buyer': buyer.id,
                'seller': seller_id
            })
            serializer.is_valid(raise_exception=True)
            conversation = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        serializer = self.get_serializer(conversation)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        conversation = self.get_object()
        messages = conversation.messages.all().order_by('created_at')
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def read_all(self, request, pk=None):
        conversation = self.get_object()
        conversation.messages.filter(is_read=False).exclude(sender=request.user).update(is_read=True)
        return Response({'status': 'messages marked as read'})
