// Script to update your specific recipe with the correct simplified schema
// Run with: node update-recipe-schema.js

const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://receptai:SXF0NrgQbiQi8EeB@cluster0.zy6ywwg.mongodb.net/receptai?retryWrites=true&w=majority';

/**
 * Generate simple blur placeholder
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

async function updateRecipeSchema() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('receptai');
    
    // Find your specific recipe
    const recipe = await db.collection('recipes_new').findOne({
      slug: "nimg-sokoladoo-desertas"
    });

    if (!recipe) {
      console.log('❌ Recipe not found');
      return;
    }

    console.log('📝 Found recipe:', recipe.title?.lt || recipe.title);
    console.log('📸 Current image:', recipe.image);

    // Update with correct simplified schema
    const updatedImage = {
      src: "https://receptu-images.s3.eu-north-1.amazonaws.com/IMG_8853.JPG",
      alt: "Greitas šokolado desertas su grietinėle",
      width: 1200,
      height: 800,
      blurHash: generateSimpleBlurPlaceholder()
    };

    // Remove any old formats field if it exists
    const updateOperation = {
      $set: {
        image: updatedImage,
        updatedAt: new Date()
      }
    };

    // Remove formats field if it exists
    if (recipe.image?.formats) {
      updateOperation.$unset = { 'image.formats': "" };
    }

    const result = await db.collection('recipes_new').updateOne(
      { slug: "nimg-sokoladoo-desertas" },
      updateOperation
    );

    console.log('\n✅ Update result:', result.modifiedCount > 0 ? 'SUCCESS' : 'FAILED');
    
    if (result.modifiedCount > 0) {
      console.log('🖼️  Updated image structure:');
      console.log('   - src:', updatedImage.src);
      console.log('   - alt:', updatedImage.alt);
      console.log('   - dimensions:', `${updatedImage.width}x${updatedImage.height}`);
      console.log('   - blurHash: Generated simple placeholder');
      console.log('   - formats: Removed (Next.js will auto-generate)');
      console.log('\n🎉 Recipe updated successfully!');
      console.log(`🔗 Test at: http://localhost:3003/receptas/nimg-sokoladoo-desertas`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

updateRecipeSchema();
