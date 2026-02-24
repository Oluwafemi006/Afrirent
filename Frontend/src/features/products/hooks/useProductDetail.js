/**
 * useProductDetail Hook
 * Hook pour récupérer les détails d'un produit
 */

import { useEffect, useState } from 'react';
import { getProductDetail } from '../api/products';

export const useProductDetail = (productId) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await getProductDetail(productId);
        setProduct(response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.detail || 'Erreur lors du chargement du produit');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  return {
    product,
    loading,
    error,
    setProduct,
  };
};

export default useProductDetail;
