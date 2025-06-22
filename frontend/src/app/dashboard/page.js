'use client';

import { useState, useEffect } from 'react';
import withAuthProtection from '@/components/auth/withAuthProtection';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { User, ShoppingBag, Heart, Package, Users, Shield, Home, Settings, Star, TrendingUp, AlertTriangle } from 'lucide-react';
import api from '@/utils/api';
import StarRating from '@/components/ui/StarRating';

const DashboardPage = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/stats/user');
                setStats(res.data);
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchStats();
        }
    }, [user]);

    const getRoleName = (role) => {
        switch (role) {
            case 'admin': return 'Administrador';
            case 'artesano': return 'Artesano';
            default: return 'Cliente';
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'cliente': return 'from-blue-600 via-purple-600 to-indigo-600';
            case 'artesano': return 'from-orange-600 via-red-600 to-pink-600';
            case 'admin': return 'from-emerald-600 via-teal-600 to-cyan-600';
            default: return 'from-blue-600 via-purple-600 to-indigo-600';
        }
    };

    const getRoleBgColor = (role) => {
        switch (role) {
            case 'cliente': return 'from-blue-50 via-white to-purple-50';
            case 'artesano': return 'from-orange-50 via-white to-red-50';
            case 'admin': return 'from-emerald-50 via-white to-teal-50';
            default: return 'from-blue-50 via-white to-purple-50';
        }
    };

    const getRatingCategoryColor = (category) => {
        switch (category) {
            case 'positive': return 'from-green-500 to-emerald-500';
            case 'medium': return 'from-yellow-500 to-orange-500';
            case 'negative': return 'from-red-500 to-pink-500';
            default: return 'from-gray-500 to-gray-600';
        }
    };

    const getRatingCategoryText = (category) => {
        switch (category) {
            case 'positive': return 'Excelente';
            case 'medium': return 'Bueno';
            case 'negative': return 'Necesita mejorar';
            default: return 'Sin calificaciones';
        }
    };

    const welcomeTitle = `Bienvenido a tu Dashboard, ${getRoleName(user?.role)}`;

    const commonOptions = [
        { href: '/dashboard/favorites', title: 'Mis Favoritos', description: 'Consulta tus productos guardados y crea tu lista de deseos.', icon: Heart, role: 'cliente', color: 'from-pink-500 to-rose-500' },
        { href: '/dashboard/profile', title: 'Mi Perfil', description: 'Gestiona tu información personal y configuración de cuenta.', icon: User, role: 'cliente', color: 'from-blue-500 to-indigo-500' },
    ];
    
    const artisanOptions = [
        { href: '/artisan/products', title: 'Gestionar Productos', description: 'Añade, edita y administra tus creaciones artesanales.', icon: Package, role: 'artesano', color: 'from-orange-500 to-red-500' },
        { href: '/artisan/profile', title: 'Mi Perfil', description: 'Gestiona tu información personal y profesional.', icon: User, role: 'artesano', color: 'from-red-500 to-pink-500' },
    ];

    const adminOptions = [
        { href: '/admin/products', title: 'Gestionar Productos', description: 'Administra todo el catálogo de productos.', icon: Package, role: 'admin', color: 'from-emerald-500 to-teal-500' },
        { href: '/admin/users', title: 'Gestionar Usuarios', description: 'Administra todos los usuarios del sistema.', icon: Users, role: 'admin', color: 'from-teal-500 to-cyan-500' },
        { href: '/admin/orders', title: 'Gestionar Pedidos', description: 'Visualiza y gestiona todos los pedidos.', icon: ShoppingBag, role: 'admin', color: 'from-cyan-500 to-blue-500' },
    ];
    
    const DashboardCard = ({ href, title, description, icon: Icon, role, color }) => (
        <Link href={href}>
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                <div className={`bg-gradient-to-r ${color} p-6 text-white`}>
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                            <Icon className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-bold">{title}</h2>
                    </div>
                </div>
                <div className="p-6">
                    <p className="text-gray-600 leading-relaxed">{description}</p>
                    <div className="mt-4 flex items-center text-sm text-gray-500">
                        <span className="inline-flex items-center gap-1">
                            <Shield className="w-4 h-4" />
                            Acceso seguro
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );

    const getCurrentOptions = () => {
        if (user?.role === 'cliente' || user?.role === 'user') return commonOptions;
        if (user?.role === 'artesano') return artisanOptions;
        if (user?.role === 'admin') return adminOptions;
        return [];
    };

    return (
        <div className={`min-h-screen bg-gradient-to-br ${getRoleBgColor(user?.role)}`}>
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Header con gradiente */}
                <div className="mb-8">
                    <div className={`bg-gradient-to-r ${getRoleColor(user?.role)} rounded-2xl p-8 text-white shadow-2xl`}>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                                <Home className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold">{welcomeTitle}</h1>
                                <p className="text-white/80 text-lg mt-2">Desde aquí puedes gestionar tu cuenta y actividades</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-white/80">
                            <Shield className="w-5 h-5" />
                            <span className="font-medium">Panel de control • {getRoleName(user?.role)}</span>
                        </div>
                    </div>
                </div>

                {/* Estadísticas para artesanos */}
                {user?.role === 'artesano' && stats?.reviews && (
                    <div className="mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {/* Promedio de calificaciones */}
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                                <div className={`bg-gradient-to-r ${getRatingCategoryColor(stats.reviews.ratingCategory)} p-6 text-white`}>
                                    <div className="flex items-center gap-3">
                                        <Star className="w-6 h-6" />
                                        <h3 className="text-lg font-bold">Calificación Promedio</h3>
                                    </div>
                                </div>
                                <div className="p-6 text-center">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <span className="text-3xl font-bold text-gray-900">{stats.reviews.averageRating.toFixed(1)}</span>
                                        <span className="text-gray-500">/5</span>
                                    </div>
                                    <StarRating rating={stats.reviews.averageRating} readOnly />
                                    <div className="text-sm text-gray-600 mt-2">{getRatingCategoryText(stats.reviews.ratingCategory)}</div>
                                </div>
                            </div>

                            {/* Total de reseñas */}
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6 text-white">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="w-6 h-6" />
                                        <h3 className="text-lg font-bold">Total Reseñas</h3>
                                    </div>
                                </div>
                                <div className="p-6 text-center">
                                    <div className="text-3xl font-bold text-gray-900">{stats.reviews.totalReviews}</div>
                                    <div className="text-sm text-gray-600">Reseñas recibidas</div>
                                </div>
                            </div>

                            {/* Reseñas positivas */}
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="w-6 h-6" />
                                        <h3 className="text-lg font-bold">Positivas</h3>
                                    </div>
                                </div>
                                <div className="p-6 text-center">
                                    <div className="text-3xl font-bold text-gray-900">{stats.reviews.positiveReviews}</div>
                                    <div className="text-sm text-gray-600">≥ 3.5 estrellas</div>
                                </div>
                            </div>

                            {/* Reseñas negativas */}
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                                <div className="bg-gradient-to-r from-red-500 to-pink-500 p-6 text-white">
                                    <div className="flex items-center gap-3">
                                        <AlertTriangle className="w-6 h-6" />
                                        <h3 className="text-lg font-bold">A mejorar</h3>
                                    </div>
                                </div>
                                <div className="p-6 text-center">
                                    <div className="text-3xl font-bold text-gray-900">{stats.reviews.negativeReviews}</div>
                                    <div className="text-sm text-gray-600">&lt; 2.8 estrellas</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tarjeta de bienvenida */}
                <div className="mb-8">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6">
                            <div className="flex items-center gap-4">
                                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full p-3">
                                    <Settings className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">Panel de Control</h2>
                                    <p className="text-gray-600">Selecciona una opción para comenzar</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grid de opciones */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {getCurrentOptions().map(opt => (
                        <DashboardCard key={opt.href} {...opt} />
                    ))}
                </div>

                {/* Información adicional para clientes */}
                {(user?.role === 'cliente' || user?.role === 'user') && (
                    <div className="mt-12">
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
                                <h3 className="text-xl font-bold">¿Necesitas ayuda?</h3>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                                        <div className="text-2xl font-bold text-blue-600">📱</div>
                                        <div className="text-sm text-gray-600 mt-2">Navega fácilmente</div>
                                    </div>
                                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                                        <div className="text-2xl font-bold text-green-600">🔒</div>
                                        <div className="text-sm text-gray-600 mt-2">Datos seguros</div>
                                    </div>
                                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                                        <div className="text-2xl font-bold text-purple-600">⚡</div>
                                        <div className="text-sm text-gray-600 mt-2">Acceso rápido</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default withAuthProtection(DashboardPage); 