// Search Results Page - Query-based search with filters
// URL: domain.lt/paieska?q=search-term

import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import clientPromise, { DATABASE_NAME } from '../../lib/mongodb';
import Head from 'next/head';
import { useRouter } from 'next/router';
// Layout removed - already wrapped in _app.tsx
import PlaceholderImage from '../../components/ui/PlaceholderImage';
import SearchResultsSEO from '../../components/search/SearchResultsSEO';
import RecipeCardSkeleton, { SearchLoadingSkeleton } from '../../components/ui/RecipeCardSkeleton';
import { 
  buildSearchAggregation, 
  getAvailableFilters, 
  cleanSearchQuery 
} from '../../utils/searchUtils';

interface Recipe {
  _id: string;
  slug: string;
  title: { lt: string; en?: string };
  description: { lt: string; en?: string };
  image: {
    src: string;
    alt: string;
    width: number;
    height: number;
  } | string;
  totalTimeMinutes: number;
  servings: number;
  tags: string[];
  rating: { average: number; count: number };
  difficulty: string;
  timeCategory: string;
  score?: number;
}

interface SearchPageProps {
  recipes: Recipe[];
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
  };
  performance: {
    searchTime: number;
    totalResults: number;
  };
}

// Simple Search Header Component
function SearchHeader({
  searchTerm,
  totalResults
}: {
  searchTerm: string;
  totalResults: number;
}) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        {searchTerm ? `Paieškos rezultatai: "${searchTerm}"` : 'Visi receptai'}
      </h1>
      <p className="text-gray-600">
        Rodoma {totalResults} receptų šiame puslapyje
      </p>
    </div>
  );
}

// This component is removed - search functionality moved to header

