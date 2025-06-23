// Comprehensive security middleware for API endpoints
// Combines rate limiting, CORS, input validation, and security headers

import { NextApiRequest, NextApiResponse } from 'next';
import { rateLimit, apiLimit, searchLimit } from './rate-limit';
import { cors, apiCors, searchCors, noCors } from './cors';
import { validateRequest, VALIDATION_SCHEMAS } from './validation';

export interface SecurityOptions {
  rateLimit?: 'global' | 'api' | 'search' | 'none';
  cors?: 'public' | 'restricted' | 'api' | 'search' | 'none';
  validation?: keyof typeof VALIDATION_SCHEMAS | Record<string, any> | 'none';
  methods?: string[];
}

// Security middleware composer
export function withSecurity(options: SecurityOptions = {}) {
  const {
    rateLimit: rateLimitType = 'api',
    cors: corsType = 'api',
    validation: validationType = 'none',
    methods = ['GET', 'POST']
  } = options;

  return (handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      // Method validation
      if (!methods.includes(req.method || '')) {
        res.setHeader('Allow', methods.join(', '));
        res.status(405).json({
          error: 'Method Not Allowed',
          message: `Method ${req.method} not allowed. Allowed methods: ${methods.join(', ')}`
        });
        return;
      }

      // Apply security headers
      applySecurityHeaders(res);

      // Apply CORS
      const corsMiddleware = getCorsMiddleware(corsType);
      if (corsMiddleware) {
        await new Promise<void>((resolve) => {
          corsMiddleware(req, res, resolve);
        });
        
        // If it was a preflight request, it's already handled
        if (req.method === 'OPTIONS') {
          return;
        }
      }

      // Apply rate limiting
      const rateLimitMiddleware = getRateLimitMiddleware(rateLimitType);
      if (rateLimitMiddleware) {
        await new Promise<void>((resolve, reject) => {
          rateLimitMiddleware(req, res, () => {
            if (res.headersSent) {
              reject(new Error('Rate limit exceeded'));
            } else {
              resolve();
            }
          });
        }).catch(() => {
          // Rate limit exceeded, response already sent
          return;
        });
      }

      // Apply input validation
      if (validationType !== 'none') {
        const validationSchema = typeof validationType === 'string' 
          ? VALIDATION_SCHEMAS[validationType]
          : validationType;
          
        if (validationSchema) {
          await new Promise<void>((resolve, reject) => {
            const validationMiddleware = validateRequest(validationSchema);
            validationMiddleware(req, res, () => {
              if (res.headersSent) {
                reject(new Error('Validation failed'));
              } else {
                resolve();
              }
            });
          }).catch(() => {
            // Validation failed, response already sent
            return;
          });
        }
      }

      // If response was already sent by middleware, don't continue
      if (res.headersSent) {
        return;
      }

      // Execute the actual handler
      try {
        await handler(req, res);
      } catch (error) {
        console.error('API Error:', error);
        
        if (!res.headersSent) {
          res.status(500).json({
            error: 'Internal Server Error',
            message: 'An unexpected error occurred'
          });
        }
      }
    };
  };
}

function applySecurityHeaders(res: NextApiResponse): void {
  // Additional API-specific security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Prevent caching of sensitive API responses
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
}

function getCorsMiddleware(type: string) {
  switch (type) {
    case 'api':
      return apiCors;
    case 'search':
      return searchCors;
    case 'public':
      return cors({ origin: true });
    case 'restricted':
      return cors({ origin: false });
    case 'none':
      return noCors;
    default:
      return apiCors;
  }
}

function getRateLimitMiddleware(type: string) {
  switch (type) {
    case 'global':
      return rateLimit();
    case 'api':
      return apiLimit();
    case 'search':
      return searchLimit();
    case 'none':
      return null;
    default:
      return apiLimit();
  }
}

// Predefined security configurations
export const publicApiSecurity = withSecurity({
  rateLimit: 'api',
  cors: 'public',
  validation: 'none',
  methods: ['GET']
});

export const searchApiSecurity = withSecurity({
  rateLimit: 'search',
  cors: 'search',
  validation: 'searchQuery',
  methods: ['GET']
});

export const recipeApiSecurity = withSecurity({
  rateLimit: 'api',
  cors: 'api',
  validation: 'recipeQuery',
  methods: ['GET']
});

export const categoryApiSecurity = withSecurity({
  rateLimit: 'api',
  cors: 'api',
  validation: 'categoryQuery',
  methods: ['GET']
});

export const restrictedApiSecurity = withSecurity({
  rateLimit: 'api',
  cors: 'restricted',
  validation: 'none',
  methods: ['GET', 'POST']
});

export default withSecurity;
