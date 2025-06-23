// Script to check the actual recipe data structure
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/receptai';

async function checkRecipeData() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('🔗 Connected to MongoDB');
    
    const db = client.db();
    const collection = db.collection('recipes');
    
    // Get the first recipe
    const recipe = await collection.findOne({ slug: 'tradiciniai-cepelinai' });
    
    if (recipe) {
      console.log('\n📄 Full recipe data:');
      console.log(JSON.stringify(recipe, null, 2));
    } else {
      console.log('❌ Recipe not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

checkRecipeData().catch(console.error);
