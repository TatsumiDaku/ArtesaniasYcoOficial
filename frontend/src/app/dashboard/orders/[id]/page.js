"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from '@/utils/api';
import { Loader2, FileText, ArrowLeft, Package, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

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

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data);
        // Notificación de cambio de estado
        const lastStatus = localStorage.getItem(`orderStatus_${id}`);
        if (lastStatus && lastStatus !== res.data.status) {
          toast('¡El estado de tu pedido ha cambiado a: ' + (statusLabels[res.data.status] || res.data.status) + '!', { icon: '🔔' });
        }
        localStorage.setItem(`orderStatus_${id}`, res.data.status);
        // Obtener los items del pedido
        const itemsRes = await api.get(`/orders/${id}/items`);
        setItems(itemsRes.data);
      } catch (err) {
        toast.error('No se pudo cargar el pedido');
        router.push('/dashboard/orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-amber-500 mb-4" />
        <p className="text-lg text-gray-600">Cargando pedido...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-lg text-red-500">No se encontró el pedido.</p>
        <Link href="/dashboard/orders" className="btn mt-4 bg-amber-500 text-white">
          <ArrowLeft className="w-5 h-5 mr-2" /> Volver a mis pedidos
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-yellow-50 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-2xl bg-white/80 rounded-2xl shadow-2xl p-8 border border-amber-100">
        <div className="flex items-center gap-3 mb-6">
          <Package className="w-10 h-10 text-amber-400" />
          <h1 className="text-2xl font-bold">Detalle del Pedido #{order.id}</h1>
        </div>
        <div className="mb-4 flex flex-wrap gap-4 items-center">
          <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>{statusLabels[order.status] || order.status}</span>
          <span className="text-gray-500 text-sm">{new Date(order.created_at).toLocaleString()}</span>
        </div>
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="flex justify-between text-lg mb-1">
            <span>Total:</span>
            <span className="font-bold text-green-700">${parseFloat(order.total).toLocaleString('es-CO')} COP</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Método de pago:</span>
            <span>{order.payment_method}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Dirección de envío:</span>
            <span>{order.shipping_address}</span>
          </div>
        </div>
        <h2 className="text-xl font-bold text-amber-700 mb-2">Productos</h2>
        <ul className="divide-y divide-amber-100 mb-6">
          {items.length === 0 ? (
            <li className="text-gray-500 py-2">No hay productos en este pedido.</li>
          ) : (
            items.map(item => (
              <li key={item.product_id} className="py-2 flex justify-between items-center">
                <span>{item.name || 'Producto'}</span>
                <span className="text-gray-700 font-semibold">x{item.quantity}</span>
                <span className="text-green-700 font-bold">${parseFloat(item.price).toLocaleString('es-CO')} COP</span>
              </li>
            ))
          )}
        </ul>
        <div className="flex flex-col gap-3 mt-4">
          {['paid','confirmed','shipped','in_transit','delivered'].includes(order.status) ? (
            <a
              href={`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/uploads/invoice-order-${order.id}.pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn bg-green-600 text-white font-bold py-3 rounded-xl shadow-lg hover:scale-105 transition flex items-center gap-2 justify-center"
            >
              <FileText className="w-5 h-5" /> Descargar Factura PDF
            </a>
          ) : (
            <span className="text-gray-400 text-xs">La factura estará disponible tras el pago.<br/>También podrás verla y descargarla desde esta sección cuando el pedido esté pagado.</span>
          )}
          <Link href="/dashboard/orders" className="inline-flex items-center gap-2 mt-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-pink-400 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300">
            <ArrowLeft className="w-5 h-5" /> Volver a mis pedidos
          </Link>
        </div>
      </div>
    </div>
  );
} 