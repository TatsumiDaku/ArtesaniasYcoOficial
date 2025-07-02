'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Star, User, MessageSquare } from 'lucide-react';
import { useFavorites } from '@/context/FavoritesContext';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import imageUrl from '@/utils/imageUrl';
import { useRouter } from 'next/navigation';

const StarRating = ({ rating, className }) => {
  const totalStars = 5;
  const fullStars = Math.round(rating);
  
  return (
    <div className={`flex items-center ${className}`}>
      {[...Array(totalStars)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < fullStars ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
        />
      ))}
    </div>
  );
};

const ProductCard = ({ product }) => {
  const { user } = useAuth();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { addToCart } = useCart();
  const router = useRouter();
  
  if (!product || !product.id) {
    return null;
  }
  
  const getImageSrc = () => {
    if (product.images && product.images.length > 0) {
      const image = product.images[0];
      if (image.startsWith('/uploads')) {
        return imageUrl(image);
      }
      if (image.startsWith('http')) {
        return image;
      }
      return imageUrl(image);
    }
    return '/static/placeholder.png';
  };

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error('Debes iniciar sesión para agregar a favoritos');
      return;
    }
    if (isFavorite(product.id)) {
      removeFavorite(product.id);
    } else {
      addFavorite(product.id);
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!user) {
      toast((t) => (
        <div className="flex flex-col gap-2">
          <span>Para añadir al carrito debes iniciar sesión.</span>
          <button
            onClick={() => {
              router.push('/register');
              toast.dismiss(t.id);
            }}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Regístrate
          </button>
        </div>
      ), { duration: 6000 });
      return;
    }
    if (product.stock === 0) {
      toast.error('Este producto está agotado');
      return;
    }
    addToCart(product);
    toast.success('Producto añadido al carrito');
  };

  const averageRating = parseFloat(product.average_rating) || 0;
  const reviewCount = product.review_count || 0;

  return (
    <Link 
      href={`/products/${product.id}`} 
      className="group relative block overflow-hidden bg-white rounded-2xl shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2 border border-gray-100 hover:border-amber-300"
    >
      <div className="relative w-full h-56 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        <Image
          src={getImageSrc()}
          alt={product.name || 'Producto'}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.target.src = '/static/placeholder.png';
          }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {product.stock === 0 && (
          <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg backdrop-blur-sm">
            AGOTADO
          </div>
        )}
        
        {user?.role === 'cliente' && (
          <button
            onClick={handleFavoriteClick}
            className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-700 hover:text-red-500 hover:bg-white shadow-lg transition-all duration-200 hover:scale-110"
            aria-label="Añadir a favoritos"
          >
            <Heart 
              fill={isFavorite(product.id) ? 'currentColor' : 'none'} 
              className="w-5 h-5" 
            />
          </button>
        )}
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <span className="inline-block text-xs font-semibold text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
            {product.category_name || 'Sin Categoría'}
          </span>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <StarRating rating={averageRating} />
            <span className="font-medium ml-1">{averageRating.toFixed(1)}</span>
            <span className="text-gray-400">({reviewCount})</span>
          </div>
        </div>
        
        <h3 className="text-lg font-bold text-gray-800 font-pacifico mb-2 line-clamp-2 min-h-[3.5rem] leading-tight" title={product.name}>
          {product.name || 'Producto sin nombre'}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2 min-h-[2.5rem]">
          {product.description || 'Sin descripción disponible'}
        </p>
        
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <User className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="truncate">
            Por <span className="font-medium text-gray-700">{product.artisan_name || 'Artesano'}</span>
          </span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex-1">
            <p className="text-2xl font-bold text-gray-900">
              ${parseFloat(product.price || 0).toLocaleString('es-CO')}
            </p>
            <p className="text-xs text-gray-500 -mt-1">COP</p>
          </div>
          
          <div className="transition-all duration-300 transform translate-x-2 opacity-60 group-hover:translate-x-0 group-hover:opacity-100">
            <button
              onClick={handleAddToCart}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 flex items-center gap-2 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Añadir al carrito"
              disabled={product.stock === 0}
            >
              <ShoppingCart className="w-4 h-4" />
              Añadir
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard; 