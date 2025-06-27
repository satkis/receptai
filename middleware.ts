// Next.js Middleware for Test Environment Protection
// Protects test.ragaujam.lt from public access

import { NextRequest, NextResponse } from 'next/server';

// Get client IP address
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  return request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
}

// Check if IP is whitelisted
function isIPWhitelisted(ip: string): boolean {
  const allowedIPs = process.env.ALLOWED_IPS?.split(',').map(ip => ip.trim()) || [];
  return allowedIPs.includes(ip) || allowedIPs.includes('*');
}

// Check if request has valid password
function hasValidPassword(request: NextRequest): boolean {
  const password = request.cookies.get('test-auth')?.value;
  const validPassword = process.env.VERCEL_PASSWORD;
  
  return password === validPassword;
}

// Create password protection page
function createPasswordPage(): string {
  return `
    <!DOCTYPE html>
    <html lang="lt">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Test Environment - Ragaujam.lt</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          margin: 0;
          padding: 0;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .container {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          max-width: 400px;
          width: 90%;
          text-align: center;
        }
        .logo {
          font-size: 2rem;
          font-weight: bold;
          color: #333;
          margin-bottom: 0.5rem;
        }
        .subtitle {
          color: #666;
          margin-bottom: 2rem;
          font-size: 0.9rem;
        }
        .form-group {
          margin-bottom: 1.5rem;
          text-align: left;
        }
        label {
          display: block;
          margin-bottom: 0.5rem;
          color: #333;
          font-weight: 500;
        }
        input[type="password"] {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e1e5e9;
          border-radius: 6px;
          font-size: 1rem;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }
        input[type="password"]:focus {
          outline: none;
          border-color: #667eea;
        }
        button {
          width: 100%;
          padding: 0.75rem;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }
        button:hover {
          background: #5a6fd8;
        }
        .error {
          color: #e74c3c;
          font-size: 0.9rem;
          margin-top: 0.5rem;
        }
        .info {
          background: #f8f9fa;
          padding: 1rem;
          border-radius: 6px;
          margin-top: 1.5rem;
          font-size: 0.85rem;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">🧪 Ragaujam.lt</div>
        <div class="subtitle">Test Environment</div>
        
        <form method="POST" action="/api/test-auth">
          <div class="form-group">
            <label for="password">Slaptažodis:</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              placeholder="Įveskite test aplinkos slaptažodį"
              required
              autocomplete="current-password"
            />
          </div>
          
          <button type="submit">Prisijungti</button>
        </form>
        
        <div class="info">
          <strong>🔒 Privati test aplinka</strong><br>
          Ši aplinka skirta tik testavimui ir nėra prieinama viešai.
          Jei neturite slaptažodžio, kreipkitės į administratorių.
        </div>
      </div>
    </body>
    </html>
  `;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';
  
  // Only apply protection to test environment
  if (!hostname.includes('test.ragaujam.lt') && process.env.NODE_ENV !== 'test') {
    return NextResponse.next();
  }
  
  // Skip protection for API auth endpoint
  if (pathname === '/api/test-auth') {
    return NextResponse.next();
  }
  
  // Skip protection for static assets
  if (pathname.startsWith('/_next/') || 
      pathname.startsWith('/favicon') || 
      pathname.startsWith('/images/') ||
      pathname.includes('.')) {
    return NextResponse.next();
  }
  
  const clientIP = getClientIP(request);
  
  // Check IP whitelist if enabled
  if (process.env.ENABLE_IP_WHITELIST === 'true') {
    if (!isIPWhitelisted(clientIP)) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
        <head><title>Access Denied</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 2rem;">
          <h1>🚫 Prieiga uždrausta</h1>
          <p>Jūsų IP adresas (${clientIP}) neturi prieigos prie šios test aplinkos.</p>
          <p>Kreipkitės į administratorių dėl prieigos.</p>
        </body>
        </html>
        `,
        { 
          status: 403,
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        }
      );
    }
  }
  
  // Check password protection if enabled
  if (process.env.VERCEL_PASSWORD_PROTECT === 'true') {
    if (!hasValidPassword(request)) {
      return new NextResponse(createPasswordPage(), {
        status: 401,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }
  }
  
  // Allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
  // Run on Edge Runtime for Lithuanian users
  runtime: 'edge',
};
