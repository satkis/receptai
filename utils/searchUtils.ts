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
 * Calculate Levenshtein distance for typo tolerance
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,     // deletion
        matrix[j - 1][i] + 1,     // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Generate Lithuanian word ending variants for better search matching
 */
function generateLithuanianWordEndings(word: string): string[] {
  if (word.length < 4) return []; // Skip short words

  const variants: string[] = [];
  const lowerWord = word.toLowerCase();

  // Lithuanian word ending patterns for common ingredients and food terms
  const endingPatterns: Record<string, string[]> = {
    // Nominative -> other cases
    'a': ['os', 'ą', 'ai', 'ų', 'oms', 'as'], // morka -> morkos, morką, etc.
    'as': ['o', 'ą', 'ai', 'ų', 'ams', 'uose'], // salieras -> saliero, etc.
    'is': ['io', 'į', 'iai', 'ių', 'iams'], // agurkas -> agurko, etc.
    'ė': ['ės', 'ę', 'ėms', 'ėse'], // bulvė -> bulvės, etc.
    'ys': ['io', 'į', 'iai', 'ių', 'iams'], // vyšnys -> vyšnio, etc.
    'us': ['aus', 'ų', 'ums'], // svogūnas -> svogūno, etc.

    // Reverse patterns - search term -> base form
    'os': ['a'], // morkos -> morka
    'ų': ['a', 'ė', 'is'], // morkų -> morka, bulvių -> bulvė
    'ams': ['as'], // salieroms -> salieras
    'io': ['as', 'is'], // saliero -> salieras
    'ės': ['ė'], // bulvės -> bulvė
    'ių': ['is', 'ė'], // agurklių -> agurkas
    'ą': ['a', 'as'], // morką -> morka
    'ę': ['ė'], // bulvę -> bulvė
    'į': ['is', 'as'], // agurką -> agurkas
  };

  // Try to find matching ending patterns
  Object.entries(endingPatterns).forEach(([ending, alternatives]) => {
    if (lowerWord.endsWith(ending)) {
      const stem = lowerWord.slice(0, -ending.length);
      alternatives.forEach(alt => {
        variants.push(stem + alt);
      });
    }
  });

  // Add common ingredient-specific patterns
  const ingredientPatterns: Record<string, string[]> = {
    'morkos': ['morka', 'morką', 'morkų'],
    'morka': ['morkos', 'morką', 'morkų'],
    'salieras': ['saliero', 'salierą', 'salierų'],
    'saliero': ['salieras', 'salierą', 'salierų'],
    'jautiena': ['jautienos', 'jautieną', 'jautienai'],
    'jautienos': ['jautiena', 'jautieną', 'jautienai'],
    'jautinea': ['jautiena', 'jautienos'], // common typo
    'bulvės': ['bulvė', 'bulvę', 'bulvių'],
    'bulvė': ['bulvės', 'bulvę', 'bulvių'],
    'svogūnas': ['svogūno', 'svogūną', 'svogūnų'],
    'svogūno': ['svogūnas', 'svogūną', 'svogūnų'],
  };

  // Check for specific ingredient patterns
  if (ingredientPatterns[lowerWord]) {
    variants.push(...ingredientPatterns[lowerWord]);
  }

  return variants;
}

/**
 * Generate typo variants for a word (max 1-2 character differences)
 */
function generateTypoVariants(word: string): string[] {
  if (word.length < 4) return []; // Skip short words

  const variants: string[] = [];

  // Common Lithuanian typo patterns
  const commonTypos: Record<string, string[]> = {
    'ie': ['ei'], 'ei': ['ie'], 'ai': ['ia'], 'ia': ['ai'],
    'uo': ['ou'], 'ou': ['uo'], 'au': ['ua'], 'ua': ['au'],
    'š': ['s'], 's': ['š'], 'č': ['c'], 'c': ['č'],
    'ž': ['z'], 'z': ['ž'], 'ų': ['u'], 'u': ['ų'],
    'ė': ['e'], 'e': ['ė'], 'ą': ['a'], 'a': ['ą'],
    'į': ['i'], 'i': ['į'], 'ū': ['u'], 'ę': ['e']
  };

  // Apply common typo patterns
  Object.entries(commonTypos).forEach(([correct, typos]) => {
    typos.forEach(typo => {
      if (word.includes(correct)) {
        variants.push(word.replace(new RegExp(correct, 'g'), typo));
      }
    });
  });

  return variants;
}

/**
 * Create search variants for both Lithuanian and normalized text with typo tolerance and word endings
 */
