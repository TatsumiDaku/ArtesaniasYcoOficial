'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { User, Store, Trash2, Eye, Package, ArrowLeft, RefreshCw, Search, Users, Crown, Loader2, BarChart3 } from 'lucide-react';
import Link from 'next/link';

import api from '@/utils/api';
import withAuthProtection from '@/components/auth/withAuthProtection';
import DataTable from '@/components/ui/DataTable';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, clientes: 0, artesanos: 0, admins: 0 });
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

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get('/users/stats');
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch user stats:", error);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

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

  const handleRefresh = () => {
    setUsers([]); 
    fetchUsers(1);
    fetchStats(); // También recargamos las estadísticas por si acaso
  };

  const handleDelete = useCallback(async (userId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar a este usuario?')) {
      toast.loading('Eliminando usuario...');
      try {
        await api.delete(`/users/admin/${userId}`);
        toast.dismiss();
        toast.success('Usuario eliminado correctamente.');
        setUsers(prev => prev.filter(u => u.id !== userId));
        fetchStats(); // Actualizar stats después de eliminar
      } catch (error) {
        toast.dismiss();
        toast.error('Error al eliminar el usuario.');
        console.error("Failed to delete user:", error);
      }
    }
  }, [fetchStats]);
  
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
            <>
              <button
                onClick={() => router.push(`/admin/artisan/${row.original.id}/products`)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all duration-200 text-xs font-medium"
                title="Ver Productos del Artesano"
              >
                <Package className="w-3 h-3" />
                Productos
              </button>
              <button
                onClick={() => router.push(`/admin/artisan/${row.original.id}/statistics`)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all duration-200 text-xs font-medium"
                title="Ver Estadísticas del Artesano"
              >
                <BarChart3 className="w-3 h-3" />
                Estadísticas
              </button>
            </>
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
        
        {/* Controles y Pestañas */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Pestañas */}
            <div className="flex-shrink-0">
              <div className="p-1.5 bg-gray-200/50 rounded-lg flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('cliente')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${activeTab === 'cliente' ? 'bg-white text-emerald-700 shadow-md' : 'text-gray-600 hover:bg-white/50'}`}
                >
                  <User className="w-4 h-4" />
                  Clientes
                  <span className="bg-emerald-600/20 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full">{stats.clientes}</span>
                </button>
                <button
                  onClick={() => setActiveTab('artesano')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${activeTab === 'artesano' ? 'bg-white text-emerald-700 shadow-md' : 'text-gray-600 hover:bg-white/50'}`}
                >
                  <Store className="w-4 h-4" />
                  Artesanos
                  <span className="bg-emerald-600/20 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full">{stats.artesanos}</span>
                </button>
              </div>
            </div>

            {/* Controles: Búsqueda y Recarga */}
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Buscar en ${activeTab === 'cliente' ? 'clientes' : 'artesanos'}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg shadow-inner focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>
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

        {/* Tabla de Datos */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {loading && users.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-emerald-600" />
              <p>Cargando usuarios...</p>
            </div>
          ) : (
            <>
              <DataTable
                columns={columns}
                data={users}
                loading={loading}
              />
              {pagination && pagination.page < pagination.pages && (
                <div className="p-4 text-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                  >
                    {loadingMore ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Cargar más usuarios'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default withAuthProtection(AdminUsersPage, ['admin']); 