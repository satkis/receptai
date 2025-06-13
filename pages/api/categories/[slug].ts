// API endpoint for fetching specific category data
// GET /api/categories/[slug] - Returns category data and recipes

import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { slug } = req.query;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 12;
  const language = req.query.language as string || 'lt';

  try {
    await client.connect();
    const db = client.db('receptai');
    const categoriesCollection = db.collection('categories_new');
    const recipesCollection = db.collection('recipes_new');

    // Find the category in our enhanced categories collection
    let category = await categoriesCollection.findOne({
      slug: slug,
      status: "active"
    });

    // If category doesn't exist in categories collection, check if recipes exist for this category
    if (!category) {
      const recipesExist = await recipesCollection.countDocuments({
        status: "published",
        categoryPath: new RegExp(`^${slug}/`)
      });

      if (recipesExist === 0) {
        return res.status(404).json({
          success: false,
          error: 'Category not found'
        });
      }

      // Create a dynamic category object
      category = {
        slug: slug,
        title: formatSlugToTitle(slug),
        description: `${formatSlugToTitle(slug)} receptai`,
        image: `/images/categories/${slug}.jpg`,
        icon: '🍽️',
        status: 'active',
        subcategories: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    // Build recipe query for this category
    // All recipes that start with this category path
    const recipeQuery: any = {
      status: "published",
      categoryPath: new RegExp(`^${slug}/`)
    };

    // Get total count
    const totalRecipes = await recipesCollection.countDocuments(recipeQuery);

    // Get paginated recipes
    const skip = (page - 1) * limit;
    const recipes = await recipesCollection
      .find(recipeQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Calculate pagination
    const totalPages = Math.ceil(totalRecipes / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Get available filters for this category
    const availableFilters = await getAvailableFilters(recipesCollection, recipeQuery);

    res.status(200).json({
      success: true,
      data: {
        category: {
          ...category,
          title: category.seo?.metaTitle || category.title,
          description: category.seo?.metaDescription || category.description,
          canonicalUrl: `/receptai/${category.slug}`
        },
        recipes,
        pagination: {
          currentPage: page,
          totalPages,
          totalRecipes,
          hasNextPage,
          hasPrevPage,
          limit
        },
        availableFilters
      }
    });

  } catch (error) {
    console.error('Category API error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch category data' 
    });
  } finally {
    await client.close();
  }
}

// Helper function to get available filters for a category
async function getAvailableFilters(recipesCollection: any, baseQuery: any) {
  const pipeline = [
    { $match: baseQuery },
    {
      $group: {
        _id: null,
        cuisines: { $addToSet: '$categories.cuisine' },
        dietary: { $addToSet: { $arrayElemAt: ['$categories.dietary', 0] } },
        timeGroups: { $addToSet: '$categories.timeGroup' }
      }
    }
  ];

  const result = await recipesCollection.aggregate(pipeline).toArray();
  
  if (result.length === 0) {
    return {
      cuisine: { label: { lt: 'Virtuvė', en: 'Cuisine' }, order: 1, options: [] },
      dietary: { label: { lt: 'Mityba', en: 'Diet' }, order: 2, options: [] },
      timeRequired: { label: { lt: 'Laikas', en: 'Time' }, order: 3, options: [] }
    };
  }

  const data = result[0];

  return {
    cuisine: {
      label: { lt: 'Virtuvė', en: 'Cuisine' },
      order: 1,
      options: (data.cuisines || [])
        .filter(Boolean)
        .map((cuisine: string) => ({
          key: cuisine.toLowerCase().replace(/\s+/g, '-'),
          label: cuisine,
          count: 0,
          active: false
        }))
    },
    dietary: {
      label: { lt: 'Mityba', en: 'Diet' },
      order: 2,
      options: (data.dietary || [])
        .filter(Boolean)
        .map((diet: string) => ({
          key: diet.toLowerCase().replace(/\s+/g, '-'),
          label: diet,
          count: 0,
          active: false
        }))
    },
    timeRequired: {
      label: { lt: 'Laikas', en: 'Time' },
      order: 3,
      options: (data.timeGroups || [])
        .filter(Boolean)
        .map((time: string) => ({
          key: time.toLowerCase().replace(/\s+/g, '-'),
          label: time,
          count: 0,
          active: false
        }))
    }
  };
}

// Helper function to format slug to title
function formatSlugToTitle(slug: string): string {
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
    'karsti-barsčiai': 'Karšti barščiai',
    'salti-barsčiai': 'Šalti barščiai'
  };

  return lithuanianMappings[slug] || slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
