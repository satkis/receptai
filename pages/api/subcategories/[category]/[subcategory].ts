// API endpoint for fetching subcategory data
// GET /api/subcategories/[category]/[subcategory] - Returns subcategory recipes

import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { category, subcategory } = req.query;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 12;
  const language = req.query.language as string || 'lt';

  try {
    await client.connect();
    const db = client.db('receptai');
    const categoriesCollection = db.collection('categories');
    const recipesCollection = db.collection('recipes');

    // Find the main category
    const mainCategory = await categoriesCollection.findOne({
      slug: category,
      status: "active"
    });

    if (!mainCategory) {
      return res.status(404).json({ 
        success: false, 
        error: 'Category not found' 
      });
    }

    // Find the subcategory
    const subcategoryData = mainCategory.subcategories?.find(
      (sub: any) => sub.slug === subcategory
    );

    if (!subcategoryData) {
      return res.status(404).json({
        success: false,
        error: 'Subcategory not found'
      });
    }

    // Build recipe query for subcategory
    const recipeQuery: any = {
      status: "published",
      categoryPath: `${category}/${subcategory}`
    };

    // Apply filters if provided
    const filters = req.query.filters as string;
    if (filters) {
      const filterPairs = filters.split(',');
      for (const pair of filterPairs) {
        const [filterType, values] = pair.split(':');
        const valueArray = values.split(',');

        switch (filterType) {
          case 'timeRequired':
            if (valueArray.includes('15min')) {
              recipeQuery.totalTimeMinutes = { $lte: 15 };
            } else if (valueArray.includes('30min')) {
              recipeQuery.totalTimeMinutes = { $lte: 30 };
            } else if (valueArray.includes('1h')) {
              recipeQuery.totalTimeMinutes = { $lte: 60 };
            } else if (valueArray.includes('2h')) {
              recipeQuery.totalTimeMinutes = { $lte: 120 };
            } else if (valueArray.includes('2h+')) {
              recipeQuery.totalTimeMinutes = { $gt: 120 };
            }
            break;

          case 'cuisine':
            recipeQuery['categories.cuisine'] = { $in: valueArray };
            break;

          case 'dietary':
            recipeQuery['categories.dietary'] = { $in: valueArray };
            break;

          case 'mainIngredient':
            // This would need to be mapped to actual ingredient searches
            // For now, we'll skip this filter in subcategory pages
            break;
        }
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

    // Get available filters for this subcategory
    const availableFilters = await getAvailableFilters(recipesCollection, recipeQuery);

    // Generate SEO data for subcategory
    const subcategoryTitle = `${subcategoryData.title} - ${mainCategory.title} | Paragaujam.lt`;
    const subcategoryDescription = `${subcategoryData.title} receptai iš ${mainCategory.title} kategorijos. Skanūs ir lengvi receptai kiekvienai dienai.`;

    res.status(200).json({
      success: true,
      data: {
        category: {
          ...mainCategory,
          title: mainCategory.title,
          description: mainCategory.description,
          canonicalUrl: `/receptai/${mainCategory.slug}`
        },
        subcategory: {
          label: subcategoryData.title,
          slug: subcategoryData.slug,
          title: subcategoryTitle,
          description: subcategoryDescription
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
    console.error('Subcategory API error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch subcategory data' 
    });
  } finally {
    await client.close();
  }
}

// Helper function to get available filters for a subcategory
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
    timeRequired: {
      label: { lt: 'Laikas', en: 'Time' },
      order: 1,
      options: [
        { key: '15min', label: 'iki 15min', count: 0, active: false },
        { key: '30min', label: 'iki 30min', count: 0, active: false },
        { key: '1h', label: 'iki 1val', count: 0, active: false },
        { key: '2h', label: 'apie 2 val', count: 0, active: false },
        { key: '2h+', label: 'virš 2 val', count: 0, active: false }
      ]
    },
    cuisine: {
      label: { lt: 'Virtuvė', en: 'Cuisine' },
      order: 2,
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
      order: 3,
      options: (data.dietary || [])
        .filter(Boolean)
        .map((diet: string) => ({
          key: diet.toLowerCase().replace(/\s+/g, '-'),
          label: diet,
          count: 0,
          active: false
        }))
    }
  };
}
