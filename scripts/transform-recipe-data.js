// Script to transform recipe data to match the expected interface
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/receptai';

async function transformRecipeData() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('🔗 Connected to MongoDB');
    
    const db = client.db();
    const collection = db.collection('recipes');
    
    // Get all recipes
    const recipes = await collection.find({}).toArray();
    console.log(`📊 Found ${recipes.length} recipes to transform`);
    
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const recipe of recipes) {
      try {
        const updates = {};
        let hasUpdates = false;
        
        // Transform servings structure
        if (recipe.servings && typeof recipe.servings === 'object' && recipe.servings.amount) {
          updates.servings = recipe.servings.amount;
          updates.servingsUnit = recipe.servings.unit?.lt || 'porcijos';
          hasUpdates = true;
        }
        
        // Transform image structure
        if (recipe.image && recipe.image.url) {
          updates.image = {
            src: recipe.image.url,
            alt: recipe.title?.lt || 'Recipe image',
            width: 1200,
            height: 800
          };
          hasUpdates = true;
        }
        
        // Transform ingredients structure
        if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
          const transformedIngredients = recipe.ingredients.map(ingredient => ({
            name: ingredient.name,
            quantity: `${ingredient.amount || ''} ${ingredient.unit?.lt || ''}`.trim(),
            vital: true, // Default to true since we don't have this field
            notes: ingredient.notes || undefined
          }));
          
          updates.ingredients = transformedIngredients;
          hasUpdates = true;
        }
        
        // Add missing fields
        if (!recipe.tags) {
          updates.tags = recipe.keywords || [];
          hasUpdates = true;
        }
        
        if (!recipe.difficulty) {
          updates.difficulty = 'vidutinis';
          hasUpdates = true;
        }
        
        if (!recipe.language) {
          updates.language = 'lt';
          hasUpdates = true;
        }
        
        if (!recipe.status) {
          updates.status = 'published';
          hasUpdates = true;
        }
        
        if (!recipe.primaryCategoryPath) {
          updates.primaryCategoryPath = 'receptai/karsti-patiekalai';
          hasUpdates = true;
        }
        
        if (!recipe.canonicalUrl) {
          updates.canonicalUrl = `https://ragaujam.lt/receptas/${recipe.slug}`;
          hasUpdates = true;
        }
        
        // Ensure author has profileUrl
        if (recipe.author && !recipe.author.profileUrl) {
          updates.author = {
            ...recipe.author,
            profileUrl: 'https://ragaujam.lt'
          };
          hasUpdates = true;
        }
        
        // Add timestamps if missing
        if (!recipe.createdAt) {
          updates.createdAt = recipe.createdAt || new Date().toISOString();
          hasUpdates = true;
        }
        
        if (!recipe.publishedAt) {
          updates.publishedAt = recipe.createdAt || new Date().toISOString();
          hasUpdates = true;
        }
        
        if (!recipe.updatedAt) {
          updates.updatedAt = new Date().toISOString();
          hasUpdates = true;
        }
        
        // Update the recipe if there are changes
        if (hasUpdates) {
          await collection.updateOne(
            { _id: recipe._id },
            { $set: updates }
          );
          
          console.log(`✅ Transformed recipe: ${recipe.title?.lt || recipe.slug}`);
          updatedCount++;
        } else {
          console.log(`⏭️  No transformation needed: ${recipe.title?.lt || recipe.slug}`);
        }
        
      } catch (error) {
        console.error(`❌ Error transforming recipe ${recipe.slug}:`, error);
        errorCount++;
      }
    }
    
    console.log('\n🎉 Recipe transformation completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Total recipes: ${recipes.length}`);
    console.log(`   - Transformed: ${updatedCount}`);
    console.log(`   - Errors: ${errorCount}`);
    console.log(`   - No changes needed: ${recipes.length - updatedCount - errorCount}`);
    
  } catch (error) {
    console.error('❌ Error connecting to database:', error);
  } finally {
    await client.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the transformation
transformRecipeData().catch(console.error);
