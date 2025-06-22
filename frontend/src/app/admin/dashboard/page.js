'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Users, Package, ShoppingCart, Clock, ArrowRight, ExternalLink, Store, Settings, ListOrdered, ShieldCheck, RefreshCw, Crown, TrendingUp, AlertTriangle, ArrowLeft, UserCheck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

import api from '@/utils/api';
import withAuthProtection from '@/components/auth/withAuthProtection';

const StatCard = ({ icon, title, value, color, description }) => (
  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
    <div className={`bg-gradient-to-r ${color} p-6 text-white`}>
      <div className="flex items-center gap-3">
        <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
          {icon}
        </div>
        <h3 className="text-lg font-bold">{title}</h3>
      </div>
    </div>
    <div className="p-6 text-center">
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600">{description}</div>
    </div>
  </div>
);

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [pendingArtisans, setPendingArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingArtisans, setLoadingArtisans] = useState(true);
  const router = useRouter();

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setLoadingArtisans(true);
    try {
      const [statsRes, artisansRes] = await Promise.all([
        api.get('/stats/dashboard'),
        api.get('/users', { params: { role: 'artesano', status: 'pending_approval' } })
      ]);
      setStats(statsRes.data);
      setPendingArtisans(artisansRes.data);
    } catch (error) {
      toast.error("No se pudieron cargar todos los datos del dashboard.");
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
      setLoadingArtisans(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleApproveProduct = useCallback(async (productId) => {
    toast.loading('Aprobando producto...');
    try {
      await api.put(`/products/${productId}/approve`);
      toast.dismiss();
      toast.success('Producto aprobado y hecho público.');
      // Actualizar el estado para reflejar el cambio en la UI
      setStats(prevStats => ({
        ...prevStats,
        pendingProductsCount: prevStats.pendingProductsCount - 1,
        recentPendingProducts: prevStats.recentPendingProducts.filter(p => p.id !== productId),
      }));
    } catch (error) {
      toast.dismiss();
      toast.error('Error al aprobar el producto.');
      console.error("Failed to approve product:", error);
    }
  }, []);

  const handleApproveArtisan = useCallback(async (artisanId) => {
    toast.loading('Aprobando artesano...');
    try {
      await api.put(`/users/${artisanId}/approve-artisan`);
      toast.dismiss();
      toast.success('Artesano aprobado y notificado.');
      setPendingArtisans(prev => prev.filter(a => a.id !== artisanId));
       // Opcional: Recargar estadísticas si el conteo de artesanos activos debe cambiar
      fetchAllData();
    } catch (error) {
      toast.dismiss();
      toast.error('Error al aprobar al artesano.');
      console.error("Failed to approve artisan:", error);
    }
  }, [fetchAllData]);

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
              <p className="text-lg font-medium text-gray-600">Cargando estadísticas...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
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
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-8 text-white shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <Crown className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Panel de Administrador</h1>
                <p className="text-emerald-100 text-lg">Gestión completa de la plataforma</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-emerald-100">
              <ShieldCheck className="w-5 h-5" />
              <span className="font-medium">Control total • Acceso privilegiado</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard 
            icon={<Users size={24} />} 
            title="Total Clientes" 
            value={stats.totalClients} 
            color="from-blue-500 to-indigo-500"
            description="Usuarios registrados"
          />
          <StatCard 
            icon={<Store size={24} />} 
            title="Total Artesanos" 
            value={stats.totalArtisans} 
            color="from-orange-500 to-red-500"
            description="Creadores activos"
          />
          <StatCard 
            icon={<Package size={24} />} 
            title="Total Productos" 
            value={stats.totalProducts} 
            color="from-purple-500 to-pink-500"
            description="En el catálogo"
          />
          <StatCard 
            icon={<ShoppingCart size={24} />} 
            title="Total Pedidos" 
            value={stats.totalOrders} 
            color="from-green-500 to-emerald-500"
            description="Transacciones"
          />
          <StatCard 
            icon={<Clock size={24} />} 
            title="Pendientes" 
            value={stats.pendingProductsCount} 
            color="from-yellow-500 to-orange-500"
            description="Por aprobar"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full p-2">
                    <Settings className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Accesos Rápidos</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <Link href="/admin/products" className="flex items-center p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 border border-transparent hover:border-blue-200">
                  <Package className="w-6 h-6 mr-4 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">Gestionar Productos</p>
                    <p className="text-sm text-gray-600">Aprobar, editar o eliminar</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </Link>
                <Link href="/admin/users" className="flex items-center p-4 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200 border border-transparent hover:border-green-200">
                  <Users className="w-6 h-6 mr-4 text-green-600" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">Gestionar Usuarios</p>
                    <p className="text-sm text-gray-600">Ver clientes y artesanos</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </Link>
                <Link href="/admin/orders" className="flex items-center p-4 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 border border-transparent hover:border-purple-200">
                  <ListOrdered className="w-6 h-6 mr-4 text-purple-600" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">Gestionar Pedidos</p>
                    <p className="text-sm text-gray-600">Revisar estado de compras</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </Link>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            {/* Recent Pending Products */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold">Productos Pendientes</h2>
                  </div>
                  <button 
                    onClick={fetchAllData} 
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-200 rounded-lg px-4 py-2 text-sm font-medium"
                    title="Recargar todo" 
                    disabled={loading}
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
              <div className="p-6">
                {stats.recentPendingProducts.length > 0 ? (
                  <ul className="space-y-4">
                    {stats.recentPendingProducts.map(product => (
                      <li key={product.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                        <div className="flex items-center">
                          <Image 
                            src={`${API_BASE_URL}${product.images[0]}`} 
                            alt={product.name}
                            width={48}
                            height={48}
                            className="rounded-lg object-cover mr-4 border border-gray-200"
                          />
                          <div>
                            <p className="font-semibold text-gray-800">{product.name}</p>
                            <p className="text-sm text-gray-600">por {product.artisan_name || 'Desconocido'}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleApproveProduct(product.id)} 
                            className="inline-flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-200 text-sm font-medium"
                            title="Aprobar producto"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            Aprobar
                          </button>
                           <Link href={`/products/${product.id}`} className="p-2.5 bg-gray-200 hover:bg-gray-300 rounded-lg" title="Ver producto">
                              <ExternalLink className="w-4 h-4 text-gray-600"/>
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center text-gray-500 py-4">No hay productos pendientes de aprobación.</p>
                )}
              </div>
            </div>

            {/* Pending Artisans */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-sky-500 to-blue-500 p-6 text-white">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold">Artesanos Pendientes de Aprobación</h2>
                </div>
              </div>
              <div className="p-6">
                {loadingArtisans ? (
                  <p className="text-center text-gray-500 py-4">Cargando artesanos...</p>
                ) : pendingArtisans.length > 0 ? (
                  <ul className="space-y-4">
                    {pendingArtisans.map(artisan => (
                      <li key={artisan.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl border border-sky-200">
                        <div>
                          <p className="font-semibold text-gray-800">{artisan.name}</p>
                          <p className="text-sm text-gray-600">{artisan.email}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleApproveArtisan(artisan.id)} 
                            className="inline-flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-200 text-sm font-medium"
                            title="Aprobar artesano"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            Aprobar
                          </button>
                          <Link href={`/admin/users/${artisan.id}`} className="p-2.5 bg-gray-200 hover:bg-gray-300 rounded-lg" title="Ver perfil completo">
                              <ExternalLink className="w-4 h-4 text-gray-600"/>
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center text-gray-500 py-4">No hay artesanos pendientes de aprobación.</p>
                )}
              </div>
            </div>
            
          </div>
        </div>

        {/* Información adicional para administradores */}
        <div className="mt-12">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-6 text-white">
              <h3 className="text-xl font-bold">Herramientas de Administración</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl">
                  <div className="text-2xl font-bold text-emerald-600">📊</div>
                  <div className="text-sm text-gray-600 mt-2">Análisis completo</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">🔧</div>
                  <div className="text-sm text-gray-600 mt-2">Control total</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                  <div className="text-2xl font-bold text-purple-600">⚡</div>
                  <div className="text-sm text-gray-600 mt-2">Gestión rápida</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuthProtection(AdminDashboardPage, ['admin']); 