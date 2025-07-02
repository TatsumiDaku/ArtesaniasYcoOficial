import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-gray-300 border-t border-gray-700">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y Descripción */}
          <div className="md:col-span-1 flex flex-col items-center md:items-start">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <Image 
                src="/static/LogoIncial.png" 
                alt="Artesanías & CO Logo" 
                width={50} 
                height={50} 
                className="group-hover:rotate-12 transition-transform duration-300"
              />
              <span className="font-pacifico text-2xl bg-gradient-to-r from-amber-200 via-orange-300 to-red-300 bg-clip-text text-transparent py-2">
                ArtesaniasYCo
              </span>
            </Link>
            <p className="text-sm text-center md:text-left text-gray-400">
              Celebrando la tradición y el talento de nuestros artesanos.
            </p>
          </div>

          {/* Links de Navegación */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 col-span-1 md:col-span-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-100 tracking-wider uppercase">Explorar</h3>
              <ul className="mt-4 space-y-2">
                <li><Link href="/" className="text-base text-gray-400 hover:text-white transition-colors">Inicio</Link></li>
                <li><Link href="/products" className="text-base text-gray-400 hover:text-white transition-colors">Productos</Link></li>
                <li><Link href="/sobre-nosotros" className="text-base text-gray-400 hover:text-white transition-colors">Sobre Nosotros</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-100 tracking-wider uppercase">Soporte</h3>
              <ul className="mt-4 space-y-2">
                <li><Link href="/ayuda" className="text-base text-gray-400 hover:text-white transition-colors">Centro de Ayuda</Link></li>
                <li><Link href="/ayuda#contact" className="text-base text-gray-400 hover:text-white transition-colors">Contáctanos</Link></li>
                <li><Link href="/ayuda#shipping" className="text-base text-gray-400 hover:text-white transition-colors">Envíos</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-100 tracking-wider uppercase">Legal</h3>
              <ul className="mt-4 space-y-2">
                <li><Link href="/legal/terminos" className="text-base text-gray-400 hover:text-white transition-colors">Términos y Condiciones</Link></li>
                <li><Link href="/legal/privacidad" className="text-base text-gray-400 hover:text-white transition-colors">Política de Privacidad</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-700 flex flex-col sm:flex-row items-center justify-between">
          <p className="text-sm text-gray-500 order-2 sm:order-1 mt-4 sm:mt-0">&copy; {new Date().getFullYear()} ArtesaniasYCo. Todos los derechos reservados.</p>
          <div className="flex space-x-6 order-1 sm:order-2">
            <Link href="#" className="text-gray-400 hover:text-white transition-colors"><span className="sr-only">Facebook</span><Facebook className="h-6 w-6" /></Link>
            <Link href="#" className="text-gray-400 hover:text-white transition-colors"><span className="sr-only">Instagram</span><Instagram className="h-6 w-6" /></Link>
            <Link href="#" className="text-gray-400 hover:text-white transition-colors"><span className="sr-only">Twitter</span><Twitter className="h-6 w-6" /></Link>
            <Link href="#" className="text-gray-400 hover:text-white transition-colors"><span className="sr-only">YouTube</span><Youtube className="h-6 w-6" /></Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 