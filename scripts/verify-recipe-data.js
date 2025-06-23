// Script to verify the transformed recipe data
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/receptai';

async function verifyRecipeData() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('🔗 Connected to MongoDB');
    
    const db = client.db();
    const collection = db.collection('recipes');
    
    // Get the specific recipe
    const recipe = await collection.findOne({ slug: 'tradiciniai-cepelinai' });
    
    if (recipe) {
      console.log('\n📄 Recipe found:');
      console.log(`   Title: ${recipe.title?.lt}`);
      console.log(`   Slug: ${recipe.slug}`);
      console.log(`   Servings: ${recipe.servings} (type: ${typeof recipe.servings})`);
      console.log(`   ServingsUnit: ${recipe.servingsUnit}`);
      console.log(`   Image: ${JSON.stringify(recipe.image)}`);
      console.log(`   Ingredients count: ${recipe.ingredients?.length}`);
      console.log(`   Tags: ${recipe.tags}`);
      console.log(`   Author: ${JSON.stringify(recipe.author)}`);
      console.log(`   Status: ${recipe.status}`);
      console.log(`   Language: ${recipe.language}`);
      
      if (recipe.ingredients && recipe.ingredients.length > 0) {
        console.log('\n🥕 First ingredient:');
        console.log(JSON.stringify(recipe.ingredients[0], null, 2));
      }
      
      if (recipe.instructions && recipe.instructions.length > 0) {
        console.log('\n📝 First instruction:');
        console.log(JSON.stringify(recipe.instructions[0], null, 2));
      }
      
    } else {
      console.log('❌ Recipe with slug "tradiciniai-cepelinai" not found');
      
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

verifyRecipeData().catch(console.error);
