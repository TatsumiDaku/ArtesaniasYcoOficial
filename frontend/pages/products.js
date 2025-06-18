import { useEffect, useState } from 'react';
import api from '../utils/api';
import Link from 'next/link';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/products');
      setProducts(res.data.products);
    } catch (error) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-orange-600">Productos</h1>
      {loading ? (
        <div className="text-center py-12">Cargando productos...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No hay productos disponibles.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <Link key={product.id} href={`/products/${product.id}`} className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
              <div className="h-48 bg-gray-100 flex items-center justify-center">
                {product.images && product.images.length > 0 ? (
                  <img src={`${process.env.NEXT_PUBLIC_API_URL}${product.images[0]}`} alt={product.name} className="object-cover h-full w-full" />
                ) : (
                  <span className="text-gray-400">Sin imagen</span>
                )}
              </div>
              <div className="p-4">
                <h2 className="font-semibold text-lg text-gray-900 mb-1">{product.name}</h2>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                <div className="font-bold text-orange-600 text-lg">${product.price}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 