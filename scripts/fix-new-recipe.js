require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function fixNewRecipe() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();
  
  console.log('🔧 Fixing the new recipe...');
  
  // Find the recipe by slug
  const recipe = await db.collection('recipes_new').findOne({ slug: 'jjj' });
  
  if (!recipe) {
    console.log('❌ Recipe not found');
    await client.close();
    return;
  }
  
  console.log('📝 Found recipe:', recipe.title.lt);
  console.log('   Current primaryCategoryPath:', recipe.primaryCategoryPath);
  console.log('   Current tags:', recipe.tags);
  
  // Update the recipe to match our category structure
  const updateResult = await db.collection('recipes_new').updateOne(
    { slug: 'jjj' },
    {
      $set: {
        // Fix category path (remove "receptai/" prefix and set to sriubos)
        categoryPath: 'sriubos',
        primaryCategoryPath: 'sriubos',
        
        // Add missing tags for filtering
        tags: [
          ...recipe.tags,
          'sriubos' // Add category tag for filtering
        ],
        
        // Update breadcrumbs
        breadcrumbs: [
          {
            name: "Receptai",
            url: "/receptai"
          },
          {
            name: "Sriubos", 
            url: "/receptai/sriubos"
          }
        ],
        
        updatedAt: new Date()
      }
    }
  );
  
  if (updateResult.modifiedCount > 0) {
    console.log('✅ Recipe updated successfully!');
    console.log('   New categoryPath: sriubos');
    console.log('   Updated tags:', [...recipe.tags, 'sriubos']);
    console.log('');
    console.log('🎯 The recipe should now appear at:');
    console.log('   http://localhost:3000/receptai/sriubos');
    console.log('');
    console.log('🧪 Test filters:');
    console.log('   - "Vegetariška" (should show this recipe)');
    console.log('   - "Su pupelėmis" (should show this recipe)');
    console.log('   - "30-60 min" time filter (should show this recipe)');
  } else {
    console.log('❌ Failed to update recipe');
  }
  
  await client.close();
}

fixNewRecipe().catch(console.error);
