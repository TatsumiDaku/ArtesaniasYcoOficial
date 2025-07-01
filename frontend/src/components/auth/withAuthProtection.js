'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

const withAuthProtection = (WrappedComponent, { requiredRole } = {}) => {
  const AuthComponent = (props) => {
    const { isAuthenticated, user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      // No hacemos nada mientras carga. La lógica de renderizado se encarga.
      if (loading) return; 
      
      // Si ha terminado de cargar y no está autenticado, redirigir.
      if (!isAuthenticated) {
        router.replace('/login');
      }
      // Si se requiere un rol y el usuario no lo tiene (y no es admin), redirigir.
      else if (requiredRole && user?.role !== requiredRole && user?.role !== 'admin') {
        router.replace('/'); // Redirigir a la página de inicio o a una página de 'no autorizado'.
      }

    }, [isAuthenticated, loading, router, user]);
    
    // --- Lógica de Renderizado Estricta ---
    
    // 1. Mientras esté cargando, mostrar un loader. No renderizar el componente hijo.
    if (loading) {
      return <div className="flex justify-center items-center h-screen"><span className="loading loading-lg"></span></div>;
    }
    
    // 2. Si ya no carga y el usuario NO está autenticado, NO renderizar nada.
    // El useEffect ya se está encargando de la redirección.
    // Renderizar null evita que el componente hijo se monte por un instante.
    if (!isAuthenticated) {
      return null;
    }

    // 3. Si se requiere un rol y el usuario no lo cumple, tampoco renderizar.
    if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-200 flex flex-col items-center">
            <span className="text-6xl mb-4">🚫</span>
            <h2 className="text-2xl font-bold text-red-600 mb-2">No tienes permisos</h2>
            <p className="text-gray-600 mb-4">No tienes acceso a esta página. Si crees que es un error, contacta al administrador.</p>
            <Link href="/" className="btn bg-gradient-to-r from-red-400 to-pink-500 text-white font-bold px-6 py-3 rounded-xl shadow hover:scale-105 transition">Ir al inicio</Link>
          </div>
        </div>
      );
    }

    // 4. Si todas las comprobaciones pasan, renderizar el componente protegido.
    return <WrappedComponent {...props} />;
  };
  
  AuthComponent.displayName = `withAuthProtection(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return AuthComponent;
};

export default withAuthProtection; 