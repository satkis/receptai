// Recipe Migration Script
// Migrates existing recipes to new schema with categorization and tags

const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://username:password@cluster.mongodb.net/receptai';

// Helper function to generate URL-safe slug
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// Determine category path based on recipe content
function determineCategoryPath(recipe) {
  // Check existing category data
  if (recipe.categoryPath) {
    return recipe.categoryPath;
  }
  
  // Analyze recipe content to determine category
  const title = (recipe.title?.lt || recipe.title || '').toLowerCase();
  const description = (recipe.description?.lt || recipe.description || '').toLowerCase();
  const ingredients = recipe.ingredients || [];
  
  // Check for meat dishes
  if (title.includes('vištiena') || title.includes('vištienos') || 
      ingredients.some(ing => (ing.name?.lt || ing.name || '').toLowerCase().includes('vištiena'))) {
    if (title.includes('krūtinėlė') || title.includes('krūtinėlės')) {
      return 'pagal-ingredienta/mesa/vistiena/krutinele';
    }
    return 'pagal-ingredienta/mesa/vistiena';
  }
  
  if (title.includes('jautiena') || title.includes('jautienos')) {
    return 'pagal-ingredienta/mesa/jautiena';
  }
  
  if (title.includes('kiauliena') || title.includes('kiaulienos')) {
    return 'pagal-ingredienta/mesa/kiauliena';
  }
  
  // Check for soups
  if (title.includes('sriuba') || title.includes('barščiai') || title.includes('sultinys')) {
    return 'patiekalu-tipai/sriubos';
  }
  
  // Check for desserts
  if (title.includes('tortas') || title.includes('pyragas') || title.includes('desertas') ||
      title.includes('saldus') || title.includes('kremas')) {
    if (title.includes('lengvas') || title.includes('paprastas')) {
      return 'patiekalu-tipai/desertai/lengvi-desertai';
    }
    if (title.includes('tortas') || title.includes('pyragas')) {
      return 'patiekalu-tipai/desertai/tortai-ir-pyragai';
    }
    return 'patiekalu-tipai/desertai';
  }
  
  // Check for salads
  if (title.includes('salotos') || title.includes('salotų')) {
    if (title.includes('cezario')) {
      return 'patiekalu-tipai/salotos/cezario';
    }
    if (title.includes('avokado') || title.includes('burata')) {
      return 'patiekalu-tipai/salotos/su-avokadu-ar-burata';
    }
    return 'patiekalu-tipai/salotos';
  }
  
  // Default fallback based on meal type
  if (title.includes('pusryčiai') || title.includes('pusryčių')) {
    return 'patiekalu-tipai/pusryciai';
  }
  
  if (title.includes('vakarienė') || title.includes('vakarienės')) {
    return 'patiekalu-tipai/vakariene';
  }
  
  // Default to lunch
  return 'patiekalu-tipai/pietus';
}

// Extract tags from recipe data
function extractTags(recipe) {
  const tags = new Set();
  
  // Extract from existing categories
  if (recipe.categories) {
    if (recipe.categories.dietary) {
      recipe.categories.dietary.forEach(diet => tags.add(diet));
    }
    if (recipe.categories.cuisine) {
      tags.add(recipe.categories.cuisine.toLowerCase());
    }
    if (recipe.categories.main) {
      tags.add(recipe.categories.main.toLowerCase());
    }
  }
  
  // Extract from group labels
  if (recipe.groupLabels) {
    recipe.groupLabels.forEach(label => tags.add(label));
  }
  
  // Add time-based tags
  const totalTime = recipe.totalTimeMinutes || 30;
  if (totalTime <= 15) {
    tags.add('per 15 min');
    tags.add('greitai paruošiami');
  } else if (totalTime <= 30) {
    tags.add('per 30 min');
    tags.add('30 minučių');
  }
  
  // Add difficulty tags
  if (recipe.difficulty) {
    tags.add(recipe.difficulty);
  } else {
    tags.add('vidutinis'); // Default difficulty
  }
  
  // Extract ingredient-based tags
  const ingredients = recipe.ingredients || [];
  ingredients.forEach(ingredient => {
    const name = (ingredient.name?.lt || ingredient.name || '').toLowerCase();
    
    if (name.includes('vištiena')) tags.add('vištiena');
    if (name.includes('jautiena')) tags.add('jautiena');
    if (name.includes('kiauliena')) tags.add('kiauliena');
    if (name.includes('žuvis')) tags.add('žuvis');
    if (name.includes('grybai')) tags.add('grybai');
    if (name.includes('sūris')) tags.add('sūris');
    if (name.includes('kiaušinis')) tags.add('kiaušiniai');
  });
  
  // Add cooking method tags
  const instructions = recipe.instructions || [];
  const allText = instructions.map(inst => (inst.text?.lt || inst.text || '')).join(' ').toLowerCase();
  
  if (allText.includes('orkaitė') || allText.includes('kepti')) {
    tags.add('orkaitėje');
  }
  if (allText.includes('greitpuodis')) {
    tags.add('greitpuodyje');
  }
  if (allText.includes('grilis')) {
    tags.add('griliuje');
  }
  
  // Add audience tags
  const title = (recipe.title?.lt || recipe.title || '').toLowerCase();
  if (title.includes('vaikams') || title.includes('vaikų')) {
    tags.add('vaikams');
  }
  if (title.includes('šeimai')) {
    tags.add('šeimai');
  }
  
  return Array.from(tags).filter(tag => tag && tag.length > 0);
}

