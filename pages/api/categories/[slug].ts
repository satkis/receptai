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
    const categoriesCollection = db.collection('categories');
    const recipesCollection = db.collection('recipes');

    // Find the category
    const category = await categoriesCollection.findOne({ 
      slug: slug,
      isActive: true 
    });

    if (!category) {
      return res.status(404).json({ 
        success: false, 
        error: 'Category not found' 
      });
    }

    // Build recipe query based on category type
    let recipeQuery: any = {};
    
    if (category.type === 'main-category') {
      recipeQuery['categories.main'] = category.label.lt;
    } else if (category.type === 'filter-category') {
      if (category.slug === '15-min-patiekalai') {
        recipeQuery.totalTimeMinutes = { $lte: 15 };
      } else if (category.slug === 'be-glitimo') {
        recipeQuery['categories.dietary'] = 'Be glitimo';
      } else if (category.slug === 'vegetariski') {
        recipeQuery['categories.dietary'] = 'Vegetariški patiekalai';
      }
    }

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
          title: category.seo.title,
          description: category.seo.description,
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
