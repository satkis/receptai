// Debug script to check sitemap category generation
// Run: node scripts/debug-sitemap-categories.js

const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.MONGODB_DB || 'receptai';

async function debugSitemapCategories() {
  console.log('🔍 Debugging sitemap category generation...\n');

  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment variables');
    return;
  }

  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db(DATABASE_NAME);
    
    // 1. Check all active categories
    console.log('1️⃣ Checking active categories:');
    const categories = await db.collection('categories_new').find({
      isActive: true
    }).toArray();
    
    console.log(`   Found ${categories.length} active categories`);
    
    // Show first few categories
    categories.slice(0, 5).forEach(cat => {
      console.log(`   - ${cat.slug} (path: ${cat.path})`);
    });
    
    // 2. Check recipe counts for each category
    console.log('\n2️⃣ Checking recipe counts for categories:');
    const categoriesWithRecipes = [];
    
    for (const category of categories.slice(0, 10)) { // Check first 10 for speed
      const recipeCount = await db.collection('recipes_new').countDocuments({
        allCategories: category.path,
        publishedAt: { $exists: true }
      });
      
      console.log(`   ${category.slug}: ${recipeCount} recipes`);
      
      if (recipeCount > 0) {
        categoriesWithRecipes.push({
          slug: category.slug,
          path: category.path,
          recipeCount
        });
      }
    }
    
    console.log(`\n   Categories with recipes: ${categoriesWithRecipes.length}`);
    categoriesWithRecipes.forEach(cat => {
      console.log(`   ✅ ${cat.slug}: ${cat.recipeCount} recipes`);
    });
    
    // 3. Check specific category that should have recipes
    console.log('\n3️⃣ Checking specific category "vistiena":');
    const vistienaCat = await db.collection('categories_new').findOne({
      slug: 'vistiena',
      isActive: true
    });
    
    if (vistienaCat) {
      console.log(`   Found category: ${vistienaCat.slug} (path: ${vistienaCat.path})`);
      
      const vistienaCatRecipeCount = await db.collection('recipes_new').countDocuments({
        allCategories: vistienaCat.path,
        publishedAt: { $exists: true }
      });
      
      console.log(`   Recipe count: ${vistienaCatRecipeCount}`);
      
      // Show some recipes in this category
      const vistienaCatRecipes = await db.collection('recipes_new').find({
        allCategories: vistienaCat.path,
        publishedAt: { $exists: true }
      }).limit(3).toArray();
      
      console.log(`   Sample recipes:`);
      vistienaCatRecipes.forEach(recipe => {
        console.log(`   - ${recipe.title.lt} (slug: ${recipe.slug})`);
        console.log(`     allCategories: ${JSON.stringify(recipe.allCategories)}`);
      });
    } else {
      console.log('   ❌ Category "vistiena" not found or not active');
    }
    
    // 4. Check what allCategories values exist
    console.log('\n4️⃣ Checking unique allCategories values:');
    const uniqueCategories = await db.collection('recipes_new').distinct('allCategories', {
      publishedAt: { $exists: true }
    });
    
    console.log(`   Found ${uniqueCategories.length} unique category paths in recipes:`);
    uniqueCategories.slice(0, 10).forEach(cat => {
      console.log(`   - ${cat}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

debugSitemapCategories().catch(console.error);
