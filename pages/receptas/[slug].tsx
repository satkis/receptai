// New Recipe Page with Tag System
// URL: domain.lt/receptas/recipe-slug

import { useState } from 'react';
import { GetServerSideProps } from 'next';
import { MongoClient, ObjectId } from 'mongodb';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Layout from '../../components/layout/Layout';
import PlaceholderImage from '../../components/ui/PlaceholderImage';
import RecipeSEO from '../../components/seo/RecipeSEO';

interface Recipe {
  _id: string;
  slug: string;
  title: { lt: string; en?: string };
  description: { lt: string; en?: string };
  image: string;
  servings: number;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  totalTimeMinutes: number;
  ingredients: Array<{
    name: { lt: string; en?: string };
    quantity: string;
    vital: boolean;
  }>;
  instructions: Array<{
    step: number;
    text: { lt: string; en?: string };
  }>;
  categoryPath: string;
  breadcrumbs: Array<{
    title: string;
    slug: string;
    url: string;
  }>;
  tags: string[];
  rating: { average: number; count: number };
  difficulty: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  createdAt: string;
  publishedAt: string;
}

interface RecipePageProps {
  recipe: Recipe;
}

// Breadcrumb Component
function Breadcrumb({ items }: { items: Array<{ title: string; url: string; current?: boolean }> }) {
  return (
    <nav className="flex mb-4" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {items.map((item, index) => (
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
  );
}

// Helper function to convert Lithuanian characters to standard letters
function lithuanianToSlug(text: string): string {
  const lithuanianMap: Record<string, string> = {
    'ą': 'a', 'Ą': 'A',
    'č': 'c', 'Č': 'C',
    'ę': 'e', 'Ę': 'E',
    'ė': 'e', 'Ė': 'E',
    'į': 'i', 'Į': 'I',
    'š': 's', 'Š': 'S',
    'ų': 'u', 'Ų': 'U',
    'ū': 'u', 'Ū': 'U',
    'ž': 'z', 'Ž': 'Z'
  };

  return text
    .split('')
    .map(char => lithuanianMap[char] || char)
    .join('')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Tag List Component - Updated for query-based search
function TagList({ tags }: { tags: string[] }) {
  const router = useRouter();

  const handleTagClick = (tag: string) => {
    // Navigate to search page with tag as query
    router.push(`/paieska?q=${encodeURIComponent(tag)}`);
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-3 text-gray-900">
        Susiję žymenys
      </h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <button
            key={index}
            onClick={() => handleTagClick(tag)}
            className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors border border-orange-200 bg-orange-50 text-orange-800 hover:bg-orange-100 cursor-pointer"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}

// Recipe Header Component - Fixed layout to prevent content hiding
function RecipeHeader({ recipe }: { recipe: Recipe }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 flex flex-col">
      {/* Image Section - Fixed height container */}
      <div className="relative w-full h-64 md:h-80 flex-shrink-0 overflow-hidden">
        <PlaceholderImage
          src={recipe.image}
          alt={recipe.title.lt}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
          quality={85}
        />
      </div>

      {/* Content Section - Separate container */}
      <div className="p-6 bg-white flex-1">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {recipe.title.lt}
        </h1>

        <p className="text-gray-600 text-lg mb-6">
          {recipe.description.lt}
        </p>

        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <span>🕒</span>
            <span>{recipe.totalTimeMinutes} min</span>
          </div>
          <div className="flex items-center gap-1">
            <span>👥</span>
            <span>{recipe.servings} porcijos</span>
          </div>
          <div className="flex items-center gap-1">
            <span>📊</span>
            <span className="capitalize">{recipe.difficulty}</span>
          </div>
          {recipe.rating.count > 0 && (
            <div className="flex items-center gap-1">
              <span>⭐</span>
              <span>{recipe.rating.average.toFixed(1)} ({recipe.rating.count})</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Ingredients Section
function IngredientsSection({ ingredients }: { ingredients: Recipe['ingredients'] }) {
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());

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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-4">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Ingredientai</h2>

      <div className="space-y-4">
        {ingredients.map((ingredient, index) => (
          <div
            key={index}
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => toggleIngredient(index)}
          >
            {/* Orange circle icon */}
            <div className="w-3 h-3 bg-orange-400 rounded-full flex-shrink-0"></div>

            {/* Ingredient text */}
            <div className="flex-1">
              <span className={`${
                checkedIngredients.has(index)
                  ? 'line-through text-gray-400'
                  : 'text-gray-900'
              }`}>
                {ingredient.name.lt}
              </span>
              {ingredient.vital && (
                <span className="text-orange-500 ml-1">*</span>
              )}
            </div>

            {/* Quantity */}
            <div className={`text-orange-500 font-medium ${
              checkedIngredients.has(index) ? 'line-through text-gray-400' : ''
            }`}>
              {ingredient.quantity}
            </div>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-500">* Pagrindiniai ingredientai</p>
      </div>
    </div>
  );
}

// Instructions Section
function InstructionsSection({ instructions }: { instructions: Recipe['instructions'] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Gaminimo instrukcijos</h2>
      <ol className="space-y-4">
        {instructions.map((instruction) => (
          <li key={instruction.step} className="flex gap-4">
            <span className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
              {instruction.step}
            </span>
            <p className="text-gray-700 leading-relaxed pt-1">
              {instruction.text.lt}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}

// Related Recipes Component - REMOVED as requested

export default function RecipePage({ recipe }: RecipePageProps) {
  // Generate breadcrumbs (updated for new URL structure)
  const breadcrumbs = [
    ...recipe.breadcrumbs.map(crumb => ({
      ...crumb,
      url: crumb.url.replace('/receptu-tipai/', '/').replace('/receptai', '/')
    })),
    { title: recipe.title.lt, url: `/receptas/${recipe.slug}`, current: true }
  ];

  return (
    <Layout>
      <RecipeSEO recipe={recipe} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-6">
          <Breadcrumb items={breadcrumbs} />
        </div>

        {/* Recipe Header */}
        <RecipeHeader recipe={recipe} />

        {/* Tags */}
        <TagList tags={recipe.tags} />

        {/* Recipe Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Ingredients */}
          <div className="lg:col-span-1">
            <IngredientsSection ingredients={recipe.ingredients} />
          </div>

          {/* Instructions */}
          <div className="lg:col-span-2">
            <InstructionsSection instructions={recipe.instructions} />
          </div>
        </div>

        {/* Related Recipes section removed as requested */}
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const slug = params?.slug as string;
  
  if (!slug) {
    return { notFound: true };
  }

  try {
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db();

    // Get recipe
    const recipe = await db.collection('recipes_new').findOne({ slug });
    
    if (!recipe) {
      await client.close();
      return { notFound: true };
    }

    await client.close();

    return {
      props: {
        recipe: JSON.parse(JSON.stringify(recipe))
      }
    };
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return { notFound: true };
  }
};
