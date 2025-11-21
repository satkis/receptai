#!/usr/bin/env node

/**
 * Image Prep and Load Automation Script
 * 
 * Workflow:
 * 1. Query MongoDB for Wikibooks recipes with images
 * 2. Match local Wikibooks output images to recipes
 * 3. Rename images to final S3 filenames
 * 4. Move to uploads/to-upload for processing
 * 
 * Usage: npm run image-prep-and-load
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import sharp from 'sharp';

// Load environment variables
dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '../.env.local') });

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  MONGODB_URI: process.env.MONGODB_URI,
  MONGODB_DB: process.env.MONGODB_DB || 'receptai',
  WIKIBOOKS_OUTPUT_DIR: path.join(path.dirname(fileURLToPath(import.meta.url)), '../scripts/wiki/output'),
  UPLOAD_TARGET_DIR: path.join(path.dirname(fileURLToPath(import.meta.url)), '../uploads/to-upload'),
};

// Validate configuration
if (!CONFIG.MONGODB_URI) {
  console.error('❌ ERROR: MONGODB_URI environment variable not set');
  process.exit(1);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Normalize slug for matching: lowercase, replace spaces/underscores with hyphens
 */
function normalizeSlug(slug) {
  return slug
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Extract slug from Wikibooks URL
 * Example: "https://en.wikibooks.org/wiki/Cookbook:Algerian_Couscous_with_Meat_and_Vegetables"
 * Returns: "algerian-couscous-with-meat-and-vegetables"
 */
function getSlugFromUrl(url) {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    
    // Remove "Cookbook:" prefix if present
    const slug = lastPart.replace(/^Cookbook:/, '');
    
    return normalizeSlug(slug);
  } catch (error) {
    console.error(`❌ Failed to parse URL: ${url}`);
    return null;
  }
}

/**
 * Extract final filename from S3 image.src URL
 * Example: "https://receptu-images.s3.eu-north-1.amazonaws.com/receptai/alziriskas-kuskusas-su-mesa-ir-darzovemis.jpg"
 * Returns: "alziriskas-kuskusas-su-mesa-ir-darzovemis.jpg"
 */
function getFinalFileNameFromImageSrc(imageSrc) {
  try {
    const urlObj = new URL(imageSrc);
    const pathname = urlObj.pathname;
    const filename = pathname.split('/').pop();
    
    if (!filename) {
      throw new Error('Could not extract filename from URL');
    }
    
    return filename;
  } catch (error) {
    console.error(`❌ Failed to extract filename from image.src: ${imageSrc}`);
    return null;
  }
}

/**
 * Find matching local image file in Wikibooks output directory
 * Reads the JSON file to get the original Wikibooks filename
 * Returns: { localPath, originalFilename }
 */
async function findMatchingLocalImage(wikibooksSlug) {
  try {
    // Check both locations: main output dir and processed/wiki_json_raw/
    const jsonRawDir = path.join(CONFIG.WIKIBOOKS_OUTPUT_DIR, 'processed', 'wiki_json_raw');

    let files = [];
    let searchDir = CONFIG.WIKIBOOKS_OUTPUT_DIR;

    // Try processed/wiki_json_raw/ first (where files are moved after conversion)
    try {
      files = await fs.readdir(jsonRawDir);
      searchDir = jsonRawDir;
    } catch {
      // Fall back to main output directory
      files = await fs.readdir(CONFIG.WIKIBOOKS_OUTPUT_DIR);
      searchDir = CONFIG.WIKIBOOKS_OUTPUT_DIR;
    }

    // Look for JSON file matching the slug pattern
    const jsonFile = files.find(file => {
      const fileNameWithoutExt = file.replace(/\.(json)$/i, '');
      const normalizedFileName = normalizeSlug(fileNameWithoutExt);
      const normalizedSlug = normalizeSlug(wikibooksSlug);

      // Match JSON files: <slug>-wikibooks-raw.json
      return normalizedFileName.includes(normalizedSlug) && file.includes('-wikibooks-raw.json');
    });

    if (!jsonFile) {
      return null;
    }

    // Read JSON to get original filename
    const jsonPath = path.join(searchDir, jsonFile);
    const jsonContent = await fs.readFile(jsonPath, 'utf-8');
    const jsonData = JSON.parse(jsonContent);
    const originalFilename = jsonData.image?.filename;

    if (!originalFilename) {
      console.error(`❌ Could not find image.filename in ${jsonFile}`);
      return null;
    }

    // Check if the image file exists in main output directory
    const imagePath = path.join(CONFIG.WIKIBOOKS_OUTPUT_DIR, originalFilename);
    try {
      await fs.access(imagePath);
      return {
        localPath: imagePath,
        originalFilename: originalFilename
      };
    } catch {
      console.error(`❌ Image file not found: ${originalFilename}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error searching for matching image: ${error.message}`);
    return null;
  }
}

/**
 * Convert image to JPG format
 * Handles all image formats (PNG, WebP, GIF, etc.) and converts to JPG
 */
async function convertToJpg(sourcePath, targetPath) {
  try {
    // Get image metadata to check format
    const metadata = await sharp(sourcePath).metadata();
    const originalFormat = metadata.format;

    console.log(`   Converting: ${originalFormat.toUpperCase()} → JPG`);

    // Convert to JPG with quality settings
    await sharp(sourcePath)
      .resize(1200, 800, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85, progressive: true })
      .toFile(targetPath);

    console.log(`   ✅ Converted to JPG`);
    return true;
  } catch (error) {
    console.error(`❌ Error converting image to JPG: ${error.message}`);
    throw error;
  }
}

