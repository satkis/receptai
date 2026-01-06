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

// Fix date formatting function
function formatSitemapDate(date: Date | string | null): string {
  if (!date) return new Date().toISOString();
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      return new Date().toISOString();
    }
    return dateObj.toISOString();
  } catch (error) {
    return new Date().toISOString();
  }
}

// Add XML escaping function
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, function (c) {
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

function generateSitemapXML(urls: SitemapUrl[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
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
      },
      {
        loc: `${baseUrl}/apie-mus`,
        lastmod: currentDate,
        changefreq: 'yearly',
        priority: '0.5'
      },
      {
        loc: `${baseUrl}/kontaktai`,
        lastmod: currentDate,
        changefreq: 'yearly',
        priority: '0.5'
      },
      {
        loc: `${baseUrl}/taisykles`,
        lastmod: currentDate,
        changefreq: 'yearly',
        priority: '0.5'
      },
      {
        loc: `${baseUrl}/privatumo-politika`,
        lastmod: currentDate,
        changefreq: 'yearly',
        priority: '0.5'
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

    // Debug: Show first few categories
    console.log('First 3 categories:', categories.slice(0, 3).map(cat => ({
      slug: cat.slug,
      path: cat.path
    })));

    // Get recipe counts for each category and filter out empty ones
    const categoriesWithRecipes: any[] = [];
    
    console.log(`Found ${categoriesWithRecipes.length} categories with recipes`);

    // Debug: Let's check what allCategories values actually exist in recipes
    const allCategoryValues = await db.collection('recipes_new').distinct('allCategories', {
      publishedAt: { $exists: true }
    });

    console.log(`Unique allCategories values in recipes:`, allCategoryValues.slice(0, 10));

    // Debug: Check a specific recipe to see its structure
    const sampleRecipe = await db.collection('recipes_new').findOne({
      slug: 'vistiena-su-paprikomis',
      publishedAt: { $exists: true }
    });

    if (sampleRecipe) {
      console.log(`Sample recipe structure:`, {
        slug: sampleRecipe.slug,
        allCategories: sampleRecipe.allCategories,
        primaryCategoryPath: sampleRecipe.primaryCategoryPath
      });
    }

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

    // Add category pages to sitemap
    for (const category of categoriesWithRecipes) {
      const priority = calculateCategoryPriority(category.recipeCount);
      const changefreq = calculateCategoryChangefreq(category.recipeCount, category.updatedAt);
      
      urls.push({
        loc: `${baseUrl}/receptai/${category.slug}`,
        lastmod: formatSitemapDate(category.updatedAt || category.createdAt),
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
        lastmod: formatSitemapDate(recipe.updatedAt || recipe.publishedAt),
        changefreq: 'monthly' as const,
        priority: '0.7'
      });
    }

    console.log(`Added ${recipes.length} recipe pages to sitemap`);

    // Generate final sitemap with all URLs
    console.log(`Generating sitemap with ${urls.length} total URLs`);
    const sitemap = generateSitemapXML(urls);

    // Set response headers
    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');
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