// All Recipes Page
// /receptai - Shows all recipes from database

import { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { MongoClient } from 'mongodb';

import Breadcrumb from '../../components/navigation/Breadcrumb';
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
        <title>Visi receptai | Paragaujam.lt</title>
        <meta name="description" content={`Atraskite visus ${totalRecipes} receptus mūsų duomenų bazėje. Lietuviški receptai su detaliais aprašymais ir nuotraukomis.`} />
        <meta name="keywords" content="receptai, lietuviški receptai, maistas, gaminimas, virtuvė" />
        <link rel="canonical" href="https://paragaujam.lt/receptai" />
      </Head>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumb items={breadcrumbs} containerless={true} />

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

        {/* Recipe Grid */}
        {recipes.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {recipes.map((recipe) => (
              <div key={recipe._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {recipe.image && (
                  <div className="aspect-video bg-gray-200">
                    <img
                      src={recipe.image}
                      alt={typeof recipe.title === 'string' ? recipe.title : recipe.title?.lt || 'Receptas'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">
                    {typeof recipe.title === 'string' ? recipe.title : recipe.title?.lt || 'Receptas'}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {typeof recipe.description === 'string' ? recipe.description : recipe.description?.lt || ''}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span className="flex items-center">
                      ⏱️ {recipe.totalTimeMinutes} min
                    </span>
                    <span className="flex items-center">
                      👥 {recipe.servings} porcijos
                    </span>
                  </div>
                  <a
                    href={`/receptas/${recipe.slug}`}
                    className="block w-full text-center bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors"
                  >
                    Žiūrėti receptą
                  </a>
                </div>
              </div>
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
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  try {
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db();

    // Pagination
    const page = parseInt(query.page as string) || 1;
    const limit = 16;
    const skip = (page - 1) * limit;

    // Get all published recipes
    const recipeQuery = {
      status: { $ne: 'draft' } // Exclude drafts if you have status field
    };

    const [recipes, totalRecipes] = await Promise.all([
      db.collection('recipes_new')
        .find(recipeQuery)
        .sort({ featured: -1, createdAt: -1 }) // Featured first, then newest
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection('recipes_new').countDocuments(recipeQuery)
    ]);

    await client.close();

    return {
      props: {
        recipes: JSON.parse(JSON.stringify(recipes)),
        totalRecipes,
        currentPage: page,
        totalPages: Math.ceil(totalRecipes / limit)
      }
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
      }
    };
  }
};
