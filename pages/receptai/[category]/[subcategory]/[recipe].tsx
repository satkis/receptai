// Dynamic Recipe Detail Page
// /receptai/[category]/[subcategory]/[recipe] - e.g., /receptai/jautiena/jautienos-troskiniai/jautienos-troskinys

import { useState } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { MongoClient } from 'mongodb';
import Breadcrumb, { generateRecipeBreadcrumbs } from '../../../../components/Breadcrumb';



interface Recipe {
  _id: string;
  slug: string;
  title: { lt: string; en?: string };
  description: { lt: string; en?: string };
  image: string;
  language: string;
  translations: string[];
  
  servings: number;
  servingsUnit: string;
  
  ingredients: Array<{
    name: { lt: string; en?: string };
    quantity: string;
    vital: boolean;
  }>;
  
  instructions: Array<{
    step: number;
    description: { lt: string; en?: string };
  }>;
  
  nutrition: {
    calories: number;
    fat: number;
    protein: number;
    carbs: number;
  };
  
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  totalTimeMinutes: number;
  
  rating: {
    average: number;
    count: number;
  };
  commentsCount: number;
  
  author: {
    userId: string | null;
    name: string;
    profileUrl: string;
  };
  
  categories: {
    main: string;
    sub: string;
    cuisine: string;
    timeGroup: string;
    dietary: string[];
    dishType: string;
  };
  
  breadcrumb: {
    main: { label: string; slug: string };
    sub: { label: string; slug: string };
  };
  
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    canonicalUrl: string;
    breadcrumbSchema: any;
  };
  
  schemaOrg: any;
}

interface RecipePageProps {
  recipe: Recipe;
}

