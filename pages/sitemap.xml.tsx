import { GetServerSideProps } from 'next';
import clientPromise from '../lib/mongodb';

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
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

function Sitemap() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ragaujam.lt';
  const currentDate = new Date().toISOString();

  try {
    console.log('Starting sitemap generation...');
    console.log('Base URL:', baseUrl);
    
    // Connect to database
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'receptai');
    console.log('Database connected successfully');

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

    console.log(`Added ${urls.length} static pages`);

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

    // Add predefined categories (NO VALIDATION - ALLOW ALL)
    for (const category of categories) {
      // Only skip if completely empty
      if (!category.slug || category.slug === '') {
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
          // Only skip if completely empty
          if (!subcategory.slug || subcategory.slug === '') {
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

    // Add dynamic categories and subcategories from recipes (NO VALIDATION)
    for (const categoryPath of recipeCategoryPaths) {
      if (!categoryPath || typeof categoryPath !== 'string') continue;

      // Only skip if completely empty
      if (categoryPath === '') {
        continue;
      }

      const parts = categoryPath.split('/');
      if (parts.length >= 2) {
        const [categorySlug, subcategorySlug] = parts;

        // Only skip if completely empty
        if (!categorySlug || !subcategorySlug || 
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

    // 4. Get popular tags for search URLs
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

    console.log(`Generated ${urls.length} total URLs`);

    // Sort URLs by priority (highest first)
    urls.sort((a, b) => parseFloat(b.priority) - parseFloat(a.priority));

    // Generate XML sitemap
    const sitemap = generateSitemapXML(urls);

    // Set response headers
    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate');
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
