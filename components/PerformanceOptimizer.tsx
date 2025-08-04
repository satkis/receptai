// Performance optimization component for single-visit users
import Head from 'next/head';

interface PerformanceOptimizerProps {
  preloadImages?: string[];
  preconnectDomains?: string[];
  criticalCSS?: string;
  pageType?: 'recipe' | 'category' | 'homepage';
}

export default function PerformanceOptimizer({
  preloadImages = [],
  preconnectDomains = [],
  criticalCSS,
  pageType = 'homepage'
}: PerformanceOptimizerProps) {
  
  // Default domains to preconnect for faster loading
  const defaultPreconnectDomains = [
    'https://receptu-images.s3.eu-north-1.amazonaws.com',
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com'
  ];

  const allPreconnectDomains = [...defaultPreconnectDomains, ...preconnectDomains];

  return (
    <Head>
      {/* DNS prefetch for faster domain resolution */}
      {allPreconnectDomains.map(domain => (
        <link key={domain} rel="dns-prefetch" href={domain} />
      ))}
      
      {/* Preconnect for critical domains */}
      {allPreconnectDomains.map(domain => (
        <link key={`preconnect-${domain}`} rel="preconnect" href={domain} crossOrigin="" />
      ))}
      
      {/* Preload critical images */}
      {preloadImages.map((imageUrl, index) => (
        <link
          key={imageUrl}
          rel="preload"
          as="image"
          href={imageUrl}
          // Only mark first image as high priority
          fetchPriority={index === 0 ? "high" : "low"}
        />
      ))}
      
      {/* Critical CSS inlining for faster rendering */}
      {criticalCSS && (
        <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
      )}
      
      {/* Resource hints based on page type */}
      {pageType === 'recipe' && (
        <>
          {/* Preload recipe-specific resources */}
          <link rel="prefetch" href="/api/recipes/related" />
          <link rel="modulepreload" href="/_next/static/chunks/recipe-page.js" />
        </>
      )}
      
      {pageType === 'category' && (
        <>
          {/* Preload category-specific resources */}
          <link rel="prefetch" href="/api/categories/filters" />
          <link rel="modulepreload" href="/_next/static/chunks/category-page.js" />
        </>
      )}
      
      {pageType === 'homepage' && (
        <>
          {/* Preload homepage-specific resources */}
          <link rel="prefetch" href="/api/recipes/featured" />
          <link rel="modulepreload" href="/_next/static/chunks/homepage.js" />
        </>
      )}
      
      {/* Performance optimization meta tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      <meta httpEquiv="x-dns-prefetch-control" content="on" />
      
      {/* Optimize for mobile performance */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      
      {/* Preload critical fonts */}
      <link
        rel="preload"
        href="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2"
        as="font"
        type="font/woff2"
        crossOrigin=""
      />
    </Head>
  );
}

// Recipe-specific performance optimizer
export function RecipePerformanceOptimizer({ 
  recipeImage, 
  relatedImages = [] 
}: { 
  recipeImage?: string; 
  relatedImages?: string[];
}) {
  const preloadImages = recipeImage ? [recipeImage, ...relatedImages.slice(0, 2)] : relatedImages.slice(0, 3);
  
  return (
    <PerformanceOptimizer
      pageType="recipe"
      preloadImages={preloadImages}
    />
  );
}

// Category-specific performance optimizer
export function CategoryPerformanceOptimizer({ 
  categoryImages = [] 
}: { 
  categoryImages?: string[];
}) {
  return (
    <PerformanceOptimizer
      pageType="category"
      preloadImages={categoryImages.slice(0, 4)} // Preload first 4 recipe images
    />
  );
}

// Homepage performance optimizer
export function HomepagePerformanceOptimizer({ 
  featuredImages = [] 
}: { 
  featuredImages?: string[];
}) {
  return (
    <PerformanceOptimizer
      pageType="homepage"
      preloadImages={featuredImages.slice(0, 6)} // Preload first 6 featured recipe images
    />
  );
}
