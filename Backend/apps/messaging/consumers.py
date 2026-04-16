import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import Conversation, Message
from apps.products.models import Product

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.room_group_name = f'chat_{self.conversation_id}'
        
        # On pourrait vérifier l'auth ici si on avait un middleware JWT pour Channels
        # Pour l'instant, on accepte la connexion
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Quitter le groupe
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_content = data.get('message')
        sender_id = data.get('sender_id')

        if not message_content or not sender_id:
            return

        # Sauvegarder le message en base de données
        saved_message = await self.save_message(sender_id, message_content)

        # Envoyer le message au groupe
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message_content,
                'sender_id': sender_id,
                'created_at': str(saved_message.created_at),
                'id': saved_message.id
            }
        )

    async def chat_message(self, event):
        # Envoyer le message vers le WebSocket
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'sender_id': event['sender_id'],
            'created_at': event['created_at'],
            'id': event['id']
        }))

    @database_sync_to_async
    def save_message(self, sender_id, content):
        conversation = Conversation.objects.get(id=self.conversation_id)
        sender = User.objects.get(id=sender_id)
        message = Message.objects.create(
            conversation=conversation,
            sender=sender,
            content=content
        )
        # Mettre à jour le timestamp de la conversation pour qu'elle remonte en haut de liste
        conversation.save()
        return message
