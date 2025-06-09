// API endpoint for fetching individual recipe
// GET /api/recipes/[category]/[subcategory]/[recipe] - Returns recipe data

import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { category, subcategory, recipe } = req.query;
  const language = req.query.language as string || 'lt';

  try {
    console.log('Recipe API called with:', { category, subcategory, recipe });

    await client.connect();
    const db = client.db('receptai');
    const recipesCollection = db.collection('recipes');

    const query = {
      slug: recipe,
      categoryPath: `${category}/${subcategory}`
    };

    console.log('MongoDB query:', query);

    // Find the recipe by slug and category path
    const recipeData = await recipesCollection.findOne(query);

    console.log('Recipe found:', recipeData ? 'YES' : 'NO');

    if (!recipeData) {
      console.log('Recipe not found with categoryPath, trying fallback...');

      // Try fallback: find by slug only
      const fallbackRecipe = await recipesCollection.findOne({ slug: recipe });

      console.log('Fallback recipe found:', fallbackRecipe ? 'YES' : 'NO');
      if (fallbackRecipe) {
        console.log('Fallback recipe categoryPath:', fallbackRecipe.categoryPath);
      }

      if (!fallbackRecipe) {
        console.log('No recipe found with slug:', recipe);
        return res.status(404).json({
          success: false,
          error: 'Recipe not found'
        });
      }
      
      // If found by slug but wrong category path, redirect to correct URL
      if (fallbackRecipe.categoryPath && fallbackRecipe.categoryPath !== `${category}/${subcategory}`) {
        return res.status(301).json({
          success: false,
          redirect: `/receptai/${fallbackRecipe.categoryPath}/${fallbackRecipe.slug}`,
          error: 'Recipe moved'
        });
      }
      
      // Use fallback recipe if no category path mismatch
      return res.status(200).json({
        success: true,
        data: fallbackRecipe
      });
    }

    // Verify category and subcategory match
    const expectedCategoryPath = `${category}/${subcategory}`;
    if (recipeData.categoryPath !== expectedCategoryPath) {
      return res.status(404).json({ 
        success: false, 
        error: 'Recipe not found in this category' 
      });
    }

    // Return the recipe data
    res.status(200).json({
      success: true,
      data: recipeData
    });

  } catch (error) {
    console.error('Recipe API error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch recipe' 
    });
  } finally {
    await client.close();
  }
}
