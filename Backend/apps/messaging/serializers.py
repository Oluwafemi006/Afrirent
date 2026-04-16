from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Conversation, Message
from apps.products.serializers import ProductListSerializer
from apps.users.serializers import UserSerializer

User = get_user_model()

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.ReadOnlyField(source='sender.username')

    class Meta:
        model = Message
        fields = ['id', 'conversation', 'sender', 'sender_name', 'content', 'is_read', 'created_at']

class ConversationSerializer(serializers.ModelSerializer):
    product_details = ProductListSerializer(source='product', read_only=True)
    other_user = serializers.SerializerMethodField()
    last_message = MessageSerializer(read_only=True)

    class Meta:
        model = Conversation
        fields = ['id', 'product', 'product_details', 'buyer', 'seller', 'other_user', 'last_message', 'created_at', 'updated_at']

    def get_other_user(self, obj):
        request_user = self.context['request'].user
        if obj.buyer == request_user:
            return UserSerializer(obj.seller).data
        return UserSerializer(obj.buyer).data
