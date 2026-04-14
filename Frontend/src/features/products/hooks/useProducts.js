import { useState, useEffect } from 'react';
import { getProducts } from '../api/products';

export const useProducts = (params = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const paramsKey = JSON.stringify(params);

  useEffect(() => {
    let cancelled = false;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getProducts(params);
        if (cancelled) return;
        const data = response.data;
        if (data.results) {
          setProducts(data.results);
          setPagination({
            count: data.count,
            next: data.next,
            previous: data.previous,
          });
        } else {
          setProducts(Array.isArray(data) ? data : []);
          setPagination(null);
        }
      } catch (err) {
        if (cancelled) return;
        setError(err.response?.data?.detail || 'Erreur lors du chargement');
        setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProducts();

    return () => { cancelled = true; };
  }, [paramsKey]);

  return { products, loading, error, pagination };
};
