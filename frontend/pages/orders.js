import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Orders() {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) fetchOrders();
    // eslint-disable-next-line
  }, [isAuthenticated]);

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

  if (!isAuthenticated) {
    return <div className="text-center py-12">Debes iniciar sesión para ver tus pedidos.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-orange-600">Mis Pedidos</h1>
      {loading ? (
        <div className="text-center py-12">Cargando pedidos...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No tienes pedidos aún.</div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="font-semibold text-lg text-gray-900">Pedido #{order.id}</div>
                <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700 font-semibold">{order.status}</span>
              </div>
              <div className="text-gray-600 text-sm mb-1">Total: <span className="font-bold text-orange-600">${order.total}</span></div>
              <div className="text-gray-500 text-xs">Fecha: {new Date(order.created_at).toLocaleString()}</div>
              <div className="text-gray-500 text-xs">Envío: {order.shipping_address}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 