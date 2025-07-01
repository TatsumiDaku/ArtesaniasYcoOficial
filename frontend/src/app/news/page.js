"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ThumbsUp, ThumbsDown, Calendar, ArrowRight, User, Package, BookOpen, MessageCircle } from "lucide-react";
import api from "@/utils/api";
import imageUrl from "@/utils/imageUrl";

const PAGE_SIZE = 12;

function NewsCard({ news }) {
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
    <div className={`bg-white/30 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 ${isEvent ? 'border-l-8 border-orange-400' : ''}`}>
      {isEvent && news.main_image && (
        <div className="relative">
          <img src={imageUrl(news.main_image)} alt={news.title} className="w-full h-40 object-contain bg-white border border-orange-300 rounded-lg" />
          <span className="absolute top-3 left-3 bg-gradient-to-r from-orange-400 to-amber-400 text-white font-bold px-3 py-1 rounded-full shadow text-xs flex items-center gap-1 z-10">
            <Calendar className="w-4 h-4" /> Evento
          </span>
        </div>
      )}
      {!isEvent && news.main_image && (
        <img src={imageUrl(news.main_image)} alt={news.title} className="w-full h-40 object-contain bg-white border border-gray-300 rounded-lg" />
      )}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h2 className={`text-lg font-bold text-amber-700 font-pacifico line-clamp-2 flex-1 ${isEvent ? 'flex items-center gap-2' : ''}`}>{isEvent && <Calendar className="w-5 h-5" />} {news.title}</h2>
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
          <Link href={`/news/${news.id}`} className="btn btn-rose btn-sm flex items-center gap-1">Ver detalle</Link>
        </div>
      </div>
    </div>
  );
}

export default function NewsListPage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState("recent");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const fetchNews = async () => {
    setLoading(true);
    try {
      let url = `/news?order=${order}&limit=${PAGE_SIZE}&page=${page}`;
      if (selectedCategory) url += `&category=${selectedCategory}`;
      const res = await api.get(url);
      setNews(res.data);
      setTotal(res.data.length < PAGE_SIZE && page === 1 ? res.data.length : 1000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    // eslint-disable-next-line
  }, [order, page, selectedCategory]);

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

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-50 via-pink-50 to-yellow-50 rounded-2xl shadow p-8 mb-10 flex flex-col items-center border border-gray-100">
        <h1 className="text-4xl md:text-5xl font-bold font-pacifico text-indigo-600 mb-2 text-center">Noticias interesantes</h1>
        <h2 className="text-lg md:text-xl text-gray-600 font-medium mb-2 text-center max-w-2xl">Explora novedades, eventos y curiosidades del mundo artesanal y cultural. Aquí solo mostramos noticias seleccionadas para inspirarte y mantenerte informado.</h2>
      </section>
      <h1 className="text-4xl font-bold font-pacifico leading-[1.5] pb-4 bg-gradient-to-r from-amber-600 via-orange-500 to-red-600 bg-clip-text text-transparent mb-8">Noticias.</h1>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-700">Todas las noticias</h1>
        <div className="flex gap-2 flex-wrap items-center">
          <select className="input" value={selectedCategory} onChange={e => { setSelectedCategory(e.target.value); setPage(1); }}>
            <option value="">Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <button onClick={() => setOrder("recent")} className={`btn btn-ghost ${order === "recent" ? "bg-blue-100 text-blue-700" : ""}`}>Más recientes</button>
          <button onClick={() => setOrder("likes")} className={`btn btn-ghost ${order === "likes" ? "bg-pink-100 text-pink-700" : ""}`}>Más likeadas</button>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
        </div>
      ) : news.length === 0 ? (
        <div className="text-center text-indigo-400 py-8 text-xl font-semibold">No hay noticias para mostrar en este momento.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.map((n) => (
              <NewsCard key={n.id} news={n} />
            ))}
          </div>
          <div className="flex justify-center mt-8 gap-2">
            <button className="btn btn-ghost" disabled={page === 1} onClick={() => setPage(page - 1)}>Anterior</button>
            <span className="px-4 py-2 rounded text-gray-700 font-semibold">Página {page}</span>
            <button className="btn btn-ghost" disabled={news.length < PAGE_SIZE} onClick={() => setPage(page + 1)}>Siguiente</button>
          </div>
        </>
      )}
    </div>
  );
} 