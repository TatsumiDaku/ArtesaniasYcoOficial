"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/utils/api";
import toast from "react-hot-toast";
import imageUrl from '@/utils/imageUrl';
import Image from 'next/image';
import { CalendarDays } from "lucide-react";

const BlogListPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(3);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [order, setOrder] = useState("recent");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get("/blogs/categories");
        setCategories(data);
      } catch (error) {
        toast.error("No se pudieron cargar las categorías");
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const params = { page, limit, search };
        if (categoryId) params.category_id = categoryId;
        const { data } = await api.get("/blogs", { params });
        if (page === 1) {
          setBlogs(data.blogs);
        } else {
          setBlogs(prev => [...prev, ...data.blogs]);
        }
        setPagination(data.pagination);
      } catch (error) {
        toast.error("No se pudieron cargar los blogs");
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, [page, search, categoryId, limit]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleCategory = (e) => {
    setCategoryId(e.target.value);
    setPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-50 via-pink-50 to-yellow-50 rounded-2xl shadow p-8 mb-10 flex flex-col items-center border border-gray-100 overflow-visible min-h-[unset]">
        <h1 className="text-4xl md:text-5xl font-bold font-pacifico leading-[1.2] pb-6 pt-8 px-2 bg-gradient-to-r from-amber-600 via-orange-500 to-red-600 bg-clip-text text-transparent mb-2 text-center">Blogs y Comunidad</h1>
        <h2 className="text-lg md:text-xl text-gray-600 font-medium mb-2 text-center max-w-2xl">Un espacio donde artesanos comparten experiencias, consejos, tutoriales y recomendaciones. Los clientes y visitantes pueden reaccionar, comentar y aprender juntos.</h2>
        <div className="bg-gradient-to-r from-amber-100 to-pink-100 text-orange-700 rounded-xl px-6 py-3 shadow flex items-center gap-3 font-semibold text-lg mt-2 text-center">
          ¡Bienvenido a la comunidad! Descubre historias, aprende nuevas técnicas y comparte tu opinión.
        </div>
      </section>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-700">Todos los blogs</h1>
        <div className="flex gap-2 flex-wrap items-center">
          <select className="input" value={selectedCategory} onChange={e => { setSelectedCategory(e.target.value); setPage(1); }}>
            <option value="">Todos los tipos</option>
            <option value="tutorial">Tutorial</option>
            <option value="recomendacion">Recomendación</option>
            <option value="historia">Historia</option>
            <option value="ayuda">Ayuda</option>
          </select>
          <button onClick={() => setOrder("recent")} className={`btn btn-ghost ${order === "recent" ? "bg-blue-100 text-blue-700" : ""}`}>Más recientes</button>
          <button onClick={() => setOrder("likes")} className={`btn btn-ghost ${order === "likes" ? "bg-pink-100 text-pink-700" : ""}`}>Más populares</button>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center text-indigo-400 py-8 text-xl font-semibold">No hay blogs para mostrar en este momento.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => {
              // Detectar si el blog es de categoría 'Eventos' (por nombre, insensible a mayúsculas)
              const isEventCategory = blog.categories && blog.categories.some(cat => (cat.name || cat).toLowerCase() === 'eventos');
              const isEvent = (blog.event_start && blog.event_end && blog.event_address) || isEventCategory;
              return (
                <Link key={blog.id} href={`/blog/${blog.id}`}
                  className={`block bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-200 overflow-hidden border relative`}
                >
                  {isEvent && (
                    <div className="absolute left-0 top-0 h-full w-2 md:w-3 lg:w-4 bg-gradient-to-b from-orange-400 via-amber-300 to-yellow-200 z-20"></div>
                  )}
                  {blog.image_url_1 && blog.image_url_1.startsWith('/uploads') ? (
                    <img
                      src={imageUrl(blog.image_url_1)}
                      alt={blog.title}
                      className="w-full h-48 object-contain bg-white rounded-lg"
                      style={{ maxHeight: '192px' }}
                    />
                  ) : (
                    <Image
                      src={blog.image_url_1 ? imageUrl(blog.image_url_1) : '/static/placeholder.png'}
                      alt={blog.title}
                      width={600}
                      height={192}
                      className="w-full h-48 object-contain bg-white rounded-lg"
                      style={{ maxHeight: '192px' }}
                    />
                  )}
                  <div className="p-6">
                    <h2 className={`text-2xl font-bold text-amber-700 font-pacifico mb-2 line-clamp-2 flex items-center gap-2`}>{isEvent && <CalendarDays className="w-5 h-5" />} {blog.title}</h2>
                    <div className="flex items-center gap-2 mb-2">
                      {blog.author_avatar && <Image src={imageUrl(blog.author_avatar)} alt="avatar" width={28} height={28} className="w-7 h-7 rounded-full" unoptimized />}
                      <span className="text-sm font-semibold text-gray-700">{blog.author_name}</span>
                      <span className="text-xs text-gray-400">{new Date(blog.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-2 flex-wrap mb-2">
                      {blog.categories && blog.categories.map((cat, i) => (
                        <span key={i} className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-semibold">{cat}</span>
                      ))}
                    </div>
                    <p className="text-gray-600 line-clamp-3 mb-2">{blog.content}</p>
                    <span className="text-orange-600 font-bold text-sm">Ver más</span>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="flex justify-center mt-8 gap-2">
            <button className="btn btn-ghost" disabled={page === 1} onClick={() => setPage(page - 1)}>Anterior</button>
            <span className="px-4 py-2 rounded text-gray-700 font-semibold">Página {page}</span>
            <button className="btn btn-ghost" disabled={blogs.length < limit} onClick={() => setPage(page + 1)}>Siguiente</button>
          </div>
        </>
      )}
    </div>
  );
};

export default BlogListPage; 