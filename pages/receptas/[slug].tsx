// New Recipe Page with Tag System
// URL: domain.lt/receptas/recipe-slug

import { useState } from 'react';
import { GetServerSideProps } from 'next';
import { MongoClient } from 'mongodb';
import { useRouter } from 'next/router';
import PlaceholderImage from '../../components/ui/PlaceholderImage';
import SchemaOrgRecipe from '../../components/seo/SchemaOrgRecipe';
import Breadcrumb, { generateRecipeBreadcrumbs } from '../../components/navigation/Breadcrumb';

interface Recipe {
  _id: string;
  slug: string;
  canonicalUrl?: string;
  language: string;
  title: { lt: string; en?: string };
  description: { lt: string; en?: string };
  image: {
    src: string;
    alt: string;
    width: number;
    height: number;
    caption?: string;
    blurHash?: string;
  };
  servings: number;
  servingsUnit: string;
  difficulty?: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  totalTimeMinutes: number;
  ingredients: Array<{
    name: { lt: string; en?: string };
    quantity: string;
    vital: boolean;
    notes?: string;
  }>;
  instructions: Array<{
    step: number;
    text: { lt: string; en?: string };
    image?: string;
  }>;

  // SEO Metadata
  seo?: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };

  // Author & Publishing
  author: {
    userId?: string;
    name: string;
    profileUrl: string;
  };
  status: string;

  // Categorization
  primaryCategoryPath: string;
  secondaryCategories?: string[];
  breadcrumbs?: Array<{
    name: string;
    url: string;
  }>;

  // Engagement
  rating?: { average: number; count: number };
  engagement?: {
    views: number;
    saves: number;
    shares: number;
    commentsCount: number;
    avgTimeOnPage: number;
    bounceRate: number;
  };

  tags: string[];

  // Schema.org
  schemaOrg?: any;

  // Technical SEO
  sitemap?: {
    priority: number;
    changefreq: string;
    lastmod: Date;
  };

  createdAt: string;
  publishedAt: string;
  updatedAt: string;
}

interface RecipePageProps {
  recipe: Recipe;
}

// Local Breadcrumb component removed - using shared component instead

// Tag List Component - Updated for query-based search
function TagList({ tags }: { tags: string[] }) {
  const router = useRouter();

  const handleTagClick = (tag: string) => {
    // Navigate to search page with tag as query
    router.push(`/paieska?q=${encodeURIComponent(tag)}`);
  };

  return (
    <div className="mb-8">
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
          src={typeof recipe.image === 'string' ? recipe.image : recipe.image.src}
          alt={typeof recipe.image === 'string' ? recipe.title.lt : recipe.image.alt}
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
          {recipe.rating && recipe.rating.count > 0 && (
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
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const toggleStep = (stepNumber: number) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(stepNumber)) {
      newCompleted.delete(stepNumber);
    } else {
      newCompleted.add(stepNumber);
    }
    setCompletedSteps(newCompleted);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Gaminimo instrukcijos</h2>
      <ol className="space-y-4">
        {instructions.map((instruction) => (
          <li
            key={instruction.step}
            className="flex gap-4 cursor-pointer group"
            onClick={() => toggleStep(instruction.step)}
          >
            <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
              completedSteps.has(instruction.step)
                ? 'bg-green-500 text-white'
                : 'bg-orange-500 text-white group-hover:bg-orange-600'
            }`}>
              {completedSteps.has(instruction.step) ? '✓' : instruction.step}
            </span>
            <p className={`leading-relaxed pt-1 transition-all ${
              completedSteps.has(instruction.step)
                ? 'text-gray-400 line-through'
                : 'text-gray-700 group-hover:text-gray-900'
            }`}>
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
  const router = useRouter();

  // Detect navigation path from referrer or query params
  const getNavigationPath = (): string | undefined => {
    // Check if there's a 'from' query parameter
    if (router.query.from && typeof router.query.from === 'string') {
      return router.query.from;
    }

    // TODO: Could also check document.referrer for navigation path detection
    // For now, return undefined to use fallback logic
    return undefined;
  };

  // Generate breadcrumbs using new dynamic system
  const breadcrumbItems = generateRecipeBreadcrumbs(recipe, getNavigationPath());

  return (
    <>
      <SchemaOrgRecipe recipe={recipe} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Recipe Header */}
        <RecipeHeader recipe={recipe} />

        {/* Breadcrumbs */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-6">
          <Breadcrumb items={breadcrumbItems} containerless={true} />
        </div>

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

        {/* Tags */}
        <TagList tags={recipe.tags} />

        {/* Related Recipes section removed as requested */}
      </div>
    </>
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
