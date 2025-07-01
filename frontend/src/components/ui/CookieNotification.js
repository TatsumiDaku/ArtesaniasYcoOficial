"use client";
import { useEffect, useState } from 'react';

export default function CookieNotification() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const accepted = localStorage.getItem('cookie-accepted');
        if (!accepted) {
          setVisible(true);
          const timer = setTimeout(() => setVisible(false), 10000);
          return () => clearTimeout(timer);
        }
      }
    } catch (err) {
      console.error('cookie error', err);
    }
  }, []);

  const handleClose = () => {
    setVisible(false);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('cookie-accepted', 'true');
      }
    } catch (err) {
      console.error('cookie error', err);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-white border border-gray-200 shadow-lg rounded-lg px-6 py-4 flex items-center gap-4 max-w-md animate-fade-in">
      <span className="text-gray-800 text-sm">
        Este sitio utiliza cookies para mejorar tu experiencia. Al continuar navegando, aceptas nuestra <a href="/legal/privacidad" className="underline text-blue-600">Política de Privacidad</a>.
      </span>
      <button onClick={handleClose} aria-label="Cerrar" className="ml-auto text-gray-500 hover:text-gray-800 text-lg font-bold px-2 py-1 rounded-full focus:outline-none">
        ×
      </button>
    </div>
  );
} 