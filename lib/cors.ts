// CORS (Cross-Origin Resource Sharing) configuration
// Secure CORS setup for API endpoints

import { NextApiRequest, NextApiResponse } from 'next';

interface CorsOptions {
  origin?: string | string[] | boolean;
  methods?: string[];
  allowedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

const DEFAULT_OPTIONS: CorsOptions = {
  origin: false, // Disable CORS by default for security
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control',
    'X-File-Name'
  ],
  credentials: false,
  maxAge: 86400 // 24 hours
};

// Allowed origins for different environments
const ALLOWED_ORIGINS = {
  development: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001', // For testing
  ],
  production: [
    'https://ragaujam.lt',
    'https://www.ragaujam.lt',
  ]
};

function getAllowedOrigins(): string[] {
  const env = process.env.NODE_ENV || 'development';
  return ALLOWED_ORIGINS[env as keyof typeof ALLOWED_ORIGINS] || ALLOWED_ORIGINS.development;
}

function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return false;
  
  const allowedOrigins = getAllowedOrigins();
  return allowedOrigins.includes(origin);
}

export function cors(options: CorsOptions = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  return (req: NextApiRequest, res: NextApiResponse, next?: () => void) => {
    const origin = req.headers.origin;
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      // Set CORS headers for preflight
      if (opts.origin === true || (origin && isOriginAllowed(origin))) {
        res.setHeader('Access-Control-Allow-Origin', origin || '*');
      }
      
      if (opts.credentials) {
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }
      
      if (opts.methods) {
        res.setHeader('Access-Control-Allow-Methods', opts.methods.join(', '));
      }
      
      if (opts.allowedHeaders) {
        res.setHeader('Access-Control-Allow-Headers', opts.allowedHeaders.join(', '));
      }
      
      if (opts.maxAge) {
        res.setHeader('Access-Control-Max-Age', opts.maxAge.toString());
      }
      
      res.status(204).end();
      return;
    }
    
    // Handle actual requests
    if (opts.origin === true) {
      res.setHeader('Access-Control-Allow-Origin', '*');
    } else if (opts.origin === false) {
      // CORS disabled - no headers set
    } else if (typeof opts.origin === 'string') {
      res.setHeader('Access-Control-Allow-Origin', opts.origin);
    } else if (Array.isArray(opts.origin)) {
      if (origin && opts.origin.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      }
    } else if (origin && isOriginAllowed(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    if (opts.credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    
    // Expose headers that client can access
    res.setHeader('Access-Control-Expose-Headers', [
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset'
    ].join(', '));
    
    if (next) {
      next();
    }
  };
}

// Predefined CORS configurations
export const publicCors = cors({
  origin: true, // Allow all origins for public APIs
  credentials: false,
});

export const restrictedCors = cors({
  origin: getAllowedOrigins(),
  credentials: false,
});

export const noCors = cors({
  origin: false, // No CORS headers
});

// API-specific CORS configurations
export const apiCors = cors({
  origin: getAllowedOrigins(),
  methods: ['GET', 'POST'],
  credentials: false,
});

export const searchCors = cors({
  origin: getAllowedOrigins(),
  methods: ['GET'],
  credentials: false,
});

export default cors;
