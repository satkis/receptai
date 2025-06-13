// Performance monitoring utilities for Lithuanian recipe website

export interface PerformanceMetrics {
  searchTime: number;
  totalResults: number;
  pageLoadTime: number;
  imageLoadTime?: number;
  databaseQueryTime?: number;
}

export interface CoreWebVitals {
  LCP: number; // Largest Contentful Paint
  FID: number; // First Input Delay  
  CLS: number; // Cumulative Layout Shift
}

// Performance targets for Lithuanian recipe website
export const PERFORMANCE_TARGETS = {
  searchResponseTime: 200, // ms
  pageLoadTime: 500,       // ms
  imageLoadTime: 1000,     // ms
  databaseQueryTime: 100,  // ms
  LCP: 2500,              // ms
  FID: 100,               // ms
  CLS: 0.1                // score
};

/**
 * Measure database query performance
 */
export function measureDatabaseQuery<T>(
  queryFunction: () => Promise<T>
): Promise<{ result: T; queryTime: number }> {
  return new Promise(async (resolve, reject) => {
    const startTime = Date.now();
    
    try {
      const result = await queryFunction();
      const queryTime = Date.now() - startTime;
      
      // Log slow queries for optimization
      if (queryTime > PERFORMANCE_TARGETS.databaseQueryTime) {
        console.warn(`Slow database query detected: ${queryTime}ms`);
      }
      
      resolve({ result, queryTime });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Measure search performance
 */
export function measureSearchPerformance<T>(
  searchFunction: () => Promise<T>
): Promise<{ result: T; searchTime: number }> {
  return new Promise(async (resolve, reject) => {
    const startTime = Date.now();
    
    try {
      const result = await searchFunction();
      const searchTime = Date.now() - startTime;
      
      // Log slow searches for optimization
      if (searchTime > PERFORMANCE_TARGETS.searchResponseTime) {
        console.warn(`Slow search detected: ${searchTime}ms`);
      }
      
      resolve({ result, searchTime });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generate performance headers for API responses
 */
export function generatePerformanceHeaders(metrics: Partial<PerformanceMetrics>): Record<string, string> {
  const headers: Record<string, string> = {};
  
  if (metrics.searchTime !== undefined) {
    headers['X-Search-Time'] = metrics.searchTime.toString();
  }
  
  if (metrics.totalResults !== undefined) {
    headers['X-Total-Results'] = metrics.totalResults.toString();
  }
  
  if (metrics.databaseQueryTime !== undefined) {
    headers['X-DB-Query-Time'] = metrics.databaseQueryTime.toString();
  }
  
  // Add cache headers for better performance
  headers['Cache-Control'] = 'public, s-maxage=300, stale-while-revalidate=600';
  
  return headers;
}

/**
 * Log performance metrics for monitoring
 */
export function logPerformanceMetrics(
  operation: string, 
  metrics: Partial<PerformanceMetrics>,
  context?: Record<string, any>
): void {
  const logData = {
    timestamp: new Date().toISOString(),
    operation,
    metrics,
    context,
    environment: process.env.NODE_ENV
  };
  
  // In production, this would send to monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Send to monitoring service (e.g., DataDog, New Relic)
    console.log('PERFORMANCE_METRIC:', JSON.stringify(logData));
  } else {
    console.log('Performance:', operation, metrics);
  }
}

/**
 * Check if performance meets targets
 */
export function checkPerformanceTargets(metrics: Partial<PerformanceMetrics>): {
  passed: boolean;
  failures: string[];
} {
  const failures: string[] = [];
  
  if (metrics.searchTime && metrics.searchTime > PERFORMANCE_TARGETS.searchResponseTime) {
    failures.push(`Search time ${metrics.searchTime}ms exceeds target ${PERFORMANCE_TARGETS.searchResponseTime}ms`);
  }
  
  if (metrics.pageLoadTime && metrics.pageLoadTime > PERFORMANCE_TARGETS.pageLoadTime) {
    failures.push(`Page load time ${metrics.pageLoadTime}ms exceeds target ${PERFORMANCE_TARGETS.pageLoadTime}ms`);
  }
  
  if (metrics.databaseQueryTime && metrics.databaseQueryTime > PERFORMANCE_TARGETS.databaseQueryTime) {
    failures.push(`Database query time ${metrics.databaseQueryTime}ms exceeds target ${PERFORMANCE_TARGETS.databaseQueryTime}ms`);
  }
  
  return {
    passed: failures.length === 0,
    failures
  };
}

/**
 * Generate performance report for Lithuanian recipe searches
 */
export function generatePerformanceReport(
  searchTerm: string,
  metrics: PerformanceMetrics
): string {
  const targetCheck = checkPerformanceTargets(metrics);
  
  return `
Performance Report - Lithuanian Recipe Search
============================================
Search Term: "${searchTerm}"
Search Time: ${metrics.searchTime}ms (target: <${PERFORMANCE_TARGETS.searchResponseTime}ms)
Total Results: ${metrics.totalResults}
Page Load Time: ${metrics.pageLoadTime}ms (target: <${PERFORMANCE_TARGETS.pageLoadTime}ms)
Database Query Time: ${metrics.databaseQueryTime || 'N/A'}ms

Performance Status: ${targetCheck.passed ? '✅ PASSED' : '❌ FAILED'}
${targetCheck.failures.length > 0 ? 'Issues:\n' + targetCheck.failures.map(f => `- ${f}`).join('\n') : ''}

Recommendations:
${metrics.searchTime > PERFORMANCE_TARGETS.searchResponseTime ? '- Optimize search indexes for Lithuanian text\n' : ''}
${metrics.totalResults > 1000 ? '- Consider pagination for large result sets\n' : ''}
${metrics.databaseQueryTime && metrics.databaseQueryTime > PERFORMANCE_TARGETS.databaseQueryTime ? '- Optimize database queries\n' : ''}
  `.trim();
}

/**
 * Client-side performance measurement (for use in components)
 */
export function measureClientPerformance(): {
  measureLCP: () => void;
  measureFID: () => void;
  measureCLS: () => void;
} {
  return {
    measureLCP: () => {
      if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          console.log('LCP:', lastEntry.startTime);
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      }
    },
    
    measureFID: () => {
      if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            console.log('FID:', entry.processingStart - entry.startTime);
          });
        });
        observer.observe({ entryTypes: ['first-input'] });
      }
    },
    
    measureCLS: () => {
      if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              console.log('CLS:', clsValue);
            }
          });
        });
        observer.observe({ entryTypes: ['layout-shift'] });
      }
    }
  };
}
