/**
 * Wikibooks Recipe Extractor
 * 
 * Extracts recipe data from Wikibooks using MediaWiki API
 * - Reads URLs from wikibooks-urls.txt
 * - Processes first URL in the list
 * - Downloads recipe data and main image
 * - Outputs JSON to scripts/wiki/output/
 * - Logs processed URLs to processed-wikibooks-urls.txt
 * 
 * Usage: node scripts/wiki/extract-wikibooks-recipe.js
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const WIKIBOOKS_API = 'https://en.wikibooks.org/w/api.php';
const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';
const INPUT_FILE = path.join(__dirname, 'wikibooks-urls.txt');
const PROCESSED_FILE = path.join(__dirname, 'processed-wikibooks-urls.txt');
const OUTPUT_DIR = path.join(__dirname, 'output');
const LOGS_DIR = path.join(OUTPUT_DIR, 'logs');

// Browser User-Agent to avoid being blocked
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// Retry configuration
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000; // 5 seconds between retries
const RATE_LIMIT_DELAY_MS = 10000; // 10 seconds when hitting rate limits (429)

// Create axios instance with proper headers
const axiosInstance = axios.create({
  headers: {
    'User-Agent': USER_AGENT,
    'Accept': 'application/json',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  },
  timeout: 15000
});

// Ensure output directories exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

/**
 * Log error to file
 */
function logError(slug, recipeUrl, imageUrl, errorMessage, retryCount) {
  const timestamp = new Date().toISOString();
  const logFilename = `${slug}-error.log`;
  const logPath = path.join(LOGS_DIR, logFilename);

  const logEntry = `[${timestamp}] ERROR LOG FOR RECIPE: ${slug}
Recipe URL: ${recipeUrl}
Image URL: ${imageUrl}
Error Message: ${errorMessage}
Retry Attempts: ${retryCount}/${MAX_RETRIES}
---
`;

  fs.appendFileSync(logPath, logEntry, 'utf-8');
  console.log(`📝 Error logged to: ${logFilename}`);
}

/**
 * Sleep function for retry delays
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Read URLs from input file
 */
function readInputUrls() {
  if (!fs.existsSync(INPUT_FILE)) {
    console.error('❌ Error: wikibooks-urls.txt not found!');
    console.log('📝 Create the file at: scripts/wiki/wikibooks-urls.txt');
    process.exit(1);
  }

  const content = fs.readFileSync(INPUT_FILE, 'utf-8');
  const urls = content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));

  return urls;
}

/**
 * Extract page title from Wikibooks URL
 */
function extractPageTitle(url) {
  const match = url.match(/wiki\/(.+)$/);
  if (!match) {
    throw new Error('Invalid Wikibooks URL format');
  }
  return decodeURIComponent(match[1]);
}

/**
 * Generate slug from recipe title
 */
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/cookbook:/gi, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Clean wikitext markup (basic cleanup)
 */
