'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { PlusCircle, Edit, Trash2, Users, Tag, Loader2, AlertTriangle, X } from 'lucide-react';

import api from '@/utils/api';

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/categories/admin');
      setCategories(data);
      setError(null);
    } catch (err) {
      setError('No se pudieron cargar las categorías.');
      toast.error('Error al cargar las categorías.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openModalForCreate = () => {
    reset({ name: '', description: '' });
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (category) => {
    setEditingCategory(category);
    setValue('name', category.name);
    setValue('description', category.description);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    reset();
  };

  const onSubmit = async (formData) => {
    const toastId = toast.loading(editingCategory ? 'Actualizando...' : 'Creando...');
    try {
      let response;
      if (editingCategory) {
        response = await api.put(`/categories/admin/${editingCategory.id}`, formData);
      } else {
        response = await api.post('/categories/admin', formData);
      }
      toast.success(`Categoría ${editingCategory ? 'actualizada' : 'creada'} con éxito.`, { id: toastId });
      fetchCategories();
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ocurrió un error.', { id: toastId });
      console.error(err);
    }
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría? Esta acción no se puede deshacer.')) {
      const toastId = toast.loading('Eliminando...');
      try {
        await api.delete(`/categories/admin/${categoryId}`);
        toast.success('Categoría eliminada con éxito.', { id: toastId });
        fetchCategories();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Error al eliminar.', { id: toastId });
        console.error(err);
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200/80">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <Tag className="w-7 h-7 text-indigo-500" />
          Gestión de Categorías
        </h2>
        <button
          onClick={openModalForCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg"
        >
          <PlusCircle className="w-5 h-5" />
          Nueva Categoría
        </button>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="ml-3 text-gray-600">Cargando categorías...</p>
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-10 bg-red-50 rounded-lg border border-red-200">
          <AlertTriangle className="w-10 h-10 text-red-500 mb-2" />
          <p className="text-red-700 font-semibold">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Categoría</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Artesanos</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-semibold text-gray-900">{cat.name}</div>
                    <div className="text-sm text-gray-500">{cat.description || 'Sin descripción'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{cat.artisan_count}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => openModalForEdit(cat)} className="text-indigo-600 hover:text-indigo-900 transition-colors" title="Editar">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:text-red-900 transition-colors" title="Eliminar">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md z-50 transform transition-all scale-95 animate-in fade-in-0 zoom-in-95">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">{editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
                  <button type="button" onClick={closeModal} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input
                      id="name"
                      type="text"
                      {...register('name', { required: 'El nombre es obligatorio' })}
                      className={`w-full px-3 py-2 border rounded-lg transition-colors ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'} focus:border-indigo-500 focus:ring-2`}
                      placeholder="Ej: Cerámica"
                    />
                    {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descripción (Opcional)</label>
                    <textarea
                      id="description"
                      {...register('description')}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="Una breve descripción de la categoría"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 border border-transparent rounded-lg text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
                >
                  {editingCategory ? 'Guardar Cambios' : 'Crear Categoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManager; 