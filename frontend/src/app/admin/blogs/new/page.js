"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import api from "@/utils/api";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, ArrowLeft, Loader2, XCircle, CalendarDays, MapPin } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const MAX_IMAGES = 2;

const AdminNewBlogPage = () => {
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm();
  const [categories, setCategories] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const router = useRouter();
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isEvent, setIsEvent] = useState(false);
  const [eventStart, setEventStart] = useState("");
  const [eventEnd, setEventEnd] = useState("");
  const [eventAddress, setEventAddress] = useState("");

  useEffect(() => {
    api.get("/blogs/categories").then(res => {
      const cats = res.data.categories || res.data || [];
      setCategories(cats);
    }).catch(() => {
      toast.error("No se pudieron cargar las categorías de blog.");
    });
  }, []);

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

  useEffect(() => {
    const selectedCats = watch("categories") || [];
    const eventosCat = categories.find(cat => cat.name?.toLowerCase() === "eventos");
    setIsEvent(eventosCat && selectedCats.includes(eventosCat.id.toString()));
  }, [watch("categories"), categories]);

  const onSubmit = async (data) => {
    if (!data.categories || data.categories.length === 0) {
      toast.error("Selecciona al menos una categoría.");
      return;
    }
    if (isEvent) {
      if (!eventStart || !eventEnd || !eventAddress) {
        toast.error("Completa todos los campos del evento.");
        return;
      }
    }
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("content", data.content);
    data.categories.forEach(cat => formData.append("categories[]", cat));
    if (data.images && data.images.length > 0) {
      if (data.images[0]) formData.append("image_url_1", data.images[0]);
      if (data.images[1]) formData.append("image_url_2", data.images[1]);
    }
    if (isEvent) {
      formData.append("event_start", eventStart);
      formData.append("event_end", eventEnd);
      formData.append("event_address", eventAddress);
    }
    try {
      await api.post("/blogs", formData, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Blog de administrador creado y enviado para revisión.");
      router.push("/admin/blogs");
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link href="/admin/blogs" className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 rounded-xl shadow border border-gray-200 text-gray-700 font-medium hover:bg-white">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-amber-500" />
            <h1 className="text-2xl font-bold text-amber-700">Nuevo Blog de Administrador</h1>
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Título</label>
            <input type="text" maxLength={100} {...register("title", { required: "El título es obligatorio", maxLength: { value: 100, message: "Máx 100 caracteres" } })} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-amber-500" />
            {errors.title && <span className="text-red-500 text-xs mt-1">{errors.title.message}</span>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Contenido</label>
            <textarea maxLength={1500} rows={7} {...register("content", { required: "El contenido es obligatorio", maxLength: { value: 1500, message: "Máx 1500 caracteres" } })} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-amber-500" />
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
            <div className="flex flex-wrap gap-2 mb-2">
              {categories.map(cat => {
                const selected = (watch("categories") || []).includes(cat.id.toString());
                const isDisabled = !selected && (watch("categories")?.length || 0) >= 2;
                return (
                  <motion.button
                    key={cat.id}
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: !isDisabled ? 1.08 : 1, boxShadow: !isDisabled ? "0 0 0 4px #fbbf24" : undefined }}
                    className={`px-4 py-2 rounded-full border-2 transition-all duration-200 font-semibold text-sm flex items-center gap-2 select-none
                      ${selected ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white border-amber-400 shadow-lg scale-105' : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'}
                      ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    onClick={() => {
                      if (isDisabled) return;
                      const current = watch("categories") || [];
                      if (selected) {
                        setValue("categories", current.filter(id => id !== cat.id.toString()), { shouldValidate: true });
                      } else {
                        setValue("categories", [...current, cat.id.toString()], { shouldValidate: true });
                      }
                    }}
                  >
                    {cat.name}
                    {selected && <span className="ml-1 text-xs">✓</span>}
                  </motion.button>
                );
              })}
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.08, boxShadow: "0 0 0 4px #fbbf24" }}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-white font-bold shadow hover:scale-105 transition-all border-2 border-amber-300"
                onClick={() => setShowCategoryModal(true)}
              >
                + Nueva Categoría
              </motion.button>
            </div>
            <AnimatePresence>
              {errors.categories && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-red-500 text-xs mt-1">
                  {errors.categories.message || "Selecciona hasta 2 categorías."}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* Campos de evento si la categoría es Eventos */}
          <AnimatePresence>
            {isEvent && (
              <motion.div
                key="event-fields"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-amber-50 border-l-4 border-amber-400 rounded-xl p-4 mb-4 flex flex-col gap-4"
              >
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1"><CalendarDays className="w-4 h-4" />Fecha y hora de inicio</label>
                    <input type="datetime-local" value={eventStart} onChange={e => setEventStart(e.target.value)} className="w-full px-4 py-2 rounded-xl border-2 border-amber-200 focus:ring-2 focus:ring-amber-400" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1"><CalendarDays className="w-4 h-4" />Fecha y hora de fin</label>
                    <input type="datetime-local" value={eventEnd} onChange={e => setEventEnd(e.target.value)} className="w-full px-4 py-2 rounded-xl border-2 border-amber-200 focus:ring-2 focus:ring-amber-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1"><MapPin className="w-4 h-4" />Dirección del evento</label>
                  <input type="text" value={eventAddress} onChange={e => setEventAddress(e.target.value)} className="w-full px-4 py-2 rounded-xl border-2 border-amber-200 focus:ring-2 focus:ring-amber-400" placeholder="Ej: Plaza principal, Bogotá" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <button type="submit" disabled={isSubmitting} className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2">
            {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />} Publicar Blog
          </button>
        </form>
        <AnimatePresence>
          {showCategoryModal && (
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            >
              <div className="bg-white rounded-xl p-6 shadow-xl w-full max-w-sm animate-fade-in">
                <h2 className="text-lg font-bold mb-4 text-amber-700">Crear nueva categoría</h2>
                <input type="text" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="w-full px-4 py-2 border rounded-xl mb-4" placeholder="Nombre de la categoría" />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setShowCategoryModal(false)} className="px-4 py-2 rounded bg-gray-200">Cancelar</button>
                  <button onClick={handleCreateCategory} className="px-4 py-2 rounded bg-amber-500 text-white font-bold">Crear</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminNewBlogPage; 