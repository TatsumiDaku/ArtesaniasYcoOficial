'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '@/utils/api';
import { toast } from 'react-hot-toast';
import { Mail, Send, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const ForgotPasswordPage = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const res = await api.post('/auth/forgot-password', data);
            toast.success(res.data.message);
            setSubmitted(true);
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Ocurrió un error. Inténtalo de nuevo.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="flex items-center justify-center min-h-[70vh]">
                <div className="w-full max-w-md p-8 space-y-6 card text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                    <h2 className="text-2xl font-bold">Petición Enviada</h2>
                    <p className="text-gray-600">
                        Si una cuenta con ese correo electrónico existe en nuestro sistema, hemos enviado un enlace para recuperar tu contraseña. Por favor, revisa tu bandeja de entrada (y la carpeta de spam).
                    </p>
                    <Link href="/login" className="btn btn-primary w-full mt-4">
                        Volver a Iniciar Sesión
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-[70vh]">
            <div className="w-full max-w-md p-8 space-y-6 card">
                <div className="text-center">
                    <Mail className="w-12 h-12 mx-auto text-primary" />
                    <h2 className="mt-4 text-2xl font-bold">¿Olvidaste tu Contraseña?</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        No te preocupes. Ingresa tu correo electrónico y te enviaremos un enlace para que puedas crear una nueva.
                    </p>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block mb-2 text-sm font-medium text-text-secondary">
                            Correo Electrónico
                        </label>
                        <input
                            type="email"
                            {...register("email", { required: "El correo electrónico es obligatorio" })}
                            className="input w-full"
                        />
                        {errors.email && <span className="text-red-500 text-xs mt-1">{errors.email.message}</span>}
                    </div>
                    <button type="submit" className="w-full btn btn-primary flex items-center justify-center gap-2" disabled={loading}>
                        {loading ? 'Enviando...' : (
                            <>
                                <Send className="w-4 h-4" />
                                Enviar Enlace de Recuperación
                            </>
                        )}
                    </button>
                </form>
                <div className="text-center">
                    <Link href="/login" className="text-sm font-medium text-primary hover:underline">
                        Volver a Iniciar Sesión
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage; 