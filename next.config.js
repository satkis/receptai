/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Internationalization - Lithuanian focus
  i18n: {
    locales: ['lt'],
    defaultLocale: 'lt',
    localeDetection: false,
  },

  // Image optimization for recipe photos
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'paragaujam.s3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'paragaujam-cdn.s3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'receptu-images.s3.eu-north-1.amazonaws.com',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year cache for recipe images
  },

  // Performance optimizations
  experimental: {
    scrollRestoration: true,
  },

  // Redirects - Server-side, no performance impact
  async redirects() {
    return [
      {
        source: '/',
        destination: '/receptai',
        permanent: true, // 301 redirect for SEO
      },
    ];
  },

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Headers for SEO and security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
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
      // Cache API responses
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=600',
          },
        ],
      },
    ];
  },

  // Environment variables
  env: {
    SITE_URL: process.env.SITE_URL || 'https://paragaujam.lt',
    SITE_NAME: 'Paragaujam.lt',
  },
};

module.exports = nextConfig;
