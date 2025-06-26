'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useRouter } from 'next/navigation';
import api from '@/utils/api';
import { toast } from 'react-hot-toast';
import { KeyRound, CheckCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import PasswordInput from '@/components/ui/PasswordInput';
import Image from 'next/image';

const ResetPasswordPage = () => {
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const params = useParams();
    const router = useRouter();
    const token = params.token;

    const password = watch('password');

    const onSubmit = async (data) => {
        if (data.password !== data.confirmPassword) {
            return toast.error("Las contraseñas no coinciden.");
        }
        
        if (!token) {
             setError("No se ha proporcionado un token de reseteo.");
             return;
        }

        setLoading(true);
        setError(null);
        try {
            const res = await api.post(`/auth/reset-password/${token}`, { password: data.password });
            toast.success(res.data.message);
            setSuccess(true);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Ocurrió un error al resetear la contraseña.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex items-center justify-center min-h-[80vh] bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
                <div className="w-full max-w-md p-8 space-y-6 card text-center shadow-xl border border-orange-100 rounded-2xl bg-white/90">
                    <div className="flex flex-col items-center mb-2">
                        <Image src="/static/LogoIncial.png" alt="Logo Artesanías & Co" width={70} height={70} className="mb-2 drop-shadow-sm" />
                        <span className="font-pacifico text-3xl bg-gradient-to-r from-amber-600 via-orange-500 to-red-600 bg-clip-text text-transparent drop-shadow-sm">Artesanías & Co</span>
                    </div>
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto animate-bounce" />
                    <h2 className="text-2xl font-bold text-orange-700">¡Contraseña Actualizada!</h2>
                    <p className="text-gray-700 text-base mt-2">
                        Tu contraseña ha sido cambiada exitosamente.<br />Ya puedes iniciar sesión con tus nuevas credenciales.<br /><br />
                        <span className="text-orange-600 font-medium">¿Necesitas ayuda?</span> Escríbenos a <a href="mailto:somos@artesaniasyco.com" className="underline text-orange-700 font-medium">somos@artesaniasyco.com</a>.
                    </p>
                    <Link href="/login" className="btn btn-primary w-full mt-4">
                        Ir a Iniciar Sesión
                    </Link>
                    <div className="mt-6 text-xs text-gray-500 italic">
                        &quot;El arte de tus manos transforma el mundo. ¡Gracias por ser parte de nuestra comunidad de artesanos!&quot;
                    </div>
                </div>
            </div>
        );
    }
    
    if (error) {
         return (
            <div className="flex items-center justify-center min-h-[80vh] bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
                <div className="w-full max-w-md p-8 space-y-6 card text-center shadow-xl border border-red-100 rounded-2xl bg-white/90">
                    <div className="flex flex-col items-center mb-2">
                        <Image src="/static/LogoIncial.png" alt="Logo Artesanías & Co" width={70} height={70} className="mb-2 drop-shadow-sm" />
                        <span className="font-pacifico text-3xl bg-gradient-to-r from-amber-600 via-orange-500 to-red-600 bg-clip-text text-transparent drop-shadow-sm">Artesanías & Co</span>
                    </div>
                    <AlertTriangle className="w-16 h-16 text-red-500 mx-auto animate-pulse" />
                    <h2 className="text-2xl font-bold text-red-700">Enlace Inválido</h2>
                    <p className="text-gray-700">
                       {error}
                    </p>
                    <Link href="/forgot-password" className="btn btn-primary w-full mt-4">
                        Solicitar un Nuevo Enlace
                    </Link>
                    <div className="mt-6 text-xs text-gray-500 italic">
                        &quot;El arte de tus manos transforma el mundo. ¡Gracias por ser parte de nuestra comunidad de artesanos!&quot;
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-[80vh] bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
            <div className="w-full max-w-md p-8 space-y-6 card shadow-xl border border-orange-100 rounded-2xl bg-white/90">
                <div className="flex flex-col items-center mb-2">
                    <Image src="/static/LogoIncial.png" alt="Logo Artesanías & Co" width={70} height={70} className="mb-2 drop-shadow-sm" />
                    <span className="font-pacifico text-3xl bg-gradient-to-r from-amber-600 via-orange-500 to-red-600 bg-clip-text text-transparent drop-shadow-sm">Artesanías & Co</span>
                </div>
                <div className="text-center">
                    <KeyRound className="w-12 h-12 mx-auto text-orange-500" />
                    <h2 className="mt-4 text-2xl font-bold text-orange-700">Crear Nueva Contraseña</h2>
                    <p className="mt-2 text-sm text-gray-600">
                       Tu nueva contraseña debe ser segura y fácil de recordar.<br />
                       <span className="text-orange-600 font-medium">Consejo:</span> Usa letras, números y símbolos para mayor seguridad.
                    </p>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label htmlFor="password" className="block mb-2 text-sm font-semibold text-gray-700">Nueva Contraseña</label>
                        <PasswordInput
                            name="password"
                            register={register}
                            required
                            minLength="8"
                         />
                        {errors.password && <span className="text-red-500 text-xs mt-1">{errors.password.message}</span>}
                    </div>
                     <div>
                        <label htmlFor="confirmPassword" className="block mb-2 text-sm font-semibold text-gray-700">Confirmar Nueva Contraseña</label>
                        <PasswordInput
                            name="confirmPassword"
                            register={register}
                            required
                         />
                         {watch('confirmPassword') && password !== watch('confirmPassword') && <span className="text-red-500 text-xs mt-1">Las contraseñas no coinciden.</span>}
                    </div>
                    <button type="submit" className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold shadow-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200" disabled={loading}>
                        {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                    </button>
                </form>
                <div className="mt-6 text-xs text-gray-500 italic text-center">
                    &quot;El arte de tus manos transforma el mundo. ¡Gracias por ser parte de nuestra comunidad de artesanos!&quot;
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage; 