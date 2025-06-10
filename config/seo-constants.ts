// SEO Constants and Configuration
// Following Google's best practices for Lithuanian recipe website

export const SEO_CONFIG = {
  // Site Information
  siteName: 'Paragaujam.lt',
  siteDescription: 'Geriausi lietuviški receptai su interaktyviomis funkcijomis. Ruoškite skaniai ir lengvai kartu su mumis!',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://paragaujam.lt',
  defaultLanguage: 'lt',
  supportedLanguages: ['lt', 'en'],
  
  // Social Media
  social: {
    facebook: 'https://facebook.com/paragaujam',
    instagram: 'https://instagram.com/paragaujam',
    twitter: '@paragaujam',
  },
  
  // Contact Information
  contact: {
    email: 'info@paragaujam.lt',
    phone: '+370 600 12345',
  },
  
  // Organization Schema
  organization: {
    '@type': 'Organization',
    name: 'Paragaujam.lt',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://paragaujam.lt',
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://paragaujam.lt'}/images/logo.png`,
    description: 'Lietuviškų receptų svetainė su interaktyviomis funkcijomis',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+370 600 12345',
      contactType: 'customer service',
      availableLanguage: ['Lithuanian', 'English']
    },
    sameAs: [
      'https://facebook.com/paragaujam',
      'https://instagram.com/paragaujam'
    ]
  },
  
  // Default Meta Tags
  defaultMeta: {
    title: 'Paragaujam.lt - Lietuviški receptai',
    description: 'Geriausi lietuviški receptai su interaktyviomis funkcijomis. Ruoškite skaniai ir lengvai kartu su mumis!',
    keywords: [
      'lietuviški receptai',
      'receptai',
      'maistas',
      'gaminimas',
      'virtuvė',
      'patiekalai',
      'saldumynai',
      'sriubos',
      'kepsniai',
      'tradiciniai patiekalai'
    ],
    author: 'Paragaujam.lt',
    robots: 'index, follow',
    viewport: 'width=device-width, initial-scale=1',
    charset: 'utf-8'
  },
  
  // Open Graph Defaults
  openGraph: {
    type: 'website',
    locale: 'lt_LT',
    siteName: 'Paragaujam.lt',
    images: [
      {
        url: '/images/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Paragaujam.lt - Lietuviški receptai'
      }
    ]
  },
  
  // Twitter Card Defaults
  twitter: {
    card: 'summary_large_image',
    site: '@paragaujam',
    creator: '@paragaujam'
  },
  
  // Structured Data Templates
  structuredData: {
    website: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Paragaujam.lt',
      url: process.env.NEXT_PUBLIC_SITE_URL || 'https://paragaujam.lt',
      description: 'Lietuviškų receptų svetainė su interaktyviomis funkcijomis',
      inLanguage: 'lt',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://paragaujam.lt'}/receptai?search={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
      }
    }
  },
  
  // SEO Rules for Different Page Types
  pageTypes: {
    homepage: {
      titleTemplate: '%s - Lietuviški receptai',
      descriptionTemplate: 'Geriausi lietuviški receptai su interaktyviomis funkcijomis. %s',
      priority: 1.0,
      changefreq: 'daily'
    },
    category: {
      titleTemplate: '%s receptai - Paragaujam.lt',
      descriptionTemplate: 'Atraskite geriausius %s receptus. Paprasti ir skanūs patiekalai su detaliais gaminimo instrukcijomis.',
      priority: 0.8,
      changefreq: 'weekly'
    },
    subcategory: {
      titleTemplate: '%s - %s receptai | Paragaujam.lt',
      descriptionTemplate: '%s receptai kategorijoje %s. Išsamūs gaminimo instrukcijos ir ingredientų sąrašai.',
      priority: 0.7,
      changefreq: 'weekly'
    },
    recipe: {
      titleTemplate: '%s - Receptas | Paragaujam.lt',
      descriptionTemplate: '%s receptas su detaliais gaminimo instrukcijomis. Gaminimo laikas: %s min.',
      priority: 0.9,
      changefreq: 'monthly'
    }
  },
  
  // Lithuanian Keywords for SEO
  lithuanianKeywords: {
    cooking: ['gaminimas', 'ruošimas', 'kepimas', 'virimas', 'troškimas'],
    food: ['maistas', 'patiekalas', 'valgis', 'užkandis', 'desertas'],
    recipe: ['receptas', 'instrukcija', 'gaminimo būdas', 'receptūra'],
    ingredients: ['ingredientai', 'produktai', 'sudedamosios dalys'],
    time: ['laikas', 'trukmė', 'gaminimo laikas', 'paruošimo laikas'],
    difficulty: ['sudėtingumas', 'lengvumas', 'paprastumas'],
    cuisine: ['virtuvė', 'kulinarija', 'maisto kultūra']
  }
};

