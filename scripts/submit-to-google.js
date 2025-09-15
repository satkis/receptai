// Google Search Console URL Submission Helper
// Generates a list of URLs that need to be submitted for indexing

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://receptai:SXF0NrgQbiQi8EeB@cluster0.zy6ywwg.mongodb.net/';
const DATABASE_NAME = 'receptai';
const SITE_URL = 'https://ragaujam.lt';

async function generateUrlsForSubmission() {
  console.log('🔍 Generating URLs for Google Search Console submission...');
  
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DATABASE_NAME);

    const urls = [];

    // 1. Get all published recipes
    console.log('📄 Fetching published recipes...');
    const recipes = await db.collection('recipes_new').find({
      publishedAt: { $exists: true },
      slug: { $exists: true, $ne: null }
    }).project({
      slug: 1,
      publishedAt: 1,
      updatedAt: 1
    }).toArray();

    console.log(`Found ${recipes.length} published recipes`);

    // Add recipe URLs
    for (const recipe of recipes) {
      urls.push({
        url: `${SITE_URL}/receptas/${recipe.slug}`,
        type: 'recipe',
        lastModified: recipe.updatedAt || recipe.publishedAt,
        priority: 'high'
      });
    }

    // 2. Get active categories with recipes
    console.log('📂 Fetching active categories...');
    const categories = await db.collection('categories_new').find({
      isActive: true
    }).toArray();

    const categoriesWithRecipes = [];
    for (const category of categories) {
      const recipeCategoryPath = `receptai/${category.path}`;
      const recipeCount = await db.collection('recipes_new').countDocuments({
        $or: [
          { primaryCategoryPath: recipeCategoryPath },
          { secondaryCategories: { $in: [recipeCategoryPath] } }
        ],
        publishedAt: { $exists: true }
      });

      if (recipeCount > 0) {
        categoriesWithRecipes.push({
          ...category,
          recipeCount
        });
      }
    }

    console.log(`Found ${categoriesWithRecipes.length} categories with recipes`);

    // Add category URLs
    for (const category of categoriesWithRecipes) {
      urls.push({
        url: `${SITE_URL}/receptai/${category.slug}`,
        type: 'category',
        lastModified: category.updatedAt || category.createdAt,
        priority: category.recipeCount >= 10 ? 'high' : 'medium',
        recipeCount: category.recipeCount
      });
    }

    // 3. Add static pages
    urls.push(
      {
        url: `${SITE_URL}/receptai`,
        type: 'homepage',
        lastModified: new Date(),
        priority: 'highest'
      },
      {
        url: `${SITE_URL}/paieska`,
        type: 'search',
        lastModified: new Date(),
        priority: 'medium'
      }
    );

    await client.close();

    // Sort by priority and date
    urls.sort((a, b) => {
      const priorityOrder = { 'highest': 4, 'high': 3, 'medium': 2, 'low': 1 };
      const aPriority = priorityOrder[a.priority] || 1;
      const bPriority = priorityOrder[b.priority] || 1;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority; // Higher priority first
      }
      
      // If same priority, sort by date (newer first)
      return new Date(b.lastModified) - new Date(a.lastModified);
    });

    console.log(`\n📊 URL Summary:`);
    console.log(`Total URLs: ${urls.length}`);
    console.log(`Recipes: ${urls.filter(u => u.type === 'recipe').length}`);
    console.log(`Categories: ${urls.filter(u => u.type === 'category').length}`);
    console.log(`Static pages: ${urls.filter(u => u.type === 'homepage' || u.type === 'search').length}`);

    // Generate output files
    console.log('\n📝 Generating output files...');

    // 1. Simple URL list for manual submission
    const urlList = urls.map(u => u.url).join('\n');
    require('fs').writeFileSync('urls-for-submission.txt', urlList);

    // 2. Detailed JSON for analysis
    require('fs').writeFileSync('urls-detailed.json', JSON.stringify(urls, null, 2));

    // 3. Priority-based batches for systematic submission
    const highPriorityUrls = urls.filter(u => u.priority === 'highest' || u.priority === 'high');
    const mediumPriorityUrls = urls.filter(u => u.priority === 'medium');
    
    require('fs').writeFileSync('urls-high-priority.txt', 
      highPriorityUrls.map(u => u.url).join('\n')
    );
    
    require('fs').writeFileSync('urls-medium-priority.txt', 
      mediumPriorityUrls.map(u => u.url).join('\n')
    );

    console.log('\n✅ Files generated:');
    console.log('- urls-for-submission.txt (all URLs)');
    console.log('- urls-detailed.json (detailed analysis)');
    console.log('- urls-high-priority.txt (submit these first)');
    console.log('- urls-medium-priority.txt (submit these second)');

    console.log('\n🚀 Next steps:');
    console.log('1. Submit high-priority URLs first (recipes + popular categories)');
    console.log('2. Wait 24-48 hours, then submit medium-priority URLs');
    console.log('3. Monitor Google Search Console for indexing status');
    console.log('4. Resubmit any URLs that fail to index after 1 week');

    return urls;

  } catch (error) {
    console.error('❌ Error generating URLs:', error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  generateUrlsForSubmission()
    .then(() => {
      console.log('\n🎉 URL generation completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { generateUrlsForSubmission };
