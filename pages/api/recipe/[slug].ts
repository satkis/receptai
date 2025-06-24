// API endpoint for individual recipe by slug
// GET /api/recipe/[slug]

import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import { recipeApiSecurity } from '../../../lib/security';

async function recipeHandler(req: NextApiRequest, res: NextApiResponse) {

  try {
    const { slug } = req.query;

    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ message: 'Recipe slug is required' });
    }

    // 🚀 Use shared MongoDB client for better performance
    const client = await clientPromise;
    const db = client.db();

    // Get recipe by slug
    const recipe = await db.collection('recipes_new').findOne({ slug });

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Get related recipes by tags (limit to 6)
    const relatedRecipes = await db.collection('recipes_new')
      .find({ 
        tags: { $in: recipe.tags || [] },
        _id: { $ne: recipe._id }
      })
      .limit(6)
      .toArray();

    // ✅ Don't close shared client - it's managed by the connection pool

    res.status(200).json({
      recipe,
      relatedRecipes
    });

  } catch (error) {
    console.error('Recipe API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Export the secured handler
export default recipeApiSecurity(recipeHandler);
