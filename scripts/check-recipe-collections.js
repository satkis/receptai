// Script to check what recipe collections exist and their data
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/receptai';

async function checkCollections() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('🔗 Connected to MongoDB');
    
    const db = client.db();
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('\n📋 Available collections:');
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    
    // Check recipes_new collection
    console.log('\n🔍 Checking recipes_new collection:');
    const recipesNew = await db.collection('recipes_new').find({}).limit(5).toArray();
    console.log(`   Count: ${await db.collection('recipes_new').countDocuments()}`);
    if (recipesNew.length > 0) {
      console.log(`   Sample recipe: ${recipesNew[0].title?.lt || recipesNew[0].slug}`);
      console.log(`   Has seo: ${!!recipesNew[0].seo}`);
      console.log(`   Has author: ${!!recipesNew[0].author}`);
      console.log(`   Has schemaOrg: ${!!recipesNew[0].schemaOrg}`);
    }
    
    // Check recipes collection (old)
    console.log('\n🔍 Checking recipes collection:');
    const recipes = await db.collection('recipes').find({}).limit(5).toArray();
    console.log(`   Count: ${await db.collection('recipes').countDocuments()}`);
    if (recipes.length > 0) {
      console.log(`   Sample recipe: ${recipes[0].title?.lt || recipes[0].slug}`);
      console.log(`   Has seo: ${!!recipes[0].seo}`);
      console.log(`   Has author: ${!!recipes[0].author}`);
      console.log(`   Has schemaOrg: ${!!recipes[0].schemaOrg}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

checkCollections().catch(console.error);
