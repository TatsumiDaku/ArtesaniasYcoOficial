'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart } from 'lucide-react';
import { useFavorites } from '@/context/FavoritesContext';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const SimilarProducts = ({ currentProductId, categoryId }) => {
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { addToCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    const fetchSimilarProducts = async () => {
      if (!categoryId) return;
      
      try {
        const res = await api.get('/products', {
          params: {
            category_id: categoryId,
            limit: 4,
            exclude: currentProductId
          }
        });
        
        // Filtrar el producto actual y limitar a 4 productos
        const filtered = res.data.products
          .filter(product => product.id !== currentProductId)
          .slice(0, 4);
        
        setSimilarProducts(filtered);
      } catch (error) {
        console.error('Error fetching similar products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarProducts();
  }, [categoryId, currentProductId]);

  const handleFavoriteClick = (e, productId) => {
    e.preventDefault();
    if (!user) {
      toast.error('Debes iniciar sesión para agregar a favoritos');
      return;
    }
    if (isFavorite(productId)) {
      removeFavorite(productId);
    } else {
      addFavorite(productId);
    }
  };

  const handleAddToCart = (e, product) => {
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
    addToCart(product);
    toast.success('Producto añadido al carrito');
  };

  if (loading) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Productos Similares</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (similarProducts.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Productos Similares</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {similarProducts.map((product) => {
          const API_BASE_URL = 'http://localhost:5000';
          const imageUrl = product.images && product.images.length > 0 
            ? `${API_BASE_URL}${product.images[0]}`
            : null;

          return (
            <Link 
              key={product.id} 
              href={`/products/${product.id}`}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative h-48">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={product.name || 'Imagen del producto'}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">Sin imagen</span>
                  </div>
                )}
                
                {user && user.role === 'cliente' && (
                  <button
                    onClick={(e) => handleFavoriteClick(e, product.id)}
                    className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-700 hover:text-red-500 hover:scale-110 transition-all duration-200"
                    aria-label="Añadir a favoritos"
                  >
                    <Heart 
                      fill={isFavorite(product.id) ? 'currentColor' : 'none'} 
                      className="w-4 h-4" 
                    />
                  </button>
                )}
              </div>

              <div className="p-4">
                {product.category_name && (
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full mb-2">
                    {product.category_name}
                  </span>
                )}
                
                <h3 className="text-sm font-semibold text-gray-800 truncate mb-1" title={product.name}>
                  {product.name || 'Producto sin nombre'}
                </h3>
                
                <p className="text-xs text-gray-600 mb-3">
                  Por {product.artisan_name || 'Artesano'}
                </p>

                <div className="flex justify-between items-center">
                  <p className="text-lg font-bold text-blue-600">
                    ${parseFloat(product.price || 0).toLocaleString('es-CO')} COP
                  </p>
                  
                  <button
                    onClick={(e) => handleAddToCart(e, product)}
                    className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200"
                    aria-label="Añadir al carrito"
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default SimilarProducts; 