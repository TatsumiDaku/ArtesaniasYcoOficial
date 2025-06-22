'use client';

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { jwtDecode } from 'jwt-decode'; // Using a direct import for simplicity
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const router = useRouter();

  const loadUserFromToken = useCallback(async () => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        // Check if token is expired
        if (decoded.exp * 1000 < Date.now()) {
          logout(false);
          return;
        }
        setToken(storedToken);
        // Reconstruir el objeto de usuario completo desde el payload del token
        setUser({ 
          id: decoded.id, 
          name: decoded.name, 
          role: decoded.role,
          avatar: decoded.avatar,
          nickname: decoded.nickname,
          professional_email: decoded.professional_email,
          artisan_story: decoded.artisan_story,
          id_document: decoded.id_document,
          country: decoded.country,
          state: decoded.state,
          city: decoded.city,
          workshop_address: decoded.workshop_address,
          phone: decoded.phone
        });
      } catch (error) {
        console.error("Invalid token", error);
        logout(false); // Clear invalid token
      }
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadUserFromToken();
  }, [loadUserFromToken]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user); // El backend ahora devuelve el objeto de usuario completo
      toast.success(`Bienvenido, ${user.name}!`);

      // Redirigir siempre a la página de inicio sin importar el rol
      router.push('/');

    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al iniciar sesión.';
      
      // Aquí está la magia: si el mensaje de error es el de pendiente, mostramos el modal.
      if (error.response?.status === 403 && errorMessage.includes('pendiente de aprobación')) {
          setShowPendingModal(true);
      } else {
          toast.error(errorMessage);
      }
      console.error('Login failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', userData);
      
      // Si es un artesano, el backend devuelve un mensaje especial.
      if (res.data.artisanPending) {
        toast.success('¡Registro casi listo!');
        return { success: true, artisanPending: true };
      }

      // Para clientes, procedemos al login automático
      toast.success('¡Registro exitoso!');
      const { email, password } = userData;
      await login(email, password); // Iniciar sesión automáticamente
      return { success: true };

    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error en el registro.';
      toast.error(errorMessage);
      console.error('Registration failed', errorMessage);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (newToken, newUser) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
    toast.success('Perfil actualizado.');
  };

  const logout = useCallback((notify = true) => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    if (notify) {
      toast.success('Has cerrado sesión.');
    }
    router.push('/login');
  }, [router]);

  const isAuthenticated = !!token;
  const isAdmin = user?.role === 'admin';
  const isArtisan = user?.role === 'artisan';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        isArtisan,
        loading,
        login,
        register,
        logout,
        updateUser,
        showPendingModal,
        setShowPendingModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext; 