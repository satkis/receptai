// Updated Category Pages - Direct URL without /receptu-tipai
// URL: domain.lt/patiekalo-tipas/karsti-patiekalai

import { useState } from 'react';
import { GetStaticProps, GetStaticPaths } from 'next';
import clientPromise, { DATABASE_NAME } from '../lib/mongodb';
import Head from 'next/head';
import { useRouter } from 'next/router';
import PlaceholderImage from '../components/ui/PlaceholderImage';
import CategoryMenu from '../components/navigation/CategoryMenu';

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
  recipeCount?: number;
}

interface Recipe {
  _id: string;
  slug: string;
  title: { lt: string; en?: string };
  description: { lt: string; en?: string };
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
  tags: string[];
  ingredients?: Array<{
    name: { lt: string };
    vital?: boolean;
  }>;
}

interface CategoryPageProps {
  category: Category;
  recipes: Recipe[];
  pagination: {
    current: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  activeTimeFilter: string | null;
  activeFilter: string | null;
  recipeCount: number;
}

// Breadcrumb Component
function Breadcrumb({ items }: { items: Array<{ title: string; url: string; current?: boolean }> }) {
  return (
    <nav className="flex mb-6" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3 overflow-x-auto">
        {items.map((item, index) => (
          <li key={index} className="inline-flex items-center whitespace-nowrap">
            {index > 0 && (
              <svg className="w-3 h-3 text-gray-400 mx-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {item.current ? (
              <span className="text-gray-500 text-sm font-medium">{item.title}</span>
            ) : (
              <a href={item.url} className="text-gray-700 hover:text-orange-600 text-sm font-medium">
                {item.title}
              </a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Category Header
function CategoryHeader({ category, recipeCount }: { category: Category; recipeCount: number }) {
  const countText = recipeCount > 100 ? "100+" : recipeCount.toString();

  return (
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
          {countText} receptai
        </span>
        <span>Kategorija: {category.level} lygis</span>
      </div>
    </div>
  );
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
        {allFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => onFilterChange(filter.value === activeFilter ? null : filter.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeFilter === filter.value
                ? "bg-orange-100 text-orange-800 border border-orange-200"
                : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
            }`}
          >
            {filter.label}
          </button>
        ))}
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
        {timeFilters.map((filter) => (
          <button
            key={filter}
            onClick={() => onFilterChange(filter === activeFilter ? null : filter)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeFilter === filter
                ? "bg-orange-100 text-orange-800 border border-orange-200"
                : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
            }`}
          >
            {timeFilterLabels[filter] || filter}
          </button>
        ))}
      </div>
    </div>
  );
}

// Enhanced Recipe Card Component
function RecipeCard({ recipe }: { recipe: Recipe }) {
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
      href={`/receptas/${recipe.slug}`}
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 block group"
    >
      <div className="relative h-48">
        <PlaceholderImage
          src={recipe.image?.url || '/placeholder-recipe.jpg'}
          alt={recipe.image?.alt || recipe.title.lt}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Enhanced Time/Servings Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {/* Time - High contrast for visibility */}
          <div className="bg-orange-500 text-white px-2 py-1 rounded-md text-xs font-semibold shadow-lg">
            ⏱️ {recipe.totalTimeMinutes} min
          </div>
          {/* Servings - More blended */}
          <div className="bg-black/60 backdrop-blur-sm text-white/90 px-2 py-1 rounded-md text-xs">
            👥 {recipe.servings} {recipe.servingsUnit || 'porcijos'}
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-orange-600 transition-colors">
          {recipe.title.lt}
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
                  {ingredient.name.lt}
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
          Pabandykite pakeisti filtrus arba ieškoti kitoje kategorijoje.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe._id} recipe={recipe} />
      ))}
    </div>
  );
}

