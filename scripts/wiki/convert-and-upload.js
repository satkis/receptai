#!/usr/bin/env node

/**
 * Wikibooks Recipe Conversion & Upload Workflow
 * 
 * Workflow:
 * 1. Extract recipes from Wikibooks URLs (npm run wiki:extract)
 * 2. Convert all extracted recipes to MongoDB format
 * 3. Move successfully converted files to processed folder
 * 
 * Usage: npm run convert-and-upload
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const OUTPUT_DIR = 'scripts/wiki/output';
const CHATGPT_DIR = path.join(OUTPUT_DIR, 'chatGPT');
const PROCESSED_DIR = path.join(OUTPUT_DIR, 'processed');
const PROCESSED_JSON_DIR = path.join(PROCESSED_DIR, 'wiki_json_raw');

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

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runStep(stepName, command) {
  log(`\n📋 ${stepName}...`, 'blue');
  try {
    execSync(command, { stdio: 'inherit', cwd: process.cwd() });
    log(`✅ ${stepName} completed`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${stepName} failed`, 'red');
    return false;
  }
}

async function convertRecipes() {
  log('\n🔄 Converting recipes...', 'blue');
  
  const files = fs.readdirSync(OUTPUT_DIR)
    .filter(f => f.endsWith('-wikibooks-raw.json'))
    .sort();

  if (files.length === 0) {
    log('⚠️  No recipes to convert', 'yellow');
    return { total: 0, successful: 0, failed: 0 };
  }

  log(`Found ${files.length} recipes to convert`, 'cyan');

  let successful = 0;
  let failed = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(OUTPUT_DIR, file);
    const recipeName = file.replace('-wikibooks-raw.json', '');

    log(`\n[${i + 1}/${files.length}] Converting: ${recipeName}`, 'yellow');

    try {
      execSync(
        `node scripts/wiki/convert-wikibooks-with-assistant.js "${filePath}"`,
        { stdio: 'pipe', cwd: process.cwd() }
      );
      log(`   ✅ Converted successfully`, 'green');
      successful++;

      // Move to processed folder
      const destPath = path.join(PROCESSED_JSON_DIR, file);
      fs.copyFileSync(filePath, destPath);
      fs.unlinkSync(filePath);
      log(`   📁 Moved to processed folder`, 'green');

      // Wait between requests to avoid rate limiting
      if (i < files.length - 1) {
        log(`   ⏳ Waiting 2 seconds before next conversion...`, 'cyan');
        await sleep(2000);
      }
    } catch (error) {
      log(`   ❌ Conversion failed`, 'red');
      failed++;
    }
  }

  return { total: files.length, successful, failed };
}

async function main() {
  logSection('WIKIBOOKS RECIPE CONVERSION WORKFLOW');

  log('\n📋 Workflow Steps:', 'cyan');
  log('  1. Extract recipes from Wikibooks (npm run wiki:extract)', 'cyan');
  log('  2. Convert all recipes to MongoDB format', 'cyan');
  log('  3. Move successfully converted files to processed folder', 'cyan');

  // Step 1: Extract recipes
  logSection('STEP 1: EXTRACT RECIPES FROM WIKIBOOKS');
  const extractSuccess = await runStep(
    'Extracting recipes from Wikibooks',
    'npm run wiki:extract'
  );

  if (!extractSuccess) {
    log('\n⚠️  Extraction failed. Continuing with existing files...', 'yellow');
  }

  // Step 2: Convert recipes
  logSection('STEP 2: CONVERT RECIPES TO MONGODB FORMAT');
  const results = await convertRecipes();

  // Step 3: Summary
  logSection('CONVERSION SUMMARY');
  log(`\n📊 Results:`, 'cyan');
  log(`   Total recipes: ${results.total}`, 'cyan');
  log(`   ✅ Successful: ${results.successful}`, 'green');
  log(`   ❌ Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');

  if (results.successful > 0) {
    log(`\n📁 Converted recipes saved to:`, 'cyan');
    log(`   ${CHATGPT_DIR}`, 'cyan');
    log(`\n📋 Next steps:`, 'cyan');
    log(`   1. Review converted recipes in ${CHATGPT_DIR}`, 'cyan');
    log(`   2. Import to MongoDB using MongoDB Compass`, 'cyan');
    log(`   3. Verify recipes on website`, 'cyan');
  }

  if (results.failed > 0) {
    log(`\n⚠️  ${results.failed} recipe(s) failed to convert`, 'yellow');
    log(`   Check the error messages above for details`, 'yellow');
  }

  logSection('WORKFLOW COMPLETE');
  process.exit(results.failed > 0 ? 1 : 0);
}

main().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});

