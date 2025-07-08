// Debug script to check time filter functionality
// Run: node scripts/debug-time-filters.js

const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.MONGODB_DB || 'receptai';

async function debugTimeFilters() {
  console.log('🔍 Debugging time filter functionality...\n');

  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db(DATABASE_NAME);
    
    // 1. Check total recipes
    const totalRecipes = await db.collection('recipes_new').countDocuments();
    console.log(`📊 Total recipes in database: ${totalRecipes}`);
    
    // 2. Check how many recipes have timeCategory field
    const recipesWithTimeCategory = await db.collection('recipes_new').countDocuments({
      timeCategory: { $exists: true, $ne: null }
    });
    console.log(`⏰ Recipes with timeCategory field: ${recipesWithTimeCategory}`);
    
    // 3. Check how many recipes are missing timeCategory
    const recipesWithoutTimeCategory = await db.collection('recipes_new').countDocuments({
      $or: [
        { timeCategory: { $exists: false } },
        { timeCategory: null }
      ]
    });
    console.log(`❌ Recipes missing timeCategory field: ${recipesWithoutTimeCategory}`);
    
    // 4. Check timeCategory distribution
    console.log('\n📈 Time category distribution:');
    const timeCategoryStats = await db.collection('recipes_new').aggregate([
      { $match: { timeCategory: { $exists: true, $ne: null } } },
      { $group: { _id: '$timeCategory', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    timeCategoryStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} recipes`);
    });
    
    // 5. Check a few sample recipes
    console.log('\n🔍 Sample recipes with time data:');
    const sampleRecipes = await db.collection('recipes_new')
      .find({})
      .project({
        slug: 1,
        'title.lt': 1,
        totalTimeMinutes: 1,
        timeCategory: 1
      })
      .limit(5)
      .toArray();
    
    sampleRecipes.forEach(recipe => {
      console.log(`   ${recipe.slug}: ${recipe.totalTimeMinutes}min → ${recipe.timeCategory || 'MISSING'}`);
    });
    
    // 6. Test search query with time filter
    console.log('\n🔍 Testing search with time filter "1-2-val":');
    const searchResults = await db.collection('recipes_new').find({
      $text: { $search: 'vistiena' },
      timeCategory: '1-2-val'
    }).limit(3).toArray();
    
    console.log(`   Found ${searchResults.length} recipes matching "vistiena" with 1-2 val time filter`);
    searchResults.forEach(recipe => {
      console.log(`   - ${recipe.title.lt}: ${recipe.totalTimeMinutes}min (${recipe.timeCategory})`);
    });
    
    // 7. Test without time filter
    console.log('\n🔍 Testing search without time filter:');
    const searchResultsNoFilter = await db.collection('recipes_new').find({
      $text: { $search: 'vistiena' }
    }).limit(3).toArray();
    
    console.log(`   Found ${searchResultsNoFilter.length} recipes matching "vistiena" without time filter`);
    searchResultsNoFilter.forEach(recipe => {
      console.log(`   - ${recipe.title.lt}: ${recipe.totalTimeMinutes}min (${recipe.timeCategory || 'MISSING'})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

// Function to fix missing timeCategory fields
async function fixMissingTimeCategories() {
  console.log('\n🔧 Fixing missing timeCategory fields...');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db(DATABASE_NAME);
    
    // Find recipes without timeCategory
    const recipesWithoutTimeCategory = await db.collection('recipes_new').find({
      $or: [
        { timeCategory: { $exists: false } },
        { timeCategory: null }
      ]
    }).toArray();
    
    console.log(`Found ${recipesWithoutTimeCategory.length} recipes to fix`);
    
    let fixedCount = 0;
    
    for (const recipe of recipesWithoutTimeCategory) {
      const totalTime = recipe.totalTimeMinutes || 30;
      let timeCategory = 'virs-2-val';
      
      if (totalTime <= 30) timeCategory = 'iki-30-min';
      else if (totalTime <= 60) timeCategory = '30-60-min';
      else if (totalTime <= 120) timeCategory = '1-2-val';
      
      await db.collection('recipes_new').updateOne(
        { _id: recipe._id },
        { $set: { timeCategory: timeCategory } }
      );
      
      fixedCount++;
      
      if (fixedCount % 10 === 0) {
        console.log(`   Fixed ${fixedCount}/${recipesWithoutTimeCategory.length} recipes`);
      }
    }
    
    console.log(`✅ Fixed ${fixedCount} recipes with missing timeCategory`);
    
  } catch (error) {
    console.error('❌ Error fixing timeCategory:', error);
  } finally {
    await client.close();
  }
}

// Main execution
async function main() {
  await debugTimeFilters();
  
  // Ask if user wants to fix missing timeCategory fields
  console.log('\n❓ Do you want to fix missing timeCategory fields? (y/n)');
  
  // For now, just run the fix automatically in debug mode
  if (process.argv.includes('--fix')) {
    await fixMissingTimeCategories();
    console.log('\n🔄 Re-running diagnostics after fix...');
    await debugTimeFilters();
  } else {
    console.log('\n💡 To fix missing timeCategory fields, run: node scripts/debug-time-filters.js --fix');
  }
}

main().catch(console.error);
