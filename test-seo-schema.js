// Test script to verify SEO schema implementation
// Run with: node test-seo-schema.js

const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://receptai:SXF0NrgQbiQi8EeB@cluster0.zy6ywwg.mongodb.net/receptai?retryWrites=true&w=majority';

async function testSEOSchema() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('receptai');
    
    // Find your specific recipe
    const recipe = await db.collection('recipes_new').findOne({
      slug: "nn-sokoladoo-desertas"
    });

    if (!recipe) {
      console.log('❌ Recipe not found');
      return;
    }

    console.log('\n📝 Recipe found:', recipe.title?.lt || recipe.title);
    console.log('🔗 Canonical URL:', recipe.canonicalUrl);
    
    console.log('\n📊 SEO Metadata:');
    console.log('   - Meta Title:', recipe.seo?.metaTitle);
    console.log('   - Meta Description:', recipe.seo?.metaDescription?.substring(0, 100) + '...');
    console.log('   - Keywords:', recipe.seo?.keywords?.slice(0, 5).join(', '));
    console.log('   - Focus Keyword:', recipe.seo?.focusKeyword);
    
    console.log('\n🏗️ Schema.org Data:');
    console.log('   - Type:', recipe.schemaOrg?.['@type']);
    console.log('   - Name:', recipe.schemaOrg?.name);
    console.log('   - Author:', recipe.schemaOrg?.author?.name);
    console.log('   - Publisher:', recipe.schemaOrg?.publisher?.name);
    console.log('   - Recipe Category:', recipe.schemaOrg?.recipeCategory);
    console.log('   - Recipe Cuisine:', recipe.schemaOrg?.recipeCuisine);
    console.log('   - Prep Time:', recipe.schemaOrg?.prepTime);
    console.log('   - Cook Time:', recipe.schemaOrg?.cookTime);
    console.log('   - Total Time:', recipe.schemaOrg?.totalTime);
    console.log('   - Recipe Yield:', recipe.schemaOrg?.recipeYield);
    console.log('   - Ingredients Count:', recipe.schemaOrg?.recipeIngredient?.length);
    console.log('   - Instructions Count:', recipe.schemaOrg?.recipeInstructions?.length);
    
    if (recipe.schemaOrg?.aggregateRating) {
      console.log('   - Rating:', recipe.schemaOrg.aggregateRating.ratingValue);
      console.log('   - Review Count:', recipe.schemaOrg.aggregateRating.reviewCount);
    }
    
    console.log('\n📈 Engagement Metrics:');
    console.log('   - Views:', recipe.engagement?.views);
    console.log('   - Saves:', recipe.engagement?.saves);
    console.log('   - Shares:', recipe.engagement?.shares);
    console.log('   - Comments:', recipe.engagement?.commentsCount);
    console.log('   - Avg Time on Page:', recipe.engagement?.avgTimeOnPage + 's');
    console.log('   - Bounce Rate:', (recipe.engagement?.bounceRate * 100) + '%');
    
    console.log('\n🗺️ Sitemap Data:');
    console.log('   - Priority:', recipe.sitemap?.priority);
    console.log('   - Change Frequency:', recipe.sitemap?.changefreq);
    console.log('   - Last Modified:', recipe.sitemap?.lastmod);
    
    console.log('\n🎯 SEO Validation:');
    
    // Check required Schema.org fields
    const requiredFields = [
      '@context', '@type', 'name', 'description', 'image', 
      'author', 'datePublished', 'recipeIngredient', 'recipeInstructions'
    ];
    
    const missingFields = requiredFields.filter(field => !recipe.schemaOrg?.[field]);
    
    if (missingFields.length === 0) {
      console.log('   ✅ All required Schema.org fields present');
    } else {
      console.log('   ❌ Missing Schema.org fields:', missingFields.join(', '));
    }
    
    // Check SEO metadata
    if (recipe.seo?.metaTitle && recipe.seo?.metaDescription && recipe.seo?.keywords) {
      console.log('   ✅ SEO metadata complete');
    } else {
      console.log('   ❌ SEO metadata incomplete');
    }
    
    // Check image optimization
    if (recipe.image?.src && recipe.image?.alt && recipe.image?.width && recipe.image?.height) {
      console.log('   ✅ Image optimization complete');
    } else {
      console.log('   ❌ Image optimization incomplete');
    }
    
    console.log('\n🚀 Test your recipe at:');
    console.log(`   🔗 Recipe URL: http://localhost:3003/receptas/${recipe.slug}`);
    console.log(`   🔍 Google Rich Results Test: https://search.google.com/test/rich-results?url=${encodeURIComponent(recipe.canonicalUrl)}`);
    
    console.log('\n🎉 SEO schema test completed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

testSEOSchema();
