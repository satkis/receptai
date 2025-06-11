// MongoDB Collection Creation and Indexing Script
// Run this script to create the new optimized collections

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://username:password@cluster.mongodb.net/receptai';

async function createCollections() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('🗄️ Creating new collections...');
    
    // Create collections
    await db.createCollection("categories_new");
    await db.createCollection("tags_new");
    await db.createCollection("recipes_new");
    await db.createCollection("page_configs");
    
    console.log('✅ Collections created successfully');
    
    // Create indexes for categories_new
    console.log('📊 Creating indexes for categories_new...');
    await db.collection("categories_new").createIndex({ "path": 1 }, { unique: true });
    await db.collection("categories_new").createIndex({ "parentId": 1, "sortOrder": 1 });
    await db.collection("categories_new").createIndex({ "level": 1, "isActive": 1 });
    await db.collection("categories_new").createIndex({ "slug": 1 });
    
    // Create indexes for tags_new
    console.log('📊 Creating indexes for tags_new...');
    await db.collection("tags_new").createIndex({ "slug": 1 }, { unique: true });
    await db.collection("tags_new").createIndex({ "name": 1 }, { unique: true });
    await db.collection("tags_new").createIndex({ "recipeCount": -1 });
    await db.collection("tags_new").createIndex({ "popularityScore": -1 });
    
    // Create indexes for recipes_new
    console.log('📊 Creating indexes for recipes_new...');
    await db.collection("recipes_new").createIndex({ "slug": 1 }, { unique: true });
    await db.collection("recipes_new").createIndex({ "categoryPath": 1, "publishedAt": -1 });
    await db.collection("recipes_new").createIndex({ "categoryIds": 1, "rating.average": -1 });
    await db.collection("recipes_new").createIndex({ "tags": 1, "publishedAt": -1 });
    await db.collection("recipes_new").createIndex({ "publishedAt": -1 });
    await db.collection("recipes_new").createIndex({ "title.lt": "text", "description.lt": "text", "tags": "text" });
    
    // Create indexes for page_configs
    console.log('📊 Creating indexes for page_configs...');
    await db.collection("page_configs").createIndex({ "path": 1 }, { unique: true });
    await db.collection("page_configs").createIndex({ "pageType": 1 });
    
    console.log('✅ All indexes created successfully');
    
    // Verify collections
    const collections = await db.listCollections().toArray();
    const newCollections = collections.filter(col => 
      ['categories_new', 'tags_new', 'recipes_new', 'page_configs'].includes(col.name)
    );
    
    console.log('📋 Created collections:', newCollections.map(col => col.name));
    
  } catch (error) {
    console.error('❌ Error creating collections:', error);
    throw error;
  } finally {
    await client.close();
  }
}

// Run the script
if (require.main === module) {
  createCollections()
    .then(() => {
      console.log('🎉 Collection creation completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Collection creation failed:', error);
      process.exit(1);
    });
}

module.exports = { createCollections };
