'use client';

import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, ShoppingCart } from 'lucide-react';

const CartPage = () => {
  const { cart, loading, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><span className="loading loading-lg"></span></div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-white text-gray-900 min-h-screen">
      <h1 className="text-4xl font-black tracking-tight text-gray-900 mb-8">Tu Carrito</h1>
      
      {cart.length === 0 ? (
        <div className="text-center py-20 bg-gray-100 rounded-2xl">
          <ShoppingCart className="mx-auto w-16 h-16 text-gray-400 mb-4" />
          <p className="text-xl text-gray-600 mb-4">Tu carrito está vacío.</p>
          <Link href="/products" className="btn btn-primary">
            Descubrir Productos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => {
              const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
              const imageUrl = item.product?.images?.[0] ? `${API_BASE_URL}${item.product.images[0]}` : 'https://via.placeholder.com/100';

              return (
                <div key={item.product_id} className="card card-side bg-white shadow-md p-4 items-center text-gray-900">
                  <figure className="w-24 h-24 flex-shrink-0">
                    <Image
                      src={imageUrl}
                      alt={item.product?.name || 'Producto'}
                      width={96}
                      height={96}
                      className="rounded-lg object-cover w-full h-full"
                    />
                  </figure>
                  <div className="card-body p-4">
                    <h3 className="card-title text-lg font-semibold">{item.product?.name}</h3>
                    <p className="text-base-content/70">${parseFloat(item.product?.price || 0).toLocaleString('es-CO')} COP</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.product_id, parseInt(e.target.value, 10))}
                      className="input input-bordered w-20 text-center"
                    />
                    <button onClick={() => removeFromCart(item.product_id)} className="btn btn-ghost btn-circle" aria-label="Eliminar">
                      <Trash2 className="text-error" />
                    </button>
                  </div>
                </div>
              )
            })}
             <button onClick={clearCart} className="btn btn-outline btn-error btn-sm mt-4">
              Vaciar Carrito
            </button>
          </div>

          {/* Cart Summary */}
          <div className="card bg-gray-100 h-fit p-6 space-y-4 shadow-lg text-gray-900">
            <h2 className="text-2xl font-bold">Resumen del Pedido</h2>
            <div className="flex justify-between">
              <span className="text-base-content/70">Subtotal</span>
              <span className="font-semibold">${totalPrice.toLocaleString('es-CO')} COP</span>
            </div>
            <div className="flex justify-between">
              <span className="text-base-content/70">Envío</span>
              <span className="font-semibold">Gratis</span>
            </div>
            <div className="divider my-2"></div>
            <div className="flex justify-between text-xl font-bold">
              <span>Total</span>
              <span>${totalPrice.toLocaleString('es-CO')} COP</span>
            </div>
            <button className="w-full btn btn-primary mt-4">
              Proceder al Pago
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage; 