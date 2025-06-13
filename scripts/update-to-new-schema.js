// Database Schema Update Script
// Updates existing recipes_new to match the optimized schema for SEO and performance

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://username:password@cluster.mongodb.net/receptai';

async function updateRecipeSchema() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('🔄 Updating recipes_new schema...');
    
    // 1. Add missing fields and fix structure
    const updateResult = await db.collection('recipes_new').updateMany(
      {},
      [
        {
          $set: {
            // Calculate timeCategory from totalTimeMinutes
            timeCategory: {
              $switch: {
                branches: [
                  { case: { $lte: ["$totalTimeMinutes", 30] }, then: "iki-30-min" },
                  { case: { $lte: ["$totalTimeMinutes", 60] }, then: "30-60-min" },
                  { case: { $lte: ["$totalTimeMinutes", 120] }, then: "1-2-val" }
                ],
                default: "virs-2-val"
              }
            },
            
            // Ensure allCategories exists (from categoryPath if missing)
            allCategories: {
              $cond: {
                if: { $ifNull: ["$allCategories", false] },
                then: "$allCategories",
                else: { $cond: {
                  if: { $ifNull: ["$categoryPath", false] },
                  then: ["$categoryPath"],
                  else: []
                }}
              }
            },
            
            // Ensure primaryCategoryPath exists
            primaryCategoryPath: {
              $cond: {
                if: { $ifNull: ["$primaryCategoryPath", false] },
                then: "$primaryCategoryPath",
                else: "$categoryPath"
              }
            },
            
            // Ensure publishedAt exists
            publishedAt: {
              $cond: {
                if: { $ifNull: ["$publishedAt", false] },
                then: "$publishedAt",
                else: "$createdAt"
              }
            },
            
            // Fix breadcrumbs structure if needed
            breadcrumbs: {
              $cond: {
                if: { $ifNull: ["$breadcrumbs", false] },
                then: "$breadcrumbs",
                else: [
                  { title: "Receptai", slug: "receptai", url: "/" }
                ]
              }
            }
          }
        }
      ]
    );
    
    console.log(`✅ Updated ${updateResult.modifiedCount} recipes`);
    
    // 2. Update categories_new with time filter counts
    console.log('🔄 Updating category time filter counts...');
    
    const categories = await db.collection('categories_new').find({}).toArray();
    
    for (const category of categories) {
      // Calculate time filter counts for this category
      const timeFilters = await Promise.all([
        db.collection('recipes_new').countDocuments({ 
          allCategories: category.path, 
          timeCategory: "iki-30-min" 
        }),
        db.collection('recipes_new').countDocuments({ 
          allCategories: category.path, 
          timeCategory: "30-60-min" 
        }),
        db.collection('recipes_new').countDocuments({ 
          allCategories: category.path, 
          timeCategory: "1-2-val" 
        }),
        db.collection('recipes_new').countDocuments({ 
          allCategories: category.path, 
          timeCategory: "virs-2-val" 
        })
      ]);
      
      // Update category with time filter counts
      await db.collection('categories_new').updateOne(
        { _id: category._id },
        {
          $set: {
            availableTimeFilters: [
              { value: "iki-30-min", label: "iki 30 min.", count: timeFilters[0] },
              { value: "30-60-min", label: "30–60 min.", count: timeFilters[1] },
              { value: "1-2-val", label: "1–2 val.", count: timeFilters[2] },
              { value: "virs-2-val", label: "virš 2 val.", count: timeFilters[3] }
            ],
            recipeCount: timeFilters.reduce((sum, count) => sum + count, 0)
          }
        }
      );
    }
    
    console.log(`✅ Updated ${categories.length} categories with time filters`);
    
    // 3. Create optimized indexes for performance
    console.log('🔄 Creating optimized indexes...');
    
    // Drop existing indexes that might conflict
    try {
      await db.collection('recipes_new').dropIndexes();
    } catch (e) {
      console.log('No existing indexes to drop');
    }
    
    // Create new optimized indexes
    const indexes = [
      // Primary lookup by slug
      { slug: 1 },
      
      // Category filtering with time and sorting
      { allCategories: 1, timeCategory: 1, publishedAt: -1 },
      
      // Category filtering with rating
      { allCategories: 1, "rating.average": -1, "rating.count": -1 },
      
      // Tag search with time filtering
      { tags: 1, timeCategory: 1, publishedAt: -1 },
      
      // Time category filtering
      { timeCategory: 1, publishedAt: -1 },
      
      // Primary category canonical lookup
      { primaryCategoryPath: 1, publishedAt: -1 },
      
      // Text search index for Lithuanian content
      { 
        "title.lt": "text", 
        "description.lt": "text", 
        "tags": "text",
        "ingredients.name.lt": "text"
      },
      
      // Group filtering (if using groups)
      { groupIds: 1, publishedAt: -1 }
    ];
    
    for (const index of indexes) {
      try {
        await db.collection('recipes_new').createIndex(index);
        console.log(`✅ Created index: ${JSON.stringify(index)}`);
      } catch (error) {
        console.log(`⚠️ Index creation failed: ${JSON.stringify(index)} - ${error.message}`);
      }
    }
    
    // 4. Create categories_new indexes
    try {
      await db.collection('categories_new').dropIndexes();
    } catch (e) {
      console.log('No existing category indexes to drop');
    }
    
    const categoryIndexes = [
      { path: 1 },
      { slug: 1 },
      { parentId: 1, sortOrder: 1 },
      { level: 1, isActive: 1 }
    ];
    
    for (const index of categoryIndexes) {
      try {
        await db.collection('categories_new').createIndex(index);
        console.log(`✅ Created category index: ${JSON.stringify(index)}`);
      } catch (error) {
        console.log(`⚠️ Category index creation failed: ${JSON.stringify(index)} - ${error.message}`);
      }
    }
    
    // 5. Verify the updates
    console.log('\n📊 Schema update verification:');
    
    const sampleRecipe = await db.collection('recipes_new').findOne({});
    console.log('Sample recipe fields:', Object.keys(sampleRecipe || {}));
    
    const recipesWithTimeCategory = await db.collection('recipes_new').countDocuments({ 
      timeCategory: { $exists: true } 
    });
    console.log(`Recipes with timeCategory: ${recipesWithTimeCategory}`);
    
    const recipesWithAllCategories = await db.collection('recipes_new').countDocuments({ 
      allCategories: { $exists: true, $ne: [] } 
    });
    console.log(`Recipes with allCategories: ${recipesWithAllCategories}`);
    
    const totalRecipes = await db.collection('recipes_new').countDocuments();
    console.log(`Total recipes: ${totalRecipes}`);
    
    const totalCategories = await db.collection('categories_new').countDocuments();
    console.log(`Total categories: ${totalCategories}`);
    
    console.log('\n🎉 Schema update completed successfully!');
    
  } catch (error) {
    console.error('❌ Schema update failed:', error);
    throw error;
  } finally {
    await client.close();
  }
}

// Run the script
if (require.main === module) {
  updateRecipeSchema()
    .then(() => {
      console.log('✅ Database schema updated successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Schema update failed:', error);
      process.exit(1);
    });
}

module.exports = { updateRecipeSchema };
