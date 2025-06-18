import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function Profile() {
  const { user, isAuthenticated } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    avatar: user?.avatar || '',
  });
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');

  if (!isAuthenticated) {
    return <div className="text-center py-12">Debes iniciar sesión para ver tu perfil.</div>;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Guardando...');
    // Aquí deberías llamar a la API para actualizar el usuario
    setTimeout(() => {
      setMessage('Datos actualizados (simulado)');
      setEditing(false);
    }, 1000);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-orange-600">Mi Perfil</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-gray-700 mb-1">Nombre</label>
          <input
            type="text"
            name="name"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={form.name}
            onChange={handleChange}
            disabled={!editing}
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-1">Teléfono</label>
          <input
            type="text"
            name="phone"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={form.phone}
            onChange={handleChange}
            disabled={!editing}
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-1">Dirección</label>
          <input
            type="text"
            name="address"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={form.address}
            onChange={handleChange}
            disabled={!editing}
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-1">Avatar (URL)</label>
          <input
            type="text"
            name="avatar"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={form.avatar}
            onChange={handleChange}
            disabled={!editing}
          />
        </div>
        <div className="flex justify-between items-center mt-4">
          {!editing ? (
            <button
              type="button"
              className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors font-semibold"
              onClick={() => setEditing(true)}
            >
              Editar
            </button>
          ) : (
            <button
              type="submit"
              className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors font-semibold"
            >
              Guardar
            </button>
          )}
          {message && <span className="text-green-600 text-sm">{message}</span>}
        </div>
      </form>
    </div>
  );
} 