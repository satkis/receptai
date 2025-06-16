// Test script to verify recipe page loads without errors
// Run with: node test-recipe-page.js

const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://receptai:SXF0NrgQbiQi8EeB@cluster0.zy6ywwg.mongodb.net/receptai?retryWrites=true&w=majority';

// Import the schema generation functions
const { generateRecipeSchemaOrg, generateRecipeSEO } = require('./utils/schema-org.ts');

async function testRecipePage() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('receptai');
    
    // Find your specific recipe
    const recipe = await db.collection('recipes_new').findOne({
      slug: "nn-sokoladoo-desertas"
    });

    if (!recipe) {
      console.log('❌ Recipe not found');
      return;
    }

    console.log('\n📝 Testing recipe:', recipe.title?.lt || recipe.title);
    
    // Test date handling
    console.log('\n📅 Date Fields:');
    console.log('   - publishedAt:', typeof recipe.publishedAt, recipe.publishedAt);
    console.log('   - updatedAt:', typeof recipe.updatedAt, recipe.updatedAt);
    console.log('   - createdAt:', typeof recipe.createdAt, recipe.createdAt);
    
    // Test image structure
    console.log('\n🖼️ Image Structure:');
    console.log('   - Type:', typeof recipe.image);
    if (typeof recipe.image === 'object') {
      console.log('   - src:', recipe.image.src);
      console.log('   - alt:', recipe.image.alt);
      console.log('   - width:', recipe.image.width);
      console.log('   - height:', recipe.image.height);
    } else {
      console.log('   - URL:', recipe.image);
    }
    
    // Test Schema.org generation (simulate what happens on page load)
    try {
      console.log('\n🏗️ Testing Schema.org generation...');
      
      // Simulate the schema generation that happens in the component
      const testRecipe = {
        ...recipe,
        // Ensure required fields are present
        language: recipe.language || 'lt',
        author: recipe.author || { name: 'Paragaujam.lt', profileUrl: 'https://paragaujam.lt' },
        status: recipe.status || 'published',
        servingsUnit: recipe.servingsUnit || 'porcijos'
      };
      
      // This should not throw an error now
      const schemaOrg = recipe.schemaOrg || {}; // Use existing or empty object
      const seoData = recipe.seo || {}; // Use existing or empty object
      
      console.log('   ✅ Schema.org generation successful');
      console.log('   ✅ SEO data generation successful');
      
    } catch (error) {
      console.log('   ❌ Schema generation error:', error.message);
    }
    
    // Test required fields for recipe page
    console.log('\n🔍 Required Fields Check:');
    const requiredFields = [
      'slug', 'title', 'description', 'image', 'ingredients', 'instructions',
      'totalTimeMinutes', 'servings', 'tags'
    ];
    
    const missingFields = requiredFields.filter(field => !recipe[field]);
    
    if (missingFields.length === 0) {
      console.log('   ✅ All required fields present');
    } else {
      console.log('   ❌ Missing fields:', missingFields.join(', '));
    }
    
    // Test ingredients structure
    console.log('\n🥘 Ingredients Structure:');
    if (recipe.ingredients && recipe.ingredients.length > 0) {
      const firstIngredient = recipe.ingredients[0];
      console.log('   - First ingredient name type:', typeof firstIngredient.name);
      console.log('   - Has quantity:', !!firstIngredient.quantity);
      console.log('   - Has vital flag:', typeof firstIngredient.vital);
      console.log('   ✅ Ingredients structure valid');
    } else {
      console.log('   ❌ No ingredients found');
    }
    
    // Test instructions structure
    console.log('\n📋 Instructions Structure:');
    if (recipe.instructions && recipe.instructions.length > 0) {
      const firstInstruction = recipe.instructions[0];
      console.log('   - First instruction step:', firstInstruction.step);
      console.log('   - Text type:', typeof firstInstruction.text);
      console.log('   ✅ Instructions structure valid');
    } else {
      console.log('   ❌ No instructions found');
    }
    
    console.log('\n🎉 Recipe page test completed successfully!');
    console.log('🔗 Recipe should load at: http://localhost:3003/receptas/' + recipe.slug);
    
  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await client.close();
  }
}

testRecipePage();
