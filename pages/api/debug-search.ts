import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise, { DATABASE_NAME } from '../../lib/mongodb';
import { buildSearchAggregation } from '../../utils/searchUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { q = 'aitriosios paprikos' } = req.query;
    
    const client = await clientPromise;
    const db = client.db(DATABASE_NAME);
    
    // Test the exact same aggregation used in search page
    const pipeline = buildSearchAggregation(q as string, undefined, undefined, 1, 12);
    
    console.log('🔍 Search pipeline:', JSON.stringify(pipeline, null, 2));
    
    const recipes = await db.collection('recipes_new')
      .aggregate(pipeline)
      .toArray();
    
    console.log(`📋 Found ${recipes.length} recipes`);
    
    const debugInfo = recipes.map(recipe => ({
      slug: recipe.slug,
      title: recipe.title?.lt,
      imageType: typeof recipe.image,
      imageData: recipe.image,
      hasImageSrc: recipe.image?.src ? 'YES' : 'NO',
      imageSrc: recipe.image?.src || 'MISSING'
    }));
    
    res.status(200).json({
      searchTerm: q,
      totalResults: recipes.length,
      debugInfo,
      fullRecipes: recipes
    });
    
  } catch (error) {
    console.error('Debug search error:', error);
    res.status(500).json({ error: error.message });
  }
}
