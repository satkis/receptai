// API endpoint for discovering all available categories and subcategories
// GET /api/categories/discover - Returns all categories/subcategories from database

import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'receptai');
    
    // Get all active categories from database
    const categories = await db.collection('categories').find({
      status: "active"
    }).toArray();
    
    // Get all unique categoryPaths from recipes to discover dynamic categories
    const recipeCategoryPaths = await db.collection('recipes').distinct('categoryPath', {
      status: "published"
    });
    
    // Build comprehensive category structure
    const categoryStructure: any = {};
    
    // Add predefined categories from categories collection
    for (const category of categories) {
      categoryStructure[category.slug] = {
        slug: category.slug,
        title: category.title,
        description: category.description,
        image: category.image,
        icon: category.icon,
        order: category.order || 999,
        type: 'predefined',
        subcategories: {}
      };
      
      // Add predefined subcategories
      if (category.subcategories && Array.isArray(category.subcategories)) {
        for (const sub of category.subcategories) {
          categoryStructure[category.slug].subcategories[sub.slug] = {
            slug: sub.slug,
            title: sub.title,
            description: sub.description,
            image: sub.image,
            recipeCount: sub.recipeCount || 0,
            type: 'predefined'
          };
        }
      }
    }
    
    // Discover categories and subcategories from recipe categoryPaths
    for (const categoryPath of recipeCategoryPaths) {
      if (!categoryPath || typeof categoryPath !== 'string') continue;
      
      const parts = categoryPath.split('/');
      if (parts.length >= 2) {
        const [categorySlug, subcategorySlug] = parts;
        
        // Count recipes for this category/subcategory combination
        const recipeCount = await db.collection('recipes').countDocuments({
          status: "published",
          categoryPath: categoryPath
        });
        
        // If category doesn't exist, create it as dynamic
        if (!categoryStructure[categorySlug]) {
          categoryStructure[categorySlug] = {
            slug: categorySlug,
            title: formatSlugToTitle(categorySlug),
            description: `${formatSlugToTitle(categorySlug)} receptai`,
            image: `/images/categories/${categorySlug}.jpg`,
            icon: '🍽️',
            order: 999,
            type: 'dynamic',
            subcategories: {}
          };
        }
        
        // Add or update subcategory
        if (!categoryStructure[categorySlug].subcategories[subcategorySlug]) {
          categoryStructure[categorySlug].subcategories[subcategorySlug] = {
            slug: subcategorySlug,
            title: formatSlugToTitle(subcategorySlug),
            description: `${formatSlugToTitle(subcategorySlug)} receptai`,
            image: `/images/subcategories/${subcategorySlug}.jpg`,
            recipeCount: 0,
            type: 'dynamic'
          };
        }
        
        // Update recipe count
        categoryStructure[categorySlug].subcategories[subcategorySlug].recipeCount = recipeCount;
      }
    }
    
    // Convert to array and sort
    const categoriesArray = Object.values(categoryStructure)
      .sort((a: any, b: any) => a.order - b.order);
    
    // Add total recipe counts for categories
    for (const category of categoriesArray) {
      const totalRecipes = await db.collection('recipes').countDocuments({
        status: "published",
        categoryPath: new RegExp(`^${category.slug}/`)
      });
      
      (category as any).totalRecipes = totalRecipes;
      
      // Convert subcategories to array and sort by recipe count
      (category as any).subcategories = Object.values((category as any).subcategories)
        .sort((a: any, b: any) => b.recipeCount - a.recipeCount);
    }
    
    res.status(200).json({
      success: true,
      data: {
        categories: categoriesArray,
        totalCategories: categoriesArray.length,
        totalSubcategories: categoriesArray.reduce((sum: number, cat: any) => 
          sum + cat.subcategories.length, 0
        )
      }
    });

  } catch (error) {
    console.error('Categories discovery error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to discover categories' 
    });
  }
}

// Helper function to format slug to readable title
function formatSlugToTitle(slug: string): string {
  // Lithuanian slug to title mapping
  const lithuanianMappings: { [key: string]: string } = {
    'karsti-patiekalai': 'Karšti patiekalai',
    'saldumynai': 'Saldumynai',
    'sriubos': 'Sriubos',
    'salotai': 'Salotai',
    'uzkandziai': 'Užkandžiai',
    'gerimai': 'Gėrimai',
    'apkepai': 'Apkepai',
    'trokiniai': 'Troškinti patiekalai',
    'kepsniai': 'Kepsniai',
    'tortai': 'Tortai',
    'pyragai': 'Pyragai',
    'sausainiai': 'Sausainiai',
    'darzeoviu-sriubos': 'Daržovių sriubos',
    'mesos-sriubos': 'Mėsos sriubos',
    'zuvies-patiekalai': 'Žuvies patiekalai',
    'vegetariski-patiekalai': 'Vegetariški patiekalai',
    'veganiski-patiekalai': 'Veganiški patiekalai'
  };
  
  // Check if we have a predefined mapping
  if (lithuanianMappings[slug]) {
    return lithuanianMappings[slug];
  }
  
  // Otherwise, format the slug
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Helper function to generate SEO-friendly description
function generateCategoryDescription(categoryTitle: string, recipeCount: number): string {
  return `Atraskite ${recipeCount} ${categoryTitle.toLowerCase()} receptų. Skanūs ir lengvi receptai su detaliais gaminimo instrukcijomis.`;
}
