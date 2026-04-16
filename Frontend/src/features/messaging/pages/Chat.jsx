import { useEffect, useState, useRef } from 'react';
import useChatStore from '../../../stores/chatStore';
import useAuthStore from '../../../stores/authStore';
import { Send, User as UserIcon, ShoppingBag, ArrowLeft, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Chat() {
  const { user } = useAuthStore();
  const { 
    conversations, 
    activeConversation, 
    messages, 
    fetchConversations, 
    setActiveConversation, 
    sendMessage,
    loading 
  } = useChatStore();
  
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    return () => setActiveConversation(null); // Nettoyer à la sortie
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && activeConversation) {
      sendMessage(newMessage.trim(), user.id);
      setNewMessage('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 h-[calc(100vh-120px)] flex gap-6">
      {/* Liste des conversations */}
      <div className={`w-full md:w-1/3 bg-white rounded-2xl shadow-md border border-gray-100 flex flex-col ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
          <div className="bg-primary-50 text-primary text-xs px-2 py-1 rounded-full font-bold">
            {conversations.length}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loading && conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">Chargement...</div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <ShoppingBag size={48} className="mx-auto mb-4 opacity-10" />
              <p>Aucune conversation pour le moment.</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveConversation(conv)}
                className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                  activeConversation?.id === conv.id 
                    ? 'bg-primary text-white shadow-lg translate-x-1' 
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border ${
                    activeConversation?.id === conv.id ? 'bg-white bg-opacity-20 border-white border-opacity-20' : 'bg-blue-50 border-blue-100'
                  }`}>
                    <UserIcon className={activeConversation?.id === conv.id ? 'text-white' : 'text-primary'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-bold truncate text-sm">
                        {conv.other_user?.username || 'Utilisateur'}
                      </h4>
                      <span className={`text-[10px] shrink-0 ml-2 ${activeConversation?.id === conv.id ? 'text-blue-100' : 'text-gray-400'}`}>
                        {new Date(conv.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className={`text-xs truncate mt-0.5 ${activeConversation?.id === conv.id ? 'text-blue-100' : 'text-gray-500'}`}>
                      {conv.last_message?.content || 'Nouvelle conversation'}
                    </p>
                    <div className={`text-[10px] mt-1.5 font-bold uppercase tracking-wider flex items-center ${activeConversation?.id === conv.id ? 'text-white' : 'text-primary'}`}>
                      <ShoppingBag size={10} className="mr-1" />
                      <span className="truncate">{conv.product_details?.title}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Fenêtre de chat */}
      <div className={`w-full md:w-2/3 bg-white rounded-2xl shadow-md border border-gray-100 flex flex-col overflow-hidden ${!activeConversation ? 'hidden md:flex items-center justify-center bg-gray-50' : 'flex'}`}>
        {activeConversation ? (
          <>
            {/* Header du chat */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
              <div className="flex items-center space-x-3">
                <button onClick={() => setActiveConversation(null)} className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition">
                  <ArrowLeft size={20} />
                </button>
                <div className="relative">
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100">
                    <UserIcon className="text-primary" size={20} />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 leading-tight">
                    {activeConversation.other_user?.username || 'Utilisateur'}
                  </h3>
                  <div className="flex items-center text-[10px] text-primary font-bold uppercase tracking-tighter">
                    <span className="inline-block w-1 h-1 bg-primary rounded-full mr-1"></span>
                    {activeConversation.product_details?.title}
                  </div>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-primary">{Number(activeConversation.product_details?.price).toLocaleString()} FCFA</p>
              </div>
            </div>

            {/* Zone des messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
              {messages.map((msg, index) => {
                const isMe = msg.sender === user.id || msg.sender_id === user.id;
                return (
                  <div 
                    key={msg.id || index} 
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] p-3 px-4 rounded-2xl text-sm shadow-sm transition-all duration-300 ${
                      isMe 
                        ? 'bg-primary text-white rounded-tr-none' 
                        : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                    }`}>
                      <p className="leading-relaxed">{msg.content}</p>
                      <div className={`text-[9px] mt-1 text-right font-medium ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} className="h-2" />
            </div>

            {/* Input de message */}
            <div className="p-4 bg-white border-t border-gray-100">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input 
                  type="text" 
                  placeholder="Tapez votre message ici..." 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:bg-white outline-none transition-all text-sm"
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-primary text-white p-3 rounded-xl hover:bg-blue-800 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale shadow-md"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="text-center p-12 max-w-sm">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-dashed border-primary/20">
              <MessageSquare size={48} className="text-primary opacity-20" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Vos discussions</h3>
            <p className="text-gray-500 text-sm">
              Sélectionnez une conversation dans la liste de gauche pour commencer à discuter avec un vendeur ou un acheteur.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
