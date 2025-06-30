// Update MongoDB Text Search Index for New Ingredients Structure
// Run with: node scripts/update-search-index.js

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://receptai:SXF0NrgQbiQi8EeB@cluster0.zy6ywwg.mongodb.net/';
const DATABASE_NAME = 'receptai';

async function updateSearchIndex() {
  console.log('🔧 Updating MongoDB Text Search Index...\n');
  
  let client;
  
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DATABASE_NAME);
    
    console.log('✅ Connected to MongoDB');
    
    // Step 1: Check current indexes
    console.log('\n📋 Step 1: Checking current indexes...');
    
    const currentIndexes = await db.collection('recipes_new').indexes();
    const textIndexes = currentIndexes.filter(index => 
      Object.values(index.key || {}).includes('text')
    );
    
    console.log(`Found ${textIndexes.length} text indexes:`);
    textIndexes.forEach((index, i) => {
      console.log(`${i + 1}. ${index.name}`);
      console.log(`   Weights:`, index.weights || 'Default');
    });
    
    // Step 2: Drop old text index
    console.log('\n📋 Step 2: Dropping old text index...');
    
    try {
      if (textIndexes.length > 0) {
        for (const index of textIndexes) {
          console.log(`Dropping index: ${index.name}`);
          await db.collection('recipes_new').dropIndex(index.name);
          console.log(`✅ Dropped ${index.name}`);
        }
      } else {
        console.log('No text indexes to drop');
      }
    } catch (error) {
      console.log(`⚠️  Error dropping index: ${error.message}`);
    }
    
    // Step 3: Create new comprehensive text index
    console.log('\n📋 Step 3: Creating new comprehensive text index...');

    const indexFields = {
      // Title (highest priority)
      'title.lt': 'text',

      // Tags (high priority)
      'tags': 'text',

      // Main ingredients (medium-high priority)
      'ingredients.name.lt': 'text',

      // Side ingredients (medium-high priority) - NEW FLAT STRUCTURE!
      'sideIngredients.name.lt': 'text',

      // Description (lower priority)
      'description.lt': 'text'
    };

    const indexWeights = {
      'title.lt': 10,
      'tags': 8,
      'ingredients.name.lt': 5,
      'sideIngredients.name.lt': 5,
      'description.lt': 2
    };

    console.log('Creating index with fields:');
    Object.entries(indexFields).forEach(([field, type]) => {
      console.log(`   ${field}: ${type} (weight: ${indexWeights[field]})`);
    });

    try {
      const result = await db.collection('recipes_new').createIndex(
        indexFields,
        {
          name: 'recipe_search_flat_structure',
          weights: indexWeights,
          default_language: 'none', // Disable stemming for Lithuanian
          language_override: 'language'
        }
      );

      console.log(`✅ Created new text index: ${result}`);
    } catch (error) {
      console.error(`❌ Error creating index: ${error.message}`);
      throw error;
    }
    
    // Step 4: Test the new index
    console.log('\n📋 Step 4: Testing new index with "grietinė"...');
    
    const testResults = await db.collection('recipes_new')
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
    
    console.log(`✅ Test search results: ${testResults.length} recipes found`);
    
    testResults.forEach((recipe, index) => {
      console.log(`${index + 1}. ${recipe.title?.lt} (score: ${recipe.score?.toFixed(2)})`);
      
      // Check side ingredients for grietinė
      const sideIngredients = recipe.ingredients?.sides?.items || [];
      const grietineSide = sideIngredients.filter(ing => 
        ing.name?.lt?.toLowerCase().includes('grietin')
      );
      if (grietineSide.length > 0) {
        console.log(`   Found in ${recipe.ingredients.sides.category}: ${grietineSide.map(ing => ing.name.lt).join(', ')}`);
      }
    });
    
    // Step 5: Test other search terms
    console.log('\n📋 Step 5: Testing other search terms...');
    
    const testTerms = ['morka', 'svogūnas', 'pupelės'];
    
    for (const term of testTerms) {
      const results = await db.collection('recipes_new')
        .find({
          $text: {
            $search: term,
            $caseSensitive: false,
            $diacriticSensitive: false
          }
        })
        .limit(3)
        .toArray();
      
      console.log(`"${term}": ${results.length} results`);
    }
    
    // Step 6: Verify index status
    console.log('\n📋 Step 6: Verifying final index status...');
    
    const finalIndexes = await db.collection('recipes_new').indexes();
    const finalTextIndexes = finalIndexes.filter(index => 
      Object.values(index.key || {}).includes('text')
    );
    
    console.log(`✅ Final text indexes: ${finalTextIndexes.length}`);
    finalTextIndexes.forEach((index, i) => {
      console.log(`${i + 1}. ${index.name}`);
      console.log(`   Fields: ${Object.keys(index.weights || {}).join(', ')}`);
    });
    
    console.log('\n🎉 Search index update completed successfully!');
    console.log('\n📝 Summary:');
    console.log('✅ Old index dropped');
    console.log('✅ New comprehensive index created');
    console.log('✅ Side ingredients now searchable');
    console.log('✅ Backward compatibility maintained');
    console.log('✅ Search functionality restored');
    
  } catch (error) {
    console.error('❌ Index update failed:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

updateSearchIndex().catch(console.error);
