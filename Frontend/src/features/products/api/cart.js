import api from '../../../services/api';

export const getCart = () => {
  return api.get('products/cart/');
};

export const addToCart = (productId) => {
  return api.post(`products/cart/add/${productId}/`);
};

export const removeFromCart = (productId) => {
  return api.delete(`products/cart/remove/${productId}/`);
};

export const clearCart = () => {
  return api.delete('products/cart/clear/');
};
