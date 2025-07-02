"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { RefreshCw, UserCheck, XCircle, ExternalLink, Search, Loader2, Trash2, Eye, Clock } from "lucide-react";
import api from "@/utils/api";
import Image from "next/image";
import imageUrl from '@/utils/imageUrl';

function BlogDetailModal({ blog, open, onClose, onCommentDeleted }) {
  if (!open || !blog) return null;

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("¿Seguro que deseas eliminar este comentario?")) return;
    try {
      await api.delete(`/blogs/${blog.id}/comments/${commentId}`);
      onCommentDeleted && onCommentDeleted();
    } catch (e) {
      toast.error("Error al eliminar comentario");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl">&times;</button>
        <h2 className="text-2xl font-bold mb-2">{blog.title}</h2>
        <div className="flex gap-4 mb-4">
          {blog.image_url_1 && blog.image_url_1.startsWith('/uploads') ? (
            <img
              src={imageUrl(blog.image_url_1)}
              alt={blog.title}
              className="w-24 h-24 object-cover rounded-lg border"
              style={{ maxHeight: '96px' }}
            />
          ) : (
            <Image
              src={blog.image_url_1 ? imageUrl(blog.image_url_1) : '/static/placeholder.png'}
              alt={blog.title}
              width={96}
              height={96}
              className="w-24 h-24 object-cover rounded-lg border"
              style={{ maxHeight: '96px' }}
            />
          )}
          {blog.image_url_2 && <Image src={imageUrl(blog.image_url_2)} alt="Imagen 2" width={96} height={96} className="rounded-lg object-cover border w-24 h-24" unoptimized />}
        </div>
        <div className="mb-2 text-gray-700"><span className="font-semibold">Autor:</span> {blog.author_name || "-"}</div>
        <div className="mb-2 text-gray-700"><span className="font-semibold">Estado:</span> {blog.status}</div>
        <div className="mb-2 text-gray-700"><span className="font-semibold">Fecha:</span> {new Date(blog.created_at).toLocaleDateString()}</div>
        {blog.categories && blog.categories.length > 0 && (
          <div className="mb-2"><span className="font-semibold text-gray-700">Categorías:</span> {blog.categories.map(c => c.name).join(", ")}</div>
        )}
        <div className="mb-4 text-gray-800 whitespace-pre-line border-t pt-4">{blog.content}</div>
        {/* Ratings */}
        <div className="mb-4 flex items-center gap-2">
          <span className="font-semibold text-gray-700">Rating:</span>
          <span className="text-yellow-500 font-bold">★</span>
          <span className="text-lg font-bold text-gray-800">{blog.ratings?.average || 0}</span>
          <span className="text-gray-500 text-sm">({blog.ratings?.count || 0} votos)</span>
        </div>
        {/* Comentarios */}
        <div className="mb-2">
          <span className="font-semibold text-gray-700">Comentarios:</span>
          {blog.comments && blog.comments.length > 0 ? (
            <ul className="mt-2 space-y-2 max-h-40 overflow-y-auto pr-2">
              {blog.comments.map(c => (
                <li key={c.id} className="flex items-start gap-2 border-b pb-2 last:border-b-0">
                  <Image src={imageUrl(c.user_avatar) || '/static/default-avatar.png'} alt={c.user_name} width={32} height={32} className="w-8 h-8 rounded-full object-cover border" unoptimized />
                  <div className="flex-1">
                    <div className="text-xs text-gray-500">{c.user_name} • {new Date(c.created_at).toLocaleDateString()}</div>
                    <div className="text-gray-700 text-sm">{c.comment}</div>
                  </div>
                  <button onClick={() => handleDeleteComment(c.id)} className="ml-2 text-rose-500 hover:text-rose-700" title="Eliminar comentario">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-400 text-sm mt-2">Sin comentarios.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [modalBlog, setModalBlog] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/blogs?admin=1");
      setBlogs(res.data);
    } catch (error) {
      toast.error("Error al cargar los blogs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleApprove = async (id) => {
    toast.loading("Aprobando blog...");
    try {
      await api.put(`/blogs/${id}/approve`);
      toast.dismiss();
      toast.success("Blog aprobado");
      fetchBlogs();
    } catch (e) {
      toast.dismiss();
      toast.error("Error al aprobar blog");
    }
  };

  const handleSetPending = async (id) => {
    toast.loading("Poniendo blog en pendiente...");
    try {
      await api.put(`/blogs/${id}/pending`);
      toast.dismiss();
      toast.success("Blog puesto en pendiente");
      fetchBlogs();
    } catch (e) {
      toast.dismiss();
      toast.error("Error al poner blog en pendiente");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este blog? Esta acción no se puede deshacer.")) return;
    toast.loading("Eliminando blog...");
    try {
      await api.delete(`/blogs/${id}`);
      toast.dismiss();
      toast.success("Blog eliminado");
      fetchBlogs();
    } catch (e) {
      toast.dismiss();
      toast.error("Error al eliminar blog");
    }
  };

  const handleShowDetail = async (id) => {
    setModalLoading(true);
    try {
      const res = await api.get(`/blogs/${id}`);
      setModalBlog(res.data);
      setModalOpen(true);
    } catch (e) {
      toast.error("No se pudo cargar el detalle del blog");
    } finally {
      setModalLoading(false);
    }
  };

  const reloadModalBlog = async () => {
    if (!modalBlog) return;
    setModalLoading(true);
    try {
      const res = await api.get(`/blogs/${modalBlog.id}`);
      setModalBlog(res.data);
    } catch {}
    setModalLoading(false);
  };

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(search.toLowerCase()) || blog.author_name?.toLowerCase().includes(search.toLowerCase());
    if (filter === "all") return matchesSearch;
    return matchesSearch && blog.status === filter;
  });

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <BlogDetailModal blog={modalBlog} open={modalOpen} onClose={() => setModalOpen(false)} onCommentDeleted={reloadModalBlog} />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Blogs</h1>
        <button
          onClick={() => { setRefreshing(true); fetchBlogs().finally(() => setRefreshing(false)); }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-all font-semibold"
          disabled={refreshing}
        >
          <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
          Recargar
        </button>
      </div>
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por título o autor..."
            className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-emerald-400"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="all">Todos</option>
          <option value="pending">Pendientes</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
      </div>
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-emerald-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Imagen</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Título</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Autor</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Fecha</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-400" />
                  <div className="text-gray-400 mt-2">Cargando blogs...</div>
                </td>
              </tr>
            ) : filteredBlogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-400">No se encontraron blogs.</td>
              </tr>
            ) : (
              filteredBlogs.map(blog => (
                <tr key={blog.id} className="hover:bg-emerald-50/40 transition-all align-middle">
                  <td className="px-4 py-3">
                    {blog.image_url_1 && blog.image_url_1.startsWith('/uploads') ? (
                      <img
                        src={imageUrl(blog.image_url_1)}
                        alt={blog.title}
                        className="w-24 h-24 object-cover rounded-lg border"
                        style={{ maxHeight: '96px' }}
                      />
                    ) : (
                      <Image
                        src={blog.image_url_1 ? imageUrl(blog.image_url_1) : '/static/placeholder.png'}
                        alt={blog.title}
                        width={96}
                        height={96}
                        className="w-24 h-24 object-cover rounded-lg border"
                        style={{ maxHeight: '96px' }}
                      />
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-800 cursor-pointer hover:underline" onClick={() => handleShowDetail(blog.id)}>
                    {blog.title}
                    <Eye className="inline w-4 h-4 ml-1 text-emerald-400 align-text-bottom" />
                  </td>
                  <td className="px-4 py-3 text-gray-700">{blog.author_name || "-"}</td>
                  <td className="px-4 py-3">
                    {blog.status === "active" && <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-bold">Activo</span>}
                    {blog.status === "pending" && <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 text-xs font-bold">Pendiente</span>}
                    {blog.status === "inactive" && <span className="px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-bold">Inactivo</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-sm">{new Date(blog.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 flex gap-2">
                    {blog.status === "pending" && (
                      <button
                        onClick={() => handleApprove(blog.id)}
                        className="flex items-center gap-1 px-3 py-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-all"
                        title="Aprobar blog"
                      >
                        <UserCheck className="w-4 h-4" />
                      </button>
                    )}
                    {blog.status === "active" && (
                      <button
                        onClick={() => handleSetPending(blog.id)}
                        className="flex items-center gap-1 px-3 py-1 text-xs bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-lg transition-all"
                        title="Poner blog en pendiente"
                      >
                        <Clock className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(blog.id)}
                      className="flex items-center gap-1 px-3 py-1 text-xs bg-rose-100 text-rose-700 hover:bg-rose-200 rounded-lg transition-all"
                      title="Eliminar blog"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <Link
                      href={`/blog/${blog.id}`}
                      className="flex items-center gap-1 px-3 py-1 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-all"
                      title="Ver blog público"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/artisan/blog/edit/${blog.id}`}
                      className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-all"
                      title="Editar blog"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 