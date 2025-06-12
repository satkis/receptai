// Search utilities for Lithuanian recipe website
// Handles character normalization, search query processing, and MongoDB text search

/**
 * Lithuanian character mapping for normalization
 */
const lithuanianCharMap: Record<string, string> = {
  // Lowercase
  'ą': 'a', 'č': 'c', 'ę': 'e', 'ė': 'e', 'į': 'i', 
  'š': 's', 'ų': 'u', 'ū': 'u', 'ž': 'z',
  // Uppercase
  'Ą': 'A', 'Č': 'C', 'Ę': 'E', 'Ė': 'E', 'Į': 'I',
  'Š': 'S', 'Ų': 'U', 'Ū': 'U', 'Ž': 'Z'
};

/**
 * Reverse mapping for converting normalized back to Lithuanian
 */
const reverseCharMap: Record<string, string[]> = {
  'a': ['a', 'ą'], 'c': ['c', 'č'], 'e': ['e', 'ę', 'ė'], 'i': ['i', 'į'],
  's': ['s', 'š'], 'u': ['u', 'ų', 'ū'], 'z': ['z', 'ž'],
  'A': ['A', 'Ą'], 'C': ['C', 'Č'], 'E': ['E', 'Ę', 'Ė'], 'I': ['I', 'Į'],
  'S': ['S', 'Š'], 'U': ['U', 'Ų', 'Ū'], 'Z': ['Z', 'Ž']
};

/**
 * Normalize Lithuanian characters to ASCII equivalents
 */
export function normalizeLithuanian(text: string): string {
  return text
    .split('')
    .map(char => lithuanianCharMap[char] || char)
    .join('');
}

/**
 * Create search variants for both Lithuanian and normalized text
 */
export function createSearchVariants(query: string): string[] {
  const normalized = normalizeLithuanian(query);
  const variants = new Set([query.toLowerCase(), normalized.toLowerCase()]);
  
  // Add variants with different character combinations
  const words = query.toLowerCase().split(/\s+/);
  words.forEach(word => {
    variants.add(word);
    variants.add(normalizeLithuanian(word));
  });
  
  return Array.from(variants).filter(v => v.length > 0);
}

/**
 * Build MongoDB text search query with Lithuanian support
 */
export function buildSearchQuery(searchTerm: string): any {
  if (!searchTerm || searchTerm.trim().length === 0) {
    return {};
  }

  const cleanTerm = searchTerm.trim();
  const variants = createSearchVariants(cleanTerm);
  
  // Create text search query
  const textQuery = {
    $text: {
      $search: variants.join(' '),
      $caseSensitive: false,
      $diacriticSensitive: false
    }
  };

  return textQuery;
}

/**
 * Build aggregation pipeline for search with filters
 */
export function buildSearchAggregation(
  searchTerm: string,
  timeFilter?: string,
  categoryFilter?: string,
  page: number = 1,
  limit: number = 12
): any[] {
  const skip = (page - 1) * limit;
  
  // Base match stage
  const matchStage: any = {};
  
  // Add text search
  if (searchTerm && searchTerm.trim()) {
    Object.assign(matchStage, buildSearchQuery(searchTerm));
  }
  
  // Add time filter
  if (timeFilter) {
    matchStage.timeCategory = timeFilter;
  }
  
  // Add category filter
  if (categoryFilter) {
    matchStage.allCategories = categoryFilter;
  }

  const pipeline = [
    { $match: matchStage },
    {
      $addFields: {
        score: searchTerm ? { $meta: "textScore" } : 1
      }
    },
    {
      $sort: searchTerm 
        ? { score: { $meta: "textScore" }, publishedAt: -1 }
        : { publishedAt: -1 }
    },
    {
      $project: {
        slug: 1,
        title: 1,
        description: 1,
        image: 1,
        totalTimeMinutes: 1,
        servings: 1,
        tags: 1,
        ingredients: 1,  // ← Added ingredients field
        rating: 1,
        difficulty: 1,
        timeCategory: 1,
        allCategories: 1,
        publishedAt: 1,
        score: 1
      }
    },
    { $skip: skip },
    { $limit: limit }
  ];

  return pipeline;
}

