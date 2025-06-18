import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

export default function AdminPanel() {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated || !isAdmin) {
    return <div className="text-center py-12">Acceso denegado. Solo administradores pueden ver esta página.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-orange-600">Panel de Administración</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/admin/users" className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:shadow-lg transition">
          <span className="text-4xl mb-2">👤</span>
          <span className="font-semibold text-lg text-gray-900">Gestión de Usuarios</span>
        </Link>
        <Link href="/admin/products" className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:shadow-lg transition">
          <span className="text-4xl mb-2">📦</span>
          <span className="font-semibold text-lg text-gray-900">Gestión de Productos</span>
        </Link>
        <Link href="/admin/orders" className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:shadow-lg transition">
          <span className="text-4xl mb-2">🧾</span>
          <span className="font-semibold text-lg text-gray-900">Gestión de Pedidos</span>
        </Link>
      </div>
    </div>
  );
} 