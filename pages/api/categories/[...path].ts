// API endpoint for category data
// GET /api/categories/path/to/category

import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise, { DATABASE_NAME } from '../../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { path } = req.query;
    
    if (!path || !Array.isArray(path)) {
      return res.status(400).json({ message: 'Category path is required' });
    }

    const categoryPath = path.join('/');

    const client = await clientPromise;
    const db = client.db(DATABASE_NAME);

    // Get category data
    const category = await db.collection('categories_new').findOne({ path: categoryPath });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Get subcategories
    const subcategories = await db.collection('categories_new')
      .find({ 
        parentId: category._id,
        isActive: true
      })
      .sort({ sortOrder: 1, 'title.lt': 1 })
      .toArray();

    // Get recipe count for this category and all subcategories
    const totalRecipeCount = await db.collection('recipes_new').countDocuments({
      categoryPath: { $regex: `^${categoryPath}` }
    });

    // Update category recipe count if it's different
    if (category.recipeCount !== totalRecipeCount) {
      await db.collection('categories_new').updateOne(
        { _id: category._id },
        { $set: { recipeCount: totalRecipeCount, updatedAt: new Date() } }
      );
      category.recipeCount = totalRecipeCount;
    }

    // Get popular tags for this category
    const popularTags = await getPopularTagsForCategory(db, categoryPath);

    // Get featured recipes (highest rated)
    const featuredRecipes = await db.collection('recipes_new')
      .find({ 
        categoryPath: { $regex: `^${categoryPath}` },
        'rating.count': { $gte: 3 }
      })
      .sort({ 'rating.average': -1, 'rating.count': -1 })
      .limit(6)
      .toArray();

    // ✅ Don't close shared client - it's managed by the connection pool

    res.status(200).json({
      category,
      subcategories,
      totalRecipeCount,
      popularTags,
      featuredRecipes
    });

  } catch (error) {
    console.error('Categories API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Helper function to get popular tags for a category
async function getPopularTagsForCategory(db: any, categoryPath: string) {
  try {
    const tagAggregation = await db.collection('recipes_new').aggregate([
      { $match: { categoryPath: { $regex: `^${categoryPath}` } } },
      { $unwind: '$tags' },
      { 
        $group: { 
          _id: '$tags', 
          count: { $sum: 1 },
          avgRating: { $avg: '$rating.average' }
        } 
      },
      { $sort: { count: -1, avgRating: -1 } },
      { $limit: 10 }
    ]).toArray();

    return tagAggregation.map(tag => ({
      name: tag._id,
      count: tag.count,
      avgRating: tag.avgRating || 0
    }));

  } catch (error) {
    console.error('Error getting popular tags:', error);
    return [];
  }
}
