"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { Plus, X, Upload, ArrowLeft, Save } from "lucide-react";
import api from "@/utils/api";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const MAX_BLOCKS = 15;

// Utilidad para formatear fecha a 'YYYY-MM-DD HH:mm:ss'
function toPostgresTimestamp(date) {
  if (!date) return null;
  return date.toISOString().replace('T', ' ').substring(0, 19);
}

export default function EditNewsPage() {
  const router = useRouter();
  const params = useParams();
  const newsId = params.id;
  const [title, setTitle] = useState("");
  const [mainImage, setMainImage] = useState("");
  const [contentBlocks, setContentBlocks] = useState([""]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [references, setReferences] = useState({ artisans: [], products: [], blogs: [] });
  const [preview, setPreview] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [status, setStatus] = useState('active');
  const [error, setError] = useState(null);

  // Simulación de búsqueda de referencias (en real, fetch a la API)
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchType, setSearchType] = useState("artisans");

  const fileInputRef = useRef();
  const [mainImageUrl, setMainImageUrl] = useState("");
  const [mainImageFile, setMainImageFile] = useState(null);

  const [eventStart, setEventStart] = useState(null);
  const [eventEnd, setEventEnd] = useState(null);
  const [eventAddress, setEventAddress] = useState("");
  const [eventError, setEventError] = useState("");

  const isEvent = categories.find(cat => cat.name?.toLowerCase() === 'eventos' && selectedCategories.includes(cat.id));

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

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/news/${newsId}`);
        setTitle(res.data.title || "");
        setMainImage(res.data.main_image || "");
        setContentBlocks(res.data.content_blocks && res.data.content_blocks.length > 0 ? res.data.content_blocks : [""]);
        setReferences({
          artisans: res.data.artisans || [],
          products: res.data.products || [],
          blogs: res.data.blogs || [],
        });
        setEventStart(res.data.event_start ? new Date(res.data.event_start) : null);
        setEventEnd(res.data.event_end ? new Date(res.data.event_end) : null);
        setEventAddress(res.data.event_address || "");
        // Fetch categorías asociadas
        const catRes = await api.get(`/news/${newsId}/categories`);
        setSelectedCategories(catRes.data.map(c => c.id));
      } catch {
        toast.error("No se pudo cargar la noticia");
        router.push("/admin/news");
      } finally {
        setLoading(false);
      }
    };
    if (newsId) fetchNews();
  }, [newsId, router]);

  const handleAddBlock = () => {
    if (contentBlocks.length < MAX_BLOCKS) setContentBlocks([...contentBlocks, ""]);
  };
  const handleRemoveBlock = (idx) => {
    if (contentBlocks.length > 1) setContentBlocks(contentBlocks.filter((_, i) => i !== idx));
  };
  const handleBlockChange = (idx, value) => {
    setContentBlocks(contentBlocks.map((b, i) => (i === idx ? value : b)));
  };

  // Simulación de búsqueda
  const handleSearch = async () => {
    if (!search || search.length < 2) return setSearchResults([]);
    let endpoint = "/users/search";
    if (searchType === "products") endpoint = "/products/search";
    if (searchType === "blogs") endpoint = "/blogs/search";
    try {
      const res = await api.get(`${endpoint}?query=${encodeURIComponent(search)}`);
      setSearchResults(res.data);
    } catch {
      setSearchResults([]);
    }
  };
  const handleAddReference = (item) => {
    setReferences({
      ...references,
      [searchType]: references[searchType].some((r) => r.id === item.id)
        ? references[searchType]
        : [...references[searchType], item],
    });
  };
  const handleRemoveReference = (type, id) => {
    setReferences({
      ...references,
      [type]: references[type].filter((r) => r.id !== id),
    });
  };

  const handleFileChange = (e) => {
    setMainImageFile(e.target.files[0]);
  };

  const handleCategoryChange = (id) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("El título es obligatorio");
    if (contentBlocks.some((b) => !b.trim())) return toast.error("Todos los bloques de texto deben estar llenos");
    if (isEvent) {
      if (!eventStart || !eventEnd) return setEventError("Debes ingresar fecha y hora de inicio y fin del evento");
      if (eventEnd < eventStart) return setEventError("La fecha de fin debe ser igual o posterior a la de inicio");
      if (!eventAddress.trim()) return setEventError("La dirección del evento es obligatoria");
    }
    setEventError("");
    setSaving(true);
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
      } else if (mainImage) {
        formData.append("main_image", mainImage);
      }
      if (isEvent) {
        formData.append("event_start", toPostgresTimestamp(eventStart));
        formData.append("event_end", toPostgresTimestamp(eventEnd));
        formData.append("event_address", eventAddress);
      }
      await api.put(`/news/${newsId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Noticia actualizada correctamente");
      router.push("/admin/news");
    } catch (err) {
      setError("Error al actualizar noticia");
      toast.error("Error al actualizar noticia");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/admin/news" className="btn btn-ghost flex items-center gap-2"><ArrowLeft className="w-5 h-5" />Volver</Link>
        <h1 className="text-2xl font-bold text-gray-800">Editar Noticia</h1>
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
          <label className="block font-semibold mb-2">Referencias</label>
          <div className="flex gap-2 mb-2">
            <select className="input" value={searchType} onChange={e => setSearchType(e.target.value)}>
              <option value="artisans">Artesanos</option>
              <option value="products">Productos</option>
              <option value="blogs">Blogs</option>
            </select>
            <input type="text" className="input flex-1" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
            <button type="button" className="btn btn-ghost" onClick={handleSearch}><SearchIcon /></button>
          </div>
          {searchResults.length > 0 && (
            <div className="bg-gray-50 border rounded-lg p-2 mb-2">
              {searchResults.map(item => (
                <button key={item.id} type="button" className="block w-full text-left py-1 px-2 hover:bg-gray-100 rounded" onClick={() => handleAddReference(searchType === 'blogs' ? { ...item, name: item.title } : item)}>
                  {searchType === 'blogs' ? item.title : item.name}
                </button>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {Object.entries(references).map(([type, items]) => items.map(item => (
              <span key={type + item.id} className="bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 px-3 py-1 rounded-full flex items-center gap-1 text-sm">
                {item.name}
                <button type="button" onClick={() => handleRemoveReference(type, item.id)}><X className="w-3 h-3" /></button>
              </span>
            )))}
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
          <div className="bg-gradient-to-r from-amber-50 to-orange-100 border-l-4 border-orange-400 rounded-xl p-4 mb-4 animate-fade-in">
            <div className="mb-2 font-semibold text-orange-700 flex items-center gap-2">
              <span className="inline-block bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full text-xs font-bold">EVENTO</span>
              <span>Datos del evento</span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Fecha y hora de inicio</label>
                <DatePicker
                  selected={eventStart}
                  onChange={setEventStart}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="Pp"
                  className="input w-full"
                  placeholderText="Selecciona fecha y hora de inicio"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Fecha y hora de fin</label>
                <DatePicker
                  selected={eventEnd}
                  onChange={setEventEnd}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="Pp"
                  className="input w-full"
                  placeholderText="Selecciona fecha y hora de fin"
                  minDate={eventStart}
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block font-semibold mb-1">Dirección del evento</label>
              <input type="text" className="input w-full" value={eventAddress} onChange={e => setEventAddress(e.target.value)} maxLength={255} placeholder="Ej: Centro de Convenciones, Calle 123 #45-67, Ciudad" />
            </div>
            {eventError && <div className="text-red-500 mt-2 font-semibold">{eventError}</div>}
          </div>
        )}
        <div className="flex gap-2 justify-end">
          <button type="button" className="btn btn-ghost" onClick={() => setPreview(!preview)}>{preview ? "Editar" : "Vista previa"}</button>
          <button type="submit" className="btn btn-primary flex items-center gap-2" disabled={saving}><Save className="w-5 h-5" />Guardar Cambios</button>
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
            <div className="mt-4 flex flex-wrap gap-2">
              {Object.entries(references).map(([type, items]) => items.map(item => (
                <span key={type + item.id} className="bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 px-3 py-1 rounded-full text-sm">{item.name}</span>
              )))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SearchIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="11" cy="11" r="8" strokeWidth="2" /><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" /></svg>;
} 