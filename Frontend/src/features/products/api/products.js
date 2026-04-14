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

/**
 * Créer catégorie si n'existe pas déjà
 */
export const createCategoryIfNotExists = async (name) => {
  if (!name || name.trim().length < 2) {
    throw new Error('Nom catégorie trop court (min 2 caractères)');
  }
  
  const trimmedName = name.trim();
  
  try {
    // Chercher si existe déjà
    const { data: categoriesResponse } = await getCategories();
    const categories = categoriesResponse.results || categoriesResponse.data || categoriesResponse;
    
    const found = Array.isArray(categories) ? 
      categories.find(cat => cat.name.toLowerCase() === trimmedName.toLowerCase()) : 
      null;
    
    if (found) {
      return { category: found, created: false };
    }
    
    // Créer nouvelle
    const response = await api.post('products/categories/', { name: trimmedName });
    return { category: response.data, created: true };
  } catch (err) {
    console.error('Erreur createCategoryIfNotExists:', err);
    throw err;
  }
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
  createCategoryIfNotExists,
  createCategory,
};

