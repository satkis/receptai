#!/usr/bin/env node

/**
 * Check which problematic recipes exist in MongoDB
 */

require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

const PROBLEM_SLUGS = [
  'gvakamole-padazas-su-traskuciais-meksikietiskai',
  'lasisa-su-giliu-miltais',
  'obuoliu-pyragas-klasikinis1',
  'spageti-alla-carbonara',
  'sumustinis-su-zemesiupes-sviestu-ir-uogiene',
  'vistiena-zaliajame-padaze',
  'alzirietiskas-kuskusas',
  'alziriskas-kuskusas-su-mesa-ir-darzovemis'
];

async function checkRecipes() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    console.log('🔗 Connecting to MongoDB...\n');
    await client.connect();

    const db = client.db(process.env.MONGODB_DB || 'receptai');
    const collection = db.collection('recipes_new');

    console.log('🔍 Checking problematic recipes...\n');
    
    let found = 0;
    let missing = 0;

    for (const slug of PROBLEM_SLUGS) {
      const recipe = await collection.findOne({ slug });
      if (recipe) {
        console.log(`✅ Found: ${slug}`);
        console.log(`   Title: ${recipe.title?.lt || 'N/A'}`);
        console.log(`   Status: ${recipe.status || 'N/A'}\n`);
        found++;
      } else {
        console.log(`❌ Missing: ${slug}\n`);
        missing++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Found: ${found}`);
    console.log(`   Missing: ${missing}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

checkRecipes();

