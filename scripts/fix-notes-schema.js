const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://receptai:SXF0NrgQbiQi8EeB@cluster0.zy6ywwg.mongodb.net/';
const DATABASE_NAME = 'receptai';

async function fixNotesSchema() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(DATABASE_NAME);
    
    // Find all recipes with notes that are simple strings
    const recipesWithStringNotes = await db.collection('recipes_new').find({
      notes: { $exists: true, $type: "array" }
    }).toArray();
    
    console.log(`Found ${recipesWithStringNotes.length} recipes with notes`);
    
    let updatedCount = 0;
    
    for (const recipe of recipesWithStringNotes) {
      // Check if notes are simple strings (not objects)
      const hasStringNotes = recipe.notes.some(note => typeof note === 'string');
      
      if (hasStringNotes) {
        // Convert string notes to proper schema
        const convertedNotes = recipe.notes.map((note, index) => {
          if (typeof note === 'string') {
            return {
              text: { lt: note },
              priority: index + 1
            };
          }
          return note; // Already in correct format
        });
        
        // Update the recipe
        const result = await db.collection('recipes_new').updateOne(
          { _id: recipe._id },
          {
            $set: {
              notes: convertedNotes,
              updatedAt: new Date().toISOString()
            }
          }
        );
        
        if (result.modifiedCount > 0) {
          console.log(`✅ Updated notes for recipe: ${recipe.slug}`);
          updatedCount++;
        }
      }
    }
    
    console.log(`\n🎉 Successfully updated ${updatedCount} recipes`);
    
  } catch (error) {
    console.error('❌ Error updating notes schema:', error);
  } finally {
    await client.close();
  }
}

fixNotesSchema();
