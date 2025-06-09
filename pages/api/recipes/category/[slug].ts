// Enhanced Category-based Recipe Filtering API
// Optimized for instant filtering with compound indexes
// GET /api/recipes/category/[slug]?filters=timeRequired:30min,dietary:vegetariski

import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI!;
const MONGODB_DB = process.env.MONGODB_DB || 'receptai';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(MONGODB_DB);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

interface FilterQuery {
  timeRequired?: string;
  dietary?: string[];
  cuisine?: string[];
  mainIngredient?: string[];
  mealType?: string[];
  customTags?: string[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    
    const { 
      slug,
      filters,
      page = '1',
      limit = '8',
      sort = 'newest',
      language = 'lt'
    } = req.query;

    // Get page configuration
    const pageConfig = await db.collection('page_configs').findOne({
      slug: slug as string,
      active: true
    });

    if (!pageConfig) {
      // Create a temporary fallback for testing
      const fallbackPageConfig = {
        slug: slug as string,
        category: 'mealType',
        categoryValue: slug as string,
        seo: {
          title: `${slug} receptai - Paragaujam.lt`,
          description: `Skanūs ${slug} receptai`,
          canonicalUrl: `/receptai/${slug}`
        },
        quickFilters: []
      };

      // Return minimal response for testing
      return res.status(200).json({
        success: true,
        data: {
          recipes: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalCount: 0,
            hasNextPage: false,
            hasPrevPage: false
          },
          category: {
            slug: fallbackPageConfig.slug,
            title: fallbackPageConfig.seo.title,
            description: fallbackPageConfig.seo.description,
            canonicalUrl: fallbackPageConfig.seo.canonicalUrl
          },
          appliedFilters: {
            category: fallbackPageConfig.categoryValue
          },
          availableFilters: {},
          performance: {
            queryTime: Date.now()
          }
        }
      });
    }

    // Build base filter from page category
    const baseFilter: any = {
      status: 'public',
      [`categories.${pageConfig.category}`]: pageConfig.categoryValue
    };

    // Parse additional filters from query
    const additionalFilters = parseFilters(filters as string);
    
    // Build MongoDB query with compound filtering
    const mongoFilter = buildMongoFilter(baseFilter, additionalFilters);
    
    // Build aggregation pipeline for optimal performance
    const pipeline = [
      { $match: mongoFilter },
      {
        $lookup: {
          from: 'groups',
          localField: 'groupIds',
          foreignField: '_id',
          as: 'groups'
        }
      },
      {
        $addFields: {
          // Calculate relevance score for better sorting
          relevanceScore: {
            $add: [
              { $multiply: [{ $ifNull: ['$rating.average', 0] }, 2] },
              { $divide: [{ $ifNull: ['$rating.count', 0] }, 10] },
              { $cond: [{ $gte: ['$timing.totalTimeMinutes', 60] }, -0.5, 0.5] }
            ]
          }
        }
      },
      { $sort: getSortObject(sort as string) },
      { $skip: (parseInt(page as string) - 1) * parseInt(limit as string) },
      { $limit: parseInt(limit as string) },
      {
        $project: {
          _id: 1,
          slug: 1,
          title: 1,
          description: 1,
          image: 1,
          timing: 1,
          servings: 1,
          ingredients: { $slice: ['$ingredients', 3] }, // Only first 3 ingredients
          categories: 1,
          rating: 1,
          groups: { $map: { input: '$groups', as: 'group', in: '$$group.label' } },
          relevanceScore: 1
        }
      }
    ];

    // Execute main query
    const recipes = await db.collection('recipes').aggregate(pipeline).toArray();

    // Get total count for pagination (optimized separate query)
    const totalCount = await db.collection('recipes').countDocuments(mongoFilter);

    // Get available filter options for this category (for UI)
    const availableFilters = await getAvailableFilters(db, mongoFilter, pageConfig, Array.isArray(language) ? language[0] : language);

    // Debug logging (commented out for production)
    // console.log('Available filters:', JSON.stringify(availableFilters, null, 2));

    // Transform recipes for frontend
    const transformedRecipes = recipes.map(recipe => transformRecipe(recipe, language as string));

    // Calculate pagination
    const currentPage = parseInt(page as string);
    const pageLimit = parseInt(limit as string);
    const totalPages = Math.ceil(totalCount / pageLimit);

