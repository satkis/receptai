const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://receptai:SXF0NrgQbiQi8EeB@cluster0.zy6ywwg.mongodb.net/';
const DATABASE_NAME = 'receptai';

async function updateRecipeImage() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(DATABASE_NAME);
    
    // Update the specific recipe (slug "oo")
    const result = await db.collection('recipes_new').updateOne(
      { slug: "oo" },
      {
        $set: {
          "image.src": "https://receptu-images.s3.eu-north-1.amazonaws.com/receptai/rrr.jpg",
          "image.alt": "Toskanietiška pupelių sriuba dubenyje su daržovėmis",
          "image.width": 1200,
          "image.height": 800,
          "updatedAt": new Date()
        }
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log('✅ Recipe image updated successfully!');
      console.log('🔗 New image URL: https://receptu-images.s3.eu-north-1.amazonaws.com/receptai/rrr.jpg');
      console.log('🌐 Test at: https://staging-ragaujam.vercel.app/receptas/kk');
    } else {
      console.log('❌ Recipe not found or no changes made');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

updateRecipeImage();
