'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import api from '@/utils/api';
import { toast } from 'react-hot-toast';
import withAuthProtection from '@/components/auth/withAuthProtection';
import { User, Phone, MapPin, Mail, Calendar, Shield, Edit3, Save, UserCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const ProfilePage = () => {
  const { user, updateUser: updateAuthUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null); // Estado para la data fresca de la API
  const [userStats, setUserStats] = useState({ favorites: 0, orders: 0 });
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm();

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [userRes, statsRes] = await Promise.all([
            api.get('/users/me'),
            api.get('/stats/user')
        ]);
        
        setUserInfo(userRes.data);
        setUserStats(statsRes.data);
        reset(userRes.data);

      } catch (error) {
        toast.error('No se pudo cargar tu información.');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [reset]);


  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await api.put('/users/me', data);
      updateAuthUser(res.data.token, res.data.user);
      setUserInfo(res.data.user);
      reset(res.data.user);
      toast.success('Perfil actualizado con éxito.');
    } catch (error) {
      toast.error('Error al actualizar el perfil.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const FormInput = ({ id, label, icon, required = false, className = 'md:col-span-1', ...props }) => (
      <div className={className}>
          <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                  {icon} {label}
              </div>
          </label>
          <input
              id={id}
              {...register(id, { required: required && 'Este campo es requerido' })}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-indigo-300 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              {...props}
          />
          {errors[id] && <span className="text-red-500 text-xs mt-1">{errors[id].message}</span>}
      </div>
  );
  
  if (loading || !userInfo) {
     return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
          <p className="text-lg font-medium text-gray-600">Cargando tu perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-200 rounded-xl shadow-lg hover:shadow-xl text-gray-700 font-medium border border-gray-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Columna Izquierda: Info Fija */}
          <div className="xl:col-span-1 space-y-6">
             <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 space-y-4">
                <h2 className="text-xl font-bold text-gray-800">Resumen de tu Cuenta</h2>
                 <div className="flex items-center gap-4 text-gray-700">
                    <Mail className="w-5 h-5 text-indigo-500" />
                    <span>{userInfo.email}</span>
                 </div>
                 <div className="flex items-center gap-4 text-gray-700">
                    <Calendar className="w-5 h-5 text-purple-500" />
                    <span>Miembro desde {new Date(userInfo.created_at).toLocaleDateString('es-ES')}</span>
                 </div>
                 <div className="grid grid-cols-2 gap-4 pt-4 border-t mt-4">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600">{userStats.orders}</div>
                    <div className="text-sm text-gray-600">Pedidos</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                    <div className="text-2xl font-bold text-green-600">{userStats.favorites}</div>
                    <div className="text-sm text-gray-600">Favoritos</div>
                  </div>
                </div>
             </div>
          </div>

          {/* Columna Derecha: Formulario Editable */}
          <div className="xl:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                    <h2 className="text-xl font-bold">Editar Perfil y Dirección</h2>
                </div>

                <div className="p-8 space-y-8">
                  <fieldset className="space-y-6">
                      <legend className="text-lg font-semibold text-gray-800 mb-2">Información Personal</legend>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput id="name" label="Nombre Completo" icon={<User className="w-4 h-4 text-indigo-500" />} required />
                        <FormInput id="phone" label="Teléfono" icon={<Phone className="w-4 h-4 text-indigo-500" />} />
                      </div>
                  </fieldset>

                   <fieldset className="space-y-6 pt-6 border-t">
                      <legend className="text-lg font-semibold text-gray-800 mb-2">Dirección de Envío</legend>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput id="country" label="País" icon={<MapPin className="w-4 h-4 text-indigo-500" />} />
                        <FormInput id="state" label="Departamento" icon={<MapPin className="w-4 h-4 text-indigo-500" />} />
                        <FormInput id="city" label="Municipio" icon={<MapPin className="w-4 h-4 text-indigo-500" />} />
                      </div>
                  </fieldset>
                </div>
                
                {isDirty && (
                    <div className="px-8 pb-8 text-right">
                      <button type="submit" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50" disabled={loading}>
                        <Save className="w-5 h-5" />
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                      </button>
                    </div>
                )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuthProtection(ProfilePage, ['cliente']); 