const AWS = require('aws-sdk');
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

/**
 * List all files in S3 bucket
 */
async function listS3Files() {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Prefix: 'receptai/'
    };

    const data = await s3.listObjectsV2(params).promise();
    return data.Contents || [];
  } catch (error) {
    console.error('❌ Error listing S3 files:', error.message);
    return [];
  }
}

/**
 * Delete file from S3
 */
async function deleteS3File(key) {
  try {
    await s3.deleteObject({
      Bucket: BUCKET_NAME,
      Key: key
    }).promise();
    console.log(`🗑️  Deleted: ${key}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to delete ${key}:`, error.message);
    return false;
  }
}

/**
 * Clean up duplicate and compressed files
 */
async function cleanupDuplicates() {
  console.log('🔍 Listing S3 files...');
  const files = await listS3Files();
  
  if (files.length === 0) {
    console.log('📁 No files found in S3');
    return;
  }

  console.log(`📁 Found ${files.length} files in S3`);
  
  // Find files to delete
  const filesToDelete = files.filter(file => {
    const filename = file.Key.split('/').pop();
    
    // Delete files that start with "compressed_"
    if (filename.startsWith('compressed_')) {
      return true;
    }
    
    return false;
  });

  if (filesToDelete.length === 0) {
    console.log('✅ No duplicate files found to clean up');
    return;
  }

  console.log(`🗑️  Found ${filesToDelete.length} files to delete:`);
  filesToDelete.forEach(file => {
    console.log(`   - ${file.Key}`);
  });

  // Ask for confirmation
  console.log('\n⚠️  This will permanently delete the above files from S3.');
  console.log('💡 Press Ctrl+C to cancel, or wait 5 seconds to proceed...');
  
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  console.log('\n🗑️  Starting cleanup...');
  
  let deletedCount = 0;
  for (const file of filesToDelete) {
    const success = await deleteS3File(file.Key);
    if (success) {
      deletedCount++;
    }
  }

  console.log(`\n✅ Cleanup complete! Deleted ${deletedCount}/${filesToDelete.length} files`);
  
  // List remaining files
  console.log('\n📁 Remaining files:');
  const remainingFiles = await listS3Files();
  remainingFiles.forEach(file => {
    const filename = file.Key.split('/').pop();
    const sizeMB = (file.Size / 1024 / 1024).toFixed(2);
    console.log(`   ${filename} (${sizeMB}MB)`);
  });
}

// Run cleanup
if (require.main === module) {
  cleanupDuplicates().catch(console.error);
}

module.exports = { cleanupDuplicates };
