const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const sharp = require('sharp');

// Load environment variables from .env.local
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

console.log('🔍 Environment check:');
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? 'SET' : 'MISSING');
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? 'SET' : 'MISSING');
console.log('AWS_REGION:', process.env.AWS_REGION || 'NOT SET');
console.log('');

// AWS Configuration
const s3 = new AWS.S3({
  region: process.env.AWS_REGION || 'eu-north-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const BUCKET_NAME = 'receptu-images';
const UPLOAD_FOLDER = path.join(__dirname, '../uploads/to-upload');
const PROCESSED_FOLDER = path.join(__dirname, '../uploads/uploaded');
const METADATA_FOLDER = path.join(__dirname, '../uploads/metadata');
const TEMP_FOLDER = path.join(__dirname, '../uploads/temp');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.MONGODB_DB || 'receptai';

// Ensure directories exist
[UPLOAD_FOLDER, PROCESSED_FOLDER, METADATA_FOLDER, TEMP_FOLDER].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
});

/**
 * Convert Lithuanian characters and special characters to ASCII for S3 metadata
 */
function convertToASCII(text) {
  if (!text) return '';

  const lithuanianMap = {
    'ą': 'a', 'Ą': 'A',
    'č': 'c', 'Č': 'C',
    'ę': 'e', 'Ę': 'E',
    'ė': 'e', 'Ė': 'E',
    'į': 'i', 'Į': 'I',
    'š': 's', 'Š': 'S',
    'ų': 'u', 'Ų': 'U',
    'ū': 'u', 'Ū': 'U',
    'ž': 'z', 'Ž': 'Z'
  };

  return text
    // Replace Lithuanian characters
    .replace(/[ąčęėįšųūžĄČĘĖĮŠŲŪŽ]/g, char => lithuanianMap[char] || char)
    // Replace other special characters that can cause S3 header issues
    .replace(/[""'']/g, '"')  // Replace smart quotes
    .replace(/[–—]/g, '-')    // Replace em/en dashes
    .replace(/[^\x00-\x7F]/g, '') // Remove any remaining non-ASCII characters
    // Remove control characters and problematic characters for HTTP headers
    .replace(/[\x00-\x1F\x7F]/g, '')
    // Replace multiple spaces with single space
    .replace(/\s+/g, ' ')
    // Trim whitespace
    .trim();
}

/**
 * Get content type for file
 */
function getContentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const types = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif'
  };
  return types[ext] || 'application/octet-stream';
}

/**
 * Compress image using Sharp
 */
async function compressImage(inputPath, outputPath) {
  try {
    const inputStats = fs.statSync(inputPath);
    const inputSizeMB = (inputStats.size / 1024 / 1024).toFixed(2);

    console.log(`🔄 Compressing image: ${path.basename(inputPath)} (${inputSizeMB}MB)`);

    // Get image metadata
    const metadata = await sharp(inputPath).metadata();
    console.log(`   Original: ${metadata.width}x${metadata.height}, ${metadata.format}`);

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
      console.log(`   Resizing to max ${maxWidth}x${maxHeight}`);
    }

    // Compress based on format
    if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
      pipeline = pipeline.jpeg({ quality, progressive: true });
    } else if (metadata.format === 'png') {
      pipeline = pipeline.png({ quality, progressive: true });
    } else if (metadata.format === 'webp') {
      pipeline = pipeline.webp({ quality });
    } else {
      // Convert other formats to JPEG
      pipeline = pipeline.jpeg({ quality, progressive: true });
    }

    // Save compressed image
    await pipeline.toFile(outputPath);

    const outputStats = fs.statSync(outputPath);
    const outputSizeMB = (outputStats.size / 1024 / 1024).toFixed(2);
    const compressionRatio = ((1 - outputStats.size / inputStats.size) * 100).toFixed(1);

    console.log(`✅ Compressed: ${outputSizeMB}MB (${compressionRatio}% reduction)`);

    return {
      originalSize: inputStats.size,
      compressedSize: outputStats.size,
      compressionRatio: parseFloat(compressionRatio)
    };
  } catch (error) {
    console.error(`❌ Compression failed: ${error.message}`);
    // If compression fails, copy original file
    fs.copyFileSync(inputPath, outputPath);
    return null;
  }
}

