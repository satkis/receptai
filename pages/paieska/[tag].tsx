// Tag Search Page
// URL: domain.lt/paieska/tag-value

import { useState } from 'react';
import { GetServerSideProps } from 'next';
import { MongoClient } from 'mongodb';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '../../components/layout/Layout';
import PlaceholderImage from '../../components/ui/PlaceholderImage';

interface Tag {
  _id: string;
  name: string;
  slug: string;
  recipeCount: number;
  description: string;
  relatedTags: string[];
  popularityScore: number;
  trending: boolean;
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
  categoryPath: string;
}

interface TagPageProps {
  tag: Tag;
  recipes: Recipe[];
  relatedTags: Tag[];
  pagination: {
    current: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Tag Header Component
function TagHeader({ tag, recipeCount }: { tag: Tag; recipeCount: number }) {
  const countText = recipeCount > 100 ? "100+" : recipeCount.toString();
  
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
          <span className="text-2xl">🔍</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Receptai su "{tag.name}"
          </h1>
          <p className="text-gray-600 mt-2">
            {tag.description}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-4 text-sm">
        <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full font-medium">
          {countText} receptai
        </span>
        <span className="text-gray-600">
          Populiarumas: {tag.popularityScore.toFixed(1)}/10
        </span>
        {tag.trending && (
          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full font-medium">
            🔥 Populiaru
          </span>
        )}
      </div>
    </div>
  );
}

// Related Tags Component
function RelatedTags({ tags, currentTag }: { tags: Tag[]; currentTag: string }) {
  const router = useRouter();
  
  const handleTagClick = (tagSlug: string) => {
    router.push(`/paieska/${tagSlug}`);
  };

  if (tags.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Susiję žymenys
      </h2>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag._id}
            onClick={() => handleTagClick(tag.slug)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
          >
            {tag.name}
            <span className="text-xs text-gray-500">
              ({tag.recipeCount})
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
        
        {/* Category breadcrumb */}
        <div className="text-xs text-gray-500 mb-2">
          {recipe.categoryPath.split('/').join(' › ')}
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span>🕒 {recipe.totalTimeMinutes} min</span>
            <span>👥 {recipe.servings}</span>
            <span className="capitalize">{recipe.difficulty}</span>
          </div>
          {recipe.rating.count > 0 && (
            <span>⭐ {recipe.rating.average.toFixed(1)}</span>
          )}
        </div>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-3">
          {recipe.tags.slice(0, 4).map((tag, index) => (
            <span
              key={index}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
          {recipe.tags.length > 4 && (
            <span className="text-xs text-gray-500">+{recipe.tags.length - 4}</span>
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
          Receptų su šiuo žymeniu nerasta
        </h3>
        <p className="text-gray-600">
          Pabandykite ieškoti kito žymens arba naršykite kategorijas.
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
  pagination: TagPageProps['pagination'];
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

// Sort Options Component
function SortOptions({ currentSort, onSortChange }: {
  currentSort: string;
  onSortChange: (sort: string) => void;
}) {
  const sortOptions = [
    { value: 'newest', label: 'Naujausi' },
    { value: 'rating', label: 'Geriausiai įvertinti' },
    { value: 'time', label: 'Greičiausi' },
    { value: 'popular', label: 'Populiariausi' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700">Rūšiuoti:</span>
        <div className="flex gap-2">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onSortChange(option.value)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                currentSort === option.value
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TagPage({ tag, recipes, relatedTags, pagination }: TagPageProps) {
  const router = useRouter();
  const [sortBy, setSortBy] = useState('newest');

  const handlePageChange = (page: number) => {
    const query = { ...router.query, page: page.toString() };
    router.push({ pathname: router.asPath.split('?')[0], query }, undefined, { shallow: true });
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    const query = { ...router.query, sort };
    router.push({ pathname: router.asPath.split('?')[0], query }, undefined, { shallow: true });
  };

  // Generate breadcrumbs
  const breadcrumbs = [
    { title: "Pagrindinis", url: "/" },
    { title: "Paieška", url: "/paieska" },
    { title: `"${tag.name}"`, url: `/paieska/${tag.slug}`, current: true }
  ];

  return (
    <Layout>
      <Head>
        <title>{tag.seo.metaTitle}</title>
        <meta name="description" content={tag.seo.metaDescription} />
        <meta name="keywords" content={tag.seo.keywords.join(', ')} />
        <link rel="canonical" href={`https://domain.lt/paieska/${tag.slug}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={tag.seo.metaTitle} />
        <meta property="og:description" content={tag.seo.metaDescription} />
        <meta property="og:url" content={`https://domain.lt/paieska/${tag.slug}`} />
        <meta property="og:type" content="website" />
        
        {/* Search Results Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SearchResultsPage",
              "name": `${tag.name} receptai`,
              "description": tag.seo.metaDescription,
              "url": `https://domain.lt/paieska/${tag.slug}`,
              "mainEntity": {
                "@type": "ItemList",
                "numberOfItems": pagination.total,
                "itemListElement": recipes.slice(0, 10).map((recipe, index) => ({
                  "@type": "Recipe",
                  "position": index + 1,
                  "name": recipe.title.lt,
                  "url": `https://domain.lt/receptas/${recipe.slug}`
                }))
              }
            })
          }}
        />
      </Head>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            {breadcrumbs.map((item, index) => (
              <li key={index} className="inline-flex items-center">
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

        {/* Tag Header */}
        <TagHeader tag={tag} recipeCount={pagination.total} />

        {/* Related Tags */}
        <RelatedTags tags={relatedTags} currentTag={tag.name} />

        {/* Sort Options */}
        <SortOptions currentSort={sortBy} onSortChange={handleSortChange} />

        {/* Recipe Grid */}
        <RecipeGrid recipes={recipes} />

        {/* Pagination */}
        <Pagination pagination={pagination} onPageChange={handlePageChange} />
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params, query }) => {
  const tagSlug = params?.tag as string;
  
  if (!tagSlug) {
    return { notFound: true };
  }

  try {
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db();

    // Get tag
    const tag = await db.collection('tags_new').findOne({ slug: tagSlug });
    
    if (!tag) {
      await client.close();
      return { notFound: true };
    }

    // Build sort criteria
    const sort = query.sort as string || 'newest';
    let sortCriteria: any = { publishedAt: -1 }; // Default: newest
    
    switch (sort) {
      case 'rating':
        sortCriteria = { 'rating.average': -1, 'rating.count': -1 };
        break;
      case 'time':
        sortCriteria = { totalTimeMinutes: 1 };
        break;
      case 'popular':
        sortCriteria = { 'rating.count': -1, 'rating.average': -1 };
        break;
    }

    // Pagination
    const page = parseInt(query.page as string) || 1;
    const limit = 12;
    const skip = (page - 1) * limit;

    // Get recipes with this tag
    const [recipes, totalCount] = await Promise.all([
      db.collection('recipes_new')
        .find({ tags: tag.name })
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection('recipes_new').countDocuments({ tags: tag.name })
    ]);

    // Get related tags
    const relatedTags = await db.collection('tags_new')
      .find({ 
        name: { $in: tag.relatedTags },
        _id: { $ne: tag._id }
      })
      .sort({ recipeCount: -1 })
      .limit(8)
      .toArray();

    await client.close();

    return {
      props: {
        tag: JSON.parse(JSON.stringify(tag)),
        recipes: JSON.parse(JSON.stringify(recipes)),
        relatedTags: JSON.parse(JSON.stringify(relatedTags)),
        pagination: {
          current: page,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
          hasNext: page * limit < totalCount,
          hasPrev: page > 1
        }
      }
    };
  } catch (error) {
    console.error('Error fetching tag page:', error);
    return { notFound: true };
  }
};
