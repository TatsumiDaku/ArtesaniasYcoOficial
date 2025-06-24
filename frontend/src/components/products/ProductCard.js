'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Star, User, MessageSquare } from 'lucide-react';
import { useFavorites } from '@/context/FavoritesContext';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { getImageUrl } from '@/utils/imageUrl';

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
  
  if (!product || !product.id) {
    return null;
  }
  
  const API_BASE_URL = 'http://localhost:5000';
  const imageUrl = product.images && product.images.length > 0 
    ? getImageUrl(product.images[0])
    : '/static/LogoIncial.png';

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
    e.preventDefault();
    e.stopPropagation();
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
      className="group relative block overflow-hidden bg-white rounded-xl shadow-md transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1 border-2 border-transparent hover:border-amber-500"
    >
      <div className="relative w-full h-64">
        <Image
          src={imageUrl}
          alt={product.name || 'Imagen del producto'}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        { product.stock === 0 && (
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full">AGOTADO</div>
        )}
        { user?.role === 'cliente' && (
          <button
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-700 hover:text-red-500 scale-100 group-hover:scale-110 transition-all duration-200"
            aria-label="Añadir a favoritos"
          >
            <Heart fill={isFavorite(product.id) ? 'currentColor' : 'none'} className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-amber-800 bg-amber-100 px-2 py-1 rounded-full mb-2">
                {product.category_name || 'Sin Categoría'}
            </span>
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                <StarRating rating={averageRating} />
                    <span className="font-medium">{averageRating.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    <span className="font-medium">{reviewCount}</span>
                </div>
            </div>
        </div>
        
        <h3 className="text-lg font-bold text-gray-800 truncate h-14 leading-tight mt-2" title={product.name}>
          {product.name || 'Producto sin nombre'}
        </h3>
        
        <div className="flex items-center text-sm text-gray-500 mt-1">
          <User className="w-4 h-4 mr-2" />
          <span>Por <span className="font-medium text-gray-700">{product.artisan_name || 'Artesano'}</span></span>
        </div>

        <div className="mt-4 h-12 flex items-center justify-between">
            <div>
                <p className="text-2xl font-extrabold text-gray-900">${parseFloat(product.price || 0).toLocaleString('es-CO')}</p>
                 <p className="text-xs text-gray-500 -mt-1">COP</p>
            </div>
          
            <div className="transition-all duration-300 transform-gpu translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100">
                 <button
                    onClick={handleAddToCart}
                    className="btn btn-primary btn-sm bg-gradient-to-r from-amber-500 to-red-600 text-white border-none rounded-lg"
                    aria-label="Añadir al carrito"
                    disabled={product.stock === 0}
                >
                    <ShoppingCart className="w-4 h-4" />
                </button>
            </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard; 