// Category Page with Enhanced Filtering
// /receptai/[category] - e.g., /receptai/sumustiniai, /receptai/vistiena

import { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import Head from 'next/head';

import NewRecipeCard from '../../components/NewRecipeCard';
import FilterPills from '../../components/FilterPills';
import Breadcrumb, { generateCategoryBreadcrumbs } from '../../components/Breadcrumb';

interface Recipe {
  _id: string;
  slug: string;
  title: string;
  description: string;
  image: { url: string };
  timing: { totalTimeMinutes: number };
  servings: { amount: number; unit: string };
  ingredients: Array<{ name: string; amount: number; unit: string }>;
  categories: any;
  rating: { average: number; count: number };
  groups: string[];
}

interface FilterOption {
  key: string;
  label: string;
  icon?: string;
  color?: string;
  count: number;
  active: boolean;
}

interface CategoryPageProps {
  initialData: {
    recipes: Recipe[];
    category: {
      slug: string;
      title: string;
      description: string;
      canonicalUrl: string;
    };
    availableFilters: { [key: string]: { label: any; order: number; options: FilterOption[] } };
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNextPage: boolean;
    };
  };
  language: string;
}

export default function CategoryPage({ initialData, language }: CategoryPageProps) {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>(initialData.recipes);
  const [filters, setFilters] = useState<{ [key: string]: string[] }>({});
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialData.pagination.hasNextPage);
  const [currentPage, setCurrentPage] = useState(1);
  const [isUpdating, setIsUpdating] = useState(false); // Prevent rapid clicks

  // Update URL without page reload when filters change
  const updateURL = useCallback((newFilters: { [key: string]: string[] }) => {
    const filterParams = Object.entries(newFilters)
      .filter(([_, values]) => values.length > 0)
      .map(([key, values]) => `${key}:${values.join(',')}`)
      .join(',');

    const query = filterParams ? `?filters=${filterParams}` : '';
    const newUrl = `/receptai/${router.query.category}${query}`;
    
    router.push(newUrl, undefined, { shallow: true });
  }, [router]);

  // Handle filter changes
  const handleFilterChange = useCallback(async (filterType: string, value: string, isActive: boolean) => {
    // Prevent rapid clicks
    if (isUpdating) return;
    setIsUpdating(true);

    const newFilters = { ...filters };

    if (!newFilters[filterType]) {
      newFilters[filterType] = [];
    }

    // Single selection filter types (only one can be selected at a time)
    const singleSelectionTypes = ['timeRequired', 'mainIngredient'];

    if (isActive) {
      if (singleSelectionTypes.includes(filterType)) {
        // For single selection: replace entire array with just this value
        newFilters[filterType] = [value];
      } else {
        // For multiple selection: add to array if not already present
        if (!newFilters[filterType].includes(value)) {
          newFilters[filterType].push(value);
        }
      }
    } else {
      // Remove filter (same logic for both single and multiple selection)
      newFilters[filterType] = newFilters[filterType].filter(v => v !== value);
      if (newFilters[filterType].length === 0) {
        delete newFilters[filterType];
      }
    }

    // Update state and URL immediately
    setFilters(newFilters);
    updateURL(newFilters);
    setLoading(true);
    setCurrentPage(1);

    try {
      // Fetch filtered recipes
      const filterParams = Object.entries(newFilters)
        .filter(([_, values]) => values.length > 0)
        .map(([key, values]) => `${key}:${values.join(',')}`)
        .join(',');

      const queryParams = new URLSearchParams({
        ...(filterParams && { filters: filterParams }),
        page: '1',
        limit: '8',
        language
      });

      // Try new categories API first, fallback to old API
      let response = await fetch(`/api/categories/${router.query.category}?${queryParams}`);

      if (!response.ok) {
        // Fallback to old API
        response = await fetch(`/api/recipes/category/${router.query.category}?${queryParams}`);
      }

      const data = await response.json();

      if (data.success) {
        setRecipes(data.data.recipes);
        setHasMore(data.data.pagination.hasNextPage);
      }
    } catch (error) {
      console.error('Filter error:', error);
      // Revert URL on error
      updateURL(filters);
    } finally {
      setLoading(false);
      // Add delay to prevent rapid clicking and ensure URL sync
      setTimeout(() => setIsUpdating(false), 600);
    }
  }, [filters, router.query.category, language, updateURL, isUpdating]);

  // Load more recipes for infinite scroll
  const loadMoreRecipes = useCallback(async () => {
    if (loading) return;

    try {
      const filterParams = Object.entries(filters)
        .filter(([_, values]) => values.length > 0)
        .map(([key, values]) => `${key}:${values.join(',')}`)
        .join(',');

      const queryParams = new URLSearchParams({
        ...(filterParams && { filters: filterParams }),
        page: (currentPage + 1).toString(),
        limit: '8',
        language
      });

      const response = await fetch(`/api/recipes/category/${router.query.category}?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setRecipes(prev => [...prev, ...data.data.recipes]);
        setCurrentPage(prev => prev + 1);
        setHasMore(data.data.pagination.hasNextPage);
      }
    } catch (error) {
      console.error('Load more error:', error);
    }
  }, [filters, currentPage, router.query.category, language, loading]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({});
    setLoading(true);
    setCurrentPage(1);

    // Fetch unfiltered recipes
    fetch(`/api/recipes/category/${router.query.category}?page=1&limit=8&language=${language}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRecipes(data.data.recipes);
          setHasMore(data.data.pagination.hasNextPage);
          router.push(`/receptai/${router.query.category}`, undefined, { shallow: true });
        }
      })
      .finally(() => setLoading(false));
  }, [router, language]);

  // Generate breadcrumbs
  const breadcrumbs = generateCategoryBreadcrumbs(
    router.query.category as string,
    undefined,
    initialData.category
  );

  return (
    <>
      <Head>
        <title>{initialData.category.title}</title>
        <meta name="description" content={initialData.category.description} />
        <link rel="canonical" href={`${process.env.NEXT_PUBLIC_SITE_URL}${initialData.category.canonicalUrl}`} />
        <meta property="og:title" content={initialData.category.title} />
        <meta property="og:description" content={initialData.category.description} />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_SITE_URL}${initialData.category.canonicalUrl}`} />
        <meta property="og:type" content="website" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-orange-50 to-gray-100">
        {/* Breadcrumb Navigation */}
        <Breadcrumb items={breadcrumbs} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto">
          {/* Category Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {initialData.category.title.replace(' - Paragaujam.lt', '')}
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              {initialData.category.description}
            </p>

            {/* Filter Pills */}
            <FilterPills
              availableFilters={initialData.availableFilters}
              activeFilters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
            />
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          )}

          {/* Recipes Grid */}
          {!loading && (
            <div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {recipes.map((recipe) => (
                  <NewRecipeCard
                    key={recipe._id}
                    recipe={recipe}
                    language={language}
                  />
                ))}
              </div>

              {/* Load More Button (temporary replacement for infinite scroll) */}
              {hasMore && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={loadMoreRecipes}
                    className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Rodyti daugiau receptų
                  </button>
                </div>
              )}

              {!hasMore && recipes.length > 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>Visi receptai parodyti!</p>
                </div>
              )}
            </div>
          )}

          {/* No Results */}
          {!loading && recipes.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Receptų nerasta
              </h3>
              <p className="text-gray-600 mb-4">
                Pabandykite pakeisti filtrus arba išvalyti visus filtrus.
              </p>
              <button
                onClick={clearFilters}
                className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Išvalyti filtrus
              </button>
            </div>
          )}
          </div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params, query }) => {
  const category = params?.category as string;
  const language = (query.language as string) || 'lt';

  try {
    // Fetch initial data for the category page
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const queryParams = new URLSearchParams({
      page: '1',
      limit: '8',
      language,
      ...(query.filters && { filters: query.filters as string })
    });

    // Try new categories API first
    let response = await fetch(`${baseUrl}/api/categories/${category}?${queryParams}`);

    if (!response.ok) {
      // Fallback to old API
      response = await fetch(`${baseUrl}/api/recipes/category/${category}?${queryParams}`);

      if (!response.ok) {
        return { notFound: true };
      }
    }

    const data = await response.json();

    if (!data.success) {
      return { notFound: true };
    }

    return {
      props: {
        initialData: data.data,
        language
      }
    };

  } catch (error) {
    console.error('Category page error:', error);
    return { notFound: true };
  }
};