export function createSearchVariants(query: string): string[] {
  const normalized = normalizeLithuanian(query);
  const variants = new Set([query.toLowerCase(), normalized.toLowerCase()]);

  // Add variants with different character combinations
  const words = query.toLowerCase().split(/\s+/);
  words.forEach(word => {
    variants.add(word);
    variants.add(normalizeLithuanian(word));

    // Add Lithuanian word ending variants
    const endingVariants = generateLithuanianWordEndings(word);
    endingVariants.forEach(variant => {
      variants.add(variant);
      variants.add(normalizeLithuanian(variant));
    });

    // Add typo variants for each word
    const typoVariants = generateTypoVariants(word);
    typoVariants.forEach(variant => {
      variants.add(variant);
      variants.add(normalizeLithuanian(variant));
    });
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
 * Build aggregation pipeline for search with filters - OPTIMIZED
 */
export function buildSearchAggregation(
  searchTerm: string,
  timeFilter?: string,
  categoryFilter?: string,
  page: number = 1,
  limit: number = 12
): any[] {
  const skip = (page - 1) * limit;

  // Base match stage - optimized for compound indexes
  const matchStage: any = {};

  // Add category filter first (most selective)
  if (categoryFilter) {
    matchStage.allCategories = categoryFilter;
  }

  // Add time filter second (uses compound index)
  if (timeFilter) {
    matchStage.timeCategory = timeFilter;
  }

  // Add text search last
  if (searchTerm && searchTerm.trim()) {
    Object.assign(matchStage, buildSearchQuery(searchTerm));
  }

  const pipeline = [
    { $match: matchStage },
    {
      $addFields: {
        // Enhanced scoring for better relevance
        score: searchTerm ? {
          $add: [
            { $meta: "textScore" },
            // Boost recipes with search term in title
            {
              $cond: {
                if: { $regexMatch: { input: "$title.lt", regex: searchTerm, options: "i" } },
                then: 2,
                else: 0
              }
            },
            // Boost highly rated recipes (check both rating field and schemaOrg)
            {
              $cond: {
                if: {
                  $or: [
                    { $gte: ["$rating.average", 4.5] },
                    { $gte: [{ $toDouble: "$schemaOrg.aggregateRating.ratingValue" }, 4.5] }
                  ]
                },
                then: 1,
                else: 0
              }
            }
          ]
        } : {
          // Default scoring for non-search queries (handle both rating formats)
          $add: [
            {
              $multiply: [
                {
                  $ifNull: [
                    "$rating.average",
                    { $toDouble: { $ifNull: ["$schemaOrg.aggregateRating.ratingValue", 0] } }
                  ]
                },
                0.1
              ]
            },
            {
              $cond: {
                if: {
                  $gte: [
                    {
                      $ifNull: [
                        "$rating.count",
                        { $toInt: { $ifNull: ["$schemaOrg.aggregateRating.reviewCount", 0] } }
                      ]
                    },
                    5
                  ]
                },
                then: 0.5,
                else: 0
              }
            }
          ]
        }
      }
    },
    {
      $sort: searchTerm
        ? { score: -1, publishedAt: -1 }
        : { score: -1, publishedAt: -1 }
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
        ingredients: 1,
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
 * Get available filters for search results - OPTIMIZED
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

  // Add active category filter to base query for time filter counts
  if (activeCategoryFilter) {
    baseQuery.allCategories = activeCategoryFilter;
  }

  // Get time filter counts using optimized aggregation
  const timeFilterAggregation = await db.collection('recipes_new').aggregate([
    { $match: baseQuery },
    {
      $group: {
        _id: "$timeCategory",
        count: { $sum: 1 }
      }
    }
  ]).toArray();

  const timeFilterMap = timeFilterAggregation.reduce((acc: any, item: any) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  const timeFilters = [
    { value: "iki-30-min", label: "iki 30 min.", count: timeFilterMap["iki-30-min"] || 0 },
    { value: "30-60-min", label: "30–60 min.", count: timeFilterMap["30-60-min"] || 0 },
    { value: "1-2-val", label: "1–2 val.", count: timeFilterMap["1-2-val"] || 0 },
    { value: "virs-2-val", label: "virš 2 val.", count: timeFilterMap["virs-2-val"] || 0 }
  ].filter(filter => filter.count > 0);

  // Get category filter counts (exclude active time filter for category counts)
  const categoryBaseQuery: any = {};
  if (searchTerm && searchTerm.trim()) {
    Object.assign(categoryBaseQuery, buildSearchQuery(searchTerm));
  }
  if (activeTimeFilter) {
    categoryBaseQuery.timeCategory = activeTimeFilter;
  }

  const categoryAggregation = await db.collection('recipes_new').aggregate([
    { $match: categoryBaseQuery },
    { $unwind: "$allCategories" },
    { $group: { _id: "$allCategories", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 15 } // Reduced limit for better performance
  ]).toArray();

  // Get category details in batch
  const categoryPaths = categoryAggregation.map((c: any) => c._id);
  const categories = await db.collection('categories_new')
    .find({ path: { $in: categoryPaths } })
    .project({ path: 1, title: 1 }) // Only get needed fields
    .toArray();

  const categoryMap = categories.reduce((acc: any, cat: any) => {
    acc[cat.path] = cat;
    return acc;
  }, {});

  const categoryFilters = categoryAggregation.map((agg: any) => {
    const category = categoryMap[agg._id];
    return {
      value: agg._id,
      label: category?.title?.lt || agg._id.split('/').pop() || agg._id,
      count: agg.count,
      path: agg._id
    };
  }).filter((filter: any) => filter.count > 0);

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
    ...tagAggregation.map((t: any) => t._id),
    ...titleAggregation.map((t: any) => t._id)
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
