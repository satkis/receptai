// Dynamic Category Page
// /receptai/[category] - e.g., /receptai/karsti-patiekalai

import { useState } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { MongoClient } from 'mongodb';
import { useRouter } from 'next/router';

import Breadcrumb from '../../../components/navigation/Breadcrumb';
import CategoryMenu from '../../../components/navigation/CategoryMenu';

interface Category {
  _id: string;
  title: { lt: string; en?: string };
  slug: string;
  path: string;
  level: number;
  parentPath: string | null;
  filters: {
    manual: Array<{
      value: string;
      label: string;
      priority: number;
    }>;
    auto: Array<{
      value: string;
      label: string;
    }>;
    timeFilters: string[];
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    canonicalUrl: string;
  };
  isActive: boolean;
}

interface Recipe {
  _id: string;
  title: string | { lt: string; en?: string };
  slug: string;
  description: string | { lt: string; en?: string };
  image: {
    url: string;
    alt: string;
    width: number;
    height: number;
    blurHash?: string;
  };
  totalTimeMinutes: number;
  servings: number;
  servingsUnit?: string;
  ingredients: Array<{
    name: string | { lt: string; en?: string };
    quantity: string;
    vital?: boolean;
  }>;
  categoryPath: string;
  tags: string[];
}

interface CategoryPageProps {
  category: Category;
  recipes: Recipe[];
  totalRecipes: number;
  activeTimeFilter: string | null;
  activeFilter: string | null;
}

