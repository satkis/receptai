#!/usr/bin/env node

/**
 * Delete test/dummy recipes from MongoDB
 * These are recipes with test slugs like 'aa', 'aaa', 'bb', etc.
 */

require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

const TEST_SLUGS = [
  'aa', 'aaa', 'aaaa',
  'bb', 'ccc', 'dd',
  'jj', 'll', 'no',
  'oo', 'qq', 'sriubaa'
];

async function deleteTestRecipes() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    console.log('🔗 Connecting to MongoDB...');
    await client.connect();

    const db = client.db(process.env.MONGODB_DB || 'receptai');
    const collection = db.collection('recipes_new');

    console.log(`\n🗑️  Deleting ${TEST_SLUGS.length} test recipes...\n`);

    for (const slug of TEST_SLUGS) {
      const result = await collection.deleteOne({ slug });
      if (result.deletedCount > 0) {
        console.log(`✅ Deleted: ${slug}`);
      } else {
        console.log(`⚠️  Not found: ${slug}`);
      }
    }

    console.log('\n✅ Test recipes deleted successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Rebuild sitemap: npm run build');
    console.log('   2. Resubmit sitemap to Google Search Console');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

deleteTestRecipes();

