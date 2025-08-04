const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://receptai:SXF0NrgQbiQi8EeB@cluster0.zy6ywwg.mongodb.net/';
const DATABASE_NAME = 'receptai';

async function fixImageUrls() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(DATABASE_NAME);
    const collection = db.collection('recipes_new');
    
    // Find all recipes with image URLs that have newlines or other issues
    const recipes = await collection.find({
      $or: [
        { "image.src": { $regex: /\n|\r|\t/ } }, // Contains newlines, carriage returns, or tabs
        { "image.src": { $regex: /^[\s]+/ } },   // Starts with whitespace
        { "image.src": { $regex: /[\s]+$/ } }    // Ends with whitespace
      ]
    }).toArray();
    
    console.log(`🔍 Found ${recipes.length} recipes with problematic image URLs`);
    
    if (recipes.length === 0) {
      console.log('✅ No problematic URLs found');
      return;
    }
    
    // Fix each recipe
    let fixedCount = 0;
    
    for (const recipe of recipes) {
      const originalSrc = recipe.image.src;
      
      // Clean the URL by removing all whitespace characters
      const cleanedSrc = originalSrc
        .replace(/[\n\r\t\s]/g, '') // Remove all whitespace characters
        .trim();
      
      console.log(`\n📝 Recipe: ${recipe.slug}`);
      console.log(`   Original: "${originalSrc}"`);
      console.log(`   Cleaned:  "${cleanedSrc}"`);
      console.log(`   Char codes: [${[...originalSrc.substring(0, 10)].map(c => c.charCodeAt(0)).join(', ')}]`);
      
      // Update the recipe
      const result = await collection.updateOne(
        { _id: recipe._id },
        {
          $set: {
            "image.src": cleanedSrc,
            "updatedAt": new Date()
          }
        }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`   ✅ Fixed`);
        fixedCount++;
      } else {
        console.log(`   ❌ Failed to update`);
      }
    }
    
    console.log(`\n🎉 Fixed ${fixedCount} out of ${recipes.length} recipes`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

// Also check for other common issues
async function validateAllImageUrls() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db(DATABASE_NAME);
    const collection = db.collection('recipes_new');
    
    const recipes = await collection.find({ "image.src": { $exists: true } }).toArray();
    
    console.log(`\n🔍 Validating ${recipes.length} recipe image URLs...`);
    
    const issues = [];
    
    for (const recipe of recipes) {
      const src = recipe.image.src;
      
      // Check for various issues
      if (!src.startsWith('https://')) {
        issues.push({ slug: recipe.slug, issue: 'Not HTTPS', src });
      }
      
      if (!src.includes('receptu-images.s3.eu-north-1.amazonaws.com')) {
        issues.push({ slug: recipe.slug, issue: 'Wrong S3 domain', src });
      }
      
      if (src.includes(' ')) {
        issues.push({ slug: recipe.slug, issue: 'Contains spaces', src });
      }
      
      if (src.length > 200) {
        issues.push({ slug: recipe.slug, issue: 'URL too long', src: src.substring(0, 50) + '...' });
      }
    }
    
    if (issues.length > 0) {
      console.log(`\n⚠️  Found ${issues.length} additional issues:`);
      issues.forEach(issue => {
        console.log(`   ${issue.slug}: ${issue.issue} - ${issue.src}`);
      });
    } else {
      console.log('✅ All image URLs look good!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

// Run both functions
async function main() {
  console.log('🔧 Starting image URL cleanup...\n');
  await fixImageUrls();
  await validateAllImageUrls();
  console.log('\n✅ Image URL cleanup complete!');
}

main().catch(console.error);
