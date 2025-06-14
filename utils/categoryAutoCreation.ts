// Category Auto-Creation Service
// Handles automatic category and subcategory creation when recipes are added

import { MongoClient, Db } from 'mongodb';

export interface CategoryCreationResult {
  created: boolean;
  categoryId?: string;
  subcategoryCreated?: boolean;
  message: string;
}

export interface CategoryData {
  title: { lt: string; en?: string };
  slug: string;
  level: number;
  path: string;
  fullPath: string[];
  parentId?: string;
  parentSlug?: string;
  ancestors: string[];
  description: { lt: string; en?: string };
  icon: string;
  recipeCount: number;
  isActive: boolean;
  sortOrder: number;
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

// Category name mappings for better Lithuanian titles
const categoryTitleMappings: { [key: string]: { lt: string; en: string } } = {
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
const categoryIconMappings: { [key: string]: string } = {
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

/**
 * Formats slug to proper Lithuanian title
 */
function formatSlugToTitle(slug: string): { lt: string; en: string } {
  if (categoryTitleMappings[slug]) {
    return categoryTitleMappings[slug];
  }
  
  // Fallback: capitalize and clean slug
  const cleaned = slug.replace(/-/g, ' ');
  const capitalized = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  
  return {
    lt: capitalized,
    en: capitalized
  };
}

/**
 * Gets appropriate icon for category
 */
function getCategoryIcon(slug: string): string {
  return categoryIconMappings[slug] || '📝';
}

/**
 * Parses category path and extracts category/subcategory information
 */
export function parseCategoryPath(categoryPath: string): {
  categorySlug: string;
  subcategorySlug?: string;
  isValid: boolean;
} {
  if (!categoryPath || !categoryPath.startsWith('receptai/')) {
    return { categorySlug: '', isValid: false };
  }
  
  const pathParts = categoryPath.split('/').filter(Boolean);
  
  if (pathParts.length < 2) {
    return { categorySlug: '', isValid: false };
  }
  
  // Remove 'receptai' prefix
  const [, categorySlug, subcategorySlug] = pathParts;
  
  return {
    categorySlug,
    subcategorySlug,
    isValid: true
  };
}

/**
 * Creates a new category in the database
 */
async function createCategory(
  db: Db, 
  categorySlug: string, 
  parentId?: string,
  parentSlug?: string
): Promise<CategoryData> {
  const title = formatSlugToTitle(categorySlug);
  const level = parentId ? 2 : 1;
  const path = parentSlug ? `receptai/${parentSlug}/${categorySlug}` : `receptai/${categorySlug}`;
  const fullPath = path.split('/');
  
  // Get next sort order
  const lastCategory = await db.collection('categories_new')
    .findOne({ level }, { sort: { sortOrder: -1 } });
  
  const sortOrder = lastCategory ? lastCategory.sortOrder + 1 : 1;
  
  const categoryData: CategoryData = {
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

/**
 * Main function to ensure category and subcategory exist
 */
export async function ensureCategoriesExist(
  db: Db, 
  categoryPath: string
): Promise<CategoryCreationResult> {
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

/**
 * Updates recipe count for categories after recipe changes
 */
export async function updateCategoryRecipeCounts(
  db: Db, 
  categoryPath: string
): Promise<void> {
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
