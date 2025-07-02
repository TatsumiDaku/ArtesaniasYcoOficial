"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { RefreshCw, Plus, Edit, Trash2, ThumbsUp, ThumbsDown, MessageCircle, Eye, User, Package, BookOpen } from "lucide-react";
import api from "@/utils/api";
import imageUrl from "@/utils/imageUrl";
import Image from "next/image";

const NewsCard = ({ news, onDelete }) => {
  const [categories, setCategories] = useState([]);
  const [references, setReferences] = useState({ artisans: [], products: [], blogs: [] });
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get(`/news/${news.id}/categories`);
        setCategories(res.data);
      } catch {
        setCategories([]);
      }
    };
    const fetchReferences = async () => {
      try {
        const res = await api.get(`/news/${news.id}`);
        setReferences({
          artisans: res.data.artisans || [],
          products: res.data.products || [],
          blogs: res.data.blogs || [],
        });
      } catch {
        setReferences({ artisans: [], products: [], blogs: [] });
      }
    };
    fetchCategories();
    fetchReferences();
  }, [news.id]);
  const isEvent = news.event_start && news.event_end && news.event_address;
  return (
    <div className={`bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 ${isEvent ? 'border-l-8 border-orange-400' : ''}`}>
      {isEvent && news.main_image && (
        <div className="relative">
          <img src={imageUrl(news.main_image)} alt={news.title} className="w-full h-40 object-cover border-4 border-orange-200" />
          <span className="absolute top-3 left-3 bg-gradient-to-r from-orange-400 to-amber-400 text-white font-bold px-3 py-1 rounded-full shadow text-xs flex items-center gap-1 z-10">
            <RefreshCw className="w-4 h-4" /> Evento
          </span>
        </div>
      )}
      {news.main_image && news.main_image.startsWith('/uploads') ? (
        <img
          src={imageUrl(news.main_image)}
          alt={news.title}
          className="w-full h-40 object-cover border-4 border-orange-200 rounded-lg"
          style={{ maxHeight: '160px' }}
        />
      ) : (
        <Image
          src={news.main_image ? imageUrl(news.main_image) : '/static/placeholder.png'}
          alt={news.title}
          width={400}
          height={160}
          className="w-full h-40 object-cover border-4 border-orange-200 rounded-lg"
          style={{ maxHeight: '160px' }}
        />
      )}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h2 className={`text-lg font-bold line-clamp-2 flex-1 ${isEvent ? 'text-orange-700 flex items-center gap-2' : 'text-gray-800'}`}>{isEvent && <RefreshCw className="w-5 h-5" />} {news.title}</h2>
          <span className="text-xs text-gray-400 whitespace-nowrap">{new Date(news.created_at).toLocaleDateString()}</span>
        </div>
        <div className="flex flex-wrap gap-1 mb-1">
          {categories.map((cat) => (
            <span key={cat.id} className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded text-xs font-semibold">{cat.name}</span>
          ))}
        </div>
        {news.content_blocks && news.content_blocks.length > 0 && (
          <div className="text-gray-600 text-sm mb-2 line-clamp-2">
            {news.content_blocks[0].slice(0, 120)}{news.content_blocks[0].length > 120 ? '...' : ''}
          </div>
        )}
        <div className="flex gap-2 items-center flex-wrap mb-2">
          {references.artisans.length > 0 && (
            <span className="flex items-center gap-1 text-emerald-700 text-xs" title="Artesanos referenciados">
              <User className="w-4 h-4" /> {references.artisans.length}
            </span>
          )}
          {references.products.length > 0 && (
            <span className="flex items-center gap-1 text-blue-700 text-xs" title="Productos referenciados">
              <Package className="w-4 h-4" /> {references.products.length}
            </span>
          )}
          {references.blogs.length > 0 && (
            <span className="flex items-center gap-1 text-pink-700 text-xs" title="Blogs referenciados">
              <BookOpen className="w-4 h-4" /> {references.blogs.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 mb-2">
          <span className="flex items-center gap-1 text-emerald-600 font-semibold"><ThumbsUp className="w-4 h-4" />{news.likes_count || 0}</span>
          <span className="flex items-center gap-1 text-rose-500 font-semibold"><ThumbsDown className="w-4 h-4" />{news.dislikes_count || 0}</span>
          <span className="flex items-center gap-1 text-gray-500"><MessageCircle className="w-4 h-4" />{news.comments_count || 0}</span>
        </div>
        <div className="mt-auto flex gap-2 justify-end">
          <Link href={`/admin/news/${news.id}/edit`} className="btn btn-ghost btn-sm flex items-center gap-1"><Edit className="w-4 h-4" />Editar</Link>
          <button onClick={() => onDelete(news.id)} className="btn btn-ghost btn-sm text-red-600 flex items-center gap-1"><Trash2 className="w-4 h-4" />Eliminar</button>
          <Link href={`/news/${news.id}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white hover:bg-rose-100 text-rose-500 border border-rose-200 transition" title="Ver noticia pública">
            <Eye className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function AdminNewsPage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = "/news?order=recent&limit=24";
      if (selectedCategory) url += `&category=${selectedCategory}`;
      const res = await api.get(url);
      setNews(res.data);
    } catch (err) {
      setError("Error al cargar noticias");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [selectedCategory]);

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

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta noticia?")) return;
    try {
      await api.delete(`/news/${id}`);
      toast.success("Noticia eliminada");
      setNews(news.filter((n) => n.id !== id));
    } catch {
      toast.error("No se pudo eliminar la noticia");
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNews();
    setRefreshing(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Noticias</h1>
        <div className="flex gap-2 flex-wrap items-center">
          <select className="input" value={selectedCategory} onChange={e => { setSelectedCategory(e.target.value); }}>
            <option value="">Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <Link href="/admin/news/new" className="btn btn-primary flex items-center gap-2"><Plus className="w-5 h-5" />Crear Noticia</Link>
          <button onClick={handleRefresh} className="btn btn-ghost flex items-center gap-2" disabled={refreshing}>
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} /> Refrescar
          </button>
          <button onClick={() => setShowCategoriesModal(true)} className="btn btn-ghost flex items-center gap-2">Gestionar categorías</button>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-8">{error}</div>
      ) : news.length === 0 ? (
        <div className="text-center text-gray-500 py-8">No hay noticias registradas.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((n) => (
            <NewsCard key={n.id} news={n} onDelete={handleDelete} />
          ))}
        </div>
      )}
      {showCategoriesModal && <CategoriesModal onClose={() => setShowCategoriesModal(false)} />}
    </div>
  );
}

// Modal de gestión de categorías
function CategoriesModal({ onClose }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editing, setEditing] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get("/news/categories");
      setCategories(res.data);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSave = async () => {
    if (!name.trim()) return toast.error("El nombre es obligatorio");
    try {
      if (editing) {
        await api.put(`/news/categories/${editing.id}`, { name, description });
        toast.success("Categoría actualizada");
      } else {
        await api.post("/news/categories", { name, description });
        toast.success("Categoría creada");
      }
      setName("");
      setDescription("");
      setEditing(null);
      fetchCategories();
    } catch {
      toast.error("Error al guardar categoría");
    }
  };
  const handleEdit = (cat) => {
    setEditing(cat);
    setName(cat.name);
    setDescription(cat.description || "");
  };
  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar esta categoría?")) return;
    try {
      await api.delete(`/news/categories/${id}`);
      toast.success("Categoría eliminada");
      fetchCategories();
    } catch {
      toast.error("No se pudo eliminar la categoría");
    }
  };
  const handleCancel = () => {
    setEditing(null);
    setName("");
    setDescription("");
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-4 right-4 btn btn-ghost">✕</button>
        <h2 className="text-xl font-bold mb-4">Categorías de Noticias</h2>
        <div className="mb-4">
          <input type="text" className="input w-full mb-2" placeholder="Nombre" value={name} onChange={e => setName(e.target.value)} />
          <textarea className="input w-full" placeholder="Descripción" value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        <div className="flex gap-2 mb-4">
          <button onClick={handleSave} className="btn btn-primary">{editing ? "Actualizar" : "Crear"}</button>
          {editing && <button onClick={handleCancel} className="btn btn-ghost">Cancelar</button>}
        </div>
        <div className="max-h-64 overflow-y-auto">
          {loading ? <div className="text-center py-8">Cargando...</div> : categories.length === 0 ? <div className="text-center text-gray-500 py-8">No hay categorías.</div> : (
            <ul className="divide-y">
              {categories.map(cat => (
                <li key={cat.id} className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-semibold">{cat.name}</div>
                    {cat.description && <div className="text-xs text-gray-500">{cat.description}</div>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(cat)} className="btn btn-ghost btn-xs">Editar</button>
                    <button onClick={() => handleDelete(cat.id)} className="btn btn-ghost btn-xs text-red-500">Eliminar</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
} 