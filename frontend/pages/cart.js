import { useCart } from '../context/CartContext';
import Link from 'next/link';
import { useState } from 'react';

export default function Cart() {
  const {
    cartItems,
    loading,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemsCount
  } = useCart();
  const [updating, setUpdating] = useState(null);

  const handleUpdate = async (productId, quantity) => {
    setUpdating(productId);
    await updateCartItem(productId, quantity);
    setUpdating(null);
  };

  const handleRemove = async (productId) => {
    setUpdating(productId);
    await removeFromCart(productId);
    setUpdating(null);
  };

  const handleClear = async () => {
    setUpdating('clear');
    await clearCart();
    setUpdating(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-orange-600">Carrito de Compras</h1>
      {loading ? (
        <div className="text-center py-12">Cargando carrito...</div>
      ) : cartItems.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Tu carrito está vacío.<br />
          <Link href="/products" className="text-orange-600 hover:underline">Ver productos</Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-4 divide-y divide-gray-200">
            {cartItems.map(item => (
              <div key={item.product_id} className="flex items-center py-4 gap-4">
                <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                  {item.images && item.images.length > 0 ? (
                    <img src={`${process.env.NEXT_PUBLIC_API_URL}${item.images[0]}`} alt={item.name} className="object-cover w-full h-full" />
                  ) : (
                    <span className="text-gray-400">Sin imagen</span>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-lg text-gray-900">{item.name}</h2>
                  <div className="text-gray-600 text-sm">${item.price} x {item.quantity}</div>
                  <div className="text-gray-500 text-xs">Stock: {item.stock}</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={item.stock}
                    value={item.quantity}
                    onChange={e => handleUpdate(item.product_id, Number(e.target.value))}
                    className="w-16 border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    disabled={updating === item.product_id}
                  />
                  <button
                    onClick={() => handleRemove(item.product_id)}
                    className="text-red-600 hover:underline text-sm"
                    disabled={updating === item.product_id}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={handleClear}
              className="text-gray-500 hover:underline text-sm"
              disabled={updating === 'clear'}
            >
              Vaciar carrito
            </button>
            <div className="text-lg font-bold text-gray-900">
              Total ({getCartItemsCount()} productos): <span className="text-orange-600">${getCartTotal().toFixed(2)}</span>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              className="bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
              disabled
            >
              Finalizar compra (próximamente)
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 