// Debug script to check category-recipe matching for sitemap
// Run: node scripts/debug-category-recipe-match.js

const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.MONGODB_DB || 'receptai';

async function debugCategoryRecipeMatch() {
  console.log('🔍 Debugging category-recipe matching for sitemap...\n');

  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment variables');
    return;
  }

  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db(DATABASE_NAME);
    
    // 1. Check categories
    console.log('1️⃣ Checking categories:');
    const categories = await db.collection('categories_new').find({
      isActive: true
    }).limit(5).toArray();
    
    console.log(`   Found ${categories.length} active categories (showing first 5):`);
    categories.forEach(cat => {
      console.log(`   - slug: "${cat.slug}", path: "${cat.path}"`);
    });
    
    // 2. Check recipes and their allCategories field
    console.log('\n2️⃣ Checking recipes and their allCategories:');
    const recipes = await db.collection('recipes_new').find({
      publishedAt: { $exists: true }
    }).limit(5).toArray();
    
    console.log(`   Found ${recipes.length} published recipes (showing first 5):`);
    recipes.forEach(recipe => {
      console.log(`   - slug: "${recipe.slug}"`);
      console.log(`     allCategories: ${JSON.stringify(recipe.allCategories)}`);
      console.log(`     primaryCategoryPath: "${recipe.primaryCategoryPath}"`);
    });
    
    // 3. Check specific category "vistiena" 
    console.log('\n3️⃣ Checking specific category "vistiena":');
    const vistienaCat = await db.collection('categories_new').findOne({
      slug: 'vistiena',
      isActive: true
    });
    
    if (vistienaCat) {
      console.log(`   ✅ Found category: slug="${vistienaCat.slug}", path="${vistienaCat.path}"`);
      
      // Test the exact query used in sitemap
      const recipeCount = await db.collection('recipes_new').countDocuments({
        allCategories: vistienaCat.path,
        publishedAt: { $exists: true }
      });
      
      console.log(`   📊 Recipe count using sitemap query: ${recipeCount}`);
      
      // Try alternative queries
      const recipeCountPrimary = await db.collection('recipes_new').countDocuments({
        primaryCategoryPath: vistienaCat.path,
        publishedAt: { $exists: true }
      });
      
      console.log(`   📊 Recipe count using primaryCategoryPath: ${recipeCountPrimary}`);
      
      // Check if any recipes contain this path in allCategories array
      const recipesWithCategory = await db.collection('recipes_new').find({
        allCategories: { $in: [vistienaCat.path] },
        publishedAt: { $exists: true }
      }).limit(3).toArray();
      
      console.log(`   📊 Recipe count using $in operator: ${recipesWithCategory.length}`);
      
      if (recipesWithCategory.length > 0) {
        console.log(`   📝 Sample recipes with this category:`);
        recipesWithCategory.forEach(recipe => {
          console.log(`     - ${recipe.title.lt}: allCategories=${JSON.stringify(recipe.allCategories)}`);
        });
      }
      
    } else {
      console.log('   ❌ Category "vistiena" not found');
    }
    
    // 4. Check what values actually exist in allCategories
    console.log('\n4️⃣ Checking unique allCategories values:');
    const uniqueCategories = await db.collection('recipes_new').distinct('allCategories', {
      publishedAt: { $exists: true }
    });
    
    console.log(`   Found ${uniqueCategories.length} unique category values in recipes:`);
    uniqueCategories.slice(0, 10).forEach(cat => {
      console.log(`   - "${cat}"`);
    });
    
    // 5. Check if allCategories is an array or string
    console.log('\n5️⃣ Checking allCategories field type:');
    const sampleRecipe = await db.collection('recipes_new').findOne({
      publishedAt: { $exists: true },
      allCategories: { $exists: true }
    });
    
    if (sampleRecipe) {
      console.log(`   Sample recipe: ${sampleRecipe.title.lt}`);
      console.log(`   allCategories type: ${typeof sampleRecipe.allCategories}`);
      console.log(`   allCategories value: ${JSON.stringify(sampleRecipe.allCategories)}`);
      console.log(`   Is array: ${Array.isArray(sampleRecipe.allCategories)}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

debugCategoryRecipeMatch().catch(console.error);
