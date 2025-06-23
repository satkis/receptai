// Script to check all collections and their contents
require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/receptai';

async function checkAllCollections() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('🔗 Connected to MongoDB');
    console.log('📍 URI:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide credentials
    
    const db = client.db('receptai');
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log(`\n📋 Found ${collections.length} collections:`);
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    
    // Check each collection for recipes
    for (const col of collections) {
      const collectionName = col.name;
      const count = await db.collection(collectionName).countDocuments();
      console.log(`\n🔍 Collection: ${collectionName} (${count} documents)`);
      
      if (count > 0) {
        const sample = await db.collection(collectionName).findOne();
        if (sample.slug || sample.title) {
          console.log(`   Sample: ${sample.slug || 'no-slug'} - ${sample.title?.lt || sample.title || 'no-title'}`);
          
          // If this looks like a recipe collection, list all slugs
          if (sample.slug && (sample.ingredients || sample.instructions)) {
            const allDocs = await db.collection(collectionName).find({}).toArray();
            console.log(`   All slugs in ${collectionName}:`);
            allDocs.forEach(doc => {
              console.log(`     - ${doc.slug}: ${doc.title?.lt || doc.title || 'no-title'}`);
            });
          }
        }
      }
    }
    
    // Specifically check for recipe with slug "ee" in all collections
    console.log('\n🔍 Searching for recipe with slug "ee" in all collections:');
    for (const col of collections) {
      const recipe = await db.collection(col.name).findOne({ slug: 'ee' });
      if (recipe) {
        console.log(`✅ Found recipe "ee" in collection: ${col.name}`);
        console.log(`   Title: ${recipe.title?.lt}`);
        console.log(`   Author: ${recipe.author?.name}`);
        break;
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

checkAllCollections().catch(console.error);
