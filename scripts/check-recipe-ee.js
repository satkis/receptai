// Script to check if recipe with slug "ee" exists in recipes_new
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/receptai';

async function checkRecipeEE() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('🔗 Connected to MongoDB');
    
    const db = client.db('receptai');
    const collection = db.collection('recipes_new');
    
    // Check if recipe with slug "ee" exists
    const recipe = await collection.findOne({ slug: 'ee' });
    
    if (recipe) {
      console.log('✅ Recipe with slug "ee" found:');
      console.log(`   Title: ${recipe.title?.lt}`);
      console.log(`   Author: ${recipe.author?.name}`);
      console.log(`   CanonicalUrl: ${recipe.canonicalUrl}`);
      console.log(`   SEO Title: ${recipe.seo?.metaTitle}`);
    } else {
      console.log('❌ Recipe with slug "ee" not found');
      
      // List all recipes
      const allRecipes = await collection.find({}).toArray();
      console.log(`\n📋 All ${allRecipes.length} recipes in recipes_new collection:`);
      allRecipes.forEach(r => {
        console.log(`   - ${r.slug}: ${r.title?.lt || 'No title'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

checkRecipeEE().catch(console.error);
