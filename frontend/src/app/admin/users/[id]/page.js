'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { ArrowLeft, User, Save, Crown, Package, ShieldCheck, Mail, Phone, MapPin, Building, BookOpen, PenSquare, Hash } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

import api from '@/utils/api';
import withAuthProtection from '@/components/auth/withAuthProtection';
import PasswordInput from '@/components/ui/PasswordInput';

const AdminUserDetailPage = () => {
  const params = useParams();
  const userId = params.id;
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm();

  // --- Data Fetching ---
  const fetchData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const userRes = await api.get(`/users/admin/${userId}`);
      setUser(userRes.data);
      reset(userRes.data); 
    } catch (error) {
      toast.error('No se pudieron cargar los datos del usuario.');
      console.error(error);
      router.push('/admin/users');
    } finally {
      setLoading(false);
    }
  }, [userId, reset, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Form Submission ---
  const onSubmit = async (data) => {
    const formData = new FormData();
    let hasChanges = false;

    Object.keys(data).forEach(key => {
        // Manejo especial para el avatar
        if (key === 'avatar') {
            if (data.avatar && data.avatar[0]) {
                formData.append('avatar', data.avatar[0]);
                hasChanges = true;
            }
        } 
        // Para otros campos, solo añadir si han cambiado
        else if (data[key] !== user[key] && (data[key] || user[key] !== null)) {
            // No enviar contraseña vacía
            if (key === 'password' && data[key] === '') return;
            formData.append(key, data[key]);
            hasChanges = true;
        }
    });

    if (!hasChanges) {
        return toast.success('No hay cambios para guardar.');
    }
    
    toast.loading('Actualizando usuario...');
    try {
      const res = await api.put(`/users/admin/${userId}`, formData);
      toast.dismiss();
      toast.success('¡Usuario actualizado exitosamente!');
      setUser(res.data.user);
      reset(res.data.user);
    } catch (error) {
      toast.dismiss();
      const errorMessage = error.response?.data?.message || 'No se pudo actualizar el usuario.';
      toast.error(errorMessage);
      console.error(error);
    }
  };

  // --- UI Components ---
  const FormSection = ({ title, icon, children }) => (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50">
      <div className="p-6 border-b border-gray-200/80 flex items-center gap-4">
        {icon}
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {children}
      </div>
    </div>
  );

  const FormInput = ({ id, label, register, error, type = 'text', requiredMsg, className = 'md:col-span-1' }) => (
    <div className={className}>
      <label htmlFor={id} className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{label}</label>
      <input
        id={id}
        type={type}
        {...register(id, { required: requiredMsg })}
        className="mt-1 block w-full px-4 py-3 bg-white rounded-xl border-2 border-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
      {error && <span className="text-red-500 text-xs mt-1">{error.message}</span>}
    </div>
  );
  
  // --- Loading and Error States ---
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50"><span className="loading loading-spinner loading-lg"></span></div>;
  }
  
  if (!user) {
    return <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-800">Error: Usuario no encontrado.</div>;
  }

  // --- Main Render ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Link 
          href="/admin/users"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-200 rounded-xl shadow-lg hover:shadow-xl text-gray-700 font-medium border border-gray-200 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Usuarios
        </Link>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Header */}
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Image 
                src={user.avatar ? `${process.env.NEXT_PUBLIC_API_URL}${user.avatar}` : '/static/LogoIncial.png'}
                alt="Avatar"
                width={100}
                height={100}
                className="w-24 h-24 object-cover rounded-full shadow-2xl border-4 border-white"
              />
              <label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                <PenSquare className="text-white w-8 h-8" />
              </label>
              <input id="avatar-upload" type="file" {...register('avatar')} className="hidden" accept="image/*" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800">{user.name}</h1>
              <div className="flex items-center gap-2 text-lg text-gray-600 mt-1">
                {user.role === 'admin' && <Crown className="w-5 h-5 text-amber-500" />}
                {user.role === 'artesano' && <Package className="w-5 h-5 text-orange-500" />}
                {user.role === 'cliente' && <User className="w-5 h-5 text-blue-500" />}
                <span className="font-semibold capitalize">{user.role}</span>
              </div>
            </div>
          </div>
          
          {/* --- Sección de Cuenta --- */}
          <FormSection title="Información de la Cuenta" icon={<ShieldCheck className="w-6 h-6 text-emerald-600"/>}>
            <FormInput id="name" label="Nombre Completo" register={register} error={errors.name} requiredMsg="El nombre es obligatorio" />
            <FormInput id="email" label="Correo Electrónico" register={register} error={errors.email} requiredMsg="El correo es obligatorio" type="email" />
            <FormInput id="phone" label="Teléfono" register={register} error={errors.phone} />
            <div className="md:col-span-1">
                <label htmlFor="role" className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Rol</label>
                <select id="role" {...register("role")} className="mt-1 block w-full px-4 py-3 bg-white rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="cliente">Cliente</option>
                    <option value="artesano">Artesano</option>
                    <option value="admin">Admin</option>
                </select>
            </div>
             <div className="md:col-span-2">
                <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Nueva Contraseña</label>
                <PasswordInput name="password" register={register} placeholder="Dejar en blanco para no cambiar"/>
                <p className="text-xs text-gray-500 mt-1">Solo introduce un valor si quieres cambiar la contraseña actual.</p>
            </div>
          </FormSection>

          {/* --- Sección de Ubicación Cliente --- */}
          {user.role === 'cliente' && (
              <FormSection title="Dirección de Envío" icon={<MapPin className="w-6 h-6 text-blue-600"/>}>
                <FormInput id="country" label="País" register={register} error={errors.country} />
                <FormInput id="state" label="Departamento" register={register} error={errors.state} />
                <FormInput id="city" label="Municipio" register={register} error={errors.city} className="md:col-span-2"/>
              </FormSection>
          )}

          {/* --- Sección de Artesano (Condicional) --- */}
          {user.role === 'artesano' && (
            <>
              <FormSection title="Perfil de Artesano" icon={<PenSquare className="w-6 h-6 text-orange-600"/>}>
                <FormInput id="nickname" label="Nickname" register={register} error={errors.nickname} requiredMsg="El nickname es obligatorio" />
                <FormInput id="professional_email" label="Correo Profesional" register={register} error={errors.professional_email} type="email" />
                <div className="md:col-span-2">
                  <label htmlFor="artisan_story" className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Historia del Artesano</label>
                  <textarea
                    id="artisan_story"
                    {...register('artisan_story')}
                    rows="4"
                    className="mt-1 block w-full px-4 py-3 bg-white rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </FormSection>

              <FormSection title="Ubicación y Documentación" icon={<MapPin className="w-6 h-6 text-blue-600"/>}>
                <FormInput id="country" label="País" register={register} error={errors.country} />
                <FormInput id="state" label="Departamento" register={register} error={errors.state} />
                <FormInput id="city" label="Municipio" register={register} error={errors.city} />
                <FormInput id="id_document" label="Cédula de Ciudadanía" register={register} error={errors.id_document} />
                <FormInput id="workshop_address" label="Dirección del Taller" register={register} error={errors.workshop_address} className="md:col-span-2" />
              </FormSection>
            </>
          )}

          {/* --- Botón de Guardado Flotante --- */}
          <footer className="sticky bottom-0 py-4">
             <div className={`transition-transform duration-300 ${isDirty ? 'translate-y-0' : 'translate-y-24'}`}>
                <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-4 flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-700">
                        {isDirty ? "Tienes cambios sin guardar." : "No hay cambios para guardar."}
                    </p>
                    <button type="submit" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!isDirty || loading}>
                        <Save className="w-5 h-5" />
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </div>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default withAuthProtection(AdminUserDetailPage, ['admin']); 