// Helper function to generate page-specific SEO data
export function generatePageSEO(
  pageType: keyof typeof SEO_CONFIG.pageTypes,
  data: {
    title?: string;
    description?: string;
    keywords?: string[];
    image?: string;
    url?: string;
    [key: string]: any;
  }
) {
  const config = SEO_CONFIG.pageTypes[pageType];
  const baseUrl = SEO_CONFIG.siteUrl;
  
  return {
    title: data.title ? config.titleTemplate.replace('%s', data.title) : SEO_CONFIG.defaultMeta.title,
    description: data.description || SEO_CONFIG.defaultMeta.description,
    keywords: [...SEO_CONFIG.defaultMeta.keywords, ...(data.keywords || [])],
    canonical: data.url ? `${baseUrl}${data.url}` : baseUrl,
    openGraph: {
      ...SEO_CONFIG.openGraph,
      title: data.title ? config.titleTemplate.replace('%s', data.title) : SEO_CONFIG.defaultMeta.title,
      description: data.description || SEO_CONFIG.defaultMeta.description,
      url: data.url ? `${baseUrl}${data.url}` : baseUrl,
      images: data.image ? [
        {
          url: data.image.startsWith('http') ? data.image : `${baseUrl}${data.image}`,
          width: 1200,
          height: 630,
          alt: data.title || SEO_CONFIG.defaultMeta.title
        }
      ] : SEO_CONFIG.openGraph.images
    },
    twitter: {
      ...SEO_CONFIG.twitter,
      title: data.title ? config.titleTemplate.replace('%s', data.title) : SEO_CONFIG.defaultMeta.title,
      description: data.description || SEO_CONFIG.defaultMeta.description,
      image: data.image ? (data.image.startsWith('http') ? data.image : `${baseUrl}${data.image}`) : `${baseUrl}/images/og-default.jpg`
    },
    sitemap: {
      priority: config.priority,
      changefreq: config.changefreq
    }
  };
}

// Lithuanian month names for dates
export const LITHUANIAN_MONTHS = [
  'sausio', 'vasario', 'kovo', 'balandžio', 'gegužės', 'birželio',
  'liepos', 'rugpjūčio', 'rugsėjo', 'spalio', 'lapkričio', 'gruodžio'
];

// Lithuanian day names
export const LITHUANIAN_DAYS = [
  'sekmadienis', 'pirmadienis', 'antradienis', 'trečiadienis', 
  'ketvirtadienis', 'penktadienis', 'šeštadienis'
];

// Common Lithuanian recipe terms for SEO
export const RECIPE_TERMS = {
  difficulty: {
    easy: 'lengvas',
    medium: 'vidutinis', 
    hard: 'sudėtingas'
  },
  time: {
    quick: 'greitas',
    medium: 'vidutinis',
    long: 'ilgas'
  },
  meal: {
    breakfast: 'pusryčiai',
    lunch: 'pietūs',
    dinner: 'vakarienė',
    snack: 'užkandis',
    dessert: 'desertas'
  }
};
