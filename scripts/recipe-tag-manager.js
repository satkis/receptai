#!/usr/bin/env node

// Comprehensive Recipe Tag Management System
// Handles Lithuanian characters, URL-safe tags, and category-based tagging

require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

// Helper function to create URL-safe slug from Lithuanian text
function createUrlSafeTag(text) {
  return text
    .toLowerCase()
    .replace(/[ąčęėįšųūž]/g, (char) => {
      const map = {
        'ą': 'a', 'č': 'c', 'ę': 'e', 'ė': 'e', 'į': 'i',
        'š': 's', 'ų': 'u', 'ū': 'u', 'ž': 'z'
      };
      return map[char] || char;
    })
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim();
}

// Helper function to extract category tags from paths
function extractCategoryTags(primaryCategoryPath, secondaryCategories) {
  const categoryTags = new Set();
  
  // Extract from primary category
  if (primaryCategoryPath && primaryCategoryPath.startsWith('receptai/')) {
    const categorySlug = primaryCategoryPath.replace('receptai/', '');
    categoryTags.add(categorySlug);
    categoryTags.add(createUrlSafeTag(categorySlug));
  }
  
  // Extract from secondary categories
  if (secondaryCategories && Array.isArray(secondaryCategories)) {
    secondaryCategories.forEach(categoryPath => {
      if (categoryPath.startsWith('receptai/')) {
        const categorySlug = categoryPath.replace('receptai/', '');
        categoryTags.add(categorySlug);
        categoryTags.add(createUrlSafeTag(categorySlug));
      }
    });
  }
  
  return Array.from(categoryTags);
}

// Helper function to standardize existing tags
function standardizeTags(originalTags) {
  const standardizedTags = new Set();
  
  if (!originalTags || !Array.isArray(originalTags)) {
    return [];
  }
  
  originalTags.forEach(tag => {
    if (typeof tag === 'string' && tag.trim()) {
      // Keep original tag for display
      standardizedTags.add(tag.trim());
      
      // Add URL-safe version for filtering
      const urlSafeTag = createUrlSafeTag(tag);
      if (urlSafeTag && urlSafeTag !== tag.trim()) {
        standardizedTags.add(urlSafeTag);
      }
    }
  });
  
  return Array.from(standardizedTags);
}

async function manageRecipeTags() {
  console.log('🏷️  Starting Comprehensive Recipe Tag Management');
  console.log('===============================================');

  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || 'receptai');

  try {
    // Get all recipes
    const recipes = await db.collection('recipes_new').find({}).toArray();
    console.log(`📊 Found ${recipes.length} recipes to process`);

    let updatedCount = 0;
    const tagStats = {
      originalTags: new Set(),
      urlSafeTags: new Set(),
      categoryTags: new Set()
    };

    for (const recipe of recipes) {
      let needsUpdate = false;
      const originalTags = recipe.tags || [];
      
      // 1. Standardize existing tags
      const standardizedTags = standardizeTags(originalTags);
      
      // 2. Extract category-based tags
      const categoryTags = extractCategoryTags(
        recipe.primaryCategoryPath, 
        recipe.secondaryCategories
      );
      
      // 3. Combine all tags
      const allTags = new Set([...standardizedTags, ...categoryTags]);
      const finalTags = Array.from(allTags).filter(tag => tag && tag.length > 0);
      
      // Track statistics
      originalTags.forEach(tag => tagStats.originalTags.add(tag));
      standardizedTags.forEach(tag => tagStats.urlSafeTags.add(tag));
      categoryTags.forEach(tag => tagStats.categoryTags.add(tag));
      
      // Check if tags changed
      if (JSON.stringify(originalTags.sort()) !== JSON.stringify(finalTags.sort())) {
        needsUpdate = true;
      }

      if (needsUpdate) {
        await db.collection('recipes_new').updateOne(
          { _id: recipe._id },
          { 
            $set: { 
              tags: finalTags,
              updatedAt: new Date()
            }
          }
        );
        updatedCount++;
        
        if (updatedCount % 10 === 0) {
          console.log(`✅ Updated ${updatedCount} recipes...`);
        }
      }
    }

    console.log(`\n🎉 Tag Management Complete!`);
    console.log(`📊 Updated ${updatedCount} out of ${recipes.length} recipes`);
    console.log(`\n📈 Tag Statistics:`);
    console.log(`   Original tags: ${tagStats.originalTags.size}`);
    console.log(`   URL-safe tags: ${tagStats.urlSafeTags.size}`);
    console.log(`   Category tags: ${tagStats.categoryTags.size}`);

    // Create optimized indexes
    console.log('\n🔍 Creating optimized database indexes...');
    
    await db.collection('recipes_new').createIndex({ tags: 1 });
    await db.collection('recipes_new').createIndex({ 
      primaryCategoryPath: 1, 
      secondaryCategories: 1 
    });
    await db.collection('recipes_new').createIndex({ 
      tags: 1, 
      totalTimeMinutes: 1 
    });
    
    console.log('✅ Indexes created successfully');

    // Generate filter recommendations
    console.log('\n💡 Generating filter recommendations...');
    
    const categories = await db.collection('categories_new').find({ isActive: true }).toArray();
    
    for (const category of categories) {
      const categoryPath = `receptai/${category.path}`;
      
      // Find recipes in this category
      const categoryRecipes = await db.collection('recipes_new').find({
        $or: [
          { primaryCategoryPath: categoryPath },
          { secondaryCategories: { $in: [categoryPath] } }
        ]
      }).toArray();
      
      if (categoryRecipes.length > 0) {
        // Count tag frequency
        const tagCounts = {};
        categoryRecipes.forEach(recipe => {
          if (recipe.tags) {
            recipe.tags.forEach(tag => {
              if (createUrlSafeTag(tag) === tag) { // Only count URL-safe tags for filters
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
              }
            });
          }
        });
        
        // Get top 5 most common tags
        const topTags = Object.entries(tagCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([tag, count], index) => ({
            value: tag,
            label: tag.charAt(0).toUpperCase() + tag.slice(1),
            priority: index + 1,
            count: count
          }));
        
        if (topTags.length > 0) {
          console.log(`\n📋 ${category.title.lt} (${categoryRecipes.length} recipes):`);
          console.log('   Recommended filters:');
          topTags.forEach(filter => {
            console.log(`   - ${filter.label} (${filter.count} recipes)`);
          });
        }
      }
    }

  } catch (error) {
    console.error('❌ Error during tag management:', error);
  } finally {
    await client.close();
  }
}

// Run the tag management
manageRecipeTags().catch(console.error);
