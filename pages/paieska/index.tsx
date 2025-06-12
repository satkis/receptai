// Search Results Page - Query-based search with filters
// URL: domain.lt/paieska?q=search-term

import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { MongoClient } from 'mongodb';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '../../components/layout/Layout';
import PlaceholderImage from '../../components/ui/PlaceholderImage';
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
  image: string;
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

// Search Header Component
function SearchHeader({ 
  searchTerm, 
  totalResults, 
  searchTime 
}: { 
  searchTerm: string; 
  totalResults: number; 
  searchTime: number; 
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {searchTerm ? `Paieškos rezultatai: "${searchTerm}"` : 'Visi receptai'}
          </h1>
          <p className="text-gray-600 mt-1">
            Rasta {totalResults} receptų {searchTime && `(${searchTime}ms)`}
          </p>
        </div>
        <div className="text-4xl">🔍</div>
      </div>
    </div>
  );
}

// Search Bar Component
function SearchBar({ initialValue }: { initialValue: string }) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState(initialValue);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      router.push(`/paieska?q=${encodeURIComponent(searchValue.trim())}`);
    } else {
      router.push('/paieska');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
      <form onSubmit={handleSearch} className="flex gap-4">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Ieškoti receptų... (pvz. vištienos file, šaltibarščiai)"
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
        >
          Ieškoti
        </button>
      </form>
    </div>
  );
}

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

// Recipe Card Component
function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <a
      href={`/receptas/${recipe.slug}`}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="relative h-48">
        <PlaceholderImage
          src={recipe.image}
          alt={recipe.title.lt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {recipe.score && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
            {(recipe.score * 100).toFixed(0)}% atitikimas
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {recipe.title.lt}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {recipe.description.lt}
        </p>
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-4">
            <span>🕒 {recipe.totalTimeMinutes} min</span>
            <span>👥 {recipe.servings}</span>
          </div>
          {recipe.rating.count > 0 && (
            <span>⭐ {recipe.rating.average.toFixed(1)}</span>
          )}
        </div>
        <div className="flex flex-wrap gap-1">
          {recipe.tags.slice(0, 3).map((tag, index) => (
            <a
              key={index}
              href={`/paieska?q=${encodeURIComponent(tag)}`}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded hover:bg-orange-100 hover:text-orange-700 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {tag}
            </a>
          ))}
          {recipe.tags.length > 3 && (
            <span className="text-xs text-gray-500">+{recipe.tags.length - 3}</span>
          )}
        </div>
      </div>
    </a>
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

export const getServerSideProps: GetServerSideProps = async ({ query: urlQuery }) => {
  try {
    const searchTerm = cleanSearchQuery(urlQuery.q as string || '');
    const timeFilter = urlQuery.timeFilter as string;
    const categoryFilter = urlQuery.categoryFilter as string;
    const page = parseInt(urlQuery.page as string) || 1;
    const limit = 12;

    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db();

    // Build search aggregation
    const pipeline = buildSearchAggregation(
      searchTerm,
      timeFilter,
      categoryFilter,
      page,
      limit
    );

    const startTime = Date.now();

    // Execute search
    const recipes = await db.collection('recipes_new')
      .aggregate(pipeline)
      .toArray();

    // Get total count
    const countPipeline = [
      pipeline[0], // Match stage only
      { $count: "total" }
    ];

    const countResult = await db.collection('recipes_new')
      .aggregate(countPipeline)
      .toArray();

    const totalCount = countResult.length > 0 ? countResult[0].total : 0;

    // Get available filters
    const filters = await getAvailableFilters(
      db,
      searchTerm,
      timeFilter,
      categoryFilter
    );

    await client.close();

    const searchTime = Date.now() - startTime;

    return {
      props: {
        recipes: JSON.parse(JSON.stringify(recipes)),
        pagination: {
          current: page,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
          hasNext: page * limit < totalCount,
          hasPrev: page > 1
        },
        filters,
        query: {
          searchTerm,
          timeFilter: timeFilter || null,
          categoryFilter: categoryFilter || null
        },
        performance: {
          searchTime,
          totalResults: totalCount
        }
      }
    };
  } catch (error) {
    console.error('Search page error:', error);
    return {
      props: {
        recipes: [],
        pagination: { current: 1, total: 0, pages: 0, hasNext: false, hasPrev: false },
        filters: { timeFilters: [], categoryFilters: [] },
        query: { searchTerm: '', timeFilter: null, categoryFilter: null },
        performance: { searchTime: 0, totalResults: 0 }
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

  const handleTimeFilterChange = (filter: string | null) => {
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
    <Layout>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={`${query.searchTerm}, receptai, lietuviški, paieška`} />
        <link rel="canonical" href={`https://paragaujam.lt/paieska${query.searchTerm ? `?q=${encodeURIComponent(query.searchTerm)}` : ''}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={`https://paragaujam.lt/paieska${query.searchTerm ? `?q=${encodeURIComponent(query.searchTerm)}` : ''}`} />
        <meta property="og:type" content="website" />
        
        {/* Prevent indexing of empty search pages */}
        {!query.searchTerm && <meta name="robots" content="noindex, follow" />}
      </Head>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <SearchBar initialValue={query.searchTerm} />

        {/* Search Header */}
        <SearchHeader 
          searchTerm={query.searchTerm}
          totalResults={performance.totalResults}
          searchTime={performance.searchTime}
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

        {/* Recipe Grid */}
        <RecipeGrid recipes={recipes} />

        {/* Pagination */}
        <Pagination pagination={pagination} onPageChange={handlePageChange} />
      </div>
    </Layout>
  );
}
