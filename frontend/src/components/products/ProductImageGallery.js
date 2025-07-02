'use client';

import { useState, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs } from 'swiper/modules';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import imageUrl from '@/utils/imageUrl';

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
        className="aspect-square rounded-2xl overflow-hidden shadow-lg w-full max-w-xs md:max-w-md lg:max-w-lg mx-auto"
        onBeforeInit={(swiper) => {
            swiper.params.navigation.prevEl = navigationPrevRef.current;
            swiper.params.navigation.nextEl = navigationNextRef.current;
        }}
      >
        {images.map((image, index) => (
          <SwiperSlide key={index}>
            <div className="relative h-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden shadow-inner">
              {image && image.startsWith('/uploads') ? (
                <img
                  src={imageUrl(image)}
                  alt={`Imagen ${index + 1} del producto`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <Image
                  src={imageUrl(image)}
                  alt={`Imagen ${index + 1} del producto`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 25vw, 15vw"
                />
              )}
            </div>
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
                  {image && image.startsWith('/uploads') ? (
                    <img
                      src={imageUrl(image)}
                      alt={`Imagen ${index + 1} del producto`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <Image
                      src={imageUrl(image)}
                      alt={`Imagen ${index + 1} del producto`}
                      fill
                      className="object-cover"
                      sizes="25vw"
                    />
                  )}
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