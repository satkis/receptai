import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongoose';
import Recipe from '@/models/Recipe';
import { ApiResponse, SearchFilters } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  await dbConnect();

  switch (req.method) {
    case 'GET':
      return getRecipes(req, res);
    case 'POST':
      return createRecipe(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({
        success: false,
        error: `Method ${req.method} not allowed`,
      });
  }
}

async function getRecipes(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  try {
    const {
      page = '1',
      limit = '12',
      category,
      difficulty,
      maxTime,
      tags,
      sort = 'newest',
      featured,
      search,
      language = 'lt',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter object
    const filter: any = {
      isPublished: true,
      language: language,
    };

    if (category) {
      filter.category = category;
    }

    if (difficulty) {
      filter.difficulty = difficulty;
    }

    if (maxTime) {
      filter.totalTime = { $lte: parseInt(maxTime as string) };
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      filter.tags = { $in: tagArray };
    }

    if (featured === 'true') {
      filter.isFeatured = true;
    }

    if (search) {
      filter.$text = { $search: search as string };
    }

    // Build sort object
    let sortObj: any = {};
    switch (sort) {
      case 'newest':
        sortObj = { createdAt: -1 };
        break;
      case 'oldest':
        sortObj = { createdAt: 1 };
        break;
      case 'popular':
        sortObj = { views: -1, saves: -1 };
        break;
      case 'rating':
        sortObj = { averageRating: -1, totalRatings: -1 };
        break;
      case 'time-asc':
        sortObj = { totalTime: 1 };
        break;
      case 'time-desc':
        sortObj = { totalTime: -1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }

    // Execute query
    const [recipes, totalCount] = await Promise.all([
      Recipe.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .select('-comments -structuredData')
        .lean(),
      Recipe.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    return res.status(200).json({
      success: true,
      data: {
        recipes,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      },
    });
  } catch (error) {
    console.error('Get recipes error:', error);
    return res.status(500).json({
      success: false,
      error: 'Nepavyko gauti receptų',
    });
  }
}

async function createRecipe(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  try {
    const recipeData = req.body;

    // Validate required fields
    const requiredFields = ['title', 'description', 'ingredients', 'instructions', 'image'];
    for (const field of requiredFields) {
      if (!recipeData[field]) {
        return res.status(400).json({
          success: false,
          error: `Laukas "${field}" yra privalomas`,
        });
      }
    }

    // Generate slug
    const baseSlug = recipeData.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let slug = baseSlug;
    let counter = 1;

    // Ensure unique slug
    while (await Recipe.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create recipe
    const recipe = new Recipe({
      ...recipeData,
      slug,
      totalTime: recipeData.prepTime + recipeData.cookTime,
    });

    await recipe.save();

    return res.status(201).json({
      success: true,
      data: recipe,
      message: 'Receptas sėkmingai sukurtas',
    });
  } catch (error) {
    console.error('Create recipe error:', error);
    return res.status(500).json({
      success: false,
      error: 'Nepavyko sukurti recepto',
    });
  }
}
