'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Info, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const PendingApprovalModal = () => {
    const { showPendingModal, setShowPendingModal } = useAuth();
    const [countdown, setCountdown] = useState(10);

    // Efecto para manejar la cuenta regresiva del temporizador
    useEffect(() => {
        let timer;
        if (showPendingModal) {
            setCountdown(10); // Reiniciar el contador al abrir
            timer = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [showPendingModal]);

    // Efecto para cerrar el modal cuando el contador llega a cero
    useEffect(() => {
        if (countdown <= 0 && showPendingModal) {
            setShowPendingModal(false);
        }
    }, [countdown, showPendingModal, setShowPendingModal]);

    return (
        <AnimatePresence>
            {showPendingModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 50, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 50, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
                    >
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-full mx-auto flex items-center justify-center mb-6 shadow-lg">
                                <Info size={32} />
                            </div>

                            <h2 className="text-2xl font-bold text-gray-800">Cuenta Pendiente de Aprobación</h2>
                            <p className="text-gray-600 mt-4 leading-relaxed">
                                Para poder iniciar sesión como artesano, un administrador debe verificar y aprobar tu cuenta. Este proceso suele tardar menos de 24 horas. Agradecemos tu paciencia.
                            </p>
                        </div>
                        
                        <div className="p-4 bg-gray-50 border-t">
                            <div className="flex items-center justify-between gap-4">
                                <button
                                    onClick={() => setShowPendingModal(false)}
                                    className="btn btn-ghost"
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Cerrar
                                </button>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Clock className="w-4 h-4" />
                                    <span>Cerrando automáticamente en {countdown}s</span>
                                </div>
                            </div>
                        </div>

                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PendingApprovalModal; 