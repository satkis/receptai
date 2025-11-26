#!/usr/bin/env node

/**
 * Wikibooks Recipe Image Scraper
 * 
 * Crawls through all Wikibooks recipes and identifies which ones have images
 * Saves URLs of recipes with images to a text file
 * 
 * Usage: npm run wikibooks:scrape-images
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = 'scripts/wiki/wikibooks-recipes-with-images.txt';
const RECIPES_WITH_IMAGES_FILE = 'scripts/wiki/wikibooks-recipes-with-images-urls.txt';
const RECIPES_WITHOUT_IMAGES_FILE = 'scripts/wiki/wikibooks-recipes-without-images-urls.txt';

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
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

/**
 * Get all recipe categories from Wikibooks
 * Uses the category listing API
 */
async function getAllRecipeCategories() {
  log('📚 Fetching recipe categories from Wikibooks...', 'cyan');
  
  const url = 'https://en.wikibooks.org/w/api.php?action=query&list=categorymembers&cmtitle=Category:Recipes&cmlimit=500&format=json';
  
  try {
    const data = await fetchFromWikibooks(url);
    const categories = data.query.categorymembers;
    log(`✅ Found ${categories.length} recipe categories`, 'green');
    return categories;
  } catch (error) {
    log(`❌ Error fetching categories: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Check if a recipe has an image by checking its categories
 */
async function recipeHasImage(recipeTitle) {
  try {
    const url = `https://en.wikibooks.org/w/api.php?action=query&titles=${encodeURIComponent(recipeTitle)}&prop=categories&format=json`;
    const data = await fetchFromWikibooks(url);
    
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
    const page = pages[pageId];
    
    if (!page.categories) {
      return false;
    }
    
    // Check if "Recipes with images" category is present
    const hasImageCategory = page.categories.some(cat => 
      cat.title === 'Category:Recipes with images'
    );
    
    return hasImageCategory;
  } catch (error) {
    log(`⚠️  Error checking recipe ${recipeTitle}: ${error.message}`, 'yellow');
    return false;
  }
}

/**
 * Get all recipes from a specific category
 */
async function getRecipesFromCategory(categoryTitle, continueToken = null) {
  try {
    let url = `https://en.wikibooks.org/w/api.php?action=query&list=categorymembers&cmtitle=${encodeURIComponent(categoryTitle)}&cmlimit=500&cmtype=page&format=json`;
    
    if (continueToken) {
      url += `&cmcontinue=${encodeURIComponent(continueToken)}`;
    }
    
    const data = await fetchFromWikibooks(url);
    return {
      recipes: data.query.categorymembers,
      continue: data.continue?.cmcontinue
    };
  } catch (error) {
    log(`⚠️  Error fetching recipes from ${categoryTitle}: ${error.message}`, 'yellow');
    return { recipes: [], continue: null };
  }
}

/**
 * Main scraping function
 */
async function scrapeRecipesWithImages() {
  logSection('WIKIBOOKS RECIPE IMAGE SCRAPER');
  
  log('\n📋 Workflow:', 'cyan');
  log('  1. Fetch all recipe categories from Wikibooks', 'cyan');
  log('  2. For each recipe, check if it has "Recipes with images" category', 'cyan');
  log('  3. Save URLs to separate files (with/without images)', 'cyan');
  
  const recipesWithImages = [];
  const recipesWithoutImages = [];
  let totalRecipesChecked = 0;
  
  try {
    // Get all recipes from the main Recipes category
    log('\n🔍 Fetching all recipes...', 'cyan');
    
    let continueToken = null;
    let pageCount = 0;
    
    do {
      pageCount++;
      log(`\n📄 Processing page ${pageCount}...`, 'yellow');
      
      const { recipes, continue: nextToken } = await getRecipesFromCategory('Category:Recipes', continueToken);
      
      for (const recipe of recipes) {
        totalRecipesChecked++;
        const recipeTitle = recipe.title;
        const recipeUrl = `https://en.wikibooks.org/wiki/${encodeURIComponent(recipeTitle.replace(/ /g, '_'))}`;
        
        // Check if recipe has image
        const hasImage = await recipeHasImage(recipeTitle);
        
        if (hasImage) {
          recipesWithImages.push(recipeUrl);
          log(`   ✅ ${recipeTitle}`, 'green');
        } else {
          recipesWithoutImages.push(recipeUrl);
          log(`   ❌ ${recipeTitle}`, 'yellow');
        }
        
        // Rate limiting - be nice to Wikibooks
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      continueToken = nextToken;
      
      if (continueToken) {
        log(`\n⏳ More recipes available, continuing...`, 'cyan');
      }
      
    } while (continueToken);
    
    // Save results to files
    log('\n💾 Saving results...', 'cyan');
    
    fs.writeFileSync(RECIPES_WITH_IMAGES_FILE, recipesWithImages.join('\n'));
    log(`✅ Saved ${recipesWithImages.length} recipes WITH images to: ${RECIPES_WITH_IMAGES_FILE}`, 'green');
    
    fs.writeFileSync(RECIPES_WITHOUT_IMAGES_FILE, recipesWithoutImages.join('\n'));
    log(`✅ Saved ${recipesWithoutImages.length} recipes WITHOUT images to: ${RECIPES_WITHOUT_IMAGES_FILE}`, 'green');
    
    // Summary
    logSection('SCRAPING SUMMARY');
    log(`\n📊 Results:`, 'cyan');
    log(`   Total recipes checked: ${totalRecipesChecked}`, 'cyan');
    log(`   ✅ With images: ${recipesWithImages.length}`, 'green');
    log(`   ❌ Without images: ${recipesWithoutImages.length}`, 'yellow');
    log(`   📊 Percentage with images: ${((recipesWithImages.length / totalRecipesChecked) * 100).toFixed(1)}%`, 'cyan');
    
    log(`\n📁 Output files:`, 'cyan');
    log(`   ${RECIPES_WITH_IMAGES_FILE}`, 'cyan');
    log(`   ${RECIPES_WITHOUT_IMAGES_FILE}`, 'cyan');
    
  } catch (error) {
    log(`\n❌ Fatal error: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run the scraper
scrapeRecipesWithImages().catch(error => {
  log(`\n❌ Unhandled error: ${error.message}`, 'red');
  process.exit(1);
});

