'use client';

import Link from 'next/link';
import { Search, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] bg-gradient-to-br from-gray-50 via-white to-amber-50 text-center px-4">
      <div className="relative mb-8">
        <Compass className="w-40 h-40 text-amber-300" strokeWidth={0.5} />
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-7xl font-bold text-gray-700">
          404
        </span>
      </div>
      
      <h1 className="text-5xl md:text-6xl font-pacifico bg-gradient-to-r from-amber-600 via-orange-500 to-red-600 bg-clip-text text-transparent drop-shadow-sm leading-loose py-8">
        ¡Página Perdida!
      </h1>
      
      <p className="text-lg text-gray-600 mt-2 max-w-md">
        Parece que te has desviado del camino artesanal. La página que buscas no existe o fue movida.
      </p>
      
      <div className="mt-12 flex flex-col sm:flex-row items-center gap-4">
        <Link 
          href="/" 
          className="btn btn-primary bg-gradient-to-r from-amber-500 to-red-500 text-white border-none rounded-lg px-8 py-3 text-lg"
        >
          Volver al Inicio
        </Link>
        <Link 
          href="/products" 
          className="btn btn-ghost"
        >
          Ver todos los productos
        </Link>
      </div>

    </div>
  );
} 