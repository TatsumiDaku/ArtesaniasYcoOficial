"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { BarChart3, Loader2, Package, ShoppingBag, Heart, User, Download } from "lucide-react";
import api from '@/utils/api';
import Image from "next/image";

export default function AdminArtisanStatisticsPage() {
  const { id } = useParams();
  const [artisan, setArtisan] = useState(null);
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [userRes, statsRes, productsRes] = await Promise.all([
          api.get(`/users/admin/${id}`),
          api.get(`/stats/user/${id}`),
          api.get(`/products?artisan_id=${id}`)
        ]);
        setArtisan(userRes.data);
        setStats(statsRes.data);
        setProducts(productsRes.data.products || []);
      } catch (err) {
        setError('No se encontró el artesano o no se pudieron cargar los datos.');
        setArtisan(null);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  // Exportar productos a CSV
  const handleExportProducts = async () => {
    setExporting(true);
    try {
      const res = await api.get(`/api/products/export/csv?artisan_id=${id}`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute('download', `productos-artesano-${id}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      alert('No se pudo exportar el CSV');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mb-4" />
        <p className="text-lg text-gray-600">Cargando estadísticas...</p>
      </div>
    );
  }

  if (error || !artisan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-lg text-red-500">{error || 'No se encontró el artesano.'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-4xl bg-white/90 rounded-2xl shadow-2xl p-8 border border-emerald-100">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-10 h-10 text-emerald-500" />
          <h1 className="text-2xl font-bold">Estadísticas de {artisan.name}</h1>
        </div>
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-lg text-gray-700">Panel del artesano <span className="font-bold text-emerald-700">{artisan.name}</span> ({artisan.email})</p>
          <button onClick={handleExportProducts} className="btn btn-sm bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-bold flex items-center gap-1 shadow-md" disabled={exporting} title="Exportar productos a CSV">
            <Download className="w-4 h-4" /> Productos CSV
          </button>
        </div>
        {stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-r from-emerald-100 to-teal-100 rounded-xl p-6 flex flex-col items-center border border-emerald-200 shadow-inner">
              <Package className="w-8 h-8 text-emerald-600 mb-2" />
              <div className="text-3xl font-bold text-emerald-700">{stats.products}</div>
              <div className="text-gray-700 font-semibold">Productos publicados</div>
            </div>
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-6 flex flex-col items-center border border-yellow-200 shadow-inner">
              <ShoppingBag className="w-8 h-8 text-orange-500 mb-2" />
              <div className="text-3xl font-bold text-orange-600">{stats.sales}</div>
              <div className="text-gray-700 font-semibold">Pedidos con ventas</div>
            </div>
            <div className="bg-gradient-to-r from-pink-100 to-red-100 rounded-xl p-6 flex flex-col items-center border border-pink-200 shadow-inner">
              <Heart className="w-8 h-8 text-pink-500 mb-2" />
              <div className="text-3xl font-bold text-pink-600">{stats.favorites}</div>
              <div className="text-gray-700 font-semibold">Favoritos (como cliente)</div>
            </div>
            <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl p-6 flex flex-col items-center border border-blue-200 shadow-inner">
              <User className="w-8 h-8 text-indigo-500 mb-2" />
              <div className="text-3xl font-bold text-indigo-600">{stats.orders}</div>
              <div className="text-gray-700 font-semibold">Pedidos realizados (como cliente)</div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500">No hay estadísticas disponibles.</div>
        )}
        <div className="mb-8">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-xl text-yellow-800 shadow flex items-center gap-3">
            <span className="font-bold">Nota:</span>
            <span>Por motivos de seguridad, solo se muestran datos generales y productos. Para ver ventas, reseñas y métricas avanzadas, consulta el panel del artesano.</span>
          </div>
        </div>
        {/* Listado de productos publicados */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-emerald-700 mb-3 flex items-center gap-2"><Package className="w-5 h-5" /> Productos publicados</h2>
          {products.length === 0 ? (
            <div className="text-gray-400">No hay productos publicados.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-emerald-100">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Imagen</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Nombre</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Precio</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Stock</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id} className="hover:bg-emerald-50">
                      <td className="px-4 py-2">
                        {product.images && product.images.length > 0 ? (
                          <Image src={product.images[0].startsWith('http') ? product.images[0] : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${product.images[0]}`} alt={product.name} width={40} height={40} className="rounded object-cover border" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400 border">Sin foto</div>
                        )}
                      </td>
                      <td className="px-4 py-2 font-semibold text-emerald-900">{product.name}</td>
                      <td className="px-4 py-2 text-green-700 font-bold">${parseFloat(product.price).toLocaleString('es-CO')} COP</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.stock > 10 ? 'bg-green-100 text-green-800' :
                          product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {product.stock || 0}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold shadow-sm ${
                          product.status === 'active' ? 'bg-green-100 text-green-700' :
                          product.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {product.status === 'active' ? 'Activo' : product.status === 'pending' ? 'Pendiente' : 'Inactivo'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 