"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import api from "@/utils/api";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, ArrowLeft, Loader2, Upload, XCircle } from "lucide-react";

const MAX_IMAGES = 2;

const NewBlogPage = () => {
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm();
  const [categories, setCategories] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const router = useRouter();
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Fetch categorías de blog
  useEffect(() => {
    api.get("/blogs/categories").then(res => {
      // Soporta ambos formatos: { categories: [...] } o array directo
      const cats = res.data.categories || res.data || [];
      setCategories(cats);
    }).catch(() => {
      toast.error("No se pudieron cargar las categorías de blog.");
    });
  }, []);

  // Previsualización de imágenes
  const images = watch("images");
  useEffect(() => {
    if (images && images.length > 0) {
      const files = Array.from(images).slice(0, MAX_IMAGES);
      setImagePreviews(files.map(file => URL.createObjectURL(file)));
      return () => files.forEach(url => URL.revokeObjectURL(url));
    } else {
      setImagePreviews([]);
    }
  }, [images]);

  const onSubmit = async (data) => {
    if (!data.categories || data.categories.length === 0) {
      toast.error("Selecciona al menos una categoría.");
      return;
    }
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("content", data.content);
    data.categories.forEach(cat => formData.append("categories[]", cat));
    if (data.images && data.images.length > 0) {
      if (data.images[0]) formData.append("image_url_1", data.images[0]);
      if (data.images[1]) formData.append("image_url_2", data.images[1]);
    }
    try {
      await api.post("/blogs", formData, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Blog creado y enviado para revisión.");
      router.push("/artisan/blog");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al crear el blog.");
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link href="/artisan/blog" className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 rounded-xl shadow border border-gray-200 text-gray-700 font-medium hover:bg-white">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-orange-500" />
            <h1 className="text-2xl font-bold text-orange-700">Nuevo Blog</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Título</label>
            <input type="text" maxLength={100} {...register("title", { required: "El título es obligatorio", maxLength: { value: 100, message: "Máx 100 caracteres" } })} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-orange-500" />
            {errors.title && <span className="text-red-500 text-xs mt-1">{errors.title.message}</span>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Contenido</label>
            <textarea maxLength={1500} rows={7} {...register("content", { required: "El contenido es obligatorio", maxLength: { value: 1500, message: "Máx 1500 caracteres" } })} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-orange-500" />
            <div className="text-xs text-gray-400 text-right">{watch("content")?.length || 0}/1500</div>
            {errors.content && <span className="text-red-500 text-xs mt-1">{errors.content.message}</span>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Imágenes (máx 2)</label>
            <input type="file" accept="image/*" multiple {...register("images", { validate: files => (!files || files.length <= MAX_IMAGES) || "Máx 2 imágenes" })} className="w-full px-4 py-2 rounded-xl border-2 border-gray-200" />
            {errors.images && <span className="text-red-500 text-xs mt-1">{errors.images.message}</span>}
            <div className="flex gap-4 mt-2">
              {imagePreviews.map((src, i) => (
                <div key={i} className="relative w-24 h-24">
                  <Image src={src} alt={`Preview ${i+1}`} fill className="object-cover rounded-xl border" />
                  <span className="absolute top-1 right-1 bg-white/80 rounded-full p-1 cursor-pointer" onClick={() => {
                    const dt = new DataTransfer();
                    Array.from(images).forEach((file, idx) => { if (idx !== i) dt.items.add(file); });
                    setValue("images", dt.files, { shouldValidate: true });
                  }}><XCircle className="w-5 h-5 text-red-500" /></span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Categorías</label>
            <div className="flex flex-col gap-2">
              {(showAllCategories ? categories : categories.slice(0, 3)).map(cat => (
                <label key={cat.id} className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2 cursor-pointer">
                  <input
                    type="checkbox"
                    value={cat.id}
                    {...register("categories", {
                      validate: (selected = []) => (Array.isArray(selected) ? selected.length <= 2 : true) || "Máximo 2 categorías",
                    })}
                    onChange={e => {
                      const selected = Array.from(document.querySelectorAll('input[name=\"categories\"]:checked')).map(i => i.value);
                      if (selected.length > 2) {
                        e.preventDefault();
                        return false;
                      }
                    }}
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
            {errors.categories && <span className="text-red-500 text-xs mt-1">{errors.categories.message || "Selecciona hasta 2 categorías."}</span>}
            <button type="button" onClick={() => setShowCategoryModal(true)} className="mt-3 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-400 to-yellow-400 text-white font-bold shadow hover:scale-105 transition-all">+ Nueva Categoría</button>
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2">
            {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />} Publicar Blog
          </button>
        </form>
      </div>
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

export default NewBlogPage; 