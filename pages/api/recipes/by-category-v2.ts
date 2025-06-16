// Optimized API endpoint for category-based recipe filtering with time filters
// Performance-optimized for 10k+ recipes with compound indexes and caching

import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';
import { buildTimeQuery, getTimeFilterCounts } from '../../../utils/timeCategories';

interface RecipeQuery {
  allCategories: string;
  timeCategory?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { 
      categoryPath, 
      timeFilter, 
      page = '1', 
      limit = '12',
      sort = 'newest'
    } = req.query;

    if (!categoryPath || typeof categoryPath !== 'string') {
      return res.status(400).json({ message: 'Category path is required' });
    }

    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db();

    // Build recipe query
    const recipeQuery: RecipeQuery = {
      allCategories: categoryPath
    };

    // Add time filter if specified
    if (timeFilter && typeof timeFilter === 'string') {
      recipeQuery.timeCategory = timeFilter;
    }

    // Build sort criteria
    let sortCriteria: any = { publishedAt: -1 }; // Default: newest
    
    switch (sort) {
      case 'rating':
        sortCriteria = { 'rating.average': -1, 'rating.count': -1 };
        break;
      case 'time':
        sortCriteria = { totalTimeMinutes: 1 };
        break;
      case 'popular':
        sortCriteria = { 'rating.count': -1, 'rating.average': -1 };
        break;
      case 'alphabetical':
        sortCriteria = { 'title.lt': 1 };
        break;
    }

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Get recipes and total count
    const [recipes, totalCount] = await Promise.all([
      db.collection('recipes_new')
        .find(recipeQuery)
        .sort(sortCriteria)
        .skip(skip)
        .limit(limitNum)
        .project({
          slug: 1,
          title: 1,
          description: 1,
          image: 1,
          totalTimeMinutes: 1,
          servings: 1,
          tags: 1,
          rating: 1,
          difficulty: 1,
          timeCategory: 1,
          publishedAt: 1
        })
        .toArray(),
      db.collection('recipes_new').countDocuments(recipeQuery)
    ]);

    // Get available time filters for this category
    const availableTimeFilters = await getTimeFilterCounts(db, {
      allCategories: categoryPath
    });

    await client.close();

    // Build response
    const response = {
      recipes,
      pagination: {
        current: pageNum,
        total: totalCount,
        pages: Math.ceil(totalCount / limitNum),
        hasNext: pageNum * limitNum < totalCount,
        hasPrev: pageNum > 1
      },
      availableTimeFilters,
      activeTimeFilter: timeFilter || null,
      sort
    };

    // Cache for 5 minutes
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    res.status(200).json(response);

  } catch (error) {
    console.error('Error fetching recipes by category:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
