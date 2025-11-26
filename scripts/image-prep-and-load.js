#!/usr/bin/env node

/**
 * Image Prep and Load Automation Script
 *
 * Complete Workflow:
 * 1. Query MongoDB for Wikibooks recipes with images (today's only)
 * 2. Match local Wikibooks output images to recipes
 * 3. Convert images to JPG format
 * 4. Compress images
 * 5. Upload to AWS S3
 * 6. Move to processed/wiki_images/
 * 7. Remove from main output folder
 * 8. Update MongoDB with S3 URLs
 *
 * Usage: npm run image-prep-and-load
 */

import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import sharp from 'sharp';
import AWS from 'aws-sdk';

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
  PROCESSED_WIKI_IMAGES_DIR: path.join(path.dirname(fileURLToPath(import.meta.url)), '../scripts/wiki/output/processed/wiki_images'),
  TEMP_FOLDER: path.join(path.dirname(fileURLToPath(import.meta.url)), '../uploads/temp'),
  AWS_REGION: process.env.AWS_REGION || 'eu-north-1',
  AWS_BUCKET: 'receptu-images',
};

// AWS S3 Configuration
const s3 = new AWS.S3({
  region: CONFIG.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

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
 * Can use either the original Wikibooks filename from MongoDB or search for JSON file
 * Returns: { localPath, originalFilename }
 */
async function findMatchingLocalImage(wikibooksSlug, originalFilenameFromDB = null) {
  try {
    let originalFilename = originalFilenameFromDB;

    // If no filename provided from DB, try to read from JSON file
    if (!originalFilename) {
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

      if (jsonFile) {
        // Read JSON to get original filename
        const jsonPath = path.join(searchDir, jsonFile);
        const jsonContent = await fs.readFile(jsonPath, 'utf-8');
        const jsonData = JSON.parse(jsonContent);
        originalFilename = jsonData.image?.filename;
      }
    }

    if (!originalFilename) {
      console.error(`❌ Could not find image filename for ${wikibooksSlug}`);
      return null;
    }

    // Check if the image file exists in main output directory
    const imagePath = path.join(CONFIG.WIKIBOOKS_OUTPUT_DIR, originalFilename);
    try {
      // Use stat instead of access for better compatibility with special characters
      await fs.stat(imagePath);
      return {
        localPath: imagePath,
        originalFilename: originalFilename
      };
    } catch (error) {
      // Try to find the file by listing directory and matching filename
      try {
        const files = await fs.readdir(CONFIG.WIKIBOOKS_OUTPUT_DIR);
        const matchedFile = files.find(f => f === originalFilename);

        if (matchedFile) {
          const matchedPath = path.join(CONFIG.WIKIBOOKS_OUTPUT_DIR, matchedFile);
          return {
            localPath: matchedPath,
            originalFilename: matchedFile
          };
        }
      } catch (listError) {
        // Ignore
      }

      // If not found in main output, check processed/wiki_images folder
      // (in case the recipe was already processed but needs re-upload)
      try {
        const processedFiles = await fs.readdir(CONFIG.PROCESSED_WIKI_IMAGES_DIR);
        const matchedFile = processedFiles.find(f => f === originalFilename);

        if (matchedFile) {
          const matchedPath = path.join(CONFIG.PROCESSED_WIKI_IMAGES_DIR, matchedFile);
          return {
            localPath: matchedPath,
            originalFilename: matchedFile
          };
        }
      } catch (processedError) {
        // Ignore
      }

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
 * Looks for recipes that have local images available for processing
 */
async function getWikibooksRecipes(db) {
  const collection = db.collection('recipes_new');

  // Find all Wikibooks recipes with images
  // These are recipes that were uploaded from Wikibooks and have image metadata
  const recipes = await collection
    .find({
      'originalSource.platform': 'Wikibooks',
      'originalSource.url': { $exists: true },
      'image.src': { $exists: true },
      'originalImage.fileName': { $exists: true }  // Must have original filename to match local image
    })
    .toArray();

  return recipes;
}

/**
 * Compress image using Sharp
 */
async function compressImage(inputPath, outputPath) {
  try {
    const inputStats = fsSync.statSync(inputPath);
    const inputSizeMB = (inputStats.size / 1024 / 1024).toFixed(2);

    // Get image metadata
    const metadata = await sharp(inputPath).metadata();

    // Compression settings
    const maxWidth = 1200;
    const maxHeight = 800;
    const quality = 85;

    let pipeline = sharp(inputPath);

    // Resize if image is too large
    if (metadata.width > maxWidth || metadata.height > maxHeight) {
      pipeline = pipeline.resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    // Convert to JPEG
    pipeline = pipeline.jpeg({ quality, progressive: true });
    await pipeline.toFile(outputPath);

    const outputStats = fsSync.statSync(outputPath);
    const outputSizeMB = (outputStats.size / 1024 / 1024).toFixed(2);
    const reduction = (((inputStats.size - outputStats.size) / inputStats.size) * 100).toFixed(1);

    console.log(`   ✅ Compressed: ${outputSizeMB}MB (${reduction}% reduction)`);
    return { inputSizeMB, outputSizeMB, reduction };
  } catch (error) {
    console.error(`❌ Compression error: ${error.message}`);
    throw error;
  }
}

/**
 * Verify AWS credentials
 */
async function verifyAWSCredentials() {
  try {
    await s3.headBucket({ Bucket: CONFIG.AWS_BUCKET }).promise();
    console.log('✅ AWS credentials verified');
    console.log(`✅ Bucket '${CONFIG.AWS_BUCKET}' accessible`);
    return true;
  } catch (error) {
    console.error('❌ AWS credentials error:', error.message);
    return false;
  }
}

/**
 * Upload image to S3
 */
async function uploadImageToS3(filename, compressedPath) {
  try {
    const fileContent = fsSync.readFileSync(compressedPath);

    const uploadParams = {
      Bucket: CONFIG.AWS_BUCKET,
      Key: `receptai/${filename}`,
      Body: fileContent,
      ContentType: 'image/jpeg',
      CacheControl: 'public, max-age=31536000',
      ContentDisposition: 'inline'
    };

    const result = await s3.upload(uploadParams).promise();
    console.log(`   ✅ Uploaded to S3: ${result.Location}`);
    return result.Location;
  } catch (error) {
    console.error(`❌ S3 upload error: ${error.message}`);
    throw error;
  }
}

/**
 * Update recipe in MongoDB with S3 image URL
 */
async function updateRecipeImageUrl(db, slug, s3Url) {
  try {
    const collection = db.collection('recipes_new');
    const result = await collection.updateOne(
      { slug: slug },
      {
        $set: {
          'image.src': s3Url,
          'updatedAt': new Date().toISOString()
        }
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`   ✅ Updated MongoDB with S3 URL`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ MongoDB update error: ${error.message}`);
    throw error;
  }
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
    
    // Verify AWS credentials
    console.log('🔐 Verifying AWS credentials...');
    const credentialsValid = await verifyAWSCredentials();
    if (!credentialsValid) {
      throw new Error('AWS credentials not configured');
    }
    console.log('');

    // Ensure directories exist
    await fs.mkdir(CONFIG.PROCESSED_WIKI_IMAGES_DIR, { recursive: true });
    await fs.mkdir(CONFIG.TEMP_FOLDER, { recursive: true });

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
      // Pass originalImage.fileName from MongoDB if available
      const originalImageFileName = recipe.originalImage?.fileName;
      const imageMatch = await findMatchingLocalImage(wikibooksSlug, originalImageFileName);
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

      try {
        console.log(`📤 Processing: ${recipeTitle}`);

        // Step 1: Convert to JPG and move to temp
        const tempJpgPath = path.join(CONFIG.TEMP_FOLDER, finalFileName);
        await convertToJpg(imageMatch.localPath, tempJpgPath);

        // Step 2: Compress image
        const compressedPath = path.join(CONFIG.TEMP_FOLDER, `compressed_${finalFileName}`);
        await compressImage(tempJpgPath, compressedPath);

        // Step 3: Upload to S3
        const s3Url = await uploadImageToS3(finalFileName, compressedPath);

        // Step 4: Update MongoDB with S3 URL
        await updateRecipeImageUrl(db, recipe.slug, s3Url);

        // Step 5: Move original to processed/wiki_images
        const processedPath = path.join(CONFIG.PROCESSED_WIKI_IMAGES_DIR, finalFileName);
        fsSync.renameSync(imageMatch.localPath, processedPath);
        console.log(`   ✅ Moved to processed folder`);

        // Step 6: Remove from main output folder (already moved above)
        console.log(`   ✅ Removed from output folder\n`);

        // Cleanup temp files
        if (fsSync.existsSync(tempJpgPath)) {
          fsSync.unlinkSync(tempJpgPath);
        }
        if (fsSync.existsSync(compressedPath)) {
          fsSync.unlinkSync(compressedPath);
        }

        successCount++;
      } catch (error) {
        console.log(`[ERROR] Failed to process image for ${recipeTitle}: ${error.message}\n`);
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