// Time Filter Component (Exclusive Selection)
function TimeFilter({ 
  availableFilters, 
  activeFilter, 
  onFilterChange 
}: { 
  availableFilters: Array<{ value: string; label: string; count: number }>;
  activeFilter: string | null;
  onFilterChange: (filter: string | null) => void;
}) {
  if (availableFilters.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Trukmė</h3>
        {activeFilter && (
          <button
            onClick={() => onFilterChange(null)}
            className="text-sm text-orange-600 hover:text-orange-700"
          >
            Išvalyti filtrą
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {availableFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => onFilterChange(filter.value === activeFilter ? null : filter.value)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeFilter === filter.value
                ? "bg-orange-100 text-orange-800 border border-orange-200"
                : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
            }`}
          >
            {filter.label}
            <span className={`text-xs ${activeFilter === filter.value ? "text-orange-600" : "text-gray-500"}`}>
              ({filter.count})
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Category Filter Component
function CategoryFilter({ 
  availableFilters, 
  activeFilter, 
  onFilterChange 
}: { 
  availableFilters: Array<{ value: string; label: string; count: number; path: string }>;
  activeFilter: string | null;
  onFilterChange: (filter: string | null) => void;
}) {
  if (availableFilters.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Kategorijos</h3>
        {activeFilter && (
          <button
            onClick={() => onFilterChange(null)}
            className="text-sm text-orange-600 hover:text-orange-700"
          >
            Išvalyti filtrą
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {availableFilters.slice(0, 10).map((filter) => (
          <button
            key={filter.value}
            onClick={() => onFilterChange(filter.value === activeFilter ? null : filter.value)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeFilter === filter.value
                ? "bg-orange-100 text-orange-800 border border-orange-200"
                : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
            }`}
          >
            {filter.label}
            <span className={`text-xs ${activeFilter === filter.value ? "text-orange-600" : "text-gray-500"}`}>
              ({filter.count})
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Recipe Card Component - Fixed layout and ingredients display
function RecipeCard({ recipe }: { recipe: Recipe }) {
  const [isIngredientsExpanded, setIsIngredientsExpanded] = useState(false);

  const handleIngredientsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsIngredientsExpanded(!isIngredientsExpanded);
  };

  const handleIngredientsContainerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isIngredientsExpanded) {
      setIsIngredientsExpanded(false);
    }
  };

  // Format time display
  const displayTime = recipe.totalTimeMinutes > 0 ? `${recipe.totalTimeMinutes} min` : 'apie 2 val';
  const servings = recipe.servings || 4;

  // Get actual ingredients - prioritize real ingredients over tags
  let ingredients: any[] = [];

  if (recipe.ingredients && Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0) {
    ingredients = recipe.ingredients;
  } else if (recipe.tags && Array.isArray(recipe.tags)) {
    // Only use tags as fallback if no ingredients
    ingredients = recipe.tags.map(tag => ({ name: { lt: tag } }));
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group flex flex-col h-full">
      <a href={`/receptas/${recipe.slug}`} className="block flex flex-col h-full">
        {/* Image Section - Fixed height */}
        <div className="relative w-full h-40 flex-shrink-0 overflow-hidden">
          <PlaceholderImage
            src={typeof recipe.image === 'string' ? recipe.image : recipe.image?.src || '/placeholder-recipe.jpg'}
            alt={typeof recipe.image === 'string' ? recipe.title.lt : recipe.image?.alt || recipe.title.lt}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />

          {/* Enhanced Time/Servings Overlay */}
          <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
            {/* Time - High contrast for visibility */}
            <div className="bg-orange-500 text-white px-2 py-1 rounded-md text-xs font-semibold shadow-lg">
              ⏱️ {displayTime}
            </div>
            {/* Servings - More blended */}
            <div className="bg-black/60 backdrop-blur-sm text-white/90 px-2 py-1 rounded-md text-xs">
              👥 {servings} porcijos
            </div>
          </div>
        </div>

        {/* Content Section - Flexible height */}
        <div className="p-3 flex-1 flex flex-col">
          {/* Title */}
          <h3 className="font-semibold text-gray-900 mb-2 text-sm leading-tight group-hover:text-orange-600 transition-colors">
            {recipe.title.lt}
          </h3>

          {/* Ingredients */}
          {ingredients.length > 0 && (
            <div
              className="mt-auto"
              onClick={handleIngredientsContainerClick}
            >
              <div className="flex flex-wrap gap-1">
                {!isIngredientsExpanded ? (
                  <>
                    {ingredients.slice(0, 3).map((ingredient, index) => {
                      // Handle different ingredient structures
                      let name = '';
                      if (typeof ingredient === 'string') {
                        name = ingredient;
                      } else if (ingredient.name) {
                        if (typeof ingredient.name === 'string') {
                          name = ingredient.name;
                        } else if (ingredient.name.lt) {
                          name = ingredient.name.lt;
                        }
                      }

                      return (
                        <span key={index} className="inline-block text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-full border border-orange-100 font-medium">
                          {name}
                        </span>
                      );
                    })}
                    {ingredients.length > 3 && (
                      <button
                        className="inline-block text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full hover:bg-orange-200 transition-colors font-medium border border-orange-200"
                        onClick={handleIngredientsClick}
                      >
                        +{ingredients.length - 3}
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    {ingredients.map((ingredient, index) => {
                      // Handle different ingredient structures
                      let name = '';
                      if (typeof ingredient === 'string') {
                        name = ingredient;
                      } else if (ingredient.name) {
                        if (typeof ingredient.name === 'string') {
                          name = ingredient.name;
                        } else if (ingredient.name.lt) {
                          name = ingredient.name.lt;
                        }
                      }

                      return (
                        <span
                          key={index}
                          className="inline-block text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-full border border-orange-100 font-medium"
                        >
                          {name}
                        </span>
                      );
                    })}
                    <button
                      className="inline-block text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full hover:bg-gray-300 transition-colors"
                      onClick={handleIngredientsClick}
                    >
                      ×
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </a>
    </div>
  );
}

// Recipe Grid Component
function RecipeGrid({ recipes }: { recipes: Recipe[] }) {
  if (recipes.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Receptų nerasta
        </h3>
        <p className="text-gray-600">
          Pabandykite pakeisti paieškos žodžius arba filtrus.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe._id} recipe={recipe} />
      ))}
    </div>
  );
}

// Pagination Component
function Pagination({ pagination, onPageChange }: { 
  pagination: SearchPageProps['pagination'];
  onPageChange: (page: number) => void;
}) {
  if (pagination.pages <= 1) return null;

  const pages = Array.from({ length: pagination.pages }, (_, i) => i + 1);
  const visiblePages = pages.slice(
    Math.max(0, pagination.current - 3),
    Math.min(pages.length, pagination.current + 2)
  );

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      {pagination.hasPrev && (
        <button
          onClick={() => onPageChange(pagination.current - 1)}
          className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Ankstesnis
        </button>
      )}
      
      {visiblePages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-2 text-sm font-medium rounded-md ${
            page === pagination.current
              ? 'bg-orange-500 text-white'
              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {page}
        </button>
      ))}
      
      {pagination.hasNext && (
        <button
          onClick={() => onPageChange(pagination.current + 1)}
          className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Kitas
        </button>
      )}
    </div>
  );
}

