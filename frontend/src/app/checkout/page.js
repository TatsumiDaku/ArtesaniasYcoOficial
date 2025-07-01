"use client";

import { useState, useEffect } from "react";
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { Loader2, ArrowLeft, Sparkles, Info } from 'lucide-react';

const paymentMethods = [
  { value: 'Contra entrega', label: 'Contra entrega' },
  { value: 'Transferencia', label: 'Transferencia bancaria' },
  { value: 'Simulado', label: 'Pago simulado' },
];

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0].value);
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!shippingAddress.trim()) {
      toast.error("Por favor ingresa la dirección de envío.");
      return;
    }
    if (cart.length === 0) {
      toast.error("Tu carrito está vacío.");
      return;
    }
    setProcessing(true);
    try {
      const cartItems = cart.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity
      }));
      const res = await api.post('/orders/checkout', { cartItems, shippingAddress, paymentMethod });
      setShowSuccess(true);
      toast.success('¡Pedido creado!');
      if (res.data.order && res.data.order.items) {
        const lowStock = res.data.order.items.some(item => item.stock !== undefined && item.stock <= 3);
        if (lowStock) {
          toast('¡Atención! Uno o más productos han quedado con stock bajo tras la compra.', { icon: '⚠️' });
        }
      }
      clearCart();
      const orderId = res.data.order?.orderId || res.data.order?.id;
      if (orderId) {
        setTimeout(() => router.push(`/orders/${orderId}/confirmation`), 1200);
      } else {
        toast.error('No se pudo obtener el ID del pedido.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al crear el pedido');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-yellow-50 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-2xl bg-white/80 rounded-2xl shadow-2xl p-8 border border-amber-100">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-8 h-8 text-amber-400 animate-bounce" />
          <div>
            <h1 className="text-3xl font-bold">Finalizar Compra</h1>
            <p className="text-gray-600 text-sm mt-1">Tus datos están seguros. Puedes editar tu dirección antes de finalizar. Elige el método de pago que prefieras (simulado).</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-lg font-semibold mb-2">Dirección de envío</label>
            <input
              type="text"
              className={`input w-full border-amber-200 ${!shippingAddress.trim() ? 'border-red-300' : ''}`}
              placeholder="Ingresa tu dirección completa"
              value={shippingAddress}
              onChange={e => setShippingAddress(e.target.value)}
              required
            />
            {!shippingAddress.trim() && <p className="text-red-500 text-sm mt-1">La dirección es obligatoria.</p>}
          </div>
          <div>
            <label className="block text-lg font-semibold mb-2 flex items-center gap-2">Método de pago <Info className="w-4 h-4 text-blue-400" title="Todos los métodos son simulados para pruebas" /></label>
            <select
              className="input w-full border-amber-200"
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
            >
              {paymentMethods.map(method => (
                <option key={method.value} value={method.value}>{method.label}</option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">* Todos los métodos de pago son simulados para pruebas.</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 mb-2">
            <h2 className="text-xl font-bold text-amber-700 mb-2">Resumen del Pedido</h2>
            {cart.length === 0 ? (
              <p className="text-gray-500">Tu carrito está vacío.</p>
            ) : (
              <ul className="divide-y divide-amber-100 mb-2">
                {cart.map(item => (
                  <li key={item.product_id} className="py-2 flex justify-between items-center">
                    <span>{item.product?.name || 'Producto'}</span>
                    <span className="text-gray-700 font-semibold">x{item.quantity}</span>
                    <span className="text-green-700 font-bold">${parseFloat(item.product?.price || 0).toLocaleString('es-CO')} COP</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex justify-between text-lg font-bold mt-2">
              <span>Total:</span>
              <span className="text-green-700">${totalPrice.toLocaleString('es-CO')} COP</span>
            </div>
          </div>
          <button
            type="submit"
            className="w-full btn bg-gradient-to-r from-amber-500 to-pink-400 text-white font-bold py-3 rounded-xl shadow-lg hover:scale-105 transition text-lg"
            disabled={processing || cart.length === 0 || !shippingAddress.trim()}
          >
            {processing ? <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" /> : null}
            Finalizar compra
          </button>
        </form>
        {showSuccess && (
          <div className="flex flex-col items-center mt-6 animate-fade-in">
            <Sparkles className="w-12 h-12 text-green-400 animate-bounce mb-2" />
            <p className="text-green-700 font-bold text-lg">¡Compra exitosa!</p>
          </div>
        )}
        <Link href="/cart" className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-pink-400 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300">
          <ArrowLeft className="w-5 h-5" /> Volver al Carrito
        </Link>
      </div>
    </div>
  );
} 