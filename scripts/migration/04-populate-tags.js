// Tag Population Script
// Creates tag documents from recipe tags and calculates counts

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://username:password@cluster.mongodb.net/receptai';

// Helper function to generate URL-safe slug
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// Generate related tags based on tag content
function generateRelatedTags(tagName, allTags) {
  const related = new Set();
  const tagLower = tagName.toLowerCase();
  
  // Find semantically related tags
  const relationshipMap = {
    'vištiena': ['krūtinėlė', 'mėsa', 'baltymai', 'orkaitėje'],
    'jautiena': ['mėsa', 'baltymai', 'griliuje'],
    'kiauliena': ['mėsa', 'baltymai', 'kepti'],
    'žuvis': ['baltymai', 'sveikas', 'omega-3'],
    'grybai': ['daržovės', 'vegetariška', 'skonis'],
    'sūris': ['pieno produktai', 'kalcis', 'baltymai'],
    'orkaitėje': ['kepti', 'karštas', 'traškus'],
    'greitpuodyje': ['greitas', 'patogus', 'sultingas'],
    'per 30 min': ['greitas', 'paprastas', 'lengvas'],
    'vaikams': ['šeimai', 'sveikas', 'paprastas'],
    'šeimai': ['vaikams', 'didelės porcijos', 'ekonomiškas']
  };
  
  // Add predefined relationships
  if (relationshipMap[tagLower]) {
    relationshipMap[tagLower].forEach(relatedTag => {
      if (allTags.includes(relatedTag)) {
        related.add(relatedTag);
      }
    });
  }
  
  // Find tags with similar words
  allTags.forEach(otherTag => {
    if (otherTag !== tagName && otherTag.length > 3) {
      // Check for partial matches
      if (tagLower.includes(otherTag.toLowerCase()) || otherTag.toLowerCase().includes(tagLower)) {
        related.add(otherTag);
      }
    }
  });
  
  return Array.from(related).slice(0, 8); // Limit to 8 related tags
}

// Calculate popularity score based on usage and searches
function calculatePopularityScore(recipeCount, tagName) {
  let baseScore = Math.min(recipeCount / 10, 10); // Base score from recipe count
  
  // Boost popular ingredient tags
  const popularIngredients = ['vištiena', 'jautiena', 'kiauliena', 'žuvis', 'grybai', 'sūris'];
  if (popularIngredients.some(ing => tagName.toLowerCase().includes(ing))) {
    baseScore += 2;
  }
  
  // Boost time-related tags
  if (tagName.includes('min') || tagName.includes('greitas') || tagName.includes('lengvas')) {
    baseScore += 1.5;
  }
  
  // Boost family-oriented tags
  if (tagName.includes('šeimai') || tagName.includes('vaikams')) {
    baseScore += 1;
  }
  
  return Math.min(baseScore, 10); // Cap at 10
}

// Generate SEO data for tag
function generateTagSEO(tag, recipeCount) {
  const countText = recipeCount > 100 ? "100+" : recipeCount.toString();
  
  return {
    metaTitle: `${tag.name} receptai (${countText}) - Paragaujam.lt`,
    metaDescription: `${recipeCount} receptai su "${tag.name}". Raskite geriausius receptus su nuotraukomis ir instrukcijomis.`,
    keywords: [tag.name, 'receptai', 'lietuviški', 'gaminimas']
  };
}

