// Canonical URL utilities for SEO optimization
// Ensures consistent canonical URLs across all pages

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ragaujam.lt';

/**
 * Generate canonical URL for recipe pages
 * Always uses clean URL without query parameters
 */
export function getRecipeCanonicalUrl(slug: string): string {
  return `${SITE_URL}/receptas/${slug}`;
}

/**
 * Generate canonical URL for category pages
 * Uses the category path from database
 */
export function getCategoryCanonicalUrl(categoryPath: string): string {
  // Remove leading slash if present
  const cleanPath = categoryPath.startsWith('/') ? categoryPath.slice(1) : categoryPath;
  return `${SITE_URL}/${cleanPath}`;
}

/**
 * Generate canonical URL for search pages
 * Includes the search query parameter
 */
export function getSearchCanonicalUrl(query: string): string {
  if (!query || query.trim() === '') {
    return `${SITE_URL}/paieska`;
  }
  return `${SITE_URL}/paieska?q=${encodeURIComponent(query.trim())}`;
}

/**
 * Generate canonical URL for homepage
 */
export function getHomepageCanonicalUrl(): string {
  return `${SITE_URL}/receptai`; // Homepage redirects to /receptai
}

/**
 * Clean URL by removing tracking parameters and fragments
 * Used to ensure canonical URLs are clean
 */
export function cleanUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    
    // Remove common tracking parameters
    const trackingParams = ['from', 'utm_source', 'utm_medium', 'utm_campaign', 'fbclid', 'gclid'];
    trackingParams.forEach(param => {
      urlObj.searchParams.delete(param);
    });
    
    // Remove fragment
    urlObj.hash = '';
    
    return urlObj.toString();
  } catch (error) {
    // If URL parsing fails, return original
    return url;
  }
}

/**
 * Validate if URL is canonical (no tracking params, clean format)
 */
export function isCanonicalUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    
    // Check for tracking parameters
    const trackingParams = ['from', 'utm_source', 'utm_medium', 'utm_campaign', 'fbclid', 'gclid'];
    const hasTrackingParams = trackingParams.some(param => urlObj.searchParams.has(param));
    
    // Check for fragment
    const hasFragment = urlObj.hash !== '';
    
    return !hasTrackingParams && !hasFragment;
  } catch (error) {
    return false;
  }
}

/**
 * Generate all canonical URLs for sitemap
 */
export function generateSitemapUrls() {
  return {
    homepage: getHomepageCanonicalUrl(),
    search: `${SITE_URL}/paieska`,
    // Recipe and category URLs are generated dynamically in sitemap
  };
}
