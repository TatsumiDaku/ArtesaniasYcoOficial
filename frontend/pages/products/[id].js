import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useCart } from '../../context/CartContext';

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const { addToCart } = useCart();

  useEffect(() => {
    if (id) fetchProduct();
    // eslint-disable-next-line
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/products/${id}`);
      setProduct(res.data);
    } catch (error) {
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    setMessage('');
    const res = await addToCart(product.id, quantity);
    setMessage(res.message);
  };

  if (loading) {
    return <div className="text-center py-12">Cargando producto...</div>;
  }
  if (!product) {
    return <div className="text-center py-12 text-gray-500">Producto no encontrado.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2">
          <div className="bg-gray-100 rounded-lg overflow-hidden h-80 flex items-center justify-center">
            {product.images && product.images.length > 0 ? (
              <img src={`${process.env.NEXT_PUBLIC_API_URL}${product.images[0]}`} alt={product.name} className="object-cover h-full w-full" />
            ) : (
              <span className="text-gray-400">Sin imagen</span>
            )}
          </div>
        </div>
        <div className="md:w-1/2 flex flex-col justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <div className="text-orange-600 font-bold text-xl mb-2">${product.price}</div>
            <div className="text-gray-600 mb-4">{product.description}</div>
            <div className="text-sm text-gray-500 mb-2">Stock: {product.stock}</div>
            <div className="text-sm text-gray-500 mb-2">Categoría: {product.category_name}</div>
            <div className="text-sm text-gray-500 mb-2">Artesano: {product.artisan_name}</div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={product.stock}
              value={quantity}
              onChange={e => setQuantity(Number(e.target.value))}
              className="w-20 border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              onClick={handleAddToCart}
              className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors font-semibold"
              disabled={product.stock < 1}
            >
              Agregar al carrito
            </button>
          </div>
          {message && <div className="mt-2 text-sm text-green-600">{message}</div>}
        </div>
      </div>
    </div>
  );
} 