// Test script to verify search filters are working
// Run: node scripts/test-search-filters.js

const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.MONGODB_DB || 'receptai';

async function testSearchFilters() {
  console.log('🧪 Testing search filters functionality...\n');

  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment variables');
    return;
  }

  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db(DATABASE_NAME);
    
    // Test 1: Basic search without filters
    console.log('1️⃣ Testing basic search for "vistiena":');
    const basicSearch = await db.collection('recipes_new').find({
      $text: { $search: 'vistiena' }
    }).limit(3).toArray();
    
    console.log(`   Found ${basicSearch.length} recipes`);
    basicSearch.forEach(recipe => {
      console.log(`   - ${recipe.title.lt}: ${recipe.totalTimeMinutes}min (${recipe.timeCategory})`);
    });
    
    // Test 2: Search with time filter
    console.log('\n2️⃣ Testing search with timeCategory "1-2-val":');
    const filteredSearch = await db.collection('recipes_new').find({
      $text: { $search: 'vistiena' },
      timeCategory: '1-2-val'
    }).limit(3).toArray();
    
    console.log(`   Found ${filteredSearch.length} recipes`);
    filteredSearch.forEach(recipe => {
      console.log(`   - ${recipe.title.lt}: ${recipe.totalTimeMinutes}min (${recipe.timeCategory})`);
    });
    
    // Test 3: Check time category distribution for "vistiena" search
    console.log('\n3️⃣ Time category distribution for "vistiena" search:');
    const timeDistribution = await db.collection('recipes_new').aggregate([
      { $match: { $text: { $search: 'vistiena' } } },
      { $group: { _id: '$timeCategory', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    timeDistribution.forEach(dist => {
      console.log(`   ${dist._id}: ${dist.count} recipes`);
    });
    
    // Test 4: Test the exact aggregation pipeline used in search
    console.log('\n4️⃣ Testing search aggregation pipeline:');
    const pipeline = [
      {
        $match: {
          $text: { $search: 'vistiena' },
          timeCategory: '1-2-val'
        }
      },
      {
        $addFields: {
          score: { $meta: "textScore" }
        }
      },
      {
        $sort: { score: { $meta: "textScore" }, publishedAt: -1 }
      },
      {
        $limit: 3
      }
    ];
    
    const pipelineResults = await db.collection('recipes_new').aggregate(pipeline).toArray();
    console.log(`   Pipeline found ${pipelineResults.length} recipes`);
    pipelineResults.forEach(recipe => {
      console.log(`   - ${recipe.title.lt}: ${recipe.totalTimeMinutes}min (${recipe.timeCategory}) [score: ${recipe.score.toFixed(2)}]`);
    });
    
    // Test 5: Check if text index exists
    console.log('\n5️⃣ Checking text indexes:');
    const indexes = await db.collection('recipes_new').indexes();
    const textIndexes = indexes.filter(index => 
      Object.values(index.key || {}).includes('text')
    );
    
    if (textIndexes.length > 0) {
      console.log('   ✅ Text indexes found:');
      textIndexes.forEach(index => {
        console.log(`   - ${index.name}: ${JSON.stringify(index.key)}`);
      });
    } else {
      console.log('   ❌ No text indexes found - this could be the issue!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

testSearchFilters().catch(console.error);