export default function RecipePage({ recipe }: RecipePageProps) {
  console.log('RecipePage rendering with recipe:', recipe?.title?.lt || 'NO TITLE');
  console.log('Recipe image path:', recipe?.image);

  // State for interactive ingredient checking
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());

  // Error boundary - if no recipe data, show error
  if (!recipe) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-orange-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Receptas nerastas</h1>
          <p className="text-gray-600">Atsiprašome, bet šis receptas neegzistuoja arba buvo pašalintas.</p>
        </div>
      </div>
    );
  }

  // Toggle ingredient checked state
  const toggleIngredient = (index: number) => {
    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedIngredients(newChecked);
  };

  return (
    <>
      <Head>
        <title>{recipe.seo?.metaTitle || recipe.title?.lt || 'Receptas'}</title>
        <meta name="description" content={recipe.seo?.metaDescription || recipe.description?.lt || 'Receptas'} />
        {recipe.seo?.keywords && (
          <meta name="keywords" content={recipe.seo.keywords.join(', ')} />
        )}
        {recipe.seo?.canonicalUrl && (
          <link rel="canonical" href={`${process.env.NEXT_PUBLIC_SITE_URL}${recipe.seo.canonicalUrl}`} />
        )}

        {/* Open Graph */}
        <meta property="og:title" content={recipe.seo?.metaTitle || recipe.title?.lt || 'Receptas'} />
        <meta property="og:description" content={recipe.seo?.metaDescription || recipe.description?.lt || 'Receptas'} />
        <meta property="og:image" content={`${process.env.NEXT_PUBLIC_SITE_URL}${recipe.image || '/hero-image.jpg'}`} />
        {recipe.seo?.canonicalUrl && (
          <meta property="og:url" content={`${process.env.NEXT_PUBLIC_SITE_URL}${recipe.seo.canonicalUrl}`} />
        )}
        <meta property="og:type" content="article" />

        {/* Schema.org Recipe Data */}
        {recipe.schemaOrg && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(recipe.schemaOrg)
            }}
          />
        )}

        {/* Breadcrumb Schema */}
        {recipe.seo?.breadcrumbSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(recipe.seo.breadcrumbSchema)
            }}
          />
        )}
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-orange-50 to-gray-100">
        {/* Breadcrumb Navigation */}
        <Breadcrumb items={generateRecipeBreadcrumbs(recipe)} />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Recipe Header */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
              <div className="relative h-64 md:h-80">
                <Image
                  src={recipe.image || '/hero-image.jpg'}
                  alt={recipe.title?.lt || 'Receptas'}
                  fill
                  className="object-cover transition-opacity duration-300"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                  quality={85}
                  onError={(e) => {
                    // Fallback to hero image if recipe image fails
                    const target = e.target as HTMLImageElement;
                    target.src = '/hero-image.jpg';
                  }}
                />

                {/* Recipe Meta Overlays */}
                <div className="absolute bottom-4 left-4 flex gap-2">
                  {recipe.totalTimeMinutes && (
                    <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                      <span>🕒</span>
                      <span className="text-sm font-medium">{recipe.totalTimeMinutes} min</span>
                    </div>
                  )}
                  {recipe.servings && (
                    <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                      <span>👥</span>
                      <span className="text-sm font-medium">{recipe.servings} {recipe.servingsUnit || 'porcijos'}</span>
                    </div>
                  )}
                  {recipe.nutrition?.calories && (
                    <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                      <span>🔥</span>
                      <span className="text-sm font-medium">{recipe.nutrition.calories} kcal</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {recipe.title?.lt || 'Receptas'}
                </h1>
                <div className="text-gray-600 text-lg leading-relaxed mb-6">
                  <p>{recipe.description?.lt || 'Receptas aprašymas'}</p>
                </div>

                {/* Category Tags */}
                {recipe.categories && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {recipe.categories.main && (
                      <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                        {recipe.categories.main}
                      </span>
                    )}
                    {recipe.categories.sub && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {recipe.categories.sub}
                      </span>
                    )}
                    {recipe.categories.timeGroup && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {recipe.categories.timeGroup}
                      </span>
                    )}
                    {recipe.categories.dietary?.map((diet, index) => (
                      <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                        {diet}
                      </span>
                    ))}
                  </div>
                )}

                {/* Rating */}
                {recipe.rating && recipe.rating.count > 0 && (
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-lg ${i < Math.round(recipe.rating.average) ? 'text-yellow-400' : 'text-gray-300'}`}>
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-gray-600">
                      {recipe.rating.average}/5 ({recipe.rating.count} įvertinimai)
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Ingredients */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Ingridientai
                  </h2>
                  {recipe.ingredients && recipe.ingredients.length > 0 ? (
                    <>
                      <ul className="space-y-3">
                        {recipe.ingredients.map((ingredient, index) => (
                          <li key={index} className="flex items-center gap-3 cursor-pointer py-2" onClick={() => toggleIngredient(index)}>
                            <span className={`text-xl transition-all duration-200 ${
                              checkedIngredients.has(index) ? 'grayscale opacity-50' : ''
                            }`}>
                              🥔
                            </span>
                            <span className={`flex-1 transition-all duration-200 ${
                              checkedIngredients.has(index)
                                ? 'text-gray-500 line-through'
                                : 'text-gray-900'
                            }`}>
                              {ingredient.name?.lt || 'Ingridientas'}
                              {ingredient.vital && (
                                <span className="ml-2 text-orange-600 text-sm">*</span>
                              )}
                            </span>
                            <span className={`font-medium transition-all duration-200 ${
                              checkedIngredients.has(index)
                                ? 'text-gray-400 line-through'
                                : 'text-orange-600'
                            }`}>
                              {ingredient.quantity || 'Kiekis'}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs text-gray-500 mt-4">
                        * Pagrindiniai ingridientai
                      </p>
                    </>
                  ) : (
                    <p className="text-gray-500">Ingridientų sąrašas nepateiktas</p>
                  )}
                </div>
              </div>

              {/* Instructions */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Gaminimo instrukcijos
                  </h2>
                  {recipe.instructions && recipe.instructions.length > 0 ? (
                    <ol className="space-y-4">
                      {recipe.instructions.map((instruction, index) => (
                        <li key={index} className="flex gap-4">
                          <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                            {instruction.step || index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-700 leading-relaxed">
                              {instruction.description?.lt || 'Instrukcija'}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-gray-500">Gaminimo instrukcijos nepateiktos</p>
                  )}
                </div>

                {/* Nutrition Info */}
                {recipe.nutrition && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-4">Maistinė vertė</h3>
                    <div className="space-y-3">
                      {recipe.nutrition.calories && (
                        <div className="flex justify-between items-center py-2 bg-gray-50 rounded-lg px-3">
                          <span className="text-gray-700 font-medium">Kalorijos</span>
                          <span className="font-bold text-orange-600">{recipe.nutrition.calories} kcal</span>
                        </div>
                      )}
                      {recipe.nutrition.protein && (
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-600">Baltymai</span>
                          <span className="font-medium text-gray-900">{recipe.nutrition.protein}g</span>
                        </div>
                      )}
                      {recipe.nutrition.carbs && (
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-600">Angliavandeniai</span>
                          <span className="font-medium text-gray-900">{recipe.nutrition.carbs}g</span>
                        </div>
                      )}
                      {recipe.nutrition.fat && (
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-600">Riebalai</span>
                          <span className="font-medium text-gray-900">{recipe.nutrition.fat}g</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}





export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const category = params?.category as string;
  const subcategory = params?.subcategory as string;
  const recipe = params?.recipe as string;

  const client = new MongoClient(process.env.MONGODB_URI!);

  try {
    console.log('Recipe page called with:', { category, subcategory, recipe });

    await client.connect();
    const db = client.db('receptai');
    const recipesCollection = db.collection('recipes');

    const query = {
      slug: recipe,
      categoryPath: `${category}/${subcategory}`
    };

    console.log('MongoDB query:', query);

    // Find the recipe by slug and category path
    const recipeData = await recipesCollection.findOne(query);

    console.log('Recipe found:', recipeData ? 'YES' : 'NO');

    if (!recipeData) {
      console.log('Recipe not found with categoryPath, trying fallback...');

      // Try fallback: find by slug only
      const fallbackRecipe = await recipesCollection.findOne({ slug: recipe });

      console.log('Fallback recipe found:', fallbackRecipe ? 'YES' : 'NO');
      if (fallbackRecipe) {
        console.log('Fallback recipe categoryPath:', fallbackRecipe.categoryPath);
      }

      if (!fallbackRecipe) {
        console.log('No recipe found with slug:', recipe);
        return { notFound: true };
      }

      // If found by slug but wrong category path, redirect to correct URL
      if (fallbackRecipe.categoryPath && fallbackRecipe.categoryPath !== `${category}/${subcategory}`) {
        return {
          redirect: {
            destination: `/receptai/${fallbackRecipe.categoryPath}/${fallbackRecipe.slug}`,
            permanent: false,
          },
        };
      }

      // Use fallback recipe if no category path mismatch
      return {
        props: {
          recipe: JSON.parse(JSON.stringify(fallbackRecipe))
        }
      };
    }

    // Verify category and subcategory match
    const expectedCategoryPath = `${category}/${subcategory}`;
    if (recipeData.categoryPath !== expectedCategoryPath) {
      return { notFound: true };
    }

    // Return the recipe data
    return {
      props: {
        recipe: JSON.parse(JSON.stringify(recipeData))
      }
    };

  } catch (error) {
    console.error('Recipe page error:', error);
    return { notFound: true };
  } finally {
    await client.close();
  }
};
