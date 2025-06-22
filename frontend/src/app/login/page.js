'use client';

import { useForm } from 'react-hook-form';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import PasswordInput from '@/components/ui/PasswordInput';
import { LogIn } from 'lucide-react';

const LoginPage = () => {
  const { login, loading, error } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    login(data.email, data.password);
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <Image
              src="/static/LogoIncial.png"
              alt="Logo Artesanías & Co"
              width={120}
              height={120}
              className="mx-auto"
            />
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden">
          <div className="p-8 sm:p-10">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-1">Bienvenido de Vuelta</h2>
            <p className="text-center text-gray-600 mb-8">Inicia sesión para continuar</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="text-sm font-semibold text-gray-600 uppercase tracking-wide"
                >
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  {...register("email", { 
                    required: "El correo es obligatorio",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Dirección de correo inválida"
                    }
                  })}
                  className="mt-1 block w-full px-4 py-3 bg-white/80 rounded-xl border-2 border-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.email && <span className="text-red-500 text-xs mt-1">{errors.email.message}</span>}
              </div>
              
              <div>
                <div className="flex justify-between items-center">
                    <label
                        htmlFor="password"
                        className="text-sm font-semibold text-gray-600 uppercase tracking-wide"
                    >
                        Contraseña
                    </label>
                     <Link href="/forgot-password" passHref className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                        ¿Olvidaste?
                    </Link>
                </div>
                <PasswordInput
                  name="password"
                  register={register}
                  required
                />
                 {errors.password && <span className="text-red-500 text-xs mt-1">{errors.password.message}</span>}
              </div>

              {error && (
                  <div className="text-red-600 bg-red-100 border border-red-200 text-sm p-3 rounded-lg text-center">
                      {error}
                  </div>
              )}

              <button 
                type="submit" 
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                    <span>Ingresando...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-6 h-6"/>
                    <span>Entrar</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="bg-gray-50/50 px-8 py-4 border-t border-gray-200/50">
             <p className="text-sm text-center text-gray-600">
                ¿Aún no tienes cuenta?{' '}
                <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                    Crea una ahora
                </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 