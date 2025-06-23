import Head from 'next/head';

interface Recipe {
  slug: string;
  title: { lt: string };
  description: { lt: string };
  image: string;
  totalTimeMinutes: number;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  servings: number;
  ingredients: Array<{
    name: { lt: string };
    quantity: string;
    vital: boolean;
  }>;
  instructions: Array<{
    step: number;
    text: { lt: string };
  }>;
  tags: string[];
  rating: {
    average: number;
    count: number;
  };
  difficulty: string;
  nutrition?: {
    calories: number;
    fat: number;
    protein: number;
    carbs: number;
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  publishedAt?: string;
}

interface RecipeSEOProps {
  recipe: Recipe;
}

export default function RecipeSEO({ recipe }: RecipeSEOProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ragaujam.lt';
  const recipeUrl = `${baseUrl}/receptas/${recipe.slug}`;
  const imageUrl = `${baseUrl}${recipe.image}`;

  // Generate fallback SEO data if missing
  const seoTitle = recipe.seo?.metaTitle || `${recipe.title.lt} - Ragaujam.lt`;
  const seoDescription = recipe.seo?.metaDescription || recipe.description.lt;
  const seoKeywords = recipe.seo?.keywords || recipe.tags;

  // Generate recipe structured data
  const recipeStructuredData = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    "name": recipe.title.lt,
    "description": recipe.description.lt,
    "image": [imageUrl],
    "author": {
      "@type": "Organization",
      "name": "Ragaujam.lt"
    },
    "datePublished": recipe.publishedAt || new Date().toISOString(),
    "prepTime": recipe.prepTimeMinutes ? `PT${recipe.prepTimeMinutes}M` : undefined,
    "cookTime": recipe.cookTimeMinutes ? `PT${recipe.cookTimeMinutes}M` : undefined,
    "totalTime": `PT${recipe.totalTimeMinutes}M`,
    "recipeYield": recipe.servings.toString(),
    "recipeCategory": "Lithuanian Recipe",
    "recipeCuisine": "Lithuanian",
    "keywords": recipe.tags.join(", "),
    "recipeIngredient": recipe.ingredients.map(ing => `${ing.quantity} ${ing.name.lt}`),
    "recipeInstructions": recipe.instructions.map(inst => ({
      "@type": "HowToStep",
      "text": inst.text.lt,
      "name": `Žingsnis ${inst.step}`,
      "url": `${recipeUrl}#step-${inst.step}`
    })),
    "aggregateRating": recipe.rating.count > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": recipe.rating.average,
      "reviewCount": recipe.rating.count,
      "bestRating": 5,
      "worstRating": 1
    } : undefined,
    "nutrition": recipe.nutrition ? {
      "@type": "NutritionInformation",
      "calories": `${recipe.nutrition.calories} calories`,
      "fatContent": `${recipe.nutrition.fat}g`,
      "proteinContent": `${recipe.nutrition.protein}g`,
      "carbohydrateContent": `${recipe.nutrition.carbs}g`
    } : undefined,
    "video": undefined, // Can be added later if video recipes are implemented
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": recipeUrl
    }
  };

  // Generate breadcrumb structured data
  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Pagrindinis",
        "item": baseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Receptai",
        "item": `${baseUrl}/receptai`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": recipe.title.lt,
        "item": recipeUrl
      }
    ]
  };

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords.join(', ')} />
      <link rel="canonical" href={recipeUrl} />
      <meta name="robots" content="index, follow" />

      {/* Open Graph */}
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={recipeUrl} />
      <meta property="og:type" content="article" />
      <meta property="og:site_name" content="Ragaujam.lt" />
      <meta property="og:locale" content="lt_LT" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={imageUrl} />

      {/* Recipe-specific meta tags */}
      {recipe.prepTimeMinutes && <meta name="recipe:prep_time" content={`${recipe.prepTimeMinutes}`} />}
      {recipe.cookTimeMinutes && <meta name="recipe:cook_time" content={`${recipe.cookTimeMinutes}`} />}
      <meta name="recipe:total_time" content={`${recipe.totalTimeMinutes}`} />
      <meta name="recipe:serves" content={`${recipe.servings}`} />
      <meta name="recipe:difficulty" content={recipe.difficulty} />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(recipeStructuredData)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData)
        }}
      />

      {/* Additional SEO optimizations */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="bingbot" content="index, follow" />
      
      {/* Performance hints */}
      <link rel="preload" href={imageUrl} as="image" />
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      
      {/* Language and region */}
      <meta httpEquiv="content-language" content="lt" />
      <meta name="geo.region" content="LT" />
      <meta name="geo.country" content="Lithuania" />
    </Head>
  );
}
