"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { Plus, X, Upload, ArrowLeft, Save } from "lucide-react";
import api from "@/utils/api";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { motion } from "framer-motion";
import Image from "next/image";

const MAX_BLOCKS = 15;

// Utilidad para formatear fecha a 'YYYY-MM-DD HH:mm:ss'
function toPostgresTimestamp(date) {
  if (!date) return null;
  return date.toISOString().replace('T', ' ').substring(0, 19);
}

export default function CreateNewsPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [mainImage, setMainImage] = useState("");
  const [contentBlocks, setContentBlocks] = useState([""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [status, setStatus] = useState('active');

  const fileInputRef = useRef();
  const [mainImageUrl, setMainImageUrl] = useState("");
  const [mainImageFile, setMainImageFile] = useState(null);

  const [eventStart, setEventStart] = useState(null);
  const [eventEnd, setEventEnd] = useState(null);
  const [eventAddress, setEventAddress] = useState("");
  const [eventError, setEventError] = useState("");

  const handleAddBlock = () => {
    if (contentBlocks.length < MAX_BLOCKS) setContentBlocks([...contentBlocks, ""]);
  };
  const handleRemoveBlock = (idx) => {
    if (contentBlocks.length > 1) setContentBlocks(contentBlocks.filter((_, i) => i !== idx));
  };
  const handleBlockChange = (idx, value) => {
    setContentBlocks(contentBlocks.map((b, i) => (i === idx ? value : b)));
  };

  // Fetch categorías de noticias
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/news/categories");
        setCategories(res.data);
      } catch {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryChange = (id) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const isEvent = categories.find(cat => cat.name?.toLowerCase() === 'eventos' && selectedCategories.includes(cat.id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("El título es obligatorio");
    if (contentBlocks.some((b) => !b.trim())) return toast.error("Todos los bloques de texto deben estar llenos");
    if (isEvent) {
      if (!eventStart || !eventEnd) {
        setEventError("Debes ingresar fecha y hora de inicio y fin del evento");
        toast.error("Debes ingresar fecha y hora de inicio y fin del evento");
        document.getElementById('event-fields')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      if (eventEnd < eventStart) {
        setEventError("La fecha de fin debe ser igual o posterior a la de inicio");
        toast.error("La fecha de fin debe ser igual o posterior a la de inicio");
        document.getElementById('event-fields')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      if (!eventAddress.trim()) {
        setEventError("La dirección del evento es obligatoria");
        toast.error("La dirección del evento es obligatoria");
        document.getElementById('event-fields')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
    }
    setEventError("");
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content_blocks", JSON.stringify(contentBlocks));
      formData.append("status", status);
      selectedCategories.forEach((catId) => formData.append("categories[]", catId));
      if (mainImageFile) {
        formData.append("main_image", mainImageFile);
      } else if (mainImageUrl) {
        formData.append("main_image", mainImageUrl);
      }
      if (isEvent) {
        // Validar y convertir fechas solo si son strings válidos
        const validStart = typeof eventStart === 'string' && eventStart.length > 0;
        const validEnd = typeof eventEnd === 'string' && eventEnd.length > 0;
        formData.append("event_start", validStart ? toPostgresTimestamp(new Date(eventStart)) : "");
        formData.append("event_end", validEnd ? toPostgresTimestamp(new Date(eventEnd)) : "");
        formData.append("event_address", eventAddress);
      }
      await api.post("/news", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Noticia creada correctamente");
      router.push("/admin/news");
    } catch (err) {
      setError(err?.response?.data?.message || "Error al crear noticia");
      toast.error(err?.response?.data?.message || "Error al crear noticia");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setMainImageFile(e.target.files[0]);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/admin/news" className="btn btn-ghost flex items-center gap-2"><ArrowLeft className="w-5 h-5" />Volver</Link>
        <h1 className="text-2xl font-bold text-gray-800">Crear Noticia</h1>
      </div>
      {error && <div className="text-red-500 text-center mb-4">{error}</div>}
      <form onSubmit={handleSubmit} encType="multipart/form-data" className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-6">
        <div>
          <label className="block font-semibold mb-2">Título</label>
          <input type="text" className="input w-full" value={title} onChange={e => setTitle(e.target.value)} required maxLength={255} />
        </div>
        <div>
          <label className="block font-semibold mb-1">Imagen principal</label>
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="input" />
          <div className="text-xs text-gray-500 mt-1">O pega una URL de imagen:</div>
          <input type="text" value={mainImageUrl} onChange={e => setMainImageUrl(e.target.value)} placeholder="https://..." className="input mt-1" />
        </div>
        <div>
          <label className="block font-semibold mb-2">Contenido (máx. 15 bloques)</label>
          <div className="space-y-3">
            {contentBlocks.map((block, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <textarea className="input w-full min-h-[60px]" value={block} onChange={e => handleBlockChange(idx, e.target.value)} required maxLength={1000} />
                {contentBlocks.length > 1 && (
                  <button type="button" className="btn btn-ghost text-red-500" onClick={() => handleRemoveBlock(idx)}><X className="w-4 h-4" /></button>
                )}
              </div>
            ))}
            {contentBlocks.length < MAX_BLOCKS && (
              <button type="button" className="btn btn-ghost flex items-center gap-1" onClick={handleAddBlock}><Plus className="w-4 h-4" />Agregar bloque</button>
            )}
          </div>
        </div>
        <div>
          <label className="block font-semibold mb-2">Categorías</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {categories.map((cat) => (
              <label key={cat.id} className={`px-3 py-1 rounded-full border cursor-pointer flex items-center gap-2 ${selectedCategories.includes(cat.id) ? 'bg-pink-100 border-pink-400 text-pink-700' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                <input
                  type="checkbox"
                  className="accent-pink-500"
                  checked={selectedCategories.includes(cat.id)}
                  onChange={() => handleCategoryChange(cat.id)}
                />
                {cat.name}
              </label>
            ))}
          </div>
        </div>
        {isEvent && (
          <motion.div
            key="event-fields"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-orange-50 border-l-4 border-orange-400 rounded-xl p-4 mb-4 flex flex-col gap-4"
            id="event-fields"
          >
            <div className="mb-2 font-semibold text-orange-700 flex items-center gap-2">
              <span className="inline-block bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full text-xs font-bold">EVENTO</span>
              <span>Datos del evento</span>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">Fecha y hora de inicio</label>
                <input type="datetime-local" value={eventStart || ''} onChange={e => setEventStart(e.target.value)} className="w-full px-4 py-2 rounded-xl border-2 border-orange-200 focus:ring-2 focus:ring-orange-400" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">Fecha y hora de fin</label>
                <input type="datetime-local" value={eventEnd || ''} onChange={e => setEventEnd(e.target.value)} className="w-full px-4 py-2 rounded-xl border-2 border-orange-200 focus:ring-2 focus:ring-orange-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">Dirección del evento</label>
              <input type="text" value={eventAddress} onChange={e => setEventAddress(e.target.value)} className="w-full px-4 py-2 rounded-xl border-2 border-orange-200 focus:ring-2 focus:ring-orange-400" placeholder="Ej: Plaza principal, Bogotá" />
            </div>
            {eventError && <div className="text-red-500 mt-2 font-semibold">{eventError}</div>}
          </motion.div>
        )}
        <div className="flex gap-2 justify-end">
          <button type="button" className="btn btn-ghost" onClick={() => setPreview(!preview)}>{preview ? "Editar" : "Vista previa"}</button>
          <button type="submit" className="btn btn-primary flex items-center gap-2" disabled={loading}><Save className="w-5 h-5" />Guardar Noticia</button>
        </div>
      </form>
      {preview && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-2">Vista previa</h2>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            {mainImage && <img src={mainImage} alt="preview" className="w-full max-h-64 object-cover rounded-xl mb-4" />}
            <h3 className="text-2xl font-bold mb-2">{title}</h3>
            {contentBlocks.map((block, idx) => (
              <p key={idx} className="mb-3 text-gray-700 whitespace-pre-line">{block}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SearchIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="11" cy="11" r="8" strokeWidth="2" /><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" /></svg>;
} 