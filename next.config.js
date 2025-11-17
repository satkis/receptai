/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Internationalization - DISABLED
  // i18n routing is NOT needed since we only support Lithuanian
  // Enabling i18n causes automatic /lt/ prefix which breaks redirects
  // i18n: {
  //   locales: ['lt'],
  //   defaultLocale: 'lt',
  //   localeDetection: false,
  // },

  // Image optimization for recipe photos and static assets
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ragaujam.s3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'ragaujam-cdn.s3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'receptu-images.s3.eu-north-1.amazonaws.com',
        pathname: '/receptai/**', // Recipe images folder
      },
      {
        protocol: 'https',
        hostname: 'receptu-images.s3.eu-north-1.amazonaws.com',
        pathname: '/static/**', // Static assets (logos, favicons, etc.)
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year cache for recipe images
    dangerouslyAllowSVG: true, // Allow SVG for logos/icons in static folder
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: false, // Enable optimization
    loader: 'default', // Use default loader
    // Fallback for external images that can't be optimized
    dangerouslyAllowSVG: true,
  },

  // Performance optimizations for single-visit users
  experimental: {
    scrollRestoration: true,
    optimizePackageImports: ['lucide-react'],
    // CSS optimization disabled - requires additional dependencies
    // optimizeCss: true,
    optimizeServerReact: true,
  },

  // SWC minification is enabled by default in Next.js 15+

  // Redirects - Server-side, no performance impact
  async redirects() {
    return [
      {
        source: '/',
        destination: '/receptai',
        permanent: false, // 307 temporary redirect to avoid browser caching issues
      },
    ];
  },

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: true,
  },

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: true,
  },

  // Enhanced security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Security Headers
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          // HSTS (HTTP Strict Transport Security)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              "media-src 'self' https:",
              "connect-src 'self' https://www.google-analytics.com https://ragaujam-images.s3.eu-north-1.amazonaws.com https://receptu-images.s3.eu-north-1.amazonaws.com",
              "frame-src 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests"
            ].join('; '),
          },
          // Permissions Policy (Feature Policy)
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
          },
        ],
      },
      // Cache static assets aggressively
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache API responses - optimized for single-visit users
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=86400, max-age=60',
          },
        ],
      },
      // Cache recipe pages aggressively at CDN level
      {
        source: '/receptas/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=86400, max-age=300',
          },
        ],
      },
      // Cache category pages
      {
        source: '/receptai/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=7200, stale-while-revalidate=86400, max-age=600',
          },
        ],
      },
    ];
  },

  // Environment variables
  env: {
    SITE_URL: process.env.SITE_URL || 'https://ragaujam.lt',
    SITE_NAME: 'Ragaujam.lt',
  },
};

module.exports = nextConfig;
