// API endpoint for individual recipe by slug
// GET /api/recipe/[slug]

import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { slug } = req.query;

    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ message: 'Recipe slug is required' });
    }

    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db();

    // Get recipe by slug
    const recipe = await db.collection('recipes_new').findOne({ slug });

    if (!recipe) {
      await client.close();
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

    await client.close();

    res.status(200).json({
      recipe,
      relatedRecipes
    });

  } catch (error) {
    console.error('Recipe API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
