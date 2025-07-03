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
  // Limit to 50,000 URLs per Google guidelines
  const limitedUrls = urls.slice(0, 50000);

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${limitedUrls.map(url => `  <url>
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
        loc: `${baseUrl}/`,
        lastmod: currentDate,
        changefreq: 'daily',
        priority: '1.0'
      },
      {
        loc: `${baseUrl}/receptai`,
        lastmod: currentDate,
        changefreq: 'daily',
        priority: '0.9'
      },
      {
        loc: `${baseUrl}/paieska`,
        lastmod: currentDate,
        changefreq: 'weekly',
        priority: '0.7'
      },
      {
        loc: `${baseUrl}/privatumo-politika`,
        lastmod: currentDate,
        changefreq: 'monthly',
        priority: '0.3'
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

    // Add predefined categories (with validation)
    for (const category of categories) {
      // Validate category slug - skip if invalid
      if (!category.slug ||
          category.slug.includes('receptai') ||
          category.slug.startsWith('/') ||
          category.slug === '' ||
          category.slug.includes('//')) {
        continue;
      }

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
          // Validate subcategory slug
          if (!subcategory.slug ||
              subcategory.slug.includes('receptai') ||
              subcategory.slug.startsWith('/') ||
              subcategory.slug === '' ||
              subcategory.slug.includes('//')) {
            continue;
          }

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

    // Add dynamic categories and subcategories from recipes (with validation)
    for (const categoryPath of recipeCategoryPaths) {
      if (!categoryPath || typeof categoryPath !== 'string') continue;

      // Skip invalid paths
      if (categoryPath.includes('receptai') ||
          categoryPath.startsWith('/') ||
          categoryPath === '' ||
          categoryPath.includes('//') ||
          categoryPath.includes('receptai/receptai')) {
        continue;
      }

      const parts = categoryPath.split('/');
      if (parts.length >= 2) {
        const [categorySlug, subcategorySlug] = parts;

        // Validate individual slugs
        if (!categorySlug || !subcategorySlug ||
            categorySlug.includes('receptai') ||
            subcategorySlug.includes('receptai') ||
            categorySlug === '' || subcategorySlug === '') {
          continue;
        }

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

    // 4. Get popular tags for search URLs (like /paieska?q=vengriška%20virtuvė)
    const popularTags = await db.collection('recipes_new').aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $match: { count: { $gte: 3 } } }, // Only tags with 3+ recipes
      { $sort: { count: -1 } },
      { $limit: 50 } // Top 50 popular tags
    ]).toArray();

    for (const tag of popularTags) {
      if (tag._id && typeof tag._id === 'string') {
        urls.push({
          loc: `${baseUrl}/paieska?q=${encodeURIComponent(tag._id)}`,
          lastmod: currentDate,
          changefreq: 'weekly',
          priority: '0.6'
        });
      }
    }

    // Note: Additional static pages are already included in the main static pages section above
    // No additional hardcoded pages needed - all actual pages are covered

    // Final validation - remove any invalid URLs that might have slipped through
    const validUrls = urls.filter(url => {
      // Check for double receptai, empty paths, or other invalid patterns
      return !url.loc.includes('/receptai/receptai') &&
             !url.loc.includes('//') &&
             !url.loc.endsWith('/receptai/') &&
             url.loc !== `${baseUrl}/receptai/`;
    });

    // Sort URLs by priority (highest first)
    validUrls.sort((a, b) => parseFloat(b.priority) - parseFloat(a.priority));

    // Generate XML sitemap
    const sitemap = generateSitemapXML(validUrls);

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
