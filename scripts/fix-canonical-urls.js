// Fix Canonical URLs in Database
// Adds canonical URLs to all recipes and categories for better SEO

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://receptai:SXF0NrgQbiQi8EeB@cluster0.zy6ywwg.mongodb.net/';
const DATABASE_NAME = 'receptai';
const SITE_URL = 'https://ragaujam.lt';

async function fixCanonicalUrls() {
  console.log('🔧 Fixing canonical URLs in database...\n');
  
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DATABASE_NAME);

    let updatedRecipes = 0;
    let updatedCategories = 0;

    // 1. Fix recipe canonical URLs
    console.log('📄 Updating recipe canonical URLs...');
    
    const recipes = await db.collection('recipes_new').find({
      publishedAt: { $exists: true },
      slug: { $exists: true, $ne: null }
    }).toArray();

    console.log(`Found ${recipes.length} published recipes`);

    for (const recipe of recipes) {
      const canonicalUrl = `${SITE_URL}/receptas/${recipe.slug}`;
      
      // Update recipe with canonical URL
      await db.collection('recipes_new').updateOne(
        { _id: recipe._id },
        {
          $set: {
            canonicalUrl: canonicalUrl,
            'seo.canonicalUrl': canonicalUrl
          }
        }
      );
      
      updatedRecipes++;
      
      if (updatedRecipes % 50 === 0) {
        console.log(`Updated ${updatedRecipes}/${recipes.length} recipes...`);
      }
    }

    console.log(`✅ Updated canonical URLs for ${updatedRecipes} recipes`);

    // 2. Fix category canonical URLs
    console.log('\n📂 Updating category canonical URLs...');
    
    const categories = await db.collection('categories_new').find({
      isActive: true,
      slug: { $exists: true, $ne: null }
    }).toArray();

    console.log(`Found ${categories.length} active categories`);

    for (const category of categories) {
      const canonicalUrl = `${SITE_URL}/receptai/${category.slug}`;
      
      // Update category with canonical URL
      await db.collection('categories_new').updateOne(
        { _id: category._id },
        {
          $set: {
            'seo.canonicalUrl': canonicalUrl
          }
        }
      );
      
      updatedCategories++;
    }

    console.log(`✅ Updated canonical URLs for ${updatedCategories} categories`);

    // 3. Verify updates
    console.log('\n🔍 Verifying updates...');
    
    const recipesWithCanonical = await db.collection('recipes_new').countDocuments({
      publishedAt: { $exists: true },
      canonicalUrl: { $exists: true }
    });

    const categoriesWithCanonical = await db.collection('categories_new').countDocuments({
      isActive: true,
      'seo.canonicalUrl': { $exists: true }
    });

    console.log(`Recipes with canonical URLs: ${recipesWithCanonical}/${recipes.length}`);
    console.log(`Categories with canonical URLs: ${categoriesWithCanonical}/${categories.length}`);

    // 4. Generate sample URLs for testing
    console.log('\n📝 Generating sample URLs for testing...');
    
    const sampleRecipes = recipes.slice(0, 5);
    const sampleCategories = categories.slice(0, 3);
    
    console.log('\nSample Recipe URLs:');
    sampleRecipes.forEach(recipe => {
      console.log(`- ${SITE_URL}/receptas/${recipe.slug}`);
    });
    
    console.log('\nSample Category URLs:');
    sampleCategories.forEach(category => {
      console.log(`- ${SITE_URL}/receptai/${category.slug}`);
    });

    await client.close();

    console.log('\n' + '='.repeat(50));
    console.log('✅ CANONICAL URL FIX COMPLETED');
    console.log('='.repeat(50));
    console.log(`Updated ${updatedRecipes} recipes`);
    console.log(`Updated ${updatedCategories} categories`);
    console.log('\n🚀 Next steps:');
    console.log('1. Deploy the updated code to production');
    console.log('2. Test a few URLs to verify canonical tags are working');
    console.log('3. Run: node scripts/submit-to-google.js');
    console.log('4. Submit URLs to Google Search Console');

    return {
      updatedRecipes,
      updatedCategories,
      totalRecipes: recipes.length,
      totalCategories: categories.length
    };

  } catch (error) {
    console.error('❌ Error fixing canonical URLs:', error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  fixCanonicalUrls()
    .then((result) => {
      console.log('\n🎉 Canonical URL fix completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { fixCanonicalUrls };
