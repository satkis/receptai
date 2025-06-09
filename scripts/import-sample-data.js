// Import Sample Data Script
// Run with: node scripts/import-sample-data.js

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'receptai';

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

async function importSampleData() {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log('🚀 Connecting to MongoDB Atlas...');
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas');

    const db = client.db(MONGODB_DB);

    // 1. Import page_configs
    console.log('📄 Importing page configurations...');
    const pageConfigsData = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../sample-data/page_configs_sample.json'), 'utf8')
    );
    
    await db.collection('page_configs').deleteMany({}); // Clear existing
    const pageConfigsResult = await db.collection('page_configs').insertMany(pageConfigsData);
    console.log(`✅ Imported ${pageConfigsResult.insertedCount} page configurations`);

    // 2. Import filter_definitions
    console.log('🏷️ Importing filter definitions...');
    const filterDefinitionsData = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../sample-data/filter_definitions_sample.json'), 'utf8')
    );
    
    await db.collection('filter_definitions').deleteMany({}); // Clear existing
    const filterDefinitionsResult = await db.collection('filter_definitions').insertMany(filterDefinitionsData);
    console.log(`✅ Imported ${filterDefinitionsResult.insertedCount} filter definitions`);

    // 3. Import enhanced recipes
    console.log('🍽️ Importing enhanced recipes...');
    const recipesData = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../sample-data/enhanced_recipes_sample.json'), 'utf8')
    );
    
    // Clear existing sample recipes (optional - comment out if you want to keep existing)
    // await db.collection('recipes').deleteMany({});
    
    const recipesResult = await db.collection('recipes').insertMany(recipesData);
    console.log(`✅ Imported ${recipesResult.insertedCount} enhanced recipes`);

    // 4. Import groups
    console.log('🏷️ Importing groups...');
    const groupsData = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../sample-data/groups_sample.json'), 'utf8')
    );
    
    await db.collection('groups').deleteMany({}); // Clear existing
    const groupsResult = await db.collection('groups').insertMany(groupsData);
    console.log(`✅ Imported ${groupsResult.insertedCount} groups`);

    // 5. Import categories
    console.log('📂 Importing categories...');
    const categoriesData = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../sample-data/categories_sample.json'), 'utf8')
    );
    
    await db.collection('categories').deleteMany({}); // Clear existing
    const categoriesResult = await db.collection('categories').insertMany(categoriesData);
    console.log(`✅ Imported ${categoriesResult.insertedCount} categories`);

    // 6. Create optimized indexes
    console.log('🔍 Creating optimized indexes...');
    
    // Drop existing indexes (except _id)
    try {
      const existingIndexes = await db.collection('recipes').listIndexes().toArray();
      for (const index of existingIndexes) {
        if (index.name !== '_id_') {
          await db.collection('recipes').dropIndex(index.name);
        }
      }
    } catch (e) {
      // Indexes might not exist
    }

    // Create new optimized indexes
    await db.collection('recipes').createIndex({ 
      "status": 1, 
      "categories.mealType": 1, 
      "categories.mainIngredient": 1,
      "timing.totalTimeMinutes": 1,
      "rating.average": -1
    }, { 
      name: "recipes_category_time_rating",
      background: true 
    });

    await db.collection('recipes').createIndex({ 
      "status": 1, 
      "categories.dietary": 1, 
      "categories.cuisine": 1,
      "timing.totalTimeMinutes": 1
    }, { 
      name: "recipes_dietary_cuisine_time",
      background: true 
    });

    await db.collection('recipes').createIndex({ 
      "status": 1,
      "categories.timeRequired": 1,
      "categories.mealType": 1,
      "rating.average": -1,
      "createdAt": -1
    }, { 
      name: "recipes_time_meal_rating",
      background: true 
    });

    await db.collection('recipes').createIndex({ 
      "slug": 1 
    }, { 
      name: "recipes_slug_unique",
      unique: true,
      background: true 
    });

    // Supporting collection indexes
    await db.collection('page_configs').createIndex({ slug: 1 }, { unique: true, background: true });
    await db.collection('filter_definitions').createIndex({ type: 1, active: 1, order: 1 }, { background: true });
    await db.collection('groups').createIndex({ slug: 1 }, { background: true });
    await db.collection('categories').createIndex({ type: 1, active: 1 }, { background: true });

    console.log('✅ Created optimized indexes');

    console.log('');
    console.log('🎉 Sample data import complete!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   - Page configurations: ${pageConfigsResult.insertedCount}`);
    console.log(`   - Filter definitions: ${filterDefinitionsResult.insertedCount}`);
    console.log(`   - Enhanced recipes: ${recipesResult.insertedCount}`);
    console.log(`   - Groups: ${groupsResult.insertedCount}`);
    console.log(`   - Categories: ${categoriesResult.insertedCount}`);
    console.log(`   - Indexes: 8 created`);
    console.log('');
    console.log('🚀 Ready to test!');
    console.log('   Visit: http://localhost:3000/receptai/sumustiniai');
    console.log('   Visit: http://localhost:3000/receptai/vistiena');
    console.log('   Visit: http://localhost:3000/receptai/vegetariski');

  } catch (error) {
    console.error('❌ Error importing sample data:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Run the import
importSampleData();