function cleanWikitext(text) {
  if (!text) return '';
  
  return text
    // Remove wiki links [[text]] or [[link|text]]
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    // Remove templates {{template}}
    .replace(/\{\{[^}]+\}\}/g, '')
    // Remove HTML comments
    .replace(/<!--[\s\S]*?-->/g, '')
    // Remove bold/italic markup
    .replace(/'''([^']+)'''/g, '$1')
    .replace(/''([^']+)''/g, '$1')
    // Clean up whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Parse ingredients from wikitext
 */
function parseIngredients(wikitextSection) {
  if (!wikitextSection) return [];
  
  const lines = wikitextSection.split('\n');
  const ingredients = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    // Match list items: *, #, or plain text
    if (trimmed.startsWith('*') || trimmed.startsWith('#')) {
      const cleaned = cleanWikitext(trimmed.substring(1).trim());
      if (cleaned) {
        ingredients.push(cleaned);
      }
    } else if (trimmed && !trimmed.startsWith('=')) {
      const cleaned = cleanWikitext(trimmed);
      if (cleaned) {
        ingredients.push(cleaned);
      }
    }
  }
  
  return ingredients;
}

/**
 * Parse instructions from wikitext (DEPRECATED - use parseInstructionsFromHTML)
 */
function parseInstructions(wikitextSection) {
  if (!wikitextSection) return [];

  const lines = wikitextSection.split('\n');
  const instructions = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // Match numbered lists (instructions are usually numbered with #)
    if (trimmed.startsWith('#')) {
      const cleaned = cleanWikitext(trimmed.substring(1).trim());
      if (cleaned && cleaned.length > 3) { // Ignore very short lines
        instructions.push(cleaned);
      }
    }
  }

  return instructions;
}

/**
 * Parse instructions from HTML (handles <ol><li> tags and subsections)
 * Merges all subsections (e.g., Crust + Cake) into one sequential list
 */
function parseInstructionsFromHTML(html) {
  if (!html) return [];

  const $ = cheerio.load(html);
  const instructions = [];

  // Find the Procedure section heading (look for h2 with id="Procedure")
  const procedureHeading = $('#Procedure').parent();

  if (procedureHeading.length === 0) {
    // Try alternative section names
    const altHeadings = ['Directions', 'Instructions', 'Method', 'Preparation'];
    let found = false;
    for (const name of altHeadings) {
      const heading = $(`#${name}`).parent();
      if (heading.length > 0) {
        found = true;
        break;
      }
    }
    if (!found) {
      console.log('⚠️  No Procedure section found in HTML');
      return instructions;
    }
  }

  // Find all <ol> elements after the Procedure heading
  // Use nextAll() to get all siblings after the heading
  procedureHeading.nextAll().each((i, elem) => {
    const $elem = $(elem);

    // Stop if we hit another h2 section
    if ($elem.is('h2') || $elem.find('h2').length > 0) {
      return false; // Break the loop
    }

    // Extract all <li> items from <ol> tags
    if ($elem.is('ol')) {
      $elem.find('li').each((i, li) => {
        const text = $(li).text().trim();
        if (text) {
          instructions.push(text);
        }
      });
    }

    // Also check if this element contains <ol> (for nested structures)
    $elem.find('ol').each((i, ol) => {
      $(ol).find('li').each((i, li) => {
        const text = $(li).text().trim();
        if (text && !instructions.includes(text)) { // Avoid duplicates
          instructions.push(text);
        }
      });
    });
  });

  return instructions;
}

/**
 * Parse notes/tips from HTML (handles <ul><li> tags and subsections)
 * Merges all subsections (e.g., Ingredients + Technique) into one list
 */
function parseNotesFromHTML(html) {
  if (!html) return [];

  const $ = cheerio.load(html);
  const notes = [];

  // Try to find "Notes, tips and variations" section with various ID formats
  const possibleIds = [
    'Notes,_tips_and_variations',
    'Notes,_tips,_and_variations',
    'Notes_and_tips',
    'Notes_and_variations',
    'Tips_and_variations',
    'Notes',
    'Tips',
    'Variations'
  ];

  let notesHeadingDiv = null;
  let foundId = null;
  for (const id of possibleIds) {
    // Use attribute selector to avoid CSS selector issues with commas
    const headingElement = $(`[id="${id}"]`);
    if (headingElement.length > 0) {
      // Get the parent div (mw-heading wrapper)
      notesHeadingDiv = headingElement.parent();
      foundId = id;
      break;
    }
  }

  if (!notesHeadingDiv || notesHeadingDiv.length === 0) {
    // Debug: List all h2 IDs to see what's available
    if (process.env.DEBUG) {
      console.log('🔍 DEBUG - Available h2 IDs:');
      $('h2').each((i, elem) => {
        const id = $(elem).attr('id');
        console.log(`   - ${id}`);
      });
    }
    return notes;
  }

  // Find all <ul> and <ol> elements after the Notes heading div until the next h2
  let nextElem = notesHeadingDiv.next();
  let elemCount = 0;

  while (nextElem.length > 0) {
    elemCount++;

    // Stop if we hit another h2 section (wrapped in mw-heading div)
    if (nextElem.find('h2').length > 0 || nextElem.is('h2')) {
      break;
    }

    // Extract all <li> items from <ul> or <ol> tags
    if (nextElem.is('ul') || nextElem.is('ol')) {
      nextElem.find('li').each((i, li) => {
        const text = $(li).text().trim();
        if (text) {
          notes.push(text);
        }
      });
    }

    // Also check if this element contains <ul> or <ol> (for nested structures)
    nextElem.find('ul, ol').each((i, list) => {
      $(list).find('li').each((i, li) => {
        const text = $(li).text().trim();
        if (text && !notes.includes(text)) { // Avoid duplicates
          notes.push(text);
        }
      });
    });

    nextElem = nextElem.next();

    // Safety limit to prevent infinite loops
    if (elemCount > 20) {
      break;
    }
  }

  return notes;
}

/**
 * Extract section content from wikitext (including subsections)
 */
function extractSection(wikitext, sectionName) {
  // Match == Section == and capture everything until the next == Section == at the same level
  const regex = new RegExp(`==\\s*${sectionName}\\s*==([\\s\\S]*?)(?:\\n==\\s*[^=]|$)`, 'i');
  const match = wikitext.match(regex);
  return match ? match[1].trim() : '';
}

/**
 * Parse {{recipesummary}} template from wikitext
 */
function parseRecipeSummary(wikitext) {
  if (!wikitext) return {};

  const summaryMatch = wikitext.match(/\{\{recipesummary([^}]*)\}\}/i);
  if (!summaryMatch) return {};

  const summaryText = summaryMatch[1];
  const metadata = {};

  // Extract servings
  const servingsMatch = summaryText.match(/\|\s*servings\s*=\s*([^\n|]+)/i);
  if (servingsMatch) {
    metadata.servings = parseInt(servingsMatch[1].trim()) || null;
  }

  // Extract time
  const timeMatch = summaryText.match(/\|\s*time\s*=\s*([^\n|]+)/i);
  if (timeMatch) {
    const timeStr = timeMatch[1].trim().toLowerCase();
    let totalMinutes = 0;

    // Parse hours (including "and half")
    const hoursMatch = timeStr.match(/(\d+(?:\.\d+)?)\s*(?:and\s*half\s*)?hours?/i);
    if (hoursMatch) {
      totalMinutes += parseFloat(hoursMatch[1]) * 60;
      if (timeStr.includes('and half')) {
        totalMinutes += 30;
      }
    }

    // Parse minutes
    const minutesMatch = timeStr.match(/(\d+)\s*minutes?/i);
    if (minutesMatch) {
      totalMinutes += parseInt(minutesMatch[1]);
    }

    metadata.totalTimeMinutes = totalMinutes || null;
    metadata.timeString = timeStr;
  }

  // Extract difficulty (1-5 scale) - can be "difficulty" or "rating"
  // Store raw value without transformation
  let difficultyMatch = summaryText.match(/\|\s*difficulty\s*=\s*(\d+)/i);
  if (!difficultyMatch) {
    difficultyMatch = summaryText.match(/\|\s*rating\s*=\s*(\d+)/i);
  }

  if (difficultyMatch) {
    metadata.difficulty = parseInt(difficultyMatch[1]);
  }

  // Extract category
  const categoryMatch = summaryText.match(/\|\s*category\s*=\s*([^\n|]+)/i);
  if (categoryMatch) {
    metadata.category = categoryMatch[1].trim();
  }

  return metadata;
}

