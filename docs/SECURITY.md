# 🔒 Security Implementation Guide

This document outlines the comprehensive security measures implemented in the Ragaujam.lt recipe website.

## 🛡️ Security Features Overview

### 1. **Security Headers**
Enhanced security headers implemented in `next.config.js`:

- **X-Frame-Options**: `DENY` - Prevents clickjacking attacks
- **X-Content-Type-Options**: `nosniff` - Prevents MIME type sniffing
- **X-XSS-Protection**: `1; mode=block` - Enables XSS filtering
- **Strict-Transport-Security**: HSTS with 1-year max-age and preload
- **Content-Security-Policy**: Comprehensive CSP with strict directives
- **Permissions-Policy**: Disables unnecessary browser features
- **Referrer-Policy**: `strict-origin-when-cross-origin`

### 2. **Content Security Policy (CSP)**
Strict CSP implementation:

```
default-src 'self';
script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
img-src 'self' data: https: blob:;
connect-src 'self' https://ragaujam-images.s3.eu-north-1.amazonaws.com;
frame-src 'none';
object-src 'none';
```

### 3. **Rate Limiting**
Multi-tier rate limiting system:

- **Global**: 100 requests/hour per IP
- **API**: 50 requests/hour per IP for API endpoints
- **Search**: 30 requests/hour per IP for search functionality

**Implementation**: `lib/rate-limit.ts`
- Sliding window algorithm
- Memory-based storage with automatic cleanup
- Per-endpoint rate limiting
- Proper HTTP headers (`X-RateLimit-*`)

### 4. **Input Validation**
Comprehensive input sanitization and validation:

**Features**:
- XSS prevention through HTML entity encoding
- SQL injection prevention (though using MongoDB)
- Lithuanian character support
- Slug validation with regex patterns
- Query parameter validation schemas

**Implementation**: `lib/validation.ts`
- Sanitization functions for strings, HTML, slugs
- Validation schemas for different API endpoints
- Type-safe parameter validation

### 5. **CORS Configuration**
Secure Cross-Origin Resource Sharing:

**Environments**:
- **Development**: `localhost:3000`, `127.0.0.1:3000`
- **Production**: `ragaujam.lt`, `www.ragaujam.lt`

**Features**:
- Origin validation
- Preflight request handling
- Credential control
- Method restrictions

**Implementation**: `lib/cors.ts`

### 6. **Security Middleware**
Unified security middleware combining all measures:

**Implementation**: `lib/security.ts`
- Composable security functions
- Pre-configured security profiles
- Method validation
- Error handling

## 🔧 Usage Examples

### Securing API Endpoints

```typescript
import { searchApiSecurity, recipeApiSecurity } from '../../../lib/security';

// Search API with rate limiting and validation
export default searchApiSecurity(async (req, res) => {
  // Handler implementation
});

// Recipe API with input validation
export default recipeApiSecurity(async (req, res) => {
  // Handler implementation
});
```

### Custom Security Configuration

```typescript
import { withSecurity } from '../../../lib/security';

export default withSecurity({
  rateLimit: 'api',
  cors: 'restricted',
  validation: 'recipeQuery',
  methods: ['GET', 'POST']
})(async (req, res) => {
  // Handler implementation
});
```

## 🚨 Security Monitoring

### Rate Limit Headers
All API responses include rate limiting information:

```
X-RateLimit-Limit: 50
X-RateLimit-Remaining: 47
X-RateLimit-Reset: 1640995200
```

### Error Responses
Standardized security error responses:

```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Please try again later.",
  "retryAfter": 3600
}
```

## 🔒 Environment Variables

Required security configuration in `.env.local`:

```env
# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=3600000

# Site Configuration
SITE_URL=https://ragaujam.lt
SITE_NAME=Ragaujam.lt
```

## 🛠️ Security Best Practices

### 1. **API Security**
- All API endpoints use security middleware
- Input validation on all user inputs
- Proper error handling without information leakage
- Rate limiting to prevent abuse

### 2. **Data Security**
- MongoDB connection with authentication
- No sensitive data in client-side code
- Proper environment variable management
- Secure image handling with S3

### 3. **Client Security**
- CSP prevents XSS attacks
- HSTS enforces HTTPS
- No inline scripts (except necessary for analytics)
- Secure cookie settings

## 🔍 Security Testing

### Manual Testing
1. **Rate Limiting**: Make rapid requests to test limits
2. **Input Validation**: Try malicious inputs
3. **CORS**: Test cross-origin requests
4. **Headers**: Verify security headers in browser dev tools

### Automated Testing
Consider implementing:
- Security header testing
- Rate limit testing
- Input validation testing
- CORS testing

## 📋 Security Checklist

- [x] Security headers implemented
- [x] CSP configured and tested
- [x] Rate limiting active
- [x] Input validation in place
- [x] CORS properly configured
- [x] NextAuth removed completely
- [x] Environment variables secured
- [x] Error handling standardized
- [x] API endpoints secured
- [x] Documentation complete

## 🚀 Production Deployment

### Additional Security for Production
1. **SSL/TLS**: Ensure HTTPS is enforced
2. **Firewall**: Configure server-level firewall
3. **Monitoring**: Set up security monitoring
4. **Backups**: Secure database backups
5. **Updates**: Regular dependency updates

### Vercel Security
When deploying to Vercel:
- Environment variables are encrypted
- Automatic HTTPS
- DDoS protection included
- Edge network security

## 📞 Security Incident Response

In case of security issues:
1. **Immediate**: Block malicious IPs if possible
2. **Assessment**: Determine scope of issue
3. **Mitigation**: Apply temporary fixes
4. **Resolution**: Implement permanent solution
5. **Review**: Update security measures

---

**Last Updated**: June 2025
**Security Level**: Production Ready ✅
