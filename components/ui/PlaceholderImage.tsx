// Optimized image component for SEO and performance with S3 support
// Prevents infinite loops, provides fallbacks, optimizes loading
import React, { useState } from 'react';
import Image from 'next/image';
import { RecipeImage, getOptimizedImageProps, convertToRecipeImage, generateBlurPlaceholder } from '../../utils/s3-images';

interface PlaceholderImageProps {
  src: string | RecipeImage;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  loading?: 'lazy' | 'eager';
  blurDataURL?: string;
}

export default function PlaceholderImage({
  src,
  alt,
  width,
  height,
  className = '',
  fill = false,
  priority = false,
  sizes,
  quality = 85,
  loading = 'lazy',
  blurDataURL
}: PlaceholderImageProps) {
  // Convert any image format to standardized RecipeImage
  const imageData = typeof src === 'string'
    ? convertToRecipeImage(src)
    : convertToRecipeImage(src);

  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Use optimized props if we have a RecipeImage object
  const finalSrc = imageData.src;
  const finalAlt = alt || imageData.alt;
  const finalWidth = width || imageData.width;
  const finalHeight = height || imageData.height;
  const finalBlurDataURL = blurDataURL || imageData.blurHash || generateBlurPlaceholder(finalWidth, finalHeight);

  // Fallback placeholder SVG
  const placeholderSvg = `data:image/svg+xml;base64,${Buffer.from(`
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <rect x="50%" y="50%" width="80" height="80" transform="translate(-40, -40)" fill="#d1d5db" rx="8"/>
      <circle cx="50%" cy="40%" r="12" fill="#9ca3af"/>
      <path d="M45% 55% L55% 45% L65% 55% L60% 60% L50% 50% L40% 60% Z" fill="#9ca3af"/>
      <text x="50%" y="80%" text-anchor="middle" fill="#6b7280" font-family="Arial, sans-serif" font-size="14">
        ${finalAlt.substring(0, 20)}
      </text>
    </svg>
  `).toString('base64')}`;

  if (imageError) {
    return (
      <div 
        className={`bg-gray-100 flex items-center justify-center ${className}`}
        style={fill ? {} : { width: finalWidth, height: finalHeight }}
      >
        <img
          src={placeholderSvg}
          alt={finalAlt}
          className="w-full h-full object-cover"
          style={{ maxWidth: '100%', maxHeight: '100%' }}
        />
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div 
          className={`bg-gray-200 animate-pulse flex items-center justify-center ${className}`}
          style={fill ? {} : { width: finalWidth, height: finalHeight }}
        >
          <div className="w-12 h-12 bg-gray-300 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}
      
      <Image
        src={finalSrc}
        alt={finalAlt}
        {...(fill ? {} : { width: finalWidth, height: finalHeight })}
        fill={fill}
        priority={priority}
        sizes={sizes}
        quality={quality}
        loading={priority ? 'eager' : loading}
        placeholder="blur"
        blurDataURL={finalBlurDataURL}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImageError(true);
          setIsLoading(false);
        }}
        style={fill ? { objectFit: 'cover' } : {}}
      />
    </>
  );
}
