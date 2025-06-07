import Head from 'next/head';

interface Recipe {
  id?: string;
  slug: string;
  title: { lt: string; en: string } | string;
  description: { lt: string; en: string } | string;
  image: { url: string } | string;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  totalTimeMinutes: number;
  servings: { amount: number } | number;
  ingredients: Array<{
    name: { lt: string; en: string } | string;
    amount: number | string;
    unit: { lt: string; en: string } | string;
  }>;
  instructions?: Array<{
    step: number;
    text: { lt: string; en: string } | string;
  }>;
  nutrition?: {
    calories: string;
    protein?: string;
    fat?: string;
    carbohydrates?: string;
  };
  rating?: {
    average: number;
    count: number;
  };
  author?: {
    name: string;
  };
  keywords?: string[];
  createdAt?: string;
  categories?: string[];
  filters?: {
    cuisine?: string;
    mealType?: string;
    dietary?: string[];
  };
}

interface SchemaOrgRecipeProps {
  recipe: Recipe;
  language?: string;
  url?: string;
}

export default function SchemaOrgRecipe({ recipe, language = 'lt', url }: SchemaOrgRecipeProps) {
  // Helper functions to safely extract multilingual content
  const getTitle = () => {
    if (typeof recipe.title === 'string') return recipe.title;
    return recipe.title[language as keyof typeof recipe.title] || recipe.title.lt || 'Recipe';
  };

  const getDescription = () => {
    if (typeof recipe.description === 'string') return recipe.description;
    return recipe.description[language as keyof typeof recipe.description] || recipe.description.lt || '';
  };

  const getImageUrl = () => {
    if (typeof recipe.image === 'string') return recipe.image;
    return recipe.image?.url || '/images/placeholder-recipe.jpg';
  };

  const getServings = () => {
    if (typeof recipe.servings === 'number') return recipe.servings;
    return recipe.servings?.amount || 4;
  };

  const getIngredientText = (ingredient: any) => {
    const name = typeof ingredient.name === 'string'
      ? ingredient.name
      : ingredient.name?.[language] || ingredient.name?.lt || 'Ingredient';

    const unit = typeof ingredient.unit === 'string'
      ? ingredient.unit
      : ingredient.unit?.[language] || ingredient.unit?.lt || '';

    const amount = ingredient.amount || '';

    return `${amount} ${unit} ${name}`.trim();
  };

  const getInstructionText = (instruction: any) => {
    if (typeof instruction.text === 'string') return instruction.text;
    return instruction.text?.[language] || instruction.text?.lt || instruction;
  };

  // Build Schema.org structured data
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    "name": getTitle(),
    "description": getDescription(),
    "image": [getImageUrl()],
    "url": url || `https://receptai.lt/recipes/${recipe.slug}`,
    "author": {
      "@type": "Person",
      "name": recipe.author?.name || "Receptai.lt"
    },
    "datePublished": recipe.createdAt || new Date().toISOString(),
    "prepTime": recipe.prepTimeMinutes ? `PT${recipe.prepTimeMinutes}M` : undefined,
    "cookTime": recipe.cookTimeMinutes ? `PT${recipe.cookTimeMinutes}M` : undefined,
    "totalTime": `PT${recipe.totalTimeMinutes || 30}M`,
    "recipeCategory": recipe.filters?.mealType || "Main Course",
    "recipeCuisine": recipe.filters?.cuisine || "Lithuanian",
    "recipeYield": getServings().toString(),
    "nutrition": recipe.nutrition ? {
      "@type": "NutritionInformation",
      "calories": recipe.nutrition.calories,
      "proteinContent": recipe.nutrition.protein,
      "fatContent": recipe.nutrition.fat,
      "carbohydrateContent": recipe.nutrition.carbohydrates
    } : undefined,
    "recipeIngredient": recipe.ingredients?.map(getIngredientText) || [],
    "recipeInstructions": recipe.instructions?.map((instruction, index) => ({
      "@type": "HowToStep",
      "position": instruction.step || index + 1,
      "text": getInstructionText(instruction)
    })) || [],
    "aggregateRating": recipe.rating && recipe.rating.count > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": recipe.rating.average,
      "ratingCount": recipe.rating.count
    } : undefined,
    "keywords": recipe.keywords?.join(", ") || recipe.categories?.join(", ") || ""
  };

  // Remove undefined values
  const cleanSchemaData = JSON.parse(JSON.stringify(schemaData));

  // Generate SEO meta tags
  const title = getTitle();
  const description = getDescription();
  const imageUrl = getImageUrl();
  const canonicalUrl = url || `https://receptai.lt/recipes/${recipe.slug}`;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title} - Receptai.lt</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={recipe.keywords?.join(", ") || recipe.categories?.join(", ") || ""} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={`${title} - Receptai.lt`} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="article" />
      <meta property="og:site_name" content="Receptai.lt" />
      <meta property="og:locale" content={language === 'lt' ? 'lt_LT' : 'en_US'} />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${title} - Receptai.lt`} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {/* Recipe-specific Meta Tags */}
      <meta name="recipe:prep_time" content={recipe.prepTimeMinutes?.toString() || "0"} />
      <meta name="recipe:cook_time" content={recipe.cookTimeMinutes?.toString() || "0"} />
      <meta name="recipe:total_time" content={recipe.totalTimeMinutes?.toString() || "30"} />
      <meta name="recipe:serves" content={getServings().toString()} />
      <meta name="recipe:cuisine" content={recipe.filters?.cuisine || "Lithuanian"} />
      <meta name="recipe:category" content={recipe.filters?.mealType || "Main Course"} />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(cleanSchemaData, null, 2)
        }}
      />

      {/* Additional SEO Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content={recipe.author?.name || "Receptai.lt"} />
      <meta name="language" content={language} />

      {/* Hreflang for multilingual support */}
      <link rel="alternate" hrefLang="lt" href={`https://receptai.lt/recipes/${recipe.slug}`} />
      <link rel="alternate" hrefLang="en" href={`https://receptai.lt/en/recipes/${recipe.slug}`} />
      <link rel="alternate" hrefLang="x-default" href={`https://receptai.lt/recipes/${recipe.slug}`} />
    </Head>
  );
}
