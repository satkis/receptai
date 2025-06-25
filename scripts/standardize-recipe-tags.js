#!/usr/bin/env node

// Standardize Recipe Tags for Optimal Filtering
// This script ensures consistent tag formatting across all recipes

require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function standardizeRecipeTags() {
  console.log('🔧 Starting Recipe Tag Standardization');
  console.log('=====================================');

  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || 'receptai');

  try {
    // Get all recipes
    const recipes = await db.collection('recipes_new').find({}).toArray();
    console.log(`📊 Found ${recipes.length} recipes to process`);

    let updatedCount = 0;
    const tagMapping = new Map();

    for (const recipe of recipes) {
      let needsUpdate = false;
      const originalTags = recipe.tags || [];
      const standardizedTags = new Set();

      // Process each tag
      originalTags.forEach(tag => {
        if (typeof tag === 'string') {
          // Create URL-safe standardized version (lowercase, no Lithuanian chars)
          const standardized = tag
            .toLowerCase()
            .replace(/[ąčęėįšųūž]/g, (char) => {
              const map = {
                'ą': 'a', 'č': 'c', 'ę': 'e', 'ė': 'e', 'į': 'i',
                'š': 's', 'ų': 'u', 'ū': 'u', 'ž': 'z'
              };
              return map[char] || char;
            })
            .replace(/[^\w\s-]/g, '')  // Remove special characters
            .replace(/[\s_-]+/g, '-')  // Replace spaces with hyphens
            .replace(/^-+|-+$/g, '')   // Remove leading/trailing hyphens
            .trim();

          // Keep original tag for display
          standardizedTags.add(tag);
          
          // Add standardized version if different (for filtering)
          if (standardized !== tag && standardized !== tag.toLowerCase()) {
            standardizedTags.add(standardized);
          }

          // Track tag variations
          if (!tagMapping.has(standardized)) {
            tagMapping.set(standardized, new Set());
          }
          tagMapping.get(standardized).add(tag);
        }
      });

      // Add category-based tags for better filtering
      if (recipe.secondaryCategories && Array.isArray(recipe.secondaryCategories)) {
        recipe.secondaryCategories.forEach(categoryPath => {
          if (categoryPath.startsWith('receptai/')) {
            const categoryTag = categoryPath.replace('receptai/', '');
            standardizedTags.add(categoryTag);
            
            // Add standardized version
            const standardizedCategoryTag = categoryTag
              .toLowerCase()
              .replace(/[ąčęėįšųūž]/g, (char) => {
                const map = {
                  'ą': 'a', 'č': 'c', 'ę': 'e', 'ė': 'e', 'į': 'i',
                  'š': 's', 'ų': 'u', 'ū': 'u', 'ž': 'z'
                };
                return map[char] || char;
              });
            
            if (standardizedCategoryTag !== categoryTag) {
              standardizedTags.add(standardizedCategoryTag);
            }
          }
        });
      }

      const finalTags = Array.from(standardizedTags);
      
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

    console.log(`\n🎉 Standardization Complete!`);
    console.log(`📊 Updated ${updatedCount} out of ${recipes.length} recipes`);
    
    // Show tag mapping summary
    console.log(`\n📋 Tag Variations Found:`);
    let variationCount = 0;
    tagMapping.forEach((variations, standardized) => {
      if (variations.size > 1) {
        console.log(`  ${standardized}: ${Array.from(variations).join(', ')}`);
        variationCount++;
      }
    });
    
    if (variationCount === 0) {
      console.log('  No tag variations found - all tags are consistent! ✅');
    }

    // Create indexes for better performance
    console.log('\n🔍 Creating database indexes...');
    await db.collection('recipes_new').createIndex({ tags: 1 });
    await db.collection('recipes_new').createIndex({ 
      primaryCategoryPath: 1, 
      secondaryCategories: 1, 
      tags: 1 
    });
    console.log('✅ Indexes created successfully');

  } catch (error) {
    console.error('❌ Error during standardization:', error);
  } finally {
    await client.close();
  }
}

// Run the standardization
standardizeRecipeTags().catch(console.error);
