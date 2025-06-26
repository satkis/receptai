// Star Rating Component for Recipe Pages
'use client';

import { useState } from 'react';

interface StarRatingProps {
  initialRating?: number;
  totalStars?: number;
  size?: 'sm' | 'md' | 'lg';
  showRatingText?: boolean;
  className?: string;
  onRatingChange?: (rating: number) => void;
}

export default function StarRating({
  initialRating = 0,
  totalStars = 5,
  size = 'md',
  showRatingText = true,
  className = '',
  onRatingChange
}: StarRatingProps) {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);

  const handleStarClick = (starIndex: number) => {
    const newRating = starIndex + 1;
    setRating(newRating);
    onRatingChange?.(newRating);
  };

  const handleStarHover = (starIndex: number) => {
    setHoverRating(starIndex + 1);
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-8 h-8';
      default:
        return 'w-6 h-6';
    }
  };

  const getTextSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-sm';
      case 'lg':
        return 'text-lg';
      default:
        return 'text-base';
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Stars */}
      <div 
        className="flex gap-1"
        onMouseLeave={handleMouseLeave}
      >
        {Array.from({ length: totalStars }, (_, index) => {
          const isActive = index < displayRating;
          const isHovered = index < hoverRating;
          
          return (
            <button
              key={index}
              type="button"
              className={`
                ${getSizeClasses()}
                transition-all duration-200 ease-in-out
                hover:scale-110 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50
                ${isActive ? 'text-orange-400' : 'text-gray-300'}
                ${isHovered ? 'text-orange-500' : ''}
              `}
              onClick={() => handleStarClick(index)}
              onMouseEnter={() => handleStarHover(index)}
              aria-label={`Rate ${index + 1} out of ${totalStars} stars`}
            >
              <svg
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          );
        })}
      </div>

      {/* Rating Text */}
      {showRatingText && (
        <span className={`text-gray-600 font-medium ${getTextSizeClasses()}`}>
          {rating > 0 ? (
            <>
              {rating.toFixed(1)} iš {totalStars}
            </>
          ) : (
            'Įvertinkite receptą'
          )}
        </span>
      )}
    </div>
  );
}

// Recipe Rating Display Component (for showing existing ratings)
export function RecipeRatingDisplay({
  rating,
  reviewCount,
  size = 'md',
  className = ''
}: {
  rating: number;
  reviewCount: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-5 h-5';
    }
  };

  const getTextSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-sm';
      case 'lg':
        return 'text-lg';
      default:
        return 'text-base';
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Stars Display */}
      <div className="flex gap-1">
        {Array.from({ length: 5 }, (_, index) => {
          const isActive = index < Math.floor(rating);
          const isHalf = index === Math.floor(rating) && rating % 1 >= 0.5;
          
          return (
            <div key={index} className={`${getSizeClasses()} relative`}>
              {/* Background star */}
              <svg
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full text-gray-300"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              
              {/* Filled star */}
              {(isActive || isHalf) && (
                <svg
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`
                    w-full h-full text-orange-400 absolute top-0 left-0
                    ${isHalf ? 'clip-path-half' : ''}
                  `}
                  style={isHalf ? { clipPath: 'inset(0 50% 0 0)' } : {}}
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              )}
            </div>
          );
        })}
      </div>

      {/* Rating Text */}
      <span className={`text-gray-600 font-medium ${getTextSizeClasses()}`}>
        {rating.toFixed(1)} ({reviewCount} {reviewCount === 1 ? 'įvertinimas' : 'įvertinimai'})
      </span>
    </div>
  );
}