/**
 * Fetch recipe data from MongoDB by slug
 */
async function fetchRecipeData(slug) {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(DATABASE_NAME);

    const recipe = await db.collection('recipes_new').findOne({ slug });
    return recipe;
  } catch (error) {
    console.error('❌ Error fetching recipe data:', error.message);
    return null;
  } finally {
    await client.close();
  }
}

/**
 * Generate metadata for recipe image with real recipe data
 */
async function generateImageMetadata(filename) {
  const cleanSlug = filename
    .replace(/\.(jpg|jpeg|png|webp)$/i, '')
    .replace(/[^\w\-]/g, '-')
    .toLowerCase();

  // Fetch recipe data from database
  const recipe = await fetchRecipeData(cleanSlug);

  let keywords = 'recipe,food,lithuanian';
  let altText = 'Recipe image';
  let description = 'Recipe image';
  let cuisine = 'lithuanian';
  let category = 'recipe-image';

  if (recipe) {
    // Extract keywords from recipe data
    const recipeKeywords = [];

    // Add recipe title words
    if (recipe.title?.lt) {
      recipeKeywords.push(...recipe.title.lt.toLowerCase().split(' ').slice(0, 3));
    }

    // Add SEO keywords if available
    if (recipe.seo?.keywords && Array.isArray(recipe.seo.keywords)) {
      recipeKeywords.push(...recipe.seo.keywords.slice(0, 5));
    }

    // Add tags if available
    if (recipe.tags && Array.isArray(recipe.tags)) {
      recipeKeywords.push(...recipe.tags.slice(0, 3));
    }

    // Add vital ingredients
    if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
      const vitalIngredients = recipe.ingredients
        .filter(ing => ing.vital)
        .map(ing => ing.name?.lt || ing.name)
        .slice(0, 2);
      recipeKeywords.push(...vitalIngredients);
    }

    keywords = convertToASCII(recipeKeywords.join(','));
    altText = convertToASCII(recipe.title?.lt || 'Recipe image');

    // Extra sanitization for description (most likely to have problematic characters)
    let rawDescription = recipe.description?.lt || recipe.title?.lt || 'Recipe image';
    // Limit description length to avoid header size issues
    if (rawDescription.length > 200) {
      rawDescription = rawDescription.substring(0, 200) + '...';
    }
    description = convertToASCII(rawDescription);

    // Extract cuisine from SEO data
    if (recipe.seo?.recipeCuisine) {
      cuisine = convertToASCII(recipe.seo.recipeCuisine);
    }

    // Extract category from SEO data
    if (recipe.seo?.recipeCategory) {
      category = convertToASCII(recipe.seo.recipeCategory);
    }

    console.log(`📊 Recipe data found for ${cleanSlug}:`);
    console.log(`   Title: ${recipe.title?.lt}`);
    console.log(`   Keywords: ${keywords}`);
    console.log(`   Cuisine: ${cuisine}`);
    console.log(`   Description: ${description}`);
  } else {
    console.log(`⚠️  No recipe found for slug: ${cleanSlug}, using default metadata`);
  }

  return {
    // System-defined metadata
    'Content-Type': getContentType(filename),
    'Cache-Control': 'public, max-age=31536000, immutable',
    'Content-Disposition': `inline; filename="${filename}"`,

    // User-defined metadata (will get x-amz-meta- prefix) - ASCII converted
    'alt-text': altText,
    'recipe-slug': cleanSlug,
    'width': '1200',
    'height': '800',
    'keywords': keywords,
    'upload-date': new Date().toISOString().split('T')[0],
    'category': category,
    'cuisine': cuisine,
    'description': description
  };
}

