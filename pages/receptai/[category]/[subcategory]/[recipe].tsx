// Dynamic Recipe Detail Page
// /receptai/[category]/[subcategory]/[recipe] - e.g., /receptai/jautiena/jautienos-troskiniai/jautienos-troskinys

import { useState } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';

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
  language: string;
}

export default function RecipePage({ recipe, language }: RecipePageProps) {
  const router = useRouter();
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());

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

  // Generate breadcrumbs
  const breadcrumbs = generateRecipeBreadcrumbs(recipe);

  return (
    <>
      <Head>
        <title>{recipe.seo.metaTitle}</title>
        <meta name="description" content={recipe.seo.metaDescription} />
        <meta name="keywords" content={recipe.seo.keywords.join(', ')} />
        <link rel="canonical" href={`${process.env.NEXT_PUBLIC_SITE_URL}${recipe.seo.canonicalUrl}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={recipe.seo.metaTitle} />
        <meta property="og:description" content={recipe.seo.metaDescription} />
        <meta property="og:image" content={`${process.env.NEXT_PUBLIC_SITE_URL}${recipe.image}`} />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_SITE_URL}${recipe.seo.canonicalUrl}`} />
        <meta property="og:type" content="article" />
        
        {/* Schema.org Recipe Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(recipe.schemaOrg)
          }}
        />
        
        {/* Breadcrumb Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(recipe.seo.breadcrumbSchema)
          }}
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-orange-50 to-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Breadcrumb Navigation */}
          <Breadcrumb items={breadcrumbs} />

          <div className="max-w-4xl mx-auto">
            {/* Recipe Header */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
              <div className="relative h-64 md:h-80">
                <Image
                  src={recipe.image}
                  alt={recipe.title.lt}
                  fill
                  className="object-cover"
                  priority
                />

                {/* Recipe Meta Overlays */}
                <div className="absolute bottom-4 left-4 flex gap-2">
                  <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                    <span>🕒</span>
                    <span className="text-sm font-medium">{recipe.totalTimeMinutes} min</span>
                  </div>
                  <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                    <span>👥</span>
                    <span className="text-sm font-medium">{recipe.servings} {recipe.servingsUnit}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                    <span>🔥</span>
                    <span className="text-sm font-medium">{recipe.nutrition.calories} kcal</span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{recipe.title.lt}</h1>
                <div className="text-gray-600 text-lg leading-relaxed mb-6">
                  <p>{recipe.description.lt}</p>
                </div>

                {/* Category Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                    {recipe.categories.main}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {recipe.categories.sub}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {recipe.categories.timeGroup}
                  </span>
                  {recipe.categories.dietary.map((diet, index) => (
                    <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                      {diet}
                    </span>
                  ))}
                </div>

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
                          {ingredient.name.lt}
                          {ingredient.vital && (
                            <span className="ml-2 text-orange-600 text-sm">*</span>
                          )}
                        </span>
                        <span className={`font-medium transition-all duration-200 ${
                          checkedIngredients.has(index)
                            ? 'text-gray-400 line-through'
                            : 'text-orange-600'
                        }`}>
                          {ingredient.quantity}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-gray-500 mt-4">
                    * Pagrindiniai ingridientai
                  </p>
                </div>
              </div>

              {/* Instructions */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Gaminimo instrukcijos
                  </h2>
                  <ol className="space-y-4">
                    {recipe.instructions.map((instruction, index) => (
                      <li key={index} className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                          {instruction.step}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-700 leading-relaxed">
                            {instruction.description.lt}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Nutrition Info */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-4">Maistinė vertė</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 bg-gray-50 rounded-lg px-3">
                      <span className="text-gray-700 font-medium">Kalorijos</span>
                      <span className="font-bold text-orange-600">{recipe.nutrition.calories} kcal</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Baltymai</span>
                      <span className="font-medium text-gray-900">{recipe.nutrition.protein}g</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Angliavandeniai</span>
                      <span className="font-medium text-gray-900">{recipe.nutrition.carbs}g</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Riebalai</span>
                      <span className="font-medium text-gray-900">{recipe.nutrition.fat}g</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}





export const getServerSideProps: GetServerSideProps = async ({ params, query }) => {
  const category = params?.category as string;
  const subcategory = params?.subcategory as string;
  const recipe = params?.recipe as string;
  const language = (query.language as string) || 'lt';

  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/recipes/${category}/${subcategory}/${recipe}?language=${language}`);
    
    if (!response.ok) {
      return { notFound: true };
    }

    const data = await response.json();

    if (!data.success) {
      return { notFound: true };
    }

    return {
      props: {
        recipe: data.data,
        language
      }
    };

  } catch (error) {
    console.error('Recipe page error:', error);
    return { notFound: true };
  }
};
