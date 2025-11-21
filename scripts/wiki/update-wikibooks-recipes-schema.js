#!/usr/bin/env node

/**
 * Update Wikibooks Recipes Schema
 * 
 * Ensures all Wikibooks recipes in MongoDB have complete schema with:
 * - aggregateRating at root level
 * - originalSource with platform, url, license info
 * - originalImage with attribution
 * - All required fields
 * 
 * Usage: npm run update-wikibooks-schema
 */

require('dotenv').config({ path: '.env.local' });

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'receptai';

if (!MONGODB_URI) {
  console.error('❌ ERROR: MONGODB_URI environment variable not set');
  process.exit(1);
}

async function updateWikibooksRecipes() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db(MONGODB_DB);
    const collection = db.collection('recipes_new');
    
    // Find all Wikibooks recipes
    const recipes = await collection
      .find({
        'originalSource.platform': 'Wikibooks'
      })
      .toArray();
    
    console.log(`📋 Found ${recipes.length} Wikibooks recipes\n`);
    
    if (recipes.length === 0) {
      console.log('ℹ️  No Wikibooks recipes found');
      return;
    }
    
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const recipe of recipes) {
      try {
        const updates = {};
        let needsUpdate = false;
        
        // Ensure aggregateRating exists at root level
        if (!recipe.aggregateRating) {
          updates.aggregateRating = {
            ratingValue: 4.5,
            reviewCount: 0,
            bestRating: 5,
            worstRating: 1
          };
          needsUpdate = true;
        }
        
        // Ensure originalSource has all required fields
        if (recipe.originalSource) {
          const originalSource = { ...recipe.originalSource };
          
          if (!originalSource.license) {
            originalSource.license = 'CC BY-SA 4.0';
            needsUpdate = true;
          }
          if (!originalSource.licenseUrl) {
            originalSource.licenseUrl = 'https://creativecommons.org/licenses/by-sa/4.0/';
            needsUpdate = true;
          }
          if (!originalSource.extractedAt) {
            originalSource.extractedAt = new Date().toISOString();
            needsUpdate = true;
          }
          
          if (needsUpdate) {
            updates.originalSource = originalSource;
          }
        }
        
        // Ensure originalImage exists
        if (!recipe.originalImage && recipe.image?.src) {
          updates.originalImage = {
            fileName: recipe.image?.alt || 'recipe-image.jpg',
            author: {
              name: recipe.author?.name || 'Unknown',
              userPageUrl: recipe.author?.profileUrl || ''
            },
            license: {
              code: 'pd',
              shortName: 'Public domain',
              fullName: 'Public domain',
              url: ''
            },
            wikimediaCommonsUrl: ''
          };
          needsUpdate = true;
        }
        
        // Ensure status is set
        if (!recipe.status) {
          updates.status = 'published';
          needsUpdate = true;
        }
        
        // Ensure timestamps exist
        if (!recipe.publishedAt) {
          updates.publishedAt = recipe.createdAt || new Date();
          needsUpdate = true;
        }
        if (!recipe.createdAt) {
          updates.createdAt = new Date();
          needsUpdate = true;
        }
        
        // Always update updatedAt
        updates.updatedAt = new Date();
        
        if (needsUpdate) {
          const result = await collection.updateOne(
            { _id: recipe._id },
            { $set: updates }
          );
          
          if (result.modifiedCount > 0) {
            console.log(`✅ Updated: ${recipe.slug}`);
            updatedCount++;
          }
        } else {
          console.log(`⏭️  Skipped: ${recipe.slug} (already complete)`);
        }
        
      } catch (error) {
        console.error(`❌ Error updating ${recipe.slug}: ${error.message}`);
        errorCount++;
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('📊 UPDATE SUMMARY');
    console.log('='.repeat(70));
    console.log(`✅ Updated:  ${updatedCount}`);
    console.log(`❌ Errors:   ${errorCount}`);
    console.log(`📦 Total:    ${recipes.length}`);
    console.log('='.repeat(70) + '\n');
    
  } catch (error) {
    console.error('❌ FATAL ERROR:', error.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the script
updateWikibooksRecipes().catch(error => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

