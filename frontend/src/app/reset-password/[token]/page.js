'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useRouter } from 'next/navigation';
import api from '@/utils/api';
import { toast } from 'react-hot-toast';
import { KeyRound, CheckCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import PasswordInput from '@/components/ui/PasswordInput';

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
            <div className="flex items-center justify-center min-h-[70vh]">
                <div className="w-full max-w-md p-8 space-y-6 card text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                    <h2 className="text-2xl font-bold">Contraseña Actualizada</h2>
                    <p className="text-gray-600">
                        Tu contraseña ha sido cambiada exitosamente. Ya puedes iniciar sesión con tus nuevas credenciales.
                    </p>
                    <Link href="/login" className="btn btn-primary w-full mt-4">
                        Ir a Iniciar Sesión
                    </Link>
                </div>
            </div>
        );
    }
    
    if (error) {
         return (
            <div className="flex items-center justify-center min-h-[70vh]">
                <div className="w-full max-w-md p-8 space-y-6 card text-center">
                    <AlertTriangle className="w-16 h-16 text-red-500 mx-auto" />
                    <h2 className="text-2xl font-bold">Enlace Inválido</h2>
                    <p className="text-gray-600">
                       {error}
                    </p>
                    <Link href="/forgot-password" className="btn btn-primary w-full mt-4">
                        Solicitar un Nuevo Enlace
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-[70vh]">
            <div className="w-full max-w-md p-8 space-y-6 card">
                <div className="text-center">
                    <KeyRound className="w-12 h-12 mx-auto text-primary" />
                    <h2 className="mt-4 text-2xl font-bold">Crear Nueva Contraseña</h2>
                    <p className="mt-2 text-sm text-gray-600">
                       Tu nueva contraseña debe ser segura y fácil de recordar.
                    </p>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label htmlFor="password">Nueva Contraseña</label>
                        <PasswordInput
                            name="password"
                            register={register}
                            required
                            minLength="8"
                         />
                        {errors.password && <span className="text-red-500 text-xs mt-1">{errors.password.message}</span>}
                    </div>
                     <div>
                        <label htmlFor="confirmPassword">Confirmar Nueva Contraseña</label>
                        <PasswordInput
                            name="confirmPassword"
                            register={register}
                            required
                         />
                         {watch('confirmPassword') && password !== watch('confirmPassword') && <span className="text-red-500 text-xs mt-1">Las contraseñas no coinciden.</span>}
                    </div>
                    <button type="submit" className="w-full btn btn-primary" disabled={loading}>
                        {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage; 