/**
 * Verify AWS credentials
 */
async function verifyAWSCredentials() {
  try {
    await s3.headBucket({ Bucket: BUCKET_NAME }).promise();
    console.log('✅ AWS credentials verified');
    console.log(`✅ Bucket '${BUCKET_NAME}' accessible`);
    return true;
  } catch (error) {
    console.error('❌ AWS credentials error:', error.message);
    return false;
  }
}

/**
 * Upload single image to S3 with compression
 */
async function uploadImage(filename) {
  const credentialsValid = await verifyAWSCredentials();
  if (!credentialsValid) {
    throw new Error('AWS credentials not configured');
  }

  const originalPath = path.join(UPLOAD_FOLDER, filename);

  // Create compressed version in temp folder
  const compressedPath = path.join(TEMP_FOLDER, `compressed_${filename}`);
  const compressionStats = await compressImage(originalPath, compressedPath);

  // Use compressed file for upload
  const fileContent = fs.readFileSync(compressedPath);
  const metadata = await generateImageMetadata(filename);

  const uploadParams = {
    Bucket: BUCKET_NAME,
    Key: `receptai/${filename}`, // Use original filename, not compressed filename
    Body: fileContent,
    ContentType: metadata['Content-Type'],
    CacheControl: metadata['Cache-Control'],
    ContentDisposition: metadata['Content-Disposition'],
    Metadata: {
      'alt-text': metadata['alt-text'],
      'recipe-slug': metadata['recipe-slug'],
      'width': metadata['width'],
      'height': metadata['height'],
      'keywords': metadata['keywords'],
      'upload-date': metadata['upload-date'],
      'category': metadata['category'],
      'cuisine': metadata['cuisine'],
      'description': metadata['description']
    }
  };

  try {
    const result = await s3.upload(uploadParams).promise();
    console.log(`✅ Successfully uploaded: ${result.Location}`);

    // Move original file to processed folder
    const processedPath = path.join(PROCESSED_FOLDER, filename);
    fs.renameSync(originalPath, processedPath);
    console.log(`📁 Moved original to processed folder: ${filename}`);

    // Clean up compressed file
    if (fs.existsSync(compressedPath)) {
      fs.unlinkSync(compressedPath);
      console.log(`🗑️  Cleaned up compressed file`);
    }

    // Save metadata backup
    const metadataPath = path.join(METADATA_FOLDER, `${filename}.json`);
    const metadataBackup = {
      ...metadata,
      compressionStats,
      uploadedAt: new Date().toISOString(),
      s3Location: result.Location
    };
    fs.writeFileSync(metadataPath, JSON.stringify(metadataBackup, null, 2));

    return result;
  } catch (error) {
    console.error(`❌ Upload failed: ${error.message}`);

    // Clean up compressed file on error
    if (fs.existsSync(compressedPath)) {
      fs.unlinkSync(compressedPath);
    }

    throw error;
  }
}

/**
 * Upload all images in the upload folder
 */
async function uploadAllImages() {
  if (!fs.existsSync(UPLOAD_FOLDER)) {
    console.log('📁 Upload folder does not exist');
    return;
  }

  const files = fs.readdirSync(UPLOAD_FOLDER)
    .filter(file => /\.(jpg|jpeg|png|webp|gif)$/i.test(file))
    .filter(file => !file.startsWith('compressed_')); // Ignore compressed files

  if (files.length === 0) {
    console.log('📷 No images found in upload folder');
    return;
  }

  console.log(`📷 Found ${files.length} images to upload`);

  for (const file of files) {
    try {
      console.log(`\n📤 Uploading ${file}...`);
      await uploadImage(file);
    } catch (error) {
      console.error(`❌ Failed to upload ${file}:`, error.message);
    }
  }
}

// Run if called directly
if (require.main === module) {
  uploadAllImages().catch(console.error);
}

module.exports = { uploadImage, uploadAllImages };
