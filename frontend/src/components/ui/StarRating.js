'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';

const StarRating = ({ rating = 0, onRatingChange, readOnly = false }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleMouseEnter = (index) => {
    if (!readOnly) {
      setHoverRating(index);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverRating(0);
    }
  };

  const handleClick = (index) => {
    if (!readOnly && onRatingChange) {
      onRatingChange(index);
    }
  };

  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => {
        const ratingValue = i + 1;
        return (
          <button
            key={ratingValue}
            type="button"
            className={`transition-colors ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
            onMouseEnter={() => handleMouseEnter(ratingValue)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(ratingValue)}
            aria-label={`Calificar con ${ratingValue} estrellas`}
          >
            <Star
              className={`w-6 h-6 ${
                ratingValue <= (hoverRating || rating)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-500'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating; 