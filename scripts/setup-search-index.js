// Setup optimized search index for Lithuanian recipe search
// Run: node scripts/setup-search-index.js

const { MongoClient } = require('mongodb');
require('dotenv').config();

async function setupSearchIndex() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('🚀 Setting up search index for Lithuanian recipes...');
    
    // Drop existing text indexes
    try {
      const indexes = await db.collection('recipes_new').indexes();
      for (const index of indexes) {
        if (index.key && Object.values(index.key).includes('text')) {
          console.log(`Dropping existing text index: ${index.name}`);
          await db.collection('recipes_new').dropIndex(index.name);
        }
      }
    } catch (error) {
      console.log('No existing text indexes to drop');
    }
    
    // Create optimized text search index with Lithuanian language support
    console.log('📝 Creating optimized text search index...');
    
    await db.collection('recipes_new').createIndex(
      {
        "title.lt": "text",
        "tags": "text",
        "ingredients.name.lt": "text", 
        "description.lt": "text"
      },
      {
        name: "recipe_search_optimized",
        weights: {
          "title.lt": 10,           // Highest priority - recipe titles
          "tags": 8,                // High priority - recipe tags  
          "ingredients.name.lt": 5, // Medium priority - ingredients
          "description.lt": 2       // Lower priority - descriptions
        },
        default_language: "lithuanian",
        language_override: "language",
        textIndexVersion: 3
      }
    );
    
    console.log('✅ Text search index created successfully');
    
    // Create additional performance indexes
    console.log('⚡ Creating additional performance indexes...');
    
    // Time category index for filtering
    await db.collection('recipes_new').createIndex(
      { "timeCategory": 1, "publishedAt": -1 },
      { name: "time_category_published" }
    );
    
    // Category filtering index
    await db.collection('recipes_new').createIndex(
      { "allCategories": 1, "publishedAt": -1 },
      { name: "categories_published" }
    );
    
    // Combined search + filter index
    await db.collection('recipes_new').createIndex(
      { "timeCategory": 1, "allCategories": 1, "publishedAt": -1 },
      { name: "search_filters_combined" }
    );
    
    // Rating index for sorting
    await db.collection('recipes_new').createIndex(
      { "rating.average": -1, "rating.count": -1 },
      { name: "rating_sort" }
    );
    
    console.log('✅ Performance indexes created successfully');
    
    // Test the search functionality
    console.log('🧪 Testing search functionality...');
    
    const testQueries = [
      'vištiena',
      'saltibarsciai', 
      'šaltibarščiai',
      'vistienos file',
      'sriuba'
    ];
    
    for (const query of testQueries) {
      const results = await db.collection('recipes_new').find(
        {
          $text: { 
            $search: query,
            $caseSensitive: false,
            $diacriticSensitive: false
          }
        },
        { score: { $meta: "textScore" } }
      )
      .sort({ score: { $meta: "textScore" } })
      .limit(3)
      .toArray();
      
      console.log(`Query "${query}": ${results.length} results`);
      if (results.length > 0) {
        console.log(`  Top result: ${results[0].title.lt} (score: ${results[0].score.toFixed(2)})`);
      }
    }
    
    // Get index statistics
    console.log('📊 Index statistics:');
    const stats = await db.collection('recipes_new').stats();
    console.log(`Total recipes: ${stats.count}`);
    console.log(`Total indexes: ${stats.nindexes}`);
    console.log(`Index size: ${(stats.totalIndexSize / 1024 / 1024).toFixed(2)} MB`);
    
    console.log('🎉 Search index setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error setting up search index:', error);
  } finally {
    await client.close();
  }
}

// Run the setup
if (require.main === module) {
  setupSearchIndex();
}

module.exports = { setupSearchIndex };
