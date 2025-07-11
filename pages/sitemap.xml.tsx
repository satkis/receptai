// Dynamic Sitemap Generator with SEO Optimization
// URL: domain.lt/sitemap.xml

import { GetServerSideProps } from 'next';
import clientPromise, { DATABASE_NAME } from '../lib/mongodb';

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: string;
}

function generateSitemapXML(urls: SitemapUrl[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
}

// This component doesn't render anything, it just generates XML
function Sitemap() {
  return null;
}

// Helper functions for sitemap optimization
function calculateCategoryPriority(recipeCount: number): string {
  if (recipeCount >= 50) return '0.8';      // Popular categories
  if (recipeCount >= 10) return '0.7';      // Medium categories  
  if (recipeCount >= 1) return '0.6';       // Small categories
  return '0.5'; // Fallback
}

function calculateCategoryChangefreq(recipeCount: number, lastUpdated: Date | string): 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' {
  const updateDate = typeof lastUpdated === 'string' ? new Date(lastUpdated) : lastUpdated;
  const daysSinceUpdate = (Date.now() - updateDate.getTime()) / (1000 * 60 * 60 * 24);
  
  if (recipeCount >= 20 && daysSinceUpdate < 7) return 'weekly';
  if (recipeCount >= 5) return 'monthly';
  return 'monthly';
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ragaujam.lt';
  const currentDate = new Date().toISOString();

  try {
    console.log('Starting sitemap generation...');
    console.log('Base URL:', baseUrl);

    // Start with static URLs first (no database required)
    const urls: SitemapUrl[] = [];

    // Add static pages
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
        changefreq: 'monthly',
        priority: '0.3'
      }
    );

    console.log(`Added ${urls.length} static pages`);

    // Connect to database for dynamic content
    const client = await clientPromise;
    const db = client.db(DATABASE_NAME);
    console.log('Database connected successfully');

    // Get all active categories
    const categories = await db.collection('categories_new').find({
      isActive: true
    }).toArray();
    console.log(`Found ${categories.length} active categories`);

    // Get recipe counts for each category and filter out empty ones
    const categoriesWithRecipes: any[] = [];

    // Check all categories for recipes using the correct path format
    for (const category of categories) {
      // Recipes store paths as "receptai/category" but categories store just "category"
      const recipeCategoryPath = `receptai/${category.path}`;
      
      // Count recipes where this category appears in primaryCategoryPath or secondaryCategories
      const totalCount = await db.collection('recipes_new').countDocuments({
        $or: [
          { primaryCategoryPath: recipeCategoryPath },
          { secondaryCategories: { $in: [recipeCategoryPath] } }
        ],
        publishedAt: { $exists: true }
      });
      
      if (totalCount > 0) {
        console.log(`✅ Found ${totalCount} recipes for category: ${category.slug} (${recipeCategoryPath})`);
        
        categoriesWithRecipes.push({
          _id: category._id,
          path: category.path,
          slug: category.slug,
          title: category.title,
          updatedAt: category.updatedAt,
          createdAt: category.createdAt,
          recipeCount: totalCount
        });
      }
    }
    
    console.log(`Found ${categoriesWithRecipes.length} categories with recipes`);

    // Add category pages to sitemap
    for (const category of categoriesWithRecipes) {
      const priority = calculateCategoryPriority(category.recipeCount);
      const changefreq = calculateCategoryChangefreq(category.recipeCount, category.updatedAt);
      
      urls.push({
        loc: `${baseUrl}/receptai/${category.slug}`,
        lastmod: category.updatedAt || category.createdAt || currentDate,
        changefreq,
        priority
      });
    }

    console.log(`Added ${categoriesWithRecipes.length} category pages to sitemap`);

    // Get all published recipes
    const recipes = await db.collection('recipes_new').find({
      publishedAt: { $exists: true },
      slug: { $exists: true, $ne: null }
    }).project({
      slug: 1,
      publishedAt: 1,
      updatedAt: 1
    }).toArray();

    console.log(`Found ${recipes.length} published recipes`);

    // Add recipe pages to sitemap
    for (const recipe of recipes) {
      urls.push({
        loc: `${baseUrl}/receptas/${recipe.slug}`,
        lastmod: recipe.updatedAt || recipe.publishedAt || currentDate,
        changefreq: 'monthly' as const,
        priority: '0.5'
      });
    }

    console.log(`Added ${recipes.length} recipe pages to sitemap`);

    // Generate final sitemap with all URLs
    console.log(`Generating sitemap with ${urls.length} total URLs`);
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
