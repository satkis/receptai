// Debug script to check recipes in database
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://receptai:SXF0NrgQbiQi8EeB@cluster0.zy6ywwg.mongodb.net/receptai?retryWrites=true&w=majority';

async function debugRecipes() {
  console.log('🔍 Debugging recipes in database...');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('receptai');
    
    // Count total recipes
    const totalCount = await db.collection('recipes_new').countDocuments();
    console.log(`📊 Total recipes in collection: ${totalCount}`);
    
    // Get all recipes with basic info
    const recipes = await db.collection('recipes_new')
      .find({})
      .project({
        slug: 1,
        title: 1,
        status: 1,
        primaryCategoryPath: 1,
        createdAt: 1
      })
      .limit(10)
      .toArray();
    
    console.log('\n📋 Recipe details:');
    recipes.forEach((recipe, index) => {
      console.log(`${index + 1}. Slug: "${recipe.slug}"`);
      console.log(`   Title: ${JSON.stringify(recipe.title)}`);
      console.log(`   Status: ${recipe.status || 'undefined'}`);
      console.log(`   Category: ${recipe.primaryCategoryPath || 'undefined'}`);
      console.log(`   Created: ${recipe.createdAt || 'undefined'}`);
      console.log('');
    });
    
    // Test the query used in the app
    console.log('🔍 Testing app query...');
    const appQuery = {
      status: { $ne: 'draft' }
    };
    
    const appResults = await db.collection('recipes_new')
      .find(appQuery)
      .limit(5)
      .toArray();
    
    console.log(`📊 App query results: ${appResults.length} recipes found`);
    
    // Test specific recipe by slug
    console.log('\n🔍 Testing specific recipe lookup...');
    const specificRecipe = await db.collection('recipes_new').findOne({ slug: 'aaaaa' });
    
    if (specificRecipe) {
      console.log('✅ Found recipe with slug "aaaaa"');
      console.log(`   Title: ${JSON.stringify(specificRecipe.title)}`);
      console.log(`   Status: ${specificRecipe.status || 'undefined'}`);
    } else {
      console.log('❌ No recipe found with slug "aaaaa"');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

debugRecipes();
