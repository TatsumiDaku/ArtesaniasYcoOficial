import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

export default function Dashboard() {
  const { isAuthenticated, isAdmin, isArtisan, isClient, user } = useAuth();

  if (!isAuthenticated) {
    return <div className="text-center py-12">Debes iniciar sesión para ver tu panel.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-orange-600">Bienvenido, {user?.name}!</h1>
      {isAdmin && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Panel de Administrador</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/admin/users" className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:shadow-lg transition">
              <span className="text-3xl mb-2">👤</span>
              <span className="font-semibold text-gray-900">Usuarios</span>
            </Link>
            <Link href="/admin/products" className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:shadow-lg transition">
              <span className="text-3xl mb-2">📦</span>
              <span className="font-semibold text-gray-900">Productos</span>
            </Link>
            <Link href="/admin/orders" className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:shadow-lg transition">
              <span className="text-3xl mb-2">🧾</span>
              <span className="font-semibold text-gray-900">Pedidos</span>
            </Link>
          </div>
        </div>
      )}
      {isArtisan && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Panel de Artesano</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/artisan/products" className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:shadow-lg transition">
              <span className="text-3xl mb-2">🛒</span>
              <span className="font-semibold text-gray-900">Mis Productos</span>
            </Link>
            <Link href="/artisan/create-product" className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:shadow-lg transition">
              <span className="text-3xl mb-2">➕</span>
              <span className="font-semibold text-gray-900">Crear Producto</span>
            </Link>
            <Link href="/artisan/orders" className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:shadow-lg transition">
              <span className="text-3xl mb-2">🧾</span>
              <span className="font-semibold text-gray-900">Pedidos de mis productos</span>
            </Link>
          </div>
        </div>
      )}
      {isClient && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Panel de Cliente</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/orders" className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:shadow-lg transition">
              <span className="text-3xl mb-2">🧾</span>
              <span className="font-semibold text-gray-900">Mis Pedidos</span>
            </Link>
            <Link href="/profile" className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:shadow-lg transition">
              <span className="text-3xl mb-2">👤</span>
              <span className="font-semibold text-gray-900">Mi Perfil</span>
            </Link>
            <Link href="/products" className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:shadow-lg transition">
              <span className="text-3xl mb-2">🛍️</span>
              <span className="font-semibold text-gray-900">Explorar Productos</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 