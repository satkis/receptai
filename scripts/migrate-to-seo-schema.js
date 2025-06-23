// Migration script to update recipes to SEO-optimized schema
// Run with: node scripts/migrate-to-seo-schema.js

const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://receptai:SXF0NrgQbiQi8EeB@cluster0.zy6ywwg.mongodb.net/receptai?retryWrites=true&w=majority';

/**
 * Generate SEO metadata for a recipe
 */
function generateSEOMetadata(recipe) {
  const title = recipe.title?.lt || recipe.title || 'Receptas';
  const description = recipe.description?.lt || recipe.description || '';
  
  // Generate meta title
  const metaTitle = `${title} - Ragaujam.lt`;
  
  // Generate meta description
  const metaDescription = `${description} Receptas su nuotraukomis ir instrukcijomis. Idealus šeimai!`.substring(0, 160);
  
  // Generate keywords from tags and title
  const keywords = [
    ...(recipe.tags || []),
    ...title.toLowerCase().split(' ').filter(word => word.length > 3)
  ].slice(0, 10);
  
  // Focus keyword (first tag or main word from title)
  const focusKeyword = recipe.tags?.[0] || title.toLowerCase().split(' ')[0] || 'receptas';
  
  return {
    metaTitle,
    metaDescription,
    keywords,
    focusKeyword
  };
}

/**
 * Generate Schema.org structured data
 */
function generateSchemaOrg(recipe) {
  const title = recipe.title?.lt || recipe.title || 'Receptas';
  const description = recipe.description?.lt || recipe.description || '';
  const baseUrl = 'https://ragaujam.lt';
  
  // Format duration (PT15M format)
  const formatDuration = (minutes) => {
    if (!minutes) return 'PT0M';
    return minutes < 60 ? `PT${minutes}M` : `PT${Math.floor(minutes/60)}H${minutes%60}M`;
  };
  
  // Generate ingredients list
  const recipeIngredients = (recipe.ingredients || []).map(ingredient => {
    const name = ingredient.name?.lt || ingredient.name || 'Ingredientas';
    const notes = ingredient.notes ? ` (${ingredient.notes})` : '';
    return `${ingredient.quantity || ''} ${name}${notes}`.trim();
  });
  
  // Generate instructions
  const recipeInstructions = (recipe.instructions || []).map(instruction => ({
    '@type': 'HowToStep',
    name: `Žingsnis ${instruction.step || instruction.stepNumber || 1}`,
    text: instruction.text?.lt || instruction.text || '',
    url: `${baseUrl}/receptas/${recipe.slug}#step${instruction.step || instruction.stepNumber || 1}`
  }));
  
  const schemaOrg = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: title,
    description: description,
    image: [recipe.image?.src || recipe.image?.url || recipe.image || ''],
    author: {
      '@type': 'Organization',
      name: 'Ragaujam.lt',
      url: baseUrl
    },
    publisher: {
      '@type': 'Organization',
      name: 'Ragaujam.lt',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
        width: 600,
        height: 60
      }
    },
    datePublished: recipe.publishedAt || recipe.createdAt || new Date().toISOString(),
    dateModified: recipe.updatedAt || new Date().toISOString(),
    prepTime: formatDuration(recipe.prepTimeMinutes),
    cookTime: formatDuration(recipe.cookTimeMinutes),
    totalTime: formatDuration(recipe.totalTimeMinutes),
    recipeYield: `${recipe.servings || 1} ${recipe.servingsUnit || 'porcijos'}`,
    recipeCategory: 'Patiekalas',
    recipeCuisine: 'Lietuviška',
    keywords: (recipe.tags || []).join(', '),
    recipeIngredient: recipeIngredients,
    recipeInstructions: recipeInstructions
  };
  
  // Add rating if available
  if (recipe.rating && recipe.rating.count > 0) {
    schemaOrg.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: recipe.rating.average.toString(),
      reviewCount: recipe.rating.count.toString(),
      bestRating: '5',
      worstRating: '1'
    };
  }
  
  return schemaOrg;
}

/**
 * Generate engagement metrics
 */
function generateEngagementMetrics(recipe) {
  return {
    views: recipe.viewsCount || recipe.views || 0,
    saves: Math.floor((recipe.viewsCount || 0) * 0.05), // Estimate 5% save rate
    shares: Math.floor((recipe.viewsCount || 0) * 0.03), // Estimate 3% share rate
    commentsCount: recipe.commentsCount || 0,
    avgTimeOnPage: 180, // Default 3 minutes
    bounceRate: 0.25 // Default 25% bounce rate
  };
}

/**
 * Migrate recipes to new SEO schema
 */
async function migrateRecipesToSEOSchema() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('receptai');
    
    // Find all recipes that need migration
    const recipes = await db.collection('recipes_new').find({}).toArray();
    
    console.log(`\n📋 Found ${recipes.length} recipes to migrate`);
    
    for (const recipe of recipes) {
      console.log(`\n🔄 Processing: ${recipe.slug}`);
      
      // Generate new fields
      const seo = generateSEOMetadata(recipe);
      const schemaOrg = generateSchemaOrg(recipe);
      const engagement = generateEngagementMetrics(recipe);
      
      // Prepare update
      const updateData = {
        // Add canonical URL
        canonicalUrl: `https://ragaujam.lt/receptas/${recipe.slug}`,
        
        // Add SEO metadata
        seo,
        
        // Add Schema.org data
        schemaOrg,
        
        // Add engagement metrics
        engagement,
        
        // Add difficulty if missing
        difficulty: recipe.difficulty || 'lengvas',
        
        // Add sitemap data
        sitemap: {
          priority: recipe.featured ? 0.9 : 0.8,
          changefreq: 'monthly',
          lastmod: new Date()
        },
        
        // Update timestamps
        updatedAt: new Date()
      };
      
      // Update recipe
      const result = await db.collection('recipes_new').updateOne(
        { _id: recipe._id },
        { $set: updateData }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`✅ Updated ${recipe.slug}`);
      } else {
        console.log(`❌ Failed to update ${recipe.slug}`);
      }
    }
    
    console.log(`\n🎉 Migration completed! Updated ${recipes.length} recipes`);
    
  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    await client.close();
  }
}

// Run migration
if (require.main === module) {
  console.log('🚀 Starting SEO schema migration...');
  
  migrateRecipesToSEOSchema()
    .then(() => {
      console.log('\n✅ Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = {
  generateSEOMetadata,
  generateSchemaOrg,
  generateEngagementMetrics,
  migrateRecipesToSEOSchema
};
