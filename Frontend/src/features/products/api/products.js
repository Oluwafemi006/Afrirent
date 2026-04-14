/**
 * Products API Integration
 * Gère tous les appels API pour les produits
 */

import api from '../../../services/api';

/**
 * Produits - GET
 */
export const getProducts = (params = {}) => {
  return api.get('products/', { params });
};

export const getProductDetail = (id) => {
  return api.get(`products/${id}/`);
};

export const getMyProducts = (params = {}) => {
  return api.get('products/my-products/', { params });
};

/**
 * Produits - CREATE
 */
export const createProduct = (data) => {
  const config = {};
  if (data instanceof FormData) {
    config.headers = {
      'Content-Type': 'multipart/form-data',
    };
  }
  return api.post('products/', data, config);
};

/**
 * Produits - UPDATE
 */
export const updateProduct = (id, data) => {
  return api.patch(`products/${id}/`, data);
};

export const updateProductFull = (id, data) => {
  return api.put(`products/${id}/`, data);
};

/**
 * Produits - DELETE
 */
export const deleteProduct = (id) => {
  return api.delete(`products/${id}/`);
};

/**
 * Statut - Change product status
 */
export const changeProductStatus = (id, status) => {
  return api.patch(`products/${id}/status/`, { status });
};

/**
 * Vues - Increment views
 */
export const incrementProductViews = (id) => {
  return api.post(`products/${id}/increment_views/`);
};

/**
 * Images - Upload additional images
 */
export const uploadProductImages = (id, files) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('images', file);
  });

  return api.post(`products/${id}/upload_images/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * Catégories
 */
export const getCategories = () => {
  return api.get('products/categories/');
};

export const getCategoryDetail = (slug) => {
  return api.get(`products/categories/${slug}/`);
};

export const createCategory = (name) => {
  return api.post('products/categories/', { name });
};

export default {
  getProducts,
  getProductDetail,
  getMyProducts,
  createProduct,
  updateProduct,
  updateProductFull,
  deleteProduct,
  changeProductStatus,
  incrementProductViews,
  uploadProductImages,

  getCategories,
  getCategoryDetail,
  createCategory,
};
