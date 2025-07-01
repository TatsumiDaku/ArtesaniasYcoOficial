"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { ThumbsUp, ThumbsDown, MessageCircle, ArrowLeft, User, Trash2, CalendarDays, MapPin, Users, CheckCircle, XCircle } from "lucide-react";
import api from "@/utils/api";
import { useAuth } from "@/context/AuthContext";
import imageUrl from "@/utils/imageUrl";
import Image from "next/image";

export default function NewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const newsId = params.id;
  const { user, isAuthenticated } = useAuth();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState(false);
  const [comment, setComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [userLike, setUserLike] = useState(null);
  const [participateLoading, setParticipateLoading] = useState(false);

  const isEvent = news?.event_start && news?.event_end && news?.event_address;

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/news/${newsId}`);
      setNews(res.data);
      setUserLike(res.data.user_like || null);
    } catch {
      toast.error("No se pudo cargar la noticia");
      router.push("/news");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    // eslint-disable-next-line
  }, [newsId]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get(`/news/${newsId}/categories`);
        setCategories(res.data);
      } catch {
        setCategories([]);
      }
    };
    if (newsId) fetchCategories();
  }, [newsId]);

  const handleLike = async (is_like) => {
    if (!isAuthenticated) return toast.error("Debes iniciar sesión para votar");
    setLikeLoading(true);
    try {
      await api.post(`/news/${newsId}/like`, { is_like });
      setUserLike(is_like ? 'like' : 'dislike');
      setTimeout(() => {
        fetchNews();
      }, 1000);
    } catch {
      toast.error("No se pudo registrar tu voto");
    } finally {
      setLikeLoading(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return toast.error("Debes iniciar sesión para comentar");
    if (!comment.trim()) return toast.error("El comentario no puede estar vacío");
    setCommentLoading(true);
    try {
      await api.post(`/news/${newsId}/comment`, { comment });
      setComment("");
      fetchNews();
    } catch {
      toast.error("No se pudo enviar el comentario");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("¿Eliminar este comentario?")) return;
    try {
      await api.delete(`/news/${newsId}/comment/${commentId}`);
      fetchNews();
    } catch {
      toast.error("No se pudo eliminar el comentario");
    }
  };

  const handleParticipate = async () => {
    if (!isAuthenticated) return toast.error("Debes iniciar sesión para participar");
    setParticipateLoading(true);
    try {
      await api.post(`/news/${newsId}/participate`);
      toast.success("¡Te has registrado como asistente!");
      fetchNews();
    } catch (err) {
      toast.error(err?.response?.data?.message || "No se pudo registrar tu asistencia");
    } finally {
      setParticipateLoading(false);
    }
  };

  const handleCancelParticipation = async () => {
    setParticipateLoading(true);
    try {
      await api.delete(`/news/${newsId}/participate`);
      toast.success("Has cancelado tu asistencia");
      fetchNews();
    } catch (err) {
      toast.error("No se pudo cancelar tu asistencia");
    } finally {
      setParticipateLoading(false);
    }
  };

  if (loading || !news) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/news" className="btn btn-ghost flex items-center gap-2"><ArrowLeft className="w-5 h-5" />Volver</Link>
        <h1 className="text-3xl font-bold text-amber-700 font-pacifico">Detalle de Noticia</h1>
      </div>
      {isEvent && (
        <section
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl rounded-2xl p-6 mb-8 border-l-4 border-blue-400 flex flex-col gap-4 animate-fade-in"
          aria-label="Evento importante"
        >
          <div className="flex items-center gap-3 mb-2">
            <CalendarDays className="w-8 h-8 text-white" />
            <h2 className="text-2xl font-bold tracking-wide">¡Evento importante!</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-lg font-semibold">Inicio:</p>
              <p className="text-lg">{new Date(news.event_start).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-lg font-semibold">Fin:</p>
              <p className="text-lg">{new Date(news.event_end).toLocaleString()}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-lg font-semibold">Dirección:</p>
              <p className="text-lg">{news.event_address}</p>
            </div>
          </div>
          <div className="flex items-center gap-6 mt-4">
            {news.user_participates ? (
              <button
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold shadow-lg hover:scale-105 transition flex items-center gap-2 animate-bounce"
                onClick={handleCancelParticipation}
                disabled={participateLoading}
              >
                <XCircle className="w-5 h-5" />Cancelar asistencia
              </button>
            ) : (
              <button
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold shadow-lg hover:scale-105 transition flex items-center gap-2 animate-bounce"
                onClick={handleParticipate}
                disabled={participateLoading}
              >
                <CheckCircle className="w-5 h-5" />Quiero asistir
              </button>
            )}
            <span className="text-xl font-bold flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl shadow border border-white/30">
              <Users className="w-6 h-6 text-white" />
              {news.participants_count || 0} asistentes
            </span>
          </div>
        </section>
      )}
      <div className={`bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8 ${isEvent ? 'border-l-8 border-orange-400' : ''}`}>
        {isEvent && news.main_image && (
          <div className="relative mb-4">
            <img src={imageUrl(news.main_image)} alt={news.title} className="w-full max-h-80 object-cover rounded-xl border-4 border-orange-200 shadow-lg" />
            <span className="absolute top-4 left-4 bg-gradient-to-r from-orange-400 to-amber-400 text-white font-bold px-4 py-1 rounded-full shadow-lg text-sm flex items-center gap-2 z-10">
              <CalendarDays className="w-5 h-5" /> Evento
            </span>
          </div>
        )}
        {!isEvent && news.main_image && (
          <img src={imageUrl(news.main_image)} alt={news.title} className="w-full max-h-80 object-cover rounded-xl mb-4" />
        )}
        <h2 className={`text-3xl font-bold mb-2 ${isEvent ? 'text-orange-700' : 'text-pink-700'}`}>{news.title}</h2>
        <div className="flex flex-wrap gap-1 mb-2">
          {categories.map((cat) => (
            <span key={cat.id} className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded text-xs font-semibold">{cat.name}</span>
          ))}
        </div>
        <div className="flex items-center gap-4 mb-4">
          <span className="text-xs text-gray-500">{new Date(news.created_at).toLocaleDateString()}</span>
          <span className="flex items-center gap-1 text-emerald-600 font-semibold"><ThumbsUp className="w-4 h-4" />{news.likes?.find(l => l.is_like)?.count || 0}</span>
          <span className="flex items-center gap-1 text-rose-500 font-semibold"><ThumbsDown className="w-4 h-4" />{news.likes?.find(l => !l.is_like)?.count || 0}</span>
        </div>
        {news.content_blocks?.map((block, idx) => (
          <p key={idx} className="mb-4 text-gray-700 whitespace-pre-line text-lg">{block}</p>
        ))}
        {/* Likes/Dislikes */}
        <div className="flex gap-4 mt-6">
          <button
            className={`btn flex items-center gap-1 transition-all duration-200 ${userLike === 'like' ? 'bg-emerald-100 text-emerald-700 scale-105 shadow-lg' : 'btn-ghost'}`}
            disabled={likeLoading}
            onClick={() => handleLike(true)}
          >
            <ThumbsUp className="w-5 h-5" />Me gusta
          </button>
          <button
            className={`btn flex items-center gap-1 transition-all duration-200 ${userLike === 'dislike' ? 'bg-rose-100 text-rose-700 scale-105 shadow-lg' : 'btn-ghost'}`}
            disabled={likeLoading}
            onClick={() => handleLike(false)}
          >
            <ThumbsDown className="w-5 h-5" />No me gusta
          </button>
        </div>
      </div>
      {/* Comentarios */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><MessageCircle className="w-6 h-6 text-pink-500" /> Comentarios</h3>
        <form onSubmit={handleComment} className="flex gap-2 mb-6">
          <input type="text" className="input flex-1" placeholder="Escribe un comentario..." value={comment} onChange={e => setComment(e.target.value)} maxLength={500} />
          <button type="submit" className="btn btn-primary" disabled={commentLoading}>Comentar</button>
        </form>
        {!isAuthenticated && (
          <div className="text-center text-pink-600 font-semibold mb-4">Inicia sesión para comentar o dar like/dislike.</div>
        )}
        {news.comments?.length === 0 ? (
          <div className="text-gray-500">No hay comentarios aún.</div>
        ) : (
          <ul className="space-y-4">
            {news.comments.map(c => (
              <li key={c.id} className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                <div className="flex-shrink-0">
                  {c.avatar ? (
                    <img 
                      src={imageUrl(c.avatar)} 
                      alt={c.name} 
                      className="w-10 h-10 rounded-full object-cover border" 
                      onError={e => { e.target.onerror = null; e.target.src = "/static/default-avatar.png"; }}
                    />
                  ) : (
                    <User className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{c.name}</div>
                  <div className="text-xs text-gray-500 mb-1">{new Date(c.created_at).toLocaleString()}</div>
                  <div className="text-gray-700 whitespace-pre-line">{c.comment}</div>
                </div>
                {(isAuthenticated && user && (user.id === c.user_id || user.role === 'admin')) && (
                  <button className="btn btn-ghost text-red-500" onClick={() => handleDeleteComment(c.id)} title="Eliminar comentario"><Trash2 className="w-4 h-4" /></button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 