// Dynamic Subcategory Page
// /receptai/[category]/[subcategory] - e.g., /receptai/vistiena/salotos

import { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import Head from 'next/head';

import CardRecipe from '../../../components/recipe/CardRecipe';
import FilterPills from '../../../components/filter/FilterPills';
import Breadcrumb, { generateCategoryBreadcrumbs } from '../../../components/navigation/Breadcrumb';

interface Recipe {
  _id: string;
  title: { lt: string; en?: string };
  slug: string;
  description: { lt: string; en?: string };
  image: string;
  totalTimeMinutes: number;
  servings: number;
  ingredients: Array<{
    name: { lt: string; en?: string };
    quantity: string;
    vital: boolean;
  }>;
  categories: {
    main: string;
    sub: string;
    cuisine?: string;
    timeGroup?: string;
    dietary?: string[];
  };
  breadcrumb: {
    main: { label: string; slug: string };
    sub: { label: string; slug: string };
  };
  rating: { average: number; count: number };
}

interface SubcategoryPageProps {
  initialData: {
    category: {
      _id: string;
      label: { lt: string; en: string };
      slug: string;
      type: string;
      title: string;
      description: string;
      canonicalUrl: string;
    };
    subcategory: {
      label: string;
      slug: string;
      title: string;
      description: string;
    };
    recipes: Recipe[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalRecipes: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
      limit: number;
    };
    availableFilters: { [key: string]: any };
  };
  language: string;
}

export default function SubcategoryPage({ initialData, language }: SubcategoryPageProps) {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>(initialData.recipes);
  const [filters, setFilters] = useState<{ [key: string]: string[] }>({});
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialData.pagination.hasNextPage);
  const [currentPage, setCurrentPage] = useState(1);
  const [isUpdating, setIsUpdating] = useState(false);

  // Update URL without page reload when filters change
  const updateURL = useCallback((newFilters: { [key: string]: string[] }) => {
    const filterParams = Object.entries(newFilters)
      .filter(([_, values]) => values.length > 0)
      .map(([key, values]) => `${key}:${values.join(',')}`)
      .join(',');

    const query = filterParams ? `?filters=${filterParams}` : '';
    const newUrl = `/receptai/${router.query.category}/${router.query.subcategory}${query}`;
    
    router.push(newUrl, undefined, { shallow: true });
  }, [router]);

  // Handle filter changes
  const handleFilterChange = useCallback(async (filterType: string, value: string, isActive: boolean) => {
    if (isUpdating) return;
    setIsUpdating(true);

    const newFilters = { ...filters };
    
    if (!newFilters[filterType]) {
      newFilters[filterType] = [];
    }

    // Single selection filter types
    const singleSelectionTypes = ['timeRequired', 'mainIngredient'];

    if (isActive) {
      if (singleSelectionTypes.includes(filterType)) {
        newFilters[filterType] = [value];
      } else {
        if (!newFilters[filterType].includes(value)) {
          newFilters[filterType].push(value);
        }
      }
    } else {
      newFilters[filterType] = newFilters[filterType].filter(v => v !== value);
      if (newFilters[filterType].length === 0) {
        delete newFilters[filterType];
      }
    }

    setFilters(newFilters);
    updateURL(newFilters);
    setLoading(true);
    setCurrentPage(1);

    try {
      const filterParams = Object.entries(newFilters)
        .filter(([_, values]) => values.length > 0)
        .map(([key, values]) => `${key}:${values.join(',')}`)
        .join(',');

      const queryParams = new URLSearchParams({
        ...(filterParams && { filters: filterParams }),
        page: '1',
        limit: '12',
        language
      });

      const response = await fetch(`/api/subcategories/${router.query.category}/${router.query.subcategory}?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setRecipes(data.data.recipes);
        setHasMore(data.data.pagination.hasNextPage);
      }
    } catch (error) {
      console.error('Filter error:', error);
      updateURL(filters);
    } finally {
      setLoading(false);
      setTimeout(() => setIsUpdating(false), 600);
    }
  }, [filters, router.query.category, router.query.subcategory, language, updateURL, isUpdating]);

  // Load more recipes
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
        limit: '12',
        language
      });

      const response = await fetch(`/api/subcategories/${router.query.category}/${router.query.subcategory}?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setRecipes(prev => [...prev, ...data.data.recipes]);
        setCurrentPage(prev => prev + 1);
        setHasMore(data.data.pagination.hasNextPage);
      }
    } catch (error) {
      console.error('Load more error:', error);
    }
  }, [filters, currentPage, router.query.category, router.query.subcategory, language, loading]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({});
    setLoading(true);
    setCurrentPage(1);

    fetch(`/api/subcategories/${router.query.category}/${router.query.subcategory}?page=1&limit=12&language=${language}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRecipes(data.data.recipes);
          setHasMore(data.data.pagination.hasNextPage);
          router.push(`/receptai/${router.query.category}/${router.query.subcategory}`, undefined, { shallow: true });
        }
      })
      .finally(() => setLoading(false));
  }, [router, language]);

  // Generate breadcrumbs
  const breadcrumbs = generateCategoryBreadcrumbs(
    router.query.category as string,
    router.query.subcategory as string,
    initialData.category
  );

  return (
    <>
      <Head>
        <title>{initialData.subcategory.title}</title>
        <meta name="description" content={initialData.subcategory.description} />
        <link rel="canonical" href={`${process.env.NEXT_PUBLIC_SITE_URL}/receptai/${router.query.category}/${router.query.subcategory}`} />
        <meta property="og:title" content={initialData.subcategory.title} />
        <meta property="og:description" content={initialData.subcategory.description} />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_SITE_URL}/receptai/${router.query.category}/${router.query.subcategory}`} />
        <meta property="og:type" content="website" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-orange-50 to-gray-100">
        {/* Breadcrumb Navigation */}
        <Breadcrumb items={breadcrumbs} />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto">
          {/* Subcategory Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {initialData.subcategory.label}
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              {initialData.subcategory.description}
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
                  <CardRecipe
                    key={recipe._id}
                    recipe={recipe}
                    language={language}
                  />
                ))}
              </div>

              {/* Load More Button */}
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
                Šioje subkategorijoje receptų dar nėra arba pabandykite pakeisti filtrus.
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
  const subcategory = params?.subcategory as string;
  const language = (query.language as string) || 'lt';

  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const queryParams = new URLSearchParams({
      page: '1',
      limit: '12',
      language,
      ...(query.filters && { filters: query.filters as string })
    });

    const response = await fetch(`${baseUrl}/api/subcategories/${category}/${subcategory}?${queryParams}`);
    
    if (!response.ok) {
      return { notFound: true };
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
    console.error('Subcategory page error:', error);
    return { notFound: true };
  }
};
