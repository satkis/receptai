// Dynamic Category Page
// /receptai/[category] - e.g., /receptai/mesa

import { useState } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { MongoClient } from 'mongodb';

import Breadcrumb from '../../../components/navigation/Breadcrumb';
import Layout from '../../../components/layout/Layout';

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

interface CategoryPageProps {
  categorySlug: string;
  categoryName: string;
  recipes: Recipe[];
  totalRecipes: number;
}

// Enhanced Recipe Card Component
function RecipeCard({ recipe, categorySlug }: { recipe: Recipe; categorySlug: string }) {
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
      href={`/receptas/${recipe.slug}?from=${encodeURIComponent(`receptai/${categorySlug}`)}`}
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 block group"
    >
      <div className="relative h-48">
        <img
          src={(recipe.image as any)?.src || recipe.image || '/placeholder-recipe.jpg'}
          alt={(recipe.image as any)?.alt || (typeof recipe.title === 'string' ? recipe.title : recipe.title?.lt || 'Receptas')}
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

export default function CategoryPage({ categorySlug, categoryName, recipes, totalRecipes }: CategoryPageProps) {
  // Generate breadcrumbs
  const breadcrumbs = [
    { label: 'Receptai', href: '/receptai' },
    { label: categoryName, isActive: true }
  ];

  return (
    <Layout>
      <Head>
        <title>{categoryName} receptai | Paragaujam.lt</title>
        <meta name="description" content={`Atraskite geriausius ${categoryName.toLowerCase()} receptus.`} />
        <meta name="keywords" content={`${categoryName}, receptai, lietuviški receptai, maistas`} />
        <link rel="canonical" href={`https://paragaujam.lt/receptai/${categorySlug}`} />
      </Head>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumb items={breadcrumbs} containerless={true} />

        {/* Category Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{categoryName}</h1>
          <p className="text-lg text-gray-600 mb-6">Receptai kategorijoje: {categoryName}</p>

          <div className="text-sm text-gray-600">
            Rasta {totalRecipes} receptų
          </div>
        </div>

        {/* Enhanced Recipe Grid */}
        {recipes.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe._id} recipe={recipe} categorySlug={categorySlug} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-gray-50 rounded-lg p-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Receptų nerasta</h2>
              <p className="text-gray-500">
                Šioje kategorijoje "{categoryName}" receptų dar nėra.
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const categorySlug = params?.category as string;

  if (!categorySlug) {
    return { notFound: true };
  }

  try {
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db();

    // Simple category name mapping for now
    const categoryNames: { [key: string]: string } = {
      'mesa': 'Mėsa',
      'vistiena': 'Vištiena',
      'jautiena': 'Jautiena',
      'kiauliena': 'Kiauliena',
      'zuvis': 'Žuvis',
      'darzoves': 'Daržovės',
      'salotos': 'Salotos',
      'sriubos': 'Sriubos',
      'desertai': 'Desertai',
      'gerimai': 'Gėrimai'
    };

    const categoryName = categoryNames[categorySlug] ||
      categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);

    // Build query to find recipes in this category
    const categoryPath = `receptai/${categorySlug}`;

    const recipeQuery = {
      $or: [
        { primaryCategoryPath: categoryPath },
        { primaryCategoryPath: { $regex: `^${categoryPath}/` } }, // Include subcategories
        { secondaryCategories: categoryPath },
        { secondaryCategories: { $regex: `^${categoryPath}/` } }
      ]
    };

    // Get recipes
    const recipes = await db.collection('recipes_new')
      .find(recipeQuery)
      .sort({ featured: -1, createdAt: -1 })
      .limit(16)
      .toArray();

    const totalRecipes = await db.collection('recipes_new').countDocuments(recipeQuery);

    await client.close();

    return {
      props: {
        categorySlug,
        categoryName,
        recipes: JSON.parse(JSON.stringify(recipes)),
        totalRecipes
      }
    };
  } catch (error) {
    console.error('Error fetching category recipes:', error);

    // Fallback to basic category info if database fails
    const categoryNames: { [key: string]: string } = {
      'mesa': 'Mėsa',
      'vistiena': 'Vištiena',
      'jautiena': 'Jautiena',
      'kiauliena': 'Kiauliena',
      'zuvis': 'Žuvis',
      'darzoves': 'Daržovės',
      'salotos': 'Salotos',
      'sriubos': 'Sriubos',
      'desertai': 'Desertai',
      'gerimai': 'Gėrimai'
    };

    const categoryName = categoryNames[categorySlug] ||
      categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);

    return {
      props: {
        categorySlug,
        categoryName,
        recipes: [],
        totalRecipes: 0
      }
    };
  }
};
