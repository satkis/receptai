// Generate comprehensive sitemap for SEO optimization
// Includes recipes, categories, and search terms
// Run: node scripts/generate-sitemap.js

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const BASE_URL = 'https://ragaujam.lt';
const OUTPUT_DIR = path.join(process.cwd(), 'public');

// Generate XML sitemap entry
function generateUrlEntry(url, lastmod, changefreq = 'weekly', priority = '0.8') {
  return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

// Generate image sitemap entry
function generateImageEntry(url, imageUrl, caption, title) {
  return `  <url>
    <loc>${url}</loc>
    <image:image>
      <image:loc>${imageUrl}</image:loc>
      <image:caption>${caption}</image:caption>
      <image:title>${title}</image:title>
    </image:image>
  </url>`;
}

// Extract popular search terms from database
async function extractSearchTerms(db, limit = 200) {
  console.log('📊 Extracting popular search terms...');
  
  // Get popular tags
  const tagAggregation = await db.collection('recipes_new').aggregate([
    { $unwind: "$tags" },
    { $group: { _id: "$tags", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit / 2 }
  ]).toArray();

  // Get popular ingredient combinations
  const ingredientAggregation = await db.collection('recipes_new').aggregate([
    { $unwind: "$ingredients" },
    {
      $project: {
        ingredient: { $toLower: "$ingredients.name.lt" }
      }
    },
    {
      $match: {
        ingredient: { 
          $not: { $in: ["druska", "pipirai", "aliejus", "vanduo"] } // Common ingredients to exclude
        }
      }
    },
    { $group: { _id: "$ingredient", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit / 4 }
  ]).toArray();

  // Get popular title words
  const titleAggregation = await db.collection('recipes_new').aggregate([
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
          $not: { $in: ["su", "ir", "be", "iš", "per", "už", "ant", "po", "prie", "receptas", "receptai"] }
        },
        "words": { $regex: "^[a-ząčęėįšųūž]{3,}$" } // Only Lithuanian words 3+ chars
      }
    },
    { $group: { _id: "$words", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit / 4 }
  ]).toArray();

  const searchTerms = [
    ...tagAggregation.map(t => t._id),
    ...ingredientAggregation.map(i => i._id),
    ...titleAggregation.map(t => t._id)
  ];

  // Remove duplicates and filter
  const uniqueTerms = Array.from(new Set(searchTerms))
    .filter(term => term && term.length > 2)
    .slice(0, limit);

  console.log(`✅ Extracted ${uniqueTerms.length} search terms`);
  return uniqueTerms;
}

// Generate main sitemap
async function generateMainSitemap(db) {
  console.log('📄 Generating main sitemap...');
  
  const now = new Date().toISOString().split('T')[0];
  let urls = [];

  // Homepage
  urls.push(generateUrlEntry(`${BASE_URL}/`, now, 'daily', '1.0'));

  // Recipe pages
  const recipes = await db.collection('recipes_new')
    .find({}, { slug: 1, updatedAt: 1 })
    .toArray();

  recipes.forEach(recipe => {
    const lastmod = recipe.updatedAt ? recipe.updatedAt.toISOString().split('T')[0] : now;
    urls.push(generateUrlEntry(`${BASE_URL}/receptas/${recipe.slug}`, lastmod, 'weekly', '0.8'));
  });

  // Category pages
  const categories = await db.collection('categories_new')
    .find({ isActive: true }, { path: 1, updatedAt: 1 })
    .toArray();

  categories.forEach(category => {
    const lastmod = category.updatedAt ? category.updatedAt.toISOString().split('T')[0] : now;
    urls.push(generateUrlEntry(`${BASE_URL}/${category.path}`, lastmod, 'weekly', '0.7'));
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'sitemap.xml'), sitemap);
  console.log(`✅ Generated main sitemap with ${urls.length} URLs`);
  return urls.length;
}

// Generate search terms sitemap
async function generateSearchSitemap(db) {
  console.log('🔍 Generating search terms sitemap...');
  
  const now = new Date().toISOString().split('T')[0];
  const searchTerms = await extractSearchTerms(db, 500);
  
  let urls = [];

  searchTerms.forEach(term => {
    const encodedTerm = encodeURIComponent(term);
    urls.push(generateUrlEntry(`${BASE_URL}/paieska?q=${encodedTerm}`, now, 'monthly', '0.6'));
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'sitemap-search.xml'), sitemap);
  console.log(`✅ Generated search sitemap with ${urls.length} URLs`);
  return urls.length;
}

// Generate image sitemap
async function generateImageSitemap(db) {
  console.log('🖼️ Generating image sitemap...');
  
  let urls = [];

  const recipes = await db.collection('recipes_new')
    .find({ image: { $exists: true, $ne: null } }, { 
      slug: 1, 
      title: 1, 
      description: 1, 
      image: 1 
    })
    .toArray();

  recipes.forEach(recipe => {
    if (recipe.image && recipe.image.startsWith('/')) {
      const imageUrl = `${BASE_URL}${recipe.image}`;
      const recipeUrl = `${BASE_URL}/receptas/${recipe.slug}`;
      
      urls.push(generateImageEntry(
        recipeUrl,
        imageUrl,
        recipe.description.lt.substring(0, 100) + '...',
        recipe.title.lt
      ));
    }
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join('\n')}
</urlset>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'sitemap-images.xml'), sitemap);
  console.log(`✅ Generated image sitemap with ${urls.length} URLs`);
  return urls.length;
}

// Generate sitemap index
async function generateSitemapIndex(mainCount, searchCount, imageCount) {
  console.log('📋 Generating sitemap index...');
  
  const now = new Date().toISOString();
  
  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_URL}/sitemap.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-search.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-images.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>
</sitemapindex>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'sitemap-index.xml'), sitemapIndex);
  console.log('✅ Generated sitemap index');
  
  // Also create robots.txt
  const robotsTxt = `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${BASE_URL}/sitemap-index.xml
Sitemap: ${BASE_URL}/sitemap.xml
Sitemap: ${BASE_URL}/sitemap-search.xml
Sitemap: ${BASE_URL}/sitemap-images.xml

# Crawl-delay for politeness
Crawl-delay: 1`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'robots.txt'), robotsTxt);
  console.log('✅ Generated robots.txt');
}

// Main function
async function generateSitemaps() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('🚀 Starting sitemap generation...');
    
    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    
    // Generate all sitemaps
    const mainCount = await generateMainSitemap(db);
    const searchCount = await generateSearchSitemap(db);
    const imageCount = await generateImageSitemap(db);
    
    // Generate sitemap index
    await generateSitemapIndex(mainCount, searchCount, imageCount);
    
    console.log('🎉 Sitemap generation completed successfully!');
    console.log(`📊 Summary:
    - Main sitemap: ${mainCount} URLs
    - Search sitemap: ${searchCount} URLs  
    - Image sitemap: ${imageCount} URLs
    - Total: ${mainCount + searchCount + imageCount} URLs`);
    
  } catch (error) {
    console.error('❌ Error generating sitemaps:', error);
  } finally {
    await client.close();
  }
}

// Run the generator
if (require.main === module) {
  generateSitemaps();
}

module.exports = { generateSitemaps };