// Category Filters Component (Manual + Auto filters)
function CategoryFilters({
  category,
  activeFilter,
  onFilterChange
}: {
  category: Category;
  activeFilter: string | null;
  onFilterChange: (filter: string | null) => void;
}) {
  // Combine manual and auto filters, sort by priority
  const allFilters = [
    ...category.filters.manual.sort((a, b) => a.priority - b.priority),
    ...category.filters.auto
  ];

  if (allFilters.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filtrai</h3>
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
        {allFilters.map((filter) => {
          const isActive = activeFilter === filter.value;
          return (
            <button
              key={filter.value}
              onClick={() => onFilterChange(filter.value === activeFilter ? null : filter.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                isActive
                  ? "bg-orange-500 text-white border-orange-500 shadow-md"
                  : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Time Filter Component (Exclusive Selection)
function TimeFilter({
  timeFilters,
  activeFilter,
  onFilterChange
}: {
  timeFilters: string[];
  activeFilter: string | null;
  onFilterChange: (filter: string | null) => void;
}) {
  if (timeFilters.length === 0) return null;

  const timeFilterLabels: Record<string, string> = {
    "iki-30-min": "Iki 30 min",
    "30-60-min": "30-60 min",
    "1-2-val": "1-2 val",
    "virs-2-val": "Virš 2 val"
  };

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
        {timeFilters.map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => onFilterChange(filter === activeFilter ? null : filter)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                isActive
                  ? "bg-orange-500 text-white border-orange-500 shadow-md"
                  : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
              }`}
            >
              {timeFilterLabels[filter] || filter}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Enhanced Recipe Card Component
function RecipeCard({ recipe, category }: { recipe: Recipe; category: Category }) {
  const [showAllIngredients, setShowAllIngredients] = useState(false);

  // Get vital ingredients (first 3 most important ones)
  const vitalIngredients = recipe.ingredients?.filter(ing => ing.vital) || [];
  const allIngredients = recipe.ingredients || [];
  const displayIngredients = vitalIngredients.length > 0 ? vitalIngredients : allIngredients;
  const ingredientsToShow = showAllIngredients ? allIngredients : displayIngredients.slice(0, 3);
  const remainingCount = allIngredients.length - ingredientsToShow.length;

  const handleIngredientsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowAllIngredients(!showAllIngredients);
  };

  const handleIngredientsContainerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (showAllIngredients) {
      setShowAllIngredients(false);
    }
  };

  return (
    <a
      href={`/receptas/${recipe.slug}?from=${encodeURIComponent(`receptai/${category.path}`)}`}
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 block group"
    >
      <div className="relative h-48">
        <img
          src={
            typeof recipe.image === 'string'
              ? recipe.image
              : (recipe.image as any)?.src || (recipe.image as any)?.url || '/placeholder-recipe.jpg'
          }
          alt={
            typeof recipe.image === 'string'
              ? (typeof recipe.title === 'string' ? recipe.title : recipe.title?.lt || 'Receptas')
              : (recipe.image as any)?.alt || (typeof recipe.title === 'string' ? recipe.title : recipe.title?.lt || 'Receptas')
          }
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Enhanced Time/Servings Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {/* Time - High contrast for visibility */}
          <div className="bg-orange-500 text-white px-2 py-1 rounded-md text-xs font-semibold shadow-lg">
            ⏱️ {recipe.totalTimeMinutes} min
          </div>
          {/* Servings - More blended */}
          <div className="bg-black/60 backdrop-blur-sm text-white/90 px-2 py-1 rounded-md text-xs">
            👥 {recipe.servings} porcijos
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-orange-600 transition-colors">
          {typeof recipe.title === 'string' ? recipe.title : recipe.title?.lt || 'Receptas'}
        </h3>

        {/* Ingredients Section - Replaces Description */}
        {allIngredients.length > 0 && (
          <div
            className="mb-3"
            onClick={handleIngredientsContainerClick}
          >
            <div className="flex flex-wrap gap-1.5">
              {ingredientsToShow.map((ingredient, index) => (
                <span
                  key={index}
                  className="text-xs bg-orange-50 text-orange-700 px-2.5 py-1.5 rounded-full border border-orange-100 font-medium"
                >
                  {typeof ingredient.name === 'string' ? ingredient.name : ingredient.name?.lt || 'Ingredientas'}
                </span>
              ))}
              {remainingCount > 0 && (
                <button
                  onClick={handleIngredientsClick}
                  className="text-xs bg-orange-100 text-orange-600 px-2.5 py-1.5 rounded-full hover:bg-orange-200 transition-colors font-medium border border-orange-200"
                >
                  +{remainingCount}
                </button>
              )}
            </div>
          </div>
        )}


      </div>
    </a>
  );
}

export default function CategoryPage({
  category,
  recipes: initialRecipes,
  totalRecipes,
  activeTimeFilter,
  activeFilter
}: CategoryPageProps) {
  const router = useRouter();
  const [filteredRecipes, setFilteredRecipes] = useState(initialRecipes);
  const [currentTimeFilter, setCurrentTimeFilter] = useState(activeTimeFilter);
  const [currentFilter, setCurrentFilter] = useState(activeFilter);

  // Client-side filtering function
  const applyFilters = (recipes: Recipe[], timeFilter: string | null, tagFilter: string | null) => {
    let filtered = [...recipes];

    // Apply tag filter
    if (tagFilter) {
      filtered = filtered.filter(recipe =>
        recipe.tags && recipe.tags.includes(tagFilter)
      );
    }

    // Apply time filter
    if (timeFilter) {
      filtered = filtered.filter(recipe => {
        const time = recipe.totalTimeMinutes;
        switch (timeFilter) {
          case 'iki-30-min':
            return time <= 30;
          case '30-60-min':
            return time > 30 && time <= 60;
          case '1-2-val':
            return time > 60 && time <= 120;
          case 'virs-2-val':
            return time > 120;
          default:
            return true;
        }
      });
    }

    return filtered;
  };

  const handleTimeFilterChange = (filter: string | null) => {
    setCurrentTimeFilter(filter);
    const newFiltered = applyFilters(initialRecipes, filter, currentFilter);
    setFilteredRecipes(newFiltered);

    // Update URL without page reload
    const query = { ...router.query };
    if (filter) {
      query.timeFilter = filter;
    } else {
      delete query.timeFilter;
    }
    delete query.page;
    router.push({ pathname: router.asPath.split('?')[0], query }, undefined, { shallow: true });
  };

  const handleFilterChange = (filter: string | null) => {
    setCurrentFilter(filter);
    const newFiltered = applyFilters(initialRecipes, currentTimeFilter, filter);
    setFilteredRecipes(newFiltered);

    // Update URL without page reload
    const query = { ...router.query };
    if (filter) {
      query.filter = filter;
    } else {
      delete query.filter;
    }
    delete query.page;
    router.push({ pathname: router.asPath.split('?')[0], query }, undefined, { shallow: true });
  };

  // Generate breadcrumbs
  const breadcrumbs = [
    { label: 'Receptai', href: '/receptai' },
    { label: category.title.lt, isActive: true }
  ];

  return (
    <>
      <Head>
        <title>{category.seo.metaTitle}</title>
        <meta name="description" content={category.seo.metaDescription} />
        <meta name="keywords" content={category.seo.keywords.join(', ')} />
        <link rel="canonical" href={category.seo.canonicalUrl} />
      </Head>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumbs - Full Width */}
        <div className="mb-6">
          <Breadcrumb items={breadcrumbs} containerless={true} />
        </div>

        {/* Main Layout: Sidebar + Content */}
        <div className="flex gap-8">
          {/* Categories Sidebar - Medium screens and up */}
          <div className="hidden md:block">
            <CategoryMenu isVisible={true} isMobile={false} />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Category Header */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-4xl">🍽️</span>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {category.title.lt}
                  </h1>
                  <p className="text-gray-600 mt-2">
                    {category.seo.metaDescription}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full font-medium">
                  {filteredRecipes.length} {filteredRecipes.length !== totalRecipes ? `iš ${totalRecipes}` : ''} receptai
                </span>
                <span>Kategorija: {category.level} lygis</span>
              </div>
            </div>

            {/* Category Filters */}
            <CategoryFilters
              category={category}
              activeFilter={currentFilter}
              onFilterChange={handleFilterChange}
            />

            {/* Time Filters */}
            <TimeFilter
              timeFilters={category.filters.timeFilters}
              activeFilter={currentTimeFilter}
              onFilterChange={handleTimeFilterChange}
            />

            {/* Enhanced Recipe Grid */}
            {filteredRecipes.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
                {filteredRecipes.map((recipe) => (
                  <RecipeCard key={recipe._id} recipe={recipe} category={category} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gray-50 rounded-lg p-8">
                  <h2 className="text-xl font-semibold text-gray-700 mb-2">Receptų nerasta</h2>
                  <p className="text-gray-500">
                    {currentFilter || currentTimeFilter
                      ? "Su pasirinktais filtrais receptų nerasta. Pabandykite pakeisti filtrus."
                      : `Šioje kategorijoje "${category.title.lt}" receptų dar nėra.`
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params, query }) => {
  const categorySlug = params?.category as string;

  if (!categorySlug) {
    return { notFound: true };
  }

  try {
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db();

    // Get category from categories_new collection
    const category = await db.collection('categories_new').findOne({ path: categorySlug });
    console.log('🔍 Category lookup:', { categorySlug, found: !!category });

    if (category) {
      console.log('📋 Category filters:', category.filters);
    }

    if (!category) {
      await client.close();
      return { notFound: true };
    }

    // Build recipe query using both primaryCategoryPath and secondaryCategories
    const categoryPath = `receptai/${categorySlug}`;
    const recipeQuery: any = {
      $or: [
        { primaryCategoryPath: categoryPath },
        { secondaryCategories: categoryPath }
      ]
    };

    // Add manual filter if specified
    const filter = query.filter as string;
    if (filter) {
      recipeQuery.tags = { $in: [filter] }; // Use $in to match array elements
    }

    // Add time filter if specified
    const timeFilter = query.timeFilter as string;
    if (timeFilter) {
      // Convert time filter to minutes range
      switch (timeFilter) {
        case 'iki-30-min':
          recipeQuery.totalTimeMinutes = { $lte: 30 };
          break;
        case '30-60-min':
          recipeQuery.totalTimeMinutes = { $gt: 30, $lte: 60 };
          break;
        case '1-2-val':
          recipeQuery.totalTimeMinutes = { $gt: 60, $lte: 120 };
          break;
        case 'virs-2-val':
          recipeQuery.totalTimeMinutes = { $gt: 120 };
          break;
      }
    }

    console.log('🔍 Recipe query:', recipeQuery);
    console.log('🔍 Looking for categoryPath in primaryCategoryPath OR secondaryCategories:', categoryPath);

    // Get recipes
    const recipes = await db.collection('recipes_new')
      .find(recipeQuery)
      .sort({ featured: -1, createdAt: -1 })
      .limit(16)
      .toArray();

    const totalRecipes = await db.collection('recipes_new').countDocuments(recipeQuery);

    console.log('📊 Found recipes:', { count: totalRecipes, recipeTitles: recipes.map(r => r.title?.lt) });

    await client.close();

    return {
      props: {
        category: JSON.parse(JSON.stringify(category)),
        recipes: JSON.parse(JSON.stringify(recipes)),
        totalRecipes,
        activeTimeFilter: timeFilter || null,
        activeFilter: filter || null
      }
    };
  } catch (error) {
    console.error('Error fetching category recipes:', error);
    return { notFound: true };
  }
};