// Pagination Component
function Pagination({ pagination, onPageChange }: { 
  pagination: CategoryPageProps['pagination'];
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

export default function CategoryPage({
  category,
  recipes,
  pagination,
  activeTimeFilter,
  activeFilter,
  recipeCount
}: CategoryPageProps) {
  const router = useRouter();

  const handleTimeFilterChange = (filter: string | null) => {
    const query = { ...router.query };

    if (filter) {
      query.timeFilter = filter;
    } else {
      delete query.timeFilter;
    }

    // Reset to page 1 when filter changes
    delete query.page;

    router.push({ pathname: router.asPath.split('?')[0], query }, undefined, { shallow: true });
  };

  const handleFilterChange = (filter: string | null) => {
    const query = { ...router.query };

    if (filter) {
      query.filter = filter;
    } else {
      delete query.filter;
    }

    // Reset to page 1 when filter changes
    delete query.page;

    router.push({ pathname: router.asPath.split('?')[0], query }, undefined, { shallow: true });
  };

  const handlePageChange = (page: number) => {
    const query = { ...router.query, page: page.toString() };
    router.push({ pathname: router.asPath.split('?')[0], query }, undefined, { shallow: true });
  };

  // Generate breadcrumbs (simplified for now)
  const breadcrumbs = [
    { title: "Receptai", url: "/receptai" },
    { title: category.title.lt, url: `/receptai/${category.path}`, current: true }
  ];

  return (
    <>
      <Head>
        <title>{category.seo.metaTitle}</title>
        <meta name="description" content={category.seo.metaDescription} />
        <meta name="keywords" content={category.seo.keywords.join(', ')} />
        <link rel="canonical" href={`https://paragaujam.lt/${category.path}`} />

        {/* Open Graph */}
        <meta property="og:title" content={category.seo.metaTitle} />
        <meta property="og:description" content={category.seo.metaDescription} />
        <meta property="og:url" content={`https://paragaujam.lt/${category.path}`} />
        <meta property="og:type" content="website" />

        {/* Breadcrumb Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": breadcrumbs.map((item, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "name": item.title,
                "item": `https://paragaujam.lt${item.url}`
              }))
            })
          }}
        />
      </Head>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumbs - Full Width */}
        <div className="mb-6">
          <Breadcrumb items={breadcrumbs} />
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
            <CategoryHeader category={category} recipeCount={recipeCount} />

            {/* Category Filters */}
            <CategoryFilters
              category={category}
              activeFilter={activeFilter}
              onFilterChange={handleFilterChange}
            />

            {/* Time Filters */}
            <TimeFilter
              timeFilters={category.filters.timeFilters}
              activeFilter={activeTimeFilter}
              onFilterChange={handleTimeFilterChange}
            />

            {/* Recipe Grid */}
            <RecipeGrid recipes={recipes} />

            {/* Pagination */}
            <Pagination pagination={pagination} onPageChange={handlePageChange} />
          </div>
        </div>
      </div>
    </>
  );
}

// ISR for category pages - 2 hour revalidation for daily recipe additions
export const getStaticProps: GetStaticProps = async ({ params }) => {
  const categoryPath = (params?.category as string[])?.join('/');

  if (!categoryPath) {
    return { notFound: true };
  }

  try {
    // 🚀 Use shared MongoDB client for better performance
    const client = await clientPromise;
    const db = client.db(DATABASE_NAME);

    // Get category
    const category = await db.collection('categories_new').findOne({ path: categoryPath });
    console.log('🔍 Category lookup:', { categoryPath, found: !!category });

    if (category) {
      console.log('📋 Category filters:', category.filters);
    }

    if (!category) {
      return { notFound: true };
    }

    // Build recipe query using correct category fields (ISR - no dynamic filters)
    const categoryPathForQuery = `receptai/${categoryPath}`;
    const recipeQuery: any = {
      $or: [
        { primaryCategoryPath: categoryPathForQuery },
        { secondaryCategories: { $in: [categoryPathForQuery] } }
      ]
    };

    // For ISR: Show first page without filters (filters will be client-side)
    const page = 1;
    const limit = 16; // Show 16 recipes per page
    const skip = (page - 1) * limit;

    // Get recipes and count
    console.log('🔍 Recipe query:', recipeQuery);
    const [recipes, totalCount] = await Promise.all([
      db.collection('recipes_new')
        .find(recipeQuery)
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection('recipes_new').countDocuments(recipeQuery)
    ]);

    console.log('📊 Found recipes:', { count: totalCount, recipeTitles: recipes.map(r => r.title?.lt) });

    // ✅ Don't close shared client - it's managed by the connection pool

    return {
      props: {
        category: JSON.parse(JSON.stringify(category)),
        recipes: JSON.parse(JSON.stringify(recipes)),
        pagination: {
          current: page,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
          hasNext: page * limit < totalCount,
          hasPrev: page > 1
        },
        activeTimeFilter: null, // No filters in ISR
        activeFilter: null, // No filters in ISR
        recipeCount: totalCount
      },
      // ISR: TESTING MODE - Instant revalidation (change back to 7200 for production)
      revalidate: process.env.NODE_ENV === 'development' ? 1 : 7200
    };
  } catch (error) {
    console.error('Error fetching category page:', error);
    return { notFound: true };
  }
};

// Generate static paths for popular categories
export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const client = await clientPromise;
    const db = client.db(DATABASE_NAME);

    // Pre-generate paths for active categories
    const categories = await db.collection('categories_new')
      .find({ isActive: true })
      .project({ path: 1 })
      .limit(20) // Pre-generate top 20 categories
      .toArray();

    const paths = categories.map((category) => ({
      params: { category: category.path.split('/') }
    }));

    return {
      paths,
      // Enable ISR for all other categories
      fallback: 'blocking'
    };
  } catch (error) {
    console.error('Error generating static paths:', error);
    return {
      paths: [],
      fallback: 'blocking'
    };
  }
};
