import api from '../../../services/api';

export const getFavorites = (params = {}) => {
  return api.get('/products/favorites/', { params });
};

export const toggleFavorite = (productId) => {
  return api.post(`/products/favorites/toggle/${productId}/`);
};

export const checkFavorite = (productId) => {
  return api.get(`/products/favorites/check/${productId}/`);
};