// Generate breadcrumbs for category path
async function generateBreadcrumbs(db, categoryPath) {
  const pathParts = categoryPath.split('/');
  const breadcrumbs = [
    { title: "Receptai", slug: "receptai", url: "/receptai" }
  ];
  
  let currentPath = '';
  for (const part of pathParts) {
    currentPath = currentPath ? `${currentPath}/${part}` : part;
    
    const category = await db.collection('categories_new').findOne({ path: currentPath });
    if (category) {
      breadcrumbs.push({
        title: category.title.lt,
        slug: category.slug,
        url: `/receptu-tipai/${category.path}`
      });
    }
  }
  
  return breadcrumbs;
}

// Get category IDs for path
async function getCategoryIds(db, categoryPath) {
  const pathParts = categoryPath.split('/');
  const categoryIds = [];
  
  let currentPath = '';
  for (const part of pathParts) {
    currentPath = currentPath ? `${currentPath}/${part}` : part;
    
    const category = await db.collection('categories_new').findOne({ path: currentPath });
    if (category) {
      categoryIds.push(category._id);
    }
  }
  
  return categoryIds;
}

// Generate SEO data for recipe
function generateSEO(recipe) {
  const title = recipe.title?.lt || recipe.title || 'Receptas';
  const description = recipe.description?.lt || recipe.description || '';
  
  return {
    metaTitle: `${title} - Paragaujam.lt`,
    metaDescription: description.substring(0, 160),
    keywords: extractTags(recipe).slice(0, 10) // Limit to 10 keywords
  };
}

async function migrateRecipes() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    console.log('🔄 Starting recipe migration...');
    
    // Get existing recipes
    const oldRecipes = await db.collection('recipes').find({}).toArray();
    console.log(`📊 Found ${oldRecipes.length} recipes to migrate`);
    
    let migratedCount = 0;
    let errorCount = 0;
    
    for (const oldRecipe of oldRecipes) {
      try {
        // Determine category path
        const categoryPath = determineCategoryPath(oldRecipe);
        
        // Get category data
        const categoryIds = await getCategoryIds(db, categoryPath);
        const breadcrumbs = await generateBreadcrumbs(db, categoryPath);
        
        // Extract tags
        const tags = extractTags(oldRecipe);
        
        // Ensure unique slug
        let slug = oldRecipe.slug || slugify(oldRecipe.title?.lt || oldRecipe.title || 'receptas');
        const existingSlug = await db.collection('recipes_new').findOne({ slug });
        if (existingSlug) {
          slug = `${slug}-${Date.now()}`;
        }
        
        // Create new recipe document
        const newRecipe = {
          slug: slug,
          title: oldRecipe.title || { lt: 'Receptas', en: 'Recipe' },
          description: oldRecipe.description || { lt: '', en: '' },
          language: oldRecipe.language || "lt",
          
          servings: oldRecipe.servings || 4,
          prepTimeMinutes: oldRecipe.prepTimeMinutes || 15,
          cookTimeMinutes: oldRecipe.cookTimeMinutes || 30,
          totalTimeMinutes: oldRecipe.totalTimeMinutes || 45,
          
          ingredients: oldRecipe.ingredients || [],
          instructions: oldRecipe.instructions || [],
          
          // New categorization
          categoryPath: categoryPath,
          categoryIds: categoryIds,
          breadcrumbs: breadcrumbs,
          tags: tags,
          
          image: oldRecipe.image || '/images/placeholder-recipe.jpg',
          rating: oldRecipe.rating || { average: 0, count: 0 },
          difficulty: oldRecipe.difficulty || "vidutinis",
          
          // SEO
          seo: generateSEO(oldRecipe),
          
          // Timestamps
          createdAt: oldRecipe.createdAt || new Date(),
          updatedAt: new Date(),
          publishedAt: oldRecipe.publishedAt || oldRecipe.createdAt || new Date()
        };
        
        await db.collection('recipes_new').insertOne(newRecipe);
        migratedCount++;
        
        if (migratedCount % 10 === 0) {
          console.log(`✅ Migrated ${migratedCount}/${oldRecipes.length} recipes`);
        }
        
      } catch (error) {
        console.error(`❌ Error migrating recipe ${oldRecipe._id}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`🎉 Migration completed: ${migratedCount} successful, ${errorCount} errors`);
    
    // Update recipe counts in categories
    await updateCategoryRecipeCounts(db);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await client.close();
  }
}

async function updateCategoryRecipeCounts(db) {
  console.log('🔄 Updating category recipe counts...');
  
  const categories = await db.collection('categories_new').find({}).toArray();
  
  for (const category of categories) {
    const recipeCount = await db.collection('recipes_new').countDocuments({
      categoryPath: { $regex: `^${category.path}` }
    });
    
    await db.collection('categories_new').updateOne(
      { _id: category._id },
      { $set: { recipeCount: recipeCount } }
    );
  }
  
  console.log('✅ Category recipe counts updated');
}

// Run the script
if (require.main === module) {
  migrateRecipes()
    .then(() => {
      console.log('🎉 Recipe migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Recipe migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateRecipes };
