'use client';

import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '@/utils/api';
import Image from 'next/image';
import { User, Edit3, Save, AlertTriangle, RefreshCw, PenSquare, Phone, MapPin, KeyRound, ArrowLeft, Store, Mail } from 'lucide-react';
import withAuthProtection from '@/components/auth/withAuthProtection';
import PasswordInput from '@/components/ui/PasswordInput';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import imageUrl from '@/utils/imageUrl';

const ArtisanProfilePage = () => {
  const { user, updateUser: updateAuthContext, loading: authLoading, logout } = useAuth();
  const { register, handleSubmit, watch, reset, formState: { errors, isDirty } } = useForm();
  
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const avatarFile = watch('avatar');
  const passwordValue = watch('password');
  const router = useRouter();

  useEffect(() => {
    if (user) {
      const profileData = {
        name: user.name || '',
        nickname: user.nickname || '',
        artisan_story: user.artisan_story || '',
        professional_email: user.professional_email || '',
        phone: user.phone || '',
        country: user.country || '',
        state: user.state || '',
        city: user.city || '',
        workshop_address: user.workshop_address || '',
      };
      reset(profileData);
      
      if (user.avatar) {
        setAvatarPreview(`${process.env.NEXT_PUBLIC_API_URL}${user.avatar}`);
      }
    }
  }, [user, reset]);

  useEffect(() => {
    if (avatarFile && avatarFile.length > 0) {
      const file = avatarFile[0];
      const newPreviewUrl = URL.createObjectURL(file);
      setAvatarPreview(newPreviewUrl);
      return () => URL.revokeObjectURL(newPreviewUrl);
    }
  }, [avatarFile]);

  const onSubmit = async (data) => {
    const formData = new FormData();
    let hasChanges = false;
    
    // Construir FormData solo con los campos que cambiaron
    Object.keys(data).forEach(key => {
        if (key === 'avatar' && data.avatar?.[0]) {
            formData.append('avatar', data.avatar[0]);
            hasChanges = true;
        } else if (key === 'password' && data[key]) {
            formData.append('password', data.password);
            hasChanges = true;
        } else if (key !== 'avatar' && key !== 'password' && data[key] !== user[key]) {
             if(data[key] || (user[key] !== null && user[key] !== '')){
                formData.append(key, data[key]);
                hasChanges = true;
            }
        }
    });

    if (!hasChanges) {
      return toast.info("No hay cambios para guardar.");
    }
    
    setIsSubmitting(true);
    try {
      const res = await api.put('/users/me', formData);
      toast.success('¡Perfil actualizado con éxito!');
      setTimeout(() => {
        logout(false);
      }, 1200);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al actualizar el perfil.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

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
        className="mt-1 block w-full px-4 py-3 bg-white rounded-xl border-2 border-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      {error && <span className="text-red-500 text-xs mt-1">{error.message}</span>}
    </div>
  );

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><span className="loading loading-spinner loading-lg"></span></div>;
  if (!user) return <div className="min-h-screen flex items-center justify-center">No se pudieron cargar tus datos.</div>;

  const hasFormChanges = isDirty || (passwordValue && passwordValue.trim() !== '');

  // Mensaje si el usuario está vacío o faltan datos clave
  const isUserDataBlank = !user || !user.name || !user.nickname;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {isUserDataBlank && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 rounded flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Si la información está en blanco por favor inicie sesión de nuevo
          </div>
        )}
         <div className="mb-6">
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-200 rounded-xl shadow-lg hover:shadow-xl text-gray-700 font-medium border border-gray-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Dashboard
          </Link>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          <header className="flex items-center gap-6">
            <div className="relative group">
              {/* Avatar del artesano */}
              {(avatarPreview && (typeof avatarPreview === 'string' ? avatarPreview.startsWith('/uploads') : true)) ? (
                <img
                  src={typeof avatarPreview === 'string' ? imageUrl(avatarPreview) : avatarPreview}
                  alt={user.nickname || 'Avatar'}
                  className="w-24 h-24 rounded-full object-cover border-4 border-primary mx-auto"
                />
              ) : (user.avatar && user.avatar.startsWith('/uploads') ? (
                <img
                  src={imageUrl(user.avatar)}
                  alt={user.nickname || 'Avatar'}
                  className="w-24 h-24 rounded-full object-cover border-4 border-primary mx-auto"
                />
              ) : (
                <Image
                  src={user.avatar ? imageUrl(user.avatar) : '/static/default-avatar.png'}
                  alt={user.nickname || 'Avatar'}
                  width={96}
                  height={96}
                  className="w-24 h-24 rounded-full object-cover border-4 border-primary mx-auto"
                />
              ))}
              <label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                <Edit3 className="text-white w-10 h-10" />
              </label>
              <input id="avatar-upload" type="file" {...register('avatar')} className="hidden" accept="image/*" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800">{user.name}</h1>
              <p className="text-lg text-gray-600">@{user.nickname}</p>
            </div>
          </header>

          {/* Texto explicativo sobre visibilidad pública */}
          <p className="mb-2 text-sm text-orange-700 bg-orange-50 border-l-4 border-orange-400 rounded px-4 py-2 flex items-center gap-2">
            <Store className="w-4 h-4 text-orange-500" />
            Esta información será visible públicamente en tu tienda para todos los visitantes.
          </p>
          <FormSection title="Información Pública de Perfil" icon={<PenSquare className="w-6 h-6 text-orange-600"/>}>
            <FormInput id="name" label="Nombre Completo" register={register} error={errors.name} requiredMsg="El nombre es obligatorio" />
            <FormInput id="nickname" label="Nickname" register={register} error={errors.nickname} requiredMsg="El nickname es obligatorio" />
            <div className="md:col-span-2">
              <label htmlFor="artisan_story" className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Tu Historia (Pública)</label>
              <textarea id="artisan_story" {...register('artisan_story', {maxLength: 300})} rows="5" className="mt-1 block w-full px-4 py-3 bg-white rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </FormSection>

          <FormSection title="Contacto y Dirección (Privado)" icon={<Phone className="w-6 h-6 text-blue-600"/>}>
            {/* Texto explicativo sobre el correo profesional */}
            <div className="md:col-span-2 mb-2">
              <span className="inline-flex items-center gap-2 text-sm text-indigo-700 bg-indigo-50 border-l-4 border-indigo-400 rounded px-4 py-2">
                <Mail className="w-4 h-4 text-indigo-500" />
                Este correo será visible en tu tienda para que los clientes puedan contactarte directamente.
              </span>
            </div>
            <FormInput id="professional_email" label="Correo Profesional" register={register} error={errors.professional_email} type="email" />
            <FormInput id="phone" label="Teléfono" register={register} error={errors.phone} />
            <FormInput id="country" label="País" register={register} error={errors.country} />
            <FormInput id="state" label="Departamento" register={register} error={errors.state} />
            <FormInput id="city" label="Municipio" register={register} error={errors.city} />
            <FormInput id="workshop_address" label="Dirección del Taller" register={register} error={errors.workshop_address} />
          </FormSection>
          
          <FormSection title="Seguridad" icon={<KeyRound className="w-6 h-6 text-red-600"/>}>
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Nueva Contraseña</label>
              <PasswordInput register={register} name="password" placeholder="Dejar en blanco para no cambiar" />
              <p className="text-xs text-gray-500 mt-1">Introduce un valor solo si deseas cambiar tu contraseña actual.</p>
            </div>
          </FormSection>

          <footer className="sticky bottom-0 py-4">
            <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Por favor, al guardar los cambios cierre sesión y vuelva a ingresar.
            </div>
             <div className={`transition-transform duration-300 ${hasFormChanges ? 'translate-y-0' : 'translate-y-24'}`}>
                <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-4 flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-700">
                        {hasFormChanges ? "Tienes cambios sin guardar." : "Todo está al día."}
                    </p>
                    <button type="submit" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200" disabled={isSubmitting || !hasFormChanges}>
                        <Save className="w-5 h-5" />
                        {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </div>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default withAuthProtection(ArtisanProfilePage, ['artesano']); 