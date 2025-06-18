import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function ArtisanOrders() {
  const { isAuthenticated, isArtisan, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && isArtisan) fetchOrders();
    // eslint-disable-next-line
  }, [isAuthenticated, isArtisan]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Obtener todos los pedidos y filtrar los que contienen productos del artesano
      const res = await api.get('/api/orders');
      // Aquí se asume que el backend retorna todos los pedidos del usuario autenticado (admin ve todos)
      // Filtramos los items de cada pedido para mostrar solo los productos del artesano
      const artisanOrders = [];
      for (const order of res.data) {
        const itemsRes = await api.get(`/api/orders/${order.id}/items`);
        const artisanItems = itemsRes.data.filter(item => item.artisan_id === user.id);
        if (artisanItems.length > 0) {
          artisanOrders.push({ ...order, items: artisanItems });
        }
      }
      setOrders(artisanOrders);
    } catch (error) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !isArtisan) {
    return <div className="text-center py-12">Acceso denegado. Solo artesanos pueden ver esta página.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-orange-600">Pedidos de Mis Productos</h1>
      {loading ? (
        <div className="text-center py-12">Cargando pedidos...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No hay pedidos para tus productos.</div>
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
              <div className="mt-2">
                <div className="font-semibold text-sm mb-1">Tus productos en este pedido:</div>
                <ul className="list-disc pl-6 text-sm">
                  {order.items.map(item => (
                    <li key={item.id}>
                      {item.name} x {item.quantity} - <span className="text-orange-600 font-semibold">${item.price}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 