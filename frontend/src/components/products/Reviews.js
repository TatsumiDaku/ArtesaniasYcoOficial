'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import StarRating from '@/components/ui/StarRating';
import toast from 'react-hot-toast';

const Reviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { isAuthenticated, user } = useAuth();

  const fetchReviews = useCallback(async () => {
    try {
      const res = await api.get(`/products/${productId}/reviews`);
      setReviews(res.data);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      // No mostrar error si es 404 (no hay reseñas aún)
      if (error.response?.status !== 404) {
        toast.error('No se pudieron cargar las reseñas');
      }
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId, fetchReviews]);
  
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Por favor, selecciona una calificación.');
      return;
    }
    if (!comment.trim()) {
      toast.error('Por favor, escribe un comentario.');
      return;
    }
    
    setSubmitting(true);
    try {
      const res = await api.post(`/products/${productId}/reviews`, {
        rating: rating,
        comment: comment.trim(),
      });
      if (res.status === 201) {
        // Actualizar la lista de reseñas solo si la creación fue exitosa
      setReviews(prevReviews => {
        const existingIndex = prevReviews.findIndex(r => r.usuario_id === user.id);
        if (existingIndex >= 0) {
          // Actualizar reseña existente
          const updatedReviews = [...prevReviews];
          updatedReviews[existingIndex] = res.data;
          return updatedReviews;
        } else {
          // Añadir nueva reseña
          return [res.data, ...prevReviews];
        }
      });
      setComment('');
      setRating(0);
      toast.success('¡Gracias por tu reseña!');
      }
    } catch (error) {
      console.error('Error submitting review:', error, error.response);
      if (error.response?.status === 409) {
        toast.error(error.response?.data?.message || 'Solo puedes dejar una reseña por producto.');
      } else {
      toast.error(error.response?.data?.message || 'No se pudo enviar la reseña.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Calcular promedio de reseñas
  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, review) => acc + parseFloat(review.rating || 0), 0) / reviews.length 
    : 0;

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Reseñas y Calificaciones</h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <StarRating rating={averageRating} readOnly />
            <span className="text-sm text-gray-600">
              ({reviews.length} reseña{reviews.length !== 1 ? 's' : ''})
            </span>
          </div>
        )}
      </div>
      
      {/* Form to add a review */}
      {isAuthenticated && (user?.role === 'cliente' || user?.role === 'admin') && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <form onSubmit={handleReviewSubmit}>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Deja tu opinión</h3>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2 font-medium">Tu calificación:</label>
              <StarRating rating={rating} onRatingChange={setRating} />
            </div>
            <div className="mb-4">
              <label htmlFor="comment" className="block text-gray-700 mb-2 font-medium">Tu comentario:</label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 text-gray-700 placeholder-gray-400 resize-none"
                placeholder="Describe tu experiencia con el producto..."
                rows="4"
                maxLength="500"
              ></textarea>
              <div className="text-right text-sm text-gray-500 mt-1">
                {comment.length}/500
              </div>
            </div>
            <button 
              type="submit" 
              disabled={submitting}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Enviando...' : 'Enviar Reseña'}
            </button>
          </form>
        </div>
      )}

      {/* List of existing reviews */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full mb-4">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            </div>
            <p className="text-gray-600">Cargando reseñas...</p>
          </div>
        ) : reviews.length > 0 ? (
          reviews.map(review => {
            const reviewRating = parseFloat(review.rating || 0);
            return (
              <div key={review.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <StarRating rating={reviewRating} readOnly />
                    <div>
                      <p className="font-semibold text-gray-800">{review.usuario_nombre || 'Anónimo'}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(review.created_at).toLocaleDateString('es-CO', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-blue-600">
                      {reviewRating.toFixed(1)}
                    </span>
                    <span className="text-gray-500">/5</span>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">{review.comment}</p>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <div className="text-6xl mb-4">⭐</div>
            <p className="text-lg text-gray-600 mb-2">Este producto aún no tiene reseñas</p>
            <p className="text-gray-500">¡Sé el primero en compartir tu experiencia!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews; 