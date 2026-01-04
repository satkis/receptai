#!/usr/bin/env node

/**
 * Wikibooks Category Recipe Scraper
 * 
 * Scrapes recipes from "Recipes with images" category starting from a specific letter
 * Saves recipe URLs to a text file
 * 
 * Usage: npm run wikibooks:scrape-category -- --letter B
 *        npm run wikibooks:scrape-category -- --letter B --output custom-output.txt
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
let startLetter = 'B';
let outputFile = null;

// Handle both formats:
// 1. node script.js --letter E --output file.txt
// 2. npm run script -- --letter E --output file.txt (npm strips -- and passes E as first arg)
// 3. npm run script -- E (positional argument)

// Check if first arg looks like a letter (single character, no dashes)
if (args.length > 0 && args[0].length === 1 && !args[0].startsWith('-')) {
  startLetter = args[0].toUpperCase();
  // Check for --output flag in remaining args
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--output' && args[i + 1]) {
      outputFile = args[i + 1];
      break;
    }
  }
} else {
  // Standard flag parsing
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--letter' && args[i + 1]) {
      startLetter = args[i + 1].toUpperCase();
      i++;
    }
    if (args[i] === '--output' && args[i + 1]) {
      outputFile = args[i + 1];
      i++;
    }
  }
}

// Set default output file based on startLetter if not provided
if (!outputFile) {
  outputFile = `scripts/wiki/wikibooks-recipes-letter-${startLetter}.txt`;
}

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

/**
 * Fetch JSON from Wikibooks API
 */
function fetchFromWikibooks(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    };

    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          log(`\n⚠️  API Response (first 200 chars): ${data.substring(0, 200)}`, 'yellow');
          reject(new Error(`Failed to parse API response: ${e.message}`));
        }
      });
    }).on('error', reject);
  });
}

/**
 * Get all recipes from category using MediaWiki API
 */
async function getRecipesFromCategory(startLetter) {
  const recipes = [];
  let continueToken = null;

  do {
    let url = 'https://en.wikibooks.org/w/api.php?action=query&list=categorymembers&cmtitle=Category:Recipes_with_images&cmlimit=500&cmtype=page&format=json';

    if (continueToken) {
      url += `&cmcontinue=${encodeURIComponent(continueToken)}`;
    }

    const data = await fetchFromWikibooks(url);
    const members = data.query.categorymembers;

    // Filter recipes that start with the specified letter
    for (const member of members) {
      const title = member.title;

      // Extract recipe name from "Cookbook:Recipe Name" format
      if (title.startsWith('Cookbook:')) {
        const recipeName = title.substring('Cookbook:'.length);

        // Check if it starts with the specified letter
        if (recipeName.charAt(0).toUpperCase() === startLetter.toUpperCase()) {
          const url = `https://en.wikibooks.org/wiki/${title.replace(/ /g, '_')}`;
          recipes.push({
            name: recipeName,
            url: url
          });
        }
      }
    }

    // Check if there are more results
    continueToken = data.continue?.cmcontinue;

  } while (continueToken);

  return recipes;
}

/**
 * Main scraping function
 */
async function scrapeRecipes() {
  logSection('WIKIBOOKS CATEGORY RECIPE SCRAPER');

  log('\n📋 Configuration:', 'cyan');
  log(`   Start Letter: ${startLetter}`, 'cyan');
  log(`   Output File: ${outputFile}`, 'cyan');

  log('\n📋 Workflow:', 'cyan');
  log('  1. Fetch all recipes from "Recipes with images" category', 'cyan');
  log(`  2. Filter recipes starting with letter "${startLetter}"`, 'cyan');
  log('  3. Save URLs to text file', 'cyan');

  try {
    log(`\n🔍 Fetching recipes starting with "${startLetter}"...`, 'cyan');
    const recipes = await getRecipesFromCategory(startLetter);

    if (recipes.length === 0) {
      log(`❌ No recipes found starting with "${startLetter}"`, 'red');
      process.exit(1);
    }

    log(`✅ Found ${recipes.length} recipes`, 'green');

    // Display recipes
    log(`\n📝 Recipes:`, 'cyan');
    recipes.forEach((recipe, index) => {
      log(`   ${index + 1}. ${recipe.name}`, 'yellow');
    });

    // Save to file
    log(`\n💾 Saving to file...`, 'cyan');
    const urlsOnly = recipes.map(r => r.url).join('\n');
    fs.writeFileSync(outputFile, urlsOnly);
    log(`✅ Saved ${recipes.length} recipe URLs to: ${outputFile}`, 'green');

    // Summary
    logSection('SCRAPING SUMMARY');
    log(`\n📊 Results:`, 'cyan');
    log(`   Letter: ${startLetter}`, 'cyan');
    log(`   Total recipes: ${recipes.length}`, 'green');
    log(`   Output file: ${outputFile}`, 'cyan');

    log(`\n📁 File contents preview:`, 'cyan');
    recipes.slice(0, 5).forEach(recipe => {
      log(`   ${recipe.url}`, 'blue');
    });
    if (recipes.length > 5) {
      log(`   ... and ${recipes.length - 5} more`, 'yellow');
    }

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run the scraper
scrapeRecipes().catch(error => {
  log(`\n❌ Unhandled error: ${error.message}`, 'red');
  process.exit(1);
});

