'use client';

import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '@/utils/api';
import Image from 'next/image';
import { Store, Edit3, Save, ArrowLeft, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import withAuthProtection from '@/components/auth/withAuthProtection';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const ArtisanShopPage = () => {
  const { user, updateUser: updateAuthContext, loading: authLoading } = useAuth();
  const router = useRouter();
  const { register, handleSubmit, watch, reset, formState: { isDirty, errors } } = useForm();
  
  const [headerPreview, setHeaderPreview] = useState(null);
  const [savedHeaderImage, setSavedHeaderImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shopData, setShopData] = useState(null);
  const headerFile = watch('shop_header_image');
  const [showSaveAlert, setShowSaveAlert] = useState(false);

  // Helper para validar URLs de imagen
  const isValidImageUrl = (url) =>
    typeof url === 'string' &&
    url.trim() !== '' &&
    (url.startsWith('http') || url.startsWith('/'));

  // Obtener datos actuales de la tienda desde la API
  useEffect(() => {
    const fetchShop = async () => {
      if (!user) return;
      try {
        const res = await api.get(`/shops/${user.id}`);
        console.log('Datos de la tienda desde API:', res.data.shop);
        setShopData(res.data.shop);
        reset({
          shop_tagline: res.data.shop.shop_tagline || '',
          nickname: res.data.shop.nickname || '',
          artisan_story: res.data.shop.artisan_story || '',
          professional_email: res.data.shop.professional_email || '',
          city: res.data.shop.city || '',
          state: res.data.shop.state || '',
          country: res.data.shop.country || '',
        });
        let imgPath = res.data.shop.shop_header_image;
        if (imgPath && !imgPath.startsWith('/')) imgPath = '/' + imgPath;
        if (imgPath && isValidImageUrl(imgPath)) {
          const fullUrl = `${process.env.NEXT_PUBLIC_API_URL}${imgPath}`;
          setSavedHeaderImage(fullUrl);
          setHeaderPreview(fullUrl);
        } else {
          setSavedHeaderImage(null);
          setHeaderPreview(null);
        }
      } catch (err) {
        toast.error('No se pudieron cargar los datos de la tienda.');
        router.push('/dashboard');
      }
    };
    fetchShop();
  }, [user, reset, router]);

  useEffect(() => {
    if (headerFile && headerFile.length > 0) {
      const file = headerFile[0];
      const newPreviewUrl = URL.createObjectURL(file);
      setHeaderPreview(newPreviewUrl);
      console.log('Nueva imagen seleccionada, preview:', newPreviewUrl);
      setShowSaveAlert(true);
      setTimeout(() => setShowSaveAlert(false), 5000);
      return () => URL.revokeObjectURL(newPreviewUrl);
    } else {
      // Si no hay nueva imagen seleccionada, mostrar la guardada
      setHeaderPreview(savedHeaderImage);
      console.log('Mostrando imagen guardada:', savedHeaderImage);
    }
  }, [headerFile, savedHeaderImage]);

  const onSubmit = async (data) => {
    const formData = new FormData();
    let hasChanges = false;
    if (data.shop_header_image?.[0]) {
      formData.append('shop_header_image', data.shop_header_image[0]);
      hasChanges = true;
    }
    ['shop_tagline', 'nickname', 'artisan_story', 'professional_email', 'city', 'state', 'country'].forEach(field => {
      if (data[field] !== shopData[field]) {
        formData.append(field, data[field]);
        hasChanges = true;
      }
    });
    if (!hasChanges) {
      return toast.info("No hay cambios para guardar.");
    }
    setIsSubmitting(true);
    try {
      const res = await api.put('/users/me', formData);
      const { token: newToken, user: updatedUser } = res.data;
      console.log('Respuesta backend tras guardar:', updatedUser.shop_header_image);
      updateAuthContext(newToken, updatedUser);
      toast.success('¡Tienda actualizada con éxito!');
      // Actualizar la cabecera en la previsualización si se subió una nueva
      if (updatedUser.shop_header_image && isValidImageUrl(updatedUser.shop_header_image)) {
        const fullUrl = `${process.env.NEXT_PUBLIC_API_URL}${updatedUser.shop_header_image}`;
        setSavedHeaderImage(fullUrl);
        setHeaderPreview(fullUrl);
      }
      // Refrescar datos de la tienda
      router.refresh();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al actualizar la tienda.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasFormChanges = isDirty || (headerFile && headerFile.length > 0);

  if (authLoading || !shopData) return <div className="min-h-screen flex items-center justify-center"><span className="loading loading-spinner loading-lg"></span></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 flex justify-between items-center">
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-200 rounded-xl shadow-lg hover:shadow-xl text-gray-700 font-medium border border-gray-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Dashboard
          </Link>
          <div className="flex items-center gap-3">
             <Store className="w-8 h-8 text-indigo-600"/>
             <h1 className="text-3xl font-bold text-gray-800">Gestionar Mi Tienda</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {showSaveAlert && (
              <div className="mb-4 flex items-center justify-center">
                <div className="flex items-center gap-3 px-6 py-4 rounded-xl border-2 border-yellow-300 bg-yellow-50 text-yellow-900 shadow-lg font-semibold text-md">
                  <AlertTriangle className="w-6 h-6 text-yellow-500" />
                  <span>
                    Has seleccionado una nueva cabecera. <span className="font-bold">Guarda los cambios</span> para que tu imagen se actualice en la tienda.
                  </span>
                </div>
              </div>
            )}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Apariencia de la Tienda</h2>
                {/* Header Image Upload */}
                <div>
                    <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Imagen de cabecera</label>
                    <p className="text-xs text-gray-500 mb-2">Esta es la primera imagen que verán tus clientes. Recomendado: 1500x400px.</p>
                    <div className="mt-2 h-64 flex justify-center items-center rounded-lg border-2 border-dashed border-gray-300 relative bg-gray-50 hover:bg-gray-100 transition-colors overflow-hidden">
                        {/* Cabecera de la tienda */}
                        {(headerPreview && (typeof headerPreview === 'string' ? headerPreview.startsWith('/uploads') : true)) ? (
                          <img
                            src={typeof headerPreview === 'string' ? headerPreview : headerPreview}
                            alt={`Cabecera de ${user.nickname}`}
                            className="w-full h-48 object-cover rounded-t-2xl"
                            style={{ maxHeight: '220px' }}
                          />
                        ) : (user.shop_header_image && user.shop_header_image.startsWith('/uploads') ? (
                          <img
                            src={`${process.env.NEXT_PUBLIC_API_URL}${user.shop_header_image}`}
                            alt={`Cabecera de ${user.nickname}`}
                            className="w-full h-48 object-cover rounded-t-2xl"
                            style={{ maxHeight: '220px' }}
                          />
                        ) : null)}
                    </div>
                    <div className="mt-4 flex justify-center">
                        <label htmlFor="shop_header_image-upload" className="inline-flex flex-col items-center justify-center px-6 py-3 bg-black/60 hover:bg-black/80 text-white rounded-lg cursor-pointer transition-opacity duration-300">
                            <Edit3 className="h-8 w-8" />
                            <span className="mt-2 text-sm font-medium">Sube una imagen</span>
                            <input id="shop_header_image-upload" type="file" {...register('shop_header_image')} className="sr-only" accept="image/*" />
                        </label>
                    </div>
                </div>
                {/* Avatar del artesano */}
                <div className="absolute left-8 -bottom-12 z-20">
                    {user.avatar && user.avatar.startsWith('/uploads') ? (
                        <img
                            src={user.avatar}
                            alt={`Avatar de ${user.nickname}`}
                            width={96}
                            height={96}
                            className="rounded-full border-4 border-white shadow-lg bg-white object-cover w-24 h-24"
                        />
                    ) : (
                        <Image
                            src={user.avatar || '/static/default-avatar.png'}
                            alt={`Avatar de ${user.nickname}`}
                            width={96}
                            height={96}
                            className="rounded-full border-4 border-white shadow-lg bg-white object-cover w-24 h-24"
                        />
                    )}
                </div>
                {/* Shop Tagline */}
                <div className="mt-6">
                    <label htmlFor="shop_tagline" className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Lema de la Tienda</label>
                    <p className="text-xs text-gray-500 mb-2">Una frase corta que describe tu tienda. Aparecerá debajo del nombre de tu tienda.</p>
                    <input
                        id="shop_tagline"
                        type="text"
                        {...register('shop_tagline')}
                        placeholder="Ej: Cerámicas con corazón, desde mi taller a tu hogar."
                        className="mt-1 block w-full px-4 py-3 bg-white rounded-xl border-2 border-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                {/* Nickname */}
                <div className="mt-6">
                    <label htmlFor="nickname" className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Nombre público (nickname)</label>
                    <input
                        id="nickname"
                        type="text"
                        {...register('nickname')}
                        placeholder="Ej: ArtesanoJuan"
                        className="mt-1 block w-full px-4 py-3 bg-white rounded-xl border-2 border-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                {/* Historia */}
                <div className="mt-6">
                    <label htmlFor="artisan_story" className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Historia de la tienda</label>
                    <textarea
                        id="artisan_story"
                        {...register('artisan_story')}
                        placeholder="Comparte tu historia, inspiración o proceso artesanal."
                        className="mt-1 block w-full px-4 py-3 bg-white rounded-xl border-2 border-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        rows={4}
                    />
                </div>
                {/* Correo profesional/artesanal de contacto */}
                <div className="mt-6">
                    <label htmlFor="professional_email" className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Correo profesional/artesanal de contacto</label>
                    <p className="text-xs text-gray-500 mb-2">Este correo será visible en tu tienda para que los clientes puedan contactarte directamente.</p>
                    <input
                        id="professional_email"
                        type="email"
                        {...register('professional_email', { pattern: { value: /^\S+@\S+\.\S+$/, message: 'Correo profesional inválido' } })}
                        placeholder="Ej: contacto@mitaller.com"
                        className="mt-1 block w-full px-4 py-3 bg-white rounded-xl border-2 border-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {errors?.professional_email && <span className="text-red-500 text-xs mt-1">{errors.professional_email.message}</span>}
                </div>
            </div>

            <footer className="sticky bottom-0 py-4">
                <div className={`transition-transform duration-300 ${hasFormChanges ? 'translate-y-0' : 'translate-y-24'}`}>
                    <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-4 flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-700">
                            {hasFormChanges ? "Tienes cambios sin guardar en tu tienda." : "La información de tu tienda está al día."}
                        </p>
                        <button type="submit" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200" disabled={isSubmitting || !hasFormChanges}>
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

export default withAuthProtection(ArtisanShopPage, ['artesano']); 
