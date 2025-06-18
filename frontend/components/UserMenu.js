import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function UserMenu() {
  const { user, logout, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center space-x-2">
        <Link href="/login" className="px-4 py-2 text-sm text-gray-700 hover:text-orange-600 transition-colors">Iniciar Sesión</Link>
        <Link href="/register" className="px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">Registrarse</Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-medium">{user?.name?.charAt(0)?.toUpperCase()}</span>
        </div>
        <span className="hidden md:block text-sm font-medium text-gray-700">{user?.name}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50">
          <div className="px-4 py-2 border-b">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className="inline-block px-2 py-1 mt-1 text-xs bg-orange-100 text-orange-800 rounded-full">{user?.role}</span>
          </div>
          <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors" onClick={() => setOpen(false)}>Mi Perfil</Link>
          <Link href="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors" onClick={() => setOpen(false)}>Mis Pedidos</Link>
          <button
            onClick={() => { logout(); setOpen(false); }}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  );
} 