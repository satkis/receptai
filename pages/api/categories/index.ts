// API endpoint for fetching categories
// GET /api/categories - Returns all categories with hierarchy

import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await client.connect();
    const db = client.db('receptai');
    const categoriesCollection = db.collection('categories_new');

    // Get all active categories, sorted by order
    const categories = await categoriesCollection
      .find({ isActive: true })
      .sort({ order: 1 })
      .toArray();

    // Group categories by type
    const mainCategories = categories.filter(cat => cat.type === 'main-category');
    const filterCategories = categories.filter(cat => cat.type === 'filter-category');

    // Get recipe counts for each category
    const recipesCollection = db.collection('recipes_new');
    
    // Add recipe counts to categories using new schema
    for (const category of categories) {
      const count = await recipesCollection.countDocuments({
        allCategories: category.path
      });
      category.recipeCount = count;
    }

    res.status(200).json({
      success: true,
      data: {
        categories,
        totalCategories: categories.length
      }
    });

  } catch (error) {
    console.error('Categories API error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch categories' 
    });
  } finally {
    await client.close();
  }
}
