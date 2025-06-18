import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCartItems();
    } else {
      setCartItems([]);
    }
  }, [isAuthenticated]);

  const fetchCartItems = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const response = await api.get('/api/cart');
      setCartItems(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      throw new Error('Debes iniciar sesión para agregar productos al carrito');
    }

    try {
      const response = await api.post('/api/cart', { productId, quantity });
      await fetchCartItems();
      return { success: true, message: 'Producto agregado al carrito' };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error al agregar al carrito' 
      };
    }
  };

  const updateCartItem = async (productId, quantity) => {
    try {
      await api.put(`/api/cart/${productId}`, { quantity });
      await fetchCartItems();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error al actualizar carrito' 
      };
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await api.delete(`/api/cart/${productId}`);
      await fetchCartItems();
      return { success: true, message: 'Producto eliminado del carrito' };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error al eliminar del carrito' 
      };
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/api/cart');
      setCartItems([]);
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cartItems,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    fetchCartItems
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 