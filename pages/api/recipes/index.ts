import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';
import { ApiResponse } from '@/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
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
      timeFilter,
      tags,
      sort = 'newest',
      search,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const client = await clientPromise;
    const db = client.db();

    // Build filter object using new schema
    const filter: any = {};

    if (category) {
      filter.allCategories = category;
    }

    if (timeFilter) {
      filter.timeCategory = timeFilter;
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      filter.tags = { $in: tagArray };
    }

    if (search) {
      filter.$text = { $search: search as string };
    }

    // Build sort object
    let sortObj: any = {};
    switch (sort) {
      case 'newest':
        sortObj = { publishedAt: -1 };
        break;
      case 'oldest':
        sortObj = { publishedAt: 1 };
        break;
      case 'rating':
        sortObj = { 'rating.average': -1, 'rating.count': -1 };
        break;
      case 'time-asc':
        sortObj = { totalTimeMinutes: 1 };
        break;
      case 'time-desc':
        sortObj = { totalTimeMinutes: -1 };
        break;
      default:
        sortObj = { publishedAt: -1 };
    }

    // Execute query
    const [recipes, totalCount] = await Promise.all([
      db.collection('recipes_new')
        .find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .toArray(),
      db.collection('recipes_new').countDocuments(filter),
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
    const requiredFields = ['title', 'description', 'ingredients', 'instructions'];
    for (const field of requiredFields) {
      if (!recipeData[field]) {
        return res.status(400).json({
          success: false,
          error: `Laukas "${field}" yra privalomas`,
        });
      }
    }

    const client = await clientPromise;
    const db = client.db();

    // Generate slug from Lithuanian title
    const baseSlug = recipeData.title.lt
      .toLowerCase()
      .replace(/[ąčęėįšųūž]/g, (char: string) => {
        const map: Record<string, string> = {
          'ą': 'a', 'č': 'c', 'ę': 'e', 'ė': 'e', 'į': 'i',
          'š': 's', 'ų': 'u', 'ū': 'u', 'ž': 'z'
        };
        return map[char] || char;
      })
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let slug = baseSlug;
    let counter = 1;

    // Ensure unique slug
    while (await db.collection('recipes_new').findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Calculate time category
    const totalTime = recipeData.prepTimeMinutes + recipeData.cookTimeMinutes;
    let timeCategory = 'virs-2-val';
    if (totalTime <= 30) timeCategory = 'iki-30-min';
    else if (totalTime <= 60) timeCategory = '30-60-min';
    else if (totalTime <= 120) timeCategory = '1-2-val';

    // Create recipe with new schema
    const recipe = {
      ...recipeData,
      slug,
      totalTimeMinutes: totalTime,
      timeCategory,
      allCategories: recipeData.allCategories || [],
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('recipes_new').insertOne(recipe);

    return res.status(201).json({
      success: true,
      data: { ...recipe, _id: result.insertedId },
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
