// Performance Monitoring for Core Web Vitals and SEO
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

// Core Web Vitals tracking
export function initPerformanceMonitoring() {
  // Track Core Web Vitals
  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getFCP(sendToAnalytics);
  getLCP(sendToAnalytics);
  getTTFB(sendToAnalytics);
}

function sendToAnalytics(metric: any) {
  // Send to Google Analytics 4
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      non_interaction: true,
    });
  }

  // Send to custom analytics endpoint
  fetch('/api/analytics/web-vitals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: metric.name,
      value: metric.value,
      id: metric.id,
      url: window.location.href,
      timestamp: Date.now()
    })
  }).catch(console.error);
}

// SEO Performance Tracking
export class SEOPerformanceTracker {
  private static instance: SEOPerformanceTracker;
  
  static getInstance(): SEOPerformanceTracker {
    if (!SEOPerformanceTracker.instance) {
      SEOPerformanceTracker.instance = new SEOPerformanceTracker();
    }
    return SEOPerformanceTracker.instance;
  }

  // Track recipe page views
  trackRecipeView(recipeSlug: string, category: string) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'recipe_view', {
        event_category: 'Recipe',
        event_label: recipeSlug,
        custom_parameter_1: category
      });
    }
  }

  // Track search queries
  trackSearch(query: string, resultsCount: number) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'search', {
        search_term: query,
        event_category: 'Search',
        custom_parameter_1: resultsCount
      });
    }
  }

  // Track filter usage
  trackFilterUsage(filterType: string, filterValue: string) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'filter_use', {
        event_category: 'Filter',
        event_label: `${filterType}:${filterValue}`
      });
    }
  }

  // Track recipe interactions
  trackRecipeInteraction(action: 'ingredient_check' | 'step_complete' | 'save_recipe', recipeSlug: string) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', action, {
        event_category: 'Recipe Interaction',
        event_label: recipeSlug
      });
    }
  }
}

// Image loading performance
export function trackImagePerformance(imageSrc: string, loadTime: number) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'image_load_time', {
      event_category: 'Performance',
      event_label: imageSrc,
      value: Math.round(loadTime)
    });
  }
}

// Page load performance
export function trackPageLoadPerformance() {
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      const metrics = {
        dns_time: navigation.domainLookupEnd - navigation.domainLookupStart,
        connect_time: navigation.connectEnd - navigation.connectStart,
        request_time: navigation.responseStart - navigation.requestStart,
        response_time: navigation.responseEnd - navigation.responseStart,
        dom_load_time: navigation.domContentLoadedEventEnd - navigation.navigationStart,
        full_load_time: navigation.loadEventEnd - navigation.navigationStart
      };

      // Send to analytics
      if (window.gtag) {
        Object.entries(metrics).forEach(([key, value]) => {
          window.gtag('event', 'page_timing', {
            event_category: 'Performance',
            event_label: key,
            value: Math.round(value)
          });
        });
      }
    });
  }
}

// Search Console API integration
export async function submitUrlToSearchConsole(url: string) {
  try {
    const response = await fetch('/api/search-console/submit-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    
    return response.ok;
  } catch (error) {
    console.error('Failed to submit URL to Search Console:', error);
    return false;
  }
}

// Structured data validation
export async function validateStructuredData(url: string) {
  try {
    const response = await fetch('/api/seo/validate-structured-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to validate structured data:', error);
    return null;
  }
}
