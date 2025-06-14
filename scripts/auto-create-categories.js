#!/usr/bin/env node

// Auto-Create Categories Script
// Processes existing recipes and creates missing categories automatically

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

// Category name mappings for better Lithuanian titles
const categoryTitleMappings = {
  // Main categories
  'mesa': { lt: 'Mėsa', en: 'Meat' },
  'zuvis': { lt: 'Žuvis', en: 'Fish' },
  'darzoves': { lt: 'Daržovės', en: 'Vegetables' },
  'desertai': { lt: 'Desertai', en: 'Desserts' },
  'sriubos': { lt: 'Sriubos', en: 'Soups' },
  'salotos': { lt: 'Salotos', en: 'Salads' },
  'gerimai': { lt: 'Gėrimai', en: 'Drinks' },
  'uzkandziai': { lt: 'Užkandžiai', en: 'Snacks' },
  'pusryciai': { lt: 'Pusryčiai', en: 'Breakfast' },
  'pietus': { lt: 'Pietūs', en: 'Lunch' },
  'vakariene': { lt: 'Vakarienė', en: 'Dinner' },
  'greiti-receptai': { lt: 'Greiti receptai', en: 'Quick recipes' },
  'sokoladas': { lt: 'Šokoladas', en: 'Chocolate' },
  
  // Subcategories
  'vistiena': { lt: 'Vištiena', en: 'Chicken' },
  'jautiena': { lt: 'Jautiena', en: 'Beef' },
  'kiauliena': { lt: 'Kiauliena', en: 'Pork' },
  'kepsniai': { lt: 'Kepsniai', en: 'Steaks' },
  'troskiniai': { lt: 'Troškinti', en: 'Braised' },
  'kepta': { lt: 'Kepta', en: 'Fried' },
  'virta': { lt: 'Virta', en: 'Boiled' },
  'lengvi-desertai': { lt: 'Lengvi desertai', en: 'Light desserts' },
  'sokoladiniai-desertai': { lt: 'Šokoladiniai desertai', en: 'Chocolate desserts' }
};

// Icon mappings for categories
const categoryIconMappings = {
  'mesa': '🥩',
  'zuvis': '🐟',
  'darzoves': '🥬',
  'desertai': '🍰',
  'sriubos': '🍲',
  'salotos': '🥗',
  'gerimai': '🥤',
  'uzkandziai': '🍿',
  'pusryciai': '🍳',
  'pietus': '🍽️',
  'vakariene': '🌙',
  'greiti-receptai': '⚡',
  'sokoladas': '🍫',
  'vistiena': '🐔',
  'jautiena': '🐄',
  'kiauliena': '🐷'
};

function formatSlugToTitle(slug) {
  if (categoryTitleMappings[slug]) {
    return categoryTitleMappings[slug];
  }
  
  const cleaned = slug.replace(/-/g, ' ');
  const capitalized = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  
  return {
    lt: capitalized,
    en: capitalized
  };
}

function getCategoryIcon(slug) {
  return categoryIconMappings[slug] || '📝';
}

function parseCategoryPath(categoryPath) {
  if (!categoryPath || !categoryPath.startsWith('receptai/')) {
    return { categorySlug: '', isValid: false };
  }
  
  const pathParts = categoryPath.split('/').filter(Boolean);
  
  if (pathParts.length < 2) {
    return { categorySlug: '', isValid: false };
  }
  
  const [, categorySlug, subcategorySlug] = pathParts;
  
  return {
    categorySlug,
    subcategorySlug,
    isValid: true
  };
}