async function populateTags() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('🏷️ Starting tag population...');
    
    // Clear existing tags
    await db.collection('tags_new').deleteMany({});
    
    // Get all unique tags from recipes
    const tagAggregation = await db.collection('recipes_new').aggregate([
      { $unwind: '$tags' },
      { 
        $group: { 
          _id: '$tags', 
          count: { $sum: 1 },
          recipes: { $addToSet: '$_id' }
        } 
      },
      { $sort: { count: -1 } }
    ]).toArray();
    
    console.log(`📊 Found ${tagAggregation.length} unique tags`);
    
    // Get all tag names for relationship mapping
    const allTagNames = tagAggregation.map(tag => tag._id);
    
    let insertedCount = 0;
    
    for (const tagData of tagAggregation) {
      try {
        const tagName = tagData._id;
        const recipeCount = tagData.count;
        
        // Skip tags with very low usage (less than 2 recipes)
        if (recipeCount < 2) {
          continue;
        }
        
        const slug = slugify(tagName);
        
        // Check for duplicate slugs
        const existingTag = await db.collection('tags_new').findOne({ slug });
        if (existingTag) {
          console.log(`⚠️ Skipping duplicate tag slug: ${slug}`);
          continue;
        }
        
        const relatedTags = generateRelatedTags(tagName, allTagNames);
        const popularityScore = calculatePopularityScore(recipeCount, tagName);
        
        const tagDocument = {
          name: tagName,
          slug: slug,
          recipeCount: recipeCount,
          description: `Receptai su ${tagName}`,
          relatedTags: relatedTags,
          popularityScore: popularityScore,
          trending: recipeCount > 20 && popularityScore > 7, // Mark as trending if popular
          seo: generateTagSEO({ name: tagName }, recipeCount),
          createdAt: new Date(),
          updatedAt: new Date(),
          lastUsed: new Date()
        };
        
        await db.collection('tags_new').insertOne(tagDocument);
        insertedCount++;
        
        if (insertedCount % 20 === 0) {
          console.log(`✅ Inserted ${insertedCount} tags`);
        }
        
      } catch (error) {
        console.error(`❌ Error inserting tag ${tagData._id}:`, error.message);
      }
    }
    
    console.log(`🎉 Tag population completed: ${insertedCount} tags inserted`);
    
    // Show top tags
    const topTags = await db.collection('tags_new')
      .find({})
      .sort({ recipeCount: -1 })
      .limit(10)
      .toArray();
    
    console.log('🏆 Top 10 tags by recipe count:');
    topTags.forEach((tag, index) => {
      console.log(`  ${index + 1}. ${tag.name} (${tag.recipeCount} receptai)`);
    });
    
    // Show trending tags
    const trendingTags = await db.collection('tags_new')
      .find({ trending: true })
      .sort({ popularityScore: -1 })
      .toArray();
    
    console.log(`🔥 Trending tags (${trendingTags.length}):`);
    trendingTags.slice(0, 5).forEach(tag => {
      console.log(`  • ${tag.name} (Score: ${tag.popularityScore.toFixed(1)})`);
    });
    
  } catch (error) {
    console.error('❌ Tag population failed:', error);
    throw error;
  } finally {
    await client.close();
  }
}

// Update tag counts (to be run periodically)
async function updateTagCounts() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('🔄 Updating tag counts...');
    
    const tags = await db.collection('tags_new').find({}).toArray();
    
    for (const tag of tags) {
      const recipeCount = await db.collection('recipes_new').countDocuments({
        tags: tag.name
      });
      
      const popularityScore = calculatePopularityScore(recipeCount, tag.name);
      
      await db.collection('tags_new').updateOne(
        { _id: tag._id },
        { 
          $set: { 
            recipeCount: recipeCount,
            popularityScore: popularityScore,
            trending: recipeCount > 20 && popularityScore > 7,
            updatedAt: new Date()
          } 
        }
      );
    }
    
    console.log('✅ Tag counts updated');
    
  } catch (error) {
    console.error('❌ Tag count update failed:', error);
    throw error;
  } finally {
    await client.close();
  }
}

// Run the script
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'update') {
    updateTagCounts()
      .then(() => {
        console.log('🎉 Tag count update completed!');
        process.exit(0);
      })
      .catch((error) => {
        console.error('💥 Tag count update failed:', error);
        process.exit(1);
      });
  } else {
    populateTags()
      .then(() => {
        console.log('🎉 Tag population completed successfully!');
        process.exit(0);
      })
      .catch((error) => {
        console.error('💥 Tag population failed:', error);
        process.exit(1);
      });
  }
}

module.exports = { populateTags, updateTagCounts };
