import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // 🚀 Use shared MongoDB client for better performance
    console.log('🔍 Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'NOT SET',
      MONGODB_DB: process.env.MONGODB_DB || 'NOT SET'
    });

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'receptai');

    console.log('🔍 Database info:', {
      dbName: db.databaseName,
      namespace: db.namespace
    });

    console.log('🔍 Fetching categories from categories_new collection...');

    // Fetch all active categories, sorted by sortOrder and level, then by title
    const categories = await db.collection('categories_new')
      .find({
        isActive: true
      })
      .sort({
        sortOrder: 1,    // Primary sort by sortOrder
        level: 1,        // Secondary sort by level
        'title.lt': 1    // Tertiary sort by Lithuanian title
      })
      .toArray();

    console.log(`✅ Found ${categories.length} active categories`);

    // Transform for frontend - matching your exact schema
    const transformedCategories = categories.map(category => ({
      _id: category._id.toString(),
      title: category.title,                    // { lt: "Karštieji patiekalai" }
      slug: category.slug,                      // "karstieji-patiekalai"
      path: category.path,                      // "karstieji-patiekalai"
      level: category.level,                    // 1
      parentPath: category.parentPath,          // null
      isActive: category.isActive,              // true
      sortOrder: category.sortOrder,            // 1
      seo: category.seo,                        // SEO object with metaTitle, metaDescription, etc.
      filters: category.filters,                // Filters object with manual, auto, timeFilters
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    }));

    console.log('📋 Sample transformed category:', transformedCategories[0]);

    res.status(200).json(transformedCategories);
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : 'No stack trace';

    console.error('Error details:', {
      message: errorMessage,
      stack: errorStack
    });
    res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? errorMessage : 'Database error'
    });
  }
  // ✅ Don't close shared client - it's managed by the connection pool
}
