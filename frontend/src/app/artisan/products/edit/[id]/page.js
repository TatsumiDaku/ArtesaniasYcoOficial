'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/utils/api';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { ArrowLeft, Save, Image as ImageIcon, Trash2, Plus } from 'lucide-react';

const EditProductPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
  });
  const [newImages, setNewImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImageUrls, setExistingImageUrls] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = useParams();
  const API_BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const [productRes, categoriesRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get('/categories')
        ]);

        const product = productRes.data;
        setFormData({
          name: product.name || '',
          description: product.description || '',
          price: product.price || '',
          stock: product.stock || '',
          category_id: product.category_id || '',
        });
        setExistingImageUrls(product.images || []);
        setCategories(categoriesRes.data);
      } catch (error) {
        toast.error('No se pudieron cargar los datos del producto.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductData();
  }, [id]);
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + existingImageUrls.length + newImages.length > 5) {
      toast.error('Puedes subir un máximo de 5 imágenes.');
      return;
    }
    setNewImages([...newImages, ...files]);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const handleRemoveExistingImage = (urlToRemove) => {
    setExistingImageUrls(existingImageUrls.filter(url => url !== urlToRemove));
  };

  const handleRemoveNewImage = (index) => {
    const newImagesCopy = [...newImages];
    const newImagePreviewsCopy = [...imagePreviews];
    newImagesCopy.splice(index, 1);
    newImagePreviewsCopy.splice(index, 1);
    setNewImages(newImagesCopy);
    setImagePreviews(newImagePreviewsCopy);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    
    // Adjuntar imágenes nuevas
    newImages.forEach(image => data.append('images', image));

    // Adjuntar imágenes existentes que se conservan
    data.append('existingImages', JSON.stringify(existingImageUrls));

    try {
      await api.put(`/products/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Producto actualizado con éxito.');
      router.push('/artisan/products');
      router.refresh();
    } catch (error) {
      toast.error('Error al actualizar el producto.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos del producto...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-amber-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header con botón volver */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/artisan/products')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-200 rounded-xl shadow-lg hover:shadow-xl text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Mis Productos
          </button>
          
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-red-500 to-amber-600 bg-clip-text text-transparent mb-2">
              Editar Producto
            </h1>
            <p className="text-gray-600">Actualiza la información de tu producto artesanal</p>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8">
            {/* Información básica */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                Información Básica
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre del Producto
                  </label>
                  <input 
                    type="text" 
                    name="name" 
                    id="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    required 
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-all duration-200"
                    placeholder="Ej: Jarra de cerámica artesanal"
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea 
                    name="description" 
                    id="description" 
                    value={formData.description} 
                    onChange={handleChange} 
                    required 
                    rows="4" 
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-all duration-200 resize-none"
                    placeholder="Describe tu producto, materiales utilizados, técnicas artesanales..."
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Precio y Stock */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                Precio y Disponibilidad
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="price" className="block text-sm font-semibold text-gray-700 mb-2">
                    Precio ($)
                  </label>
                  <input 
                    type="number" 
                    name="price" 
                    id="price" 
                    value={formData.price} 
                    onChange={handleChange} 
                    required 
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-all duration-200"
                    min="0" 
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label htmlFor="stock" className="block text-sm font-semibold text-gray-700 mb-2">
                    Stock Disponible
                  </label>
                  <input 
                    type="number" 
                    name="stock" 
                    id="stock" 
                    value={formData.stock} 
                    onChange={handleChange} 
                    required 
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-all duration-200"
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Categoría */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">3</span>
                </div>
                Categorización
              </h2>
              
              <div>
                <label htmlFor="category_id" className="block text-sm font-semibold text-gray-700 mb-2">
                  Categoría
                </label>
                <select 
                  name="category_id" 
                  id="category_id" 
                  value={formData.category_id} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-all duration-200"
                >
                  <option value="" disabled>Selecciona una categoría</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Imágenes */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">4</span>
                </div>
                Imágenes del Producto
              </h2>
              
              {/* Imágenes existentes */}
              {existingImageUrls.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Imágenes Actuales
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {existingImageUrls.map((url) => (
                      <div key={url} className="relative group">
                        <Image 
                          src={`${API_BASE_URL}${url}`} 
                          alt="Imagen existente" 
                          width={200} 
                          height={200} 
                          className="w-full h-32 object-cover rounded-xl border-2 border-gray-200"
                        />
                        <button 
                          type="button" 
                          onClick={() => handleRemoveExistingImage(url)} 
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs transition-all duration-200 opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Subir nuevas imágenes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Añadir Nuevas Imágenes
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-orange-400 transition-all duration-200">
                  <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Arrastra imágenes aquí o haz clic para seleccionar
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    Máximo 5 imágenes en total. Formatos: JPG, PNG, GIF
                  </p>
                  <input 
                    type="file" 
                    multiple 
                    onChange={handleImageChange} 
                    accept="image/*" 
                    className="hidden" 
                    id="image-upload"
                  />
                  <label 
                    htmlFor="image-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Seleccionar Imágenes
                  </label>
                </div>
                
                {/* Vista previa de nuevas imágenes */}
                {imagePreviews.length > 0 && (
                  <div className="mt-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Vista Previa de Nuevas Imágenes
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {imagePreviews.map((src, index) => (
                        <div key={index} className="relative group">
                          <Image 
                            src={src} 
                            alt="Vista previa" 
                            width={200} 
                            height={200} 
                            className="w-full h-32 object-cover rounded-xl border-2 border-gray-200"
                          />
                          <button 
                            type="button" 
                            onClick={() => handleRemoveNewImage(index)} 
                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs transition-all duration-200 opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Botón de guardar */}
            <div className="pt-6 border-t border-gray-200">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Actualizando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Guardar Cambios
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProductPage; 