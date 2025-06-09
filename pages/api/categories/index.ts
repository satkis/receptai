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
    const categoriesCollection = db.collection('categories');

    // Get all active categories, sorted by order
    const categories = await categoriesCollection
      .find({ isActive: true })
      .sort({ order: 1 })
      .toArray();

    // Group categories by type
    const mainCategories = categories.filter(cat => cat.type === 'main-category');
    const filterCategories = categories.filter(cat => cat.type === 'filter-category');

    // Get recipe counts for each category
    const recipesCollection = db.collection('recipes');
    
    // Add recipe counts to main categories
    for (const category of mainCategories) {
      const count = await recipesCollection.countDocuments({
        'categories.main': category.label.lt
      });
      category.recipeCount = count;

      // Add counts to subcategories
      if (category.subcategories) {
        for (const subcategory of category.subcategories) {
          const subCount = await recipesCollection.countDocuments({
            'categories.main': category.label.lt,
            'categories.sub': subcategory.label
          });
          subcategory.recipeCount = subCount;
        }
      }
    }

    // Add recipe counts to filter categories
    for (const category of filterCategories) {
      let count = 0;
      
      if (category.slug === '15-min-patiekalai') {
        count = await recipesCollection.countDocuments({
          totalTimeMinutes: { $lte: 15 }
        });
      } else if (category.slug === 'be-glitimo') {
        count = await recipesCollection.countDocuments({
          'categories.dietary': 'Be glitimo'
        });
      } else if (category.slug === 'vegetariski') {
        count = await recipesCollection.countDocuments({
          'categories.dietary': 'Vegetariški patiekalai'
        });
      }
      
      category.recipeCount = count;
    }

    res.status(200).json({
      success: true,
      data: {
        mainCategories,
        filterCategories,
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
