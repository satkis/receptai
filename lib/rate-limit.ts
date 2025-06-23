// Rate limiting utility for API endpoints
// Implements sliding window rate limiting with memory storage

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 60 * 60 * 1000) { // 100 requests per hour by default
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    
    // Clean up expired entries every 10 minutes
    setInterval(() => this.cleanup(), 10 * 60 * 1000);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }

  private getKey(ip: string, endpoint?: string): string {
    return endpoint ? `${ip}:${endpoint}` : ip;
  }

  public check(ip: string, endpoint?: string): { allowed: boolean; remaining: number; resetTime: number } {
    const key = this.getKey(ip, endpoint);
    const now = Date.now();
    
    let entry = this.store.get(key);
    
    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired entry
      entry = {
        count: 1,
        resetTime: now + this.windowMs
      };
      this.store.set(key, entry);
      
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: entry.resetTime
      };
    }
    
    if (entry.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime
      };
    }
    
    entry.count++;
    this.store.set(key, entry);
    
    return {
      allowed: true,
      remaining: this.maxRequests - entry.count,
      resetTime: entry.resetTime
    };
  }
}

// Global rate limiter instance
const globalRateLimiter = new RateLimiter(
  parseInt(process.env.RATE_LIMIT_MAX || '100'),
  parseInt(process.env.RATE_LIMIT_WINDOW || '3600000') // 1 hour
);

// API-specific rate limiters
const apiRateLimiter = new RateLimiter(50, 60 * 60 * 1000); // 50 requests per hour for API
const searchRateLimiter = new RateLimiter(30, 60 * 60 * 1000); // 30 searches per hour

export function getClientIP(req: any): string {
  // Get real IP from various headers (for production with proxies)
  const forwarded = req.headers['x-forwarded-for'];
  const realIP = req.headers['x-real-ip'];
  const cfConnectingIP = req.headers['cf-connecting-ip']; // Cloudflare
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  return req.connection?.remoteAddress || req.socket?.remoteAddress || '127.0.0.1';
}

export function rateLimit(limiter: RateLimiter = globalRateLimiter) {
  return (req: any, res: any, next?: () => void) => {
    const ip = getClientIP(req);
    const endpoint = req.url?.split('?')[0]; // Remove query params for endpoint identification
    
    const result = limiter.check(ip, endpoint);
    
    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', limiter['maxRequests']);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000));
    
    if (!result.allowed) {
      res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
      });
      return;
    }
    
    if (next) {
      next();
    }
  };
}

// Export specific rate limiters
export const globalLimit = () => rateLimit(globalRateLimiter);
export const apiLimit = () => rateLimit(apiRateLimiter);
export const searchLimit = () => rateLimit(searchRateLimiter);

export default rateLimit;
