"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/utils/api";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import imageUrl from '@/utils/imageUrl';
import Image from 'next/image';
import { CalendarDays, MapPin, Users, Star, MessageCircle } from "lucide-react";

const BlogDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState({ average: 0, count: 0 });
  const [userRating, setUserRating] = useState(0);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [participants, setParticipants] = useState(5);
  const [hasParticipated, setHasParticipated] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [blogRes, commentsRes, ratingsRes] = await Promise.all([
          api.get(`/blogs/${id}`),
          api.get(`/blogs/${id}/comments`),
          api.get(`/blogs/${id}/ratings`),
        ]);
        setBlog(blogRes.data);
        setComments(commentsRes.data);
        setRatings(ratingsRes.data);
      } catch (error) {
        toast.error("No se pudo cargar el blog.");
        router.push("/not-found");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user, router]);

  // Obtener participantes al cargar
  useEffect(() => {
    if (blog && blog.event_start && blog.event_end && blog.event_address) {
      api.get(`/blogs/${id}/participants`).then(res => {
        setParticipants(res.data.count);
      });
      if (user) {
        api.get(`/blogs/${id}/has-participated`).then(res => {
          setHasParticipated(res.data.participated);
        });
      }
    }
  }, [id, blog, user]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await api.post(`/blogs/${id}/comments`, { comment: newComment });
      setNewComment("");
      const { data } = await api.get(`/blogs/${id}/comments`);
      setComments(data);
      toast.success("Comentario agregado");
    } catch (error) {
      toast.error("Error al agregar comentario");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("¿Eliminar este comentario?")) return;
    try {
      await api.delete(`/blogs/${id}/comments/${commentId}`);
      setComments(comments.filter((c) => c.id !== commentId));
      toast.success("Comentario eliminado");
    } catch (error) {
      toast.error("No se pudo eliminar el comentario");
    }
  };

  const handleRating = async (value) => {
    setRatingLoading(true);
    try {
      await api.post(`/blogs/${id}/ratings`, { rating: value });
      setUserRating(value);
      const { data } = await api.get(`/blogs/${id}/ratings`);
      setRatings(data);
      toast.success("¡Gracias por tu valoración!");
    } catch (error) {
      toast.error("No se pudo registrar el rating");
    } finally {
      setRatingLoading(false);
    }
  };

  // Handler para participar
  const handleParticipate = async () => {
    try {
      await api.post(`/blogs/${id}/participate`);
      setHasParticipated(true);
      setParticipants(p => p + 1);
      toast('¡Gracias por unirte al evento! Nos vemos allí 🎉', {
        icon: '🎉',
        style: {
          fontSize: '1.25rem',
          background: 'linear-gradient(90deg, #fbbf24 0%, #6366f1 100%)',
          color: '#fff',
          padding: '1.5rem',
          borderRadius: '1rem',
          fontWeight: 'bold',
        },
        duration: 5000,
      });
    } catch (err) {
      toast.error('Ya participaste o hubo un error.');
    }
  };

  if (loading || !blog) {
    return <div className="p-8 text-center text-gray-500">Cargando...</div>;
  }

  if (blog.image_url_1) {
    console.log('IMAGEN BLOG:', imageUrl(blog.image_url_1));
  }

  // Simulación de participantes (visual)
  const fakeParticipants = 23;
  const isEvent = blog.event_start && blog.event_end && blog.event_address;

  return (
    <div className="max-w-3xl mx-auto bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50 rounded-3xl shadow-2xl mt-10 overflow-hidden border border-blue-100 animate-fade-in">
      {/* Imagen principal */}
      {blog.image_url_1 && blog.image_url_1.startsWith('/uploads') ? (
        <img
          src={imageUrl(blog.image_url_1)}
          alt="Imagen principal"
          className="object-contain bg-white w-full h-full rounded-xl"
          style={{ maxHeight: '320px' }}
        />
      ) : (
        <Image
          src={blog.image_url_1 ? imageUrl(blog.image_url_1) : '/static/placeholder.png'}
          alt="Imagen principal"
          width={600}
          height={320}
          className="object-contain bg-white w-full h-full rounded-xl"
          style={{ maxHeight: '320px' }}
        />
      )}
      {/* Header autor y categorías */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 px-8 pt-8 pb-4 bg-white/80 border-b border-blue-100">
        {blog.author_avatar && (
          <Image src={imageUrl(blog.author_avatar)} alt="avatar" width={56} height={56} className="w-14 h-14 rounded-full border-4 border-orange-200 shadow" unoptimized />
        )}
        <div className="flex flex-col md:flex-row md:items-center gap-2 flex-1">
          <span className="font-bold text-xl text-blue-900">{blog.author_name}</span>
          <span className="text-gray-400 text-base">| {new Date(blog.created_at).toLocaleDateString()}</span>
          <div className="flex gap-2 flex-wrap">
            {blog.categories && blog.categories.map((cat) => (
              <span key={cat.id || cat} className="bg-gradient-to-r from-orange-200 to-yellow-100 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold shadow">
                {cat.name || cat}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="p-8 pt-6 bg-white/90">
        <h1 className="text-4xl font-bold text-amber-700 font-pacifico mb-6 flex items-center gap-3">
          {isEvent && <CalendarDays className="w-8 h-8 text-orange-500" />} {blog.title}
        </h1>
        {/* Tarjeta de evento importante */}
        {isEvent && (
          <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 text-white shadow-2xl rounded-2xl p-8 mb-10 border-l-8 border-blue-400 flex flex-col gap-6 animate-fade-in">
            <div className="flex items-center gap-4 mb-2">
              <CalendarDays className="w-10 h-10 text-white" />
              <h2 className="text-3xl font-bold tracking-wide">¡Evento importante!</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-lg font-semibold">Inicio:</p>
                <p className="text-lg font-mono">{new Date(blog.event_start).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-lg font-semibold">Fin:</p>
                <p className="text-lg font-mono">{new Date(blog.event_end).toLocaleString()}</p>
              </div>
              <div className="md:col-span-2 flex items-center gap-2 mt-2">
                <MapPin className="w-6 h-6 text-white" />
                <span className="text-lg font-semibold">Dirección:</span>
                <span className="text-lg font-mono">{blog.event_address}</span>
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-4 mt-4">
              <button
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 text-white font-bold shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-200 text-lg disabled:opacity-60"
                onClick={handleParticipate}
                disabled={hasParticipated || !user}
              >
                <Users className="w-6 h-6" /> {hasParticipated ? '¡Ya participas!' : 'Participar'}
              </button>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 border border-white text-white font-semibold text-lg shadow">
                <Users className="w-5 h-5" /> {participants} participantes
              </span>
            </div>
          </section>
        )}
        {/* Contenido y segunda imagen */}
        <div className="flex flex-col md:flex-row gap-8 mb-10">
          <div className="flex-1">
            <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-line font-serif">{blog.content}</p>
          </div>
          {blog.image_url_2 && (
            <div className="md:w-64 md:flex-shrink-0 flex justify-center md:justify-end">
              <Image src={imageUrl(blog.image_url_2)} alt="Imagen secundaria" width={256} height={192} className="rounded-2xl shadow-lg max-h-64 object-cover" unoptimized />
            </div>
          )}
        </div>
        {/* Ratings */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <Star className="w-6 h-6 text-yellow-400" />
            <span className="font-semibold text-lg">Valoración:</span>
            <span className="text-orange-600 font-bold text-xl">{ratings.average} / 5</span>
            <span className="text-gray-500 text-base">({ratings.count} votos)</span>
          </div>
          {user && (
            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`text-3xl ${userRating >= star ? "text-orange-500" : "text-gray-300"} hover:scale-125 transition-transform`}
                  onClick={() => handleRating(star)}
                  disabled={ratingLoading}
                >
                  ★
                </button>
              ))}
              <span className="ml-3 text-base text-gray-500">Tu voto</span>
            </div>
          )}
        </div>
        {/* Comentarios */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-blue-900"><MessageCircle className="w-6 h-6 text-blue-400" /> Comentarios</h2>
          {user && (
            <form onSubmit={handleCommentSubmit} className="mb-8 flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escribe un comentario..."
                className="flex-1 border-2 border-blue-200 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 text-lg"
                maxLength={300}
                required
              />
              <button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-purple-600 hover:to-blue-500 text-white px-6 py-2 rounded-lg font-bold text-lg shadow">
                Comentar
              </button>
            </form>
          )}
          <div className="space-y-6">
            {comments.length === 0 && <p className="text-gray-400 text-lg">Aún no hay comentarios.</p>}
            {comments.map((c) => (
              <div key={c.id} className="bg-gradient-to-r from-blue-50 via-orange-50 to-purple-50 rounded-xl p-5 flex items-start gap-4 border border-blue-100 shadow">
                {c.user_avatar && <Image src={imageUrl(c.user_avatar)} alt="avatar" width={40} height={40} className="w-10 h-10 rounded-full border-2 border-orange-200" unoptimized />}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-base text-blue-900">{c.user_name}</span>
                    <span className="text-gray-400 text-xs">{new Date(c.created_at).toLocaleString()}</span>
                    {user && (user.id === c.user_id || user.role === "admin") && (
                      <button
                        onClick={() => handleDeleteComment(c.id)}
                        className="ml-2 text-xs text-red-500 hover:underline"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                  <p className="text-gray-700 text-base whitespace-pre-line font-serif">{c.comment}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <button
          type="button"
          className="mt-6 px-8 py-3 rounded-xl bg-gradient-to-r from-gray-200 to-blue-100 hover:from-blue-100 hover:to-gray-200 text-blue-900 font-bold shadow-lg text-lg"
          onClick={() => router.back()}
        >
          Volver al blog
        </button>
      </div>
    </div>
  );
};

export default BlogDetailPage; 