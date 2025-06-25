'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import UserMenu from './UserMenu';
import { Search, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const Header = () => {
  const { user, isAuthenticated } = useAuth();
  const { cart } = useCart();
  const navLinks = [
    // { name: 'Inicio', href: '/' },
    { name: 'Productos', href: '/products' },
    { name: 'Tiendas', href: '/shops' },
    { name: 'Blogs', href: '/blog' },
    { name: 'Noticias', href: '/noticias' },
    // { name: 'Sobre Nosotros', href: '/sobre-nosotros' },
    // { name: 'Ayuda', href: '/ayuda' },
  ];

  // Función para obtener el color de fondo del indicador según el rol
  const getIndicatorBackground = () => {
    if (!isAuthenticated || !user) {
      return 'bg-gray-200/80'; // Color por defecto para usuarios no autenticados
    }
    
    switch (user.role) {
      case 'admin':
        return 'bg-gradient-to-r from-emerald-400/80 to-teal-500/80';
      case 'artesano':
        return 'bg-gradient-to-r from-orange-400/80 to-red-500/80';
      case 'cliente':
        return 'bg-gradient-to-r from-blue-400/80 to-indigo-500/80';
      default:
        return 'bg-gray-200/80';
    }
  };

  // Función para obtener el color del borde según el rol
  const getBorderColor = () => {
    if (!isAuthenticated || !user) {
      return 'border-gray-200'; // Color por defecto para usuarios no autenticados
    }
    
    switch (user.role) {
      case 'admin':
        return 'border-emerald-500'; // Verde esmeralda para administradores
      case 'artesano':
        return 'border-orange-500'; // Naranja para artesanos
      case 'cliente':
        return 'border-blue-500'; // Azul para clientes
      default:
        return 'border-gray-200';
    }
  };

  // Función para obtener el color de fondo del borde (gradiente sutil)
  const getBorderGradient = () => {
    if (!isAuthenticated || !user) {
      return 'bg-gradient-to-r from-gray-200 to-gray-300';
    }
    
    switch (user.role) {
      case 'admin':
        return 'bg-gradient-to-r from-emerald-400 to-teal-500';
      case 'artesano':
        return 'bg-gradient-to-r from-orange-400 to-red-500';
      case 'cliente':
        return 'bg-gradient-to-r from-blue-400 to-indigo-500';
      default:
        return 'bg-gradient-to-r from-gray-200 to-gray-300';
    }
  };

  return (
    <header className="bg-base-100/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="group flex items-center gap-3">
              {/* Logo PNG */}
              <div className="relative">
                <Image 
                  src="/static/LogoIncial.png" 
                  alt="ArtesaníasYCo Logo" 
                  width={55} 
                  height={55}
                  className="drop-shadow-sm group-hover:drop-shadow-md transition-all duration-300 group-hover:scale-110"
                />
                {/* Efecto de brillo en hover */}
                <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
              </div>
              
              {/* Texto del logo con tipografía cursiva */}
              <div className="text-2xl font-pacifico relative">
                {/* Texto principal con tipografía cursiva artística unificada */}
                <span className="bg-gradient-to-r from-amber-600 via-orange-500 to-red-600 bg-clip-text text-transparent tracking-wider">
                  Artesanías
                </span>
                <span className="bg-gradient-to-r from-amber-600 via-orange-500 to-red-600 bg-clip-text text-transparent tracking-wider ml-1">
                  YCo
                </span>
                
                {/* Efecto de sombra artística */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-600/20 via-orange-500/20 to-red-600/20 blur-sm -z-10 transform scale-105"></div>
                
                {/* Línea decorativa artística */}
                <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Punto decorativo */}
                <div className="absolute -top-1 -right-2 w-2 h-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full opacity-80 group-hover:scale-125 transition-transform duration-300"></div>
              </div>
            </Link>
          </div>

          <nav className="hidden md:flex md:space-x-8">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} className="text-black hover:text-primary transition-colors duration-200">
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <Link href="/cart" className="relative p-2 rounded-full hover:bg-base-200 transition-colors group">
              <ShoppingCart className="h-6 w-6 text-black group-hover:scale-110 transition-transform duration-200" />
              {(cart || []).length > 0 && (
                <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-primary text-white text-xs text-center">
                  {cart.length}
                </span>
              )}
            </Link>
            {isAuthenticated ? (
              <UserMenu user={user} />
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Link href="/login" className="btn btn-ghost btn-sm">Iniciar Sesión</Link>
                <Link href="/register" className="btn btn-primary btn-sm">Registrarse</Link>
              </div>
            )}
            <div className="md:hidden">
              {/* Mobile menu button can go here */}
            </div>
          </div>
        </div>
      </div>
      
      {/* Borde inferior con color según el rol */}
      <div className={`h-1 ${getBorderGradient()} transition-all duration-300 ease-in-out`}>
        {/* Indicador visual adicional para mostrar el rol */}
        {isAuthenticated && user && (
          <div className="flex justify-center items-center h-full">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full backdrop-blur-sm text-black text-xs font-medium ${getIndicatorBackground()}`}>
              {user.role === 'admin' && (
                <>
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                  <span>Administrador</span>
                </>
              )}
              {user.role === 'artesano' && (
                <>
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                  <span>Artesano</span>
                </>
              )}
              {user.role === 'cliente' && (
                <>
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                  <span>Cliente</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 