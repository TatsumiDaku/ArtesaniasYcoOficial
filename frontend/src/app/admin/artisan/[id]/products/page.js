'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { ShieldCheck, Edit, Trash2, ArrowLeft, Package, Store, RefreshCw, Search, Eye, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

import api from '@/utils/api';
import withAuthProtection from '@/components/auth/withAuthProtection';
import DataTable from '@/components/ui/DataTable';

const ArtisanProductsAdminPage = () => {
  const [products, setProducts] = useState([]);
  const [artisan, setArtisan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const router = useRouter();
  const params = useParams();
  const artisanId = params.id;

  const fetchArtisanAndProducts = useCallback(async () => {
    if (!artisanId) return;
    setLoading(true);
    try {
      const artisanPromise = api.get(`/users/admin/${artisanId}`);
      const productsPromise = api.get(`/products?artisan_id=${artisanId}`);
      
      const [artisanRes, productsRes] = await Promise.all([artisanPromise, productsPromise]);
      
      setArtisan(artisanRes.data);
      setProducts(productsRes.data.products || []);
    } catch (error) {
      toast.error('No se pudieron cargar los datos del artesano.');
      console.error("Failed to fetch data:", error);
      router.push('/admin/users');
    } finally {
      setLoading(false);
    }
  }, [artisanId, router]);

  useEffect(() => {
    fetchArtisanAndProducts();
  }, [fetchArtisanAndProducts]);

  const handleApprove = useCallback(async (productId) => {
    toast.loading('Aprobando producto...');
    try {
      await api.put(`/products/${productId}/approve`);
      toast.dismiss();
      toast.success('Producto aprobado y hecho público.');
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, is_public: true } : p));
    } catch (error) {
      toast.dismiss();
      toast.error('Error al aprobar el producto.');
    }
  }, []);

  const handleDelete = useCallback(async (productId) => {
    if (window.confirm('¿Seguro que quieres ELIMINAR este producto?')) {
      toast.loading('Eliminando producto...');
      try {
        await api.delete(`/products/${productId}`);
        toast.dismiss();
        toast.success('Producto eliminado con éxito.');
        setProducts(prev => prev.filter(p => p.id !== productId));
      } catch (error) {
        toast.dismiss();
        toast.error('Error al eliminar el producto.');
      }
    }
  }, []);

  const filteredProducts = useMemo(() => {
    const searchFiltered = products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return searchFiltered.filter(product => 
      statusFilter === 'all' || product.status === statusFilter
    );
  }, [products, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const total = products.length;
    const active = products.filter(p => p.status === 'active').length;
    const pending = products.filter(p => p.status === 'pending').length;
    const inactive = products.filter(p => p.status === 'inactive').length;
    return { total, active, pending, inactive };
  }, [products]);
  
  const columns = useMemo(() => [
    {
      header: 'Imagen',
      accessorKey: 'images',
      cell: ({ row }) => {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const imageUrl = row.original.images && row.original.images.length > 0 ? `${API_BASE_URL}${row.original.images[0]}` : null;
        return imageUrl ? (
          <Image src={imageUrl} alt={row.original.name} width={60} height={60} className="rounded-lg object-cover shadow-md border border-gray-200" />
        ) : (
          <div className="w-[60px] h-[60px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-500 border border-gray-200">
            Sin foto
          </div>
        );
      },
    },
    { 
      header: 'Nombre', 
      accessorKey: 'name',
      cell: ({ row }) => (
        <div>
          <span className="font-semibold text-gray-800">{row.original.name}</span>
          <p className="text-xs text-gray-500 mt-1">{row.original.category_name || 'Sin categoría'}</p>
        </div>
      )
    },
    { 
      header: 'Precio', 
      accessorKey: 'price', 
      cell: ({ row }) => (
        <span className="font-bold text-green-600">${parseFloat(row.original.price || 0).toFixed(2)}</span>
      )
    },
    { 
      header: 'Stock', 
      accessorKey: 'stock',
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.original.stock > 10 ? 'bg-green-100 text-green-800' :
          row.original.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {row.original.stock || 0}
        </span>
      )
    },
    {
      header: 'Estado',
      accessorKey: 'status',
      cell: ({ row }) => {
        const status = row.original.status;
        const statusInfo = {
          active: { text: 'Activo', className: 'bg-green-100 text-green-800 border-green-200' },
          pending: { text: 'Pendiente', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
          inactive: { text: 'Inactivo', className: 'bg-red-100 text-red-800 border-red-200' },
        };
        const current = statusInfo[status] || statusInfo.pending;
        return (
          <span className={`px-3 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full border ${current.className}`}>
            {current.text}
          </span>
        );
      },
    },
    {
      header: 'Acciones',
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          {row.original.status === 'pending' && (
            <button
              onClick={() => handleApprove(row.original.id)}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-200 text-xs font-medium"
              title="Aprobar Producto"
            >
              <ShieldCheck className="w-3 h-3" />
              Aprobar
            </button>
          )}
          <button
            onClick={() => router.push(`/artisan/products/edit/${row.original.id}`)}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 text-xs font-medium"
            title="Editar Producto"
          >
            <Edit className="w-3 h-3" />
            Editar
          </button>
          <button
            onClick={() => handleDelete(row.original.id)}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200 text-xs font-medium"
            title="Eliminar Producto"
          >
            <Trash2 className="w-3 h-3" />
            Eliminar
          </button>
        </div>
      ),
    },
  ], [router, handleApprove, handleDelete]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
              <p className="text-lg font-medium text-gray-600">Cargando productos del artesano...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!artisan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">❌</div>
            <p className="text-xl font-semibold text-gray-800 mb-2">Artesano no encontrado</p>
            <p className="text-gray-600">El artesano que buscas no existe o ha sido eliminado.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <Link 
            href="/admin/users"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-200 rounded-xl shadow-lg hover:shadow-xl text-gray-700 font-medium border border-gray-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Usuarios
          </Link>
        </div>

        <div className="mb-8">
          <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-2xl p-8 text-white shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <Store className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Productos de {artisan.name}</h1>
                <p className="text-orange-100 text-lg">Gestiona el catálogo completo del artesano</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-orange-100">
              <Package className="w-5 h-5" />
              <span className="font-medium">Aprobación • Modificación • Control de calidad</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                  <Package className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold">Total</h3>
              </div>
            </div>
            <div className="p-6 text-center">
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Productos</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold">Activos</h3>
              </div>
            </div>
            <div className="p-6 text-center">
              <div className="text-3xl font-bold text-gray-900">{stats.active}</div>
              <div className="text-sm text-gray-600">Publicados</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold">Pendientes</h3>
              </div>
            </div>
            <div className="p-6 text-center">
              <div className="text-3xl font-bold text-gray-900">{stats.pending}</div>
              <div className="text-sm text-gray-600">Por aprobar</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-pink-500 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold">Inactivos</h3>
              </div>
            </div>
            <div className="p-6 text-center">
              <div className="text-3xl font-bold text-gray-900">{stats.inactive}</div>
              <div className="text-sm text-gray-600">Eliminados</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="pending">Pendientes</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
            <button
              onClick={fetchArtisanAndProducts}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:from-emerald-600 hover:to-teal-700"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Recargar
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full p-2">
                <Package className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Lista de Productos</h2>
              <span className="text-sm text-gray-600">({filteredProducts.length} productos)</span>
            </div>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full mb-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  </div>
                  <p className="text-lg font-medium text-gray-600">Cargando productos...</p>
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📦</div>
                <p className="text-xl font-semibold text-gray-800 mb-2">No se encontraron productos</p>
                <p className="text-gray-600">Intenta ajustar los filtros de búsqueda</p>
              </div>
            ) : (
              <DataTable columns={columns} data={filteredProducts} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuthProtection(ArtisanProductsAdminPage, { requiredRole: 'admin' }); 