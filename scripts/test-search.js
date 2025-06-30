// Test Search Functionality
// Run with: node scripts/test-search.js

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://receptai:SXF0NrgQbiQi8EeB@cluster0.zy6ywwg.mongodb.net/';
const DATABASE_NAME = 'receptai';

async function testSearchFunctionality() {
  console.log('🧪 Testing Search Functionality...\n');
  
  let client;
  
  try {
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DATABASE_NAME);
    
    console.log('✅ Connected to MongoDB');
    
    // Test 1: Check if text index exists
    console.log('\n📋 Test 1: Checking text search index...');
    const indexes = await db.collection('recipes_new').indexes();
    const textIndex = indexes.find(index => 
      index.name === 'recipe_search_optimized' || 
      Object.values(index.key || {}).includes('text')
    );
    
    if (textIndex) {
      console.log('✅ Text search index found:', textIndex.name);
      console.log('   Weights:', textIndex.weights || 'Default weights');
    } else {
      console.log('❌ Text search index NOT found - need to run setup-search-index.js');
    }
    
    // Test 2: Sample search queries
    console.log('\n📋 Test 2: Testing search queries...');
    
    const testQueries = [
      'vištiena',
      'vistiena', // without diacritics
      'vištienos farso',
      'sriuba',
      'bulvės'
    ];
    
    for (const query of testQueries) {
      console.log(`\n🔍 Testing query: "${query}"`);
      
      try {
        const results = await db.collection('recipes_new')
          .find({
            $text: {
              $search: query,
              $caseSensitive: false,
              $diacriticSensitive: false
            }
          })
          .project({ 
            title: 1, 
            tags: 1, 
            score: { $meta: "textScore" } 
          })
          .sort({ score: { $meta: "textScore" } })
          .limit(5)
          .toArray();
        
        console.log(`   Found ${results.length} results`);
        results.forEach((recipe, index) => {
          console.log(`   ${index + 1}. ${recipe.title?.lt || 'No title'} (score: ${recipe.score?.toFixed(2)})`);
          if (recipe.tags && recipe.tags.length > 0) {
            console.log(`      Tags: ${recipe.tags.slice(0, 3).join(', ')}`);
          }
        });
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
    
    // Test 3: Check sample recipes and their tags
    console.log('\n📋 Test 3: Checking sample recipes and tags...');
    
    const sampleRecipes = await db.collection('recipes_new')
      .find({})
      .project({ title: 1, tags: 1, ingredients: 1 })
      .limit(3)
      .toArray();
    
    console.log(`Found ${sampleRecipes.length} sample recipes:`);
    sampleRecipes.forEach((recipe, index) => {
      console.log(`\n${index + 1}. ${recipe.title?.lt || 'No title'}`);
      if (recipe.tags && recipe.tags.length > 0) {
        console.log(`   Tags: ${recipe.tags.join(', ')}`);
      }
      if (recipe.ingredients && recipe.ingredients.length > 0) {
        const ingredientNames = recipe.ingredients
          .slice(0, 3)
          .map(ing => ing.name?.lt || ing.name || 'Unknown')
          .join(', ');
        console.log(`   Ingredients: ${ingredientNames}...`);
      }
    });
    
    console.log('\n✅ Search functionality test completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Start development server: npm run dev');
    console.log('2. Test search page: http://localhost:3000/paieska?q=vištiena');
    console.log('3. Click on recipe tags to test tag-to-search functionality');
    console.log('4. Add a new recipe to test instant ISR revalidation');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Run the test
testSearchFunctionality().catch(console.error);