/**
 * Extract description from wikitext (first paragraph after templates)
 */
function extractDescription(wikitext) {
  if (!wikitext) return '';

  // Remove templates
  let text = wikitext.replace(/\{\{[^}]+\}\}/g, '');

  // Remove references
  text = text.replace(/<ref[^>]*>[\s\S]*?<\/ref>/g, '');

  // Find first substantial paragraph (after headings)
  const paragraphs = text.split('\n\n');
  for (const para of paragraphs) {
    const cleaned = cleanWikitext(para.trim());
    // Skip empty, headings, and very short paragraphs
    if (cleaned && !cleaned.startsWith('=') && cleaned.length > 50) {
      return cleaned;
    }
  }

  return '';
}

/**
 * Extract categories from wikitext
 */
function extractCategories(wikitext) {
  if (!wikitext) return [];

  const categories = [];
  const categoryRegex = /\[\[Category:([^\]]+)\]\]/gi;
  let match;

  while ((match = categoryRegex.exec(wikitext)) !== null) {
    categories.push(match[1].trim());
  }

  return categories;
}

/**
 * Fetch recipe data from Wikibooks API
 */
async function fetchRecipeData(pageTitle) {
  console.log(`\n🔍 Fetching recipe: ${pageTitle}`);

  try {
    // Get page content (both wikitext and HTML)
    const parseResponse = await axiosInstance.get(WIKIBOOKS_API, {
      params: {
        action: 'parse',
        page: pageTitle,
        prop: 'wikitext|text|images|displaytitle',
        format: 'json'
      }
    });

    if (parseResponse.data.error) {
      throw new Error(`API Error: ${parseResponse.data.error.info}`);
    }

    const parseData = parseResponse.data.parse;
    const wikitext = parseData.wikitext['*'];
    const html = parseData.text['*'];
    const displayTitle = parseData.displaytitle;
    const images = parseData.images || [];

    console.log(`✅ Page fetched: ${displayTitle}`);
    console.log(`📸 Found ${images.length} images`);
    
    // Parse recipe metadata from {{recipesummary}} template
    const recipeSummary = parseRecipeSummary(wikitext);
    console.log(`📊 Recipe metadata:`, recipeSummary);

    // Extract description
    const description = extractDescription(wikitext);
    console.log(`📄 Description: ${description.substring(0, 100)}...`);

    // Extract categories
    const categories = extractCategories(wikitext);
    console.log(`🏷️  Found ${categories.length} categories`);

    // Extract recipe sections from wikitext (for ingredients)
    const ingredientsSection = extractSection(wikitext, 'Ingredients?');
    const ingredients = parseIngredients(ingredientsSection);

    // Extract instructions and notes from HTML (better for parsing <ol><li> and <ul><li> tags)
    const instructions = parseInstructionsFromHTML(html);
    const notes = parseNotesFromHTML(html);

    console.log(`📝 Extracted ${ingredients.length} ingredients`);
    console.log(`📋 Extracted ${instructions.length} instructions`);
    console.log(`💡 Extracted ${notes.length} notes/tips`);
    
    // Get page metadata (revision history to find original creator and all contributors)
    const queryResponse = await axiosInstance.get(WIKIBOOKS_API, {
      params: {
        action: 'query',
        titles: pageTitle,
        prop: 'revisions|info',
        rvprop: 'user|userid|timestamp|comment|size',
        rvlimit: 500,  // Get up to 500 revisions
        rvdir: 'newer', // Oldest first (to get original creator)
        format: 'json'
      }
    });

    const pages = queryResponse.data.query.pages;
    const pageId = Object.keys(pages)[0];
    const pageInfo = pages[pageId];
    const revisions = pageInfo.revisions || [];

    // Extract original creator (first revision in the list - oldest edit)
    // API returns revisions in reverse chronological order, so first item is oldest
    const originalCreator = revisions.length > 0 ? {
      name: revisions[0].user,
      userPageUrl: `https://en.wikibooks.org/wiki/User:${encodeURIComponent(revisions[0].user)}`
    } : null;

    console.log(`👤 Original creator: ${originalCreator?.name || 'Unknown'}`);
    console.log(`👥 Found ${revisions.length} revisions`);
    
    // Build contributors URL (link to revision history page)
    const contributorsUrl = `https://en.wikibooks.org/w/index.php?title=${encodeURIComponent(pageTitle)}&action=history`;

    return {
      title: displayTitle.replace(/<[^>]+>/g, ''), // Remove HTML tags
      pageTitle: pageTitle,
      wikitext: wikitext,
      description: description,
      ingredients: ingredients,
      instructions: instructions,
      notes: notes,
      images: images,
      categories: categories,
      metadata: recipeSummary,
      originalCreator: originalCreator,
      contributorsUrl: contributorsUrl
    };
    
  } catch (error) {
    if (error.response?.data?.error) {
      throw new Error(`Wikibooks API Error: ${error.response.data.error.info}`);
    }
    throw error;
  }
}

