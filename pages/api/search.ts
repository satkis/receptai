// Search API endpoint for Lithuanian recipe search
// Handles query-based search with filters and performance optimization

import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';
import { searchApiSecurity } from '../../lib/security';
import { 
  buildSearchAggregation, 
  getAvailableFilters, 
  cleanSearchQuery 
} from '../../utils/searchUtils';

interface SearchQuery {
  q?: string;
  timeFilter?: string;
  categoryFilter?: string;
  page?: string;
  limit?: string;
  sort?: string;
}

interface SearchResponse {
  recipes: any[];
  pagination: {
    current: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    timeFilters: Array<{ value: string; label: string; count: number }>;
    categoryFilters: Array<{ value: string; label: string; count: number; path: string }>;
  };
  query: {
    searchTerm: string;
    timeFilter: string | null;
    categoryFilter: string | null;
    sort: string;
  };
  performance: {
    searchTime: number;
    totalResults: number;
  };
}

async function searchHandler(
  req: NextApiRequest,
  res: NextApiResponse<SearchResponse | { error: string }>
) {

  const startTime = Date.now();

  try {
    const {
      q,
      timeFilter,
      categoryFilter,
      page = '1',
      limit = '12',
      sort = 'relevance'
    }: SearchQuery = req.query;

    // Clean and validate search query
    const searchTerm = cleanSearchQuery(q || '');
    
    // Validate pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit))); // Max 50 results per page

    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db();

    // Build search aggregation pipeline
    const pipeline = buildSearchAggregation(
      searchTerm,
      timeFilter,
      categoryFilter,
      pageNum,
      limitNum
    );

    // Execute search
    const recipes = await db.collection('recipes_new')
      .aggregate(pipeline)
      .toArray();

    // Get total count for pagination
    const countPipeline = [
      pipeline[0], // Match stage only
      { $count: "total" }
    ];
    
    const countResult = await db.collection('recipes_new')
      .aggregate(countPipeline)
      .toArray();
    
    const totalCount = countResult.length > 0 ? countResult[0].total : 0;

    // Get available filters based on search results
    const filters = await getAvailableFilters(
      db,
      searchTerm,
      timeFilter,
      categoryFilter
    );

    await client.close();

    // Calculate performance metrics
    const searchTime = Date.now() - startTime;

    // Build response
    const response: SearchResponse = {
      recipes,
      pagination: {
        current: pageNum,
        total: totalCount,
        pages: Math.ceil(totalCount / limitNum),
        hasNext: pageNum * limitNum < totalCount,
        hasPrev: pageNum > 1
      },
      filters,
      query: {
        searchTerm,
        timeFilter: timeFilter || null,
        categoryFilter: categoryFilter || null,
        sort
      },
      performance: {
        searchTime,
        totalResults: totalCount
      }
    };

    // Set cache headers for performance (5 minutes)
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    
    // Add performance headers for monitoring
    res.setHeader('X-Search-Time', searchTime.toString());
    res.setHeader('X-Total-Results', totalCount.toString());

    res.status(200).json(response);

  } catch (error) {
    console.error('Search API error:', error);
    
    // Return error response
    res.status(500).json({ 
      error: 'Search temporarily unavailable. Please try again.' 
    });
  }
}

// Helper function to validate search parameters
function validateSearchParams(query: SearchQuery): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate search term length
  if (query.q && query.q.length > 100) {
    errors.push('Search term too long (max 100 characters)');
  }
  
  // Validate time filter
  const validTimeFilters = ['iki-30-min', '30-60-min', '1-2-val', 'virs-2-val'];
  if (query.timeFilter && !validTimeFilters.includes(query.timeFilter)) {
    errors.push('Invalid time filter');
  }
  
  // Validate sort option
  const validSortOptions = ['relevance', 'newest', 'rating', 'time'];
  if (query.sort && !validSortOptions.includes(query.sort)) {
    errors.push('Invalid sort option');
  }
  
  // Validate pagination
  const page = parseInt(query.page || '1');
  const limit = parseInt(query.limit || '12');
  
  if (page < 1 || page > 1000) {
    errors.push('Invalid page number');
  }
  
  if (limit < 1 || limit > 50) {
    errors.push('Invalid limit (1-50)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Export the secured handler
export default searchApiSecurity(searchHandler);
