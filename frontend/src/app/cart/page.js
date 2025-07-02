'use client';

import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import api from '@/utils/api';
import { useState } from 'react';
import imageUrl from '@/utils/imageUrl';

const CartPage = () => {
  const { cart, loading, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [processing, setProcessing] = useState(false);

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><span className="loading loading-lg"></span></div>;
  }

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setProcessing(true);
    try {
      // Aquí puedes pedir dirección y método de pago, por ahora valores simulados
      const shippingAddress = 'Dirección de ejemplo';
      const paymentMethod = 'Simulado';
      const cartItems = cart.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity
      }));
      const res = await api.post('/orders/checkout', { cartItems, shippingAddress, paymentMethod });
      toast.success('¡Pedido creado!');
      clearCart();
      const orderId = res.data.order?.orderId || res.data.order?.id;
      if (orderId) {
        router.push(`/orders/${orderId}/confirmation`);
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
    <div className="bg-gradient-to-br from-blue-50 via-pink-50 to-yellow-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <header className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-pacifico bg-gradient-to-r from-amber-600 via-orange-500 to-red-600 bg-clip-text text-transparent drop-shadow-sm leading-loose mb-2">
            Tu Carrito
          </h1>
          <p className="text-xl text-gray-600 mt-2 max-w-2xl mx-auto mb-4">
            Revisa tus tesoros antes de finalizar tu compra. ¡Cada pieza es única y hecha con amor!
          </p>
        </header>
        {cart.length === 0 ? (
          <div className="text-center py-20 bg-white/80 rounded-2xl shadow-xl flex flex-col items-center">
            <ShoppingCart className="mx-auto w-20 h-20 text-amber-300 mb-6" />
            <p className="text-2xl font-pacifico text-amber-600 mb-2">Tu carrito está vacío.</p>
            <p className="text-lg text-gray-500 mb-6">Descubre productos artesanales y agrégalos aquí para comenzar tu pedido.</p>
            <Link href="/products" className="btn px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-pink-400 text-white font-bold shadow-lg hover:scale-105 transition text-lg">
              Descubrir Productos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {cart.map((item) => {
                return (
                  <div key={item.product_id} className="flex flex-col md:flex-row items-center bg-white/90 rounded-2xl shadow-md p-4 gap-6 hover:shadow-xl transition-all border border-amber-100">
                    <figure className="w-28 h-28 flex-shrink-0 overflow-hidden rounded-xl border-2 border-amber-100 bg-white">
                      {item.product?.images?.[0] && item.product.images[0].startsWith('/uploads') ? (
                        <img
                          src={imageUrl(item.product.images[0])}
                          alt={item.product?.name || 'Producto'}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <Image
                          src={imageUrl(item.product?.images?.[0])}
                          alt={item.product?.name || 'Producto'}
                          width={112}
                          height={112}
                          className="object-cover w-full h-full"
                        />
                      )}
                    </figure>
                    <div className="flex-1 flex flex-col gap-2 items-center md:items-start">
                      <h3 className="text-xl font-bold text-amber-700 font-pacifico">{item.product?.name}</h3>
                      <p className="text-lg text-gray-700">${parseFloat(item.product?.price || 0).toLocaleString('es-CO')} COP</p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.product_id, parseInt(e.target.value, 10))}
                        className="input input-bordered w-20 text-center rounded-lg border-amber-200"
                      />
                      <button onClick={() => removeFromCart(item.product_id)} className="btn btn-ghost btn-circle bg-red-50 hover:bg-red-100" aria-label="Eliminar">
                        <Trash2 className="text-red-400 w-6 h-6" />
                      </button>
                    </div>
                  </div>
                )
              })}
              <button onClick={clearCart} className="btn btn-outline btn-error btn-sm mt-4 rounded-xl">
                Vaciar Carrito
              </button>
            </div>

            {/* Cart Summary */}
            <div className="card bg-white/90 h-fit p-8 space-y-6 shadow-xl text-gray-900 rounded-2xl border border-amber-100">
              <h2 className="text-2xl font-bold text-amber-700 font-pacifico mb-4">Resumen del Pedido</h2>
              <div className="flex justify-between text-lg">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-semibold">${totalPrice.toLocaleString('es-CO')} COP</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="text-gray-500">Envío</span>
                <span className="font-semibold">Gratis</span>
              </div>
              <div className="border-t border-amber-200 my-2"></div>
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>${totalPrice.toLocaleString('es-CO')} COP</span>
              </div>
              <button
                className="w-full btn px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-pink-400 text-white font-bold shadow-lg hover:scale-105 transition text-lg mt-4"
                onClick={() => router.push('/checkout')}
                disabled={processing}
              >
                Proceder al Pago
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage; 