// Server-side search: Real-time search results with SEO optimization
export const getServerSideProps: GetServerSideProps = async (context) => {
  const startTime = Date.now();

  try {
    // Extract search parameters from URL
    const {
      q: searchQuery = '',
      timeFilter = '',
      categoryFilter = '',
      page = '1'
    } = context.query;

    // Clean and validate search query
    const searchTerm = cleanSearchQuery(Array.isArray(searchQuery) ? searchQuery[0] : searchQuery);
    const timeFilterValue = Array.isArray(timeFilter) ? timeFilter[0] : timeFilter;
    const categoryFilterValue = Array.isArray(categoryFilter) ? categoryFilter[0] : categoryFilter;
    const pageNum = Math.max(1, parseInt(Array.isArray(page) ? page[0] : page));
    const limitNum = 12; // Results per page

    console.log(`🔍 Search request: "${searchTerm}" (time: ${timeFilterValue}, category: ${categoryFilterValue}, page: ${pageNum})`);

    // Connect to database
    const client = await clientPromise;
    const db = client.db(DATABASE_NAME);

    // Build search aggregation pipeline
    const pipeline = buildSearchAggregation(
      searchTerm,
      timeFilterValue || undefined,
      categoryFilterValue || undefined,
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
      timeFilterValue || undefined,
      categoryFilterValue || undefined
    );

    const searchTime = Date.now() - startTime;
    console.log(`✅ Search completed: ${totalCount} results in ${searchTime}ms`);

    return {
      props: {
        recipes: JSON.parse(JSON.stringify(recipes)), // Serialize MongoDB objects
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
          timeFilter: timeFilterValue || null,
          categoryFilter: categoryFilterValue || null
        },
        performance: {
          searchTime,
          totalResults: totalCount
        }
      }
    };
  } catch (error) {
    console.error('❌ Search page error:', error);

    // Return empty results on error
    return {
      props: {
        recipes: [],
        pagination: { current: 1, total: 0, pages: 0, hasNext: false, hasPrev: false },
        filters: { timeFilters: [], categoryFilters: [] },
        query: { searchTerm: '', timeFilter: null, categoryFilter: null },
        performance: { searchTime: Date.now() - startTime, totalResults: 0 }
      }
    };
  }
};

export default function SearchPage({
  recipes,
  pagination,
  filters,
  query,
  performance
}: SearchPageProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Show loading state when navigating to new search
  useEffect(() => {
    const handleRouteChangeStart = () => setIsLoading(true);
    const handleRouteChangeComplete = () => setIsLoading(false);
    const handleRouteChangeError = () => setIsLoading(false);

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    router.events.on('routeChangeError', handleRouteChangeError);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      router.events.off('routeChangeError', handleRouteChangeError);
    };
  }, [router]);

  const handleTimeFilterChange = (filter: string | null) => {
    setIsLoading(true);
    const newQuery = { ...router.query };

    if (filter) {
      newQuery.timeFilter = filter;
    } else {
      delete newQuery.timeFilter;
    }

    // Reset to page 1 when filter changes
    delete newQuery.page;

    router.push({ pathname: '/paieska', query: newQuery }, undefined, { shallow: true });
  };

  const handleCategoryFilterChange = (filter: string | null) => {
    setIsLoading(true);
    const newQuery = { ...router.query };

    if (filter) {
      newQuery.categoryFilter = filter;
    } else {
      delete newQuery.categoryFilter;
    }

    // Reset to page 1 when filter changes
    delete newQuery.page;

    router.push({ pathname: '/paieska', query: newQuery }, undefined, { shallow: true });
  };

  const handlePageChange = (page: number) => {
    setIsLoading(true);
    const newQuery = { ...router.query, page: page.toString() };
    router.push({ pathname: '/paieska', query: newQuery }, undefined, { shallow: true });
  };

  // Generate page title and description
  const pageTitle = query.searchTerm 
    ? `"${query.searchTerm}" paieškos rezultatai - Paragaujam.lt`
    : 'Receptų paieška - Paragaujam.lt';
    
  const pageDescription = query.searchTerm
    ? `Rasta ${performance.totalResults} receptų pagal "${query.searchTerm}". Geriausi lietuviški receptai su nuotraukomis ir instrukcijomis.`
    : 'Ieškokite receptų pagal ingredientus, patiekalo tipą ar pavadinimą. Daugiau nei 1000 patikrintų receptų.';

  return (
    <>
      <SearchResultsSEO
        query={query.searchTerm}
        totalResults={performance.totalResults}
        currentPage={pagination.current}
        totalPages={pagination.pages}
      />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search Header */}
        <SearchHeader
          searchTerm={query.searchTerm}
          totalResults={performance.totalResults}
        />

        {/* Time Filters */}
        <TimeFilter 
          availableFilters={filters.timeFilters}
          activeFilter={query.timeFilter}
          onFilterChange={handleTimeFilterChange}
        />

        {/* Category Filters */}
        <CategoryFilter 
          availableFilters={filters.categoryFilters}
          activeFilter={query.categoryFilter}
          onFilterChange={handleCategoryFilterChange}
        />

        {/* Recipe Grid with Loading State */}
        {isLoading ? (
          <SearchLoadingSkeleton searchTerm={query.searchTerm} />
        ) : (
          <>
            <RecipeGrid recipes={recipes} />
            {/* Pagination */}
            <Pagination pagination={pagination} onPageChange={handlePageChange} />
          </>
        )}
      </div>
    </>
  );
}
