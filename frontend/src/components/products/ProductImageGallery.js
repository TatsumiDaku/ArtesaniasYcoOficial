'use client';

import { useState, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs } from 'swiper/modules';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getImageUrl } from '@/utils/imageUrl';

import 'swiper/css/bundle';

const ProductImageGallery = ({ images, productName, stock }) => {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  const navigationPrevRef = useRef(null);
  const navigationNextRef = useRef(null);

  return (
    <div className="relative">
      {/* Superposición de Agotado */}
      {stock === 0 && (
        <div className="absolute top-4 right-4 z-10 bg-red-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
          Producto Agotado
        </div>
      )}

      {/* Carrusel Principal */}
      <Swiper
        modules={[Navigation, Thumbs]}
        spaceBetween={10}
        navigation={{
          prevEl: navigationPrevRef.current,
          nextEl: navigationNextRef.current,
        }}
        thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
        loop={true}
        className="aspect-square rounded-2xl overflow-hidden shadow-lg"
        onBeforeInit={(swiper) => {
            swiper.params.navigation.prevEl = navigationPrevRef.current;
            swiper.params.navigation.nextEl = navigationNextRef.current;
        }}
      >
        {images.map((image, index) => (
          <SwiperSlide key={index}>
            <Image
              src={getImageUrl(image)}
              alt={`${productName} - Imagen ${index + 1}`}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </SwiperSlide>
        ))}
        
        {/* Flechas de Navegación */}
        <div 
          ref={navigationPrevRef} 
          className="absolute top-1/2 left-3 z-10 -translate-y-1/2 bg-white/70 hover:bg-white transition-colors p-2 rounded-full shadow-md cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6 text-gray-800" />
        </div>
        <div 
          ref={navigationNextRef} 
          className="absolute top-1/2 right-3 z-10 -translate-y-1/2 bg-white/70 hover:bg-white transition-colors p-2 rounded-full shadow-md cursor-pointer"
        >
          <ChevronRight className="w-6 h-6 text-gray-800" />
        </div>
      </Swiper>

      {/* Miniaturas */}
      {images.length > 1 && (
        <div className="mt-3">
          <Swiper
            onSwiper={setThumbsSwiper}
            spaceBetween={10}
            slidesPerView={4}
            freeMode={true}
            watchSlidesProgress={true}
            modules={[Thumbs]}
            className="thumbs-swiper"
          >
            {images.map((image, index) => (
              <SwiperSlide key={index} className="cursor-pointer">
                <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-blue-400 transition-all duration-200">
                   <Image
                      src={getImageUrl(image)}
                      alt={`${productName} - Miniatura ${index + 1}`}
                      fill
                      sizes="25vw"
                      className="object-cover"
                    />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery; 