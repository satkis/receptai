// All Recipes Page
// /receptai - Shows all recipes from database

import { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import clientPromise, { DATABASE_NAME } from '../../lib/mongodb';

import Breadcrumb from '../../components/navigation/Breadcrumb';
import CategoryMenu from '../../components/navigation/CategoryMenu';
// Layout removed - already wrapped in _app.tsx

interface Recipe {
  _id: string;
  title: string | { lt: string; en?: string };
  slug: string;
  description: string | { lt: string; en?: string };
  image: string;
  totalTimeMinutes: number;
  servings: number;
  ingredients: Array<{
    name: string | { lt: string; en?: string };
    quantity: string;
    vital?: boolean;
  }>;
  primaryCategoryPath: string;
  secondaryCategories?: string[];
}

interface ReceptaiPageProps {
  recipes: Recipe[];
  totalRecipes: number;
  currentPage: number;
  totalPages: number;
}

// Enhanced Recipe Card Component
function RecipeCard({ recipe, priority = false }: { recipe: Recipe; priority?: boolean }) {
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
        <Image
          src={(recipe.image as any)?.src || recipe.image || '/placeholder-recipe.jpg'}
          alt={(recipe.image as any)?.alt || (typeof recipe.title === 'string' ? recipe.title : recipe.title?.lt || 'Receptas')}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 300px"
          quality={85}
          priority={priority}
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

export default function ReceptaiIndex({ recipes, totalRecipes, currentPage, totalPages }: ReceptaiPageProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Generate breadcrumbs
  const breadcrumbs = [
    { label: 'Receptai', isActive: true }
  ];

  const handleLoadMore = useCallback(() => {
    if (currentPage < totalPages) {
      setIsLoading(true);
      const query = { ...router.query, page: (currentPage + 1).toString() };
      router.push({ pathname: router.pathname, query }, undefined, { shallow: true });
    }
  }, [currentPage, totalPages, router]);

  return (
    <>
      <Head>
        <title>Visi receptai | Ragaujam.lt</title>
        <meta name="description" content={`Atraskite visus ${totalRecipes} receptus mūsų duomenų bazėje. Lietuviški receptai su detaliais aprašymais ir nuotraukomis.`} />
        <meta name="keywords" content="receptai, lietuviški receptai, maistas, gaminimas, virtuvė" />
        <link rel="canonical" href="https://ragaujam.lt/receptai" />
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
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Visi receptai</h1>
              <p className="text-lg text-gray-600 mb-6">
                Atraskite visus mūsų receptus - nuo greitų užkandžių iki iškilmingų patiekalų
              </p>

              <div className="text-sm text-gray-600">
                Rasta {totalRecipes} receptų
              </div>
            </div>

            {/* Enhanced Recipe Grid */}
            {recipes.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
                {recipes.map((recipe, index) => (
                  <RecipeCard key={recipe._id} recipe={recipe} priority={index < 3} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gray-50 rounded-lg p-8">
                  <h2 className="text-xl font-semibold text-gray-700 mb-2">Receptų nerasta</h2>
                  <p className="text-gray-500">
                    Duomenų bazėje receptų dar nėra.
                  </p>
                </div>
              </div>
            )}

            {/* Load More Button */}
            {currentPage < totalPages && (
              <div className="text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? 'Kraunama...' : 'Rodyti daugiau'}
                </button>
              </div>
            )}

            {/* Pagination Info */}
            {totalPages > 1 && (
              <div className="text-center mt-6 text-sm text-gray-600">
                Puslapis {currentPage} iš {totalPages}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ISR for all recipes page - 1 hour revalidation for daily additions
export const getStaticProps: GetStaticProps = async () => {
  try {
    // 🚀 Use shared MongoDB client for better performance
    const client = await clientPromise;
    const db = client.db(DATABASE_NAME);

    // For ISR: Show first page only (pagination will be client-side)
    const page = 1;
    const limit = 16;
    const skip = (page - 1) * limit;

    // Get all published recipes
    const recipeQuery = {
      status: { $ne: 'draft' } // Exclude drafts if you have status field
    };

    const [recipes, totalRecipes] = await Promise.all([
      db.collection('recipes_new')
        .find(recipeQuery)
        .project({
          slug: 1,
          title: 1,
          description: 1,
          image: 1,
          totalTimeMinutes: 1,
          servings: 1,
          ingredients: 1,
          primaryCategoryPath: 1,
          secondaryCategories: 1
        })
        .sort({ featured: -1, createdAt: -1 }) // Featured first, then newest
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection('recipes_new').countDocuments(recipeQuery)
    ]);

    // ✅ Don't close shared client - it's managed by the connection pool

    return {
      props: {
        recipes: JSON.parse(JSON.stringify(recipes)),
        totalRecipes,
        currentPage: page,
        totalPages: Math.ceil(totalRecipes / limit)
      },
      // ISR: TESTING MODE - Instant revalidation (change back to 3600 for production)
      revalidate: process.env.NODE_ENV === 'development' ? 1 : 3600
    };
  } catch (error) {
    console.error('Error fetching all recipes:', error);

    // Fallback to empty state
    return {
      props: {
        recipes: [],
        totalRecipes: 0,
        currentPage: 1,
        totalPages: 0
      },
      revalidate: 3600
    };
  }
};
