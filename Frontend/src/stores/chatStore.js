import { create } from 'zustand';
import { getConversations, getConversationMessages, markAsRead } from '../features/messaging/api/messaging';

const useChatStore = create((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  loading: false,
  socket: null,

  fetchConversations: async () => {
    set({ loading: true });
    try {
      const response = await getConversations();
      set({ conversations: response.data.results || response.data, loading: false });
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error);
      set({ loading: false });
    }
  },

  setActiveConversation: async (conversation) => {
    // Fermer l'ancien socket si existant
    const currentSocket = get().socket;
    if (currentSocket) {
      currentSocket.close();
    }

    set({ activeConversation: conversation, messages: [] });
    
    if (conversation) {
      // Charger l'historique
      try {
        const response = await getConversationMessages(conversation.id);
        set({ messages: response.data.results || response.data });
        
        // Marquer comme lu
        await markAsRead(conversation.id);
        
        // Initialiser WebSocket
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        // Note: En dev, le backend est souvent sur le port 8000
        const host = window.location.hostname === 'localhost' ? 'localhost:8000' : window.location.host;
        const socketUrl = `${protocol}://${host}/ws/chat/${conversation.id}/`;
        
        const socket = new WebSocket(socketUrl);
        
        socket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          set((state) => ({
            messages: [...state.messages, data]
          }));
          
          // Mettre à jour la liste des conversations (dernier message)
          get().fetchConversations();
        };

        socket.onclose = () => {
          console.log('WebSocket fermé');
        };

        set({ socket });
      } catch (error) {
        console.error('Erreur lors de l\'activation de la conversation:', error);
      }
    }
  },

  sendMessage: (content, senderId) => {
    const socket = get().socket;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        message: content,
        sender_id: senderId
      }));
    } else {
      console.error('WebSocket n\'est pas ouvert');
    }
  }
}));

export default useChatStore;
