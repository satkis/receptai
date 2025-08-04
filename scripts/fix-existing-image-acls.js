const AWS = require('aws-sdk');
const { MongoClient } = require('mongodb');

// Configure AWS (using existing credentials from upload script)
const s3 = new AWS.S3({
  region: 'eu-north-1'
});

const BUCKET_NAME = 'receptu-images';
const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.MONGODB_DB || 'receptai';

// List of problematic images we know about
const PROBLEMATIC_IMAGES = [
  'spageciai-su-pomidoru-alyvuogiu-rukolos-padazu.jpg',
  'purus-amerikietiski-blynai.png'
];

async function fixImageACLs() {
  console.log('🔧 Fixing S3 image ACLs for Vercel access...\n');
  
  try {
    // Get all recipe images from database
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DATABASE_NAME);
    
    const recipes = await db.collection('recipes_new')
      .find({ "image.src": { $regex: /receptu-images/ } })
      .toArray();
    
    console.log(`📋 Found ${recipes.length} recipes with S3 images`);
    
    let fixedCount = 0;
    let errorCount = 0;
    
    for (const recipe of recipes) {
      const imageUrl = recipe.image.src;
      
      // Extract S3 key from URL
      const urlParts = imageUrl.split('/');
      const key = urlParts.slice(3).join('/'); // Everything after domain
      
      console.log(`\n🔍 Processing: ${recipe.slug}`);
      console.log(`   Image: ${key}`);
      
      try {
        // Check if object exists first
        await s3.headObject({
          Bucket: BUCKET_NAME,
          Key: key
        }).promise();
        
        // Set public-read ACL
        await s3.putObjectAcl({
          Bucket: BUCKET_NAME,
          Key: key,
          ACL: 'public-read'
        }).promise();
        
        console.log(`   ✅ ACL updated to public-read`);
        fixedCount++;
        
        // Test access
        const testUrl = `https://${BUCKET_NAME}.s3.eu-north-1.amazonaws.com/${key}`;
        console.log(`   🧪 Test URL: ${testUrl}`);
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        errorCount++;
        
        if (error.code === 'NoSuchKey') {
          console.log(`   📝 Image file doesn't exist in S3`);
        } else if (error.code === 'AccessDenied') {
          console.log(`   🔑 Access denied - check AWS credentials`);
        }
      }
    }
    
    await client.close();
    
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Fixed: ${fixedCount} images`);
    console.log(`   ❌ Errors: ${errorCount} images`);
    
    if (fixedCount > 0) {
      console.log(`\n🎉 Success! Your images should now work with Vercel optimization.`);
      console.log(`\n🧪 Test these URLs in your browser:`);
      
      // Show test URLs for problematic images
      PROBLEMATIC_IMAGES.forEach(filename => {
        console.log(`   https://${BUCKET_NAME}.s3.eu-north-1.amazonaws.com/receptai/${filename}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Script error:', error.message);
    
    if (error.message.includes('credentials')) {
      console.log('\n💡 AWS credentials issue. Make sure you have:');
      console.log('1. AWS_ACCESS_KEY_ID in your environment');
      console.log('2. AWS_SECRET_ACCESS_KEY in your environment');
      console.log('3. Or AWS credentials configured locally');
    }
  }
}

// Alternative: Test direct S3 access without credentials
async function testDirectAccess() {
  console.log('\n🧪 Testing direct S3 access (no credentials needed)...\n');
  
  const testImages = [
    'receptai/spageciai-su-pomidoru-alyvuogiu-rukolos-padazu.jpg',
    'receptai/purus-amerikietiski-blynai.png'
  ];
  
  for (const key of testImages) {
    const url = `https://${BUCKET_NAME}.s3.eu-north-1.amazonaws.com/${key}`;
    console.log(`Testing: ${url}`);
    
    try {
      const response = await fetch(url, { method: 'HEAD' });
      
      if (response.ok) {
        console.log(`   ✅ Accessible (${response.status})`);
      } else {
        console.log(`   ❌ Not accessible (${response.status})`);
      }
    } catch (error) {
      console.log(`   ❌ Network error: ${error.message}`);
    }
  }
}

async function main() {
  console.log('🚀 Starting S3 ACL fix for Vercel image optimization...\n');
  
  // Try to fix ACLs (requires AWS credentials)
  await fixImageACLs();
  
  // Test direct access (no credentials needed)
  await testDirectAccess();
  
  console.log('\n✅ Script complete!');
  console.log('\n💡 If images still don\'t work:');
  console.log('1. Check your Vercel image domains in next.config.js');
  console.log('2. Verify S3 bucket policy allows public read');
  console.log('3. Test direct S3 URLs in browser first');
}

main().catch(console.error);
