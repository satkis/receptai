import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongoose';
import Recipe from '@/models/Recipe';
import { ApiResponse } from '@/types';

interface SearchSuggestion {
  type: 'recipe' | 'ingredient' | 'category';
  title: string;
  slug?: string;
  category?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} not allowed`,
    });
  }

  await dbConnect();

  try {
    const { q, language = 'lt' } = req.query;

    if (!q || typeof q !== 'string' || q.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Paieškos užklausa turi būti bent 2 simbolių ilgio',
      });
    }

    const searchQuery = q.trim();
    const suggestions: SearchSuggestion[] = [];

    // Search for recipes by title
    const recipeMatches = await Recipe.find({
      isPublished: true,
      language: language,
      title: { $regex: searchQuery, $options: 'i' },
    })
      .select('title slug')
      .limit(5)
      .lean();

    recipeMatches.forEach((recipe) => {
      suggestions.push({
        type: 'recipe',
        title: recipe.title,
        slug: recipe.slug,
      });
    });

    // Search for recipes by ingredients
    const ingredientMatches = await Recipe.find({
      isPublished: true,
      language: language,
      'ingredients.name': { $regex: searchQuery, $options: 'i' },
    })
      .select('title slug ingredients')
      .limit(3)
      .lean();

    ingredientMatches.forEach((recipe) => {
      const matchingIngredients = recipe.ingredients.filter((ing) =>
        ing.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      matchingIngredients.forEach((ingredient) => {
        if (!suggestions.some(s => s.title === ingredient.name && s.type === 'ingredient')) {
          suggestions.push({
            type: 'ingredient',
            title: ingredient.name,
          });
        }
      });
    });

    // Search for categories
    const categories = [
      'Pirmieji patiekalai',
      'Antrieji patiekalai',
      'Saldumynai',
      'Užkandžiai',
      'Gėrimai',
      'Salotos',
    ];

    categories.forEach((category) => {
      if (category.toLowerCase().includes(searchQuery.toLowerCase())) {
        suggestions.push({
          type: 'category',
          title: category,
          category: category.toLowerCase().replace(/\s+/g, '-'),
        });
      }
    });

    // Limit total suggestions
    const limitedSuggestions = suggestions.slice(0, 8);

    return res.status(200).json({
      success: true,
      data: {
        suggestions: limitedSuggestions,
        query: searchQuery,
      },
    });
  } catch (error) {
    console.error('Search suggestions error:', error);
    return res.status(500).json({
      success: false,
      error: 'Nepavyko gauti paieškos pasiūlymų',
    });
  }
}
