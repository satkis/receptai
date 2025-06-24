// Filter Definitions API for Category Pages
// GET /api/filters/[category] - Returns available filters for a specific category page

import { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';

// Helper function to get time filter labels
function getTimeFilterLabel(timeFilter: string, language: string): string {
  const labels: { [key: string]: { lt: string; en: string } } = {
    'iki-30-min': { lt: 'Iki 30 min', en: 'Up to 30 min' },
    '30-60-min': { lt: '30-60 min', en: '30-60 min' },
    '1-2-val': { lt: '1-2 val', en: '1-2 hours' },
    'virs-2-val': { lt: 'Virš 2 val', en: 'Over 2 hours' }
  };

  return labels[timeFilter]?.[language as 'lt' | 'en'] || timeFilter;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 🚀 Use shared MongoDB client for better performance
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'receptai');
    
    const { category, language = 'lt' } = req.query;

    // Get category configuration from categories_new collection
    const categoryConfig = await db.collection('categories_new').findOne({
      slug: category as string,
      isActive: true
    });

    if (!categoryConfig) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Build response with available filters for this category using your schema
    const availableFilters: any = {
      // Time filters from your category schema
      timeFilters: categoryConfig.filters.timeFilters.map((timeFilter: string) => ({
        value: timeFilter,
        label: getTimeFilterLabel(timeFilter, language as string),
        count: 0 // You can implement count logic later
      })),

      // Manual filters from your category schema
      manual: categoryConfig.filters.manual.map((filter: any) => ({
        value: filter.value,
        label: filter.label,
        priority: filter.priority,
        count: 0 // You can implement count logic later
      })),

      // Auto filters from your category schema
      auto: categoryConfig.filters.auto.map((filter: any) => ({
        value: filter.value,
        label: filter.label,
        count: 0 // You can implement count logic later
      }))
    };

    // Add category metadata using your schema
    const categoryInfo = {
      slug: categoryConfig.slug,
      title: categoryConfig.seo.metaTitle,
      description: categoryConfig.seo.metaDescription,
      path: categoryConfig.path,
      level: categoryConfig.level,
      canonicalUrl: categoryConfig.seo.canonicalUrl
    };

    return res.status(200).json({
      success: true,
      data: {
        category: categoryInfo,
        filters: availableFilters,
        totalRecipes: 0, // You can implement recipe counting later
        language: language as string
      }
    });

  } catch (error) {
    console.error('Filters API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
}


