import type { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '@/lib/mongodb'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const { slug } = req.query;
      const { language = 'lt' } = req.query;

      if (!slug || typeof slug !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Recipe slug is required'
        });
      }

      const client = await clientPromise;
      const db = client.db(process.env.MONGODB_DB || 'receptai');
      
      // Find recipe by slug
      const recipe = await db
        .collection('recipes')
        .findOne({ 
          slug: slug,
          status: 'public'
        });

      if (!recipe) {
        return res.status(404).json({
          success: false,
          error: 'Recipe not found'
        });
      }

      // Transform MongoDB data for frontend
      const transformedRecipe = {
        id: recipe._id.toString(),
        slug: recipe.slug,
        title: recipe.title || { lt: 'No title', en: 'No title' },
        description: recipe.description || { lt: 'No description', en: 'No description' },
        image: recipe.image || { url: '/images/placeholder-recipe.jpg' },
        
        // Time fields
        prepTimeMinutes: recipe.prepTimeMinutes || 0,
        cookTimeMinutes: recipe.cookTimeMinutes || 0,
        totalTimeMinutes: recipe.totalTimeMinutes || 30,
        
        // Servings
        servings: recipe.servings || { amount: 4, unit: { lt: 'porcijos', en: 'servings' } },
        
        // Ingredients with proper structure
        ingredients: recipe.ingredients?.map((ing: any) => ({
          name: ing.name || { lt: 'Ingredient', en: 'Ingredient' },
          amount: ing.amount || 1,
          unit: ing.unit || { lt: '', en: '' }
        })) || [],
        
        // Instructions
        instructions: recipe.instructions?.map((inst: any) => ({
          step: inst.step || 1,
          text: inst.text || { lt: 'Step', en: 'Step' }
        })) || [],

        // Nutrition
        nutrition: recipe.nutrition || {
          calories: '0 kcal',
          protein: '0g',
          fat: '0g',
          carbohydrates: '0g'
        },
        
        // Rating
        rating: recipe.rating || { average: 0, count: 0 },
        
        // Author
        author: recipe.author || { name: 'Receptai.lt' },
        
        // SEO and categorization
        keywords: recipe.keywords || [],
        categories: recipe.categories || [],
        filters: recipe.filters || {
          cuisine: 'lithuanian',
          mealType: 'main-course',
          dietary: []
        },
        
        // Metadata
        createdAt: recipe.createdAt || new Date().toISOString(),
        updatedAt: recipe.updatedAt || new Date().toISOString(),
        
        // Group information
        groupIds: recipe.groupIds || [],
        groupLabels: recipe.groupLabels || []
      };

      // Set cache headers for better SEO
      res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
      
      res.status(200).json({
        success: true,
        data: transformedRecipe
      });

    } catch (error) {
      console.error('Error fetching recipe:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch recipe',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
