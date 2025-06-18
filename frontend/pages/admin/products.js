import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';

export default function AdminProducts() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && isAdmin) fetchProducts();
    // eslint-disable-next-line
  }, [isAuthenticated, isAdmin]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/products?limit=100');
      setProducts(res.data.products);
    } catch (error) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return <div className="text-center py-12">Acceso denegado. Solo administradores pueden ver esta página.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-orange-600">Gestión de Productos</h1>
      {loading ? (
        <div className="text-center py-12">Cargando productos...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No hay productos registrados.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">Categoría</th>
                <th className="px-4 py-2 text-left">Artesano</th>
                <th className="px-4 py-2 text-left">Precio</th>
                <th className="px-4 py-2 text-left">Stock</th>
                <th className="px-4 py-2 text-left">Estado</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} className="border-t">
                  <td className="px-4 py-2">{product.id}</td>
                  <td className="px-4 py-2">
                    <Link href={`/products/${product.id}`} className="text-orange-600 hover:underline">{product.name}</Link>
                  </td>
                  <td className="px-4 py-2">{product.category_name}</td>
                  <td className="px-4 py-2">{product.artisan_name}</td>
                  <td className="px-4 py-2">${product.price}</td>
                  <td className="px-4 py-2">{product.stock}</td>
                  <td className="px-4 py-2">
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">{product.status}</span>
                  </td>
                  <td className="px-4 py-2">
                    {/* Aquí puedes agregar acciones como editar/eliminar */}
                    <button className="text-red-600 hover:underline text-sm" disabled>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 