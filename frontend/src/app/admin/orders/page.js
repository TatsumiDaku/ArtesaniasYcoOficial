'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import withAuthProtection from '@/components/auth/withAuthProtection';
import DataTable from '@/components/ui/DataTable';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await api.get('/orders'); // Assuming this endpoint exists and is admin-only
        setOrders(res.data);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);
  
  const columns = [
    { Header: 'ID Pedido', accessor: 'id' },
    { Header: 'ID Usuario', accessor: 'usuario_id' },
    { Header: 'Total', accessor: 'total', Cell: ({ row }) => `$${parseFloat(row.total).toLocaleString('es-CO')} COP` },
    { Header: 'Estado', accessor: 'estado' },
    { Header: 'Fecha', accessor: 'fecha_creacion', Cell: ({ row }) => new Date(row.fecha_creacion).toLocaleDateString() },
    { 
      Header: 'Acciones', 
      accessor: 'actions',
      Cell: ({ row }) => (
        <button className="text-blue-400 hover:text-blue-300">Ver Detalles</button>
      )
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary mb-6">Gestionar Pedidos</h1>
      {loading ? <p>Cargando...</p> : <DataTable columns={columns} data={orders} />}
    </div>
  );
};

export default withAuthProtection(AdminOrdersPage, { requiredRole: 'admin' }); 