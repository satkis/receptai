// Test Lithuanian Word Endings
// Run with: node scripts/test-word-endings.js

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://receptai:SXF0NrgQbiQi8EeB@cluster0.zy6ywwg.mongodb.net/';
const DATABASE_NAME = 'receptai';

async function testWordEndings() {
  console.log('🧪 Testing Lithuanian Word Endings...\n');
  
  let client;
  
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DATABASE_NAME);
    
    console.log('✅ Connected to MongoDB');
    
    // Test 1: Find actual ingredients in database
    console.log('\n📋 Test 1: Finding actual ingredients in database...');
    
    const recipes = await db.collection('recipes_new')
      .find({})
      .project({ 'ingredients.name.lt': 1, title: 1 })
      .limit(10)
      .toArray();
    
    const allIngredients = new Set();
    recipes.forEach(recipe => {
      if (recipe.ingredients) {
        recipe.ingredients.forEach(ing => {
          if (ing.name && ing.name.lt) {
            allIngredients.add(ing.name.lt.toLowerCase());
          }
        });
      }
    });
    
    console.log('Found ingredients:', Array.from(allIngredients).slice(0, 20));
    
    // Test 2: Test specific problematic cases
    console.log('\n📋 Test 2: Testing problematic word endings...');
    
    const testCases = [
      { search: 'morkos', expected: 'morka' },
      { search: 'salieras', expected: 'saliero stiebas' },
      { search: 'jautinea', expected: 'jautiena' }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n🔍 Testing: "${testCase.search}" (expecting to find "${testCase.expected}")`);
      
      // Current search
      const currentResults = await db.collection('recipes_new')
        .find({
          $text: {
            $search: testCase.search,
            $caseSensitive: false,
            $diacriticSensitive: false
          }
        })
        .project({ title: 1, 'ingredients.name.lt': 1 })
        .limit(3)
        .toArray();
      
      console.log(`   Current search results: ${currentResults.length}`);
      
      // Manual ingredient search
      const ingredientResults = await db.collection('recipes_new')
        .find({
          'ingredients.name.lt': { 
            $regex: testCase.expected, 
            $options: 'i' 
          }
        })
        .project({ title: 1, 'ingredients.name.lt': 1 })
        .limit(3)
        .toArray();
      
      console.log(`   Manual ingredient search for "${testCase.expected}": ${ingredientResults.length}`);
      
      if (ingredientResults.length > 0) {
        ingredientResults.forEach((recipe, index) => {
          console.log(`      ${index + 1}. ${recipe.title?.lt}`);
          const matchingIngredients = recipe.ingredients
            ?.filter(ing => ing.name?.lt?.toLowerCase().includes(testCase.expected.toLowerCase()))
            .map(ing => ing.name.lt);
          if (matchingIngredients?.length > 0) {
            console.log(`         Ingredients: ${matchingIngredients.join(', ')}`);
          }
        });
      }
    }
    
    console.log('\n✅ Word endings test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

testWordEndings().catch(console.error);
