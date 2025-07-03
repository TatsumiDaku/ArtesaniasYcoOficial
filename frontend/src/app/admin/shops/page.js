'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { Edit, Trash2, RefreshCw, Store, Shield, ArrowLeft, Loader2, MoreVertical, Eye, UserCheck, UserX, Clock } from 'lucide-react';
import { Switch } from '@headlessui/react';

import api from '@/utils/api';
import withAuthProtection from '@/components/auth/withAuthProtection';
import DataTable from '@/components/ui/DataTable';
import imageUrl from '@/utils/imageUrl';

const StatusBadge = ({ status }) => {
  const statusInfo = {
    active: { text: 'Activo', className: 'bg-green-100 text-green-800 border-green-200' },
    banned: { text: 'Baneado', className: 'bg-gray-200 text-gray-800 border-gray-300' },
  };
  const current = statusInfo[status] || { text: 'Desconocido', className: 'bg-gray-100 text-gray-800' };

  return (
    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full shadow-sm ${current.className}`}>
      {current.text}
    </span>
  );
};

const AdminShopsPage = () => {
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const router = useRouter();
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

  const fetchArtisans = useCallback(async (page = 1) => {
    const isInitialLoad = page === 1;
    if (isInitialLoad) setLoading(true);
    
    try {
      const response = await api.get('/users', { 
        params: { role: 'artesano', page, limit: 15, } 
      });
      const { data, pagination: paginationData } = response.data;
      setArtisans(isInitialLoad ? data : [...artisans, ...data]);
      setPagination(paginationData);
    } catch (error) {
      toast.error('No se pudieron cargar los artesanos.');
    } finally {
      if (isInitialLoad) setLoading(false);
    }
  }, [artisans]);

  useEffect(() => {
    fetchArtisans(1);
  }, [fetchArtisans]);

  const handleRefresh = () => {
    fetchArtisans(1);
  };

  const handleStatusChange = useCallback(async (userId, newStatus) => {
    const originalArtisans = [...artisans];
    // Optimistic update
    setArtisans(prev => prev.map(a => a.id === userId ? { ...a, status: newStatus } : a));
    try {
      await api.put(`/users/admin/${userId}`, { status: newStatus });
      toast.success('Estado del artesano actualizado.');
    } catch (error) {
      // Revert on error
      setArtisans(originalArtisans);
      const msg = error.response?.data?.message || 'No se pudo actualizar el estado. Intenta de nuevo o revisa la consola.';
      toast.error(msg);
    }
  }, [artisans]);

  const handleFeaturedChange = useCallback(async (userId, newFeatured) => {
    const originalArtisans = [...artisans];
    setArtisans(prev => prev.map(a => a.id === userId ? { ...a, featured: newFeatured } : a));
    try {
      await api.put(`/users/admin/${userId}`, { featured: newFeatured });
      toast.success('Estado de destacado actualizado.');
    } catch (error) {
      setArtisans(originalArtisans);
      const msg = error.response?.data?.message || 'No se pudo actualizar el estado de destacado.';
      toast.error(msg);
    }
  }, [artisans]);

  const columns = useMemo(() => [
    {
      header: 'Artesano',
      accessorKey: 'name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
            {row.original.avatar ? (
              row.original.avatar.startsWith('/uploads/') ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${row.original.avatar}`}
                  alt={row.original.name}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                  style={{ minWidth: 40, minHeight: 40 }}
                  onError={(e) => {
                    e.target.src = '/static/default-avatar.png';
                  }}
                />
              ) : (
                <Image
                  src={imageUrl(row.original.avatar)}
                  alt={row.original.name}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = '/static/default-avatar.png';
                  }}
                />
              )
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 border flex items-center justify-center">
                <span className="text-gray-400 text-xs">👤</span>
              </div>
            )}
            <div>
                <p className="font-bold">{row.original.name}</p>
                <p className="text-sm text-gray-500">{row.original.email}</p>
            </div>
        </div>
      )
    },
    { 
      header: 'Estado', 
      accessorKey: 'status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />
    },
    { 
      header: 'Fecha de Registro', 
      accessorKey: 'created_at',
      cell: ({ getValue }) => new Date(getValue()).toLocaleDateString('es-CO')
    },
    {
      header: 'Destacada',
      accessorKey: 'featured',
      cell: ({ row }) => (
        <Switch
          checked={!!row.original.featured}
          onChange={val => handleFeaturedChange(row.original.id, val)}
          className={`${row.original.featured ? 'bg-amber-400' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
        >
          <span className="sr-only">Marcar como destacada</span>
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${row.original.featured ? 'translate-x-6' : 'translate-x-1'}`}
          />
        </Switch>
      )
    },
    {
      header: 'Acciones',
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
            <select
                value={row.original.status}
                onChange={(e) => handleStatusChange(row.original.id, e.target.value)}
                className="text-sm rounded-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
            >
                <option value="active">Activo</option>
                <option value="banned">Baneado</option>
            </select>
          <button
            onClick={() => router.push(`/admin/users/${row.original.id}`)}
            className="p-2 text-gray-500 hover:text-blue-600"
            title="Editar Usuario"
          >
            <Edit className="w-5 h-5" />
          </button>
          <a
            href={`/shops/${row.original.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-gray-500 hover:text-green-600"
            title="Ver Tienda Pública"
          >
            <Eye className="w-5 h-5" />
          </a>
        </div>
      ),
    },
  ], [router, handleStatusChange, handleFeaturedChange, API_BASE_URL]);

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
            <Link 
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al Dashboard
            </Link>
          </div>

          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Tiendas</h1>
              <p className="text-gray-600 mt-1">Administra todas las cuentas de artesanos.</p>
            </div>
            <button onClick={handleRefresh} className="p-2 rounded-lg bg-white shadow-sm border hover:bg-gray-100 text-gray-600 transition-colors" aria-label="Recargar">
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        
        <div className="bg-white rounded-xl shadow-md border border-gray-200">
           <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">
                {pagination?.total || 0} Artesanos Registrados
              </h2>
           </div>
          <div className="p-4">
             <DataTable columns={columns} data={artisans} />
          </div>
          {pagination && pagination.page < pagination.pages && (
            <div className="p-4 border-t border-gray-200 text-center">
              <button
                onClick={() => fetchArtisans(pagination.page + 1)}
                className="px-4 py-2 border rounded-md text-sm font-medium"
              >
                Cargar más
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default withAuthProtection(AdminShopsPage, ['admin']); 
