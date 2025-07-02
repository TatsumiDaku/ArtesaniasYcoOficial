'use client';

import Image from 'next/image';

const PageLoader = () => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gray-100/80 backdrop-blur-sm transition-opacity duration-300">
      <div className="relative flex items-center justify-center w-48 h-48">
        {/* Pulsing glow effect */}
        <div className="absolute w-full h-full rounded-full bg-gradient-to-r from-amber-500 to-red-500 opacity-75 animate-ping"></div>

        {/* The logo itself */}
        <div className="relative bg-white p-4 rounded-full shadow-2xl">
          <img 
            src="/static/LogoIncial.png"
            alt="Artesanías & CO Logo"
            width={60}
            height={60}
            className="mb-4 animate-pulse"
          />
        </div>
      </div>
       <p className="mt-8 text-2xl font-pacifico text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-500 to-red-600 drop-shadow-sm">
        Un momento por favor...
      </p>
    </div>
  );
};

export default PageLoader; 