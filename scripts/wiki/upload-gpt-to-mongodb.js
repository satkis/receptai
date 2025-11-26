#!/usr/bin/env node

/**
 * Upload ChatGPT Converted Recipes to MongoDB
 *
 * Reads all JSON files from scripts/wiki/output/chatGPT/
 * Imports them to MongoDB receptai.recipes_new collection
 * Moves successfully uploaded files to uploaded-to-mongodb/ folder
 *
 * Usage: npm run upload-gpt-to-mongodb
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const CHATGPT_DIR = 'scripts/wiki/output/chatGPT';
const UPLOADED_DIR = path.join(CHATGPT_DIR, 'uploaded-to-mongodb');
const WIKI_OUTPUT_DIR = 'scripts/wiki/output';
const WIKI_PROCESSED_DIR = path.join(WIKI_OUTPUT_DIR, 'processed', 'wiki-raw-recipes');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log('\n╔════════════════════════════════════════════════════════════════╗', 'cyan');
  log(`║  ${title.padEnd(62)}║`, 'cyan');
  log('╚════════════════════════════════════════════════════════════════╝', 'cyan');
}

async function ensureUploadedDir() {
  if (!fs.existsSync(UPLOADED_DIR)) {
    fs.mkdirSync(UPLOADED_DIR, { recursive: true });
    log(`📁 Created directory: ${UPLOADED_DIR}`, 'green');
  }
}

async function ensureProcessedDir() {
  if (!fs.existsSync(WIKI_PROCESSED_DIR)) {
    fs.mkdirSync(WIKI_PROCESSED_DIR, { recursive: true });
    log(`📁 Created directory: ${WIKI_PROCESSED_DIR}`, 'green');
  }
}

/**
 * Move original wiki JSON file to processed folder
 * Looks for file matching pattern: {slug}-wikibooks-raw.json
 */
function moveOriginalWikiJson(slug) {
  try {
    // Look for the original wiki JSON file
    const files = fs.readdirSync(WIKI_OUTPUT_DIR);
    const wikiJsonFile = files.find(f =>
      f.includes(slug) && f.includes('-wikibooks-raw.json')
    );

    if (wikiJsonFile) {
      const sourcePath = path.join(WIKI_OUTPUT_DIR, wikiJsonFile);
      const destPath = path.join(WIKI_PROCESSED_DIR, wikiJsonFile);

      fs.copyFileSync(sourcePath, destPath);
      fs.unlinkSync(sourcePath);
      log(`   📁 Moved original wiki JSON to processed/wiki-raw-recipes/`, 'green');
      return true;
    }
  } catch (error) {
    // Silently ignore if file not found - it's optional
    log(`   ⚠️  Original wiki JSON not found (optional)`, 'yellow');
  }
  return false;
}

async function connectMongoDB() {
  const mongoUri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || 'receptai';

  if (!mongoUri) {
    log('❌ Error: MONGODB_URI not set in environment variables', 'red');
    log('   Check your .env.local file', 'red');
    process.exit(1);
  }

  try {
    const client = new MongoClient(mongoUri);
    await client.connect();
    log('✅ Connected to MongoDB', 'green');
    return { client, db: client.db(dbName) };
  } catch (error) {
    log(`❌ MongoDB connection failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

async function uploadRecipes() {
  logSection('UPLOADING RECIPES TO MONGODB');

  // Get all JSON files
  const files = fs.readdirSync(CHATGPT_DIR)
    .filter(f => f.endsWith('.json') && !f.includes('uploaded-to-mongodb'))
    .sort();

  if (files.length === 0) {
    log('⚠️  No recipes to upload', 'yellow');
    return { total: 0, successful: 0, failed: 0 };
  }

  log(`\n📋 Found ${files.length} recipes to upload`, 'cyan');

  // Connect to MongoDB
  const { client, db } = await connectMongoDB();
  const collection = db.collection('recipes_new');

  let successful = 0;
  let failed = 0;

  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filePath = path.join(CHATGPT_DIR, file);
      const recipeName = file.replace('.json', '');

      log(`\n[${i + 1}/${files.length}] Uploading: ${recipeName}`, 'yellow');

      try {
        // Read JSON file
        const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        // Check if recipe already exists by slug
        const existingRecipe = await collection.findOne({ slug: jsonData.slug });

        if (existingRecipe) {
          log(`   ⚠️  Recipe already exists (slug: ${jsonData.slug})`, 'yellow');
          log(`   📝 Updating existing recipe...`, 'yellow');
          
          // Update existing recipe
          await collection.updateOne(
            { slug: jsonData.slug },
            { $set: jsonData }
          );
          log(`   ✅ Updated successfully`, 'green');
        } else {
          // Insert new recipe
          const result = await collection.insertOne(jsonData);
          log(`   ✅ Inserted successfully (ID: ${result.insertedId})`, 'green');
        }

        successful++;

        // Move ChatGPT converted recipe to uploaded folder
        const destPath = path.join(UPLOADED_DIR, file);
        fs.copyFileSync(filePath, destPath);
        fs.unlinkSync(filePath);
        log(`   📁 Moved to uploaded-to-mongodb/`, 'green');

        // Move original wiki JSON to processed folder
        moveOriginalWikiJson(jsonData.slug);

      } catch (error) {
        log(`   ❌ Upload failed: ${error.message}`, 'red');
        failed++;
      }
    }
  } finally {
    await client.close();
    log('\n✅ Disconnected from MongoDB', 'green');
  }

  return { total: files.length, successful, failed };
}

async function main() {
  logSection('MONGODB RECIPE UPLOAD');

  log('\n📋 Workflow:', 'cyan');
  log('  1. Read all JSON files from scripts/wiki/output/chatGPT/', 'cyan');
  log('  2. Upload to MongoDB receptai.recipes_new collection', 'cyan');
  log('  3. Move ChatGPT JSON to uploaded-to-mongodb/', 'cyan');
  log('  4. Move original wiki JSON to processed/wiki-raw-recipes/', 'cyan');

  // Ensure directories exist
  await ensureUploadedDir();
  await ensureProcessedDir();

  // Upload recipes
  const results = await uploadRecipes();

  // Summary
  logSection('UPLOAD SUMMARY');
  log(`\n📊 Results:`, 'cyan');
  log(`   Total recipes: ${results.total}`, 'cyan');
  log(`   ✅ Successful: ${results.successful}`, 'green');
  log(`   ❌ Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');

  if (results.successful > 0) {
    log(`\n✅ Recipes uploaded to MongoDB!`, 'green');
    log(`\n📁 Uploaded files moved to:`, 'cyan');
    log(`   ${UPLOADED_DIR}`, 'cyan');
    log(`\n🌐 Next steps:`, 'cyan');
    log(`   1. Visit https://ragaujam.lt/receptas/{slug}`, 'cyan');
    log(`   2. Verify recipes display correctly`, 'cyan');
    log(`   3. Check MongoDB for any issues`, 'cyan');
  }

  if (results.failed > 0) {
    log(`\n⚠️  ${results.failed} recipe(s) failed to upload`, 'yellow');
    log(`   Check the error messages above for details`, 'yellow');
  }

  logSection('UPLOAD COMPLETE');
  process.exit(results.failed > 0 ? 1 : 0);
}

main().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});

