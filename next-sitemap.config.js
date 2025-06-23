/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://ragaujam.lt',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: [
    '/admin/*',
    '/api/*',
    '/server-sitemap-index.xml',
  ],
  additionalPaths: async (config) => {
    const result = [];

    try {
      // Connect to MongoDB and fetch real data
      const { MongoClient } = require('mongodb');
      const client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
      const db = client.db();

      // Add real recipe pages
      const recipes = await db.collection('recipes_new')
        .find({
          slug: { $exists: true, $ne: null },
          publishedAt: { $exists: true }
        })
        .project({ slug: 1, updatedAt: 1, publishedAt: 1 })
        .limit(1000) // Limit for performance
        .toArray();

      recipes.forEach((recipe) => {
        result.push({
          loc: `/receptas/${recipe.slug}`,
          changefreq: 'weekly',
          priority: 0.8,
          lastmod: recipe.updatedAt || recipe.publishedAt || new Date().toISOString(),
        });
      });

      // Add real category pages
      const categories = await db.collection('categories_new')
        .find({ isActive: true })
        .project({ path: 1, updatedAt: 1 })
        .toArray();

      categories.forEach((category) => {
        result.push({
          loc: `/receptai/${category.path}`,
          changefreq: 'weekly',
          priority: 0.7,
          lastmod: category.updatedAt || new Date().toISOString(),
        });
      });

      await client.close();
    } catch (error) {
      console.error('Error generating additional sitemap paths:', error);
    }

    return result;
  },
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    additionalSitemaps: [
      `${process.env.SITE_URL || 'https://ragaujam.lt'}/server-sitemap-index.xml`,
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

    if (path.startsWith('/receptas/')) {
      return {
        loc: path,
        changefreq: 'weekly',
        priority: 0.8,
        lastmod: new Date().toISOString(),
      };
    }

    if (path.startsWith('/receptai/')) {
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
