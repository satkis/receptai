const { MongoClient, ObjectId } = require('mongodb');

// Use the connection string directly
const MONGODB_URI = 'mongodb+srv://receptai:SXF0NrgQbiQi8EeB@cluster0.zy6ywwg.mongodb.net/';
const MONGODB_DB = 'receptai';

async function getRecipeDescription(objectId) {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');

    const db = client.db(MONGODB_DB);
    
    // Find recipe by ObjectID
    const recipe = await db.collection('recipes').findOne({ 
      _id: new ObjectId(objectId) 
    });
    
    if (!recipe) {
      console.log('Recipe not found with ObjectID:', objectId);
      return null;
    }
    
    console.log('Recipe found:');
    console.log('Title (LT):', recipe.title?.lt || recipe.title);
    console.log('Description (LT):', recipe.description?.lt || recipe.description);
    console.log('Slug:', recipe.slug);
    
    return recipe.description?.lt || recipe.description;
    
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return null;
  } finally {
    await client.close();
  }
}

// Get the ObjectID from command line argument or use the provided one
const objectId = process.argv[2] || '6846bf66b385d15ecb6fc764';

getRecipeDescription(objectId)
  .then(description => {
    if (description) {
      console.log('\n=== LITHUANIAN DESCRIPTION ===');
      console.log(description);
    }
  })
  .catch(console.error);
