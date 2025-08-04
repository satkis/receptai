// Optimized Image Component for Core Web Vitals
import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
  sizes?: string;
  blurDataURL?: string;
  onLoad?: () => void;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  blurDataURL,
  onLoad
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [loadStartTime] = useState(() => performance.now());

  const handleLoad = () => {
    setIsLoaded(true);

    // Performance monitoring for single-visit optimization
    const loadTime = performance.now() - loadStartTime;
    if (loadTime > 2000) {
      console.warn(`Slow image load detected: ${loadTime.toFixed(0)}ms for ${src}`);
    }

    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
  };

  // Fallback image for errors - use existing hero image as placeholder
  const fallbackSrc = '/hero-image.jpg';

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={hasError ? fallbackSrc : src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        sizes={sizes}
        placeholder={blurDataURL ? 'blur' : 'empty'}
        blurDataURL={blurDataURL}
        onLoad={handleLoad}
        onError={handleError}
        className={`
          transition-opacity duration-300
          ${isLoaded ? 'opacity-100' : 'opacity-0'}
          object-cover w-full h-full
        `}
        style={{
          maxWidth: '100%',
          height: 'auto',
        }}
      />
      
      {/* Loading skeleton */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  );
}

// Recipe Card Image with optimized loading
export function RecipeCardImage({ 
  recipe, 
  priority = false 
}: { 
  recipe: { image: { src: string; alt: string; width: number; height: number } }; 
  priority?: boolean;
}) {
  return (
    <OptimizedImage
      src={recipe.image.src}
      alt={recipe.image.alt}
      width={recipe.image.width}
      height={recipe.image.height}
      priority={priority}
      className="aspect-[4/3] rounded-lg"
      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
    />
  );
}

// Hero Image with priority loading
export function RecipeHeroImage({ 
  recipe 
}: { 
  recipe: { image: { src: string; alt: string; width: number; height: number } }
}) {
  return (
    <OptimizedImage
      src={recipe.image.src}
      alt={recipe.image.alt}
      width={recipe.image.width}
      height={recipe.image.height}
      priority={true} // Always priority for hero images
      className="aspect-[16/9] rounded-xl"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
    />
  );
}
