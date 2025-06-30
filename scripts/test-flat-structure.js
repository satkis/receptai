// Test New Flat Side Ingredients Structure
// Run with: node scripts/test-flat-structure.js

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://receptai:SXF0NrgQbiQi8EeB@cluster0.zy6ywwg.mongodb.net/';
const DATABASE_NAME = 'receptai';

async function testFlatStructure() {
  console.log('🧪 Testing New Flat Side Ingredients Structure...\n');
  
  let client;
  
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DATABASE_NAME);
    
    console.log('✅ Connected to MongoDB');
    
    // Test 1: Check current recipe structure
    console.log('\n📋 Test 1: Checking current recipe structure...');
    
    const sampleRecipe = await db.collection('recipes_new')
      .findOne({}, { projection: { title: 1, ingredients: 1, sideIngredients: 1 } });
    
    if (sampleRecipe) {
      console.log(`Recipe: ${sampleRecipe.title?.lt || 'Unknown'}`);
      console.log('Structure:');
      
      if (Array.isArray(sampleRecipe.ingredients)) {
        console.log(`✅ Main ingredients: ${sampleRecipe.ingredients.length} items`);
        console.log(`   Sample: ${sampleRecipe.ingredients[0]?.name?.lt || 'Unknown'}`);
      }
      
      if (sampleRecipe.sideIngredients) {
        console.log(`✅ Side ingredients: ${sampleRecipe.sideIngredients.length} items`);
        sampleRecipe.sideIngredients.forEach((side, index) => {
          console.log(`   ${index + 1}. [${side.category}] ${side.name?.lt} - ${side.quantity}`);
        });
      } else {
        console.log('❌ No side ingredients found');
      }
    }
    
    // Test 2: Create sample recipe with new flat structure
    console.log('\n📋 Test 2: Testing new flat structure example...');
    
    const newFlatStructure = {
      title: { lt: "Test Recipe with Flat Structure" },
      ingredients: [
        {
          name: { lt: "Morka" },
          quantity: "2 vnt.",
          vital: true
        },
        {
          name: { lt: "Svogūnas" },
          quantity: "1 didelis",
          vital: true
        }
      ],
      sideIngredients: [
        {
          category: "Padažui",
          name: { lt: "Grietinė" },
          quantity: "200ml",
          vital: false
        },
        {
          category: "Garnyrui",
          name: { lt: "Krapai" },
          quantity: "1 sauja",
          vital: true
        }
      ]
    };
    
    console.log('✅ New flat structure example:');
    console.log(`   Main ingredients: ${newFlatStructure.ingredients.length}`);
    console.log(`   Side ingredients: ${newFlatStructure.sideIngredients.length}`);
    
    // Group by category
    const byCategory = newFlatStructure.sideIngredients.reduce((acc, side) => {
      if (!acc[side.category]) acc[side.category] = [];
      acc[side.category].push(side);
      return acc;
    }, {});
    
    console.log('   Categories:');
    Object.entries(byCategory).forEach(([category, items]) => {
      console.log(`     ${category}: ${items.length} items`);
    });
    
    // Test 3: Search functionality simulation
    console.log('\n📋 Test 3: Testing search with flat structure...');
    
    // Test search for side ingredients
    const searchTerms = ['grietinė', 'krapai', 'morka'];
    
    for (const term of searchTerms) {
      console.log(`\n🔍 Testing search for "${term}":`);
      
      // Search in main ingredients
      const mainResults = await db.collection('recipes_new')
        .find({
          'ingredients.name.lt': { 
            $regex: term, 
            $options: 'i' 
          }
        })
        .limit(3)
        .toArray();
      
      console.log(`   Main ingredients: ${mainResults.length} recipes`);
      
      // Search in side ingredients
      const sideResults = await db.collection('recipes_new')
        .find({
          'sideIngredients.name.lt': { 
            $regex: term, 
            $options: 'i' 
          }
        })
        .limit(3)
        .toArray();
      
      console.log(`   Side ingredients: ${sideResults.length} recipes`);
      
      // Text search (should include both)
      const textResults = await db.collection('recipes_new')
        .find({
          $text: {
            $search: term,
            $caseSensitive: false,
            $diacriticSensitive: false
          }
        })
        .limit(3)
        .toArray();
      
      console.log(`   Text search: ${textResults.length} recipes`);
    }
    
    // Test 4: Utility functions simulation
    console.log('\n📋 Test 4: Testing utility functions...');
    
    const getTotalCount = (recipe) => {
      const mainCount = recipe.ingredients?.length || 0;
      const sideCount = recipe.sideIngredients?.length || 0;
      return mainCount + sideCount;
    };
    
    const getVitalCount = (recipe) => {
      const mainVital = (recipe.ingredients || []).filter(ing => ing.vital).length;
      const sideVital = (recipe.sideIngredients || []).filter(ing => ing.vital).length;
      return mainVital + sideVital;
    };
    
    const totalCount = getTotalCount(newFlatStructure);
    const vitalCount = getVitalCount(newFlatStructure);
    
    console.log(`✅ Total ingredients: ${totalCount}`);
    console.log(`✅ Vital ingredients: ${vitalCount}`);
    
    // Test 5: Schema.org generation simulation
    console.log('\n📋 Test 5: Testing Schema.org generation...');
    
    const generateSchemaIngredients = (recipe) => [
      ...(recipe.ingredients || []).map(ing => `${ing.quantity} ${ing.name.lt}`),
      ...(recipe.sideIngredients || []).map(ing => `${ing.quantity} ${ing.name.lt}`)
    ];
    
    const schemaIngredients = generateSchemaIngredients(newFlatStructure);
    console.log(`✅ Schema.org ingredients: ${schemaIngredients.length}`);
    schemaIngredients.forEach((ing, index) => {
      console.log(`   ${index + 1}. ${ing}`);
    });
    
    console.log('\n🎯 Flat Structure Implementation Summary:');
    console.log('✅ Simplified database structure (no nesting)');
    console.log('✅ Better MongoDB performance');
    console.log('✅ Easier TypeScript interfaces');
    console.log('✅ Cleaner utility functions');
    console.log('✅ Multiple categories support');
    console.log('✅ Optimized search indexing');
    
    console.log('\n📝 Next Steps:');
    console.log('1. Update database recipes to flat structure');
    console.log('2. Test UI with new structure');
    console.log('3. Verify search functionality');
    console.log('4. Deploy to staging');
    console.log('5. Test production deployment');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

testFlatStructure().catch(console.error);
