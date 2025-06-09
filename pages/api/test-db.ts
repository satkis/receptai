// Test API endpoint to verify database connection and recipe data
// GET /api/test-db

import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Testing database connection...');
    
    await client.connect();
    const db = client.db('receptai');
    const recipesCollection = db.collection('recipes');

    // Get all recipes
    const allRecipes = await recipesCollection.find({}).toArray();
    console.log('Total recipes found:', allRecipes.length);

    // Look for our test recipe
    const testRecipe = await recipesCollection.findOne({ slug: 'recipe-slug-here' });
    console.log('Test recipe found:', testRecipe ? 'YES' : 'NO');

    // Check for recipes with categoryPath
    const recipesWithCategoryPath = await recipesCollection.find({ 
      categoryPath: { $exists: true } 
    }).toArray();
    console.log('Recipes with categoryPath:', recipesWithCategoryPath.length);

    // Check for our specific categoryPath
    const specificCategoryPath = await recipesCollection.findOne({ 
      categoryPath: 'category-slug/subcategory-slug' 
    });
    console.log('Recipe with our categoryPath found:', specificCategoryPath ? 'YES' : 'NO');

    res.status(200).json({
      success: true,
      data: {
        totalRecipes: allRecipes.length,
        testRecipeExists: !!testRecipe,
        recipesWithCategoryPath: recipesWithCategoryPath.length,
        specificCategoryPathExists: !!specificCategoryPath,
        testRecipeData: testRecipe ? {
          slug: testRecipe.slug,
          categoryPath: testRecipe.categoryPath,
          title: testRecipe.title
        } : null,
        allRecipeSlugs: allRecipes.map(r => r.slug),
        allCategoryPaths: allRecipes.map(r => r.categoryPath).filter(Boolean)
      }
    });

  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Database connection failed',
      details: error.message
    });
  } finally {
    await client.close();
  }
}
