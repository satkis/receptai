// Test Search with New Ingredients Structure
// Run with: node scripts/test-search-new-structure.js

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://receptai:SXF0NrgQbiQi8EeB@cluster0.zy6ywwg.mongodb.net/';
const DATABASE_NAME = 'receptai';

async function testSearchNewStructure() {
  console.log('🔍 Testing Search with New Ingredients Structure...\n');
  
  let client;
  
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DATABASE_NAME);
    
    console.log('✅ Connected to MongoDB');
    
    // Test 1: Check text index configuration
    console.log('\n📋 Test 1: Checking text search index...');
    
    const indexes = await db.collection('recipes_new').indexes();
    const textIndex = indexes.find(index => 
      index.name === 'recipe_search_optimized' || 
      Object.values(index.key || {}).includes('text')
    );
    
    if (textIndex) {
      console.log('✅ Text search index found:', textIndex.name);
      console.log('   Index keys:', Object.keys(textIndex.key || {}));
      console.log('   Weights:', textIndex.weights || 'Default weights');
    } else {
      console.log('❌ Text search index NOT found');
    }
    
    // Test 2: Check recipes with new structure
    console.log('\n📋 Test 2: Finding recipes with new ingredients structure...');
    
    const newStructureRecipes = await db.collection('recipes_new')
      .find({ 
        'ingredients.main': { $exists: true },
        'ingredients.sides.items': { $exists: true, $ne: [] }
      })
      .project({ title: 1, 'ingredients.sides': 1 })
      .limit(5)
      .toArray();
    
    console.log(`Found ${newStructureRecipes.length} recipes with side ingredients:`);
    newStructureRecipes.forEach((recipe, index) => {
      console.log(`${index + 1}. ${recipe.title?.lt}`);
      console.log(`   Side category: ${recipe.ingredients?.sides?.category}`);
      const sideItems = recipe.ingredients?.sides?.items || [];
      sideItems.forEach((item, i) => {
        console.log(`   ${i + 1}. ${item.name?.lt} - ${item.quantity}`);
      });
      console.log('');
    });
    
    // Test 3: Search for "grietinė" specifically
    console.log('\n📋 Test 3: Testing search for "grietinė"...');
    
    // Direct text search
    const textSearchResults = await db.collection('recipes_new')
      .find({
        $text: {
          $search: 'grietinė grietine',
          $caseSensitive: false,
          $diacriticSensitive: false
        }
      })
      .project({ 
        title: 1, 
        'ingredients.main.name.lt': 1,
        'ingredients.sides': 1,
        score: { $meta: "textScore" }
      })
      .sort({ score: { $meta: "textScore" } })
      .limit(5)
      .toArray();
    
    console.log(`Text search results: ${textSearchResults.length}`);
    textSearchResults.forEach((recipe, index) => {
      console.log(`${index + 1}. ${recipe.title?.lt} (score: ${recipe.score?.toFixed(2)})`);
      
      // Check main ingredients
      const mainIngredients = recipe.ingredients?.main || [];
      const grietineMain = mainIngredients.filter(ing => 
        ing.name?.lt?.toLowerCase().includes('grietin')
      );
      if (grietineMain.length > 0) {
        console.log(`   Main: ${grietineMain.map(ing => ing.name.lt).join(', ')}`);
      }
      
      // Check side ingredients
      const sideIngredients = recipe.ingredients?.sides?.items || [];
      const grietineSide = sideIngredients.filter(ing => 
        ing.name?.lt?.toLowerCase().includes('grietin')
      );
      if (grietineSide.length > 0) {
        console.log(`   Side (${recipe.ingredients.sides.category}): ${grietineSide.map(ing => ing.name.lt).join(', ')}`);
      }
    });
    
    // Test 4: Manual search in side ingredients
    console.log('\n📋 Test 4: Manual search in side ingredients...');
    
    const manualSideSearch = await db.collection('recipes_new')
      .find({
        'ingredients.sides.items.name.lt': { 
          $regex: 'grietin', 
          $options: 'i' 
        }
      })
      .project({ 
        title: 1, 
        'ingredients.sides': 1
      })
      .limit(10)
      .toArray();
    
    console.log(`Manual side ingredients search: ${manualSideSearch.length} results`);
    manualSideSearch.forEach((recipe, index) => {
      console.log(`${index + 1}. ${recipe.title?.lt}`);
      const sideItems = recipe.ingredients?.sides?.items || [];
      const grietineItems = sideItems.filter(item => 
        item.name?.lt?.toLowerCase().includes('grietin')
      );
      grietineItems.forEach(item => {
        console.log(`   ${recipe.ingredients.sides.category}: ${item.name.lt} - ${item.quantity}`);
      });
    });
    
    // Test 5: Check if text index includes nested fields
    console.log('\n📋 Test 5: Testing if text index covers nested ingredients...');
    
    const testRecipe = await db.collection('recipes_new')
      .findOne({ 
        'ingredients.sides.items.name.lt': { 
          $regex: 'grietin', 
          $options: 'i' 
        }
      });
    
    if (testRecipe) {
      console.log(`Sample recipe: ${testRecipe.title?.lt}`);
      
      // Test if this recipe appears in text search
      const textSearchTest = await db.collection('recipes_new')
        .find({
          _id: testRecipe._id,
          $text: {
            $search: 'grietinė',
            $caseSensitive: false,
            $diacriticSensitive: false
          }
        })
        .toArray();
      
      if (textSearchTest.length > 0) {
        console.log('✅ Recipe found in text search - index includes side ingredients');
      } else {
        console.log('❌ Recipe NOT found in text search - index may not include side ingredients');
        console.log('   This means the text index needs to be updated');
      }
    }
    
    console.log('\n🎯 Diagnosis Summary:');
    if (textSearchResults.length === 0 && manualSideSearch.length > 0) {
      console.log('❌ Issue: Text search index does not include side ingredients');
      console.log('📝 Solution: Update MongoDB text index to include nested fields');
      console.log('   Command needed: db.recipes_new.createIndex({...})');
    } else if (textSearchResults.length > 0) {
      console.log('✅ Text search is working with side ingredients');
    } else {
      console.log('❓ No recipes with "grietinė" found in either search method');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

testSearchNewStructure().catch(console.error);
