// Updated Category Pages - Direct URL without /receptu-tipai
// URL: domain.lt/patiekalo-tipas/karsti-patiekalai

import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { MongoClient } from 'mongodb';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '../components/layout/Layout';
import PlaceholderImage from '../components/ui/PlaceholderImage';

interface Category {
  _id: string;
  title: { lt: string; en?: string };
  slug: string;
  path: string;
  level: number;
  parentCategory: string;
  parentSlug: string;
  description: { lt: string; en?: string };
  icon: string;
  recipeCount: number;
  ancestors: Array<{
    _id: string;
    title: string;
    slug: string;
    path: string;
    level: number;
  }>;
  availableTimeFilters: Array<{
    value: string;
    label: string;
    count: number;
  }>;
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
}

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
function CategoryHeader({ category }: { category: Category }) {
  const countText = category.recipeCount > 100 ? "100+" : category.recipeCount.toString();
  
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
      <div className="flex items-center gap-4 mb-4">
        <span className="text-4xl">{category.icon}</span>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {category.title.lt}
          </h1>
          <p className="text-gray-600 mt-2">
            {category.description.lt}
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

// Time Filter Component (Exclusive Selection)
function TimeFilter({ 
  availableFilters, 
  activeFilter, 
  onFilterChange 
}: { 
  availableFilters: Category['availableTimeFilters'];
  activeFilter: string | null;
  onFilterChange: (filter: string | null) => void;
}) {
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
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {recipe.title.lt}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {recipe.description.lt}
        </p>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span>🕒 {recipe.totalTimeMinutes} min</span>
            <span>👥 {recipe.servings}</span>
          </div>
          {recipe.rating.count > 0 && (
            <span>⭐ {recipe.rating.average.toFixed(1)}</span>
          )}
        </div>
        <div className="flex flex-wrap gap-1 mt-3">
          {recipe.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
            >
              {tag}
            </span>
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
          Pabandykite pakeisti filtrus arba ieškoti kitoje kategorijoje.
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
  activeTimeFilter
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

  const handlePageChange = (page: number) => {
    const query = { ...router.query, page: page.toString() };
    router.push({ pathname: router.asPath.split('?')[0], query }, undefined, { shallow: true });
  };

  // Generate breadcrumbs
  const breadcrumbs = [
    { title: "Pagrindinis", url: "/" },
    ...category.ancestors.map(ancestor => ({
      title: ancestor.title,
      url: `/${ancestor.path}`
    })),
    { title: category.title.lt, url: `/${category.path}`, current: true }
  ];

  return (
    <Layout>
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

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumb items={breadcrumbs} />

        {/* Category Header */}
        <CategoryHeader category={category} />

        {/* Time Filters */}
        <TimeFilter
          availableFilters={category.availableTimeFilters}
          activeFilter={activeTimeFilter}
          onFilterChange={handleTimeFilterChange}
        />

        {/* Recipe Grid */}
        <RecipeGrid recipes={recipes} />

        {/* Pagination */}
        <Pagination pagination={pagination} onPageChange={handlePageChange} />
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params, query }) => {
  const categoryPath = (params?.category as string[])?.join('/');

  if (!categoryPath) {
    return { notFound: true };
  }

  try {
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db();

    // Get category
    const category = await db.collection('categories_new').findOne({ path: categoryPath });

    if (!category) {
      await client.close();
      return { notFound: true };
    }

    // Build recipe query
    const recipeQuery: any = {
      allCategories: categoryPath
    };

    // Add time filter if specified
    const timeFilter = query.timeFilter as string;
    if (timeFilter) {
      recipeQuery.timeCategory = timeFilter;
    }

    // Pagination
    const page = parseInt(query.page as string) || 1;
    const limit = 12;
    const skip = (page - 1) * limit;

    // Get recipes and count
    const [recipes, totalCount] = await Promise.all([
      db.collection('recipes_new')
        .find(recipeQuery)
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection('recipes_new').countDocuments(recipeQuery)
    ]);

    await client.close();

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
        activeTimeFilter: timeFilter || null
      }
    };
  } catch (error) {
    console.error('Error fetching category page:', error);
    return { notFound: true };
  }
};
