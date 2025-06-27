const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://receptai:SXF0NrgQbiQi8EeB@cluster0.zy6ywwg.mongodb.net/';
const DATABASE_NAME = 'receptai';

async function debugRecipe() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(DATABASE_NAME);
    
    // Check if recipe with slug "oo" exists
    const recipe = await db.collection('recipes_new').findOne({ slug: "oo" });
    
    if (recipe) {
      console.log('✅ Recipe found!');
      console.log('📝 Title:', recipe.title?.lt);
      console.log('🔗 Slug:', recipe.slug);
      console.log('🖼️ Image:', recipe.image);
      console.log('📊 Status:', recipe.status);
      console.log('🎯 Featured:', recipe.featured);
    } else {
      console.log('❌ Recipe with slug "oo" not found');
      
      // Check what recipes exist
      const allRecipes = await db.collection('recipes_new').find({}).project({ slug: 1, title: 1 }).toArray();
      console.log('\n📋 Available recipes:');
      allRecipes.forEach(r => {
        console.log(`   - ${r.slug}: ${r.title?.lt || r.title}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

debugRecipe();