async function createCategory(db, categorySlug, parentId = null, parentSlug = null) {
  const title = formatSlugToTitle(categorySlug);
  const level = parentId ? 2 : 1;
  const path = parentSlug ? `receptai/${parentSlug}/${categorySlug}` : `receptai/${categorySlug}`;
  const fullPath = path.split('/');
  
  // Get next sort order
  const lastCategory = await db.collection('categories_new')
    .findOne({ level }, { sort: { sortOrder: -1 } });
  
  const sortOrder = lastCategory ? lastCategory.sortOrder + 1 : 1;
  
  const categoryData = {
    title,
    slug: categorySlug,
    level,
    path,
    fullPath,
    parentId,
    parentSlug,
    ancestors: parentSlug ? [parentSlug] : [],
    description: {
      lt: `${title.lt} receptai`,
      en: `${title.en} recipes`
    },
    icon: getCategoryIcon(categorySlug),
    recipeCount: 0,
    isActive: true,
    sortOrder,
    seo: {
      metaTitle: `${title.lt} receptai | Paragaujam.lt`,
      metaDescription: `Atraskite geriausius ${title.lt.toLowerCase()} receptus su detaliais instrukcijomis ir nuotraukomis.`,
      keywords: [title.lt.toLowerCase(), 'receptai', 'lietuviški receptai']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const result = await db.collection('categories_new').insertOne(categoryData);
  categoryData._id = result.insertedId;
  
  return categoryData;
}

async function ensureCategoriesExist(db, categoryPath) {
  const parsed = parseCategoryPath(categoryPath);
  
  if (!parsed.isValid) {
    return {
      created: false,
      message: `Invalid category path: ${categoryPath}`
    };
  }
  
  const { categorySlug, subcategorySlug } = parsed;
  let created = false;
  let subcategoryCreated = false;
  
  try {
    // Check if main category exists
    let category = await db.collection('categories_new').findOne({ 
      slug: categorySlug, 
      level: 1 
    });
    
    if (!category) {
      // Create main category
      category = await createCategory(db, categorySlug);
      created = true;
      console.log(`✅ Created category: ${category.title.lt} (${categorySlug})`);
    }
    
    // Handle subcategory if provided
    if (subcategorySlug) {
      const subcategory = await db.collection('categories_new').findOne({
        slug: subcategorySlug,
        parentSlug: categorySlug,
        level: 2
      });
      
      if (!subcategory) {
        // Create subcategory
        await createCategory(db, subcategorySlug, category._id, categorySlug);
        subcategoryCreated = true;
        console.log(`✅ Created subcategory: ${formatSlugToTitle(subcategorySlug).lt} (${subcategorySlug})`);
      }
    }
    
    return {
      created: created || subcategoryCreated,
      categoryId: category._id,
      subcategoryCreated,
      message: created || subcategoryCreated 
        ? `Categories created successfully for path: ${categoryPath}`
        : `Categories already exist for path: ${categoryPath}`
    };
    
  } catch (error) {
    console.error('Error creating categories:', error);
    return {
      created: false,
      message: `Failed to create categories: ${error.message}`
    };
  }
}

async function updateCategoryRecipeCounts(db, categoryPath) {
  const parsed = parseCategoryPath(categoryPath);
  
  if (!parsed.isValid) return;
  
  const { categorySlug, subcategorySlug } = parsed;
  
  try {
    // Update main category count
    const mainCategoryCount = await db.collection('recipes_new').countDocuments({
      $or: [
        { primaryCategoryPath: { $regex: `^receptai/${categorySlug}` } },
        { secondaryCategories: { $regex: `^receptai/${categorySlug}` } }
      ]
    });
    
    await db.collection('categories_new').updateOne(
      { slug: categorySlug, level: 1 },
      { 
        $set: { 
          recipeCount: mainCategoryCount,
          updatedAt: new Date()
        }
      }
    );
    
    // Update subcategory count if exists
    if (subcategorySlug) {
      const subcategoryPath = `receptai/${categorySlug}/${subcategorySlug}`;
      const subcategoryCount = await db.collection('recipes_new').countDocuments({
        $or: [
          { primaryCategoryPath: subcategoryPath },
          { secondaryCategories: subcategoryPath }
        ]
      });
      
      await db.collection('categories_new').updateOne(
        { slug: subcategorySlug, parentSlug: categorySlug, level: 2 },
        { 
          $set: { 
            recipeCount: subcategoryCount,
            updatedAt: new Date()
          }
        }
      );
    }
    
  } catch (error) {
    console.error('Error updating category recipe counts:', error);
  }
}

function extractCategoryPaths(recipe) {
  const paths = [];
  
  if (recipe.primaryCategoryPath) {
    paths.push(recipe.primaryCategoryPath);
  }
  
  if (recipe.secondaryCategories && Array.isArray(recipe.secondaryCategories)) {
    paths.push(...recipe.secondaryCategories);
  }
  
  return paths.filter(Boolean);
}

async function main() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    const db = client.db();
    
    console.log('🔍 Processing existing recipes for category auto-creation...');
    
    const recipes = await db.collection('recipes_new').find({}).toArray();
    
    console.log(`📊 Found ${recipes.length} recipes to process`);
    
    let processedCount = 0;
    let createdCategoriesCount = 0;
    const createdCategories = new Set();
    
    for (const recipe of recipes) {
      const categoryPaths = extractCategoryPaths(recipe);
      
      if (categoryPaths.length === 0) {
        console.log(`⚠️ No category paths found for recipe: ${recipe.title?.lt || recipe.title || recipe.slug}`);
        continue;
      }
      
      for (const categoryPath of categoryPaths) {
        const result = await ensureCategoriesExist(db, categoryPath);
        
        if (result.created && !createdCategories.has(categoryPath)) {
          createdCategoriesCount++;
          createdCategories.add(categoryPath);
        }
        
        // Update recipe counts
        await updateCategoryRecipeCounts(db, categoryPath);
      }
      
      processedCount++;
      
      if (processedCount % 10 === 0) {
        console.log(`📈 Processed ${processedCount}/${recipes.length} recipes`);
      }
    }
    
    console.log('\n✅ Processing complete!');
    console.log(`📊 Processed ${processedCount} recipes`);
    console.log(`📂 Created ${createdCategoriesCount} new category paths`);
    
    // Show created categories
    if (createdCategories.size > 0) {
      console.log('\n📋 Created categories:');
      for (const categoryPath of createdCategories) {
        console.log(`  - ${categoryPath}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  ensureCategoriesExist,
  updateCategoryRecipeCounts,
  extractCategoryPaths
};