/**
 * Fetch main image data from Wikibooks (DEPRECATED - use getImageMetadata)
 * Kept for backward compatibility
 */
async function fetchMainImage(imageName) {
  return await getImageMetadata(imageName);
}

/**
 * Helper function to strip HTML tags from text
 */
function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * Get image metadata including license and author information
 */
async function getImageMetadata(imageName) {
  try {
    const fileName = imageName.startsWith('File:') ? imageName : `File:${imageName}`;

    console.log(`\n📸 Fetching image metadata: ${imageName}`);

    // Try Wikibooks first
    let response = await axiosInstance.get(WIKIBOOKS_API, {
      params: {
        action: 'query',
        titles: fileName,
        prop: 'imageinfo',
        iiprop: 'url|size|mime|timestamp|user|userid|extmetadata|descriptionurl|sha1',
        format: 'json'
      }
    });

    let pages = response.data.query.pages;
    let pageId = Object.keys(pages)[0];

    // If not found on Wikibooks, try Wikimedia Commons
    if (pageId === '-1' || pages[pageId].missing) {
      console.log(`⚠️  Image not found on Wikibooks, trying Wikimedia Commons...`);

      response = await axiosInstance.get(COMMONS_API, {
        params: {
          action: 'query',
          titles: fileName,
          prop: 'imageinfo',
          iiprop: 'url|size|mime|timestamp|user|userid|extmetadata|descriptionurl|sha1',
          format: 'json'
        }
      });

      pages = response.data.query.pages;
      pageId = Object.keys(pages)[0];
    }

    // Check if image exists
    if (pageId === '-1' || pages[pageId].missing) {
      console.log(`⚠️  Image not found: ${imageName}`);
      return null;
    }

    // Check if imageinfo exists
    if (!pages[pageId].imageinfo || pages[pageId].imageinfo.length === 0) {
      console.log(`⚠️  No image info available: ${imageName}`);
      return null;
    }

    const imageInfo = pages[pageId].imageinfo[0];
    const extmetadata = imageInfo.extmetadata || {};

    // Extract license information
    const licenseCode = extmetadata.License?.value || 'Unknown';
    const descriptionUrl = imageInfo.descriptionurl || '';

    // For public domain images, append ?uselang=en#Licensing to the description URL
    let licenseUrl = extmetadata.LicenseUrl?.value || '';
    if (licenseCode === 'pd' && descriptionUrl) {
      licenseUrl = `${descriptionUrl}?uselang=en#Licensing`;
    }

    const metadata = {
      filename: imageName,
      url: imageInfo.url,
      descriptionUrl: descriptionUrl,
      dimensions: {
        width: imageInfo.width || 0,
        height: imageInfo.height || 0
      },
      fileSize: imageInfo.size || 0,
      license: {
        code: licenseCode,
        shortName: extmetadata.LicenseShortName?.value || 'Unknown',
        fullName: stripHtml(extmetadata.UsageTerms?.value) || 'Unknown',
        url: licenseUrl,
        attributionRequired: extmetadata.AttributionRequired?.value === 'true',
        shareAlike: (licenseCode || '').includes('sa'),
        copyrighted: extmetadata.Copyrighted?.value === 'True',
        restrictions: stripHtml(extmetadata.Restrictions?.value) || ''
      },
      author: {
        name: stripHtml(extmetadata.Artist?.value) || imageInfo.user || '',
        userPageUrl: imageInfo.user ? `https://commons.wikimedia.org/wiki/User:${encodeURIComponent(imageInfo.user)}` : ''
      },
      metadata: {
        description: stripHtml(extmetadata.ImageDescription?.value) || '',
        dateOriginal: extmetadata.DateTimeOriginal?.value || '',
        categories: extmetadata.Categories?.value ? extmetadata.Categories.value.split('|') : [],
        sha1: imageInfo.sha1 || ''
      }
    };

    // Add GPS data if available
    if (extmetadata.GPSLatitude?.value && extmetadata.GPSLongitude?.value) {
      metadata.metadata.gps = {
        latitude: extmetadata.GPSLatitude.value,
        longitude: extmetadata.GPSLongitude.value,
        datum: extmetadata.GPSMapDatum?.value || 'WGS-84'
      };
    }

    console.log(`✅ Image metadata fetched: ${metadata.license.shortName} by ${metadata.author.name}`);

    return metadata;

  } catch (error) {
    console.error(`❌ Error fetching image metadata: ${error.message}`);
    return null;
  }
}

/**
 * Download image to local file with retry logic
 */
async function downloadImage(imageUrl, outputPath, slug, recipeUrl) {
  console.log(`\n⬇️  Downloading image...`);

  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
    try {
      const response = await axiosInstance.get(imageUrl, {
        responseType: 'stream',
        timeout: 30000 // 30 second timeout
      });

      // Check for successful status code
      if (response.status !== 200) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Write to file
      const file = fs.createWriteStream(outputPath);
      response.data.pipe(file);

      return new Promise((resolve, reject) => {
        file.on('finish', () => {
          file.close();
          console.log(`✅ Image saved: ${path.basename(outputPath)}`);
          resolve();
        });
        file.on('error', (error) => {
          fs.unlink(outputPath, () => {}); // Delete partial file
          reject(error);
        });
        response.data.on('error', (error) => {
          fs.unlink(outputPath, () => {}); // Delete partial file
          reject(error);
        });
      });

    } catch (error) {
      const errorMsg = error.message || 'Unknown error';
      const statusCode = error.response?.status;

      console.error(`❌ Download attempt ${attempt}/${MAX_RETRIES + 1} failed: ${errorMsg}`);

      // Clean up partial file
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }

      // If this was the last attempt, log error and return null
      if (attempt > MAX_RETRIES) {
        console.error(`❌ Image download failed after ${MAX_RETRIES} retries`);
        logError(slug, recipeUrl, imageUrl, errorMsg, MAX_RETRIES);
        return null;
      }

      // Determine wait time based on error type
      let waitTime = RETRY_DELAY_MS;
      if (statusCode === 429) {
        // Rate limited - wait longer
        waitTime = RATE_LIMIT_DELAY_MS;
        console.log(`⚠️  Rate limited (429). Waiting ${waitTime / 1000} seconds before retry...`);
      } else {
        console.log(`⏳ Waiting ${waitTime / 1000} seconds before retry...`);
      }

      await sleep(waitTime);
    }
  }
}

