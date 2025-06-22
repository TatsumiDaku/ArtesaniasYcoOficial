'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { User, Store, Trash2, Eye, Package, ArrowLeft, RefreshCw, Search, Users, Crown, Loader2 } from 'lucide-react';
import Link from 'next/link';

import api from '@/utils/api';
import withAuthProtection from '@/components/auth/withAuthProtection';
import DataTable from '@/components/ui/DataTable';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [activeTab, setActiveTab] = useState('cliente'); // 'cliente' o 'artesano'
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const fetchUsers = useCallback(async (page = 1) => {
    const isInitialLoad = page === 1;
    if (isInitialLoad) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const params = new URLSearchParams({
        page,
        limit: 10,
        role: activeTab,
      });
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const { data } = await api.get(`/users?${params.toString()}`);
      setUsers(prev => isInitialLoad ? data.data : [...prev, ...data.data]);
      setPagination(data.pagination);
    } catch (error) {
      toast.error('No se pudieron cargar los usuarios.');
      console.error("Failed to fetch users:", error);
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  }, [activeTab, searchTerm]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchUsers(1);
    }, 300);

    return () => clearTimeout(handler);
  }, [fetchUsers]);

  const handleLoadMore = () => {
    if (pagination && pagination.page < pagination.pages) {
      fetchUsers(pagination.page + 1);
    }
  };

  const handleDelete = useCallback(async (userId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar a este usuario?')) {
      toast.loading('Eliminando usuario...');
      try {
        await api.delete(`/users/admin/${userId}`);
        toast.dismiss();
        toast.success('Usuario eliminado correctamente.');
        setUsers(prev => prev.filter(u => u.id !== userId));
      } catch (error) {
        toast.dismiss();
        toast.error('Error al eliminar el usuario.');
        console.error("Failed to delete user:", error);
      }
    }
  }, []);

  // Las estadísticas ahora se basan en los totales de la paginación si están disponibles
  const stats = useMemo(() => {
    // Esta parte podría necesitar una llamada a un endpoint de estadísticas separado
    // para ser 100% precisa con los filtros aplicados, pero por ahora es una aproximación.
    const clientes = users.filter(u => u.role === 'cliente').length;
    const artesanos = users.filter(u => u.role === 'artesano').length;
    const admins = users.filter(u => u.role === 'admin').length;
    return { clientes, artesanos, admins, total: pagination?.total || users.length };
  }, [users, pagination]);
  
  const columns = useMemo(() => [
    { 
      header: 'ID', 
      accessorKey: 'id',
      cell: ({ row }) => (
        <span className="text-sm text-gray-500 font-mono">#{row.original.id}</span>
      )
    },
    { 
      header: 'Nombre', 
      accessorKey: 'name',
      cell: ({ row }) => (
        <div>
          <span className="font-semibold text-gray-800">{row.original.name}</span>
          <p className="text-xs text-gray-500 mt-1">{row.original.role}</p>
        </div>
      )
    },
    { 
      header: 'Email', 
      accessorKey: 'email',
      cell: ({ row }) => (
        <span className="text-gray-700">{row.original.email}</span>
      )
    },
    { 
      header: 'Teléfono', 
      accessorKey: 'phone',
      cell: ({ row }) => (
        <span className="text-gray-600">{row.original.phone || 'No especificado'}</span>
      )
    },
    {
      header: 'Acciones',
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => router.push(`/admin/users/${row.original.id}`)}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 text-xs font-medium"
            title="Ver Detalles"
          >
            <Eye className="w-3 h-3" />
            Ver
          </button>
          {activeTab === 'artesano' && (
            <button
              onClick={() => router.push(`/admin/artisan/${row.original.id}/products`)}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all duration-200 text-xs font-medium"
              title="Ver Productos del Artesano"
            >
              <Package className="w-3 h-3" />
              Productos
            </button>
          )}
          <button
            onClick={() => handleDelete(row.original.id)}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200 text-xs font-medium"
            title="Eliminar Usuario"
          >
            <Trash2 className="w-3 h-3" />
            Eliminar
          </button>
        </div>
      )
    },
  ], [activeTab, router, handleDelete]);

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
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Gestión de Usuarios</h1>
                <p className="text-emerald-100 text-lg">Administra clientes, artesanos y administradores</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-emerald-100">
              <Crown className="w-5 h-5" />
              <span className="font-medium">Control total • Gestión • Supervisión</span>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold">Total</h3>
              </div>
            </div>
            <div className="p-6 text-center">
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Usuarios</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                  <User className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold">Clientes</h3>
              </div>
            </div>
            <div className="p-6 text-center">
              <div className="text-3xl font-bold text-gray-900">{stats.clientes}</div>
              <div className="text-sm text-gray-600">Registrados</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                  <Store className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold">Artesanos</h3>
              </div>
            </div>
            <div className="p-6 text-center">
              <div className="text-3xl font-bold text-gray-900">{stats.artesanos}</div>
              <div className="text-sm text-gray-600">Activos</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                  <Crown className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold">Admins</h3>
              </div>
            </div>
            <div className="p-6 text-center">
              <div className="text-3xl font-bold text-gray-900">{stats.admins}</div>
              <div className="text-sm text-gray-600">Sistema</div>
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar usuarios por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <button 
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === 'cliente' 
                      ? 'bg-blue-500 text-white shadow-lg' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setActiveTab('cliente')}
                >
                  <User className="w-4 h-4 inline mr-2" />
                  Clientes ({users.filter(u => u.role === 'cliente').length})
                </button> 
                <button 
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === 'artesano' 
                      ? 'bg-orange-500 text-white shadow-lg' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setActiveTab('artesano')}
                >
                  <Store className="w-4 h-4 inline mr-2" />
                  Artesanos
                </button>
              </div>
            </div>
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:from-emerald-600 hover:to-teal-700"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Recargar
            </button>
          </div>
        </div>

        {/* Tabla de datos */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <DataTable
            columns={columns}
            data={users} // Ya no se usa filteredUsers
            loading={loading}
          />
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
                  'Cargar Más Usuarios'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default withAuthProtection(AdminUsersPage, ['admin']); 