// Centralized site configuration
export const SITE_CONFIG = {
  name: 'Ragaujam.lt',
  domain: 'ragaujam.lt',
  url: 'https://ragaujam.lt',
  description: 'Lietuviški receptai ir kulinarijos patarimai. Atraskite skonius su Ragaujam.lt',
  locale: 'lt',
  author: 'Ragaujam.lt',
  
  // Database
  database: {
    name: 'receptai',
    collections: {
      recipes: 'recipes_new',
      categories: 'categories_new',
      groups: 'groups'
    }
  },
  
  // SEO
  seo: {
    titleTemplate: '%s | Ragaujam.lt',
    defaultTitle: 'Ragaujam.lt - Lietuviški receptai',
    keywords: [
      'lietuviški receptai',
      'receptų svetainė', 
      'gaminimas',
      'virtuvė',
      'kulinarija',
      'maistas'
    ]
  },
  
  // Performance
  performance: {
    imageCacheTTL: 31536000, // 1 year
    apiCacheTTL: 300, // 5 minutes
    sitemapCacheTTL: 86400 // 24 hours
  },
  
  // Social
  social: {
    ogImage: '/og-image.jpg',
    twitterHandle: '@ragaujam'
  }
} as const;

export type SiteConfig = typeof SITE_CONFIG;
