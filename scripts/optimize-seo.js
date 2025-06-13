// SEO Optimization Script for Lithuanian Recipe Website
// Optimizes meta tags, structured data, and search indexing

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://username:password@cluster.mongodb.net/receptai';

async function optimizeSEO() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('🔍 Optimizing SEO for recipes and categories...');
    
    // 1. Update recipe SEO metadata
    console.log('📝 Updating recipe SEO metadata...');
    
    const recipes = await db.collection('recipes_new').find({}).toArray();
    let updatedRecipes = 0;
    
    for (const recipe of recipes) {
      const title = recipe.title?.lt || 'Receptas';
      const description = recipe.description?.lt || '';
      const timeText = recipe.totalTimeMinutes ? `${recipe.totalTimeMinutes} min` : '';
      const servingsText = recipe.servings ? `${recipe.servings} porcijos` : '';
      
      // Generate optimized meta title (max 60 chars)
      let metaTitle = `${title} - Paragaujam.lt`;
      if (metaTitle.length > 60) {
        metaTitle = `${title.substring(0, 50)}... - Paragaujam.lt`;
      }
      
      // Generate optimized meta description (max 160 chars)
      let metaDescription = description.substring(0, 120);
      if (timeText && servingsText) {
        metaDescription += ` ${timeText}, ${servingsText}.`;
      }
      if (metaDescription.length > 160) {
        metaDescription = metaDescription.substring(0, 157) + '...';
      }
      
      // Extract keywords from title, description, and tags
      const keywords = [
        ...title.toLowerCase().split(' ').filter(word => word.length > 3),
        ...(recipe.tags || []).slice(0, 5),
        'receptas',
        'lietuviškas'
      ].slice(0, 10);
      
      // Generate structured data for recipe
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "Recipe",
        "name": title,
        "description": description,
        "image": recipe.image || "/images/placeholder-recipe.jpg",
        "author": {
          "@type": "Organization",
          "name": "Paragaujam.lt"
        },
        "datePublished": recipe.publishedAt || recipe.createdAt,
        "prepTime": `PT${recipe.prepTimeMinutes || 15}M`,
        "cookTime": `PT${recipe.cookTimeMinutes || 30}M`,
        "totalTime": `PT${recipe.totalTimeMinutes || 45}M`,
        "recipeYield": recipe.servings || 4,
        "recipeCategory": recipe.allCategories?.[0]?.split('/')?.pop() || "Patiekalas",
        "recipeCuisine": "Lithuanian",
        "keywords": keywords.join(', '),
        "nutrition": recipe.nutrition ? {
          "@type": "NutritionInformation",
          "calories": recipe.nutrition.calories + " calories"
        } : undefined,
        "aggregateRating": recipe.rating?.count > 0 ? {
          "@type": "AggregateRating",
          "ratingValue": recipe.rating.average,
          "reviewCount": recipe.rating.count
        } : undefined,
        "recipeIngredient": recipe.ingredients?.map(ing => 
          `${ing.quantity} ${ing.name?.lt || ing.name}`
        ) || [],
        "recipeInstructions": recipe.instructions?.map(inst => ({
          "@type": "HowToStep",
          "text": inst.text?.lt || inst.text
        })) || []
      };
      
      // Update recipe with SEO data
      await db.collection('recipes_new').updateOne(
        { _id: recipe._id },
        {
          $set: {
            seo: {
              metaTitle,
              metaDescription,
              keywords
            },
            structuredData
          }
        }
      );
      
      updatedRecipes++;
    }
    
    console.log(`✅ Updated SEO for ${updatedRecipes} recipes`);
    
    // 2. Update category SEO metadata
    console.log('📝 Updating category SEO metadata...');
    
    const categories = await db.collection('categories_new').find({}).toArray();
    let updatedCategories = 0;
    
    for (const category of categories) {
      const title = category.title?.lt || 'Kategorija';
      const recipeCount = category.recipeCount || 0;
      const countText = recipeCount > 100 ? '100+' : recipeCount.toString();
      
      // Generate optimized meta title
      let metaTitle = `${title} receptai (${countText}) - Paragaujam.lt`;
      if (metaTitle.length > 60) {
        metaTitle = `${title} receptai - Paragaujam.lt`;
      }
      
      // Generate optimized meta description
      let metaDescription = `Geriausi ${title.toLowerCase()} receptai. ${countText} patikrintų receptų su nuotraukomis ir instrukcijomis.`;
      if (metaDescription.length > 160) {
        metaDescription = metaDescription.substring(0, 157) + '...';
      }
      
      // Generate keywords
      const keywords = [
        title.toLowerCase(),
        'receptai',
        'lietuviški',
        'su nuotraukomis',
        'instrukcijos'
      ];
      
      // Generate breadcrumb structured data
      const breadcrumbStructuredData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Pagrindinis",
            "item": "https://paragaujam.lt/"
          },
          ...category.ancestors?.map((ancestor, index) => ({
            "@type": "ListItem",
            "position": index + 2,
            "name": ancestor.title,
            "item": `https://paragaujam.lt/${ancestor.path}`
          })) || [],
          {
            "@type": "ListItem",
            "position": (category.ancestors?.length || 0) + 2,
            "name": title,
            "item": `https://paragaujam.lt/${category.path}`
          }
        ]
      };
      
      // Update category with SEO data
      await db.collection('categories_new').updateOne(
        { _id: category._id },
        {
          $set: {
            seo: {
              metaTitle,
              metaDescription,
              keywords
            },
            breadcrumbStructuredData
          }
        }
      );
      
      updatedCategories++;
    }
    
    console.log(`✅ Updated SEO for ${updatedCategories} categories`);
    
    // 3. Create search-friendly URLs for popular search terms
    console.log('🔍 Generating popular search terms for sitemap...');
    
    const popularTags = await db.collection('recipes_new').aggregate([
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 100 }
    ]).toArray();
    
    const popularIngredients = await db.collection('recipes_new').aggregate([
      { $unwind: "$ingredients" },
      { $group: { _id: "$ingredients.name.lt", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 50 }
    ]).toArray();
    
    // Store popular search terms for sitemap generation
    await db.collection('seo_search_terms').deleteMany({});
    await db.collection('seo_search_terms').insertMany([
      ...popularTags.map(tag => ({
        term: tag._id,
        type: 'tag',
        count: tag.count,
        url: `/paieska?q=${encodeURIComponent(tag._id)}`,
        priority: Math.min(0.8, tag.count / 100)
      })),
      ...popularIngredients.map(ing => ({
        term: ing._id,
        type: 'ingredient',
        count: ing.count,
        url: `/paieska?q=${encodeURIComponent(ing._id)}`,
        priority: Math.min(0.7, ing.count / 100)
      }))
    ]);
    
    console.log(`✅ Generated ${popularTags.length + popularIngredients.length} search terms for sitemap`);
    
    // 4. Performance verification
    console.log('\n📊 SEO optimization verification:');
    
    const recipesWithSEO = await db.collection('recipes_new').countDocuments({
      'seo.metaTitle': { $exists: true },
      'structuredData': { $exists: true }
    });
    
    const categoriesWithSEO = await db.collection('categories_new').countDocuments({
      'seo.metaTitle': { $exists: true }
    });
    
    console.log(`Recipes with SEO: ${recipesWithSEO}/${recipes.length}`);
    console.log(`Categories with SEO: ${categoriesWithSEO}/${categories.length}`);
    console.log(`Search terms for sitemap: ${popularTags.length + popularIngredients.length}`);
    
    console.log('\n🎉 SEO optimization completed successfully!');
    
  } catch (error) {
    console.error('❌ SEO optimization failed:', error);
    throw error;
  } finally {
    await client.close();
  }
}

// Run the script
if (require.main === module) {
  optimizeSEO()
    .then(() => {
      console.log('✅ SEO optimization completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 SEO optimization failed:', error);
      process.exit(1);
    });
}

module.exports = { optimizeSEO };
