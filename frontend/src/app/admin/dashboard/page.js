'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Users, Package, ShoppingCart, Clock, ArrowRight, ExternalLink, Store, Settings, ListOrdered, ShieldCheck, RefreshCw, Crown, UserCheck, AlertTriangle, ArrowLeft, UserX } from 'lucide-react';
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

const AdminDashboardCard = ({ icon: Icon, title, description, link, gradient }) => (
  <Link href={link} className="block group">
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden h-full flex flex-col hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300">
      <div className={`bg-gradient-to-r ${gradient} p-6 text-white`}>
        <div className="flex items-center gap-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
            <Icon className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold">{title}</h2>
        </div>
      </div>
      <div className="p-6 flex-grow flex flex-col">
        <p className="text-gray-600 leading-relaxed flex-grow">{description}</p>
        <div className="mt-4 flex items-center justify-end text-sm font-medium text-emerald-600 group-hover:text-emerald-500 transition-colors">
          <span className="font-bold">Ir a la sección</span>
          <ArrowRight className="w-5 h-5 ml-1 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </div>
  </Link>
);

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const statsRes = await api.get('/stats/dashboard');
      setStats(statsRes.data);
    } catch (error) {
      toast.error("No se pudieron cargar los datos del dashboard.");
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
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
      // Recargar todos los datos para mantener la consistencia
      fetchAllData();
    } catch (error) {
      toast.dismiss();
      toast.error('Error al aprobar el producto.');
      console.error("Failed to approve product:", error);
    }
  }, [fetchAllData]);

  const handleApproveArtisan = useCallback(async (artisanId) => {
    toast.loading('Aprobando artesano...');
    try {
      await api.put(`/users/${artisanId}/approve-artisan`);
      toast.dismiss();
      toast.success('Artesano aprobado y notificado.');
       // Recargar todos los datos para mantener la consistencia
      fetchAllData();
    } catch (error) {
      toast.dismiss();
      toast.error('Error al aprobar al artesano.');
      console.error("Failed to approve artisan:", error);
    }
  }, [fetchAllData]);

  const handleApproveBlog = useCallback(async (blogId) => {
    toast.loading('Aprobando blog...');
    try {
      await api.put(`/blogs/${blogId}/approve`);
      toast.dismiss();
      toast.success('Blog aprobado y hecho público.');
      // Recargar todos los datos para mantener la consistencia
      fetchAllData();
    } catch (error) {
      toast.dismiss();
      toast.error('Error al aprobar el blog.');
      console.error("Failed to approve blog:", error);
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard 
            icon={<Users size={24} />} 
            title="Total Clientes" 
            value={stats.users.totalClients} 
            color="from-blue-500 to-indigo-500"
            description="Usuarios registrados"
          />
          <StatCard 
            icon={<Store size={24} />} 
            title="Total Artesanos" 
            value={stats.users.totalArtisans} 
            color="from-orange-500 to-red-500"
            description="Creadores en la plataforma"
          />
           <StatCard 
            icon={<ShieldCheck size={24} />} 
            title="Total Admins" 
            value={stats.users.totalAdmins} 
            color="from-emerald-500 to-teal-500"
            description="Equipo de gestión"
          />
          <StatCard 
            icon={<Package size={24} />} 
            title="Total Productos" 
            value={stats.products.total} 
            color="from-purple-500 to-pink-500"
            description="En el catálogo"
          />
          <StatCard 
            icon={<AlertTriangle size={24} />} 
            title="Productos Pendientes" 
            value={stats.products.pending} 
            color="from-yellow-500 to-amber-500"
            description="Esperando aprobación"
          />
           <StatCard 
            icon={<UserX size={24} />} 
            title="Artesanos Pendientes" 
            value={stats.users.pendingApproval} 
            color="from-rose-500 to-red-500"
            description="Esperando aprobación"
          />
        </div>

        {/* Areas de gestion */}
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Áreas de Gestión</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <AdminDashboardCard 
                    icon={Store}
                    title="Gestionar Tiendas"
                    description="Aprueba, rechaza o banea artesanos. Edita perfiles y revisa la información de las tiendas."
                    link="/admin/shops"
                    gradient="from-orange-500 to-red-500"
                />
                <AdminDashboardCard 
                    icon={Users}
                    title="Gestionar Usuarios"
                    description="Administra todos los perfiles de usuario, incluyendo clientes, artesanos y otros administradores."
                    link="/admin/users"
                    gradient="from-blue-500 to-cyan-500"
                />
                <AdminDashboardCard 
                    icon={ListOrdered}
                    title="Gestionar Blogs"
                    description="Aprueba, edita o elimina blogs publicados por los artesanos. Supervisa el contenido y comentarios."
                    link="/admin/blogs"
                    gradient="from-pink-500 to-rose-500"
                />
                <AdminDashboardCard
                    icon={Package}
                    title="Gestionar Productos"
                    description="Supervisa el catálogo completo de productos, edita detalles y gestiona el inventario."
                    link="/admin/products"
                    gradient="from-purple-500 to-indigo-500"
                />
                <AdminDashboardCard
                    icon={ListOrdered}
                    title="Gestionar Pedidos"
                    description="Revisa el historial de pedidos, estados de entrega y detalles de las transacciones."
                    link="/admin/orders"
                    gradient="from-sky-500 to-blue-500"
                />
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Pending Products */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-500 to-amber-500 p-6 text-white">
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
                    <li key={product.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <Image 
                        src={`${API_BASE_URL}${product.images[0]}`} 
                        alt={product.name}
                        width={64}
                        height={64}
                        className="w-16 h-16 rounded-lg object-cover border"
                      />
                      <div className="flex-1">
                        <Link href={`/products/${product.id}`} className="font-semibold text-gray-800 hover:text-blue-600 transition-colors">
                          {product.name}
                        </Link>
                        <p className="text-sm text-gray-500">por {product.artisan_name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleApproveProduct(product.id)}
                          className="flex items-center gap-2 px-3 py-2 text-sm bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-all"
                          title="Aprobar producto"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                        <Link href={`/artisan/products/edit/${product.id}`}
                          className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-all"
                          title="Ver y editar detalles del producto"
                        >
                          <ExternalLink className="w-4 h-4" />
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

          {/* Recent Pending Artisans */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-rose-500 to-red-500 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                    <UserX className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold">Artesanos Pendientes</h2>
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
              {stats.recentPendingArtisans.length > 0 ? (
                <ul className="space-y-4">
                  {stats.recentPendingArtisans.map(artisan => (
                    <li key={artisan.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <Image 
                        src={artisan.avatar_url ? `${API_BASE_URL}${artisan.avatar_url}` : '/static/default-avatar.png'}
                        alt={artisan.name}
                        width={64}
                        height={64}
                        className="w-16 h-16 rounded-full object-cover border"
                      />
                      <div className="flex-1">
                        <Link href={`/admin/users/${artisan.id}`} className="font-semibold text-gray-800 hover:text-blue-600 transition-colors">
                          {artisan.name}
                        </Link>
                        <p className="text-sm text-gray-500">{artisan.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleApproveArtisan(artisan.id)}
                          className="flex items-center gap-2 px-3 py-2 text-sm bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-all"
                          title="Aprobar artesano"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                        <Link href={`/admin/users/${artisan.id}`}
                          className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-all"
                          title="Ver perfil del artesano"
                        >
                          <ExternalLink className="w-4 h-4" />
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

          {/* Recent Pending Blogs */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                    <ListOrdered className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold">Blogs Pendientes</h2>
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
              {stats.recentPendingBlogs && stats.recentPendingBlogs.length > 0 ? (
                <ul className="space-y-4">
                  {stats.recentPendingBlogs.map(blog => (
                    <li key={blog.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <Image 
                        src={blog.image_url_1 ? `${API_BASE_URL}${blog.image_url_1}` : '/static/default-avatar.png'}
                        alt={blog.title}
                        width={64}
                        height={64}
                        className="w-16 h-16 rounded-lg object-cover border"
                      />
                      <div className="flex-1">
                        <Link href={`/blog/${blog.id}`} className="font-semibold text-gray-800 hover:text-blue-600 transition-colors">
                          {blog.title}
                        </Link>
                        <p className="text-sm text-gray-500">por {blog.author_name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleApproveBlog(blog.id)}
                          className="flex items-center gap-2 px-3 py-2 text-sm bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-all"
                          title="Aprobar blog"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                        <Link href={`/artisan/blog/edit/${blog.id}`}
                          className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-all"
                          title="Ver y editar detalles del blog"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500 py-4">No hay blogs pendientes de aprobación.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuthProtection(AdminDashboardPage, ['admin']); 