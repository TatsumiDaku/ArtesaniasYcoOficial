"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/utils/api";
import toast from "react-hot-toast";
import { BookOpen, ArrowLeft, Loader2, Upload, XCircle } from "lucide-react";
import { getImageUrl } from '@/utils/imageUrl';

const EditBlogPage = () => {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    categories: [],
  });
  const [categories, setCategories] = useState([]);
  const [existingImages, setExistingImages] = useState({ image_url_1: null, image_url_2: null });
  const [newImages, setNewImages] = useState({ image_url_1: null, image_url_2: null });
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showAllCategories, setShowAllCategories] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [blogRes, categoriesRes] = await Promise.all([
          api.get(`/blogs/${id}`),
          api.get("/blogs/categories"),
        ]);
        const blog = blogRes.data;
        setFormData({
          title: blog.title || "",
          content: blog.content || "",
          categories: blog.categories ? blog.categories.map(cat => String(cat.id)) : [],
        });
        // Soporta ambos formatos: { categories: [...] } o array directo
        const cats = categoriesRes.data.categories || categoriesRes.data || [];
        setCategories(cats);
        // Construir URLs absolutas para imágenes
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const base = apiUrl.replace('/api', '');
        setExistingImages({
          image_url_1: blog.image_url_1 ? (blog.image_url_1.startsWith('http') ? blog.image_url_1 : `${base}${blog.image_url_1}`) : null,
          image_url_2: blog.image_url_2 ? (blog.image_url_2.startsWith('http') ? blog.image_url_2 : `${base}${blog.image_url_2}`) : null,
        });
      } catch (error) {
        const status = error.response?.status;
        const msg = error.response?.data?.message || error.message || 'Error desconocido';
        toast.error(`Error ${status ? status + ': ' : ''}${msg}`);
        router.push("/artisan/blog");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, router]);

  const handleChange = (e) => {
    const { name, value, type, selectedOptions } = e.target;
    if (type === "select-multiple") {
      setFormData({
        ...formData,
        [name]: Array.from(selectedOptions, (option) => option.value),
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageChange = (e) => {
    const { name, files } = e.target;
    setNewImages({ ...newImages, [name]: files[0] });
  };

  const handleRemoveExistingImage = (key) => {
    setExistingImages({ ...existingImages, [key]: null });
  };

  const handleCategoryChange = (catId) => {
    let selected = formData.categories.includes(catId)
      ? formData.categories.filter((id) => id !== catId)
      : [...formData.categories, catId];
    if (selected.length > 2) return;
    setFormData({ ...formData, categories: selected });
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return toast.error("El nombre es obligatorio");
    try {
      const res = await api.post("/blogs/categories", { name: newCategoryName });
      setCategories([...categories, res.data.category]);
      setShowCategoryModal(false);
      setNewCategoryName("");
      toast.success("Categoría creada");
    } catch {
      toast.error("Error al crear la categoría");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    data.append("title", formData.title);
    data.append("content", formData.content);
    formData.categories.forEach((catId) => data.append("categories[]", catId));
    // Imágenes
    if (newImages.image_url_1) data.append("image_url_1", newImages.image_url_1);
    if (newImages.image_url_2) data.append("image_url_2", newImages.image_url_2);
    // Si no hay nueva imagen y existe la anterior, mantenerla
    if (!newImages.image_url_1 && existingImages.image_url_1) data.append("image_url_1", existingImages.image_url_1);
    if (!newImages.image_url_2 && existingImages.image_url_2) data.append("image_url_2", existingImages.image_url_2);
    try {
      await api.put(`/blogs/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Blog actualizado correctamente.");
      router.push("/artisan/blog");
    } catch (error) {
      toast.error("Error al actualizar el blog.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este blog? Esta acción no se puede deshacer.")) return;
    setLoading(true);
    try {
      await api.delete(`/blogs/${id}`);
      toast.success("Blog eliminado correctamente.");
      router.push("/artisan/blog");
    } catch (error) {
      toast.error("Error al eliminar el blog.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Cargando...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-8">
      <button
        type="button"
        className="mb-6 px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold shadow"
        onClick={() => router.back()}
      >
        Volver atrás
      </button>
      <h1 className="text-2xl font-bold mb-6">Editar Blog</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold mb-2">Título</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-4 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">Contenido</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            rows={6}
            className="w-full border rounded-lg px-4 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">Categorías</label>
          <div className="flex flex-col gap-2">
            {(showAllCategories ? categories : categories.slice(0, 3)).map((cat) => (
              <label key={cat.id} className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.categories.includes(String(cat.id))}
                  onChange={() => handleCategoryChange(String(cat.id))}
                  disabled={
                    !formData.categories.includes(String(cat.id)) && formData.categories.length >= 2
                  }
                />
                <span className="text-orange-700 font-medium">{cat.name}</span>
              </label>
            ))}
            {categories.length > 3 && (
              <button type="button" onClick={() => setShowAllCategories(v => !v)} className="text-orange-600 font-semibold mt-2 hover:underline">
                {showAllCategories ? 'Ver menos' : 'Ver más'}
              </button>
            )}
          </div>
          {formData.categories.length === 0 && <span className="text-red-500 text-xs mt-1">Selecciona al menos una categoría.</span>}
          {formData.categories.length > 2 && <span className="text-red-500 text-xs mt-1">Máximo 2 categorías.</span>}
          <button type="button" onClick={() => setShowCategoryModal(true)} className="mt-3 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-400 to-yellow-400 text-white font-bold shadow hover:scale-105 transition-all">+ Nueva Categoría</button>
        </div>
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Imagen 1</label>
            {existingImages.image_url_1 && (
              <div className="mb-2 flex items-center gap-2">
                <img src={getImageUrl(existingImages.image_url_1)} alt="Imagen 1" className="h-24 rounded" />
                <button
                  type="button"
                  onClick={() => handleRemoveExistingImage("image_url_1")}
                  className="mt-2 px-3 py-1 rounded-lg bg-red-100 text-red-600 font-semibold text-xs hover:bg-red-200 transition flex items-center gap-1"
                >
                  <XCircle className="inline w-4 h-4" /> Quitar imagen
                </button>
              </div>
            )}
            <input type="file" name="image_url_1" accept="image/*" onChange={handleImageChange} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Imagen 2</label>
            {existingImages.image_url_2 && (
              <div className="mb-2 flex items-center gap-2">
                <img src={getImageUrl(existingImages.image_url_2)} alt="Imagen 2" className="h-24 rounded" />
                <button
                  type="button"
                  onClick={() => handleRemoveExistingImage("image_url_2")}
                  className="mt-2 px-3 py-1 rounded-lg bg-red-100 text-red-600 font-semibold text-xs hover:bg-red-200 transition flex items-center gap-1"
                >
                  <XCircle className="inline w-4 h-4" /> Quitar imagen
                </button>
              </div>
            )}
            <input type="file" name="image_url_2" accept="image/*" onChange={handleImageChange} />
          </div>
        </div>
        <div className="flex gap-4 mt-8">
          <button
            type="submit"
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-2 rounded-lg shadow"
            disabled={loading}
          >
            Guardar Cambios
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-lg shadow"
            disabled={loading}
          >
            Eliminar Blog
          </button>
        </div>
      </form>
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-xl w-full max-w-sm">
            <h2 className="text-lg font-bold mb-4 text-orange-700">Crear nueva categoría</h2>
            <input type="text" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="w-full px-4 py-2 border rounded-xl mb-4" placeholder="Nombre de la categoría" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowCategoryModal(false)} className="px-4 py-2 rounded bg-gray-200">Cancelar</button>
              <button onClick={handleCreateCategory} className="px-4 py-2 rounded bg-orange-500 text-white font-bold">Crear</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditBlogPage; 