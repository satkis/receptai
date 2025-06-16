// S3 Image utilities for Lithuanian recipe website
// Optimized for SEO and fast loading with blur placeholders

export interface RecipeImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  blurHash?: string;
  formats?: {
    webp?: string;
    avif?: string;
  };
}

// S3 Configuration
const S3_CONFIG = {
  bucketName: 'receptu-images',
  region: 'eu-north-1',
  baseUrl: 'https://receptu-images.s3.eu-north-1.amazonaws.com',
};

/**
 * Generate S3 URL for recipe image
 */
export function generateS3ImageUrl(filename: string, folder?: string): string {
  const path = folder ? `${folder}/${filename}` : filename;
  return `${S3_CONFIG.baseUrl}/${path}`;
}

/**
 * Create optimized image object for recipes
 */
export function createRecipeImage(
  filename: string,
  alt: string,
  width: number = 1200,
  height: number = 800,
  folder?: string
): RecipeImage {
  const src = generateS3ImageUrl(filename, folder);

  return {
    src,
    alt,
    width,
    height,
    // Future: Add blurHash generation
    // blurHash: generateBlurHash(src),
  };
}

/**
 * Generate blur placeholder for better loading experience
 * Simple base64 placeholder for now, can be enhanced with actual blur hash
 */
export function generateBlurPlaceholder(width: number = 1200, height: number = 800): string {
  // Simple SVG blur placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f3f4f6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e5e7eb;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" />
      <circle cx="50%" cy="40%" r="20" fill="#d1d5db" opacity="0.5"/>
      <rect x="30%" y="60%" width="40%" height="8" fill="#d1d5db" opacity="0.3" rx="4"/>
      <rect x="35%" y="72%" width="30%" height="6" fill="#d1d5db" opacity="0.2" rx="3"/>
    </svg>
  `;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Validate S3 image URL
 */
export function isValidS3ImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('receptu-images.s3') ||
           urlObj.hostname.includes('amazonaws.com');
  } catch {
    return false;
  }
}

/**
 * Get optimized image props for Next.js Image component
 */
export function getOptimizedImageProps(image: RecipeImage, priority: boolean = false) {
  return {
    src: image.src,
    alt: image.alt,
    width: image.width,
    height: image.height,
    priority,
    placeholder: 'blur' as const,
    blurDataURL: image.blurHash || generateBlurPlaceholder(image.width, image.height),
    sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
    quality: 85,
  };
}

/**
 * Convert legacy image format to new S3 format
 */
export function convertLegacyImageToS3(legacyImage: any): RecipeImage {
  // Handle different legacy formats
  if (typeof legacyImage === 'string') {
    // Simple string URL
    return createRecipeImage(
      legacyImage.split('/').pop() || 'placeholder.jpg',
      'Recipe image',
      1200,
      800
    );
  }

  // Handle new S3 format (already correct)
  if (legacyImage?.src) {
    return {
      src: legacyImage.src,
      alt: legacyImage.alt || 'Recipe image',
      width: legacyImage.width || 1200,
      height: legacyImage.height || 800,
      blurHash: legacyImage.blurHash,
      formats: legacyImage.formats,
    };
  }

  // Handle legacy format with 'url' property
  if (legacyImage?.url) {
    // Object with URL
    return {
      src: isValidS3ImageUrl(legacyImage.url)
        ? legacyImage.url
        : generateS3ImageUrl('placeholder.jpg'),
      alt: legacyImage.alt || 'Recipe image',
      width: legacyImage.width || 1200,
      height: legacyImage.height || 800,
    };
  }

  // Fallback
  return createRecipeImage('placeholder.jpg', 'Recipe image');
}

/**
 * Generate responsive image sizes for different use cases
 */
export const IMAGE_SIZES = {
  // Recipe card thumbnails
  thumbnail: {
    width: 400,
    height: 300,
    sizes: "(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
  },
  // Recipe detail page hero
  hero: {
    width: 1200,
    height: 800,
    sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
  },
  // Category page banners
  banner: {
    width: 1200,
    height: 400,
    sizes: "100vw"
  }
};

/**
 * Helper to create image object for different contexts
 */
export function createContextualImage(
  filename: string,
  alt: string,
  context: keyof typeof IMAGE_SIZES = 'hero',
  folder?: string
): RecipeImage {
  const size = IMAGE_SIZES[context];
  return createRecipeImage(filename, alt, size.width, size.height, folder);
}