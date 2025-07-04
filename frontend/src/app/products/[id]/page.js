'use client';

import { useState, useEffect, use } from 'react';
import api from '@/utils/api';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useAuth } from '@/context/AuthContext';
import { Heart, ShoppingCart, Star, ArrowLeft, Package, User, Tag } from 'lucide-react';
import Reviews from '@/components/products/Reviews';
import SimilarProducts from '@/components/products/SimilarProducts';
import ProductImageGallery from '@/components/products/ProductImageGallery';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import imageUrl from '@/utils/imageUrl';

const ProductDetailPage = ({ params }) => {
  const { id } = use(params);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        setError('No se pudo cargar el producto.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);
  
  const handleAddToCart = () => {
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
    if (product) {
      addToCart(product, quantity);
      toast.success(`¡${product.name} añadido al carrito!`);
    }
  };

  const handleToggleFavorite = () => {
    if (!user) {
      toast.error('Debes iniciar sesión para añadir a favoritos.');
      return;
    }
    if (isFavorite(product.id)) {
      removeFavorite(product.id);
      toast.success('Producto removido de favoritos');
    } else {
      addFavorite(product.id);
      toast.success('Producto añadido a favoritos');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
              <p className="text-lg font-medium text-gray-600">Cargando producto...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Producto no encontrado</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver a Productos
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Producto no encontrado</h1>
          <p className="text-gray-600 mb-6">El producto que buscas no existe o ha sido removido.</p>
          <Link 
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver a Productos
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Botón Volver */}
        <div className="mb-6">
          <Link 
            href="/products"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-200 rounded-xl shadow-lg hover:shadow-xl text-gray-700 font-medium border border-gray-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Productos
          </Link>
        </div>

        {/* Header del Producto */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Galería de Imágenes */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8">
              <ProductImageGallery images={product.images || []} productName={product.name} stock={product.stock} />
            </div>

            {/* Información del Producto */}
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              {/* Categoría y Artesano */}
              <div className="flex items-center gap-4 mb-4">
                {product.category_name && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                    <Tag className="w-4 h-4" />
                    {product.category_name}
                  </span>
                )}
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                  <User className="w-4 h-4" />
                  {product.artisan_name || 'Artesano'}
                </span>
              </div>

              {/* Título */}
              <h1 className="text-4xl lg:text-5xl font-bold text-amber-700 font-pacifico mb-4 leading-tight">
                {product.name}
              </h1>

              {/* Precio */}
              <div className="mb-6">
                <p className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  ${parseFloat(product.price).toLocaleString('es-CO')} COP
                </p>
                <p className="text-sm text-gray-500 mt-1">Precio en pesos colombianos</p>
              </div>

              {/* Stock */}
              <div className="flex items-center gap-2 mb-6">
                <Package className="w-5 h-5 text-gray-500" />
                <span className="text-gray-600">
                  {product.stock > 0 ? (
                    <span className="text-green-600 font-semibold">
                      {product.stock} unidades disponibles
                    </span>
                  ) : (
                    <span className="text-red-600 font-semibold">
                      Agotado
                    </span>
                  )}
                </span>
              </div>

              {/* Descripción */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Descripción</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {product.description}
                </p>
              </div>

              {/* Acciones */}
              <div className="space-y-4">
                {/* Cantidad y Añadir al Carrito */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-3 text-gray-600 hover:bg-gray-100 transition-colors"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={product.stock}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10)))}
                      className="w-20 text-center py-3 border-0 focus:ring-0 text-lg font-semibold"
                    />
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-4 py-3 text-gray-600 hover:bg-gray-100 transition-colors"
                      disabled={quantity >= product.stock}
                    >
                      +
                    </button>
                  </div>
                  
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                    className="flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="w-6 h-6" />
                    {product.stock > 0 ? 'Añadir al Carrito' : 'Agotado'}
                  </button>
                </div>

                {/* Favoritos */}
                {user && user.role === 'cliente' && (
                  <button
                    onClick={handleToggleFavorite}
                    className={`w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl border-2 transition-all duration-300 font-semibold ${
                      isFavorite(product.id)
                        ? 'border-red-500 text-red-600 bg-red-50 hover:bg-red-100'
                        : 'border-gray-300 text-gray-600 hover:border-red-300 hover:text-red-600 hover:bg-red-50'
                    }`}
                  >
                    <Heart 
                      fill={isFavorite(product.id) ? 'currentColor' : 'none'} 
                      className="w-6 h-6" 
                    />
                    {isFavorite(product.id) ? 'En Favoritos' : 'Añadir a Favoritos'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reseñas */}
        <Reviews productId={id} />

        {/* Productos Similares */}
        <SimilarProducts currentProductId={id} categoryId={product.category_id} />
      </div>
    </div>
  );
};

export default ProductDetailPage;
 