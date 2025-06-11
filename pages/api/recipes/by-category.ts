// API endpoint for category-based recipe filtering
// GET /api/recipes/by-category?categoryPath=...&filters=...&page=...

import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';

interface FilterQuery {
  categoryPath?: any;
  tags?: any;
  totalTimeMinutes?: any;
  difficulty?: any;
  'rating.average'?: any;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      categoryPath,
      page = '1',
      limit = '12',
      sort = 'newest',
      ...filters
    } = req.query;

    if (!categoryPath || typeof categoryPath !== 'string') {
      return res.status(400).json({ message: 'Category path is required' });
    }

    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db();

    // Build query
    const query: FilterQuery = {
      categoryPath: { $regex: `^${categoryPath}` }
    };

    // Add filters
    const filterTags: string[] = [];
    
    Object.entries(filters).forEach(([key, value]) => {
      if (typeof value === 'string' && value) {
        const values = value.split(',');
        
        switch (key) {
          case 'pagal-trukme':
            values.forEach(v => {
              if (v === 'per-15-min') {
                query.totalTimeMinutes = { $lte: 15 };
              } else if (v === 'per-30-min') {
                query.totalTimeMinutes = { $lte: 30 };
              } else {
                filterTags.push(v);
              }
            });
            break;
          case 'pagal-dieta':
          case 'pagal-gaminimo-buda':
          case 'pagal-auditorija':
            filterTags.push(...values);
            break;
          case 'difficulty':
            query.difficulty = { $in: values };
            break;
          case 'rating':
            const minRating = parseFloat(values[0]);
            if (!isNaN(minRating)) {
              query['rating.average'] = { $gte: minRating };
            }
            break;
        }
      }
    });

    // Add tag filters
    if (filterTags.length > 0) {
      query.tags = { $in: filterTags };
    }

    // Build sort criteria
    let sortCriteria: any = { publishedAt: -1 }; // Default: newest
    
    switch (sort) {
      case 'rating':
        sortCriteria = { 'rating.average': -1, 'rating.count': -1 };
        break;
      case 'time':
        sortCriteria = { totalTimeMinutes: 1 };
        break;
      case 'popular':
        sortCriteria = { 'rating.count': -1, 'rating.average': -1 };
        break;
      case 'alphabetical':
        sortCriteria = { 'title.lt': 1 };
        break;
    }

    // Pagination
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 12;
    const skip = (pageNum - 1) * limitNum;

    // Execute queries
    const [recipes, totalCount] = await Promise.all([
      db.collection('recipes_new')
        .find(query)
        .sort(sortCriteria)
        .skip(skip)
        .limit(limitNum)
        .toArray(),
      db.collection('recipes_new').countDocuments(query)
    ]);

    // Get available filters for this category
    const availableFilters = await getAvailableFilters(db, categoryPath, query);

    await client.close();

    res.status(200).json({
      recipes,
      pagination: {
        current: pageNum,
        total: totalCount,
        pages: Math.ceil(totalCount / limitNum),
        hasNext: pageNum * limitNum < totalCount,
        hasPrev: pageNum > 1
      },
      availableFilters,
      query: query,
      sort: sort
    });

  } catch (error) {
    console.error('Category recipes API error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Helper function to get available filters for a category
async function getAvailableFilters(db: any, categoryPath: string, baseQuery: FilterQuery) {
  try {
    // Get all recipes in this category to analyze available filters
    const allRecipes = await db.collection('recipes_new')
      .find({ categoryPath: { $regex: `^${categoryPath}` } })
      .toArray();

    // Aggregate filter options
    const filterCounts: Record<string, Record<string, number>> = {
      'pagal-trukme': {},
      'pagal-dieta': {},
      'pagal-gaminimo-buda': {},
      'pagal-auditorija': {},
      'difficulty': {}
    };

    allRecipes.forEach(recipe => {
      // Time-based filters
      if (recipe.totalTimeMinutes <= 15) {
        filterCounts['pagal-trukme']['per-15-min'] = (filterCounts['pagal-trukme']['per-15-min'] || 0) + 1;
      }
      if (recipe.totalTimeMinutes <= 30) {
        filterCounts['pagal-trukme']['per-30-min'] = (filterCounts['pagal-trukme']['per-30-min'] || 0) + 1;
      }

      // Tag-based filters
      recipe.tags?.forEach((tag: string) => {
        const tagLower = tag.toLowerCase();
        
        // Diet filters
        if (['be gliuteno', 'vegetariška', 'veganiška', 'be laktozės'].includes(tagLower)) {
          filterCounts['pagal-dieta'][tag] = (filterCounts['pagal-dieta'][tag] || 0) + 1;
        }
        
        // Cooking method filters
        if (['orkaitėje', 'greitpuodyje', 'griliuje', 'garuose'].includes(tagLower)) {
          filterCounts['pagal-gaminimo-buda'][tag] = (filterCounts['pagal-gaminimo-buda'][tag] || 0) + 1;
        }
        
        // Audience filters
        if (['vaikams', 'šeimai', 'pietūs į darbą', 'svečiams'].includes(tagLower)) {
          filterCounts['pagal-auditorija'][tag] = (filterCounts['pagal-auditorija'][tag] || 0) + 1;
        }
      });

      // Difficulty filters
      if (recipe.difficulty) {
        filterCounts['difficulty'][recipe.difficulty] = (filterCounts['difficulty'][recipe.difficulty] || 0) + 1;
      }
    });

    // Convert to filter format
    const availableFilters: Record<string, Array<{ value: string; label: string; count: number }>> = {};

    Object.entries(filterCounts).forEach(([filterType, counts]) => {
      availableFilters[filterType] = Object.entries(counts)
        .filter(([_, count]) => count > 0)
        .map(([value, count]) => ({
          value,
          label: formatFilterLabel(value),
          count
        }))
        .sort((a, b) => b.count - a.count);
    });

    return availableFilters;

  } catch (error) {
    console.error('Error getting available filters:', error);
    return {};
  }
}

// Helper function to format filter labels
function formatFilterLabel(value: string): string {
  const labelMap: Record<string, string> = {
    'per-15-min': 'Per 15 min',
    'per-30-min': 'Per 30 min',
    'be gliuteno': 'Be gliuteno',
    'vegetariška': 'Vegetariška',
    'veganiška': 'Veganiška',
    'be laktozės': 'Be laktozės',
    'orkaitėje': 'Orkaitėje',
    'greitpuodyje': 'Greitpuodyje',
    'griliuje': 'Griliuje',
    'garuose': 'Garuose',
    'vaikams': 'Vaikams',
    'šeimai': 'Šeimai',
    'pietūs į darbą': 'Pietūs į darbą',
    'svečiams': 'Svečiams',
    'lengvas': 'Lengvas',
    'vidutinis': 'Vidutinis',
    'sudėtingas': 'Sudėtingas'
  };

  return labelMap[value] || value.charAt(0).toUpperCase() + value.slice(1);
}
