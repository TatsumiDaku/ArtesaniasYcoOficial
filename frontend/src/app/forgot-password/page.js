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
            <div className="flex items-center justify-center min-h-[70vh] bg-gradient-to-br from-orange-50 to-white">
                <div className="w-full max-w-md p-8 space-y-6 card text-center shadow-xl border border-orange-100 rounded-2xl bg-white/90">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto animate-bounce" />
                    <h2 className="text-2xl font-bold text-orange-700">¡Solicitud enviada con éxito!</h2>
                    <p className="text-gray-700 text-base mt-2">
                        Si existe una cuenta con ese correo electrónico, hemos enviado un enlace para recuperar tu contraseña.<br /><br />
                        <span className="font-semibold text-orange-600">Importante:</span> Es muy probable que el correo llegue primero a la <span className="font-bold">bandeja de spam o correo no deseado</span>. Por favor, revisa allí si no lo ves en tu bandeja principal.<br /><br />
                        Si tienes dudas o necesitas ayuda, escríbenos a <a href="mailto:somos@artesaniasyco.com" className="underline text-orange-700 font-medium">somos@artesaniasyco.com</a>.<br />
                        ¡Gracias por confiar en Artesanías & Co!
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