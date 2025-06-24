"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/utils/api";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { getImageUrl } from '@/utils/imageUrl';

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

  if (loading || !blog) {
    return <div className="p-8 text-center text-gray-500">Cargando...</div>;
  }

  if (blog.image_url_1) {
    console.log('IMAGEN BLOG:', getImageUrl(blog.image_url_1));
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-0 mt-8 overflow-hidden">
      {/* Header: avatar, autor, fecha, categorías */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 px-8 pt-8 pb-4">
        {blog.author_avatar && (
          <img src={getImageUrl(blog.author_avatar)} alt="avatar" className="w-12 h-12 rounded-full" />
        )}
        <div className="flex flex-col md:flex-row md:items-center gap-2 flex-1">
          <span className="font-semibold text-lg">{blog.author_name}</span>
          <span className="text-gray-400 text-sm">| {new Date(blog.created_at).toLocaleDateString()}</span>
          <div className="flex gap-2 flex-wrap">
            {blog.categories && blog.categories.map((cat) => (
              <span key={cat.id || cat} className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold">
                {cat.name || cat}
              </span>
            ))}
          </div>
        </div>
      </div>
      {/* Imagen 1 como header grande, bien escalada */}
      {blog.image_url_1 && (
        <div className="w-full bg-gray-100 flex justify-center items-center">
          <img src={getImageUrl(blog.image_url_1)} alt="Imagen principal" className="w-full max-h-[400px] object-contain" />
        </div>
      )}
      <div className="p-8 pt-6">
        <h1 className="text-3xl font-bold mb-4">{blog.title}</h1>
        {/* Contenido y segunda imagen a la derecha */}
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          <div className="flex-1">
            <p className="text-gray-800 whitespace-pre-line">{blog.content}</p>
          </div>
          {blog.image_url_2 && (
            <div className="md:w-56 md:flex-shrink-0 flex justify-center md:justify-end">
              <img src={getImageUrl(blog.image_url_2)} alt="Imagen secundaria" className="rounded-lg shadow-md max-h-48 object-cover" />
            </div>
          )}
        </div>
        {/* Ratings */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold">Valoración:</span>
            <span className="text-orange-600 font-bold">{ratings.average} / 5</span>
            <span className="text-gray-500 text-sm">({ratings.count} votos)</span>
          </div>
          {user && (
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`text-2xl ${userRating >= star ? "text-orange-500" : "text-gray-300"}`}
                  onClick={() => handleRating(star)}
                  disabled={ratingLoading}
                >
                  ★
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-500">Tu voto</span>
            </div>
          )}
        </div>
        {/* Comentarios */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Comentarios</h2>
          {user && (
            <form onSubmit={handleCommentSubmit} className="mb-6 flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escribe un comentario..."
                className="flex-1 border rounded-lg px-4 py-2"
                maxLength={300}
                required
              />
              <button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-semibold">
                Comentar
              </button>
            </form>
          )}
          <div className="space-y-4">
            {comments.length === 0 && <p className="text-gray-400">Aún no hay comentarios.</p>}
            {comments.map((c) => (
              <div key={c.id} className="bg-gray-50 rounded-lg p-4 flex items-start gap-3">
                {c.user_avatar && <img src={getImageUrl(c.user_avatar)} alt="avatar" className="w-8 h-8 rounded-full" />}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{c.user_name}</span>
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
                  <p className="text-gray-700 text-sm whitespace-pre-line">{c.comment}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <button
          type="button"
          className="mt-4 px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold shadow"
          onClick={() => router.back()}
        >
          Volver a blog
        </button>
      </div>
    </div>
  );
};

export default BlogDetailPage; 