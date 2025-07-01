"use client";

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { Loader2, FileText, Eye, Search, RefreshCw, Mail, Download, AlertTriangle, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import withAuthProtection from '@/components/auth/withAuthProtection';
import { useAuth } from '@/context/AuthContext';
import dayjs from 'dayjs';
import axios from 'axios';

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

const validNextStatuses = [
  'pending', 'paid', 'confirmed', 'shipped', 'in_transit', 'delivered', 'cancelled'
];

const statusMap = {
  pending: 'pending',
  paid: 'paid',
  confirmed: 'confirmed',
  shipped: 'shipped',
  in_transit: 'in_transit',
  delivered: 'delivered',
  cancelled: 'cancelled',
};

function showArtisanOrdersTutorial() {
  toast('🔍 Usa la barra de búsqueda para encontrar pedidos por ID o usuario.', { duration: 6000 });
  setTimeout(() => toast('📂 Filtra los pedidos por estado usando el menú desplegable.', { duration: 6000 }), 2000);
  setTimeout(() => toast('⬇️ Exporta tus pedidos a CSV o Excel con los botones de exportar.', { duration: 6000 }), 4000);
  setTimeout(() => toast('👁️ Haz clic en "Ver" para ver el detalle de cada pedido.', { duration: 6000 }), 6000);
  setTimeout(() => toast('🟡 Flujo recomendado de estados: Pendiente → Pagado (cliente) → Confirmado (artesano/admin) → Enviado → En tránsito → Entregado. Usa Cancelado solo si el pedido no puede completarse.', { duration: 12000 }), 8000);
  setTimeout(() => toast('💡 La factura PDF solo está disponible a partir del estado Pagado.', { duration: 8000 }), 12000);
}

function ArtisanOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [lowStockOrders, setLowStockOrders] = useState({});
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [bulkStatus, setBulkStatus] = useState("");
  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      search === "" ||
      order.id.toString().includes(search) ||
      (order.user_id && order.user_id.toString().includes(search)) ||
      (order.user_name && order.user_name.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === "" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const allSelected = filteredOrders.length > 0 && selectedOrders.length === filteredOrders.length;

  useEffect(() => {
    if (!user) return;
    if (!localStorage.getItem('tutorial_artisan_orders')) {
      showArtisanOrdersTutorial();
      localStorage.setItem('tutorial_artisan_orders', '1');
    }
    const fetchOrders = async () => {
      setLoading(true);
      try {
        // Endpoint que retorna solo pedidos con productos del artesano
        const res = await api.get(`/orders?artisan_id=${user.id}`);
        setOrders(res.data);
        // Notificación de nuevos pedidos
        if (res.data && res.data.length > 0) {
          const lastSeenOrderId = parseInt(localStorage.getItem('lastSeenOrderId_artisan') || '0', 10);
          const maxOrderId = Math.max(...res.data.map(o => o.id));
          if (maxOrderId > lastSeenOrderId) {
            const newOrders = res.data.filter(o => o.id > lastSeenOrderId).length;
            if (lastSeenOrderId !== 0) {
              toast('¡Tienes ' + newOrders + ' pedido(s) nuevo(s) desde tu última visita!', { icon: '🛒' });
            }
            localStorage.setItem('lastSeenOrderId_artisan', maxOrderId);
          }
        }
        // Consultar stock bajo para cada pedido
        const fetchLowStock = async () => {
          const result = {};
          for (const order of res.data) {
            try {
              const itemsRes = await api.get(`/orders/${order.id}/items?artisan_id=${user?.id}`);
              const low = itemsRes.data.some(item => item.stock !== undefined && item.stock <= 3);
              if (low) result[order.id] = true;
            } catch {}
          }
          setLowStockOrders(result);
        };
        if (res.data && res.data.length) fetchLowStock();
      } catch (error) {
        toast.error("No se pudieron cargar los pedidos recibidos");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const backendStatus = statusMap[newStatus] || newStatus;
      await api.put(`/orders/${orderId}/status`, { status: backendStatus });
      // Recargar pedidos desde el backend para reflejar el estado real
      if (user) {
        setLoading(true);
        try {
          const res = await api.get(`/orders?artisan_id=${user.id}`);
          setOrders(res.data);
        } catch {
          toast.error('No se pudieron recargar los pedidos');
        } finally {
          setLoading(false);
        }
      }
      toast.success('Estado actualizado');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Error al actualizar el estado';
      toast.error(msg);
    }
  };

  const handleResendInvoice = async (orderId) => {
    try {
      await api.post(`/orders/${orderId}/pay`);
      toast.success('Factura reenviada');
    } catch (err) {
      toast.error('Error al reenviar la factura');
    }
  };

  const handleExportCSV = async () => {
    const params = [];
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (statusFilter) params.push(`status=${encodeURIComponent(statusFilter)}`);
    if (user?.id) params.push(`artisan_id=${user.id}`);
    const url = `/api/orders/export/csv${params.length ? '?' + params.join('&') : ''}`;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(url, {
        baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const linkCSV = document.createElement('a');
      linkCSV.href = window.URL.createObjectURL(blob);
      linkCSV.setAttribute('download', 'pedidos.csv');
      document.body.appendChild(linkCSV);
      linkCSV.click();
      document.body.removeChild(linkCSV);
    } catch (err) {
      let msg = 'No se pudo descargar el archivo CSV';
      if (err?.response?.data) {
        try {
          const reader = new FileReader();
          reader.onload = function() {
            try {
              const json = JSON.parse(reader.result);
              if (json.message) toast.error(json.message);
              else toast.error(msg);
            } catch { toast.error(msg); }
          };
          reader.readAsText(err.response.data);
          return;
        } catch {}
      }
      toast.error(msg);
    }
  };

  const handleExportExcel = async () => {
    const params = [];
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (statusFilter) params.push(`status=${encodeURIComponent(statusFilter)}`);
    if (user?.id) params.push(`artisan_id=${user.id}`);
    const url = `/api/orders/export/excel${params.length ? '?' + params.join('&') : ''}`;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(url, {
        baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const linkExcel = document.createElement('a');
      linkExcel.href = window.URL.createObjectURL(blob);
      linkExcel.setAttribute('download', 'pedidos.xlsx');
      document.body.appendChild(linkExcel);
      linkExcel.click();
      document.body.removeChild(linkExcel);
    } catch (err) {
      let msg = 'No se pudo descargar el archivo Excel';
      if (err?.response?.data) {
        try {
          const reader = new FileReader();
          reader.onload = function() {
            try {
              const json = JSON.parse(reader.result);
              if (json.message) toast.error(json.message);
              else toast.error(msg);
            } catch { toast.error(msg); }
          };
          reader.readAsText(err.response.data);
          return;
        } catch {}
      }
      toast.error(msg);
    }
  };

  const handleExportSelectedCSV = async () => {
    const params = [];
    if (selectedOrders.length > 0) params.push(`ids=${selectedOrders.join(',')}`);
    else {
      if (search) params.push(`search=${encodeURIComponent(search)}`);
      if (statusFilter) params.push(`status=${encodeURIComponent(statusFilter)}`);
      if (user?.id) params.push(`artisan_id=${user.id}`);
    }
    const url = `/api/orders/export/csv${params.length ? '?' + params.join('&') : ''}`;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(url, {
        baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const linkSelCSV = document.createElement('a');
      linkSelCSV.href = window.URL.createObjectURL(blob);
      linkSelCSV.setAttribute('download', 'pedidos.csv');
      document.body.appendChild(linkSelCSV);
      linkSelCSV.click();
      document.body.removeChild(linkSelCSV);
    } catch (err) {
      toast.error('No se pudo descargar el archivo CSV');
    }
  };

  const handleExportSelectedExcel = async () => {
    const params = [];
    if (selectedOrders.length > 0) params.push(`ids=${selectedOrders.join(',')}`);
    else {
      if (search) params.push(`search=${encodeURIComponent(search)}`);
      if (statusFilter) params.push(`status=${encodeURIComponent(statusFilter)}`);
      if (user?.id) params.push(`artisan_id=${user.id}`);
    }
    const url = `/api/orders/export/excel${params.length ? '?' + params.join('&') : ''}`;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(url, {
        baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const linkSelExcel = document.createElement('a');
      linkSelExcel.href = window.URL.createObjectURL(blob);
      linkSelExcel.setAttribute('download', 'pedidos.xlsx');
      document.body.appendChild(linkSelExcel);
      linkSelExcel.click();
      document.body.removeChild(linkSelExcel);
    } catch (err) {
      toast.error('No se pudo descargar el archivo Excel');
    }
  };

  const now = new Date();
  const newOrdersCount = filteredOrders.filter(order => dayjs(now).diff(dayjs(order.created_at), 'hour') < 24).length;

  const handleSelectOrder = (orderId) => {
    setSelectedOrders(prev => prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]);
  };
  const handleSelectAll = () => {
    if (allSelected) setSelectedOrders([]);
    else setSelectedOrders(filteredOrders.map(o => o.id));
  };
  const handleBulkStatusChange = async () => {
    if (!bulkStatus || selectedOrders.length === 0) return;
    try {
      const backendStatus = statusMap[bulkStatus] || bulkStatus;
      await Promise.all(selectedOrders.map(id => api.put(`/orders/${id}/status`, { status: backendStatus })));
      setOrders(prev => prev.map(o => selectedOrders.includes(o.id) ? { ...o, status: bulkStatus } : o));
      setSelectedOrders([]);
      setBulkStatus("");
      toast.success('Estados actualizados');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Error al actualizar estados';
      toast.error(msg);
    }
  };

  const handleBulkResendInvoices = async () => {
    if (selectedOrders.length === 0) return;
    let success = 0, fail = 0;
    for (const id of selectedOrders) {
      const order = orders.find(o => o.id === id);
      if (order && order.status === 'confirmed') {
        try {
          await api.post(`/orders/${id}/pay`);
          success++;
        } catch {
          fail++;
        }
      } else {
        fail++;
      }
    }
    toast.success(`${success} factura(s) reenviada(s), ${fail} fallidas.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-10 px-4">
      <div className="max-w-6xl mx-auto bg-white/80 rounded-2xl shadow-2xl p-8 border border-amber-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold flex items-center gap-2">Pedidos Recibidos {newOrdersCount > 0 && <span className="ml-2 px-3 py-1 rounded-full bg-green-500 text-white text-xs font-bold animate-pulse">{newOrdersCount} nuevos</span>}</h1>
            <span className="text-sm text-gray-500 font-medium">Artesano: <span className="text-indigo-700 font-semibold">{user?.name}</span></span>
          </div>
          <button
            className="flex items-center gap-1 text-indigo-600 hover:text-indigo-900 font-semibold border border-indigo-200 rounded-lg px-3 py-1 bg-white/70 shadow"
            onClick={showArtisanOrdersTutorial}
            type="button"
            title="Ver tutorial de uso"
          >
            <HelpCircle className="w-5 h-5" /> ¿Cómo usar?
          </button>
          <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
            <div className="relative w-full sm:w-auto">
              <input
                type="text"
                className="input border-blue-200 pr-10 w-full sm:w-48"
                placeholder="Buscar por ID o usuario"
                value={search}
                onChange={e => setSearch(e.target.value)}
                title="Buscar pedidos por ID o usuario"
              />
              <Search className="absolute right-2 top-2.5 w-5 h-5 text-blue-400" />
            </div>
            <select
              className="input border-blue-200 w-full sm:w-auto"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              title="Filtrar pedidos por estado"
            >
              <option value="">Todos los estados</option>
              {Object.entries(statusLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("");
                if (user) {
                  setLoading(true);
                  api.get(`/orders?artisan_id=${user.id}`)
                    .then(res => setOrders(res.data))
                    .catch(() => toast.error('No se pudieron recargar los pedidos'))
                    .finally(() => setLoading(false));
                }
              }}
              className="btn btn-sm bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold flex items-center gap-1"
              title="Actualizar y recargar pedidos"
            >
              <RefreshCw className="w-4 h-4" /> Actualizar
            </button>
            <button onClick={handleExportCSV} className="btn btn-sm bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold flex items-center gap-1" title="Exportar pedidos a CSV"><Download className="w-4 h-4" /> Exportar CSV</button>
            <button onClick={handleExportExcel} className="btn btn-sm bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold flex items-center gap-1" title="Exportar pedidos a Excel"><Download className="w-4 h-4" /> Exportar Excel</button>
            <button
              onClick={handleBulkResendInvoices}
              disabled={true}
              className="btn btn-sm bg-gradient-to-r from-pink-500 to-orange-500 text-white font-bold flex items-center gap-1"
              title="Actualmente desactivado"
            >
              <Mail className="w-4 h-4" /> Reenviar facturas
            </button>
          </div>
        </div>
        {/* Banner de recomendaciones de cambios de estado */}
        <div className="mb-6">
          <div className="rounded-xl bg-gradient-to-r from-yellow-100 to-amber-100 border border-amber-300 px-6 py-3 flex items-center gap-3 shadow">
            <span className="font-bold text-amber-700 text-lg">⚠️ Recomendaciones:</span>
            <ul className="list-disc ml-6 text-amber-800 text-sm">
              <li>El flujo recomendado es: <b>Pendiente → Pagado (cliente) → Confirmado (artesano/admin) → Enviado → En tránsito → Entregado</b>.</li>
              <li>Usa <b>Cancelado</b> solo si el pedido no puede completarse.</li>
              <li>Actualiza el estado solo cuando realmente cambie la situación del pedido.</li>
              <li>El cliente recibirá notificaciones por email cada vez que cambies el estado.</li>
            </ul>
          </div>
        </div>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-4" />
            <p className="text-lg text-gray-600">Cargando pedidos...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl font-pacifico text-indigo-600 mb-2">No hay pedidos que coincidan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-amber-100">
              <thead>
                <tr>
                  <th className="px-2"><input type="checkbox" checked={allSelected} onChange={handleSelectAll} /></th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Usuario</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Factura</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-50">
                {filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-indigo-50/60 transition">
                    <td className="px-2"><input type="checkbox" checked={selectedOrders.includes(order.id)} onChange={() => handleSelectOrder(order.id)} /></td>
                    <td className="px-4 py-3 font-mono text-sm">#{order.id}
                      {dayjs(now).diff(dayjs(order.created_at), 'hour') < 24 && (
                        <span className="ml-2 px-2 py-0.5 rounded-full bg-green-400 text-white text-xs font-bold animate-bounce">Nuevo</span>
                      )}
                      {lowStockOrders[order.id] && (
                        <AlertTriangle className="inline ml-2 w-4 h-4 text-red-500 animate-pulse" title="¡Stock bajo en uno o más productos!" />
                      )}
                    </td>
                    <td className="px-4 py-3">{order.user_name}</td>
                    <td className="px-4 py-3">{user?.name}</td>
                    <td className="px-4 py-3">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-bold text-green-700">${parseFloat(order.total).toLocaleString('es-CO')} COP</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`} title={`Estado actual del pedido: ${statusLabels[order.status] || order.status}`}>{statusLabels[order.status] || order.status}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {order.status === 'paid' || order.status === 'confirmed' ? (
                        <a
                          href={`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/uploads/invoice-order-${order.id}.pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 font-semibold"
                          title="Descargar factura PDF"
                        >
                          <FileText className="w-5 h-5" /> PDF
                        </a>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col gap-2 items-center">
                        <Link href={`/artisan/orders/${order.id}`} className="btn btn-xs bg-gradient-to-r from-indigo-400 to-purple-400 text-white font-bold rounded-xl shadow hover:scale-105 transition flex items-center gap-1 mt-1" title="Ver detalle del pedido">
                          <Eye className="w-4 h-4" /> View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {selectedOrders.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <span className="font-semibold">Acción masiva:</span>
            <select className="input border-amber-200" value={bulkStatus} onChange={e => setBulkStatus(e.target.value)}>
              <option value="">Cambiar estado a...</option>
              {validNextStatuses.map(status => (
                <option key={status} value={status}>{statusLabels[status]}</option>
              ))}
            </select>
            <button className="btn btn-sm bg-gradient-to-r from-indigo-400 to-purple-500 text-white font-bold flex items-center gap-1" onClick={handleBulkStatusChange} disabled={!bulkStatus}>Aplicar</button>
            <span className="text-xs text-gray-500">({selectedOrders.length} seleccionados)</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuthProtection(ArtisanOrdersPage, { requiredRole: 'artesano' }); 