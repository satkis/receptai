const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

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

// Ensure directories exist
[UPLOAD_FOLDER, PROCESSED_FOLDER, METADATA_FOLDER].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
});

/**
 * Convert Lithuanian characters to ASCII for S3 metadata
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
  
  return text.replace(/[ąčęėįšųūžĄČĘĖĮŠŲŪŽ]/g, char => lithuanianMap[char] || char);
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
 * Generate metadata for recipe image
 */
function generateImageMetadata(filename) {
  const cleanSlug = filename
    .replace(/\.(jpg|jpeg|png|webp)$/i, '')
    .replace(/[^\w\-]/g, '-')
    .toLowerCase();

  return {
    // System-defined metadata
    'Content-Type': getContentType(filename),
    'Cache-Control': 'public, max-age=31536000, immutable',
    'Content-Disposition': `inline; filename="${filename}"`,
    
    // User-defined metadata (will get x-amz-meta- prefix) - ASCII converted
    'alt-text': convertToASCII('Recipe image'),
    'recipe-slug': cleanSlug,
    'width': '1200',
    'height': '800',
    'keywords': convertToASCII('recipe,food,lithuanian'),
    'upload-date': new Date().toISOString().split('T')[0],
    'category': convertToASCII('recipe-image'),
    'cuisine': convertToASCII('lithuanian'),
    'description': convertToASCII('Recipe image')
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
 * Upload single image to S3
 */
async function uploadImage(filename) {
  const credentialsValid = await verifyAWSCredentials();
  if (!credentialsValid) {
    throw new Error('AWS credentials not configured');
  }

  const filePath = path.join(UPLOAD_FOLDER, filename);
  const fileContent = fs.readFileSync(filePath);
  const metadata = generateImageMetadata(filename);

  const uploadParams = {
    Bucket: BUCKET_NAME,
    Key: `receptai/${filename}`,
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
    
    // Move file to processed folder
    const processedPath = path.join(PROCESSED_FOLDER, filename);
    fs.renameSync(filePath, processedPath);
    console.log(`📁 Moved to processed folder: ${filename}`);
    
    // Save metadata backup
    const metadataPath = path.join(METADATA_FOLDER, `${filename}.json`);
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    
    return result;
  } catch (error) {
    console.error(`❌ Upload failed: ${error.message}`);
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
    .filter(file => /\.(jpg|jpeg|png|webp|gif)$/i.test(file));

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
