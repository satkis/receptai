import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="lt" dir="ltr">
      <Head>
        {/* Critical performance optimizations */}
        <meta httpEquiv="x-dns-prefetch-control" content="on" />

        {/* DNS Prefetch for performance */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />

        {/* Preconnect to critical domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* url ownership - google search console */}
        <meta name="google-site-verification" content="M10eblvn_OWYGXcV68vhNx8Lxst88O4OruRN5tvR610" />

        {/* Google Analytics 4 - Load from environment variable */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}></script>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                    'page_path': window.location.pathname,
                    'page_title': document.title
                  });
                  console.log('Google Analytics initialized with ID: ${process.env.NEXT_PUBLIC_GA_ID}');
                `,
              }}
            />
          </>
        )}

        {/* Optimized font loading - preload most critical weights only */}
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
          as="style"
          onLoad="this.onload=null;this.rel='stylesheet'"
        />
        <noscript>
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
            rel="stylesheet"
          />
        </noscript>

        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&display=swap"
          as="style"
          onLoad="this.onload=null;this.rel='stylesheet'"
        />
        <noscript>
          <link
            href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&display=swap"
            rel="stylesheet"
          />
        </noscript>

        {/* Security headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />

        {/* Performance hints */}
        <meta httpEquiv="Accept-CH" content="DPR, Viewport-Width, Width" />

        {/* Preload critical logo assets */}
        <link rel="preload" href="/logo/logo-main.png" as="image" />
        <link rel="preload" href="/logo/logo-compact.png" as="image" />

        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#f97316" />
        <meta name="msapplication-TileColor" content="#f97316" />

        {/* Apple-specific meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Ragaujam.lt" />

        {/* Microsoft-specific meta tags */}
        <meta name="msapplication-config" content="/browserconfig.xml" />

        {/* Structured data for organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Ragaujam.lt',
              url: process.env.NEXT_PUBLIC_SITE_URL || 'https://ragaujam.lt',
              logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ragaujam.lt'}/logo/logo-main.png`,
              description: 'Lietuviškų receptų svetainė su interaktyviomis funkcijomis',
              contactPoint: {
                '@type': 'ContactPoint',
                email: 'ragaujam1@gmail.com',
                contactType: 'customer service',
                availableLanguage: ['Lithuanian']
              },
              sameAs: [
                'https://facebook.com/ragaujam',
                'https://instagram.com/ragaujam'
              ]
            })
          }}
        />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />

        {/* No-JS fallback message */}
        <noscript>
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: '#f97316',
            color: 'white',
            padding: '10px',
            textAlign: 'center',
            zIndex: 9999
          }}>
            Šiai svetainei reikalingas JavaScript. Prašome įjungti JavaScript savo naršyklėje.
          </div>
        </noscript>
      </body>
    </Html>
  );
}