/**
 * Get available filters for search results
 */
export async function getAvailableFilters(
  db: any,
  searchTerm: string,
  activeTimeFilter?: string,
  activeCategoryFilter?: string
): Promise<{
  timeFilters: Array<{ value: string; label: string; count: number }>;
  categoryFilters: Array<{ value: string; label: string; count: number; path: string }>;
}> {
  
  // Base query for filter counting
  const baseQuery: any = {};
  if (searchTerm && searchTerm.trim()) {
    Object.assign(baseQuery, buildSearchQuery(searchTerm));
  }

  // Get time filter counts
  const timeFilterCounts = await Promise.all([
    db.collection('recipes_new').countDocuments({ ...baseQuery, timeCategory: "iki-30-min" }),
    db.collection('recipes_new').countDocuments({ ...baseQuery, timeCategory: "30-60-min" }),
    db.collection('recipes_new').countDocuments({ ...baseQuery, timeCategory: "1-2-val" }),
    db.collection('recipes_new').countDocuments({ ...baseQuery, timeCategory: "virs-2-val" })
  ]);

  const timeFilters = [
    { value: "iki-30-min", label: "iki 30 min.", count: timeFilterCounts[0] },
    { value: "30-60-min", label: "30–60 min.", count: timeFilterCounts[1] },
    { value: "1-2-val", label: "1–2 val.", count: timeFilterCounts[2] },
    { value: "virs-2-val", label: "virš 2 val.", count: timeFilterCounts[3] }
  ].filter(filter => filter.count > 0);

  // Get category filter counts
  const categoryAggregation = await db.collection('recipes_new').aggregate([
    { $match: baseQuery },
    { $unwind: "$allCategories" },
    { $group: { _id: "$allCategories", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 20 }
  ]).toArray();

  // Get category details
  const categoryPaths = categoryAggregation.map(c => c._id);
  const categories = await db.collection('categories_new')
    .find({ path: { $in: categoryPaths } })
    .toArray();

  const categoryFilters = categoryAggregation.map(agg => {
    const category = categories.find(c => c.path === agg._id);
    return {
      value: agg._id,
      label: category?.title?.lt || agg._id,
      count: agg.count,
      path: agg._id
    };
  }).filter(filter => filter.count > 0);

  return { timeFilters, categoryFilters };
}

/**
 * Extract popular search terms from recipe tags and titles
 */
export async function extractPopularSearchTerms(db: any, limit: number = 200): Promise<string[]> {
  // Get popular tags
  const tagAggregation = await db.collection('recipes_new').aggregate([
    { $unwind: "$tags" },
    { $group: { _id: "$tags", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit / 2 }
  ]).toArray();

  // Get popular title words
  const titleAggregation = await db.collection('recipes_new').aggregate([
    {
      $project: {
        words: {
          $split: [
            { $toLower: "$title.lt" },
            " "
          ]
        }
      }
    },
    { $unwind: "$words" },
    {
      $match: {
        words: { 
          $not: { $in: ["su", "ir", "be", "iš", "per", "už", "ant", "po", "prie"] } // Lithuanian stop words
        }
      }
    },
    { $group: { _id: "$words", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit / 2 }
  ]).toArray();

  const popularTerms = [
    ...tagAggregation.map(t => t._id),
    ...titleAggregation.map(t => t._id)
  ];

  // Remove duplicates and filter out short words
  return Array.from(new Set(popularTerms))
    .filter(term => term && term.length > 2)
    .slice(0, limit);
}

/**
 * Clean and validate search query
 */
export function cleanSearchQuery(query: string): string {
  if (!query) return '';
  
  return query
    .trim()
    .replace(/[^\w\sąčęėįšųūž]/gi, '') // Keep only letters, spaces, and Lithuanian chars
    .replace(/\s+/g, ' ') // Normalize spaces
    .slice(0, 100); // Limit length
}

/**
 * Generate search URL for sitemap
 */
export function generateSearchUrl(baseUrl: string, searchTerm: string): string {
  const encodedTerm = encodeURIComponent(searchTerm);
  return `${baseUrl}/paieska?q=${encodedTerm}`;
}
