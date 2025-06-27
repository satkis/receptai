// Dynamic sitemap generation that updates automatically
// when new recipes, categories, or subcategories are added

import { GetServerSideProps } from 'next';
import clientPromise from '@/lib/mongodb';

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: string;
}

function generateSitemapXML(urls: SitemapUrl[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${urls.map(url => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

// This component doesn't render anything, it just generates XML
function Sitemap() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://paragaujam.lt';
  const currentDate = new Date().toISOString();

  try {
    // Connect to database
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'receptai');

    // Generate sitemap URLs
    const urls: SitemapUrl[] = [];

    // 1. Static pages
    urls.push(
      {
        loc: baseUrl,
        lastmod: currentDate,
        changefreq: 'daily',
        priority: '1.0'
      },
      {
        loc: `${baseUrl}/receptai`,
        lastmod: currentDate,
        changefreq: 'daily',
        priority: '0.9'
      }
    );

    // 2. Get all categories and discover dynamic ones
    const categories = await db.collection('categories_new').find({
      isActive: true
    }).toArray();

    // Get all unique categoryPaths from recipes for dynamic discovery
    const recipeCategoryPaths = await db.collection('recipes_new').distinct('primaryCategoryPath', {
      publishedAt: { $exists: true }
    });

    // Track all category/subcategory combinations
    const allCategoryPaths = new Set();

    // Add predefined categories
    for (const category of categories) {
      // Add category page
      urls.push({
        loc: `${baseUrl}/receptai/${category.slug}`,
        lastmod: category.updatedAt || category.createdAt || currentDate,
        changefreq: 'weekly',
        priority: '0.8'
      });

      // Add predefined subcategory pages
      if (category.subcategories && Array.isArray(category.subcategories)) {
        for (const subcategory of category.subcategories) {
          const categoryPath = `${category.slug}/${subcategory.slug}`;
          allCategoryPaths.add(categoryPath);

          urls.push({
            loc: `${baseUrl}/receptai/${categoryPath}`,
            lastmod: subcategory.updatedAt || category.updatedAt || currentDate,
            changefreq: 'weekly',
            priority: '0.7'
          });
        }
      }
    }

    // Add dynamic categories and subcategories from recipes
    for (const categoryPath of recipeCategoryPaths) {
      if (!categoryPath || typeof categoryPath !== 'string') continue;

      const parts = categoryPath.split('/');
      if (parts.length >= 2) {
        const [categorySlug, subcategorySlug] = parts;

        // Add category page if not already added
        const categoryExists = categories.some(cat => cat.slug === categorySlug);
        if (!categoryExists) {
          urls.push({
            loc: `${baseUrl}/receptai/${categorySlug}`,
            lastmod: currentDate,
            changefreq: 'weekly',
            priority: '0.8'
          });
        }

        // Add subcategory page if not already added
        if (!allCategoryPaths.has(categoryPath)) {
          allCategoryPaths.add(categoryPath);

          urls.push({
            loc: `${baseUrl}/receptai/${categoryPath}`,
            lastmod: currentDate,
            changefreq: 'weekly',
            priority: '0.7'
          });
        }
      }
    }

    // 3. Get all published recipes
    const recipes = await db.collection('recipes_new').find({
      publishedAt: { $exists: true },
      slug: { $exists: true }
    }).project({
      slug: 1,
      primaryCategoryPath: 1,
      updatedAt: 1,
      createdAt: 1,
      publishedAt: 1
    }).toArray();

    for (const recipe of recipes) {
      if (recipe.slug) {
        urls.push({
          loc: `${baseUrl}/receptas/${recipe.slug}`,
          lastmod: recipe.updatedAt || recipe.publishedAt || recipe.createdAt || currentDate,
          changefreq: 'monthly',
          priority: '0.9'
        });
      }
    }

    // 4. Get all groups/tags pages
    const groups = await db.collection('groups').find({
      status: 'active'
    }).toArray();

    for (const group of groups) {
      urls.push({
        loc: `${baseUrl}/receptai?group=${group.slug}`,
        lastmod: group.updatedAt || group.createdAt || currentDate,
        changefreq: 'weekly',
        priority: '0.6'
      });
    }

    // 5. Additional static pages (if they exist)
    const additionalPages = [
      { path: '/apie-mus', priority: '0.5', changefreq: 'monthly' as const },
      { path: '/kontaktai', priority: '0.5', changefreq: 'monthly' as const },
      { path: '/privatumas', priority: '0.3', changefreq: 'yearly' as const },
      { path: '/taisykles', priority: '0.3', changefreq: 'yearly' as const }
    ];

    for (const page of additionalPages) {
      urls.push({
        loc: `${baseUrl}${page.path}`,
        lastmod: currentDate,
        changefreq: page.changefreq,
        priority: page.priority
      });
    }

    // Sort URLs by priority (highest first)
    urls.sort((a, b) => parseFloat(b.priority) - parseFloat(a.priority));

    // Generate XML sitemap
    const sitemap = generateSitemapXML(urls);

    // Set response headers
    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate'); // Cache for 24 hours
    res.write(sitemap);
    res.end();

    return {
      props: {}
    };

  } catch (error) {
    console.error('Sitemap generation error:', error);

    // Generate minimal sitemap on error
    const fallbackUrls: SitemapUrl[] = [
      {
        loc: baseUrl,
        lastmod: currentDate,
        changefreq: 'daily',
        priority: '1.0'
      },
      {
        loc: `${baseUrl}/receptai`,
        lastmod: currentDate,
        changefreq: 'daily',
        priority: '0.9'
      }
    ];

    const fallbackSitemap = generateSitemapXML(fallbackUrls);

    res.setHeader('Content-Type', 'text/xml');
    res.write(fallbackSitemap);
    res.end();

    return {
      props: {}
    };
  }
};

export default Sitemap;