    return res.status(200).json({
      success: true,
      data: {
        recipes: transformedRecipes,
        pagination: {
          currentPage,
          totalPages,
          totalCount,
          hasNextPage: currentPage < totalPages,
          hasPrevPage: currentPage > 1
        },
        category: {
          slug: pageConfig.slug,
          title: pageConfig.seo.title,
          description: pageConfig.seo.description,
          canonicalUrl: pageConfig.seo.canonicalUrl
        },
        appliedFilters: {
          category: pageConfig.categoryValue,
          ...additionalFilters
        },
        availableFilters,
        performance: {
          queryTime: Date.now() // For monitoring
        }
      }
    });

  } catch (error) {
    console.error('Category API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
}

function parseFilters(filtersString: string): FilterQuery {
  if (!filtersString) return {};
  
  const filters: FilterQuery = {};
  const filterPairs = filtersString.split(',');
  
  filterPairs.forEach(pair => {
    const [key, value] = pair.split(':');
    if (key && value) {
      if (key === 'timeRequired') {
        filters.timeRequired = value;
      } else if (['dietary', 'cuisine', 'mainIngredient', 'mealType', 'customTags'].includes(key)) {
        if (!filters[key as keyof FilterQuery]) {
          filters[key as keyof FilterQuery] = [];
        }
        (filters[key as keyof FilterQuery] as string[]).push(value);
      }
    }
  });
  
  return filters;
}

function buildMongoFilter(baseFilter: any, additionalFilters: FilterQuery): any {
  const filter = { ...baseFilter };

  // Time filter (based on totalTimeMinutes ranges)
  if (additionalFilters.timeRequired) {
    const timeFilter = additionalFilters.timeRequired;

    switch (timeFilter) {
      case "15min":
        // iki 15min: 0 < totalTimeMinutes <= 15
        filter['timing.totalTimeMinutes'] = { $lte: 15, $gt: 0 };
        break;
      case "30min":
        // iki 30min: 15 < totalTimeMinutes <= 30
        filter['timing.totalTimeMinutes'] = { $lte: 30, $gt: 15 };
        break;
      case "1h":
        // iki 1val: 30 < totalTimeMinutes <= 60
        filter['timing.totalTimeMinutes'] = { $lte: 60, $gt: 30 };
        break;
      case "2h":
        // apie 2val: 60 < totalTimeMinutes <= 120 OR missing/invalid times
        filter.$or = [
          { 'timing.totalTimeMinutes': { $lte: 120, $gt: 60 } },
          { 'timing.totalTimeMinutes': { $exists: false } },
          { 'timing.totalTimeMinutes': { $lte: 0 } }
        ];
        break;
      case "2h+":
        // virš 2val: totalTimeMinutes > 120
        filter['timing.totalTimeMinutes'] = { $gt: 120 };
        break;
      default:
        // Fallback: no time filter applied
        break;
    }
  }

  // Array filters (must contain at least one of the selected values)
  ['dietary', 'cuisine', 'mainIngredient', 'mealType', 'customTags'].forEach(filterType => {
    if (additionalFilters[filterType as keyof FilterQuery]?.length) {
      filter[`categories.${filterType}`] = { 
        $in: additionalFilters[filterType as keyof FilterQuery] 
      };
    }
  });

  return filter;
}

function getSortObject(sort: string) {
  switch (sort) {
    case 'rating': 
      return { 'rating.average': -1, 'rating.count': -1, relevanceScore: -1 };
    case 'time-asc': 
      return { 'timing.totalTimeMinutes': 1, relevanceScore: -1 };
    case 'time-desc': 
      return { 'timing.totalTimeMinutes': -1, relevanceScore: -1 };
    case 'relevance':
      return { relevanceScore: -1, 'rating.average': -1 };
    case 'newest':
    default: 
      return { createdAt: -1, relevanceScore: -1 };
  }
}

async function getAvailableFilters(db: Db, baseFilter: any, pageConfig: any, language: string = 'lt') {
  // Get filter counts for this specific category
  const pipeline = [
    { $match: baseFilter },
    {
      $facet: {
        timeRequired: [
          {
            $addFields: {
              calculatedTimeRequired: {
                $switch: {
                  branches: [
                    { case: { $and: [{ $gt: ['$timing.totalTimeMinutes', 0] }, { $lte: ['$timing.totalTimeMinutes', 15] }] }, then: '15min' },
                    { case: { $and: [{ $gt: ['$timing.totalTimeMinutes', 15] }, { $lte: ['$timing.totalTimeMinutes', 30] }] }, then: '30min' },
                    { case: { $and: [{ $gt: ['$timing.totalTimeMinutes', 30] }, { $lte: ['$timing.totalTimeMinutes', 60] }] }, then: '1h' },
                    { case: { $and: [{ $gt: ['$timing.totalTimeMinutes', 60] }, { $lte: ['$timing.totalTimeMinutes', 120] }] }, then: '2h' },
                    { case: { $gt: ['$timing.totalTimeMinutes', 120] }, then: '2h+' }
                  ],
                  default: '2h' // For missing or invalid times
                }
              }
            }
          },
          { $group: { _id: '$calculatedTimeRequired', count: { $sum: 1 } } }
        ],
        dietary: [
          { $unwind: { path: '$categories.dietary', preserveNullAndEmptyArrays: true } },
          { $group: { _id: '$categories.dietary', count: { $sum: 1 } } }
        ],
        cuisine: [
          { $unwind: { path: '$categories.cuisine', preserveNullAndEmptyArrays: true } },
          { $group: { _id: '$categories.cuisine', count: { $sum: 1 } } }
        ],
        mainIngredient: [
          { $unwind: { path: '$categories.mainIngredient', preserveNullAndEmptyArrays: true } },
          { $group: { _id: '$categories.mainIngredient', count: { $sum: 1 } } }
        ]
      }
    }
  ];

  const [filterCounts] = await db.collection('recipes').aggregate(pipeline).toArray();
  
  // Get filter definitions for labels and icons
  const filterDefinitions = await db.collection('filter_definitions')
    .find({ active: true })
    .sort({ type: 1, order: 1 })
    .toArray();

  // Combine counts with definitions
  const availableFilters: any = {};
  
  pageConfig.quickFilters.forEach((quickFilter: any) => {
    const filterType = quickFilter.type;
    const counts = filterCounts[filterType] || [];

    const options = quickFilter.values.map((value: string) => {
      const definition = filterDefinitions.find(def => def.key === value);
      const countData = counts.find((c: any) => c._id === value);

      return {
        key: value,
        label: definition?.label?.[language] || definition?.label?.lt || value,
        icon: definition?.icon,
        color: definition?.color,
        count: countData?.count || 0,
        active: true
      };
    }).filter((filter: any) => filter.count > 0); // Only show filters with results

    // Structure the data as expected by the component
    availableFilters[filterType] = {
      label: quickFilter.label || { lt: filterType, en: filterType },
      order: quickFilter.order || 1,
      options: options
    };
  });

  return availableFilters;
}

// Calculate timeRequired based on totalTimeMinutes
function calculateTimeRequired(totalTimeMinutes: number): string {
  if (!totalTimeMinutes || totalTimeMinutes <= 0) {
    return "2h"; // Default to "apie 2val" for missing/invalid times
  }

  if (totalTimeMinutes <= 15) return "15min";
  if (totalTimeMinutes <= 30) return "30min";
  if (totalTimeMinutes <= 60) return "1h";
  if (totalTimeMinutes <= 120) return "2h";
  return "2h+"; // virš 2val
}

function transformRecipe(recipe: any, language: string) {
  // Calculate timeRequired from totalTimeMinutes
  const calculatedTimeRequired = calculateTimeRequired(recipe.timing?.totalTimeMinutes);

  // Validate and update timeRequired if it doesn't match calculated value
  const currentTimeRequired = recipe.categories?.timeRequired;
  const finalTimeRequired = (currentTimeRequired === calculatedTimeRequired)
    ? currentTimeRequired
    : calculatedTimeRequired;

  return {
    _id: recipe._id,
    slug: recipe.slug,
    title: recipe.title?.[language] || recipe.title?.lt || recipe.title,
    description: recipe.description?.[language] || recipe.description?.lt || recipe.description,
    image: recipe.image,
    timing: recipe.timing,
    servings: recipe.servings,
    ingredients: recipe.ingredients?.map((ing: any) => ({
      name: ing.name?.[language] || ing.name?.lt || ing.name,
      amount: ing.amount,
      unit: ing.unit?.[language] || ing.unit?.lt || ing.unit
    })) || [],
    categories: {
      ...recipe.categories,
      timeRequired: finalTimeRequired // Use calculated/validated value
    },
    rating: recipe.rating,
    groups: recipe.groups || [],
    relevanceScore: recipe.relevanceScore
  };
}
