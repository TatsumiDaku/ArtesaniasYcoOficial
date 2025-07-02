'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { CheckCircle, Edit, Trash2, ShieldCheck, HelpCircle, Package, ArrowLeft, RefreshCw, Filter, Search, Eye, Clock, PlusCircle, Users, Tag, Loader2, AlertTriangle, X } from 'lucide-react';
import Link from 'next/link';

import api from '@/utils/api';
import withAuthProtection from '@/components/auth/withAuthProtection';
import DataTable from '@/components/ui/DataTable';
import imageUrl from '@/utils/imageUrl';

// =================================================================================
// Componente de Gestión de Categorías
// =================================================================================
const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const fetchCategories = useCallback(async (page = 1) => {
    const isInitialLoad = page === 1;
    if (isInitialLoad) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const { data } = await api.get(`/categories/admin?page=${page}&limit=10`);
      setCategories(prev => isInitialLoad ? data.data : [...prev, ...data.data]);
      setPagination(data.pagination);
      setError(null);
    } catch (err) {
      setError('No se pudieron cargar las categorías.');
      toast.error('Error al cargar las categorías.');
      console.error(err);
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchCategories(1);
  }, [fetchCategories]);

  const handleLoadMore = () => {
    if (pagination && pagination.page < pagination.pages) {
      fetchCategories(pagination.page + 1);
    }
  };

  const openModalForCreate = () => {
    reset({ name: '', description: '' });
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (category) => {
    setEditingCategory(category);
    setValue('name', category.name);
    setValue('description', category.description);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    reset();
  };

  const onSubmit = async (formData) => {
    const toastId = toast.loading(editingCategory ? 'Actualizando...' : 'Creando...');
    try {
      if (editingCategory) {
        await api.put(`/categories/admin/${editingCategory.id}`, formData);
      } else {
        await api.post('/categories/admin', formData);
      }
      toast.success(`Categoría ${editingCategory ? 'actualizada' : 'creada'} con éxito.`, { id: toastId });
      fetchCategories(1);
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ocurrió un error.', { id: toastId });
      console.error(err);
    }
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría? Esta acción no se puede deshacer.')) {
      const toastId = toast.loading('Eliminando...');
      try {
        await api.delete(`/categories/admin/${categoryId}`);
        toast.success('Categoría eliminada con éxito.', { id: toastId });
        fetchCategories(1);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Error al eliminar.', { id: toastId });
        console.error(err);
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200/80 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <Tag className="w-7 h-7 text-indigo-500" />
          Gestión de Categorías
        </h2>
        <button
          onClick={openModalForCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg"
        >
          <PlusCircle className="w-5 h-5" />
          Nueva Categoría
        </button>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="ml-3 text-gray-600">Cargando categorías...</p>
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-10 bg-red-50 rounded-lg border border-red-200">
          <AlertTriangle className="w-10 h-10 text-red-500 mb-2" />
          <p className="text-red-700 font-semibold">{error}</p>
        </div>
      )}

      {!loading && !error && categories.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Categoría</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Artesanos</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-semibold text-gray-900">{cat.name}</div>
                    <div className="text-sm text-gray-500">{cat.description || 'Sin descripción'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{cat.artisan_count}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => openModalForEdit(cat)} className="text-indigo-600 hover:text-indigo-900 transition-colors" title="Editar">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:text-red-900 transition-colors" title="Eliminar">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
                  'Cargar Más'
                )}
              </button>
            </div>
          )}
        </div>
      )}
      
      {!loading && !error && categories.length === 0 && (
         <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
          <Tag className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay categorías</h3>
          <p className="mt-1 text-sm text-gray-500">Crea la primera categoría para empezar a organizar los productos.</p>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4" style={{ backdropFilter: 'blur(4px)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md z-50 transform transition-all scale-95 animate-in fade-in-0 zoom-in-95">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">{editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
                  <button type="button" onClick={closeModal} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input
                      id="name"
                      type="text"
                      {...register('name', { required: 'El nombre es obligatorio' })}
                      className={`w-full px-3 py-2 border rounded-lg transition-colors ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'} focus:border-indigo-500 focus:ring-2`}
                      placeholder="Ej: Cerámica"
                    />
                    {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descripción (Opcional)</label>
                    <textarea
                      id="description"
                      {...register('description')}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="Una breve descripción de la categoría"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 border border-transparent rounded-lg text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
                >
                  {editingCategory ? 'Guardar Cambios' : 'Crear Categoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, inactive: 0, lowStock: 0 });
  const router = useRouter();

  const fetchProducts = useCallback(async (page = 1, search = searchTerm, status = statusFilter) => {
    const isInitialLoad = page === 1;
    if (isInitialLoad) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      // Construir los query params
      const params = new URLSearchParams({
        page,
        limit: 10,
      });
      if (search) params.append('search', search);
      if (status !== 'all') params.append('status', status);

      const res = await api.get(`/products?${params.toString()}`);
      setProducts(prev => isInitialLoad ? res.data.products : [...prev, ...res.data.products]);
      setPagination(res.data.pagination);
    } catch (error) {
      toast.error('No se pudieron cargar los productos.');
      console.error("Failed to fetch products:", error);
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  }, [searchTerm, statusFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/stats/dashboard');
      if (res.data && res.data.products) {
        setStats(res.data.products);
      }
    } catch (err) {
      toast.error('No se pudieron cargar las estadísticas de productos.');
      console.error('Error al cargar estadísticas:', err);
    }
  }, []);
  
  const handleRefresh = useCallback(() => {
    fetchProducts(1);
    fetchStats();
  }, [fetchProducts, fetchStats]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchProducts(1, searchTerm, statusFilter);
    }, 300);
    return () => clearTimeout(handler);
  }, [fetchProducts, searchTerm, statusFilter]);

  const handleLoadMore = () => {
    if (pagination && pagination.page < pagination.pages) {
      fetchProducts(pagination.page + 1);
    }
  };

  const handleApprove = useCallback(async (productId) => {
    toast.promise(
      api.put(`/products/${productId}/approve`),
      {
        loading: 'Aprobando producto...',
        success: (data) => {
          handleRefresh();
          return 'Producto aprobado con éxito';
        },
        error: 'No se pudo aprobar el producto',
      }
    );
  }, [handleRefresh]);

  const handleRevert = useCallback(async (productId) => {
    toast.promise(
      api.put(`/products/${productId}/revert`),
      {
        loading: 'Cambiando a pendiente...',
        success: () => {
          handleRefresh();
          return 'Producto marcado como pendiente.';
        },
        error: 'No se pudo cambiar el estado del producto.',
      }
    );
  }, [handleRefresh]);

  const handleDelete = useCallback(async (productId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.')) {
      toast.loading('Eliminando producto...');
      try {
        await api.delete(`/products/${productId}`);
        toast.dismiss();
        toast.success('Producto eliminado con éxito.');
        setProducts(prev => prev.filter(p => p.id !== productId));
      } catch (error) {
        toast.dismiss();
        toast.error('Error al eliminar el producto.');
        console.error("Failed to delete product:", error);
      }
    }
  }, []);

  // Filtrar productos
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.artisan_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [products, searchTerm, statusFilter]);

  // Estadísticas
  // This is removed because stats are now fetched from the API
  /*
  const stats = useMemo(() => {
    const total = products.length;
    const active = products.filter(p => p.status === 'active').length;
    const pending = products.filter(p => p.status === 'pending').length;
    const inactive = products.filter(p => p.status === 'inactive').length;
    return { total, active, pending, inactive };
  }, [products]);
  */
  
  const columns = useMemo(() => [
    {
      header: 'Imagen',
      accessorKey: 'images',
      cell: ({ row }) => {
        const imageSrc = row.original.images && row.original.images.length > 0 
          ? imageUrl(row.original.images[0]) 
          : '/static/placeholder.png';
        
        return (
          <Image
            src={imageSrc}
            alt={row.original.name || 'Producto'}
            width={60}
            height={60}
            className="rounded-lg object-cover shadow-md border border-gray-200 w-16 h-16"
            onError={(e) => {
              e.target.src = '/static/placeholder.png';
            }}
          />
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
      header: 'Artesano', 
      accessorKey: 'artisan_name',
      cell: ({ row }) => (
        <span className="text-gray-700 font-medium">{row.original.artisan_name || 'Desconocido'}</span>
      )
    },
    { 
      header: 'Precio', 
      accessorKey: 'price', 
      cell: ({ row }) => (
        <span className="font-bold text-green-600">${parseFloat(row.original.price || 0).toLocaleString('es-CO')} COP</span>
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
          {row.original.status === 'pending' ? (
            <button
              onClick={() => handleApprove(row.original.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-200 text-xs font-medium"
              title="Aprobar Producto"
            >
              <CheckCircle className="w-4 h-4" />
              Aprobar
            </button>
          ) : (
            <button
              onClick={() => handleRevert(row.original.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-all duration-200 text-xs font-medium"
              title="Marcar como Pendiente"
            >
              <Clock className="w-4 h-4" />
              Pendiente
            </button>
          )}
          <button
            onClick={() => router.push(`/artisan/products/edit/${row.original.id}`)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 text-xs font-medium"
            title="Editar Producto"
          >
            <Edit className="w-3 h-3" />
            Editar
          </button>
          <button
            onClick={() => handleDelete(row.original.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200 text-xs font-medium"
            title="Eliminar Producto"
          >
            <Trash2 className="w-3 h-3" />
            Eliminar
          </button>
        </div>
      ),
    },
  ], [router, handleApprove, handleRevert, handleDelete]);

  const StatCard = ({ icon, label, value, colorClass, loading }) => (
    <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-200/80 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        {loading ? (
          <div className="h-7 w-12 bg-gray-200 rounded animate-pulse mt-1"></div>
        ) : (
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        )}
      </div>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Botón Volver */}
        <div className="mb-6">
          <Link 
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-200 rounded-xl shadow-lg hover:shadow-xl text-gray-700 font-medium border border-gray-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Dashboard
          </Link>
        </div>

        {/* Header con gradiente */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-8 text-white shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <Package className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Gestión de Productos</h1>
                <p className="text-emerald-100 text-lg">Administra el catálogo completo de productos</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-emerald-100">
              <ShieldCheck className="w-5 h-5" />
              <span className="font-medium">Control total • Aprobación • Modificación</span>
            </div>
          </div>
        </div>

        {/* Gestor de Categorías */}
        <CategoryManager />

        {/* Sección de Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
          <StatCard icon={<Package className="w-6 h-6 text-white"/>} label="Total" value={stats.total} colorClass="bg-blue-500" loading={loading} />
          <StatCard icon={<ShieldCheck className="w-6 h-6 text-white"/>} label="Activos" value={stats.active} colorClass="bg-green-500" loading={loading} />
          <StatCard icon={<Clock className="w-6 h-6 text-white"/>} label="Pendientes" value={stats.pending} colorClass="bg-yellow-500" loading={loading} />
          <StatCard icon={<X className="w-6 h-6 text-white"/>} label="Inactivos" value={stats.inactive} colorClass="bg-red-500" loading={loading} />
          <StatCard icon={<AlertTriangle className="w-6 h-6 text-white"/>} label="Stock Bajo" value={stats.lowStock} colorClass="bg-orange-500" loading={loading} />
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar productos o artesanos..."
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
            <div className="flex items-center gap-4">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="p-2.5 bg-white text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg border border-gray-200 shadow-sm transition-all duration-200 disabled:opacity-50"
                title="Recargar lista"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Tabla de productos */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full p-2">
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

        {pagination && pagination.page < pagination.pages && !loading && (
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
  );
};

export default withAuthProtection(AdminProductsPage, { requiredRole: 'admin' }); 