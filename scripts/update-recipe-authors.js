// Script to update recipe authors from Receptai.lt to Ragaujam.lt
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/receptai';

async function updateRecipeAuthors() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('🔗 Connected to MongoDB');
    
    const db = client.db();
    const collection = db.collection('recipes');
    
    // Update all recipes with author.name "Receptai.lt" to "Ragaujam.lt"
    const result = await collection.updateMany(
      { 'author.name': 'Receptai.lt' },
      { 
        $set: { 
          'author.name': 'Ragaujam.lt',
          'updatedAt': new Date()
        } 
      }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} recipes`);
    
    // Also check for any other variations
    const variations = ['Paragaujam.lt', 'paragaujam.lt', 'Paragaujam', 'paragaujam'];
    
    for (const variation of variations) {
      const varResult = await collection.updateMany(
        { 'author.name': variation },
        { 
          $set: { 
            'author.name': 'Ragaujam.lt',
            'updatedAt': new Date()
          } 
        }
      );
      
      if (varResult.modifiedCount > 0) {
        console.log(`✅ Updated ${varResult.modifiedCount} recipes with author "${variation}"`);
      }
    }
    
    // List all unique author names to verify
    const authors = await collection.distinct('author.name');
    console.log('\n📋 All author names in database:');
    authors.forEach(author => {
      console.log(`   - ${author}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('🔌 Database connection closed');
  }
}

updateRecipeAuthors().catch(console.error);