/**
 * Rename and move image file (with JPG conversion)
 */
async function renameAndMoveImage(sourcePath, targetFileName) {
  try {
    // Ensure target directory exists
    await fs.mkdir(CONFIG.UPLOAD_TARGET_DIR, { recursive: true });

    // Always convert to .jpg extension
    const jpgFileName = targetFileName.replace(/\.[^.]+$/, '.jpg');
    const targetPath = path.join(CONFIG.UPLOAD_TARGET_DIR, jpgFileName);

    // Convert image to JPG format
    await convertToJpg(sourcePath, targetPath);

    return targetPath;
  } catch (error) {
    console.error(`❌ Error moving image: ${error.message}`);
    throw error;
  }
}

/**
 * Connect to MongoDB
 */
async function connectMongoDB() {
  const client = new MongoClient(CONFIG.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 8000,
    socketTimeoutMS: 30000,
    maxPoolSize: 5,
    minPoolSize: 1,
  });
  
  await client.connect();
  return client;
}

/**
 * Query MongoDB for Wikibooks recipes with images
 */
async function getWikibooksRecipes(db) {
  const collection = db.collection('recipes_new');

  // Get today's date in ISO format (YYYY-MM-DD)
  const today = new Date();
  const todayString = today.toISOString().split('T')[0]; // e.g., "2025-11-21"

  const recipes = await collection
    .find({
      'originalSource.platform': 'Wikibooks',
      'originalSource.url': { $exists: true },
      'image.src': { $exists: true },
      'createdAt': {
        $regex: `^${todayString}` // Match dates starting with today's date
      }
    })
    .toArray();

  return recipes;
}

// ============================================================================
// MAIN RUNNER
// ============================================================================

async function main() {
  console.log('\n📸 Image Prep and Load Automation\n');
  console.log('Configuration:');
  console.log(`  Wikibooks Output: ${CONFIG.WIKIBOOKS_OUTPUT_DIR}`);
  console.log(`  Upload Target:    ${CONFIG.UPLOAD_TARGET_DIR}`);
  console.log(`  MongoDB DB:       ${CONFIG.MONGODB_DB}\n`);
  
  let client;
  
  try {
    // Connect to MongoDB
    console.log('🔗 Connecting to MongoDB...');
    client = await connectMongoDB();
    const db = client.db(CONFIG.MONGODB_DB);
    console.log('✅ MongoDB connected\n');
    
    // Query recipes
    console.log('📋 Querying Wikibooks recipes...');
    const recipes = await getWikibooksRecipes(db);
    console.log(`✅ Found ${recipes.length} Wikibooks recipes with images\n`);
    
    if (recipes.length === 0) {
      console.log('ℹ️  No Wikibooks recipes found. Exiting.');
      return;
    }
    
    // Process each recipe
    let successCount = 0;
    let warningCount = 0;
    let errorCount = 0;
    
    console.log('🔄 Processing recipes:\n');
    
    for (const recipe of recipes) {
      const recipeTitle = recipe.title?.lt || recipe.slug;
      const wikibooksUrl = recipe.originalSource?.url;
      
      // Validate image.src
      if (!recipe.image?.src) {
        console.log(`[ERROR] Missing image.src for ${recipeTitle}`);
        errorCount++;
        continue;
      }
      
      // Extract slug from Wikibooks URL
      const wikibooksSlug = getSlugFromUrl(wikibooksUrl);
      if (!wikibooksSlug) {
        console.log(`[ERROR] Could not extract slug from URL: ${wikibooksUrl}`);
        errorCount++;
        continue;
      }
      
      // Find matching local image
      const imageMatch = await findMatchingLocalImage(wikibooksSlug);
      if (!imageMatch) {
        console.log(`[WARN] No image found for ${wikibooksUrl}`);
        warningCount++;
        continue;
      }

      // Extract final filename from image.src (recipe slug based)
      const finalFileName = getFinalFileNameFromImageSrc(recipe.image.src);
      if (!finalFileName) {
        console.log(`[ERROR] Could not extract filename from image.src for ${recipeTitle}`);
        errorCount++;
        continue;
      }

      // Move image with final S3 filename (recipe slug based)
      try {
        const targetPath = await renameAndMoveImage(imageMatch.localPath, finalFileName);
        const jpgFileName = path.basename(targetPath);

        console.log(`[OK] Image prepared for ${recipeTitle}`);
        console.log(`     Original:  ${imageMatch.originalFilename}`);
        console.log(`     Renamed:   ${jpgFileName}`);
        console.log(`     Format:    Converted to JPG`);
        console.log(`     Moved to:  ${CONFIG.UPLOAD_TARGET_DIR}\n`);

        successCount++;
      } catch (error) {
        console.log(`[ERROR] Failed to process image for ${recipeTitle}: ${error.message}`);
        errorCount++;
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Successful:  ${successCount}`);
    console.log(`⚠️  Warnings:    ${warningCount}`);
    console.log(`❌ Errors:      ${errorCount}`);
    console.log(`📦 Total:       ${recipes.length}`);
    console.log('='.repeat(70) + '\n');
    
    // Exit with appropriate code
    if (errorCount > 0) {
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 MongoDB connection closed');
    }
  }
}

// Run the script
main().catch(error => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

