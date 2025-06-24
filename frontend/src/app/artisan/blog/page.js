"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, PlusCircle, Edit, Trash2, Loader2, AlertTriangle, RefreshCw, Search } from "lucide-react";
import api from "@/utils/api";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { getImageUrl } from '@/utils/imageUrl';

const ArtisanBlogPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (categoryFilter) params.category_id = categoryFilter;
      const res = await api.get("/blogs/mine", { params });
      setBlogs(res.data.blogs || []);
    } catch (error) {
      toast.error("No se pudieron cargar tus blogs.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/blogs/categories");
      const cats = res.data.categories || res.data || [];
      setCategories(cats);
    } catch {
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBlogs();
    // eslint-disable-next-line
  }, [search, categoryFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este blog?")) return;
    try {
      await api.delete(`/blogs/${id}`);
      toast.success("Blog eliminado.");
      fetchBlogs();
    } catch (error) {
      toast.error("Error al eliminar el blog.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-8 text-white shadow-2xl flex items-center gap-4 flex-1">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
              <BookOpen className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Mis Blogs</h1>
              <p className="text-yellow-100 text-lg">Gestiona tus publicaciones artesanales</p>
            </div>
          </div>
          <Link href="/artisan/blog/new">
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold shadow-lg hover:scale-105 transition-all">
              <PlusCircle className="w-5 h-5" /> Nuevo Blog
            </button>
          </Link>
        </div>

        {/* Filtros y búsqueda */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div className="flex items-center gap-2 flex-1">
            <input
              type="text"
              placeholder="Buscar por título..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full md:w-64 px-4 py-2 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-orange-500"
            />
            <Search className="w-5 h-5 text-gray-400 -ml-8" />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Todas las categorías</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <button onClick={() => { setSearch(""); setCategoryFilter(""); setRefreshing(true); fetchBlogs(); }} className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-white border border-orange-200 text-orange-700 font-semibold shadow hover:bg-orange-50 transition-all">
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Recargar
            </button>
          </div>
        </div>

        {/* Tabla de blogs */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
          </div>
        ) : blogs.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-orange-700">
            <AlertTriangle className="w-10 h-10 mb-2" />
            <p className="text-lg font-semibold">No tienes blogs creados.</p>
            <p className="text-sm">Crea tu primera publicación para compartir tu arte.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl shadow border border-gray-100 bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-orange-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-orange-700 uppercase tracking-wider">Imagen</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-orange-700 uppercase tracking-wider">Autor</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-orange-700 uppercase tracking-wider">Título</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-orange-700 uppercase tracking-wider">Categorías</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-orange-700 uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-orange-700 uppercase tracking-wider">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-orange-700 uppercase tracking-wider w-32 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {blogs.map(blog => {
                  console.log('blog.image_url_1', blog.image_url_1);
                  return (
                    <tr key={blog.id} className="hover:bg-orange-50/40 transition-all align-middle">
                      <td className="px-4 py-3 align-middle">
                        {blog.image_url_1 ? (
                          <img src={getImageUrl(blog.image_url_1)} alt="Blog" className="w-16 h-16 object-cover rounded-xl border" />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center text-xs text-gray-400">Sin imagen</div>
                        )}
                      </td>
                      <td className="px-4 py-3 flex items-center gap-2 align-middle min-w-[120px]">
                        {blog.author_avatar && <img src={getImageUrl(blog.author_avatar)} alt="avatar" className="w-8 h-8 rounded-full border" />}
                        <span className="text-sm font-semibold text-gray-700 truncate">{blog.author_name}</span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-800 max-w-xs truncate align-middle">{blog.title}</td>
                      <td className="px-4 py-3 text-gray-700 align-middle">
                        {Array.isArray(blog.categories) && blog.categories.length > 0
                          ? blog.categories.map((cat, i) => <span key={i} className="inline-block bg-orange-100 text-orange-700 rounded-full px-2 py-0.5 text-xs font-semibold mr-1 mb-1">{cat.name || cat}</span>)
                          : <span className="text-gray-400">Sin categoría</span>}
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm border ${blog.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' : blog.status === 'pending' ? 'bg-orange-100 text-orange-800 border-orange-200' : 'bg-red-100 text-red-800 border-red-200'}`}>{blog.status === 'active' ? 'Activo' : blog.status === 'pending' ? 'Pendiente' : 'Inactivo'}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs align-middle">{new Date(blog.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 flex gap-2 align-middle whitespace-nowrap w-32 justify-end">
                        <button onClick={() => router.push(`/artisan/blog/edit/${blog.id}`)} className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors" title="Editar">
                          <Edit className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(blog.id)} className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors" title="Eliminar">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtisanBlogPage; 