// New Recipe Page with Tag System
// URL: domain.lt/receptas/recipe-slug

import { useState } from 'react';
import { GetStaticProps, GetStaticPaths } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import clientPromise, { DATABASE_NAME } from '../../lib/mongodb';
import { useRouter } from 'next/router';
import { RecipePerformanceOptimizer } from '../../components/PerformanceOptimizer';

import Breadcrumb, { generateRecipeBreadcrumbs } from '../../components/navigation/Breadcrumb';
import StarRating from '../../components/StarRating';
import WikibooksDisclaimer from '../../components/recipe/WikibooksDisclaimer';
import { generateEnhancedRecipeSchema } from '../../utils/enhanced-recipe-schema';
import { getRecipeCanonicalUrl } from '../../utils/canonical-urls';

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
  timeCategory?: string;

  // Updated ingredient structure to match CurrentRecipe
  ingredients: Array<{
    name: { lt: string; en?: string };
    quantity: string;
    vital: boolean;
  }>;

  sideIngredients?: Array<{
    category: string;
    name: { lt: string; en?: string };
    quantity: string;
    vital: boolean;
  }>;

  instructions: Array<{
    step: number;
    name?: { lt: string; en?: string };
    text: { lt: string; en?: string };
    image?: string;
  }>;

  notes?: Array<{
    text: { lt: string; en?: string };
    priority: number;
  }>;

  // Updated SEO structure to match CurrentRecipe
  seo?: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    recipeCategory?: string;
    recipeCuisine?: string;
    aggregateRating?: {
      ratingValue: number;
      reviewCount: number;
      bestRating: number;
      worstRating: number;
    };
    nutrition?: {
      calories?: number;
      proteinContent?: string;
      fatContent?: string;
      fiberContent?: string;
    };
  };

  // Author & Publishing
  author: {
    userId?: string;
    name: string;
    profileUrl: string;
  };
  status: string;
  featured?: boolean;
  trending?: boolean;

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

  // Wikibooks Attribution & Compliance (CC BY-SA 4.0)
  originalSource?: {
    platform: 'Wikibooks';
    url: string;
    pageTitle: string;
    license: 'CC BY-SA 4.0';
    licenseUrl: string;
    originalCreator?: {
      name: string;
      userPageUrl: string;
    };
    contributorsUrl?: string;
    extractedAt?: string | Date;
  } | null;

  // Image Attribution for Wikibooks Images
  originalImage?: {
    author?: {
      name: string;
      userPageUrl: string;
    };
    license?: {
      code: string;
      shortName: string;
      fullName: string;
      url: string;
    };
    wikimediaCommonsUrl?: string;
  } | null;

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
  // Get image source safely
  const imageSrc = typeof recipe.image === 'string' ? recipe.image : recipe.image?.src;
  const hasValidImage = imageSrc && imageSrc.trim() !== '';

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 flex flex-col">
      {/* Image Section - Only show if valid image exists */}
      {hasValidImage ? (
        <div className="relative w-full h-64 md:h-80 flex-shrink-0 overflow-hidden">
          <Image
            src={imageSrc}
            alt={typeof recipe.image === 'string' ? recipe.title.lt : recipe.image.alt}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1000px"
            quality={85}
          />
        </div>
      ) : (
        <div className="relative w-full h-64 md:h-80 flex-shrink-0 overflow-hidden bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
          <div className="text-center text-orange-600">
            <svg className="w-24 h-24 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm font-medium">Nuotrauka neįkelta</p>
          </div>
        </div>
      )}

      {/* Content Section - Separate container */}
      <div className="p-6 bg-white flex-1">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {recipe.title.lt}
        </h1>

        <p className="text-gray-600 text-lg mb-6">
          {recipe.description.lt}
        </p>

        {/* Star Rating Section */}
        <div className="mb-6">
          <StarRating
            initialRating={0}
            size="lg"
            showRatingText={true}
            onRatingChange={(rating) => {
              console.log('User rated:', rating);
              // TODO: Save rating to database when backend is ready
            }}
          />
        </div>

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
function IngredientsSection({ recipe }: { recipe: Recipe }) {
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());

  const toggleIngredient = (id: string) => {
    const newChecked = new Set(checkedIngredients);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedIngredients(newChecked);
  };

  // Use the new flat structure
  const mainIngredients = recipe.ingredients || [];
  const sideIngredients = recipe.sideIngredients || [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-4">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Ingredientai</h2>

      {/* Main Ingredients */}
      <div className="space-y-4">
        {mainIngredients.map((ingredient, index) => {
          const id = `main-${index}`;
          return (
            <div
              key={id}
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => toggleIngredient(id)}
            >
              {/* Orange circle icon */}
              <div className="w-3 h-3 bg-orange-400 rounded-full flex-shrink-0"></div>

              {/* Ingredient text */}
              <div className="flex-1">
                <span className={`${
                  checkedIngredients.has(id)
                    ? 'line-through text-gray-400'
                    : 'text-gray-900'
                }`}>
                  {ingredient.name?.lt || 'Nenurodyta'}
                </span>
                {ingredient.vital && (
                  <span className="text-orange-500 ml-1">*</span>
                )}
              </div>

              {/* Quantity */}
              <div className={`text-orange-500 font-medium ${
                checkedIngredients.has(id) ? 'line-through text-gray-400' : ''
              }`}>
                {ingredient.quantity}
              </div>
            </div>
          );
        })}
      </div>

      {/* Side Ingredients - Grouped by Category */}
      {sideIngredients.length > 0 && (() => {
        // Group side ingredients by category
        const groupedSideIngredients = sideIngredients.reduce((groups, ingredient, index) => {
          const category = ingredient.category || 'Papildomi ingredientai';
          if (!groups[category]) {
            groups[category] = [];
          }
          groups[category].push({ ...ingredient, originalIndex: index });
          return groups;
        }, {} as Record<string, Array<any>>);

        return (
          <div className="mt-8 space-y-6">
            {Object.entries(groupedSideIngredients).map(([category, ingredients]) => (
              <div key={category}>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {category}
                </h3>
                <div className="space-y-4">
                  {ingredients.map((ingredient) => {
                    const id = `side-${ingredient.originalIndex}`;
                    return (
                      <div
                        key={id}
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => toggleIngredient(id)}
                      >
                        {/* Blue circle icon for side ingredients */}
                        <div className="w-3 h-3 bg-blue-400 rounded-full flex-shrink-0"></div>

                        {/* Ingredient text */}
                        <div className="flex-1">
                          <span className={`${
                            checkedIngredients.has(id)
                              ? 'line-through text-gray-400'
                              : 'text-gray-900'
                          }`}>
                            {ingredient.name?.lt || 'Nenurodyta'}
                          </span>
                          {ingredient.vital && (
                            <span className="text-blue-500 ml-1">*</span>
                          )}
                        </div>

                        {/* Quantity */}
                        <div className={`text-blue-500 font-medium ${
                          checkedIngredients.has(id) ? 'line-through text-gray-400' : ''
                        }`}>
                          {ingredient.quantity}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Footer note */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-500">
          <span className="text-orange-500">*</span> Pagrindiniai ingredientai
          {sideIngredients.length > 0 && (
            <>
              <br />
              <span className="text-blue-500">*</span> {sideIngredients[0]?.category || 'Papildomi ingredientai'}
            </>
          )}
        </p>
      </div>
    </div>
  );
}

// Patarimai Section Component
function PatarimiSection({ notes }: { notes: Recipe['notes'] | string[] }) {
  if (!notes || notes.length === 0) {
    return null; // Hide container if no notes
  }

  // Handle both string arrays and object arrays
  const processedNotes = notes.map((note, index) => {
    if (typeof note === 'string') {
      // Handle simple string notes
      return {
        text: { lt: note },
        priority: index + 1
      };
    }
    // Handle object notes with text.lt structure
    return note;
  });

  // Sort notes by priority
  const sortedNotes = [...processedNotes].sort((a, b) => a.priority - b.priority);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Patarimai</h2>
      <ul className="space-y-3">
        {sortedNotes.map((note, index) => (
          <li key={index} className="flex gap-3">
            <span className="flex-shrink-0 w-2 h-2 bg-orange-400 rounded-full mt-2"></span>
            <p className="text-gray-700 leading-relaxed">
              {note.text?.lt || 'Nenurodyta'}
            </p>
          </li>
        ))}
      </ul>
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
              {instruction.text?.lt || 'Nenurodyta'}
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

  // Debug logging
  console.log('Recipe data:', {
    slug: recipe?.slug,
    title: recipe?.title?.lt,
    image: recipe?.image,
    hasImage: !!recipe?.image?.src
  });

  // Validate recipe data to prevent build errors
  if (!recipe || !recipe.title || !recipe.title.lt) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Receptas nerastas</h1>
          <p className="text-gray-600">Atsiprašome, šis receptas neegzistuoja arba buvo pašalintas.</p>
        </div>
      </div>
    );
  }

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

  // Generate enhanced schema for better SEO
  const enhancedSchema = generateEnhancedRecipeSchema(recipe);

  return (
    <>
      {/* Performance optimization for single-visit users */}
      <RecipePerformanceOptimizer
        recipeImage={typeof recipe.image === 'string' ? recipe.image : recipe.image.src}
      />

      <Head>
        <title>{recipe.title.lt}</title>
        <meta name="description" content={recipe.seo?.metaDescription || recipe.description.lt} />
        <meta name="keywords" content={recipe.seo?.keywords?.join(', ') || recipe.tags?.join(', ') || ''} />

        {/* Canonical URL - Critical for SEO */}
        <link rel="canonical" href={getRecipeCanonicalUrl(recipe.slug)} />

        {/* Open Graph */}
        <meta property="og:title" content={recipe.title.lt} />
        <meta property="og:description" content={recipe.seo?.metaDescription || recipe.description.lt} />
        {(() => {
          const imageSrc = typeof recipe.image === 'string' ? recipe.image : recipe.image?.src;
          return imageSrc && imageSrc.trim() !== '' ? (
            <meta property="og:image" content={imageSrc} />
          ) : null;
        })()}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={getRecipeCanonicalUrl(recipe.slug)} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={recipe.title.lt} />
        <meta name="twitter:description" content={recipe.seo?.metaDescription || recipe.description.lt} />
        {(() => {
          const imageSrc = typeof recipe.image === 'string' ? recipe.image : recipe.image?.src;
          return imageSrc && imageSrc.trim() !== '' ? (
            <meta name="twitter:image" content={imageSrc} />
          ) : null;
        })()}
      </Head>

      {/* Enhanced Recipe Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(enhancedSchema)
        }}
      />

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
            <IngredientsSection recipe={recipe} />
          </div>

          {/* Right Column: Patarimai + Instructions */}
          <div className="lg:col-span-2 space-y-8">
            {/* Patarimai - Hidden on mobile, shown above instructions on desktop */}
            <div className="hidden lg:block">
              <PatarimiSection notes={recipe.notes} />
            </div>

            {/* Patarimai - Shown on mobile below ingredients */}
            <div className="lg:hidden">
              <PatarimiSection notes={recipe.notes} />
            </div>

            {/* Instructions */}
            <InstructionsSection instructions={recipe.instructions} />
          </div>
        </div>

        {/* Tags */}
        <TagList tags={recipe.tags} />

        {/* Wikibooks Disclaimer - Only shown for Wikibooks recipes */}
        <WikibooksDisclaimer
          originalSource={recipe.originalSource}
          originalImage={recipe.originalImage}
        />

        {/* Related Recipes section removed as requested */}
      </div>
    </>
  );
}

// ISR for Lithuanian users - pages cached at CDN edge
export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;

  if (!slug) {
    return { notFound: true };
  }

  try {
    // 🚀 Use shared MongoDB client for better performance
    const client = await clientPromise;
    const db = client.db(DATABASE_NAME);

    // Get recipe from recipes_new collection
    const recipe = await db.collection('recipes_new').findOne({ slug });

    if (!recipe) {
      return { notFound: true };
    }

    // Validate recipe has required fields
    if (!recipe.title || !recipe.title.lt || !recipe.description || !recipe.description.lt) {
      console.error(`Recipe ${slug} missing required fields:`, {
        hasTitle: !!recipe.title,
        hasTitleLt: !!recipe.title?.lt,
        hasDescription: !!recipe.description,
        hasDescriptionLt: !!recipe.description?.lt
      });
      return { notFound: true };
    }

    // ✅ Don't close shared client - it's managed by the connection pool

    return {
      props: {
        recipe: JSON.parse(JSON.stringify(recipe))
      },
      // ISR: Optimized for single-visit users - longer cache for better CDN performance
      revalidate: process.env.NODE_ENV === 'development' ? 1 : 86400 // 24 hours
    };
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return { notFound: true };
  }
};

// Generate static paths for popular recipes
export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const client = await clientPromise;
    const db = client.db(DATABASE_NAME);

    // Pre-generate ALL recipes for maximum speed (single-visit optimization)
    const popularRecipes = await db.collection('recipes_new')
      .find({
        // Get all published recipes
        status: { $ne: 'draft' },
        'title.lt': { $exists: true, $ne: null },
        'slug': { $exists: true, $ne: null }
      })
      .project({ slug: 1 })
      .limit(200) // Pre-generate more recipes for better coverage
      .toArray();

    const paths = popularRecipes
      .filter(recipe => recipe.slug && typeof recipe.slug === 'string')
      .map((recipe) => ({
        params: { slug: recipe.slug }
      }));

    return {
      paths,
      // Enable ISR for all other recipes
      fallback: 'blocking'
    };
  } catch (error) {
    console.error('Error generating static paths:', error);
    return {
      paths: [],
      fallback: 'blocking'
    };
  }
};
