// Script to generate blur hashes for existing recipe images
// This will help populate the blurHash field in your database
// Run with: node scripts/generate-blur-hashes.js

const { MongoClient } = require('mongodb');
const sharp = require('sharp'); // You'll need to install: npm install sharp
const { encode } = require('blurhash'); // You'll need to install: npm install blurhash

const MONGODB_URI = 'mongodb+srv://receptai:SXF0NrgQbiQi8EeB@cluster0.zy6ywwg.mongodb.net/receptai?retryWrites=true&w=majority';

/**
 * Generate blur hash from image URL
 */
async function generateBlurHashFromUrl(imageUrl) {
  try {
    console.log(`📸 Processing: ${imageUrl}`);
    
    // Fetch image and convert to buffer
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    const imageBuffer = await response.arrayBuffer();
    
    // Use Sharp to process image and get pixel data
    const { data, info } = await sharp(Buffer.from(imageBuffer))
      .resize(32, 32) // Small size for blur hash
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    // Generate blur hash
    const blurHash = encode(
      new Uint8ClampedArray(data),
      info.width,
      info.height,
      4, // X components
      3  // Y components
    );
    
    console.log(`✅ Generated blur hash: ${blurHash}`);
    return blurHash;
    
  } catch (error) {
    console.error(`❌ Error generating blur hash for ${imageUrl}:`, error.message);
    return null;
  }
}

/**
 * Generate simple base64 blur placeholder (fallback)
 */
function generateSimpleBlurPlaceholder() {
  const svg = `
    <svg width="8" height="8" xmlns="http://www.w3.org/2000/svg">
      <filter id="blur">
        <feGaussianBlur stdDeviation="1"/>
      </filter>
      <rect width="100%" height="100%" fill="#f3f4f6" filter="url(#blur)"/>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Update recipes with blur hashes
 */
async function updateRecipesWithBlurHashes() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('receptai');
    
    // Find recipes with S3 images that don't have blur hashes
    const recipes = await db.collection('recipes_new').find({
      'image.src': { $exists: true },
      $or: [
        { 'image.blurHash': { $exists: false } },
        { 'image.blurHash': null },
        { 'image.blurHash': '' }
      ]
    }).toArray();
    
    console.log(`\n📋 Found ${recipes.length} recipes needing blur hashes`);
    
    for (const recipe of recipes) {
      console.log(`\n🔄 Processing recipe: ${recipe.slug}`);
      
      let blurHash = null;
      
      // Try to generate actual blur hash
      if (recipe.image?.src) {
        blurHash = await generateBlurHashFromUrl(recipe.image.src);
      }
      
      // Fallback to simple placeholder
      if (!blurHash) {
        blurHash = generateSimpleBlurPlaceholder();
        console.log(`📝 Using fallback blur placeholder`);
      }
      
      // Update recipe in database
      const result = await db.collection('recipes_new').updateOne(
        { _id: recipe._id },
        {
          $set: {
            'image.blurHash': blurHash,
            updatedAt: new Date()
          }
        }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`✅ Updated ${recipe.slug} with blur hash`);
      } else {
        console.log(`❌ Failed to update ${recipe.slug}`);
      }
      
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`\n🎉 Completed processing ${recipes.length} recipes!`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

// Run the script
if (require.main === module) {
  console.log('🚀 Starting blur hash generation...');
  console.log('📦 Make sure you have installed: npm install sharp blurhash');
  console.log('');
  
  updateRecipesWithBlurHashes()
    .then(() => {
      console.log('\n✅ Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = {
  generateBlurHashFromUrl,
  generateSimpleBlurPlaceholder,
  updateRecipesWithBlurHashes
};
