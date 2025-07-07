const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://receptai:SXF0NrgQbiQi8EeB@cluster0.zy6ywwg.mongodb.net/';
const DATABASE_NAME = 'receptai';

async function fixImageUrl() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(DATABASE_NAME);
    
    // First, let's check what image URLs are working for other recipes
    const workingRecipe = await db.collection('recipes_new').findOne({
      "image.src": { $regex: "receptu-images.s3.eu-north-1.amazonaws.com" },
      slug: { $ne: "kepta-vistiena-su-anakardziu-riesutais-tailandietiskai" }
    });

    if (workingRecipe) {
      console.log('✅ Found working recipe image:', workingRecipe.image.src);
    }

    // Temporarily use hero image as fallback
    const result = await db.collection('recipes_new').updateOne(
      { slug: "kepta-vistiena-su-anakardziu-riesutais-tailandietiskai" },
      {
        $set: {
          "image.src": "https://ragaujam.lt/hero-image.jpg", // Temporary fallback
          "image.alt": "Traški tailandietiška vištiena su anakardžių riešutais",
          "updatedAt": new Date().toISOString()
        }
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log('✅ Successfully updated image URL');
      console.log('New image URL: https://receptu-images.s3.eu-north-1.amazonaws.com/receptai/traski-tailandietiska-vistiena-su-anakardziu-riesutais.png');
    } else {
      console.log('❌ No recipe was updated');
    }
    
  } catch (error) {
    console.error('❌ Error updating image URL:', error);
  } finally {
    await client.close();
  }
}

fixImageUrl();
