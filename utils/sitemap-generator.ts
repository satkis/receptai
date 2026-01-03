// Optimized sitemap generator for Lithuanian recipe website
// Prioritizes SEO performance and fast generation for 10k+ recipes

import { MongoClient } from 'mongodb';

interface SitemapUrl {
  url: string;
  lastModified?: string;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

interface SitemapOptions {
  baseUrl: string;
  maxUrls?: number;
  includeImages?: boolean;
}

export async function generateSitemap(options: SitemapOptions): Promise<string> {
  const { baseUrl, maxUrls = 50000, includeImages = false } = options;
  const urls: SitemapUrl[] = [];

  try {
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db();

    // 1. Static pages (highest priority)
    urls.push(
      { url: baseUrl, changeFrequency: 'daily', priority: 1.0 },
      { url: `${baseUrl}/receptai`, changeFrequency: 'daily', priority: 0.9 },
      { url: `${baseUrl}/paieska`, changeFrequency: 'weekly', priority: 0.7 }
    );

    // 2. Category pages (high priority)
    const categories = await db.collection('categories_new')
      .find({ isActive: true })
      .project({ path: 1, updatedAt: 1 })
      .sort({ level: 1, sortOrder: 1 })
      .limit(100) // Limit categories for performance
      .toArray();

    categories.forEach(category => {
      urls.push({
        url: `${baseUrl}/${category.path}`,
        lastModified: category.updatedAt?.toISOString() || new Date().toISOString(),
        changeFrequency: 'weekly',
        priority: 0.8
      });
    });

    // 3. Recipe pages (medium-high priority, optimized query)
    const recipes = await db.collection('recipes_new')
      .find({ 
        slug: { $exists: true, $ne: null },
        publishedAt: { $exists: true }
      })
      .project({ 
        slug: 1, 
        updatedAt: 1, 
        publishedAt: 1,
        image: includeImages ? 1 : 0
      })
      .sort({ publishedAt: -1 }) // Newest first for better crawling
      .limit(maxUrls - urls.length - 1000) // Reserve space for search URLs
      .toArray();

    recipes.forEach(recipe => {
      const recipeUrl: SitemapUrl = {
        url: `${baseUrl}/receptas/${recipe.slug}`,
        lastModified: recipe.updatedAt?.toISOString() || recipe.publishedAt?.toISOString(),
        changeFrequency: 'monthly',
        priority: 0.7
      };

      urls.push(recipeUrl);
    });

    // 4. Popular search URLs (for Google discovery)
    const popularSearchTerms = await getPopularSearchTerms(db, 200);
    popularSearchTerms.slice(0, Math.min(500, maxUrls - urls.length)).forEach(term => {
      urls.push({
        url: `${baseUrl}/paieska?q=${encodeURIComponent(term)}`,
        changeFrequency: 'weekly',
        priority: 0.5
      });
    });

    await client.close();

    // Generate XML sitemap
    return generateSitemapXML(urls);

  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return minimal sitemap on error
    return generateSitemapXML([
      { url: baseUrl, changeFrequency: 'daily', priority: 1.0 }
    ]);
  }
}

async function getPopularSearchTerms(db: any, limit: number): Promise<string[]> {
  try {
    // Get popular tags (most used in recipes)
    const popularTags = await db.collection('recipes_new').aggregate([
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit / 2 },
      { $project: { _id: 1 } }
    ]).toArray();

    // Get popular title words
    const popularWords = await db.collection('recipes_new').aggregate([
      {
        $project: {
          words: {
            $split: [
              { $toLower: "$title.lt" },
              " "
            ]
          }
        }
      },
      { $unwind: "$words" },
      {
        $match: {
          words: { 
            $not: { $in: ["su", "ir", "be", "iš", "per", "už", "ant", "po", "prie", "į", "nuo"] }
          },
          $expr: { $gte: [{ $strLenCP: "$words" }, 3] } // At least 3 characters
        }
      },
      { $group: { _id: "$words", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit / 2 },
      { $project: { _id: 1 } }
    ]).toArray();

    const terms = [
      ...popularTags.map(t => t._id),
      ...popularWords.map(w => w._id)
    ];

    // Remove duplicates and filter
    return Array.from(new Set(terms))
      .filter(term => term && term.length > 2 && term.length < 50)
      .slice(0, limit);

  } catch (error) {
    console.error('Error getting popular search terms:', error);
    return ['cepelinai', 'šaltibarščiai', 'kugelis', 'kibinai', 'balandėliai'];
  }
}

function generateSitemapXML(urls: SitemapUrl[]): string {
  const urlElements = urls.map(url => {
    let urlXml = `  <url>
    <loc>${escapeXml(url.url)}</loc>`;
    
    if (url.lastModified) {
      urlXml += `
    <lastmod>${url.lastModified}</lastmod>`;
    }
    
    if (url.changeFrequency) {
      urlXml += `
    <changefreq>${url.changeFrequency}</changefreq>`;
    }
    
    if (url.priority !== undefined) {
      urlXml += `
    <priority>${url.priority.toFixed(1)}</priority>`;
    }
    
    urlXml += `
  </url>`;
    
    return urlXml;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
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

// Generate robots.txt content
export function generateRobotsTxt(baseUrl: string): string {
  return `User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Optimize crawling
Crawl-delay: 1

# Block unnecessary paths
Disallow: /api/
Disallow: /_next/
Disallow: /admin/
Disallow: /*.json$

# Allow important paths
Allow: /receptas/
Allow: /receptai/
Allow: /paieska/

# Block search with empty queries
Disallow: /paieska?q=
Disallow: /paieska?q=$

# Lithuanian recipe website - optimized for search engines
# Contact: info@ragaujam.lt`;
}

// Generate sitemap index for large sites
export async function generateSitemapIndex(baseUrl: string): Promise<string> {
  const sitemaps = [
    {
      url: `${baseUrl}/sitemap-recipes.xml`,
      lastModified: new Date().toISOString()
    },
    {
      url: `${baseUrl}/sitemap-categories.xml`,
      lastModified: new Date().toISOString()
    },
    {
      url: `${baseUrl}/sitemap-search.xml`,
      lastModified: new Date().toISOString()
    }
  ];

  const sitemapElements = sitemaps.map(sitemap => `  <sitemap>
    <loc>${escapeXml(sitemap.url)}</loc>
    <lastmod>${sitemap.lastModified}</lastmod>
  </sitemap>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapElements}
</sitemapindex>`;
}

// Utility function to validate sitemap URLs
export function validateSitemapUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'https:' && urlObj.hostname.includes('ragaujam');
  } catch {
    return false;
  }
}

// Performance monitoring for sitemap generation
export function measureSitemapGeneration<T>(
  operation: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  return new Promise(async (resolve, reject) => {
    const startTime = Date.now();
    
    try {
      const result = await operation();
      const duration = Date.now() - startTime;
      
      if (duration > 5000) { // Warn if sitemap generation takes > 5s
        console.warn(`Slow sitemap generation: ${duration}ms`);
      }
      
      resolve({ result, duration });
    } catch (error) {
      reject(error);
    }
  });
}
