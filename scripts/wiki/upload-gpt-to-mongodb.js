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

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const CHATGPT_DIR = 'scripts/wiki/output/chatGPT';
const UPLOADED_DIR = path.join(CHATGPT_DIR, 'uploaded-to-mongodb');

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

        // Move to uploaded folder
        const destPath = path.join(UPLOADED_DIR, file);
        fs.copyFileSync(filePath, destPath);
        fs.unlinkSync(filePath);
        log(`   📁 Moved to uploaded-to-mongodb/`, 'green');

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
  log('  3. Move successfully uploaded files to uploaded-to-mongodb/', 'cyan');

  // Ensure uploaded directory exists
  await ensureUploadedDir();

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

