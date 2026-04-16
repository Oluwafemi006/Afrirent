import api from '../../../services/api';

export const getConversations = () => api.get('/messaging/conversations/');
export const getConversationMessages = (id) => api.get(`/messaging/conversations/${id}/messages/`);
export const createConversation = (productId, sellerId) => api.post('/messaging/conversations/', {
  product: productId,
  seller: sellerId
});
export const markAsRead = (id) => api.post(`/messaging/conversations/${id}/read_all/`);
