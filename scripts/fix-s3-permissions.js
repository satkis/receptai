const AWS = require('aws-sdk');

// Configure AWS
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'eu-north-1'
});

const BUCKET_NAME = 'receptu-images';

async function fixS3Permissions() {
  try {
    console.log('🔧 Fixing S3 bucket permissions...');
    
    // 1. Set bucket policy for public read access
    const bucketPolicy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicReadGetObject',
          Effect: 'Allow',
          Principal: '*',
          Action: 's3:GetObject',
          Resource: `arn:aws:s3:::${BUCKET_NAME}/*`
        }
      ]
    };
    
    await s3.putBucketPolicy({
      Bucket: BUCKET_NAME,
      Policy: JSON.stringify(bucketPolicy)
    }).promise();
    
    console.log('✅ Bucket policy updated for public read access');
    
    // 2. Disable block public access settings
    await s3.putPublicAccessBlock({
      Bucket: BUCKET_NAME,
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: false,
        IgnorePublicAcls: false,
        BlockPublicPolicy: false,
        RestrictPublicBuckets: false
      }
    }).promise();
    
    console.log('✅ Public access block settings updated');
    
    // 3. Set CORS configuration for web access
    const corsConfiguration = {
      CORSRules: [
        {
          AllowedHeaders: ['*'],
          AllowedMethods: ['GET', 'HEAD'],
          AllowedOrigins: ['*'],
          ExposeHeaders: ['ETag'],
          MaxAgeSeconds: 3000
        }
      ]
    };
    
    await s3.putBucketCors({
      Bucket: BUCKET_NAME,
      CORSConfiguration: corsConfiguration
    }).promise();
    
    console.log('✅ CORS configuration updated');
    
    // 4. Test access to a specific image
    console.log('\n🧪 Testing image access...');
    
    try {
      const testUrl = 'https://receptu-images.s3.eu-north-1.amazonaws.com/receptai/spageciai-su-pomidoru-alyvuogiu-rukolos-padazu.jpg';
      
      // Try to get object metadata
      const urlParts = testUrl.split('/');
      const key = urlParts.slice(3).join('/'); // Get everything after the domain
      
      const headResult = await s3.headObject({
        Bucket: BUCKET_NAME,
        Key: key
      }).promise();
      
      console.log(`✅ Test image accessible: ${key}`);
      console.log(`   Size: ${headResult.ContentLength} bytes`);
      console.log(`   Type: ${headResult.ContentType}`);
      
    } catch (testError) {
      if (testError.code === 'NotFound') {
        console.log('⚠️  Test image not found in S3 - this is expected if the file doesn\'t exist');
      } else {
        console.log('❌ Test failed:', testError.message);
      }
    }
    
    console.log('\n🎉 S3 permissions fixed! Your images should now be publicly accessible.');
    
  } catch (error) {
    console.error('❌ Error fixing S3 permissions:', error);
    
    if (error.code === 'AccessDenied') {
      console.log('\n💡 Possible solutions:');
      console.log('1. Check your AWS credentials in .env.local');
      console.log('2. Ensure your AWS user has S3 permissions');
      console.log('3. You might need to do this manually in AWS Console');
    }
  }
}

// List all objects in the bucket to verify structure
async function listBucketContents() {
  try {
    console.log('\n📁 Listing bucket contents...');
    
    const result = await s3.listObjectsV2({
      Bucket: BUCKET_NAME,
      Prefix: 'receptai/',
      MaxKeys: 10
    }).promise();
    
    if (result.Contents && result.Contents.length > 0) {
      console.log(`Found ${result.Contents.length} objects (showing first 10):`);
      result.Contents.forEach(obj => {
        console.log(`   ${obj.Key} (${obj.Size} bytes)`);
      });
    } else {
      console.log('No objects found in receptai/ folder');
    }
    
  } catch (error) {
    console.error('❌ Error listing bucket contents:', error.message);
  }
}

// Check if specific problematic images exist
async function checkProblematicImages() {
  const problematicImages = [
    'receptai/spageciai-su-pomidoru-alyvuogiu-rukolos-padazu.jpg',
    'receptai/purus-amerikietiski-blynai.png'
  ];
  
  console.log('\n🔍 Checking problematic images...');
  
  for (const key of problematicImages) {
    try {
      const result = await s3.headObject({
        Bucket: BUCKET_NAME,
        Key: key
      }).promise();
      
      console.log(`✅ ${key} exists (${result.ContentLength} bytes)`);
      
    } catch (error) {
      if (error.code === 'NotFound') {
        console.log(`❌ ${key} not found in S3`);
      } else {
        console.log(`❌ ${key} error: ${error.message}`);
      }
    }
  }
}

async function main() {
  console.log('🚀 Starting S3 permissions fix...\n');
  
  await fixS3Permissions();
  await listBucketContents();
  await checkProblematicImages();
  
  console.log('\n✅ S3 fix complete!');
  console.log('\n💡 Next steps:');
  console.log('1. Run: node scripts/fix-image-urls.js');
  console.log('2. Test your website images');
  console.log('3. If still issues, check AWS Console S3 bucket settings');
}

main().catch(console.error);
