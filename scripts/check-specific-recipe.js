// Script to check the specific recipe that's showing old domain
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/receptai';

async function checkSpecificRecipe() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('🔗 Connected to MongoDB');
    
    const db = client.db();
    const collection = db.collection('recipes');
    
    // Check the recipe with slug 'bb' that was shown in the browser
    const recipe = await collection.findOne({ slug: 'bb' });
    
    if (recipe) {
      console.log('\n📄 Recipe found:');
      console.log(`   Title: ${recipe.title?.lt || 'No title'}`);
      console.log(`   Slug: ${recipe.slug}`);
      console.log(`   Author: ${JSON.stringify(recipe.author, null, 2)}`);
      console.log(`   SEO: ${JSON.stringify(recipe.seo, null, 2)}`);
      console.log(`   CanonicalUrl: ${recipe.canonicalUrl}`);
      console.log(`   SchemaOrg: ${recipe.schemaOrg ? 'Present' : 'Not present'}`);
      
      if (recipe.schemaOrg) {
        console.log('\n🔍 Schema.org data:');
        console.log(JSON.stringify(recipe.schemaOrg, null, 2));
      }
    } else {
      console.log('❌ Recipe with slug "bb" not found');
      
      // List all recipes
      const allRecipes = await collection.find({}).toArray();
      console.log('\n📋 All recipes:');
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

checkSpecificRecipe().catch(console.error);
