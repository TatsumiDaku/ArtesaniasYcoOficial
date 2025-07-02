'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import UserMenu from './UserMenu';
import { Search, ShoppingCart, Menu as Burger, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';
import { UserCircle, Heart } from 'lucide-react';
import imageUrl from '@/utils/imageUrl';

const Header = () => {
  const { user, isAuthenticated } = useAuth();
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
          <div className="w-full max-w-xs h-full bg-white shadow-2xl p-6 flex flex-col gap-6 animate-slide-in-right relative text-black z-[101] overflow-y-auto max-h-screen scrollbar-thin scrollbar-thumb-amber-400 scrollbar-track-orange-100">
            <button
              className="absolute top-4 right-4 p-2 rounded-full bg-white hover:bg-gray-100 focus:outline-none shadow"
              aria-label="Cerrar menú"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex flex-col items-center gap-2 mt-4">
              <img 
                src="/static/LogoIncial.png" 
                alt="Artesanías & CO Logo" 
                width={50} 
                height={50}
                className="mb-1"
              />
              <span className="font-pacifico text-xl bg-gradient-to-r from-amber-600 via-orange-500 to-red-600 bg-clip-text text-transparent">ArtesaníasYCo</span>
            </div>
            {isAuthenticated && user && (
              <div className="flex flex-col items-center gap-2 mt-2 mb-4">
                <Image
                  src={user.avatar ? imageUrl(user.avatar) : '/static/default-avatar.png'}
                  alt="Avatar"
                  width={56}
                  height={56}
                  className="rounded-full object-cover border-2 border-orange-400 shadow-md"
                />
                <span className="font-semibold text-lg truncate max-w-[140px]">{user.name}</span>
                <span className="text-xs text-gray-500">{user.email}</span>
              </div>
            )}
            <nav className="flex flex-col gap-2 mt-2">
              {navLinks.map((link) => (
                <Link key={link.name} href={link.href} className="text-base font-medium text-gray-800 hover:text-primary py-2 px-3 rounded-lg transition-colors relative">
                  {link.name}
                  {link.name === 'Productos' && lowStockCount > 0 && (
                    <span className="absolute -top-2 -right-4 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 animate-pulse shadow">{lowStockCount}</span>
                  )}
                </Link>
              ))}
            </nav>
            {isAuthenticated && (
              <div className="mt-4 border-t pt-4 flex flex-col gap-2">
                <Link href={user.role === 'admin' ? '/admin/dashboard' : user.role === 'artesano' ? '/artisan/products' : '/dashboard'} className="flex items-center gap-2 text-base font-semibold text-orange-700 hover:text-orange-900">
                  <UserCircle className="w-5 h-5" /> Mi Panel
                </Link>
                {user.role === 'artesano' && (
                  <Link href="/artisan/profile" className="flex items-center gap-2 text-base text-orange-600 hover:text-orange-800">
                    <UserCircle className="w-5 h-5" /> Editar Perfil
                  </Link>
                )}
                <button onClick={() => { setMobileMenuOpen(false); user && user.logout && user.logout(); }} className="w-full flex items-center gap-2 text-base text-red-600 hover:text-red-800 font-semibold py-2 px-3 rounded-lg transition-colors">
                  <X className="w-5 h-5" /> Cerrar Sesión
                </button>
              </div>
            )}
            {!isAuthenticated && (
              <div className="mt-4 border-t pt-4 flex flex-col gap-2">
                <Link href="/login" className="btn btn-ghost w-full">Iniciar Sesión</Link>
                <Link href="/register" className="btn btn-primary w-full">Registrarse</Link>
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