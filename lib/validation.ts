// Input validation utilities for API endpoints
// Provides sanitization and validation for user inputs

import { NextApiRequest } from 'next';

// Common validation patterns
const PATTERNS = {
  slug: /^[a-z0-9-]+$/,
  mongoId: /^[0-9a-fA-F]{24}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^https?:\/\/.+/,
  alphanumeric: /^[a-zA-Z0-9\s-_]+$/,
  lithuanian: /^[a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ0-9\s\-.,!?()]+$/,
};

// Sanitization functions
export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

export function sanitizeHTML(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function sanitizeSlug(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100);
}

// Validation functions
export function isValidSlug(slug: string): boolean {
  return typeof slug === 'string' && 
         slug.length > 0 && 
         slug.length <= 100 && 
         PATTERNS.slug.test(slug);
}

export function isValidMongoId(id: string): boolean {
  return typeof id === 'string' && PATTERNS.mongoId.test(id);
}

export function isValidEmail(email: string): boolean {
  return typeof email === 'string' && 
         email.length <= 254 && 
         PATTERNS.email.test(email);
}

export function isValidUrl(url: string): boolean {
  return typeof url === 'string' && 
         url.length <= 2048 && 
         PATTERNS.url.test(url);
}

export function isValidLithuanianText(text: string, maxLength: number = 1000): boolean {
  return typeof text === 'string' && 
         text.length > 0 && 
         text.length <= maxLength && 
         PATTERNS.lithuanian.test(text);
}

// Query parameter validation
export function validateQueryParams(req: NextApiRequest, schema: Record<string, any>): { 
  valid: boolean; 
  errors: string[]; 
  sanitized: Record<string, any> 
} {
  const errors: string[] = [];
  const sanitized: Record<string, any> = {};
  
  for (const [key, rules] of Object.entries(schema)) {
    const value = req.query[key];
    
    // Check if required
    if (rules.required && (!value || value === '')) {
      errors.push(`${key} is required`);
      continue;
    }
    
    // Skip validation if optional and not provided
    if (!rules.required && (!value || value === '')) {
      continue;
    }
    
    const stringValue = Array.isArray(value) ? value[0] : value;
    
    // Type validation
    switch (rules.type) {
      case 'string':
        if (typeof stringValue !== 'string') {
          errors.push(`${key} must be a string`);
          continue;
        }
        
        let sanitizedValue = sanitizeString(stringValue, rules.maxLength || 1000);
        
        if (rules.pattern && !rules.pattern.test(sanitizedValue)) {
          errors.push(`${key} has invalid format`);
          continue;
        }
        
        if (rules.minLength && sanitizedValue.length < rules.minLength) {
          errors.push(`${key} must be at least ${rules.minLength} characters`);
          continue;
        }
        
        sanitized[key] = sanitizedValue;
        break;
        
      case 'number':
        const numValue = parseInt(stringValue as string);
        if (isNaN(numValue)) {
          errors.push(`${key} must be a number`);
          continue;
        }
        
        if (rules.min !== undefined && numValue < rules.min) {
          errors.push(`${key} must be at least ${rules.min}`);
          continue;
        }
        
        if (rules.max !== undefined && numValue > rules.max) {
          errors.push(`${key} must be at most ${rules.max}`);
          continue;
        }
        
        sanitized[key] = numValue;
        break;
        
      case 'boolean':
        sanitized[key] = stringValue === 'true' || stringValue === '1';
        break;
        
      case 'array':
        const arrayValue = Array.isArray(value) ? value : [value];
        sanitized[key] = arrayValue.map(v => sanitizeString(v as string, rules.maxLength || 100));
        break;
        
      default:
        sanitized[key] = sanitizeString(stringValue as string);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    sanitized
  };
}

// Common validation schemas
export const VALIDATION_SCHEMAS = {
  recipeQuery: {
    slug: { type: 'string', required: true, pattern: PATTERNS.slug, maxLength: 100 },
    page: { type: 'number', min: 1, max: 1000 },
    limit: { type: 'number', min: 1, max: 50 },
  },
  
  searchQuery: {
    q: { type: 'string', required: true, minLength: 1, maxLength: 200 },
    page: { type: 'number', min: 1, max: 100 },
    limit: { type: 'number', min: 1, max: 20 },
    timeFilter: { type: 'string', maxLength: 50 },
    categoryFilter: { type: 'string', maxLength: 100 },
  },
  
  categoryQuery: {
    category: { type: 'string', required: true, pattern: PATTERNS.slug, maxLength: 100 },
    subcategory: { type: 'string', pattern: PATTERNS.slug, maxLength: 100 },
    page: { type: 'number', min: 1, max: 1000 },
    limit: { type: 'number', min: 1, max: 50 },
  }
};

// Middleware function for API validation
export function validateRequest(schema: Record<string, any>) {
  return (req: NextApiRequest, res: any, next: () => void) => {
    const validation = validateQueryParams(req, schema);
    
    if (!validation.valid) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid request parameters',
        details: validation.errors
      });
      return;
    }
    
    // Attach sanitized params to request
    (req as any).validatedQuery = validation.sanitized;
    next();
  };
}

export default validateRequest;
