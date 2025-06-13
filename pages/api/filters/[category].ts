// Filter Definitions API for Category Pages
// GET /api/filters/[category] - Returns available filters for a specific category page

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    
    const { category, language = 'lt' } = req.query;

    // Get page configuration for this category
    const pageConfig = await db.collection('page_configs').findOne({ 
      slug: category as string,
      active: true 
    });

    if (!pageConfig) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Get base filter for this category
    const baseFilter = {
      status: 'public',
      [`categories.${pageConfig.category}`]: pageConfig.categoryValue
    };

    // Get filter counts for recipes in this category
    const filterCounts = await getFilterCounts(db, baseFilter);

    // Get filter definitions with labels and styling
    const filterDefinitions = await db.collection('filter_definitions')
      .find({ active: true })
      .sort({ type: 1, order: 1 })
      .toArray();

    // Build response with available filters for this category
    const availableFilters: any = {};

    pageConfig.quickFilters.forEach((quickFilter: any) => {
      const filterType = quickFilter.type;
      const counts = filterCounts[filterType] || [];
      
      availableFilters[filterType] = {
        label: quickFilter.label,
        order: quickFilter.order,
        options: quickFilter.values.map((value: string) => {
          const definition = filterDefinitions.find(def => def.key === value);
          const countData = counts.find((c: any) => c._id === value);
          
          return {
            key: value,
            label: definition?.label?.[language as string] || definition?.label?.lt || value,
            icon: definition?.icon,
            color: definition?.color,
            count: countData?.count || 0,
            active: true
          };
        }).filter((option: any) => option.count > 0) // Only show options with results
      };
    });

    // Add category metadata
    const categoryInfo = {
      slug: pageConfig.slug,
      title: pageConfig.seo.title,
      description: pageConfig.seo.description,
      category: pageConfig.category,
      categoryValue: pageConfig.categoryValue,
      canonicalUrl: pageConfig.seo.canonicalUrl
    };

    return res.status(200).json({
      success: true,
      data: {
        category: categoryInfo,
        filters: availableFilters,
        totalRecipes: await db.collection('recipes_new').countDocuments(baseFilter),
        language: language as string
      }
    });

  } catch (error) {
    console.error('Filters API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

async function getFilterCounts(db: Db, baseFilter: any) {
  const pipeline = [
    { $match: baseFilter },
    {
      $facet: {
        timeRequired: [
          { 
            $group: { 
              _id: '$categories.timeRequired', 
              count: { $sum: 1 } 
            } 
          }
        ],
        dietary: [
          { 
            $unwind: { 
              path: '$categories.dietary', 
              preserveNullAndEmptyArrays: true 
            } 
          },
          { 
            $match: { 
              'categories.dietary': { $ne: null } 
            } 
          },
          { 
            $group: { 
              _id: '$categories.dietary', 
              count: { $sum: 1 } 
            } 
          }
        ],
        cuisine: [
          { 
            $unwind: { 
              path: '$categories.cuisine', 
              preserveNullAndEmptyArrays: true 
            } 
          },
          { 
            $match: { 
              'categories.cuisine': { $ne: null } 
            } 
          },
          { 
            $group: { 
              _id: '$categories.cuisine', 
              count: { $sum: 1 } 
            } 
          }
        ],
        mainIngredient: [
          { 
            $unwind: { 
              path: '$categories.mainIngredient', 
              preserveNullAndEmptyArrays: true 
            } 
          },
          { 
            $match: { 
              'categories.mainIngredient': { $ne: null } 
            } 
          },
          { 
            $group: { 
              _id: '$categories.mainIngredient', 
              count: { $sum: 1 } 
            } 
          }
        ],
        mealType: [
          { 
            $unwind: { 
              path: '$categories.mealType', 
              preserveNullAndEmptyArrays: true 
            } 
          },
          { 
            $match: { 
              'categories.mealType': { $ne: null } 
            } 
          },
          { 
            $group: { 
              _id: '$categories.mealType', 
              count: { $sum: 1 } 
            } 
          }
        ],
        customTags: [
          { 
            $unwind: { 
              path: '$categories.customTags', 
              preserveNullAndEmptyArrays: true 
            } 
          },
          { 
            $match: { 
              'categories.customTags': { $ne: null } 
            } 
          },
          { 
            $group: { 
              _id: '$categories.customTags', 
              count: { $sum: 1 } 
            } 
          }
        ]
      }
    }
  ];

  const [result] = await db.collection('recipes_new').aggregate(pipeline).toArray();
  return result || {};
}
