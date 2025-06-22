'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import api from '@/utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      if (user) {
        const res = await api.get('/cart');
        setCart(res.data);
      } else {
        const localCart = localStorage.getItem('cart');
        setCart(localCart ? JSON.parse(localCart) : []);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error('No se pudo cargar el carrito.');
      setCart([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, user]);

  const addToCart = async (product, quantity = 1) => {
    try {
      if (user) {
        await api.post('/cart', { product_id: product.id, quantity });
      }
      
      setCart(prevCart => {
        const existingItem = prevCart.find(item => item.product_id === product.id);
        if (existingItem) {
          return prevCart.map(item =>
            item.product_id === product.id ? { ...item, quantity: item.quantity + quantity } : item
          );
        }
        // Estructura del item para el frontend
        return [...prevCart, { product_id: product.id, quantity, product }];
      });

      toast.success(`${product.name} añadido al carrito!`);
      fetchCart();
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error('No se pudo añadir el producto al carrito.');
    }
  };

  const removeFromCart = async (productId) => {
    try {
      if (user) {
        await api.delete(`/cart/${productId}`);
      }
      
      const itemToRemove = cart.find(item => item.product_id === productId);
      setCart(prevCart => prevCart.filter(item => item.product_id !== productId));
      
      if (itemToRemove) {
        toast.error(`${itemToRemove.product.name} eliminado del carrito.`);
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast.error('No se pudo eliminar el producto del carrito.');
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
     if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    try {
      if (user) {
        await api.put(`/cart/${productId}`, { quantity: newQuantity });
      }
      setCart(prevCart =>
        prevCart.map(item =>
          item.product_id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
       console.error("Error updating quantity:", error);
       toast.error('No se pudo actualizar la cantidad.');
    }
  };

  const clearCart = async () => {
    try {
      if (user) {
        await api.delete('/cart');
      }
      setCart([]);
      toast.error('El carrito ha sido vaciado.');
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast.error('No se pudo vaciar el carrito.');
    }
  };

  const totalPrice = cart.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const value = {
    cart,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalPrice,
    totalItems,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}; 