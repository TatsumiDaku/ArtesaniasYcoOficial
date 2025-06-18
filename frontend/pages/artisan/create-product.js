import { useState } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function CreateProduct() {
  const { isAuthenticated, isArtisan } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    images: []
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/api/products/categories');
      setCategories(res.data);
    } catch (error) {
      setCategories([]);
    }
  };

  if (!isAuthenticated || !isArtisan) {
    return <div className="text-center py-12">Acceso denegado. Solo artesanos pueden ver esta página.</div>;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, images: Array.from(e.target.files) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('price', form.price);
      formData.append('stock', form.stock);
      formData.append('category_id', form.category_id);
      form.images.forEach((file) => formData.append('images', file));
      await api.post('/api/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage('Producto creado exitosamente');
      setTimeout(() => router.push('/artisan/products'), 1500);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error al crear producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-orange-600">Crear Nuevo Producto</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4" encType="multipart/form-data">
        <div>
          <label className="block text-gray-700 mb-1">Nombre</label>
          <input
            type="text"
            name="name"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-1">Descripción</label>
          <textarea
            name="description"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={form.description}
            onChange={handleChange}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-1">Precio</label>
            <input
              type="number"
              name="price"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={form.price}
              onChange={handleChange}
              required
              min={0}
              step={0.01}
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Stock</label>
            <input
              type="number"
              name="stock"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={form.stock}
              onChange={handleChange}
              required
              min={0}
            />
          </div>
        </div>
        <div>
          <label className="block text-gray-700 mb-1">Categoría</label>
          <select
            name="category_id"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={form.category_id}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona una categoría</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-700 mb-1">Imágenes</label>
          <input
            type="file"
            name="images"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="w-full"
          />
        </div>
        {message && <div className="text-green-600 text-sm">{message}</div>}
        <button
          type="submit"
          className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors font-semibold"
          disabled={loading}
        >
          {loading ? 'Creando...' : 'Crear Producto'}
        </button>
      </form>
    </div>
  );
} 