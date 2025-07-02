'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import UserMenu from './UserMenu';
import { Search, ShoppingCart, Menu as Burger, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useState, useEffect } from 'react';
import { UserCircle, Heart } from 'lucide-react';
import imageUrl from '@/utils/imageUrl';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { cart } = useCart();
  const navLinks = [
    // { name: 'Inicio', href: '/' },
    { name: 'Productos', href: '/products' },
    { name: 'Tiendas', href: '/shops' },
    { name: 'Blogs', href: '/blog' },
    { name: 'Noticias', href: '/news' },
    // { name: 'Sobre Nosotros', href: '/sobre-nosotros' },
    // { name: 'Ayuda', href: '/ayuda' },
  ];

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Manejar el overflow del body cuando el menú está abierto
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('menu-open');
    } else {
      document.body.style.overflow = '';
      document.body.classList.remove('menu-open');
    }
    
    // Limpiar al desmontar el componente
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('menu-open');
    };
  }, [mobileMenuOpen]);

  // Simulación: número de productos con stock bajo (en producción, obtener de contexto o props)
  const lowStockCount = user && (user.role === 'admin' || user.role === 'artesano') ? (user.stats?.products?.lowStock || 0) : 0;

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
    <header className={`${mobileMenuOpen ? 'bg-white' : 'bg-base-100/80 backdrop-blur-md'} shadow-sm sticky top-0 z-50`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="group flex items-center gap-3">
              <div className="relative">
                <img 
                  src="/static/LogoIncial.png" 
                  alt="Artesanías & CO Logo" 
                  width={55} 
                  height={55}
                  className="drop-shadow-sm group-hover:drop-shadow-md transition-all duration-300 group-hover:scale-110"
                />
              </div>
              <div className="text-2xl font-pacifico relative block">
                <span className="bg-gradient-to-r from-amber-600 via-orange-500 to-red-600 bg-clip-text text-transparent tracking-wider">
                  ArtesaníasYCo
                </span>
              </div>
            </Link>
          </div>
          {/* Desktop nav */}
          <nav className="hidden lg:flex lg:space-x-8">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} className="text-black hover:text-primary transition-colors duration-200 relative">
                {link.name}
                {link.name === 'Productos' && lowStockCount > 0 && (
                  <span className="absolute -top-2 -right-4 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 animate-pulse shadow">{lowStockCount}</span>
                )}
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
              <div className="hidden lg:block">
                <UserMenu user={user} />
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Link href="/login" className="btn btn-ghost btn-sm">Iniciar Sesión</Link>
                <Link href="/register" className="btn btn-primary btn-sm">Registrarse</Link>
              </div>
            )}
            {/* Botón hamburguesa para tablet/móvil */}
            <button
              className="inline-flex items-center justify-center rounded-md p-2 text-black hover:bg-base-200 focus:outline-none focus:ring-2 focus:ring-primary lg:hidden"
              aria-label="Abrir menú"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Burger className="w-7 h-7" />
            </button>
          </div>
        </div>
      </div>
      {/* Menú hamburguesa móvil/tablet */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end lg:hidden">
          {/* Overlay oscuro, solo a la izquierda del panel */}
          <div className="flex-1 bg-black/40" onClick={() => setMobileMenuOpen(false)} />
          {/* Panel lateral completamente opaco */}
          <div className="w-full max-w-sm sm:max-w-md h-full bg-white shadow-2xl p-6 flex flex-col gap-4 animate-slide-in-right relative text-black z-[101] overflow-y-auto max-h-screen scrollbar-thin scrollbar-thumb-amber-400 scrollbar-track-orange-100">
            <button
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 focus:outline-none shadow-md transition-colors"
              aria-label="Cerrar menú"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="w-6 h-6 text-gray-700" />
            </button>
            <div className="flex flex-col items-center gap-2 mt-8">
              <img 
                src="/static/LogoIncial.png" 
                alt="Artesanías & CO Logo" 
                width={60} 
                height={60}
                className="mb-1"
              />
              <span className="font-pacifico text-2xl bg-gradient-to-r from-amber-600 via-orange-500 to-red-600 bg-clip-text text-transparent">ArtesaníasYCo</span>
            </div>
            {isAuthenticated && user && (
              <div className="flex flex-col items-center gap-3 mt-4 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl">
                {user.avatar && user.avatar.startsWith('/uploads') ? (
                  <img
                    src={imageUrl(user.avatar)}
                    alt="Avatar"
                    className="w-16 h-16 rounded-full object-cover border-3 border-white shadow-lg"
                  />
                ) : (
                  <Image
                    src={user.avatar ? imageUrl(user.avatar) : '/static/default-avatar.png'}
                    alt="Avatar"
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full object-cover border-3 border-white shadow-lg"
                  />
                )}
                <div className="text-center">
                  <p className="font-semibold text-lg text-gray-800 truncate max-w-[200px]">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>
            )}
            <nav className="flex flex-col gap-1 mt-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href} 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50 py-3 px-4 rounded-lg transition-all relative flex items-center justify-between"
                >
                  <span>{link.name}</span>
                  {link.name === 'Productos' && lowStockCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 animate-pulse shadow">{lowStockCount}</span>
                  )}
                </Link>
              ))}
            </nav>
            {isAuthenticated && (
              <div className="mt-auto border-t pt-4 flex flex-col gap-2">
                <Link 
                  href={user.role === 'admin' ? '/admin/dashboard' : user.role === 'artesano' ? '/artisan/products' : '/dashboard'} 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-base font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50 py-3 px-4 rounded-lg transition-all"
                >
                  <UserCircle className="w-5 h-5" /> 
                  <span>Mi Panel</span>
                </Link>
                {user.role === 'artesano' && (
                  <Link 
                    href="/artisan/profile" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-base font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50 py-3 px-4 rounded-lg transition-all"
                  >
                    <UserCircle className="w-5 h-5" /> 
                    <span>Editar Perfil</span>
                  </Link>
                )}
                {user.role === 'cliente' && (
                  <Link 
                    href="/dashboard/favorites" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-base font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50 py-3 px-4 rounded-lg transition-all"
                  >
                    <Heart className="w-5 h-5" /> 
                    <span>Mis Favoritos</span>
                  </Link>
                )}
                <button 
                  onClick={() => { 
                    setMobileMenuOpen(false); 
                    logout(); 
                  }} 
                  className="w-full flex items-center gap-3 text-base text-red-600 hover:text-red-700 hover:bg-red-50 font-medium py-3 px-4 rounded-lg transition-all mt-2"
                >
                  <X className="w-5 h-5" /> 
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            )}
            {!isAuthenticated && (
              <div className="mt-auto border-t pt-4 flex flex-col gap-3">
                <Link 
                  href="/login" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-ghost w-full text-base"
                >
                  Iniciar Sesión
                </Link>
                <Link 
                  href="/register" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-primary w-full text-base"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
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