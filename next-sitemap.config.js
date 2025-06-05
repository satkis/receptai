/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://paragaujam.lt',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: [
    '/admin/*',
    '/api/*',
    '/auth/*',
    '/profile/*',
    '/server-sitemap-index.xml',
  ],
  additionalPaths: async (config) => {
    const result = [];

    // Add dynamic recipe pages
    // In production, you would fetch actual recipe slugs from your database
    const recipePages = [
      '/recipes/cepelinai-su-mesa',
      '/recipes/saltibarsciai-su-bulvemis',
      '/recipes/kugelis-tradicinis',
    ];

    recipePages.forEach((page) => {
      result.push({
        loc: page,
        changefreq: 'weekly',
        priority: 0.8,
        lastmod: new Date().toISOString(),
      });
    });

    return result;
  },
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/auth/', '/profile/'],
      },
    ],
    additionalSitemaps: [
      `${process.env.SITE_URL || 'https://paragaujam.lt'}/server-sitemap-index.xml`,
    ],
  },
  transform: async (config, path) => {
    // Custom priority and changefreq for different page types
    if (path === '/') {
      return {
        loc: path,
        changefreq: 'daily',
        priority: 1.0,
        lastmod: new Date().toISOString(),
      };
    }

    if (path.startsWith('/recipes/')) {
      return {
        loc: path,
        changefreq: 'weekly',
        priority: 0.8,
        lastmod: new Date().toISOString(),
      };
    }

    if (path.startsWith('/categories/')) {
      return {
        loc: path,
        changefreq: 'weekly',
        priority: 0.7,
        lastmod: new Date().toISOString(),
      };
    }

    // Default
    return {
      loc: path,
      changefreq: 'monthly',
      priority: 0.6,
      lastmod: new Date().toISOString(),
    };
  },
};
