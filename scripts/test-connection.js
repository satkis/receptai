// Test MongoDB connection
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://receptai:SXF0NrgQbiQi8EeB@cluster0.zy6ywwg.mongodb.net/receptai?retryWrites=true&w=majority';
const MONGODB_DB = 'receptai';

async function testConnection() {
  console.log('🔗 Testing MongoDB connection...');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas');
    
    const db = client.db(MONGODB_DB);
    
    // Check collections
    const collections = await db.listCollections().toArray();
    console.log('📊 Collections found:', collections.map(c => c.name));
    
    // Check recipe count
    if (collections.some(c => c.name === 'recipes')) {
      const recipeCount = await db.collection('recipes').countDocuments();
      console.log(`📝 Recipes: ${recipeCount}`);
      
      // Show a sample recipe
      const sampleRecipe = await db.collection('recipes').findOne();
      if (sampleRecipe) {
        console.log('📋 Sample recipe:', {
          title: sampleRecipe.title,
          slug: sampleRecipe.slug,
          categoryPath: sampleRecipe.categoryPath,
          hasSEO: !!sampleRecipe.seo
        });
      }
    }
    
    console.log('🎉 Connection test successful!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error);
  } finally {
    await client.close();
  }
}

testConnection();
