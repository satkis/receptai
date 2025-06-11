// Master Migration Script
// Runs all migration steps in the correct order

const { createCollections } = require('./01-create-collections');
const { populateCategories } = require('./02-populate-categories');
const { migrateRecipes } = require('./03-migrate-recipes');
const { populateTags } = require('./04-populate-tags');

async function runFullMigration() {
  console.log('🚀 Starting full database migration...');
  console.log('=====================================');
  
  try {
    // Step 1: Create collections and indexes
    console.log('\n📋 STEP 1: Creating collections and indexes');
    console.log('-------------------------------------------');
    await createCollections();
    console.log('✅ Step 1 completed successfully');
    
    // Step 2: Populate category structure
    console.log('\n🌳 STEP 2: Populating category structure');
    console.log('----------------------------------------');
    await populateCategories();
    console.log('✅ Step 2 completed successfully');
    
    // Step 3: Migrate recipes
    console.log('\n📝 STEP 3: Migrating recipes');
    console.log('----------------------------');
    await migrateRecipes();
    console.log('✅ Step 3 completed successfully');
    
    // Step 4: Populate tags
    console.log('\n🏷️ STEP 4: Populating tags');
    console.log('---------------------------');
    await populateTags();
    console.log('✅ Step 4 completed successfully');
    
    console.log('\n🎉 MIGRATION COMPLETED SUCCESSFULLY!');
    console.log('=====================================');
    console.log('✅ All collections created and populated');
    console.log('✅ Recipes migrated with new categorization');
    console.log('✅ Tags extracted and organized');
    console.log('✅ Indexes created for optimal performance');
    console.log('\nNext steps:');
    console.log('1. Test the new database structure');
    console.log('2. Update frontend to use new collections');
    console.log('3. Implement new URL routing');
    console.log('4. Deploy and test');
    
  } catch (error) {
    console.error('\n💥 MIGRATION FAILED!');
    console.error('====================');
    console.error('Error:', error.message);
    console.error('\nPlease check the error above and fix any issues before retrying.');
    console.error('You may need to clean up partial migration data.');
    
    throw error;
  }
}

// Cleanup function to remove new collections if migration fails
async function cleanupMigration() {
  const { MongoClient } = require('mongodb');
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://username:password@cluster.mongodb.net/receptai';
  
  console.log('🧹 Cleaning up migration data...');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    // Drop new collections
    const collectionsToCleanup = ['categories_new', 'tags_new', 'recipes_new', 'page_configs'];
    
    for (const collectionName of collectionsToCleanup) {
      try {
        await db.collection(collectionName).drop();
        console.log(`✅ Dropped collection: ${collectionName}`);
      } catch (error) {
        if (error.message.includes('ns not found')) {
          console.log(`ℹ️ Collection ${collectionName} doesn't exist, skipping`);
        } else {
          console.error(`❌ Error dropping ${collectionName}:`, error.message);
        }
      }
    }
    
    console.log('✅ Cleanup completed');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    await client.close();
  }
}

// Verification function to check migration results
async function verifyMigration() {
  const { MongoClient } = require('mongodb');
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://username:password@cluster.mongodb.net/receptai';
  
  console.log('🔍 Verifying migration results...');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    // Check collections exist
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);
    
    const requiredCollections = ['categories_new', 'tags_new', 'recipes_new', 'page_configs'];
    const missingCollections = requiredCollections.filter(name => !collectionNames.includes(name));
    
    if (missingCollections.length > 0) {
      console.error('❌ Missing collections:', missingCollections);
      return false;
    }
    
    // Check data counts
    const categoriesCount = await db.collection('categories_new').countDocuments();
    const recipesCount = await db.collection('recipes_new').countDocuments();
    const tagsCount = await db.collection('tags_new').countDocuments();
    
    console.log('📊 Migration Results:');
    console.log(`  Categories: ${categoriesCount}`);
    console.log(`  Recipes: ${recipesCount}`);
    console.log(`  Tags: ${tagsCount}`);
    
    // Check for required indexes
    const recipeIndexes = await db.collection('recipes_new').indexes();
    const hasSlugIndex = recipeIndexes.some(idx => idx.key && idx.key.slug);
    const hasCategoryIndex = recipeIndexes.some(idx => idx.key && idx.key.categoryPath);
    
    if (!hasSlugIndex || !hasCategoryIndex) {
      console.error('❌ Missing required indexes');
      return false;
    }
    
    // Sample data check
    const sampleRecipe = await db.collection('recipes_new').findOne({});
    if (!sampleRecipe || !sampleRecipe.categoryPath || !sampleRecipe.tags) {
      console.error('❌ Recipe data structure is incomplete');
      return false;
    }
    
    console.log('✅ Migration verification passed');
    return true;
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
    return false;
  } finally {
    await client.close();
  }
}

// Command line interface
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'migrate':
      await runFullMigration();
      break;
      
    case 'cleanup':
      await cleanupMigration();
      break;
      
    case 'verify':
      const isValid = await verifyMigration();
      process.exit(isValid ? 0 : 1);
      break;
      
    case 'help':
    default:
      console.log('🛠️ Database Migration Tool');
      console.log('==========================');
      console.log('');
      console.log('Usage: node run-migration.js [command]');
      console.log('');
      console.log('Commands:');
      console.log('  migrate  - Run full migration (default)');
      console.log('  cleanup  - Remove migration collections');
      console.log('  verify   - Verify migration results');
      console.log('  help     - Show this help message');
      console.log('');
      console.log('Environment Variables:');
      console.log('  MONGODB_URI - MongoDB connection string');
      console.log('');
      console.log('Examples:');
      console.log('  node run-migration.js migrate');
      console.log('  node run-migration.js verify');
      console.log('  node run-migration.js cleanup');
      
      if (command && command !== 'help') {
        console.log(`\n❌ Unknown command: ${command}`);
        process.exit(1);
      }
      break;
  }
}

// Run the script
if (require.main === module) {
  main()
    .then(() => {
      if (process.argv[2] === 'migrate') {
        console.log('\n🎯 Migration completed! Run "node run-migration.js verify" to check results.');
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Script failed:', error.message);
      process.exit(1);
    });
}

module.exports = {
  runFullMigration,
  cleanupMigration,
  verifyMigration
};
