#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const s3 = new AWS.S3({
  region: process.env.AWS_REGION || 'eu-north-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const BUCKET_NAME = 'receptu-images';
const IMAGE_PATH = 'C:\\Users\\karolis\\VibeCoding\\receptai\\scripts\\wiki\\output\\vistiena-pagal-peru-recepta-aji-de-gallina.jpg';
const FILENAME = 'vistiena-pagal-peru-recepta-aji-de-gallina.jpg';
const PROCESSED_DIR = 'C:\\Users\\karolis\\VibeCoding\\receptai\\scripts\\wiki\\output\\processed\\wiki_images';

async function compressImage(inputPath, outputPath) {
  try {
    console.log('🔄 Compressing image...');
    
    const metadata = await sharp(inputPath).metadata();
    const maxWidth = 1200;
    const maxHeight = 800;
    const quality = 85;

    let pipeline = sharp(inputPath);

    if (metadata.width > maxWidth || metadata.height > maxHeight) {
      pipeline = pipeline.resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    pipeline = pipeline.jpeg({ quality, progressive: true });
    await pipeline.toFile(outputPath);

    console.log('✅ Image compressed');
  } catch (error) {
    console.error('❌ Compression error:', error.message);
    throw error;
  }
}

async function uploadToS3(filename, filePath) {
  try {
    console.log('📤 Uploading to S3...');
    
    const fileContent = fs.readFileSync(filePath);

    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: `receptai/${filename}`,
      Body: fileContent,
      ContentType: 'image/jpeg',
      CacheControl: 'public, max-age=31536000',
      ContentDisposition: 'inline'
    };

    const result = await s3.upload(uploadParams).promise();
    console.log(`✅ Uploaded to S3: ${result.Location}`);
    return result.Location;
  } catch (error) {
    console.error('❌ S3 upload error:', error.message);
    throw error;
  }
}

async function main() {
  try {
    console.log('\n📸 Uploading Single Image\n');
    console.log(`File: ${FILENAME}\n`);

    // Verify file exists
    if (!fs.existsSync(IMAGE_PATH)) {
      throw new Error(`Image file not found: ${IMAGE_PATH}`);
    }

    // Compress
    const compressedPath = path.join(path.dirname(IMAGE_PATH), `compressed_${FILENAME}`);
    await compressImage(IMAGE_PATH, compressedPath);

    // Upload to S3
    const s3Url = await uploadToS3(FILENAME, compressedPath);

    // Move to processed folder
    const processedPath = path.join(PROCESSED_DIR, FILENAME);
    fs.renameSync(IMAGE_PATH, processedPath);
    console.log(`📁 Moved to processed folder`);

    // Cleanup
    if (fs.existsSync(compressedPath)) {
      fs.unlinkSync(compressedPath);
    }

    console.log('\n✅ Done!\n');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();

