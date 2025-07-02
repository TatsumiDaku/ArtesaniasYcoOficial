'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { Edit, Trash2, PlusCircle, RefreshCw, Package, Palette, TrendingUp, ArrowLeft, Settings, Shield, Loader2 } from 'lucide-react';

import api from '@/utils/api';
import withAuthProtection from '@/components/auth/withAuthProtection';
import DataTable from '@/components/ui/DataTable';
import { useAuth } from '@/context/AuthContext';

const ArtisanProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [stats, setStats] = useState({ products: 0, active: 0, pending: 0, inactive: 0 });
  const { user } = useAuth();
  const router = useRouter();

  const fetchArtisanData = useCallback(async (page = 1) => {
    if (!user) return;
    const isInitialLoad = page === 1;

    if (isInitialLoad) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const productsPromise = api.get('/products', { 
        params: { from: 'dashboard', page, limit: 10 } 
      });
      
      const statsPromise = isInitialLoad ? api.get('/stats/user') : Promise.resolve(null);

      const [productsRes, statsRes] = await Promise.all([productsPromise, statsPromise]);

      const { products: productsData, pagination: paginationData } = productsRes.data;
      
      setProducts(prev => isInitialLoad ? productsData : [...prev, ...productsData]);
      setPagination(paginationData);

      if (statsRes) {
        setStats(statsRes.data.products || { products: 0, active: 0, pending: 0, inactive: 0 });
      }

    } catch (error) {
      toast.error('No se pudieron cargar tus datos.');
      console.error("Failed to fetch artisan data:", error);
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchArtisanData(1);
  }, [fetchArtisanData]);

  const handleLoadMore = () => {
    if (pagination && pagination.page < pagination.pages) {
      fetchArtisanData(pagination.page + 1);
    }
  };

  const handleRefresh = () => {
    toast.loading('Actualizando productos...');
    fetchArtisanData(1).finally(() => toast.dismiss());
  };

  const handleDelete = useCallback(async (productId) => {
    if (window.confirm('¿Seguro que quieres ELIMINAR este producto? Esta acción es PERMANENTE y no se puede deshacer.')) {
      try {
        await api.delete(`/products/${productId}`);
        toast.success('Producto eliminado con éxito.');
        fetchArtisanData(1); // Recargar desde el principio
      } catch (error) {
        toast.error('Error al eliminar el producto.');
        console.error("Failed to delete product:", error);
      }
    }
  }, [fetchArtisanData]);

  const columns = useMemo(() => [
    {
      header: 'Imagen',
      accessorKey: 'images',
      cell: ({ getValue }) => {
        const API_BASE_URL = 'http://localhost:5000';
        const imageUrl = getValue() && getValue().length > 0 ? `${API_BASE_URL}${getValue()[0]}` : null;
        return imageUrl ? (
          <img
            src={imageUrl}
            alt="Producto"
            className="w-16 h-16 object-cover rounded-lg border"
            style={{ maxHeight: '64px' }}
          />
        ) : (
          <div className="w-[50px] h-[50px] bg-gray-700 rounded-md flex items-center justify-center text-xs text-gray-500">Foto</div>
        );
      },
    },
    { header: 'Nombre', accessorKey: 'name' },
    { header: 'Precio', accessorKey: 'price', cell: ({ row }) => `$${parseFloat(row.original.price || 0).toLocaleString('es-CO')} COP` },
    {
      header: 'Stock',
      accessorKey: 'stock',
      cell: ({ row }) => {
        const stock = row.original.stock;
        let color = 'text-green-700 bg-green-50 border border-green-200';
        if (stock <= 2) color = 'text-red-700 bg-red-100 border border-red-200 animate-pulse';
        else if (stock <= 5) color = 'text-yellow-800 bg-yellow-100 border border-yellow-200';
        return (
          <span className={`px-3 py-1.5 inline-flex text-xs font-bold rounded-full shadow-sm ${color}`}>{stock}</span>
        );
      }
    },
    {
      header: 'Estado',
      accessorKey: 'status',
      cell: ({ row }) => {
        const status = row.original.status;
        const statusInfo = {
          active: { text: 'Activo', className: 'bg-green-100 text-green-800 border border-green-200' },
          pending: { text: 'Pendiente', className: 'bg-orange-100 text-orange-800 border border-orange-200' },
          inactive: { text: 'Inactivo', className: 'bg-red-100 text-red-800 border border-red-200' },
        };
        const current = statusInfo[status] || statusInfo.pending;
        return (
          <span className={`px-3 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm ${current.className}`}>
            {current.text}
          </span>
        );
      },
    },
    {
      header: 'Acciones',
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex space-x-3">
          <button
            onClick={() => router.push(`/artisan/products/edit/${row.original.id}`)}
            className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded-lg hover:bg-blue-50"
            aria-label="Editar Producto"
          >
            <Edit className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleDelete(row.original.id)}
            className="text-red-600 hover:text-red-800 transition-colors p-1 rounded-lg hover:bg-red-50"
            aria-label="Eliminar Producto Permanentemente"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ], [router, handleDelete]);

  if (loading && !products.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
              <p className="text-lg font-medium text-gray-600">Cargando tus productos...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Botón Volver */}
        <div className="mb-6">
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-200 rounded-xl shadow-lg hover:shadow-xl text-gray-700 font-medium border border-gray-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Dashboard
          </Link>
        </div>

        {/* Header con gradiente */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 rounded-2xl p-8 text-white shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <Palette className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Mis Productos</h1>
                <p className="text-orange-100 text-lg">Gestiona tu catálogo artesanal</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-orange-100">
              <Shield className="w-5 h-5" />
              <span className="font-medium">Panel de artesano • {user?.name}</span>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
                <div className="flex items-center gap-3">
                  <Package className="w-6 h-6" />
                  <h3 className="text-lg font-bold">Total Productos</h3>
                </div>
              </div>
              <div className="p-6 text-center">
                <div className="text-3xl font-bold text-orange-600">{pagination?.total || 0}</div>
                <div className="text-sm text-gray-600">Productos creados</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6" />
                  <h3 className="text-lg font-bold">Activos</h3>
                </div>
              </div>
              <div className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600">{stats.active}</div>
                <div className="text-sm text-gray-600">En venta</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 text-white">
                <div className="flex items-center gap-3">
                  <Settings className="w-6 h-6" />
                  <h3 className="text-lg font-bold">Pendientes</h3>
                </div>
              </div>
              <div className="p-6 text-center">
                <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-sm text-gray-600">En revisión</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-pink-500 p-6 text-white">
                <div className="flex items-center gap-3">
                  <Package className="w-6 h-6" />
                  <h3 className="text-lg font-bold">Inactivos</h3>
                </div>
              </div>
              <div className="p-6 text-center">
                <div className="text-3xl font-bold text-red-600">{stats.inactive}</div>
                <div className="text-sm text-gray-600">Desactivados</div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel de control */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-800">Tu Catálogo</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRefresh}
                  className={`p-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors flex items-center justify-center ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                  title="Actualizar lista"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                  <RefreshCw className="w-5 h-5" />
                  )}
                </button>
                <Link 
                  href="/artisan/products/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>Añadir Producto</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de productos */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6">
            <DataTable columns={columns} data={products} loading={loading && !products.length} />
            {pagination && pagination.page < pagination.pages && (
              <div className="mt-6 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Cargando...
                    </>
                  ) : (
                    'Cargar Más Productos'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Información adicional para artesanos */}
        <div className="mt-12">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
              <h3 className="text-xl font-bold">Consejos para Artesanos</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl">
                  <div className="text-2xl font-bold text-orange-600">📸</div>
                  <div className="text-sm text-gray-600 mt-2">Fotos de calidad</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                  <div className="text-2xl font-bold text-green-600">📝</div>
                  <div className="text-sm text-gray-600 mt-2">Descripciones detalladas</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                  <div className="text-2xl font-bold text-purple-600">💰</div>
                  <div className="text-sm text-gray-600 mt-2">Precios competitivos</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuthProtection(ArtisanProductsPage, { requiredRole: 'artesano' }); 