'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import api from '@/utils/api';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext();

export const useFavorites = () => {
  return useContext(FavoritesContext);
};

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState(null);
  const { user } = useAuth();

  const fetchFavorites = useCallback(async (page = 1) => {
    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }
    
    const isInitialLoad = page === 1;
    if (isInitialLoad) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const { data } = await api.get(`/favorites?page=${page}&limit=8`);
      setFavorites(prev => isInitialLoad ? data.data : [...prev, ...data.data]);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      toast.error('No se pudieron cargar tus favoritos.');
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites(1);
  }, [fetchFavorites]);

  const loadMoreFavorites = useCallback(() => {
    if (pagination && pagination.page < pagination.pages) {
      fetchFavorites(pagination.page + 1);
    }
  }, [pagination, fetchFavorites]);

  const addFavorite = async (productId) => {
    try {
      await api.post('/favorites', { productId });
      toast.success('¡Añadido a favoritos!');
      fetchFavorites(1); // Recargar desde la primera página
    } catch (error) {
       if (error.response && error.response.status === 409) {
        toast.error('Este producto ya está en tus favoritos.');
      } else {
        toast.error('No se pudo añadir a favoritos.');
        console.error("Error adding favorite:", error);
      }
    }
  };

  const removeFavorite = async (productId) => {
    try {
      await api.delete(`/favorites/${productId}`);
      toast.success('Eliminado de favoritos.');
      // Actualiza el estado localmente para una respuesta más rápida, pero también recargamos
      // para mantener la paginación consistente, aunque podría causar un pequeño salto.
      fetchFavorites(1);
    } catch (error) {
      toast.error('No se pudo eliminar de favoritos.');
      console.error("Error removing favorite:", error);
    }
  };

  const isFavorite = (productId) => {
    return favorites.some(fav => fav.id === productId);
  };

  const value = {
    favorites,
    loading,
    loadingMore,
    pagination,
    addFavorite,
    removeFavorite,
    isFavorite,
    fetchFavorites: () => fetchFavorites(1), // Exporta una versión que siempre recarga
    loadMoreFavorites
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}; 