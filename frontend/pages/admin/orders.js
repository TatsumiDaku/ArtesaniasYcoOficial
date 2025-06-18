import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminOrders() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && isAdmin) fetchOrders();
    // eslint-disable-next-line
  }, [isAuthenticated, isAdmin]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/orders');
      setOrders(res.data);
    } catch (error) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return <div className="text-center py-12">Acceso denegado. Solo administradores pueden ver esta página.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-orange-600">Gestión de Pedidos</h1>
      {loading ? (
        <div className="text-center py-12">Cargando pedidos...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No hay pedidos registrados.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Usuario</th>
                <th className="px-4 py-2 text-left">Total</th>
                <th className="px-4 py-2 text-left">Estado</th>
                <th className="px-4 py-2 text-left">Fecha</th>
                <th className="px-4 py-2 text-left">Envío</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-t">
                  <td className="px-4 py-2">{order.id}</td>
                  <td className="px-4 py-2">{order.user_id}</td>
                  <td className="px-4 py-2">${order.total}</td>
                  <td className="px-4 py-2">
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">{order.status}</span>
                  </td>
                  <td className="px-4 py-2">{new Date(order.created_at).toLocaleString()}</td>
                  <td className="px-4 py-2">{order.shipping_address}</td>
                  <td className="px-4 py-2">
                    {/* Aquí puedes agregar acciones como cambiar estado */}
                    <button className="text-orange-600 hover:underline text-sm" disabled>Ver</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 