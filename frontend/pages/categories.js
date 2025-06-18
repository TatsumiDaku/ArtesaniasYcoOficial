import { useEffect, useState } from 'react';
import api from '../utils/api';
import Link from 'next/link';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/products/categories');
      setCategories(res.data);
    } catch (error) {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-orange-600">Categorías</h1>
      {loading ? (
        <div className="text-center py-12">Cargando categorías...</div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No hay categorías disponibles.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {categories.map(category => (
            <Link key={category.id} href={`/products?category=${category.id}`} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center mb-3">
                <span className="text-white font-bold text-2xl">{category.name.charAt(0)}</span>
              </div>
              <h2 className="font-semibold text-lg text-gray-900 mb-1">{category.name}</h2>
              <p className="text-gray-600 text-sm text-center line-clamp-2">{category.description}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 