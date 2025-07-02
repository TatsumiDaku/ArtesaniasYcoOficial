'use client';

import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import PasswordInput from '@/components/ui/PasswordInput';
import { CheckCircle, AlertCircle, UploadCloud, Image as ImageIcon, UserPlus, ArrowLeft, Eye } from 'lucide-react';
import Image from 'next/image';
import PageLoader from '@/components/ui/PageLoader';

// Componente para la barra de seguridad de la contraseña
const PasswordStrength = ({ password = '' }) => {
  const getStrength = () => {
    let score = 0;
    if (!password) return 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = getStrength();
  const color = ['bg-red-500', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-green-500'][strength];
  const width = `${(strength / 5) * 100}%`;

  return (
    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
      <div className={`h-1.5 rounded-full transition-all duration-300 ${color}`} style={{ width }}></div>
    </div>
  );
};


const RegisterPage = () => {
  const { register: authRegister, loading, error } = useAuth();
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [headerPreview, setHeaderPreview] = useState(null);
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      role: 'cliente',
    }
  });

  const role = watch('role');
  const password = watch('password');
  const avatarFile = watch('avatar');
  const headerFile = watch('shop_header_image');
  const [showLoader, setShowLoader] = useState(false);
  const [shownFields, setShownFields] = useState({});

  useEffect(() => {
    if (avatarFile && avatarFile[0]) {
        const file = avatarFile[0];
        const newPreviewUrl = URL.createObjectURL(file);
        setAvatarPreview(newPreviewUrl);
        
        return () => URL.revokeObjectURL(newPreviewUrl);
    }
  }, [avatarFile]);

  useEffect(() => {
    if (headerFile && headerFile[0]) {
        const file = headerFile[0];
        const newPreviewUrl = URL.createObjectURL(file);
        setHeaderPreview(newPreviewUrl);
        
        return () => {
            URL.revokeObjectURL(newPreviewUrl);
        };
    }
  }, [headerFile]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const onSubmit = async (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        if (key === 'avatar' && data.avatar?.[0]) {
            formData.append('avatar', data.avatar[0]);
        } else if (key === 'shop_header_image' && data.shop_header_image?.[0]) {
            formData.append('shop_header_image', data.shop_header_image[0]);
        } else {
            formData.append(key, data[key]);
        }
    });

    const result = await authRegister(formData);
    if (result?.success) {
      if (result.artisanPending) {
        setRegistrationSuccess(true);
      } else {
        toast.success('¡Registro exitoso!');
        setShowLoader(true);
        setTimeout(() => {
          window.location.href = '/login';
        }, 1200);
      }
    }
  };
  
  if (showLoader) {
    return <PageLoader />;
  }

  if (registrationSuccess) {
    return (
      <div className="min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50 p-4">
        <div className="w-full max-w-md p-8 space-y-4 bg-white/70 backdrop-blur-sm rounded-2xl shadow-2xl text-center border border-gray-200/50">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto"/>
            <h2 className="text-3xl font-bold">¡Registro Exitoso!</h2>
            <p className="text-gray-600">
                Tu cuenta de artesano ha sido creada y ahora está pendiente de aprobación por un administrador. Recibirás una notificación por correo electrónico una vez que sea revisada. Este proceso puede tardar hasta 24 horas.
            </p>
            <Link href="/" className="inline-flex items-center justify-center gap-2 mt-4 px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-teal-600 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300">
                <ArrowLeft className="w-5 h-5" />
                Volver al Inicio
            </Link>
        </div>
      </div>
    );
  }

  const FormInput = ({ id, label, type = "text", register, required, pattern, error, children, className, ...props }) => (
      <div className={className}>
          <label htmlFor={id} className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{label}</label>
          <input 
              id={id}
              type={type}
              {...register(id, { required, pattern })}
              className="mt-1 block w-full px-4 py-3 bg-white/80 rounded-xl border-2 border-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              {...props}
          />
          {error && <span className="text-red-500 text-xs mt-1">{error.message}</span>}
      </div>
  );

  // Función para mostrar toasts informativos al enfocar campos clave
  const handleFieldInfo = (field) => {
    if (shownFields[field]) return;
    setShownFields((prev) => ({ ...prev, [field]: true }));
    switch (field) {
      case 'nickname':
        toast('El nickname será tu nombre público como artesano en la plataforma.', { icon: 'ℹ️' });
        break;
      case 'artisan_story':
        toast('Cuenta brevemente tu historia como artesano/a. Será visible en tu perfil.', { icon: 'ℹ️' });
        break;
      case 'avatar':
        toast('La imagen de perfil es obligatoria y será visible públicamente.', { icon: 'ℹ️' });
        break;
      case 'shop_header_image':
        toast('La imagen de cabecera será la portada de tu tienda. Recomendado: 1500x400px.', { icon: 'ℹ️' });
        break;
      case 'professional_email':
        toast('Este correo será visible en tu perfil de tienda para contacto profesional.', { icon: 'ℹ️' });
        break;
      case 'id_document':
        toast('Ingresa tu cédula de ciudadanía colombiana. Solo números, sin puntos ni guiones.', { icon: 'ℹ️' });
        break;
      case 'phone':
        toast('Ingresa solo números. Ejemplo: 3001234567', { icon: 'ℹ️' });
        break;
      case 'workshop_address':
        toast('Dirección física de tu taller o lugar de trabajo.', { icon: 'ℹ️' });
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
             <img 
                src="/static/LogoIncial.png" 
                alt="Artesanías & CO Logo" 
                width={120} 
                height={120} 
                className="mx-auto" 
             />
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden">
            <div className="p-8 sm:p-10">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-1">Crea tu Cuenta</h2>
                <p className="text-center text-gray-600 mb-8">Únete a nuestra comunidad de arte y tradición</p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {/* --- SECCIÓN 1: TIPO DE CUENTA --- */}
                    <div className="text-center">
                        <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Quiero registrarme como</label>
                        <div className="mt-2 grid grid-cols-2 gap-4 max-w-xs mx-auto">
                            <label className={`flex items-center justify-center p-4 rounded-xl cursor-pointer border-2 transition-all ${role === 'cliente' ? 'bg-indigo-100 border-indigo-500' : 'bg-white/80 border-gray-200'}`}>
                                <input type="radio" {...register("role")} value="cliente" className="sr-only"/>
                                <span>Cliente</span>
                            </label>
                            <label className={`flex items-center justify-center p-4 rounded-xl cursor-pointer border-2 transition-all ${role === 'artesano' ? 'bg-indigo-100 border-indigo-500' : 'bg-white/80 border-gray-200'}`}>
                                <input type="radio" {...register("role")} value="artesano" className="sr-only"/>
                                <span>Artesano</span>
                            </label>
                        </div>
                    </div>
                  
                    {/* --- SECCIÓN 2: INFORMACIÓN BÁSICA --- */}
                    <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <legend className="text-xl font-bold text-gray-700 col-span-full mb-2">Información de Cuenta</legend>
                        <FormInput id="name" label="Nombre Completo" register={register} required="El nombre es requerido" error={errors.name} />
                        <FormInput id="email" label="Correo Electrónico" type="email" register={register} required="El correo es requerido" error={errors.email} pattern={{ value: /^\S+@\S+$/i, message: "Correo inválido"}} />
                         <div>
                            <label htmlFor="password" className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Contraseña</label>
                            <PasswordInput name="password" register={register} required minLength="8" />
                            <PasswordStrength password={password} />
                        </div>
                        <FormInput id="phone" label="Teléfono" type="tel" register={register} required="El teléfono es requerido" error={errors.phone} pattern={{ value: /^[0-9]{7,15}$/, message: "Solo números, entre 7 y 15 dígitos" }} placeholder="Ej: 3001234567" onFocus={() => handleFieldInfo('phone')} />
                    </fieldset>
                    
                    {/* --- SECCIÓN 3: PERFIL DE ARTESANO (CONDICIONAL) --- */}
                    {role === 'artesano' && (
                        <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
                            <legend className="text-xl font-bold text-gray-700 col-span-full mb-2">Perfil Público de Artesano</legend>
                            
                            <div className="md:col-span-2">
                                <label htmlFor="nickname" className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Nickname</label>
                                <input id="nickname" {...register("nickname", { required: "El nickname es obligatorio" })} className="mt-1 block w-full px-4 py-3 bg-white/80 rounded-xl border-2 border-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" onFocus={() => handleFieldInfo('nickname')} />
                                <p className="text-xs text-gray-500 mt-1">Este será tu nombre público como artesano en la plataforma.</p>
                                {errors.nickname && <span className="text-red-500 text-xs mt-1">{errors.nickname.message}</span>}
                            </div>
                            
                            <div className="md:col-span-2">
                                <label htmlFor="artisan_story" className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Tu historia como artesano/a (Máx. 300 caracteres)</label>
                                <textarea id="artisan_story" {...register("artisan_story", { required: "Tu historia es importante.", maxLength: { value: 300, message: "Máximo 300 caracteres." }})} className="mt-1 block w-full px-4 py-3 bg-white/80 rounded-xl border-2 border-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" rows="4" onFocus={() => handleFieldInfo('artisan_story')}></textarea>
                                {errors.artisan_story && <span className="text-red-500 text-xs mt-1">{errors.artisan_story.message}</span>}
                            </div>
                            
                            <div className="md:col-span-2">
                                <label htmlFor="avatar" className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Imagen de Perfil (Obligatoria)</label>
                                <div className="mt-2 flex items-center gap-x-4">
                                    {avatarPreview ? (
                                        <Image src={avatarPreview} alt="Vista previa del avatar" width={80} height={80} className="h-20 w-20 object-cover rounded-full"/>
                                    ) : (
                                        <div className="h-20 w-20 bg-gray-200 rounded-full flex items-center justify-center">
                                            <ImageIcon className="h-10 w-10 text-gray-400" aria-hidden="true" />
                                        </div>
                                    )}
                                    <label htmlFor="avatar-upload" className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-lg shadow-sm border border-indigo-200 hover:bg-indigo-50 transition-colors">
                                        <UploadCloud className="w-5 h-5"/>
                                        <span>Subir imagen</span>
                                        <input id="avatar-upload" type="file" {...register("avatar", { required: "La imagen de perfil es obligatoria." })} className="hidden" accept="image/*" onFocus={() => handleFieldInfo('avatar')} />
                                    </label>
                                </div>
                                {errors.avatar && <span className="text-red-500 text-xs mt-1">{errors.avatar.message}</span>}
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Imagen de Cabecera de la Tienda (Obligatoria)</label>
                                <p className="text-xs text-gray-500 mt-1 mb-2">Esta será la imagen principal en tu perfil de tienda. Recomendado: 1500x400px.</p>
                                <div className="mt-2 w-full aspect-[15/4] bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden relative">
                                    {headerPreview ? (
                                        <Image src={headerPreview} alt="Vista previa de cabecera" layout="fill" objectFit="cover" />
                                    ) : (
                                        <div className="text-center text-gray-400">
                                            <ImageIcon className="h-12 w-12 mx-auto" />
                                            <p>Vista Previa</p>
                                        </div>
                                    )}
                                </div>
                                 <label htmlFor="header-upload" className="mt-2 cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-lg shadow-sm border border-indigo-200 hover:bg-indigo-50 transition-colors">
                                    <UploadCloud className="w-5 h-5"/>
                                    <span>Subir imagen de cabecera</span>
                                    <input id="header-upload" type="file" {...register("shop_header_image", { required: "La imagen de cabecera es obligatoria." })} className="hidden" accept="image/*" onFocus={() => handleFieldInfo('shop_header_image')} />
                                </label>
                                {errors.shop_header_image && <span className="text-red-500 text-xs mt-1">{errors.shop_header_image.message}</span>}
                            </div>

                            <div className="md:col-span-2 mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Eye className="w-5 h-5 text-blue-600" />
                                    <h4 className="font-semibold text-blue-800">Visibilidad Pública</h4>
                                </div>
                                <p className="text-sm text-blue-700 mt-1">
                                    Tu nickname, historia de artesano, imágenes de perfil y cabecera serán visibles públicamente en tu perfil de tienda una vez que tu cuenta sea aprobada.
                                </p>
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="professional_email" className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Correo profesional/artesanal de contacto</label>
                                <input id="professional_email" type="email" {...register("professional_email", { required: "El correo profesional es obligatorio", pattern: { value: /^\S+@\S+\.\S+$/, message: "Correo profesional inválido" } })} className="mt-1 block w-full px-4 py-3 bg-white/80 rounded-xl border-2 border-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" onFocus={() => handleFieldInfo('professional_email')} />
                                <p className="text-xs text-gray-500 mt-1">Este correo será visible en tu perfil de tienda para contacto profesional.</p>
                                {errors.professional_email && <span className="text-red-500 text-xs mt-1">{errors.professional_email.message}</span>}
                            </div>

                            <legend className="text-xl font-bold text-gray-700 col-span-full mb-2 mt-6">Información de Residencia</legend>
                            <FormInput id="country" label="País" register={register} required="El país es requerido" error={errors.country} onFocus={() => handleFieldInfo('country')} />
                            <FormInput id="state" label="Departamento" register={register} required="El departamento es requerido" error={errors.state} onFocus={() => handleFieldInfo('state')} />
                            <FormInput id="city" label="Municipio" register={register} required="El municipio es requerido" error={errors.city} onFocus={() => handleFieldInfo('city')} />
                            <FormInput id="id_document" label="Cédula de Ciudadanía" register={register} required="La cédula es requerida" error={errors.id_document} pattern={{ value: /^[0-9]{6,10}$/, message: "Solo números, entre 6 y 10 dígitos" }} placeholder="Ej: 123456789" onFocus={() => handleFieldInfo('id_document')} />
                            <FormInput id="workshop_address" label="Dirección del Taller" register={register} required="La dirección del taller es requerida" error={errors.workshop_address} className="md:col-span-2" onFocus={() => handleFieldInfo('workshop_address')} />

                        </fieldset>
                    )}
                    
                    {error && (
                        <div className="text-red-600 bg-red-100 border border-red-200 text-sm p-3 rounded-lg text-center col-span-full">
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70" 
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                                <span>Creando Cuenta...</span>
                            </>
                        ) : (
                             <>
                                <UserPlus className="w-6 h-6"/>
                                <span>Crear mi Cuenta</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
             <div className="bg-gray-50/50 px-8 py-4 border-t border-gray-200/50">
                <p className="text-sm text-center text-gray-600">
                    ¿Ya tienes una cuenta?{' '}
                    <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                        Inicia Sesión
                    </Link>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 