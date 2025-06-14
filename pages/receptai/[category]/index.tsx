// Dynamic Category Page
// /receptai/[category] - e.g., /receptai/mesa

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
                    href={`/receptas/${recipe.slug}?from=${encodeURIComponent(`receptai/${categorySlug}`)}`}
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