/**
 * Update input file (remove processed URL)
 */
function removeProcessedUrl(url) {
  const content = fs.readFileSync(INPUT_FILE, 'utf-8');
  const lines = content.split('\n');
  const updatedLines = lines.filter(line => line.trim() !== url.trim());

  fs.writeFileSync(INPUT_FILE, updatedLines.join('\n'), 'utf-8');
  console.log(`\n🗑️  Removed URL from wikibooks-urls.txt`);
}

/**
 * Log processed URL
 */
function logProcessedUrl(url, recipeName) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${url} - ${recipeName}\n`;

  fs.appendFileSync(PROCESSED_FILE, logEntry, 'utf-8');
  console.log(`📝 Logged to processed-wikibooks-urls.txt`);
}

/**
 * Main extraction function
 */
async function extractRecipe(url) {
  console.log('\n' + '='.repeat(70));
  console.log('🚀 WIKIBOOKS RECIPE EXTRACTOR');
  console.log('='.repeat(70));
  console.log(`\n📍 Processing URL: ${url}`);

  try {
    // Extract page title from URL
    const pageTitle = extractPageTitle(url);
    const slug = generateSlug(pageTitle);

    // Fetch recipe data
    const recipeData = await fetchRecipeData(pageTitle);

    // Fetch main image - try to find the best recipe image
    let mainImage = null;
    let imageFilename = null;
    let downloadSuccess = false;

    if (recipeData.images.length > 0) {
      console.log(`\n🔍 Found ${recipeData.images.length} images on page, searching for recipe image...`);

      // Filter out common non-recipe images (logos, icons, etc.)
      const excludePatterns = [
        /^(Wikibooks|Wikipedia|Commons|Wikimedia|Logo|Icon|Flag|Coat_of_arms)/i,
        /^(Ambox|Padlock|Magnify|Folder|Disambig)/i,
        /^(Blank|Transparent|Spacer|Divider)/i
      ];

      const recipeImages = recipeData.images.filter(img => {
        return !excludePatterns.some(pattern => pattern.test(img));
      });

      console.log(`✅ Filtered to ${recipeImages.length} potential recipe image(s)`);

      // Try each image until we find one that downloads successfully
      for (let i = 0; i < recipeImages.length; i++) {
        const imageName = recipeImages[i];
        console.log(`\n📸 Attempting image ${i + 1}/${recipeImages.length}: ${imageName}`);

        mainImage = await fetchMainImage(imageName);

        if (mainImage) {
          // Download image - use original Wikibooks filename
          imageFilename = mainImage.filename;
          const imagePath = path.join(OUTPUT_DIR, imageFilename);

          const downloadResult = await downloadImage(mainImage.url, imagePath, slug, url);
          downloadSuccess = downloadResult !== null;

          // If download succeeded, we're done
          if (downloadSuccess) {
            console.log(`✅ Successfully downloaded image: ${imageName}`);
            break;
          } else {
            // Download failed, try next image
            console.log(`⚠️  Download failed for ${imageName}, trying next image...`);
            mainImage = null;

            // Add delay before trying next image to avoid rate limiting
            if (i < recipeImages.length - 1) {
              console.log(`⏳ Waiting 3 seconds before trying next image...`);
              await sleep(3000);
            }
          }
        } else {
          // Metadata fetch failed, try next image
          console.log(`⚠️  Could not fetch metadata for ${imageName}, trying next image...`);

          // Add delay before trying next image
          if (i < recipeImages.length - 1) {
            console.log(`⏳ Waiting 2 seconds before trying next image...`);
            await sleep(2000);
          }
        }
      }

      // If all downloads failed, set mainImage to null
      if (!downloadSuccess) {
        mainImage = null;
      }
    }

    // Build output JSON
    const output = {
      source: {
        platform: 'Wikibooks',
        url: url,
        pageTitle: recipeData.pageTitle,
        license: 'CC BY-SA 4.0',
        licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
        originalCreator: recipeData.originalCreator,
        contributorsUrl: recipeData.contributorsUrl,
        extractedAt: new Date().toISOString()
      },
      recipe: {
        title: recipeData.title,
        slug: slug,
        description: recipeData.description,
        ingredients: recipeData.ingredients,
        instructions: recipeData.instructions,
        notes: recipeData.notes,
        servings: recipeData.metadata.servings || null,
        totalTimeMinutes: recipeData.metadata.totalTimeMinutes || null,
        difficulty: recipeData.metadata.difficulty || null,
        category: recipeData.metadata.category || null,
        categories: recipeData.categories || []
      },
      image: mainImage ? {
        filename: mainImage.filename,
        url: mainImage.url,
        descriptionUrl: mainImage.descriptionUrl,
        localPath: `scripts/wiki/output/${imageFilename}`,
        dimensions: mainImage.dimensions,
        fileSize: mainImage.fileSize,
        license: mainImage.license,
        author: mainImage.author,
        metadata: {
          description: mainImage.metadata.description || null,
          categories: mainImage.metadata.categories || []
        }
      } : null,
      originalImage: mainImage ? {
        fileName: mainImage.filename
      } : null
    };

    // Save JSON output
    const jsonFilename = mainImage
      ? `${slug}-wikibooks-raw.json`
      : `${slug}-wikibooks-raw-noImage.json`;
    const jsonPath = path.join(OUTPUT_DIR, jsonFilename);

    fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2), 'utf-8');

    console.log('\n' + '='.repeat(70));
    console.log('✅ SUCCESS!');
    console.log('='.repeat(70));
    console.log(`📄 JSON saved: ${jsonFilename}`);
    if (mainImage) {
      console.log(`📸 Image saved: ${imageFilename}`);
    } else {
      console.log(`⚠️  No image available`);
    }
    console.log(`\n📊 Recipe Summary:`);
    console.log(`   Title: ${recipeData.title}`);
    console.log(`   Ingredients: ${recipeData.ingredients.length}`);
    console.log(`   Instructions: ${recipeData.instructions.length}`);
    console.log(`   Notes/Tips: ${recipeData.notes.length}`);
    console.log(`   Contributors URL: ${recipeData.contributorsUrl}`);

    // Update files
    removeProcessedUrl(url);
    logProcessedUrl(url, recipeData.title);

    return { success: true, slug, jsonFilename };

  } catch (error) {
    console.log('\n' + '='.repeat(70));
    console.log('❌ EXTRACTION FAILED');
    console.log('='.repeat(70));
    console.error(`\n💥 Error: ${error.message}`);

    if (error.stack) {
      console.error(`\n📚 Stack trace:\n${error.stack}`);
    }

    return { success: false, error: error.message };
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('\n🌟 Wikibooks Recipe Extractor v1.0');
  console.log('📁 Reading input file...\n');

  const urls = readInputUrls();

  if (urls.length === 0) {
    console.log('⚠️  No URLs found in wikibooks-urls.txt');
    console.log('📝 Add Wikibooks recipe URLs (one per line) and run again.');
    process.exit(0);
  }

  console.log(`📋 Found ${urls.length} URL(s) to process\n`);

  let successCount = 0;
  let failureCount = 0;

  // Process each URL one at a time
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    console.log(`\n🔄 Processing URL ${i + 1}/${urls.length}...\n`);

    const result = await extractRecipe(url);

    if (result.success) {
      successCount++;
      console.log(`\n✅ Recipe ${i + 1} extracted successfully!`);
    } else {
      failureCount++;
      console.log(`\n⚠️  Recipe ${i + 1} extraction failed. Continuing with next recipe...`);
    }

    // Add delay between recipes to avoid rate limiting
    if (i < urls.length - 1) {
      console.log(`\n⏳ Waiting 5 seconds before processing next recipe...`);
      await sleep(5000);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 BATCH PROCESSING COMPLETE');
  console.log('='.repeat(70));
  console.log(`✅ Successful: ${successCount}/${urls.length}`);
  console.log(`❌ Failed: ${failureCount}/${urls.length}`);
  console.log(`\n📂 Check output at: scripts/wiki/output/`);
  console.log(`📝 Check processed URLs at: scripts/wiki/processed-wikibooks-urls.txt`);
  console.log(`📋 Check error logs at: scripts/wiki/output/logs/`);
}

// Run the script
main().catch(error => {
  console.error('\n💥 Unexpected error:', error);
  process.exit(1);
});

