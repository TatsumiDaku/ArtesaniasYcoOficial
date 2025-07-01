"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/utils/api";
import { Loader2, FileText, ArrowRight, Package } from "lucide-react";
import { useAuth } from '@/context/AuthContext';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  in_transit: 'bg-orange-100 text-orange-800',
  delivered: 'bg-teal-100 text-teal-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusLabels = {
  pending: 'Pendiente',
  paid: 'Pagado',
  confirmed: 'Confirmado',
  shipped: 'Enviado',
  in_transit: 'En tránsito',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

export default function OrdersListPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await api.get('/orders');
        setOrders(res.data);
      } catch (err) {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchOrders();
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-amber-500 mb-4" />
        <p className="text-lg text-gray-600">Cargando pedidos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-yellow-50 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-4xl bg-white/80 rounded-2xl shadow-2xl p-8 border border-amber-100">
        <div className="flex items-center gap-3 mb-6">
          <Package className="w-10 h-10 text-amber-400" />
          <h1 className="text-2xl font-bold">Mis Pedidos</h1>
        </div>
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-2">Aún no tienes pedidos realizados.</p>
            <Link href="/products" className="btn bg-gradient-to-r from-amber-500 to-pink-400 text-white font-bold py-3 rounded-xl shadow-lg hover:scale-105 transition mt-4 inline-flex items-center gap-2">
              <ArrowRight className="w-5 h-5" /> Ir a comprar
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-amber-100">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-bold text-amber-700 uppercase">ID</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-amber-700 uppercase">Fecha</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-amber-700 uppercase">Total</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-amber-700 uppercase">Estado</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-amber-50 transition">
                    <td className="px-4 py-2 font-semibold">#{order.id}</td>
                    <td className="px-4 py-2">{new Date(order.created_at).toLocaleString()}</td>
                    <td className="px-4 py-2 font-bold text-green-700">${parseFloat(order.total).toLocaleString('es-CO')} COP</td>
                    <td className="px-4 py-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>{statusLabels[order.status] || order.status}</span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Link href={`/dashboard/orders/${order.id}`} className="btn btn-sm bg-gradient-to-r from-amber-400 to-pink-400 text-white font-bold rounded-xl shadow hover:scale-105 transition flex items-center gap-2">
                        Ver pedido <ArrowRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 